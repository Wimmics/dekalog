package fr.inria.kgindex.main.data;

import fr.inria.kgindex.main.util.KGIndex;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;

import java.util.ArrayList;
import java.util.List;

public class DescribedDataset {

	private String _endpointUrl = "";
	private String _name = "";
	private Model _model = ModelFactory.createDefaultModel();
	private ArrayList<String> _datasetNamespaces = new ArrayList<String>();
	private ArrayList<Resource> _graphList = new ArrayList<Resource>();
	private Resource _datasetDescriptionResource = null;
	private Resource _endpointDescriptionResource = null;
	private Resource _metadataDescriptionResource = null;
	private Resource _graphListResource = null;
	private boolean _graphsAreRequiredFlag = false;
	
	public DescribedDataset(String endpoint, String name) {
		this(endpoint, KGIndex.kgindexNamespace + name + "Endpoint", KGIndex.kgindexNamespace + name + "Dataset", KGIndex.kgindexNamespace + name + "Metadata");
		this._name = name;
	}

	public DescribedDataset(String endpoint, String endpointResourceUrl, String datasetResourceUrl, String metadataResourceUrl) {
		this(endpoint);

		Resource endpointDescResource = this._model.createResource(endpointResourceUrl);
		this.setEndpointDescriptionResource(endpointDescResource);
		Resource datasetDescResource = this._model.createResource(datasetResourceUrl);
		this.setDatasetDescriptionResource(datasetDescResource);
		Resource metadataDescResource = this._model.createResource(metadataResourceUrl);
		this.setMetadataDescriptionResource(metadataDescResource);
		Resource graphListResource = this._model.createResource(endpointResourceUrl + "GraphList");
		this.setGraphListResource(graphListResource);
	}

	private DescribedDataset(String endpoint) {
		this._endpointUrl = endpoint;
	}
	
	public String getEndpointUrl() {
		return this._endpointUrl;
	}
	
	public void setEndpointUrl(String url) {
		this._endpointUrl = url;
	}
	
	public String getName() {
		return this._name;
	}
	
	public void setName(String name) {
		this._name = name;
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
