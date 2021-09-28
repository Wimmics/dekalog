<<<<<<< HEAD:code/src/main/java/fr/inria/kgindex/main/MainClass.java
package fr.inria.kgindex.main;

import fr.inria.kgindex.main.data.Dataset;
import fr.inria.kgindex.main.data.ManifestEntry;
import fr.inria.kgindex.main.data.RuleLibrary;
import fr.inria.kgindex.main.rules.RuleApplication;
import fr.inria.kgindex.main.rules.RuleFactory;
import fr.inria.kgindex.main.util.SPARQL_SD;
import fr.inria.kgindex.main.util.Utils;
=======
package fr.inria.kgindex;

import fr.inria.kgindex.data.DescribedDataset;
import fr.inria.kgindex.data.ManifestEntry;
import fr.inria.kgindex.data.RuleLibrary;
import fr.inria.kgindex.rules.RuleApplication;
import fr.inria.kgindex.rules.RuleFactory;
import fr.inria.kgindex.util.DatasetUtils;
import fr.inria.kgindex.util.SPARQL_SD;
import fr.inria.kgindex.util.Utils;
>>>>>>> ModelToDataset:code/src/main/java/fr/inria/kgindex/MainClass.java
import org.apache.commons.cli.*;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.NodeIterator;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.VOID;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class MainClass {

	private static final Logger logger = LogManager.getLogger(MainClass.class);

	private static final String OPT_NAME = "name";
	private static final String OPT_ENDPOINT = "endpoint";
	private static final String OPT_TIMEOUT = "timeout";
	private static final String OPT_OUTPUT = "output";
	private static final String OPT_FEDERATION = "federation";
	private static final String OPT_MANIFEST = "manifest";
	private static final String OPT_HELP = "help";

	public static void main(String[] args) {
		Options options = new Options();
		options.addOption(Option.builder(OPT_NAME)
				.required(true)
				.hasArg()
				.desc("Name of the KB. Used for filenames and resources prefixing.")
				.build());
		options.addOption(Option.builder(OPT_ENDPOINT)
				.required(true)
				.hasArg()
				.desc("URL of the endpoint of the KB.")
				.build());
		options.addOption(Option.builder(OPT_TIMEOUT)
				.required(false)
				.hasArg()
				.desc("Timeout for all queries in milliseconds. Default is 30000.")
				.build());
		options.addOption(Option.builder(OPT_OUTPUT)
				.required(false)
				.hasArg()
				.desc("Output filename. Default is 'kbMetadata[name].ttl'.")
				.build());
		options.addOption(Option.builder(OPT_FEDERATION)
				.required(false)
				.hasArg()
				.desc("SPARQL endpoint URL to a federation server used in rules for the generation. If none is given, rules using the kgi:federated endpoint will not be executed.")
				.build());
		options.addOption(Option.builder(OPT_MANIFEST)
				.required(false)
				.hasArg()
				.desc("Root manifest file of the generation rules. Default is https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl")
				.build());
		options.addOption(Option.builder(OPT_HELP)
				.required(false)
				.desc("Print this message.")
				.build());

		CommandLineParser parser = new DefaultParser();
		try {
			CommandLine cmd = parser.parse( options, args);
			if(cmd.hasOption(OPT_HELP)) {
				HelpFormatter formatter = new HelpFormatter();
				formatter.printHelp( "kgindex", options );
				return ;
			}
			if(cmd.hasOption(OPT_TIMEOUT)) {
				String queryTimeoutString = cmd.getOptionValue(OPT_TIMEOUT, "30000");
				Utils.queryTimeout = Long.parseLong(queryTimeoutString);
			}
			String manifestRootFile = "https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl";
			if(cmd.hasOption(OPT_MANIFEST)) {
				manifestRootFile = cmd.getOptionValue(OPT_MANIFEST, "https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl");
			}

			if(cmd.hasOption(OPT_FEDERATION)) {
				RuleApplication.federationserver = cmd.getOptionValue(OPT_FEDERATION, null);
			}

			 // On a besoin d'un nom de dataset en plus de l'URL pour préfixer les fichiers et URLs générés

			String endpointUrl = cmd.getOptionValue(OPT_ENDPOINT);
			String datasetName = cmd.getOptionValue(OPT_NAME);

			String outputFilename = "kbMetadata"+ datasetName +".trig";
			if(cmd.hasOption(OPT_OUTPUT)) {
				outputFilename = cmd.getOptionValue(OPT_OUTPUT, "kbMetadata"+ datasetName +".trig");
			}

			DescribedDataset describedDataset = new DescribedDataset(endpointUrl, datasetName);

			Model manifestModel = ModelFactory.createDefaultModel();
			manifestModel.read(manifestRootFile, "TRIG");

			Dataset datasetDescription = DatasetFactory.create();

			List<RDFNode> manifestList = ManifestEntry.extractIncludedFromManifest(manifestModel);

			Model includedManifestModel = ModelFactory.createDefaultModel();
			manifestList.forEach( included -> {
				Model tmpManifestModel = ModelFactory.createDefaultModel();
				tmpManifestModel.read(included.toString(), "TRIG");
				includedManifestModel.add(tmpManifestModel);
				tmpManifestModel.close();
			});

			RuleLibrary.getLibrary().putAll(ManifestEntry.extractEntriesFromManifest(includedManifestModel));
			List<RDFNode> testList = ManifestEntry.extractEntriesList(includedManifestModel);

			// Application des règles pour chaque ManifestEntry
			for (RDFNode testNode : testList) {
				Set<ManifestEntry> testEntrySet = RuleLibrary.getLibrary().get(testNode);

				for (ManifestEntry testEntry : testEntrySet) {
					RuleApplication application = RuleFactory.create(testEntry, describedDataset, datasetDescription);
					Dataset testResult = application.apply();
					datasetDescription = DatasetUtils.addDataset(datasetDescription, testResult);

					// Keeping the list of the dataset namespaces up to date
					if (describedDataset.getNamespaces().isEmpty()
							&& (datasetDescription.getUnionModel().contains(describedDataset.getDatasetDescriptionResource(), VOID.uriSpace)
							|| datasetDescription.getUnionModel().contains(describedDataset.getDatasetDescriptionResource(), VOID.uriRegexPattern))) {
						NodeIterator namespaceIt = null;
						if (datasetDescription.getUnionModel().contains(describedDataset.getDatasetDescriptionResource(), VOID.uriSpace)) {
							namespaceIt = datasetDescription.getUnionModel().listObjectsOfProperty(describedDataset.getDatasetDescriptionResource(), VOID.uriSpace);
						}
						if (datasetDescription.getUnionModel().contains(describedDataset.getDatasetDescriptionResource(), VOID.uriRegexPattern)) {
							namespaceIt = datasetDescription.getUnionModel().listObjectsOfProperty(describedDataset.getDatasetDescriptionResource(), VOID.uriRegexPattern);
						}

						assert namespaceIt != null;
						describedDataset.addNamespaces(namespaceIt.toList()
								.stream()
								.map(RDFNode::toString)
								.collect(Collectors.toList()));
					}

					// Checking if the graph list is necessary according to the endpoint description
					if (!datasetDescription.getUnionModel().contains(describedDataset.getEndpointDescriptionResource(), SPARQL_SD.feature, SPARQL_SD.UnionDefaultGraph)
							&& datasetDescription.getUnionModel().contains(describedDataset.getEndpointDescriptionResource(), SPARQL_SD.feature, SPARQL_SD.RequiresDataset)) {
						describedDataset.setGraphsAreRequired(true);
					}
				}
				;
			};

			try {
				OutputStream outputStream = new FileOutputStream(outputFilename);
				RDFDataMgr.write(outputStream, datasetDescription, Lang.TRIG);
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}

			manifestModel.close();
			datasetDescription.close();
		} catch (ParseException e1) {
			HelpFormatter formatter = new HelpFormatter();
			formatter.printHelp( "kgindex", options );
		}
	}

}
