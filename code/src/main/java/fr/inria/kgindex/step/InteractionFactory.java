package fr.inria.kgindex.step;

import fr.inria.kgindex.data.Dataset;
import fr.inria.kgindex.data.ManifestEntry;
import fr.inria.kgindex.util.KGIndex;
import fr.inria.kgindex.util.Manifest;
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

        Iterator<Model> itAction = entry.getActions().iterator();
        while(itAction.hasNext()) {
            Model entryModel = itAction.next();

            // Récuperer l'URI de l'interaction
            List<Resource> typeEntryList = entryModel.listSubjectsWithProperty(RDF.type, Manifest.ManifestEntry).toList();
            if (typeEntryList.size() > 0) { // Si il n'y a pas de manifestEntry, on ne fait rien

                Resource testFileResource = typeEntryList.get(0);

                // Récupérer les actions
                List<RDFNode> testActionNodes = entryModel.listObjectsOfProperty(testFileResource, Manifest.action).toList();
                testActionNodes.forEach(node -> {
                    testActionStringList.add(node.asLiteral().getString());
                });

                // Identifier le type d'interaction: dkg/SHACL
                Model testModel = ModelFactory.createDefaultModel();
                testModel.read(testFileResource.getURI(), "TTL");
                List<Resource> resTestQueryList = testModel.listSubjectsWithProperty(RDF.type, KGIndex.TestQuery).toList();
                List<Resource> resShapeList = testModel.listSubjectsWithProperty(RDF.type, testModel.createProperty(SHACL.NodeShape.getURI())).toList();

                // Lancer fonction d'application adaptée
                if (resTestQueryList.isEmpty() && ! resShapeList.isEmpty()) {
                    interactionType = InteractionApplication.TYPE.SPARQL;
                } else if(! resTestQueryList.isEmpty() && resShapeList.isEmpty()) {
                    interactionType = InteractionApplication.TYPE.SHACL;
                } else {
                    interactionType = InteractionApplication.TYPE.SHACL;
                }
            }
        }

        Tests tests = new Tests(entry);
        tests.setTests(entry.getTests());

        Actions actions = new Actions(testActionStringList);

        TestExecution testExec = null;
        if(interactionType.equals(InteractionApplication.TYPE.SPARQL)) {
            testExec = new SHACLTestExecution(tests);
        } else if(interactionType.equals(InteractionApplication.TYPE.SHACL)) {
            testExec = new QueryTestExecution(tests);
        } else {
            testExec = new QueryTestExecution(tests);
        }

        InteractionApplication result =  new InteractionApplication(entry, testExec, actions, describedDataset, datasetDescription);
        result.setType(interactionType);

        return result;
    }
}
