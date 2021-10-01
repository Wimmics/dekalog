package fr.inria.kgindex.main;

import fr.inria.kgindex.main.util.Utils;
import org.apache.commons.cli.*;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.*;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class CatalogInputMain {

    private static final Logger logger = LogManager.getLogger(CatalogInputMain.class);

    private static final String OPT_CATALOG_FILE = "catalogFile";
    private static final String OPT_CATALOG_ENDPOINT = "catalogEndpoint";
    private static final String OPT_MANIFEST = "manifest";
    private static final String OPT_TIMEOUT = "timeout";
    private static final String OPT_OUTPUT = "output";
    private static final String OPT_HELP = "help";
    private static final String APP_NAME = "kgindex";
    private static final String DEFAULT_TIMEOUT = "30000";
    private static final String DEFAULT_MANIFEST = "https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl";

    public static void main(String[] args) {
        Options options = new Options();
        options.addOption(Option.builder(OPT_HELP)
                .required(false)
                .desc("Print this message.")
                .build());
        OptionGroup inputGroup = new OptionGroup();
        inputGroup.addOption(Option.builder(OPT_CATALOG_FILE)
                .required(false)
                .desc("File containing a DCAT catalog of knowledge bases.")
                .hasArg()
                .build());
        inputGroup.addOption(Option.builder(OPT_CATALOG_ENDPOINT)
                .required(false)
                .desc("Endpoint giving access to a DCAT catalog of knowledge bases.")
                .hasArg()
                .build());
        inputGroup.setRequired(true);
        options.addOptionGroup(inputGroup);
        options.addOption(Option.builder(OPT_OUTPUT)
                .required(false)
                .hasArg()
                .desc("Output filename. Default is 'output.trig'.")
                .build());
        options.addOption(Option.builder(OPT_MANIFEST)
                .required(false)
                .hasArg()
                .desc("Root manifest file of the generation rules. Default is " + DEFAULT_MANIFEST )
                .build());
        options.addOption(Option.builder(OPT_TIMEOUT)
                .required(false)
                .hasArg()
                .desc("Timeout for all queries in milliseconds. Default is " + DEFAULT_TIMEOUT + ".")
                .build());
        CommandLineParser parser = new DefaultParser();
        try {
            CommandLine cmd = parser.parse( options, args);
            if(cmd.hasOption(OPT_HELP)) {
                HelpFormatter formatter = new HelpFormatter();
                formatter.printHelp( APP_NAME, options );
            }

            String outputFilename = "output.trig";
            if(cmd.hasOption(OPT_OUTPUT)) {
                outputFilename = cmd.getOptionValue(OPT_OUTPUT, "output.trig");
            }
            if(cmd.hasOption(OPT_TIMEOUT)) {
                String queryTimeoutString = cmd.getOptionValue(OPT_TIMEOUT, DEFAULT_TIMEOUT);
                Utils.queryTimeout = Long.parseLong(queryTimeoutString);
            }
            if(cmd.hasOption(OPT_MANIFEST)) {
                Utils.manifestRootFile = cmd.getOptionValue(OPT_MANIFEST, DEFAULT_MANIFEST);
            }

            RDFConnection catalogConnection = null;
            if(cmd.hasOption(OPT_CATALOG_FILE)) {
                String catalogFilename = cmd.getOptionValue(OPT_CATALOG_FILE);

                // Créer connexion locale
                Dataset catalogDataset = DatasetFactory.create();
                RDFDataMgr.read(catalogDataset, catalogFilename);
                catalogConnection = RDFConnectionFactory.connect(catalogDataset);
            } else if(cmd.hasOption(OPT_CATALOG_ENDPOINT)) {
                // Créer connexion distante
                String catalogUrl = cmd.getOptionValue(OPT_CATALOG_ENDPOINT);
                catalogConnection = RDFConnectionFactory.connect(catalogUrl);
            }

            Dataset result = DatasetFactory.create();

            logger.trace("START of catalog processing");
            // Envoyer les requêtes d'extraction des descriptions de dataset
            Query datasetEndpointQuery = QueryFactory.create("PREFIX void: <http://rdfs.org/ns/void#>" +
                    "PREFIX schema: <http://schema.org/>" +
                    "PREFIX dcterms: <http://purl.org/dc/terms/>" +
                    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +
                    "PREFIX dcat: <http://www.w3.org/ns/dcat#>" +
                    "SELECT DISTINCT ?datasetUri ?endpointUrl ?datasetName WHERE { " +
                    "?datasetCatalog a dcat:Catalog ;" +
                    "   dcat:dataset ?datasetUri ." +
                    "?datasetUri void:sparqlEndpoint ?endpointUrl . " +
                    "OPTIONAL {" +
                    "   { ?datasetUri rdfs:label ?datasetName } " +
                    "   UNION { ?datasetUri schema:name ?datasetName }" +
                    "   UNION { ?datasetUri dcterms:title ?datasetName }" +
                    "}" +
                    "}");

            logger.debug(datasetEndpointQuery);
            assert catalogConnection != null;
            String finalOutputFilename = outputFilename;
            catalogConnection.querySelect(datasetEndpointQuery, querySolution -> {
                logger.debug(querySolution.get("?datasetUri") + " " + querySolution.get("?endpointUrl") + " " + querySolution.get("?datasetName"));
                try {
                String datasetUri = querySolution.get("?datasetUri").toString();
                String endpointUrl = querySolution.get("?endpointUrl").asResource().getURI();
                String datasetName = "";
                if(querySolution.get("?datasetName") == null) {
                    datasetName = URLEncoder.encode(datasetUri, StandardCharsets.UTF_8.toString());
                } else {
                    datasetName = querySolution.get("?datasetName").toString();
                }
                logger.trace("START dataset " + datasetName + " " + datasetUri + " : " + endpointUrl);

                // Faire l'extraction de description selon nos regles
                    Path tmpDatasetDescFile = Files.createTempFile(null, ".trig");

                    datasetName = URLEncoder.encode(datasetName, StandardCharsets.UTF_8.toString());
                    MainClass.extractIndexDescriptionForDataset(datasetName, endpointUrl, tmpDatasetDescFile.toString());
                    logger.trace("END dataset " + datasetName + " " + datasetUri + " : " + endpointUrl);
                    logger.trace("Transfert to result START");
                    InputStream inputStream = new FileInputStream(tmpDatasetDescFile.toString());
                    RDFDataMgr.read(result, inputStream, Lang.TRIG);
                    Files.deleteIfExists(tmpDatasetDescFile);
                    try {
                        OutputStream outputStream = new FileOutputStream(finalOutputFilename);
                        RDFDataMgr.write(outputStream, result, Lang.TRIG);
                    } catch (FileNotFoundException e) {
                        logger.error(e);
                    }
                    logger.trace("Transfert to result END");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
            logger.trace("END of catalog processing");
            RDFDataMgr.write(System.err, result, Lang.TRIG);
            try {
                OutputStream outputStream = new FileOutputStream(outputFilename);
                RDFDataMgr.write(outputStream, result, Lang.TRIG);
            } catch (FileNotFoundException e) {
                logger.error(e);
            }

        } catch (ParseException e1) {
            HelpFormatter formatter = new HelpFormatter();
            formatter.printHelp( APP_NAME, options );
        }
    }
}
