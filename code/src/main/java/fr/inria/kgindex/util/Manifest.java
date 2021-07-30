package fr.inria.kgindex.util;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

public class Manifest {
	
	private static final Model model = ModelFactory.createDefaultModel();
	private static final String manifestNamespace = "http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#";
	public static final Property include = model.createProperty(manifestNamespace + "include");
	public static final Property entries = model.createProperty(manifestNamespace + "entries");
	public static final Property action = model.createProperty(manifestNamespace + "action");
	public static final Resource ManifestEntry = model.createResource(manifestNamespace + "ManifestEntry");
	public static final Resource Manifest = model.createResource(manifestNamespace + "Manifest");
}
