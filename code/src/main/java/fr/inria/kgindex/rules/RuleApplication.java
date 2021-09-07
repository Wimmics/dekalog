package fr.inria.kgindex.rules;

import fr.inria.kgindex.data.Dataset;
import fr.inria.kgindex.data.ManifestEntry;
import fr.inria.kgindex.data.RuleLibrary;
import fr.inria.kgindex.util.EarlReport;
import fr.inria.kgindex.util.Utils;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryParseException;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RiotException;
import org.apache.jena.sparql.engine.http.QueryExceptionHTTP;
import org.apache.jena.sparql.vocabulary.EARL;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateFactory;
import org.apache.jena.update.UpdateRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

import static fr.inria.kgindex.util.Utils.dateFormatter;

public class RuleApplication {

    private static final Logger logger = LogManager.getLogger(RuleApplication.class);

    public enum TYPE {
        SPARQL,
        SHACL,
        UNKNOWN
    }

    private final ManifestEntry _entry;
    private final Dataset _describedDataset;
    private Actions _actionsSuccess = null;
    private Actions _actionsFailure = null;
    private Model _datasetDescription;
    private TestExecution _tests = null;
    private TYPE _type = TYPE.SHACL;

    public RuleApplication(ManifestEntry entry, TestExecution tests, Actions actionsSuccess, Actions actionsFailure, Dataset describedDataset, Model datasetDescription) {
        this._entry = entry;
        this._describedDataset = describedDataset;
        this._datasetDescription = datasetDescription;
        this._actionsSuccess = actionsSuccess;
        this._actionsFailure = actionsFailure;
        this._tests = tests;
    }

    public TYPE getType() {
        return this._type;
    }

    public void setType(TYPE type) {
        this._type = type;
    }

    public Model apply() {
        logger.trace("Test START " + this._entry.getTestResource() );
        Model result = ModelFactory.createDefaultModel();

        // Lancer fonction d'application
        Model testResult = this._tests.execute( this._describedDataset, this._datasetDescription);
        result.add(testResult);

        // Récupérer rapport d'application
        boolean testPassed = false;
        List<RDFNode> testResultList = testResult.listObjectsOfProperty(EARL.outcome).toList();

        // Vérification du résultat
        if(testResultList.size() > 0){
            ArrayList<String> testResultNodeString = new ArrayList<>();
            testResultList.forEach(node -> testResultNodeString.add(node.toString()));
            for (String resultString : testResultNodeString) {
                if (resultString.equals(EARL.passed.toString())) {
                    testPassed = true;
                }
            }
        }

        logger.trace("Test END " + this._entry.getTestResource() + " " + testPassed );
        Actions actionsToApply = null;
        // Application des actions selon le resultat du test
        if(testPassed){
            actionsToApply = this._actionsSuccess;
        } else {
            actionsToApply = this._actionsFailure;
        }
        logger.trace("Action START " + this._entry.getFileResource() );
        actionsToApply.forEach(action -> {
            if(action.getType() == Action.TYPE.SPARQL) {
                String queryStringRaw = action.getActionNode().asLiteral().getString();
                Set<String> queryStringSet = Utils.rewriteQueryPlaceholders(queryStringRaw, this._describedDataset);
                queryStringSet.forEach(queryString -> {
                    Date startDate = new Date();
                    Literal startDateLiteral = result.createLiteral(dateFormatter.format(startDate));
                    try {
                        if (queryString.contains("CONSTRUCT")) {
                            QueryExecution actionExecution = QueryExecutionFactory.sparqlService(action.getEndpointUrl(), queryString);
                            actionExecution.setTimeout(Utils.queryTimeout);

                            try {
                                Model actionResult = actionExecution.execConstruct();
                                result.add(actionResult);
                            } catch (RiotException e) {
                                logger.error(e);
                                logger.trace(this._entry.getTestResource() + " action could not be added because of RiotException");
                            }
                            actionExecution.close();
                        } else if (queryString.contains("INSERT")) {
                            UpdateRequest insertUpdate = UpdateFactory.create(queryString);
                            UpdateAction.execute(insertUpdate, this._datasetDescription);
                        } else if (queryString.contains("DELETE")) {
                            UpdateRequest deleteUpdate = UpdateFactory.create(queryString);
                            UpdateAction.execute(deleteUpdate, this._datasetDescription);
                        }
                    } catch (QueryExceptionHTTP e) {
                        logger.info(e);
                        logger.trace(this._entry.getTestResource() + " : " + e.getMessage());
                        Date endDate = new Date();
                        Literal endDateLiteral = result.createLiteral(dateFormatter.format(endDate));
                        result.add(EarlReport.createEarlFailedQueryReport(this._describedDataset, queryString, this._entry, e.getMessage(), startDateLiteral, endDateLiteral));
                    } catch (QueryParseException e) {
                        logger.debug(queryString);
                        throw e;
                    }

                });
            } else if(action.getType() == Action.TYPE.Manifest) {
                Set<ManifestEntry> entrySet = RuleLibrary.getLibrary().get(action.getActionNode());
                entrySet.forEach(entry -> {
                    RuleApplication application = RuleFactory.create(entry, this._describedDataset, this._datasetDescription);
                    application.apply();
                });
            }
        });
        logger.trace("Action END " + this._entry.getFileResource() );

        return result;
    }
}
