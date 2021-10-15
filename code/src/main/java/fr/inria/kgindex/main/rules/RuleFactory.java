package fr.inria.kgindex.main.rules;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.ManifestEntry;
import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.Manifest;
import org.apache.jena.atlas.web.HttpException;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.vocabulary.RDF;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class RuleFactory {

    private static final Logger logger = LogManager.getLogger(RuleFactory.class);

    public static RuleApplication create(ManifestEntry entry, DescribedDataset describedDataset, Dataset datasetDescription) {

        Actions testActionListSuccess = new Actions();
        Actions testActionListFailure = new Actions();
        TestExecution.TYPE interactionType;
        // Récuperer l'URI de l'interaction
        Resource testFileResource = entry.getFileResource();

        // Identifier le type d'interaction: dkg/SHACL
        Model testModel = ModelFactory.createDefaultModel();
        try {
            testModel.read(testFileResource.getURI(), "TTL");
        } catch(HttpException e) {
            logger.error(e);
            logger.error(testFileResource.getURI() + " could not be reached");
        }
        List<Resource> resTestQueryList = testModel.listSubjectsWithProperty(RDF.type, KGIndex.TestQuery).toList();
        List<Resource> resShapeList = testModel.listSubjectsWithProperty(RDF.type, testModel.createProperty(SHACL.NodeShape.getURI())).toList();
        List<Resource> resDummyTestList = testModel.listSubjectsWithProperty(RDF.type, KGIndex.DummyTest).toList();
        testModel.close();

        // Fonction d'application adaptée
        if (resTestQueryList.isEmpty() && !resShapeList.isEmpty() && resDummyTestList.isEmpty()) {
            interactionType = TestExecution.TYPE.SHACL;
        } else if (!resTestQueryList.isEmpty() && resShapeList.isEmpty() && resDummyTestList.isEmpty()) {
            interactionType = TestExecution.TYPE.SPARQL;
        } else if (resTestQueryList.isEmpty() && resShapeList.isEmpty() && ! resDummyTestList.isEmpty()) {
            interactionType = TestExecution.TYPE.DUMMY;
        } else {
            interactionType = TestExecution.TYPE.UNKNOWN;
        }

        AtomicInteger successPriorityCount = new AtomicInteger();
        for (RDFNode entryNode : entry.getActionsOnSuccess().keySet()) {
            Model entryModel = entry.getActionsOnSuccess().get(entryNode);

            // Récupérer les actions
            String actionEndpointUrl = describedDataset.getEndpointUrl();

            if(entryNode.isAnon() && entryModel.contains(entryNode.asResource(), Manifest.action)) {
                // Identifier l'endpoint visé
                List<RDFNode> actionEndpointUrlList = entryModel.listObjectsOfProperty(entryNode.asResource(), KGIndex.endpoint).toList();
                if (!actionEndpointUrlList.isEmpty()) {
                    actionEndpointUrl = actionEndpointUrlList.get(0).toString();
                }

                NodeIterator actionStrings = entryModel.listObjectsOfProperty(entryNode.asResource(), Manifest.action);
                String finalActionEndpointUrl = actionEndpointUrl;
                actionStrings.forEach(actionString -> {
                    Action currentAction = new Action(actionString, finalActionEndpointUrl, Action.TYPE.SPARQL);
                    currentAction.setPriority(successPriorityCount.getAndIncrement());
                    testActionListSuccess.add(currentAction);
                });
            } else if(! entryNode.isAnon() && entryNode.isResource() && entryModel.isEmpty()) {
                Action currentAction = new Action(entryNode, actionEndpointUrl, Action.TYPE.Manifest);
                currentAction.setPriority(successPriorityCount.getAndIncrement());
                testActionListSuccess.add(currentAction);
            } else {
                logger.error(entry.getFileResource());
                throw new Error("Unexcepted action");
            }

        }


        AtomicInteger failurePriorityCount = new AtomicInteger();
        for (RDFNode entryNode : entry.getActionsOnFailure().keySet()) {
            Model entryModel = entry.getActionsOnFailure().get(entryNode);

            // Récupérer les actions
            String actionEndpointUrl = describedDataset.getEndpointUrl();

            if(entryNode.isAnon() && entryModel.contains(entryNode.asResource(), Manifest.action)) { // C'est une requête
                // Identifier l'endpoint visé
                List<RDFNode> actionEndpointUrlList = entryModel.listObjectsOfProperty(entryNode.asResource(), KGIndex.endpoint).toList();
                if (!actionEndpointUrlList.isEmpty()) {
                    actionEndpointUrl = actionEndpointUrlList.get(0).toString();
                    if(actionEndpointUrl.equals(KGIndex.federation.getURI())) {
                        actionEndpointUrl = RuleApplication.federationserver;
                    }
                }

                NodeIterator actionStrings = entryModel.listObjectsOfProperty(entryNode.asResource(), Manifest.action);
                String finalActionEndpointUrl = actionEndpointUrl;
                actionStrings.forEach(actionString -> {
                    Action currentAction = new Action(actionString, finalActionEndpointUrl, Action.TYPE.SPARQL);
                    currentAction.setPriority(failurePriorityCount.getAndIncrement());
                    testActionListFailure.add(currentAction);
                });
            } else if(! entryNode.isAnon() && entryNode.isResource() ) { // C'est un test à faire suivre
                Action currentAction = new Action(entryNode, actionEndpointUrl, Action.TYPE.Manifest);
                currentAction.setPriority(failurePriorityCount.getAndIncrement());
                testActionListFailure.add(currentAction);
            } else {
                logger.error(entry.getFileResource());
                throw new Error("Unexcepted action");
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
            if(testEndpointUrl.equals(KGIndex.federation.getURI())) {
                testEndpointUrl = RuleApplication.federationserver;
            }
        }
        testModel.close();

        TestExecution testExec = null;
        if(interactionType.equals(TestExecution.TYPE.SPARQL)) {
            testExec = new QueryTestExecution(tests, testEndpointUrl);
        } else if(interactionType.equals(TestExecution.TYPE.SHACL)) {
            testExec = new SHACLTestExecution(tests, testEndpointUrl);
        } else if(interactionType.equals(TestExecution.TYPE.DUMMY)) {
            testExec = new DummyTestExecution(tests, testEndpointUrl);
        } else {
            throw new Error("Unexpected interaction type");
        }

        RuleApplication result =  new RuleApplication(entry, testExec, testActionListSuccess, testActionListFailure, describedDataset, datasetDescription);
        result.setType(interactionType);

        return result;
    }
}
