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
				Utils.queryTimeout = Long.parseLong(queryTimeoutString);
			}
			String manifestRootFile = "https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl";
			if(cmd.hasOption("manifest")) {
				manifestRootFile = cmd.getOptionValue("manifest", "https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/manifest.ttl");
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
			// Ordonnancement des tests par requirements, nombre de requirements, nombre d'actions et noms
			TreeSet<ManifestEntry> sortedTestList = new TreeSet<>((o1, o2) -> {
				if (o1.requires(o2.getTestResource())) {
					return 1;
				} else if (o2.requires(o1.getTestResource())) {
					return -1;
				} else if (o1.getRequirements().size() != o2.getRequirements().size()) {
					return o1.getRequirements().size() - o2.getRequirements().size();
				} else if ((o1.getActionsOnSuccess().size() + o1.getActionsOnFailure().size()) != (o2.getActionsOnSuccess().size() + o2.getActionsOnFailure().size())) {
					return (o1.getActionsOnSuccess().size() + o1.getActionsOnFailure().size()) - (o2.getActionsOnSuccess().size() + o2.getActionsOnFailure().size());
				} else {
					return o1.getFileResource().getURI().compareTo(o2.getFileResource().getURI());
				}
			});

			Model includedManifestModel = ModelFactory.createDefaultModel();
			manifestList.forEach( included -> {
				Model tmpManifestModel = ModelFactory.createDefaultModel();
				tmpManifestModel.read(included.toString(), "TTL");
				includedManifestModel.add(tmpManifestModel);
				tmpManifestModel.close();
			});

			Set<ManifestEntry> testList = ManifestEntry.extractEntriesFromManifest(includedManifestModel);
			sortedTestList.addAll(testList);

			// Application des règles pour chaque ManifestEntry, triés en fonction de leurs pré-requis
			sortedTestList.forEach(testEntry -> {
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

					assert namespaceIt != null;
					describedDataset.addNamespaces( namespaceIt.toList()
							.stream()
							.map(RDFNode::toString)
							.collect(Collectors.toList()));
				}

				// Checking if the graph list is necessary according to the endpoint description
				if(! datasetDescription.contains(describedDataset.getEndpointDescriptionResource(), SPARQL_SD.feature, SPARQL_SD.UnionDefaultGraph)
						&& datasetDescription.contains(describedDataset.getEndpointDescriptionResource(), SPARQL_SD.feature, SPARQL_SD.RequiresDataset)) {
					describedDataset.setGraphsAreRequired(true);
				}
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
