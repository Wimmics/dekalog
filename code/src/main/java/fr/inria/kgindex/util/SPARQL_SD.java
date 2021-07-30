package fr.inria.kgindex.util;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

public class SPARQL_SD {
	
	private static Model model = ModelFactory.createDefaultModel();
	private static final String sparqlsdNamespace = "http://www.w3.org/ns/sparql-service-description#";

	public static Property feature = model.createProperty(sparqlsdNamespace + "feature");
	public static Resource UnionDefaultGraph = model.createResource(sparqlsdNamespace + "UnionDefaultGraph");
	public static Resource RequiresDataset = model.createResource(sparqlsdNamespace + "RequiresDataset");
}
