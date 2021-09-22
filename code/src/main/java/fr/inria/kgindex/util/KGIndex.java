package fr.inria.kgindex.util;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

public class KGIndex {
	
	private static final Model model = ModelFactory.createDefaultModel();
	public static final String kgindexNamespace = "http://ns.inria.fr/kg/index#";

	public static final Resource TestQuery = model.createResource(kgindexNamespace + "TestQuery");
	public static final Resource federation = model.createResource(kgindexNamespace + "federation");
	public static final Property query = model.createProperty(kgindexNamespace + "query");
	public static final Property sentQuery = model.createProperty(kgindexNamespace + "sentQuery");
	public static final Property trace = model.createProperty(kgindexNamespace + "trace");
	public static final Property endpoint = model.createProperty(kgindexNamespace + "endpoint");
	public static final Property onSuccess = model.createProperty(kgindexNamespace + "onSuccess");
	public static final Property onFailure = model.createProperty(kgindexNamespace + "onFailure");
}
