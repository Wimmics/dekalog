package fr.inria.kgindex.step;

import fr.inria.kgindex.data.ManifestEntry;
import org.apache.jena.rdf.model.Model;

import java.util.HashSet;
import java.util.Set;

public class Tests {

    protected Set<Model> _testModels = new HashSet<Model>();
    protected ManifestEntry _manifest = null;

    public Tests(ManifestEntry manifest) {
        this._manifest = manifest;
    }

    public Set<Model> getTests() {
        return this._testModels;
    }

    public void addTest(Model test) {
        this._testModels.add(test);
    }

    public void setTests(Set<Model> tests) {
        this._testModels = tests;
    }

    public ManifestEntry getManifestEntry() {
        return this._manifest;
    }

}
