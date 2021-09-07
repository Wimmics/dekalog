package fr.inria.kgindex.data;

import fr.inria.kgindex.util.KGIndex;
import fr.inria.kgindex.util.Manifest;
import org.apache.jena.rdf.model.*;
import org.apache.jena.sparql.vocabulary.EARL;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDF;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.util.stream.Collectors;

public class ManifestEntry {

	private static Logger logger = LogManager.getLogger(ManifestEntry.class);

	private Resource _fileResource = null;
	private Set<Model> _actionsSuccess = null;
	private Set<Model> _actionsFailure = null;
	private Set<Model> _tests = null;
	private Resource _testResource = null;
	private String _title = "";
	private Set<Resource> _requirements = null;

	public ManifestEntry(Resource fileResource, Set<Model> successActions, Set<Model> failureActions, Resource testResource, Model test) {
		this._fileResource = fileResource;
		this._actionsSuccess = successActions;
		this._actionsFailure = failureActions;
		this._tests = new HashSet<Model>(Collections.singleton(test));
		this._testResource = testResource;
		this._requirements = new HashSet<Resource>();
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

	public Set<Model> getActionsOnSuccess() {
		return this._actionsSuccess;
	}

	public Set<Model> getActionsOnFailure() {
		return this._actionsFailure;
	}

	public void addActionOnSuccess(Model action) {
		this._actionsSuccess.add(action);
	}

	public void addActionOnFailure(Model action) {
		this._actionsFailure.add(action);
	}

	public Set<Model> getTests() {
		return this._tests;
	}

	public void addTest(Model test) {
		this._tests.add(test);
	}

	public Set<Resource> getRequirements() { return this._requirements; }

	public void addRequirement(Resource res) { this._requirements.add(res); }

	public void addRequirements(Collection<Resource> resColl) { this._requirements.addAll(resColl); }

	public boolean requires(Resource testRes) {
		this.getRequirements().stream().map(Resource::getURI).collect(Collectors.toSet()).contains(testRes.getURI());
		return this._requirements.contains(testRes);
	}

	@Override
	public String toString() {
		return this._fileResource.toString();
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

			includedSubManifestModel.read(modelUri.toString(), "TTL");
			tmpList.addAll(extractIncludedFromManifest(includedSubManifestModel));

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

		// Extraction des action onSuccess pour l'entrée courante
		HashSet<Model> successActionModelSet = new HashSet<>();
		NodeIterator successActionResources = manifest.listObjectsOfProperty(entryName, KGIndex.onSuccess);
		successActionResources.forEach(successActionResource -> {
			Set<Model> tmpSuccessActionSet = extractActionModel(successActionResource, manifest);

			// On ajoute les renvois d'entrées à la liste des manifest extraits
			tmpSuccessActionSet.forEach(tmpModel -> {
				if(tmpModel.contains(null, Manifest.entries, (RDFNode)null)) {
					NodeIterator itEntries = tmpModel.listObjectsOfProperty(Manifest.entries);
					itEntries.forEach(entryListNode ->{
						List<RDFNode> entryFollowupActionList = entryListNode.as(RDFList.class).asJavaList();
						entryFollowupActionList.forEach(node -> {
							result.putAll(extractEntryFromManifest(node.asResource(), manifest));
						});
					});
				}
			});

			successActionModelSet.addAll(extractActionModel(successActionResource, manifest));
		});
		// Extraction des action onFailure pour l'entrée courante
		HashSet<Model> failureActionModelSet = new HashSet<>();
		NodeIterator failureActionResources = manifest.listObjectsOfProperty(entryName, KGIndex.onFailure);
		failureActionResources.forEach(failureActionResource -> {
			Set<Model> tmpFailureActionSet = extractActionModel(failureActionResource, manifest);

			// On ajoute les renvois d'entrées à la liste des manifest extraits
			tmpFailureActionSet.forEach(tmpModel -> {
				if(tmpModel.contains(null, Manifest.entries, (RDFNode)null)) {
					NodeIterator itEntries = tmpModel.listObjectsOfProperty(Manifest.entries);
					itEntries.forEach(entryListNode ->{
						List<RDFNode> entryfollowupActionList = entryListNode.as(RDFList.class).asJavaList();
						entryfollowupActionList.forEach(node -> {
							result.putAll(extractEntryFromManifest(node.asResource(), manifest));
						});
					});
				}
			});

			failureActionModelSet.addAll(tmpFailureActionSet);
		});

		// Traitement du fichier du test associé à l'entrée
		Model kgiVocabulary = ModelFactory.createDefaultModel();
		kgiVocabulary.read("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/dekalog_vocabulary.ttl", "TTL");
		InfModel testModelWithInference = ModelFactory.createRDFSModel(kgiVocabulary);
		Model testModel = ModelFactory.createDefaultModel();
		testModel.read(entryName.getURI().toString(), "TTL");
		testModelWithInference.add(testModel);

		ResIterator testResourceIterator = testModelWithInference.listSubjectsWithProperty(RDF.type, EARL.TestCase);
		HashSet<ManifestEntry> entrySet = new HashSet<>();
		testResourceIterator.forEach(testResource -> {
			Model tmpTestModel = ModelFactory.createDefaultModel();
			tmpTestModel.add(testModel);
			ManifestEntry resultEntry = new ManifestEntry(entryName, successActionModelSet, failureActionModelSet, testResource, tmpTestModel);

			NodeIterator requiresIterator = testModelWithInference.listObjectsOfProperty(DCTerms.requires);
			requiresIterator.forEach(requiredTest -> {
				Resource required = requiredTest.asResource();
				resultEntry.addRequirement(required);
			});
			entrySet.add(resultEntry);
		});
		result.put(entryName, entrySet);

		return result;
	}

	private static Set<Model> extractActionModel(RDFNode actionNodeList, Model manifest) {
		HashSet<Model> actionModelSet = new HashSet<>();
		List<RDFNode> actionBNList = actionNodeList.as(RDFList.class).asJavaList();
		actionBNList.forEach(actionBN -> {
			Model actionModel = ModelFactory.createDefaultModel();
			StmtIterator actionBNIt = manifest.listStatements(actionBN.asResource(), null, (RDFNode)null);
			List<Statement> actionStatementList = actionBNIt.toList();
			actionModel.add(actionStatementList);
			// Si l'action contient une list d'entrées
			actionStatementList.forEach(stmt -> {
				if((! stmt.getObject().isLiteral())) {
					actionModel.add(manifest.listStatements(stmt.getObject().asResource(), null, (RDFNode)null));
				}
			});
			actionModelSet.add(actionModel);
		});
		return actionModelSet;
	}

	public int hashCode() {
		return (this._fileResource.getURI() + this._testResource.getURI()).hashCode();
	}
}
