package fr.inria.kgindex.main.data;

import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.Manifest;
import fr.inria.kgindex.main.util.Utils;
import org.apache.jena.atlas.web.HttpException;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RiotException;
import org.apache.jena.sparql.vocabulary.EARL;
import org.apache.jena.vocabulary.RDF;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

public class ManifestEntry {

	private static Logger logger = LogManager.getLogger(ManifestEntry.class);

	private Resource _fileResource = null;
	private HashMap<RDFNode, Model> _actionsSuccess = null;
	private HashMap<RDFNode, Model> _actionsFailure = null;
	private Set<Model> _tests = null;
	private Resource _testResource = null;
	private String _title = "";

	public ManifestEntry(Resource fileResource, HashMap<RDFNode, Model> successActions, HashMap<RDFNode, Model> failureActions, Resource testResource, Model test) {
		this._fileResource = fileResource;
		this._actionsSuccess = successActions;
		this._actionsFailure = failureActions;
		this._tests = new HashSet<>(Collections.singleton(test));
		this._testResource = testResource;
	}

	public String getTitle() {
		return this._title;
	}

	public void setTitle(String title) {
		this._title = title;
	}

	public Resource getFileResource() {
		return this._fileResource;
	}

	public void setFileResource(Resource fileResource) {
		this._fileResource = fileResource;
	}

	public Resource getTestResource() {
		return this._testResource;
	}

	public void setTestResource(Resource testResource) {
		this._testResource = testResource;
	}

	public HashMap<RDFNode, Model> getActionsOnSuccess() {
		return this._actionsSuccess;
	}

	public HashMap<RDFNode, Model> getActionsOnFailure() {
		return this._actionsFailure;
	}

	public void addActionOnSuccess(RDFNode actionNode, Model action) {
		this._actionsSuccess.put(actionNode, action);
	}

	public void addActionOnFailure(RDFNode actionNode, Model action) {
		this._actionsFailure.put(actionNode, action);
	}

	public Set<Model> getTests() {
		return this._tests;
	}

	public void addTest(Model test) {
		this._tests.add(test);
	}

	@Override
	public String toString() {
		return this._fileResource.toString();
	}

	public void close() {
		this._actionsFailure.forEach((key, value) -> value.close());
		this._actionsSuccess.forEach((key, value) -> value.close());
	}

	/**
	 * Extract all the manifests in a hierarchy, starting from a root manifest given.
	 * @param manifest
	 * @return List of sub-manifests, including the parent manifest.
	 */
	public static List<RDFNode> extractIncludedFromManifest(Model manifest) {
		HashSet<RDFNode> result = new HashSet<RDFNode>();
		ArrayList<RDFNode> tmpList = new ArrayList<RDFNode>();

		ResIterator manifestIterator = manifest.listSubjectsWithProperty(RDF.type, Manifest.Manifest);
		manifestIterator.forEach(tmpList::add);

		NodeIterator included = manifest.listObjectsOfProperty(Manifest.include);
		while(included.hasNext()) {
			RDFNode manifestIncluded = included.next();

			List<RDFNode> includedManifestList = manifestIncluded.as(RDFList.class).asJavaList();
			result.addAll(includedManifestList);
		}

		result.forEach(modelUri -> {
			Model includedSubManifestModel = ModelFactory.createDefaultModel();
			try{
				includedSubManifestModel.read(modelUri.toString(), "TTL");
				tmpList.addAll(extractIncludedFromManifest(includedSubManifestModel));
			} catch(HttpException e) {
				logger.error(e);
				logger.error(modelUri.toString() + " could not be reached");
			} catch(Exception e) {
				logger.error(e);
				logger.error(modelUri.toString());
				throw e;
			}

			includedSubManifestModel.close();
		});
		result.addAll(tmpList);

		return new ArrayList<>(result);
	}

	public static List<RDFNode> extractEntriesList(Model manifest) {
		ArrayList<RDFNode> result = new ArrayList<>();

		ResIterator explicitManifestIt = manifest.listResourcesWithProperty(RDF.type, Manifest.Manifest);
		explicitManifestIt.forEach(rootManifest -> {
			StmtIterator manifestRootEntryStatement = manifest.listStatements(rootManifest, Manifest.entries, (RDFNode) null);
			manifestRootEntryStatement.forEach(statement -> {
				List<RDFNode> entryList = statement.getObject().as(RDFList.class).asJavaList();
				result.addAll(entryList);
			});
		});

		return result;
	}

	/**
	 * Extract manifest entries (action from the manifest file and test from the test file) described in a manifest.
	 * @param manifest
	 * @return
	 */
	public static Map<RDFNode, Set<ManifestEntry> > extractEntriesFromManifest(Model manifest) {
		Map<RDFNode, Set<ManifestEntry> > result = new HashMap<>();

		List<RDFNode> includedManifestList = new ArrayList<>();
		ResIterator manifestEntries = manifest.listSubjectsWithProperty(RDF.type, Manifest.Manifest);
		while(manifestEntries.hasNext()) {
			Resource manifestEntry = manifestEntries.nextResource();
			NodeIterator entries = manifest.listObjectsOfProperty(manifestEntry, Manifest.entries);
			while(entries.hasNext()) {
				RDFNode testEntriesList = entries.next();

				includedManifestList.addAll(testEntriesList.as(RDFList.class).asJavaList());
			}
		}

		includedManifestList.forEach(testEntry -> result.putAll(extractEntryFromManifest(testEntry.asResource(), manifest)));
		return result;
	}

	private static Map<RDFNode, Set<ManifestEntry> > extractEntryFromManifest(Resource entryName, Model manifest) {
		HashMap<RDFNode, Set<ManifestEntry> > result = new HashMap<>();

		try {
			// Extraction des action onSuccess pour l'entrée courante
			HashMap<RDFNode, Model> successActionModelSet = new HashMap<>();
			List<RDFNode> successActionResources = manifest.listObjectsOfProperty(entryName, KGIndex.onSuccess).toList();
			successActionResources.forEach(successActionResource -> {
				List<RDFNode> successActionResourceList = successActionResource.as(RDFList.class).asJavaList(); // Objet de onSuccess est une RDFList
				successActionResourceList.forEach(entryListNode -> {
					Model tmpSuccessActionSet = extractActionModel(entryListNode, manifest);
					successActionModelSet.put(entryListNode, extractActionModel(entryListNode, tmpSuccessActionSet));

					// On ajoute les renvois d'entrées à la liste des manifest extraits
					if (entryListNode.isResource() && !entryListNode.isAnon()) {
						result.putAll(extractEntryFromManifest(entryListNode.asResource(), manifest));
						successActionModelSet.put(entryListNode, ModelFactory.createDefaultModel());
					}
				});
			});

			// Extraction des action onFailure pour l'entrée courante
			HashMap<RDFNode, Model> failureActionModelSet = new HashMap<>();
			NodeIterator failureActionResources = manifest.listObjectsOfProperty(entryName, KGIndex.onFailure);
			failureActionResources.forEach(failureActionResource -> {
				List<RDFNode> failureActionResourceList = failureActionResource.as(RDFList.class).asJavaList();
				failureActionResourceList.forEach(entryListNode -> {
					Model tmpSuccessActionSet = extractActionModel(entryListNode, manifest);
					failureActionModelSet.put(entryListNode, extractActionModel(entryListNode, tmpSuccessActionSet));

					// On ajoute les renvois d'entrées à la liste des manifest extraits
					if (entryListNode.isResource() && !entryListNode.isAnon()) {
						result.putAll(extractEntryFromManifest(entryListNode.asResource(), manifest));
					}
				});
			});

			// Traitement du fichier du test associé à l'entrée
			Model kgiVocabulary = ModelFactory.createDefaultModel();
			try {
				kgiVocabulary.read(Utils.vocabularyFile, "TTL");
			} catch(HttpException e) {
				logger.error(e);
				logger.error(Utils.vocabularyFile + " could not be reached");
			} catch(Exception e) {
				logger.error(e);
				logger.error("Error reading vocabulary file");
				throw e;
			}
			InfModel testModelWithInference = ModelFactory.createRDFSModel(kgiVocabulary);
			Model testModel = ModelFactory.createDefaultModel();
			try{
				testModel.read(entryName.getURI(), "TTL");
			} catch(HttpException e) {
				logger.error(e);
				logger.error(entryName.getURI() + " could not be reached");
			}
			testModelWithInference.add(testModel);

			ResIterator testResourceIterator = testModelWithInference.listSubjectsWithProperty(RDF.type, EARL.TestCase);
			HashSet<ManifestEntry> entrySet = new HashSet<>();
			testResourceIterator.forEach(testResource -> {
				Model tmpTestModel = ModelFactory.createDefaultModel();
				tmpTestModel.add(testModel);
				ManifestEntry resultEntry = new ManifestEntry(entryName, successActionModelSet, failureActionModelSet, testResource, tmpTestModel);
				entrySet.add(resultEntry);
			});
			result.put(entryName, entrySet);
			testModel.close();
			testModelWithInference.close();

		} catch (RiotException e) {
			logger.error(e);
			logger.debug(entryName.getURI());
			throw e;
		}

		return result;
	}

	private static Model extractActionModel(RDFNode actionNode, Model manifest) {
		Model actionModel = ModelFactory.createDefaultModel();
		StmtIterator actionBNIt = manifest.listStatements(actionNode.asResource(), null, (RDFNode)null);
		List<Statement> actionStatementList = actionBNIt.toList();
		actionModel.add(actionStatementList);

		return actionModel;
	}

	@Override
	public int hashCode() {
		return (this._fileResource.getURI() + this._testResource.getURI()).hashCode();
	}
}
