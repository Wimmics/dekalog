package fr.inria.kgindex;

import fr.inria.kgindex.data.Dataset;
import fr.inria.kgindex.data.ManifestEntry;
import fr.inria.kgindex.step.InteractionApplication;
import fr.inria.kgindex.step.InteractionFactory;
import fr.inria.kgindex.util.*;
import org.apache.commons.cli.*;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.VOID;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.*;
import java.util.stream.Collectors;

public class MainClass {

	private static final Logger logger = LogManager.getLogger(MainClass.class);

	public static void main(String[] args) {
		Options options = new Options();
		options.addOption(Option.builder("name")
				.required(true)
				.hasArg()
				.desc("Name of the KB. Used for filenames and resources prefixing.")
				.build());
		options.addOption(Option.builder("endpoint")
				.required(true)
				.hasArg()
				.desc("URL of the endpoint of the KB.")
				.build());
		options.addOption(Option.builder("timeout")
				.required(false)
				.hasArg()
				.desc("Timeout for all queries in milliseconds. Default is 30000.")
				.build());
		options.addOption(Option.builder("manifest")
				.required(false)
				.hasArg()
				.desc("Root manifest file of the generation rules. Default is https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl")
				.build());
		options.addOption(Option.builder("help")
				.required(false)
				.desc("Print this message.")
				.build());

		CommandLineParser parser = new DefaultParser();
		try {
			CommandLine cmd = parser.parse( options, args);
			if(cmd.hasOption("help")) {
				HelpFormatter formatter = new HelpFormatter();
				formatter.printHelp( "kgindex", options );
				return ;
			}
			if(cmd.hasOption("timeout")) {
				String queryTimeoutString = cmd.getOptionValue("timeout", "30000");
				long tmpQueryTimeout = Long.parseLong(queryTimeoutString);
				Utils.queryTimeout = tmpQueryTimeout;
			}
			String manifestRootFile = "https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl";
			if(cmd.hasOption("manifest")) {
				String manifestString = cmd.getOptionValue("manifest", "https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl");
				manifestRootFile = manifestString;
			}

			/*
			 * On a besoin d'un nom de dataset en plus de l'URL pour préfixer les fichiers et URLs générés
			 */
			String endpointUrl = cmd.getOptionValue("endpoint");
			String datasetName = cmd.getOptionValue("name");
			Dataset describedDataset = new Dataset(endpointUrl, datasetName);

			Model manifestModel = ModelFactory.createDefaultModel();
			manifestModel.read(manifestRootFile, "TTL");

			Model datasetDescription = ModelFactory.createDefaultModel();

			List<RDFNode> manifestList = ManifestEntry.extractIncludedFromManifest(manifestModel);
			manifestList.forEach( included -> {
				Model includedManifestModel = ModelFactory.createDefaultModel();
				includedManifestModel.read(included.toString(), "TTL");

				// TODO Gérer dépendances entre tests -> Ordonnancement des tests
				Set<ManifestEntry> testList = ManifestEntry.extractEntriesFromManifest(includedManifestModel);
				testList.forEach(testEntry -> {
					InteractionApplication application = InteractionFactory.create(testEntry, describedDataset, datasetDescription);
					Model testResult = application.apply();
					datasetDescription.add(testResult);

					// Keeping the list of the dataset namespaces up to date
					if(describedDataset.getNamespaces().isEmpty()
							&& (datasetDescription.contains(describedDataset.getDatasetDescriptionResource(), VOID.uriSpace)
							|| datasetDescription.contains(describedDataset.getDatasetDescriptionResource(), VOID.uriRegexPattern))) {
						NodeIterator namespaceIt = null;
						if(datasetDescription.contains(describedDataset.getDatasetDescriptionResource(), VOID.uriSpace)) {
							namespaceIt = datasetDescription.listObjectsOfProperty(describedDataset.getDatasetDescriptionResource(), VOID.uriSpace);
						}
						if(datasetDescription.contains(describedDataset.getDatasetDescriptionResource(), VOID.uriRegexPattern)) {
							namespaceIt = datasetDescription.listObjectsOfProperty(describedDataset.getDatasetDescriptionResource(), VOID.uriRegexPattern);
						}

						describedDataset.addNamespaces( namespaceIt.toList()
								.stream()
								.map(node -> node.toString())
								.collect(Collectors.toList()));
					}

					// Checking if the graph list is necessary according to the endpoint description
					if(! datasetDescription.contains(describedDataset.getEndpointDescriptionResource(), SPARQL_SD.feature, SPARQL_SD.UnionDefaultGraph)
							&& datasetDescription.contains(describedDataset.getEndpointDescriptionResource(), SPARQL_SD.feature, SPARQL_SD.RequiresDataset)) {
						describedDataset.setGraphsAreRequired(true);
					}
				});

				includedManifestModel.close();
			});


			try {
				OutputStream outputStream = new FileOutputStream("kbMetadata"+ datasetName +".ttl");
				datasetDescription.write(outputStream, "TURTLE");
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
