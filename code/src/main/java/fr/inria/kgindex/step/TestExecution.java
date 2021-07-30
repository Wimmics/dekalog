package fr.inria.kgindex.step;

import fr.inria.kgindex.data.Dataset;
import org.apache.jena.rdf.model.Model;

public abstract class TestExecution {

    protected Tests _tests = null;

    public TestExecution(Tests tests) {
        this._tests = tests;
    }

    public Tests getTests() {
        return this._tests;
    }

    public abstract Model execute(Dataset describedDataset, Model datasetDescription);
}
