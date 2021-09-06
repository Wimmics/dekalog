package fr.inria.kgindex.step;

import fr.inria.kgindex.data.Dataset;
import fr.inria.kgindex.data.ManifestEntry;
import fr.inria.kgindex.util.KGIndex;
import fr.inria.kgindex.util.Manifest;
import fr.inria.kgindex.util.Utils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.vocabulary.RDF;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class InteractionFactory {

    private static final Logger logger = LogManager.getLogger(InteractionFactory.class);

    public static InteractionApplication create(ManifestEntry entry, Dataset describedDataset, Model datasetDescription) {

        List<String> testActionStringList = new ArrayList<String>();
        InteractionApplication.TYPE interactionType = InteractionApplication.TYPE.SPARQL;

        String actionEndpointUrl = describedDataset.getEndpointUrl();
        for (Model entryModel : entry.getActions()) {
            // Récuperer l'URI de l'interaction
            List<Resource> typeEntryList = entryModel.listSubjectsWithProperty(RDF.type, Manifest.ManifestEntry).toList();
            if (typeEntryList.size() > 0) { // Si il n'y a pas de manifestEntry, on ne fait rien

                Resource testFileResource = typeEntryList.get(0);

                // Récupérer les actions
                List<RDFNode> testActionNodes = entryModel.listObjectsOfProperty(testFileResource, Manifest.action).toList();
                testActionNodes.forEach(node -> {
                    testActionStringList.add(node.asLiteral().getString());
                });

                // Identifier le type d'interaction: kgi/SHACL
                Model testModel = ModelFactory.createDefaultModel();
                testModel.read(testFileResource.getURI(), "TTL");
                List<Resource> resTestQueryList = testModel.listSubjectsWithProperty(RDF.type, KGIndex.TestQuery).toList();
                List<Resource> resShapeList = testModel.listSubjectsWithProperty(RDF.type, testModel.createProperty(SHACL.NodeShape.getURI())).toList();

                // Fonction d'application adaptée
                if (resTestQueryList.isEmpty() && !resShapeList.isEmpty()) {
                    interactionType = InteractionApplication.TYPE.SPARQL;
                } else if (!resTestQueryList.isEmpty() && resShapeList.isEmpty()) {
                    interactionType = InteractionApplication.TYPE.SHACL;
                } else {
                    interactionType = InteractionApplication.TYPE.UNKNOWN;
                }

                // Identifier l'endpoint visé
                List<RDFNode> actionEndpointUrlList = entryModel.listObjectsOfProperty(testFileResource, KGIndex.endpoint).toList();
                if (!actionEndpointUrlList.isEmpty()) {
                    actionEndpointUrl = Utils.rewriteUrlWithPlaceholders(actionEndpointUrlList.get(0).toString(), describedDataset);
                }
            }
        }

        Tests tests = new Tests(entry);
        tests.setTests(entry.getTests());

        // Detection de l'endpoint précisé pour les tests
        Model testsModel = ModelFactory.createDefaultModel();
        tests.getTests().forEach(testsModel::add);
        List<RDFNode> testEndpointNodeList = testsModel.listObjectsOfProperty(KGIndex.endpoint).toList();
        String testEndpointUrl = describedDataset.getEndpointUrl();
        if(! testEndpointNodeList.isEmpty()) {
            testEndpointUrl = testEndpointNodeList.get(0).toString();
        }

        Actions actions = new Actions(testActionStringList, actionEndpointUrl);

        TestExecution testExec = null;
        if(interactionType.equals(InteractionApplication.TYPE.SPARQL)) {
            testExec = new SHACLTestExecution(tests, testEndpointUrl);
        } else if(interactionType.equals(InteractionApplication.TYPE.SHACL)) {
            testExec = new QueryTestExecution(tests, testEndpointUrl);
        } else {
            throw new Error("Test type unknown");
        }

        InteractionApplication result =  new InteractionApplication(entry, testExec, actions, describedDataset, datasetDescription);
        result.setType(interactionType);

        return result;
    }
}
