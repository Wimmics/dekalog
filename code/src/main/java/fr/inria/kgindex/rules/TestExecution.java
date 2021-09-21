package fr.inria.kgindex.rules;

import fr.inria.kgindex.data.DescribedDataset;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;

public abstract class TestExecution {

    protected Tests _tests = null;
    protected String _endpointUrl = "";

    public TestExecution(Tests tests, String endpointUrl) {
        this._tests = tests;
        this._endpointUrl = endpointUrl;
    }

    public Tests getTests() {
        return this._tests;
    }

    public String getEndpointUrl() {
        return this._endpointUrl;
    }

    public void setEndpointUrl(String url) {
        this._endpointUrl = url;
    }

    public abstract Dataset execute(DescribedDataset describedDataset, Dataset datasetDescription);
}
