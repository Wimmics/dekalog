package fr.inria.kgindex.rules;

import fr.inria.kgindex.data.DescribedDataset;
import fr.inria.kgindex.data.ManifestEntry;
import fr.inria.kgindex.data.RuleLibrary;
import fr.inria.kgindex.util.DatasetUtils;
import fr.inria.kgindex.util.EarlReport;
import fr.inria.kgindex.util.KGIndex;
import fr.inria.kgindex.util.Utils;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RiotException;
import org.apache.jena.sparql.engine.http.QueryExceptionHTTP;
import org.apache.jena.sparql.resultset.RDFInput;
import org.apache.jena.sparql.vocabulary.EARL;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateFactory;
import org.apache.jena.update.UpdateRequest;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.net.http.HttpRequest;

import static fr.inria.kgindex.util.Utils.dateFormatter;

public class RuleApplication {

    private static final Logger logger = LogManager.getLogger(RuleApplication.class);

    public enum TYPE {
        SPARQL,
        SHACL,
        UNKNOWN
    }

    public static String federationserver = null;

    private final ManifestEntry _entry;
    private final DescribedDataset _describedDataset;
    private Actions _actionsSuccess = null;
    private Actions _actionsFailure = null;
    private Dataset _datasetDescription;
    private TestExecution _tests = null;
    private TYPE _type = TYPE.SHACL;

    public RuleApplication(ManifestEntry entry, TestExecution tests, Actions actionsSuccess, Actions actionsFailure, DescribedDataset describedDataset, Dataset datasetDescription) {
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

    public Dataset apply() {
        logger.trace("Test START " + this._entry.getTestResource() );
        Dataset result = DatasetFactory.create();

        // Lancer fonction d'application
        Dataset testResult = this._tests.execute( this._describedDataset, this._datasetDescription);
        result = DatasetUtils.addDataset(result, testResult);

        // Récupérer rapport d'application
        boolean testPassed = false;
        List<RDFNode> testResultList = testResult.getDefaultModel().listObjectsOfProperty(EARL.outcome).toList();
        testResult.getDefaultModel().write(System.err, "TTL");
        logger.debug(testResultList);

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
        logger.trace("Action START " + actionsToApply.size() + " actions : " + this._entry.getFileResource() );
        for(Action action : actionsToApply) {
            if(action.getType() == Action.TYPE.SPARQL) {
                String queryStringRaw = action.getActionNode().asLiteral().getString();
                Set<String> queryStringSet = Utils.rewriteQueryPlaceholders(queryStringRaw, this._describedDataset);
                for(String queryString : queryStringSet) {
                    if((action.getEndpointUrl().equals(KGIndex.federation.getURI()) && (RuleApplication.federationserver != null))
                            || (! action.getEndpointUrl().equals(KGIndex.federation.getURI()))) {
                        if(action.getEndpointUrl().equals(KGIndex.federation.getURI())) {
                            action.setEndpointUrl(RuleApplication.federationserver);
                        }
                        Date startDate = new Date();
                        Model tmpModel = ModelFactory.createDefaultModel();
                        Literal startDateLiteral = tmpModel.createLiteral(dateFormatter.format(startDate));
                        tmpModel.close();
                        try {
                            if (queryString.contains("CONSTRUCT")) {
                                logger.debug(queryString);

                                try {
                                    // Tentative d'envoyer la requête sans passer par Jena
                                    HttpClient client = HttpClient.newHttpClient();
                                    HttpRequest request = null;
                                    try {
                                        URI queryURL = URI.create(action.getEndpointUrl() + "?query=" + URLEncoder.encode(queryString, java.nio.charset.StandardCharsets.UTF_8.toString()) + "&timeout=" + Utils.queryTimeout);
                                        logger.debug(queryURL);
                                        request = HttpRequest.newBuilder()
                                                .uri(queryURL)
                                                .GET()
                                                .header("Accept", "application/x-trig")
                                                .build();
                                    } catch (UnsupportedEncodingException e1) {
                                        e1.printStackTrace();
                                    }
                                    Dataset bodyData = DatasetFactory.create();
                                    client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                                            .thenApply(HttpResponse::body)
                                            .thenAccept(bodyString -> {
                                                if (queryString.contains("CONSTRUCT")) {
                                                    bodyString = bodyString.replace("= {", " {"); // SPARADRA pour enlever l'erreur de format qui met un "=" entre le nom d'un graphe et son contenu
                                                    StringReader bodyReader = new StringReader(bodyString);
                                                    logger.debug(bodyString);
                                                    try {
                                                        RDFDataMgr.read(bodyData, bodyReader, "", Lang.TRIG);
                                                    } catch (RiotException e) {
                                                        logger.error(e);
                                                    }
                                                }
                                            })
                                            .join();
                                    RDFDataMgr.write(System.err, bodyData, Lang.TRIG);
                                    DatasetUtils.addDataset(result, bodyData);
                                } catch (RiotException e) {
                                    logger.error(e);
                                    logger.trace(this._entry.getFileResource() + " action could not be added because of RiotException");
                                } catch(QueryException e) {
                                    logger.error(e);
                                    logger.trace(this._entry.getFileResource() + " action could not be added because of QueryException");
                                }
                            } else if (queryString.contains("INSERT") || queryString.contains("DELETE")) {
                                UpdateRequest insertUpdate = UpdateFactory.create(queryString);
                                UpdateAction.execute(insertUpdate, this._datasetDescription);
                                this._datasetDescription.commit();
                            }
                        } catch (QueryExceptionHTTP e) {
                            logger.info(e);
                            logger.trace(this._entry.getTestResource() + " : " + e.getMessage());
                            Date endDate = new Date();
                            Model tmpModel1 = ModelFactory.createDefaultModel();
                            Literal endDateLiteral = tmpModel1.createLiteral(dateFormatter.format(endDate));
                            tmpModel1.close();
                            Model earlReport = EarlReport.createEarlFailedQueryReport(this._describedDataset, queryString, this._entry, e.getMessage(), startDateLiteral, endDateLiteral);
                            result = DatasetUtils.addDataset(result, DatasetFactory.create(earlReport));
                        } catch (QueryParseException e) {
                            // Tentative d'envoyer la requête sans passer par Jena
                            HttpClient client = HttpClient.newHttpClient();
                            HttpRequest request = null;
                            try {
                                URI queryURL = URI.create(action.getEndpointUrl() + "?query=" + URLEncoder.encode(queryString, java.nio.charset.StandardCharsets.UTF_8.toString()));
                                logger.debug(queryURL);
                                request = HttpRequest.newBuilder()
                                        .uri(queryURL)
                                        .GET()
                                        .header("Accept", "application/rdf+xml")
                                        .build();
                            } catch (UnsupportedEncodingException e1) {
                                e1.printStackTrace();
                            }
                            Dataset bodyData = DatasetFactory.create();
                            client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                                    .thenApply(HttpResponse::body)
                                    .thenAccept(bodyString -> {
                                        if (queryString.contains("CONSTRUCT")) {
                                            Dataset bodyModel = DatasetFactory.create();
                                            StringReader bodyReader = new StringReader(bodyString);
                                            try {
                                                RDFDataMgr.read(bodyData, bodyReader, "", Lang.TRIG);
                                            } catch(RiotException er) {
                                                logger.error(bodyString);
                                                throw e;
                                            }
                                        }
                                    })
                                    .join();
                            DatasetUtils.addDataset(result, bodyData);
                        }
                    }
                };
            } else if(action.getType() == Action.TYPE.Manifest) {
                Set<ManifestEntry> entrySet = RuleLibrary.getLibrary().get(action.getActionNode());
                for(ManifestEntry entry : entrySet) {
                    RuleApplication application = RuleFactory.create(entry, this._describedDataset, this._datasetDescription);
                    application.apply();
                };
            }
        };
        logger.trace("Action END " + this._entry.getFileResource() );

        return result;
    }
}
