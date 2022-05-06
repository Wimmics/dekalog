package fr.inria.kgindex.main.rules;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.EarlReport;
import fr.inria.kgindex.main.util.DatasetUtils;
import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.Utils;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.datatypes.xsd.XSDDuration;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.Lang;
import org.apache.jena.sparql.exec.http.QueryExecutionHTTP;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDFS;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static fr.inria.kgindex.main.util.Utils.dateFormatter;

public class QueryTestExecution extends TestExecution {

    private static final Logger logger = LogManager.getLogger(QueryTestExecution.class);

    public QueryTestExecution(Tests tests, String url) {
        super(tests, url);
    }

    public Dataset execute(DescribedDataset describedDataset) {
        return executeTestQueryTest(describedDataset);
    }

    private Dataset executeTestQueryTest(DescribedDataset describedDataset) {
        Dataset result = DatasetFactory.create();

        for(Model testModel : this.getTests().getTests()) {
            Date startDate = new Date();
            Literal startDateLiteral =  result.getDefaultModel().createLiteral(dateFormatter.format(startDate));

            List<Statement> queryStatementList = testModel.listStatements((Resource)null, KGIndex.query, (RDFNode)null).toList();
            Literal queryResource = queryStatementList.get(0).getObject().asLiteral();
            Resource testResource = queryStatementList.get(0).getSubject();
            String testTitleTmp = "";
            if(testModel.contains(testResource, DCTerms.title)) {
                testTitleTmp = testModel.listObjectsOfProperty(testResource, DCTerms.title).toList().get(0).asLiteral().getString();
            }
            if(testModel.contains(testResource, RDFS.label)) {
                testTitleTmp = testModel.listObjectsOfProperty(testResource, RDFS.label).toList().get(0).asLiteral().getString();
            }
            long testTimeout = Utils.queryTimeout;
            if(testModel.contains(testResource, KGIndex.timeout)) {
                List<RDFNode> actionTimeoutList = testModel.listObjectsOfProperty(testResource.asResource(), KGIndex.timeout).toList();
                if(actionTimeoutList.size() == 1) {
                    Literal actionTimeoutLiteral = actionTimeoutList.get(0).asLiteral();
                    testTimeout = ((XSDDuration) XSDDatatype.XSDduration.parse(actionTimeoutLiteral.getString())).getFullSeconds() * 1000L;
                }
            }

            String queryStringRaw = queryResource.getString();

            // Remplacement des placeholders dans la requete devrait être ici
            Set<String> queryStringVariant = Utils.rewriteQueryPlaceholders(queryStringRaw, describedDataset);

            for(String queryString : queryStringVariant) {
                boolean passed = true;
                String errorMessage = "";
                String encodedQueryString = URLEncoder.encode(queryString, StandardCharsets.UTF_8);
                // Execution de la requête
                try {
                    QueryExecutionHTTP testQueryExecution = QueryExecutionHTTP.service(this.getEndpointUrl())
                            .useGet()
                            .param("timeout", String.valueOf(testTimeout))
                            //.param("format", Lang.RDFXML.getContentType().getContentTypeStr())
                            .timeout(testTimeout, TimeUnit.MILLISECONDS)
                            .queryString(queryString)
                            .build();
                    if(QueryFactory.create(queryString).isAskType()) {
                        logger.debug(this.getEndpointUrl() + "?query=" + encodedQueryString + "&timeout="+testTimeout);
                        passed = testQueryExecution.execAsk();
                    } else if (QueryFactory.create(queryString).isSelectType()) {
                        ResultSet testResults = testQueryExecution.execSelect();
                        passed = true;
                    } else if (QueryFactory.create(queryString).isConstructType()) {
                        Model testResults = testQueryExecution.execConstruct();
                        passed = true;
                    }
                    testQueryExecution.close();
                } catch(Exception e) {
                    logger.error(e);
                    e.printStackTrace();
                    errorMessage = e.getMessage();
                    passed = false;
                }

                Date endDate = new Date();
                Literal endDateLiteral =  result.getDefaultModel().createLiteral(dateFormatter.format(endDate));

                // Generation of report
                Dataset earlReport = null;
                if(passed) {
                    if(Utils.queryNeedsRewriting(queryStringRaw)) {
                        earlReport = DatasetFactory.create(EarlReport.createEarlPassedQueryReport(describedDataset, queryString, this.getTests().getManifestEntry(), startDateLiteral, endDateLiteral).getReport());
                    } else {
                        earlReport = DatasetFactory.create(EarlReport.createEarlPassedQueryReport(describedDataset, null, this.getTests().getManifestEntry(), startDateLiteral, endDateLiteral).getReport());
                    }
                } else {
                    if(Utils.queryNeedsRewriting(queryStringRaw)) {
                        earlReport = DatasetFactory.create(EarlReport.createEarlFailedQueryReport(describedDataset, queryString, this.getTests().getManifestEntry(), errorMessage, startDateLiteral, endDateLiteral).getReport());
                    } else {
                        earlReport = DatasetFactory.create(EarlReport.createEarlFailedQueryReport(describedDataset, null, this.getTests().getManifestEntry(), errorMessage, startDateLiteral, endDateLiteral).getReport());
                    }
                }
                DatasetUtils.addToDataset(result, earlReport);
            };
        };

        return result;
    }
}
