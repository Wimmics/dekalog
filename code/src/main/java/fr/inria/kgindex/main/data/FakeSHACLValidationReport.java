package fr.inria.kgindex.main.data;

import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.vocabulary.RDF;

import java.util.AbstractMap;

public class FakeSHACLValidationReport extends AbstractMap.SimpleEntry<Resource, Model> {

    public FakeSHACLValidationReport(Resource key, Model value) {
        super(key, value);
    }

    public static FakeSHACLValidationReport createFakeSHACLValidationReport(ManifestEntry entry, boolean resultBool) {
        Model resultModel = ModelFactory.createDefaultModel();
        Resource resultNode = resultModel.createResource();

        Property conforms = resultModel.createProperty(SHACL.conforms.getURI());
        Resource ValidationReport = resultModel.createResource(SHACL.ValidationReport.getURI());
        Literal reportResult = resultModel.createTypedLiteral(resultBool);
        resultModel.add(resultNode, RDF.type, ValidationReport);
        resultModel.add(resultNode, conforms, reportResult);

        FakeSHACLValidationReport result = new FakeSHACLValidationReport(resultNode, resultModel);
        return result;
    }
}
