package fr.inria.kgindex.util;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

public class PROV {
	
	private static Model model = ModelFactory.createDefaultModel();
	private static final String provNamespace = "http://www.w3.org/ns/prov#";

	public static final Resource Activity = model.createResource(provNamespace + "Activity");
	public static final Property generatedAtTime = model.createProperty(provNamespace + "generatedAtTime");
	public static final Property startedAtTime = model.createProperty(provNamespace + "startedAtTime");
	public static final Property endedAtTime = model.createProperty(provNamespace + "endedAtTime");
}
