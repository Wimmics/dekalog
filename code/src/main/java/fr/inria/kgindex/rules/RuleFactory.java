package fr.inria.kgindex.rules;

import fr.inria.kgindex.data.Dataset;
import fr.inria.kgindex.data.ManifestEntry;
import fr.inria.kgindex.util.KGIndex;
import fr.inria.kgindex.util.Manifest;
import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.vocabulary.RDF;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;

public class RuleFactory {

    private static final Logger logger = LogManager.getLogger(RuleFactory.class);

    public static RuleApplication create(ManifestEntry entry, Dataset describedDataset, Model datasetDescription) {

        Actions testActionListSuccess = new Actions();
        Actions testActionListFailure = new Actions();
        RuleApplication.TYPE interactionType;
        // Récuperer l'URI de l'interaction
        Resource testFileResource = entry.getFileResource();

        // Identifier le type d'interaction: dkg/SHACL
        Model testModel = ModelFactory.createDefaultModel();
        testModel.read(testFileResource.getURI(), "TTL");
        List<Resource> resTestQueryList = testModel.listSubjectsWithProperty(RDF.type, KGIndex.TestQuery).toList();
        List<Resource> resShapeList = testModel.listSubjectsWithProperty(RDF.type, testModel.createProperty(SHACL.NodeShape.getURI())).toList();

        // Fonction d'application adaptée
        if (resTestQueryList.isEmpty() && !resShapeList.isEmpty()) {
            interactionType = RuleApplication.TYPE.SPARQL;
        } else if (!resTestQueryList.isEmpty() && resShapeList.isEmpty()) {
            interactionType = RuleApplication.TYPE.SHACL;
        } else {
            interactionType = RuleApplication.TYPE.UNKNOWN;
        }
        for (Model entryModel : entry.getActionsOnSuccess()) {
            // Récupérer les actions
            List<Resource> testActionNodes = entryModel.listSubjectsWithProperty(Manifest.action).toList();
            testActionNodes.forEach(node -> {
                String actionEndpointUrl = describedDataset.getEndpointUrl();

                // Identifier l'endpoint visé
                List<RDFNode> actionEndpointUrlList = entryModel.listObjectsOfProperty(node, KGIndex.endpoint).toList();
                if (!actionEndpointUrlList.isEmpty()) {
                    actionEndpointUrl = actionEndpointUrlList.get(0).toString();
                }

                NodeIterator actionStrings = entryModel.listObjectsOfProperty(node, Manifest.action);
                String finalActionEndpointUrl = actionEndpointUrl;
                actionStrings.forEach(actionString -> {
                    Action currentAction = new Action(actionString, finalActionEndpointUrl, Action.TYPE.SPARQL);
                    testActionListSuccess.add(currentAction);
                });
            });
        }
        for (Model entryModel : entry.getActionsOnFailure()) {
            // Récupérer les actions standard
            List<Resource> testActionNodes = entryModel.listSubjectsWithProperty(Manifest.action).toList();
            testActionNodes.forEach(node -> {
                String actionEndpointUrl = describedDataset.getEndpointUrl();

                // Identifier l'endpoint visé
                List<RDFNode> actionEndpointUrlList = entryModel.listObjectsOfProperty(node, KGIndex.endpoint).toList();
                if (!actionEndpointUrlList.isEmpty()) {
                    actionEndpointUrl = actionEndpointUrlList.get(0).toString();
                }

                NodeIterator actionStrings = entryModel.listObjectsOfProperty(node, Manifest.action);
                String finalActionEndpointUrl = actionEndpointUrl;
                actionStrings.forEach(actionString -> {
                    Action currentAction = new Action(actionString, finalActionEndpointUrl, Action.TYPE.SPARQL);
                    testActionListFailure.add(currentAction);
                });
            });

            // récupérer les renvois vers d'autres tests
            String actionEndpointUrl = describedDataset.getEndpointUrl();

            NodeIterator entriesLists = entryModel.listObjectsOfProperty(Manifest.entries);
            entriesLists.forEach(entriesList -> {
                try {
                    List<RDFNode> entriesNodeList = entriesList.as(RDFList.class).asJavaList();
                    entriesNodeList.forEach(entryNode -> {
                        Action currentAction = new Action(entryNode, actionEndpointUrl, Action.TYPE.Manifest);
                        testActionListFailure.add(currentAction);
                    });
                } catch(Exception e) {
                    entryModel.write(System.err, "TTL");
                    throw e;
                }
            });
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

        TestExecution testExec = null;
        if(interactionType.equals(RuleApplication.TYPE.SPARQL)) {
            testExec = new SHACLTestExecution(tests, testEndpointUrl);
        } else if(interactionType.equals(RuleApplication.TYPE.SHACL)) {
            testExec = new QueryTestExecution(tests, testEndpointUrl);
        } else {
            throw new Error("Unexpected interaction type");
        }

        RuleApplication result =  new RuleApplication(entry, testExec, testActionListSuccess, testActionListFailure, describedDataset, datasetDescription);
        result.setType(interactionType);

        return result;
    }
}
