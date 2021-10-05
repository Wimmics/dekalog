package fr.inria.kgindex.main.rules;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.EarlReport;
import fr.inria.kgindex.main.util.DatasetUtils;
import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.Utils;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.QueryException;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.*;
import org.apache.jena.sparql.engine.http.QueryEngineHTTP;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDFS;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Date;
import java.util.List;
import java.util.Set;

import static fr.inria.kgindex.main.util.Utils.dateFormatter;

public class QueryTestExecution extends TestExecution {

    private static final Logger logger = LogManager.getLogger(QueryTestExecution.class);

    public QueryTestExecution(Tests tests, String url) {
        super(tests, url);
    }

    public Dataset execute(DescribedDataset describedDataset, Dataset datasetDescription) {
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

            String queryStringRaw = queryResource.getString();

            // Remplacement des placeholders dans la requete devrait être ici
            Set<String> queryStringVariant = Utils.rewriteQueryPlaceholders(queryStringRaw, describedDataset);

            for(String queryString : queryStringVariant) {
                boolean passed = true;
                String errorMessage = "";
                // Execution de la requête
                try {
                    org.apache.http.client.config.RequestConfig requestConfig = org.apache.http.client.config.RequestConfig.copy(org.apache.http.client.config.RequestConfig.DEFAULT)
                            .setSocketTimeout(Math.toIntExact(Utils.queryTimeout))
                            .setConnectTimeout(Math.toIntExact(Utils.queryTimeout))
                            .setConnectionRequestTimeout(Math.toIntExact(Utils.queryTimeout))
                            .build();
                    org.apache.http.client.HttpClient client = org.apache.http.impl.client.HttpClientBuilder.create()
                            .setUserAgent(RulesUtils.USER_AGENT)
                            .useSystemProperties()
                            .setDefaultRequestConfig(requestConfig)
                            .build();
                    QueryEngineHTTP testQueryExecution = new QueryEngineHTTP(this.getEndpointUrl(), queryString, client);
                    testQueryExecution.addParam("timeout", String.valueOf(Utils.queryTimeout));
                    testQueryExecution.setTimeout(Utils.queryTimeout, Utils.queryTimeout);
                    if(queryString.contains("ASK")) {
                        passed = testQueryExecution.execAsk();
                    } else if (queryString.contains("SELECT")) {
                        ResultSet testResults = testQueryExecution.execSelect();
                        passed = true;
                    }
                    testQueryExecution.close();
                } catch(QueryException e) {
                    logger.info(e);
                    errorMessage = e.getMessage();
                    passed = false;
                }

                Date endDate = new Date();
                Literal endDateLiteral =  result.getDefaultModel().createLiteral(dateFormatter.format(endDate));

                // Generation of report
                if(passed) {
                    Dataset earlReport = DatasetFactory.create(EarlReport.createEarlPassedQueryReport(describedDataset, queryString, this.getTests().getManifestEntry(), startDateLiteral, endDateLiteral).getReport());
                    result = DatasetUtils.addDataset(result, earlReport);
                } else {
                    Dataset earlReport = DatasetFactory.create(EarlReport.createEarlFailedQueryReport(describedDataset, queryString, this.getTests().getManifestEntry(), errorMessage, startDateLiteral, endDateLiteral).getReport());
                    result = DatasetUtils.addDataset(result, earlReport);
                }
            };
        };

        return result;
    }
}
