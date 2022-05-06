package fr.inria.kgindex.main;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.ManifestEntry;
import fr.inria.kgindex.main.data.RuleLibrary;
import fr.inria.kgindex.main.rules.InteractionApplication;
import fr.inria.kgindex.main.rules.InteractionFactory;
import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.SPARQL_SD;
import fr.inria.kgindex.main.util.Utils;
import org.apache.jena.query.Dataset;
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

public class DatasetDescriptionExtraction {

	private static final Logger logger = LogManager.getLogger(DatasetDescriptionExtraction.class);

	public static void extractIndexDescriptionForDataset(String endpointUrl, String outputFilename) {
		DescribedDataset describedDataset = new DescribedDataset(endpointUrl);
		extractIndexDescriptionForDataset(describedDataset, outputFilename);
		describedDataset.close();
	}

	public static void extractIndexDescriptionForDataset(DescribedDataset describedDataset, String outputFilename) {
		Model manifestModel = ModelFactory.createDefaultModel();
		manifestModel.read(Utils.manifestRootFile, "TRIG");

		Dataset datasetDescription = KGIndex.getResultDataset();

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
				try {
					InteractionApplication application = InteractionFactory.create(testEntry, describedDataset, datasetDescription);
					application.apply();
					logger.trace("Result update START");

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
					logger.trace("Result update END");
				} catch (Exception e) {
					logger.error(testEntry.getTestResource().getURI());
					logger.error(e);
				}
			}
		}

		try {
			OutputStream outputStream = new FileOutputStream(outputFilename);
			RDFDataMgr.write(outputStream, datasetDescription, Lang.TRIG);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		includedManifestModel.close();
		manifestModel.close();
		datasetDescription.close();
	}

}
