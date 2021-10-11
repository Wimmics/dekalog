package fr.inria.kgindex.main.data;

import fr.inria.kgindex.main.util.Manifest;
import org.apache.jena.rdf.model.RDFNode;

import java.util.HashMap;
import java.util.Set;

public class RuleLibrary {

    private static HashMap<RDFNode, Set<ManifestEntry>> __library = null;

    public static HashMap<RDFNode, Set<ManifestEntry>> getLibrary() {
        if(__library == null) {
            __library = new HashMap<>();
        }
        return __library;
    }

    public static void closeLibrary() {
        __library.entrySet().forEach(entrySet -> {
            entrySet.getValue().forEach(entry -> {
                entry.close();
            });
        });
    }
}
