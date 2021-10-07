package fr.inria.kgindex.main;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.rules.RuleApplication;
import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.Utils;
import org.apache.commons.cli.*;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.DCAT;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.SKOS;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class CatalogInputMain {

    private static final Logger logger = LogManager.getLogger(CatalogInputMain.class);

    private static final String OPT_CATALOG_FILE = "catalogFile";
    private static final String OPT_CATALOG_ENDPOINT = "catalogEndpoint";
    private static final String OPT_FEDERATION = "federation";
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
        options.addOption(Option.builder(OPT_FEDERATION)
                .required(false)
                .hasArg()
                .desc("SPARQL endpoint URL to a federation server used in rules for the generation. If none is given, rules using the kgi:federated endpoint will not be executed.")
                .build());
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
            if(cmd.hasOption(OPT_FEDERATION)) {
                RuleApplication.federationserver = cmd.getOptionValue(OPT_FEDERATION, null);
            }

            RDFConnection catalogConnection = null;
            if(cmd.hasOption(OPT_CATALOG_FILE)) {
                String catalogFilename = cmd.getOptionValue(OPT_CATALOG_FILE);
                Dataset catalogDataset = DatasetFactory.createTxnMem();

                // Créer connexion locale
                if(catalogFilename != null && catalogDataset != null ) {
                    logger.debug(catalogDataset + " " + catalogFilename);
                    RDFDataMgr.read(catalogDataset, catalogFilename);
                    catalogConnection = RDFConnectionFactory.connect(catalogDataset);
                } else {
                    HelpFormatter formatter = new HelpFormatter();
                    formatter.printHelp( APP_NAME, options );
                    throw new Error("Catalog file name is null");
                }
            } else if(cmd.hasOption(OPT_CATALOG_ENDPOINT)) {
                // Créer connexion distante
                String catalogUrl = cmd.getOptionValue(OPT_CATALOG_ENDPOINT);
                catalogConnection = RDFConnectionFactory.connect(catalogUrl);
            }

            Dataset result = DatasetFactory.create();
            Resource catalogRoot = result.getDefaultModel().createResource(KGIndex.kgindexNamespace + "catalogRoot");
            result.getDefaultModel().add(catalogRoot, RDF.type, DCAT.Catalog );
            // Requetes exemples
            Resource descResListExample = result.getDefaultModel().createResource();
            result.getDefaultModel().add(catalogRoot, SKOS.example, descResListExample);
            result.getDefaultModel().add(descResListExample, DCTerms.description, "Return the list description resources for the dataset, endpoint and metadata of each KB");
            result.getDefaultModel().add(descResListExample, DCTerms.subject, " PREFIX void: <http://rdfs.org/ns/void#> " +
                    " PREFIX dcat: <http://www.w3.org/ns/dcat#> " +
                    " PREFIX earl: <http://www.w3.org/ns/earl#> " +
                    " PREFIX kgi: <http://ns.inria.fr/kg/index#> " +
                    " PREFIX voidex: <http://ldf.fi/void-ext#> " +
                    " PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> " +
                    " SELECT ?datasetDesc ?endpointDesc ?metadataDesc ?endpoint WHERE { " +
                    " ?datasetDesc a  dcat:Dataset . " +
                    " ?datasetDesc void:sparqlEndpoint ?endpoint . " +
                    " ?endpointDesc sd:endpoint ?endpoint . " +
                    " ?metadataDesc kgi:curated ?datasetDesc , ?endpointDesc . " +
                    " } GROUP BY ?endpoint ORDER BY DESC( ?datasetDesc) ");
            Resource testResultExample = result.getDefaultModel().createResource();
            result.getDefaultModel().add(catalogRoot, SKOS.example, testResultExample);
            result.getDefaultModel().add(testResultExample, DCTerms.description, "Return the list of tests and their outcome for each KB");
            result.getDefaultModel().add(testResultExample, DCTerms.subject, "PREFIX void: <http://rdfs.org/ns/void#> " +
                    "PREFIX dcat: <http://www.w3.org/ns/dcat#> " +
                    "PREFIX earl: <http://www.w3.org/ns/earl#> " +
                    "PREFIX kgi: <http://ns.inria.fr/kg/index#> " +
                    "SELECT DISTINCT ?base ?test ?outcome WHERE { " +
                    "?base a  dcat:Dataset . " +
                    "?metadata kgi:curated ?base . " +
                    "?metadata kgi:trace ?trace . " +
                    "?trace earl:result ?result . " +
                    "?result earl:outcome ?outcome . " +
                    "?trace earl:test ?test . " +
                    "} GROUP BY ?metadata ?result ORDER BY DESC( ?base) ASC(?test)");
            Resource featuresExample = result.getDefaultModel().createResource();
            result.getDefaultModel().add(catalogRoot, SKOS.example, featuresExample);
            result.getDefaultModel().add(featuresExample, DCTerms.description, "List of the features of the endpoint of each KB");
            result.getDefaultModel().add(featuresExample, DCTerms.subject, "PREFIX void: <http://rdfs.org/ns/void#> " +
                    "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> " +
                    "PREFIX dcat: <http://www.w3.org/ns/dcat#> " +
                    "PREFIX earl: <http://www.w3.org/ns/earl#> " +
                    "PREFIX kgi: <http://ns.inria.fr/kg/index#> " +
                    "SELECT DISTINCT ?datasetDesc ?endpoint ?feature WHERE { " +
                    "?datasetDesc a  dcat:Dataset . " +
                    "?datasetDesc void:sparqlEndpoint ?endpoint . " +
                    "?endpointDesc a sd:Service . " +
                    "?endpointDesc sd:endpoint ?endpoint . " +
                    "?endpointDesc sd:feature ?feature . " +
                    "FILTER( CONTAINS(str(?feature, str(sd:))) ) " +
                    "} GROUP BY ?endpointDesc ?feature  ORDER BY DESC( ?datasetDesc) ");
            Resource iriNumberExample = result.getDefaultModel().createResource();
            result.getDefaultModel().add(catalogRoot, SKOS.example, iriNumberExample);
            result.getDefaultModel().add(iriNumberExample, DCTerms.description, "Number of IRIs per KB.");
            result.getDefaultModel().add(iriNumberExample, DCTerms.subject, "PREFIX void: <http://rdfs.org/ns/void#> " +
                    "PREFIX dcat: <http://www.w3.org/ns/dcat#> " +
                    "PREFIX earl: <http://www.w3.org/ns/earl#> " +
                    "PREFIX kgi: <http://ns.inria.fr/kg/index#> " +
                    "PREFIX voidex: <http://ldf.fi/void-ext#> " +
                    "SELECT ?datasetDesc ?endpoint ?IRIs WHERE { " +
                    "?datasetDesc a  dcat:Dataset . " +
                    "?datasetDesc void:sparqlEndpoint ?endpoint . " +
                    "?datasetDesc voidex:distinctIRIReferences ?IRIs . " +
                    "} GROUP BY ?endpoint ORDER BY DESC( ?datasetDesc) ");
            Resource classListExample = result.getDefaultModel().createResource();
            result.getDefaultModel().add(catalogRoot, SKOS.example, classListExample);
            result.getDefaultModel().add(classListExample, DCTerms.description, "List of classes per KB.");
            result.getDefaultModel().add(classListExample, DCTerms.subject, "PREFIX void: <http://rdfs.org/ns/void#> " +
                    "PREFIX dcat: <http://www.w3.org/ns/dcat#> " +
                    "PREFIX earl: <http://www.w3.org/ns/earl#> " +
                    "PREFIX kgi: <http://ns.inria.fr/kg/index#> " +
                    "PREFIX voidex: <http://ldf.fi/void-ext#> " +
                    "SELECT ?datasetDesc ?endpoint ?class WHERE { " +
                    "?datasetDesc a  dcat:Dataset . " +
                    "?datasetDesc void:sparqlEndpoint ?endpoint . " +
                    "?datasetDesc void:classPartition ?partition . " +
                    "?partition void:class ?class . " +
                    "} GROUP BY ?endpoint  ORDER BY DESC( ?datasetDesc) ");
            Resource classTriplesExample = result.getDefaultModel().createResource();
            result.getDefaultModel().add(catalogRoot, SKOS.example, classTriplesExample);
            result.getDefaultModel().add(classTriplesExample, DCTerms.description, "Number of triples per class per KB.");
            result.getDefaultModel().add(classTriplesExample, DCTerms.subject, "PREFIX void: <http://rdfs.org/ns/void#> " +
                    "PREFIX dcat: <http://www.w3.org/ns/dcat#> " +
                    "PREFIX earl: <http://www.w3.org/ns/earl#> " +
                    "PREFIX kgi: <http://ns.inria.fr/kg/index#> " +
                    "PREFIX voidex: <http://ldf.fi/void-ext#> " +
                    "SELECT ?datasetDesc ?endpoint ?class ?triples WHERE { " +
                    "?datasetDesc a  dcat:Dataset . " +
                    "?datasetDesc void:sparqlEndpoint ?endpoint . " +
                    "?datasetDesc void:classPartition ?partition . " +
                    "?partition void:class ?class . " +
                    "?partition void:triples ?triples . " +
                    "} GROUP BY ?endpoint ORDER BY DESC( ?datasetDesc) ");
            Resource classClassesExample = result.getDefaultModel().createResource();
            result.getDefaultModel().add(catalogRoot, SKOS.example, classClassesExample);
            result.getDefaultModel().add(classClassesExample, DCTerms.description, "Number of classes used conjointly per class per KB.");
            result.getDefaultModel().add(classClassesExample, DCTerms.subject, "PREFIX void: <http://rdfs.org/ns/void#> " +
                    "PREFIX dcat: <http://www.w3.org/ns/dcat#> " +
                    "PREFIX earl: <http://www.w3.org/ns/earl#> " +
                    "PREFIX kgi: <http://ns.inria.fr/kg/index#> " +
                    "PREFIX voidex: <http://ldf.fi/void-ext#> " +
                    "SELECT ?datasetDesc ?endpoint ?class ?triples WHERE { " +
                    "?datasetDesc a  dcat:Dataset . " +
                    "?datasetDesc void:sparqlEndpoint ?endpoint . " +
                    "?datasetDesc void:classPartition ?partition . " +
                    "?partition void:class ?class . " +
                    "?partition void:classes ?triples . " +
                    "} GROUP BY ?endpoint ORDER BY DESC( ?datasetDesc) ");

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
                        datasetName = URLEncoder.encode(querySolution.get("?datasetName").toString(), StandardCharsets.UTF_8.toString());;
                    }
                    logger.trace("START dataset " + datasetName + " " + datasetUri + " : " + endpointUrl);

                    // Faire l'extraction de description selon nos regles
                    Path tmpDatasetDescFile = Files.createTempFile(null, ".trig");

                    DescribedDataset describedDataset = new DescribedDataset(endpointUrl, datasetName);
                    describedDataset.setDatasetDescriptionResource(result.getDefaultModel().createResource(datasetUri));
                    result.getDefaultModel().add(catalogRoot, DCAT.dataset, describedDataset.getDatasetDescriptionResource());
                    DatasetDescriptionExtraction.extractIndexDescriptionForDataset(describedDataset, tmpDatasetDescFile.toString());
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
