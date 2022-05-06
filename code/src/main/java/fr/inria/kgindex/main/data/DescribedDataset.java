package fr.inria.kgindex.main.data;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.jena.rdf.model.AnonId;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class DescribedDataset {

	private String _endpointUrl = "";
	private List<String> _names = null;
	private final Model _model = ModelFactory.createDefaultModel();
	private final AnonId _anonId = AnonId.create();
	private ArrayList<String> _datasetNamespaces = new ArrayList<String>();
	private ArrayList<Resource> _graphList = new ArrayList<Resource>();
	private Resource _datasetDescriptionResource = null;
	private Resource _endpointDescriptionResource = null;
	private Resource _metadataDescriptionResource = null;
	private Resource _graphListResource = null;
	private boolean _graphsAreRequiredFlag = false;

	public DescribedDataset(String endpoint) {
		this._endpointUrl = endpoint;
		this._names = new LinkedList<>();
		String endpointHash = DigestUtils.md5Hex(this._endpointUrl);
		this._datasetDescriptionResource = this._model.createResource("http://ns.inria.fr/kg/index#" + endpointHash + "Dataset");
		this._endpointDescriptionResource = this._model.createResource("http://ns.inria.fr/kg/index#" + endpointHash + "Endpoint");
		this._metadataDescriptionResource = this._model.createResource("http://ns.inria.fr/kg/index#" + endpointHash + "Metadata");
		this._graphListResource = this._model.createResource("http://ns.inria.fr/kg/index#" + endpointHash + "Graphs");
	}
	
	public DescribedDataset(String endpoint, List<String> names) {
		this(endpoint);
		this._names = names;
	}
	
	public String getEndpointUrl() {
		return this._endpointUrl;
	}
	
	public void setEndpointUrl(String url) {
		this._endpointUrl = url;
	}
	
	public List<String> getNames() {
		return this._names;
	}
	
	public void setNames(List<String> names) {
		this._names = names;
	}

	public void addName(String name) {
		this._names.add(name);
	}

	public ArrayList<String> getNamespaces() {
		return _datasetNamespaces;
	}

	public void addNamespace(String datasetNamespace) {
		this._datasetNamespaces.add(datasetNamespace);
	}

	public void addNamespaces(List<String> datasetNamespaces) {
		this._datasetNamespaces.addAll(datasetNamespaces);
	}

	public ArrayList<Resource> getGraphList() {
		return _graphList;
	}

	public void setGraphList(ArrayList<Resource> graphList) {
		this._graphList = graphList;
	}

	public Resource getDatasetDescriptionResource() {
		return _datasetDescriptionResource;
	}

	public void setDatasetDescriptionResource(Resource datasetDescriptionResource) {
		this._datasetDescriptionResource = datasetDescriptionResource;
	}

	public Resource getEndpointDescriptionResource() {
		return _endpointDescriptionResource;
	}

	public void setEndpointDescriptionResource(Resource endpointDescriptionResource) {
		this._endpointDescriptionResource = endpointDescriptionResource;
	}

	public Resource getMetadataDescriptionResource() {
		return _metadataDescriptionResource;
	}

	public void setMetadataDescriptionResource(Resource metadataDescriptionResource) {
		this._metadataDescriptionResource = metadataDescriptionResource;
	}

	public Resource getGraphListResource() {
		return _graphListResource;
	}

	public void setGraphListResource(Resource graphListResource) {
		this._graphListResource = graphListResource;
	}

	public void setGraphsAreRequired(boolean b) {
		this._graphsAreRequiredFlag = b;
	}
	
	public boolean areGraphsRequired() {
		return this._graphsAreRequiredFlag;
	}
	
	public void close() {
		this._model.close();
	}
	
}
