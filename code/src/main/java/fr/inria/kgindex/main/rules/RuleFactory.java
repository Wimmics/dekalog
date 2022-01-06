package fr.inria.kgindex.main.rules;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.ManifestEntry;
import fr.inria.kgindex.main.util.KGIndex;
import fr.inria.kgindex.main.util.Manifest;
import fr.inria.kgindex.main.util.Utils;
import org.apache.jena.atlas.web.HttpException;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.datatypes.xsd.XSDDuration;
import org.apache.jena.datatypes.xsd.impl.XSDDurationType;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.XSD;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
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

            testActionListSuccess.addAll(extractActionList(entryModel, entryNode, describedDataset, successPriorityCount));
        }

        AtomicInteger failurePriorityCount = new AtomicInteger();
        for (RDFNode entryNode : entry.getActionsOnFailure().keySet()) {
            Model entryModel = entry.getActionsOnFailure().get(entryNode);

            testActionListFailure.addAll(extractActionList(entryModel, entryNode, describedDataset, failurePriorityCount));
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

    private static List<Action> extractActionList(Model entryModel, RDFNode entryNode, DescribedDataset describedDataset, AtomicInteger priorityCount) {
        ArrayList<Action> result = new ArrayList<>();

        // Récupérer les actions
        String actionEndpointUrl = describedDataset.getEndpointUrl();

        if(entryNode.isAnon() && entryModel.contains(entryNode.asResource(), Manifest.action)) {
            // Identifier l'endpoint visé
            List<RDFNode> actionEndpointUrlList = entryModel.listObjectsOfProperty(entryNode.asResource(), KGIndex.endpoint).toList();
            if (actionEndpointUrlList.size() == 1) {
                actionEndpointUrl = actionEndpointUrlList.get(0).toString();
            } else if (actionEndpointUrlList.size() > 1) {
                throw new Error("Not expecting more that one endpoint: " + actionEndpointUrlList);
            }

            // Récupérer le timeout de l'action
            long actionTimeout = Utils.queryTimeout;
            List<RDFNode> actionTimeoutList = entryModel.listObjectsOfProperty(entryNode.asResource(), KGIndex.timeout).toList();
            if(actionTimeoutList.size() == 1) {
                Literal actionTimeoutLiteral = actionTimeoutList.get(0).asLiteral();
                actionTimeout = ((XSDDuration) XSDDatatype.XSDduration.parse(actionTimeoutLiteral.getString())).getFullSeconds() * 1000L;
            }

            NodeIterator actionStrings = entryModel.listObjectsOfProperty(entryNode.asResource(), Manifest.action);
            String finalActionEndpointUrl = actionEndpointUrl;
            long finalActionTimeout = actionTimeout;
            actionStrings.forEach(actionString -> {
                Action currentAction = new Action(actionString, finalActionEndpointUrl, Action.TYPE.SPARQL);
                currentAction.setPriority(priorityCount.getAndIncrement());
                currentAction.setTimeout(finalActionTimeout);
                result.add(currentAction);
            });
        } else if(! entryNode.isAnon() && entryNode.isResource() && entryModel.isEmpty()) {
            Action currentAction = new Action(entryNode, actionEndpointUrl, Action.TYPE.Manifest);
            currentAction.setPriority(priorityCount.getAndIncrement());
            result.add(currentAction);
        } else {
            throw new NoSuchElementException("Unexcepted action ");
        }

        return result;
    }
}
