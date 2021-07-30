package fr.inria.kgindex.step;

import fr.inria.kgindex.data.Dataset;
import fr.inria.kgindex.util.EarlReport;
import fr.inria.kgindex.util.KGIndex;
import fr.inria.kgindex.util.Utils;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.*;
import org.apache.jena.sparql.engine.http.QueryExceptionHTTP;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDFS;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Date;
import java.util.List;
import java.util.Set;

import static fr.inria.kgindex.util.Utils.dateFormatter;

public class QueryTestExecution extends TestExecution {

    private static final Logger logger = LogManager.getLogger(QueryTestExecution.class);

    public QueryTestExecution(Tests tests, String url) {
        super(tests, url);
    }

    public Model execute(Dataset describedDataset, Model datasetDescription) {
        return executeTestQueryTest(describedDataset);
    }

    private Model executeTestQueryTest(Dataset describedDataset) {
        Model result = ModelFactory.createDefaultModel();

        this.getTests().getTests().forEach(testModel -> {
            Date startDate = new Date();
            Literal startDateLiteral =  result.createLiteral(dateFormatter.format(startDate));

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

            queryStringVariant.forEach(queryString -> {
                boolean passed = true;
                String errorMessage = "";

                // Execution de la requête
                try {
                    QueryExecution testQueryExecution = QueryExecutionFactory.sparqlService(this.getEndpointUrl(), queryString);
                    testQueryExecution.setTimeout(Utils.queryTimeout);
                    if(queryString.contains("ASK")) {
                        passed = testQueryExecution.execAsk();
                    } else {
                        ResultSet testResults = testQueryExecution.execSelect();
                        passed = true;
                    }
                    testQueryExecution.close();
                } catch(QueryExceptionHTTP e) {
                    logger.info(e);
                    errorMessage = e.getMessage();
                    passed = false;
                }

                Date endDate = new Date();
                Literal endDateLiteral =  result.createLiteral(dateFormatter.format(endDate));

                // Generation of report
                if(passed) {
                    result.add(EarlReport.createEarlPassedQueryReport(describedDataset, queryString, this.getTests().getManifestEntry(), startDateLiteral, endDateLiteral));
                } else {
                    result.add(EarlReport.createEarlFailedQueryReport(describedDataset, queryString, this.getTests().getManifestEntry(), errorMessage, startDateLiteral, endDateLiteral));
                }
            });
        });

        return result;
    }
}
