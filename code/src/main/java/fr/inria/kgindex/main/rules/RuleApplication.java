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
import org.apache.jena.sparql.engine.http.QueryEngineHTTP;
import org.apache.jena.sparql.engine.http.QueryExceptionHTTP;
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

public class RuleApplication {

    private static final Logger logger = LogManager.getLogger(RuleApplication.class);

    public static String federationserver = null;

    private final ManifestEntry _entry;
    private final DescribedDataset _describedDataset;
    private Actions _actionsSuccess = null;
    private Actions _actionsFailure = null;
    private Dataset _datasetDescription;
    private TestExecution _tests = null;
    private TestExecution.TYPE _type = TestExecution.TYPE.SHACL;

    public RuleApplication(ManifestEntry entry, TestExecution tests, Actions actionsSuccess, Actions actionsFailure, DescribedDataset describedDataset, Dataset datasetDescription) {
        this._entry = entry;
        this._describedDataset = describedDataset;
        this._datasetDescription = datasetDescription;
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

    public Dataset apply() {
        logger.trace("Test START " + this._entry.getTestResource() );
        Dataset result = DatasetFactory.create();

        // Lancer fonction d'application
        Dataset testResult = this._tests.execute( this._describedDataset, this._datasetDescription);
        result = DatasetUtils.addDataset(result, testResult);

        // Récupérer rapport d'application
        boolean testPassed = false;
        List<RDFNode> testResultList = testResult.getDefaultModel().listObjectsOfProperty(EARL.outcome).toList();

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
                            if (queryString.contains("CONSTRUCT") && ! queryString.contains("GRAPH")) {
                                Query constructQuery = QueryFactory.create(queryString);
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
                                QueryEngineHTTP actionExecution = new QueryEngineHTTP(action.getEndpointUrl(), constructQuery, client);
                                actionExecution.addParam("timeout", String.valueOf(Utils.queryTimeout));
                                actionExecution.addParam("format", Lang.TRIG.getContentType().getContentTypeStr());
                                actionExecution.setTimeout(Utils.queryTimeout, TimeUnit.MILLISECONDS, Utils.queryTimeout, TimeUnit.MILLISECONDS);
                                actionExecution.setAcceptHeader(Lang.TRIG.getContentType().getContentTypeStr());
                                try {
                                    Dataset constructData = actionExecution.execConstructDataset();
                                    result = DatasetUtils.addDataset(result, constructData);
                                } catch (RiotException e) {
                                    logger.error(e);
                                    logger.trace(this._entry.getFileResource() + " action could not be added because of RiotException");
                                } catch(QueryException e) {
                                    logger.error(e);
                                    logger.trace(this._entry.getFileResource() + " action could not be added because of QueryException");
                                }
                                actionExecution.close();
                            } else if (queryString.contains("INSERT") || queryString.contains("DELETE")) {
                                UpdateRequest insertUpdate = UpdateFactory.create(queryString);
                                UpdateAction.execute(insertUpdate, this._datasetDescription);
                                this._datasetDescription.commit();
                            } else if (queryString.contains("CONSTRUCT") && queryString.contains("GRAPH")) {
                                // Tentative d'envoyer la requête sans passer par Jena
                                try {
                                    HttpClient client = RulesUtils.getHttpClient();
                                    URI queryURL = URI.create(action.getEndpointUrl()
                                            + "?query=" + URLEncoder.encode(queryString, java.nio.charset.StandardCharsets.UTF_8.toString())
                                            + "&timeout=" + Utils.queryTimeout
                                            + "&format=" + Lang.TRIG.getContentType().getContentTypeStr());
                                    HttpRequest request = HttpRequest.newBuilder()
                                            .uri(queryURL)
                                            .GET()
                                            .timeout(Duration.of(Utils.queryTimeout, ChronoUnit.MILLIS))
                                            .header("Accept", Lang.TRIG.getContentType().getContentTypeStr())
                                            .build();
                                    Dataset bodyData = DatasetFactory.create();
                                    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                                    if(response.statusCode() == 200) {
                                        String bodyString = response.body();
                                        bodyString = bodyString.replace("= {", " {");
                                        StringReader bodyReader = new StringReader(bodyString);
                                        RDFDataMgr.read(bodyData, bodyReader, "", Lang.TRIG);
                                        DatasetUtils.addDataset(result, bodyData);
                                    }
                                } catch (RiotException | InterruptedException | IOException e1) {
                                    logger.error(e1);
                                }
                            }
                        } catch (QueryExceptionHTTP e) {
                            logger.info(e);
                            logger.trace(this._entry.getTestResource() + " : " + e.getMessage());
                            Date endDate = new Date();
                            Model tmpModel1 = ModelFactory.createDefaultModel();
                            Literal endDateLiteral = tmpModel1.createLiteral(dateFormatter.format(endDate));
                            tmpModel1.close();
                            Model earlReport = EarlReport.createEarlFailedQueryReport(this._describedDataset, queryString, this._entry, e.getMessage(), startDateLiteral, endDateLiteral).getReport();
                            result = DatasetUtils.addDataset(result, DatasetFactory.create(earlReport));
                        } catch (QueryParseException ep) {
                            try {
                                if (queryString.contains("CONSTRUCT")) {
                                    // Tentative d'envoyer la requête sans passer par Jena
                                    HttpClient client = RulesUtils.getHttpClient();
                                    HttpRequest request = null;
                                    try {
                                        URI queryURL = URI.create(action.getEndpointUrl() + "?query=" + URLEncoder.encode(queryString, java.nio.charset.StandardCharsets.UTF_8.toString()));
                                        logger.debug(queryURL);
                                        request = HttpRequest.newBuilder()
                                                .uri(queryURL)
                                                .GET()
                                                .timeout(Duration.of(Utils.queryTimeout, ChronoUnit.MILLIS))
                                                .header("Accept", "application/x-trig")
                                                .build();
                                    } catch (UnsupportedEncodingException e1) {
                                        e1.printStackTrace();
                                    }
                                    Dataset bodyData = DatasetFactory.create();
                                    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                                    if(response.statusCode() == 200) {
                                        String bodyString = response.body();
                                        bodyString = bodyString.replace("= {", " {");
                                        StringReader bodyReader = new StringReader(bodyString);
                                        try {
                                            RDFDataMgr.read(bodyData, bodyReader, "", Lang.TRIG);
                                        } catch(RiotException er) {
                                            logger.error(bodyString);
                                            throw er;
                                        }
                                        DatasetUtils.addDataset(result, bodyData);
                                    }
                                } else if (queryString.contains("INSERT") || queryString.contains("DELETE")) {
                                    UpdateRequest insertUpdate = UpdateFactory.create(queryString);
                                    UpdateAction.execute(insertUpdate, this._datasetDescription);
                                    this._datasetDescription.commit();
                                }
                            } catch (IOException | InterruptedException  e) {
                                logger.error(e);
                            } catch (QueryParseException e) {
                                logger.debug(queryString);
                                throw e;
                            } catch (RiotException e) {
                                logger.error(e);
                                logger.trace(this._entry.getFileResource() + " action could not be added because of RiotException");
                            }
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
