package fr.inria.kgindex.main.rules;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.EarlReport;
import fr.inria.kgindex.main.data.ManifestEntry;
import fr.inria.kgindex.main.data.RuleLibrary;
import fr.inria.kgindex.main.util.DatasetUtils;
import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.Utils;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RiotException;
import org.apache.jena.sparql.engine.http.QueryExceptionHTTP;
import org.apache.jena.sparql.exec.http.QueryExecutionHTTP;
import org.apache.jena.sparql.vocabulary.EARL;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateFactory;
import org.apache.jena.update.UpdateRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static fr.inria.kgindex.main.util.Utils.dateFormatter;

public class InteractionApplication {

    private static final Logger logger = LogManager.getLogger(InteractionApplication.class);

    public static String federationserver = null;

    private final ManifestEntry _entry;
    private final DescribedDataset _describedDataset;
    private Actions _actionsSuccess = null;
    private Actions _actionsFailure = null;
    private TestExecution _tests = null;
    private TestExecution.TYPE _type = TestExecution.TYPE.SHACL;

    public InteractionApplication(ManifestEntry entry, TestExecution tests, Actions actionsSuccess, Actions actionsFailure, DescribedDataset describedDataset) {
        this._entry = entry;
        this._describedDataset = describedDataset;
        this._actionsSuccess = actionsSuccess;
        this._actionsFailure = actionsFailure;
        this._tests = tests;
    }

    public TestExecution.TYPE getType() {
        return this._type;
    }

    public void setType(TestExecution.TYPE type) {
        this._type = type;
    }

    public void apply() {
        logger.trace("Test START " + this._entry.getTestResource() );

        // Lancer fonction d'application
        try {
            Dataset testResult = this._tests.execute(this._describedDataset);

            // Récupérer rapport d'application
            boolean testPassed = false;
            List<RDFNode> testResultList = testResult.getDefaultModel().listObjectsOfProperty(EARL.outcome).toList();

            // Vérification du résultat
            if (testResultList.size() > 0) {
                ArrayList<String> testResultNodeString = new ArrayList<>();
                testResultList.forEach(node -> testResultNodeString.add(node.toString()));
                for (String resultString : testResultNodeString) {
                    if (resultString.equals(EARL.passed.toString())) {
                        testPassed = true;
                    }
                }
            }

            DatasetUtils.addToDataset(KGIndex.getResultDataset(), testResult);
            testResult.close();

            logger.trace("Test END " + this._entry.getTestResource() + " " + testPassed);
            Actions actionsToApply = null;
            // Application des actions selon le resultat du test
            if (testPassed) {
                actionsToApply = this._actionsSuccess;
            } else {
                actionsToApply = this._actionsFailure;
            }
            logger.trace("Action START " + actionsToApply.size() + " actions : " + this._entry.getFileResource());
            for (Action action : actionsToApply) {
                if (action.getType() == Action.TYPE.SPARQL) {
                    String queryStringRaw = action.getActionNode().asLiteral().getString();
                    Set<String> queryStringSet = Utils.rewriteQueryPlaceholders(queryStringRaw, this._describedDataset);
                    for (String queryString : queryStringSet) {
                        if ((action.getEndpointUrl().equals(KGIndex.federation.getURI()) && (InteractionApplication.federationserver != null))
                                || (!action.getEndpointUrl().equals(KGIndex.federation.getURI()))) {
                            if (action.getEndpointUrl().equals(KGIndex.federation.getURI())) {
                                action.setEndpointUrl(InteractionApplication.federationserver);
                            }
                            Date startDate = new Date();
                            Model tmpModel = ModelFactory.createDefaultModel();
                            Literal startDateLiteral = tmpModel.createLiteral(dateFormatter.format(startDate));
                            tmpModel.close();

                            try {
                                 if (queryString.contains("INSERT")
                                        || queryString.contains("DELETE")) {
                                    UpdateRequest insertUpdate = UpdateFactory.create(queryString);
                                    UpdateAction.execute(insertUpdate, KGIndex.getResultDataset());
                                    KGIndex.getResultDataset().commit();
                                } else if (QueryFactory.create(queryString).isConstructType()) {
                                    Query constructQuery = QueryFactory.create(queryString);
                                    QueryExecutionHTTP actionExecution = QueryExecutionHTTP.service(action.getEndpointUrl()).useGet().param("timeout", String.valueOf(action.getTimeout())).param("format", Lang.TTL.getContentType().getContentTypeStr()).timeout(action.getTimeout(), TimeUnit.MILLISECONDS).query(constructQuery).build();

                                    try {
                                        Dataset constructData = actionExecution.execConstructDataset();
                                        DatasetUtils.addToDataset(KGIndex.getResultDataset(), constructData);
                                    } catch (RiotException e) {
                                        logger.error(e);
                                        e.printStackTrace();
                                        logger.trace(this._entry.getFileResource() + " action could not be added because of RiotException");
                                    } catch (QueryException e) {
                                        logger.error(e);
                                        e.printStackTrace();
                                        logger.trace(this._entry.getFileResource() + " action could not be added because of QueryException");
                                    } catch (Exception e) {
                                        logger.error(e);
                                        e.printStackTrace();
                                        logger.trace(this._entry.getFileResource() + " action could not be added because of unknown Exception");
                                    }
                                    actionExecution.close();
                                }
                            } catch (QueryExceptionHTTP e) {
                                logger.info(e);
                                logger.trace(this._entry.getTestResource() + " : " + e.getMessage());
                                Date endDate = new Date();
                                Model tmpModel1 = ModelFactory.createDefaultModel();
                                Literal endDateLiteral = tmpModel1.createLiteral(dateFormatter.format(endDate));
                                tmpModel1.close();
                                Model earlReport = EarlReport.createEarlFailedQueryReport(this._describedDataset, queryString, this._entry, e.getMessage(), startDateLiteral, endDateLiteral).getReport();
                                DatasetUtils.addToDataset(KGIndex.getResultDataset(), DatasetFactory.create(earlReport));
                            } catch (QueryParseException ep) {
                                try {
                                    if (queryString.contains("INSERT") || queryString.contains("DELETE")) {
                                        try {
                                            UpdateRequest insertUpdate = UpdateFactory.create(queryString);
                                            UpdateAction.execute(insertUpdate, KGIndex.getResultDataset());
                                            KGIndex.getResultDataset().commit();
                                        } catch (QueryParseException er) {
                                            logger.error(queryString);
                                            throw er;
                                        }
                                    } else if (QueryFactory.create(queryString).isConstructType()) {
                                        // Tentative d'envoyer la requête sans passer par Jena
                                        HttpClient client = InteractionsUtils.getHttpClient();
                                        HttpRequest request = null;
                                        try {
                                            URI queryURL = URI.create(action.getEndpointUrl() + "?query=" + URLEncoder.encode(queryString, java.nio.charset.StandardCharsets.UTF_8.toString()));
                                            request = HttpRequest.newBuilder()
                                                    .uri(queryURL)
                                                    .GET()
                                                    .timeout(Duration.of(action.getTimeout(), ChronoUnit.MILLIS))
                                                    .header("Accept", "text/turtle")
                                                    .build();
                                        } catch (UnsupportedEncodingException e1) {
                                            e1.printStackTrace();
                                        }
                                        Dataset bodyData = DatasetFactory.create();
                                        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                                        if (response.statusCode() == 200) {
                                            String bodyString = response.body();
                                            bodyString = bodyString.replace("= {", " {");
                                            StringReader bodyReader = new StringReader(bodyString);
                                            try {
                                                RDFDataMgr.read(bodyData, bodyReader, "", Lang.TTL);
                                            } catch (RiotException er) {
                                                logger.error(bodyString);
                                                throw er;
                                            }
                                            DatasetUtils.addToDataset(KGIndex.getResultDataset(), bodyData);
                                        }
                                    }
                                } catch (IOException | InterruptedException e) {
                                    logger.error(e);
                                } catch (QueryParseException e) {
                                    logger.debug(queryString);
                                    throw e;
                                } catch (RiotException e) {
                                    logger.error(e);
                                    logger.trace(this._entry.getFileResource() + " action could not be added because of RiotException");
                                } catch (Exception e) {
                                    logger.error(e);
                                    logger.trace(this._entry.getFileResource() + " action could not be added because of unknown Exception");
                                }
                            }
                        }
                    }
                    ;
                } else if (action.getType() == Action.TYPE.Manifest) {
                    Set<ManifestEntry> entrySet = RuleLibrary.getLibrary().get(action.getActionNode());
                    for (ManifestEntry entry : entrySet) {
                        try {
                            InteractionApplication application = InteractionFactory.create(entry, this._describedDataset, KGIndex.getResultDataset());
                            application.apply();
                        } catch (Exception e) {
                            logger.error(entry.getTestResource().getURI());
                            logger.error(e);
                        }
                    }
                    ;
                }
            }
            ;
        } catch(Exception e) {
            logger.error(e);
            e.printStackTrace();
        }
        logger.trace("Action END " + this._entry.getFileResource() );
    }
}
