package fr.inria.kgindex.main.data;

import fr.inria.kgindex.main.util.KGIndex;
import org.apache.jena.rdf.model.AnonId;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.util.StringUtils;

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
		String endpointDescResourceString = KGIndex.kgindexNamespace + this._anonId.getLabelString() + "Endpoint";
		String datasetDescResourceString = KGIndex.kgindexNamespace + this._anonId.getLabelString() + "Dataset";
		String metadataDescResourceString = KGIndex.kgindexNamespace + this._anonId.getLabelString() + "Metadata";
		String graphListDescResourceString = endpointDescResourceString + "GraphList";
		this.setEndpointDescriptionResource(this._model.createResource(endpointDescResourceString));
		this.setDatasetDescriptionResource(this._model.createResource(datasetDescResourceString));
		this.setMetadataDescriptionResource(this._model.createResource(metadataDescResourceString));
		this.setGraphListResource(this._model.createResource(graphListDescResourceString));
		this._names = new LinkedList<>();
	}
	
	public DescribedDataset(String endpoint, List<String> names) {
		this(endpoint);
		this._names = names;
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
