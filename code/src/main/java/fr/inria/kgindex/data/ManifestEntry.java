package fr.inria.kgindex.data;

import fr.inria.kgindex.step.QueryTestExecution;
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
	private Set<Model> _actions = null;
	private Set<Model> _tests = null;
	private Resource _testResource = null;
	private String _title = "";
	private Set<Resource> _requirements = null;

	public ManifestEntry(Resource fileResource, Model action, Resource testResource, Model test) {
		this._fileResource = fileResource;
		this._actions = new HashSet<Model>(Collections.singleton(action));
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

	public Set<Model> getActions() {
		return this._actions;
	}

	public void addAction(Model action) {
		this._actions.add(action);
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

		return new ArrayList<RDFNode>(result);
	}

	/**
	 * Extract manifest entries (action from the manifest file and test from the test file) described in a manifest.
	 * @param manifest
	 * @return
	 */
	public static Set<fr.inria.kgindex.data.ManifestEntry> extractEntriesFromManifest(Model manifest) {
		HashSet<ManifestEntry> result = new HashSet<ManifestEntry>();

		NodeIterator entries = manifest.listObjectsOfProperty(Manifest.entries);
		List<RDFNode> includedManifestList = new ArrayList<>();
		while(entries.hasNext()) {
			RDFNode testEntriesList = entries.next();

			includedManifestList.addAll(testEntriesList.as(RDFList.class).asJavaList());
		}

		includedManifestList.forEach(testEntry -> {
			StmtIterator testStmtIterator = manifest.listStatements(testEntry.asResource(), (Property)null, (RDFNode)null);
			List<Statement> testStatement = testStmtIterator.toList();
			Model actionModel = ModelFactory.createDefaultModel();
			actionModel.add(testStatement);

			Model kgiVocabulary = ModelFactory.createDefaultModel();
			kgiVocabulary.read("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/dekalog_vocabulary.ttl", "TTL");
			InfModel testModelWithInference = ModelFactory.createRDFSModel(kgiVocabulary);
			Model testModel = ModelFactory.createDefaultModel();
			testModel.read(testEntry.toString(), "TTL");
			testModelWithInference.add(testModel);

			ResIterator testResourceIterator = testModelWithInference.listSubjectsWithProperty(RDF.type, EARL.TestCase);
			testResourceIterator.forEach(testResource -> {
				Model tmpTestModel = ModelFactory.createDefaultModel();
				tmpTestModel.add(testModel);
				ManifestEntry resultEntry = new ManifestEntry(testEntry.asResource(), actionModel, testResource, tmpTestModel);

				NodeIterator requiresIterator = testModelWithInference.listObjectsOfProperty(DCTerms.requires);
				requiresIterator.forEach(requiredTest -> {
					Resource required = requiredTest.asResource();
					resultEntry.addRequirement(required);
				});
				result.add(resultEntry);
			});
		});
		return result;
	}

	public int hashCode() {
		return (this._fileResource.getURI() + this._testResource.getURI()).hashCode();
	}
}
