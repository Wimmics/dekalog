package fr.inria.kgindex.util;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

public class SPARQL_SD {
	
	private static final Model model = ModelFactory.createDefaultModel();
	private static final String sparqlsdNamespace = "http://www.w3.org/ns/sparql-service-description#";

	public static final Property feature = model.createProperty(sparqlsdNamespace + "feature");
	public static final Resource UnionDefaultGraph = model.createResource(sparqlsdNamespace + "UnionDefaultGraph");
	public static final Resource RequiresDataset = model.createResource(sparqlsdNamespace + "RequiresDataset");
}
