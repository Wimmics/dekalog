package fr.inria.kgindex.step;

import fr.inria.kgindex.data.Dataset;
import fr.inria.kgindex.data.FakeSHACLValidationReport;
import fr.inria.kgindex.util.EarlReport;
import fr.inria.kgindex.util.Utils;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;
import org.apache.jena.shacl.ShaclValidator;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.ValidationReport;
import org.apache.jena.shacl.parser.ShaclParseException;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static fr.inria.kgindex.util.Utils.dateFormatter;

public class SHACLTestExecution extends TestExecution {

    private static final Logger logger = LogManager.getLogger(SHACLTestExecution.class);

    public SHACLTestExecution(Tests tests) {
        super(tests);
    }

    public Model execute(Dataset describedDataset, Model datasetDescription) {
        return executeTestShapeTest(describedDataset, datasetDescription);
    }

    /**
     * SPARQL-based constraints are sent to the KB, standard constraints are applied on the description
     * @param describedDataset
     * @return
     */
    private Model executeTestShapeTest(Dataset describedDataset, Model datasetDescription) {
        Model result = ModelFactory.createDefaultModel();
        ShaclValidator validator = ShaclValidator.get();

        this._tests.getTests().forEach(testModel -> {
            Date startDate = new Date();
            Literal startDateLiteral = result.createLiteral(dateFormatter.format(startDate));
            Model earlReport = null;

            Property sparqlProperty = testModel.createProperty(SHACL.sparql.getURI());
            try {
                if(testModel.contains(null, sparqlProperty, (RDFNode) null)){ // SPARQL base constraints.
                    Model testModelCopy = testModel.intersection(testModel);
                    // Replacement of placeholders in query constraints
                    StmtIterator itSparqlStatements = testModelCopy.listStatements(null, testModel.createProperty(SHACL.select.getURI()), (RDFNode) null);
                    while (itSparqlStatements.hasNext()) {
                        Statement sparqlStmt = itSparqlStatements.nextStatement();

                        String sparqlQueryString = sparqlStmt.getObject().asLiteral().getString();
                        Set<String> sparqlQueryStringSet = Utils.rewriteQueryPlaceholders(sparqlQueryString, describedDataset);

                        testModel.remove(sparqlStmt);
                        testModel.remove(this.getTests().getManifestEntry().getTestResource(), testModel.createProperty(SHACL.sparql.getURI()), sparqlStmt.getSubject());
                        if (sparqlQueryStringSet.size() > 1) { // Si il y a plus d'une requête réécrite, on doit changer la structure de la contrainte pour les ajouter toutes dans une disjonction
                            List<Resource> orList = new ArrayList<Resource>();
                            sparqlQueryStringSet.forEach(rewritedQuery -> {
                                Resource tmpOrClauseRes = testModel.createResource();
                                Resource tmpSparqlClauseRes = testModel.createResource();
                                orList.add(tmpSparqlClauseRes);
                                testModel.add(tmpSparqlClauseRes, testModel.createProperty(SHACL.sparql.getURI()), tmpOrClauseRes);
                                testModel.add(tmpOrClauseRes, sparqlStmt.getPredicate(), testModel.createLiteral(rewritedQuery));
                                StmtIterator otherStmt = testModelCopy.listStatements(sparqlStmt.getSubject(), null, (RDFNode) null);
                                // On ajoute les autres triplets de la clause sparql original à chaque nouvelle clause dans le OR
                                while (otherStmt.hasNext()) {
                                    Statement sparqlOriginalStatement = otherStmt.nextStatement();
                                    testModel.remove(sparqlOriginalStatement);
                                    if (!sparqlOriginalStatement.getPredicate().equals(testModel.createProperty(SHACL.select.getURI()))) {
                                        testModel.add(tmpOrClauseRes, sparqlOriginalStatement.getPredicate(), sparqlOriginalStatement.getObject());
                                    }
                                }
                            });

                            testModel.add(this.getTests().getManifestEntry().getTestResource(), testModel.createProperty(SHACL.or.getURI()), testModel.createList(orList.listIterator()));

                        } else if (sparqlQueryStringSet.size() == 1) {
                            ArrayList<String> sparqlSingletonList = new ArrayList<String>(sparqlQueryStringSet);
                            Literal singletonSparqlQuery = testModel.createLiteral(sparqlSingletonList.get(0));
                            testModel.add(sparqlStmt.getSubject(), sparqlStmt.getPredicate(), singletonSparqlQuery);
                        }
                    }
                    Shapes manifestShapes = Shapes.parse(testModel); // Vérification que les shapes sont bien formées malgré ce qu'on en fait

                    // Envoie de toutes les requêtes SELECT trouvées dans la contrainte
                    boolean validationResultBool = true;
                    NodeIterator itSelectObj = testModel.listObjectsOfProperty(testModel.createProperty(SHACL.select.getURI()));
                    while (itSelectObj.hasNext()) {
                        RDFNode selectObject = itSelectObj.next();

                        if (selectObject.isLiteral()) {
                            Literal selectObjLit = selectObject.asLiteral();
                            String selectQuery = selectObjLit.getString();
                            QueryExecution selectExec = QueryExecutionFactory.sparqlService(describedDataset.getEndpointUrl(), selectQuery);
                            selectExec.setTimeout(Utils.queryTimeout);
                            ResultSet selectResults = selectExec.execSelect();
                            if (selectResults.hasNext()) {
                                validationResultBool = false;
                            }
                        }
                    }
                    Date endDate = new Date();
                    Literal endDateLiteral =  result.createLiteral(dateFormatter.format(endDate));

                    // Gestion des rapports de validation
                    FakeSHACLValidationReport fakeValidationReport = FakeSHACLValidationReport.createFakeSHACLValidationReport(this.getTests().getManifestEntry(), validationResultBool);
                    earlReport = EarlReport.createEarlSHACLReport(describedDataset, fakeValidationReport, this.getTests().getManifestEntry(), startDateLiteral, endDateLiteral);
                } else {
                    Shapes testShapes = validator.parse(testModel.getGraph());

                    ValidationReport report = validator.validate(testShapes, datasetDescription.getGraph());

                    Date endDate = new Date();
                    Literal endDateLiteral =  result.createLiteral(dateFormatter.format(endDate));

                    earlReport = EarlReport.createEarlSHACLReport(describedDataset, report, this.getTests().getManifestEntry(), startDateLiteral, endDateLiteral);
                }
            } catch(Exception e) {
                Date endDate = new Date();
                Literal endDateLiteral =  result.createLiteral(dateFormatter.format(endDate));
                logger.info(e);
                earlReport = EarlReport.createEarlReport(false, describedDataset, this.getTests().getManifestEntry(), e.getMessage() ,startDateLiteral, endDateLiteral);
            }

            result.add(earlReport);
        });

        return result;
    }
}
