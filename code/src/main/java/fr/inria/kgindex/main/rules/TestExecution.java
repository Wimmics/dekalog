package fr.inria.kgindex.main.rules;

<<<<<<< HEAD:code/src/main/java/fr/inria/kgindex/main/rules/TestExecution.java
import fr.inria.kgindex.main.data.Dataset;
import org.apache.jena.rdf.model.Model;
=======
import fr.inria.kgindex.data.DescribedDataset;
import org.apache.jena.query.Dataset;
>>>>>>> ModelToDataset:code/src/main/java/fr/inria/kgindex/rules/TestExecution.java

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
