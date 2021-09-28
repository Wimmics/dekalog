package fr.inria.kgindex.main.util;

<<<<<<< HEAD:code/src/main/java/fr/inria/kgindex/main/util/EarlReport.java
import fr.inria.kgindex.main.data.Dataset;
import fr.inria.kgindex.main.data.FakeSHACLValidationReport;
import fr.inria.kgindex.main.data.ManifestEntry;
=======
import fr.inria.kgindex.data.DescribedDataset;
import fr.inria.kgindex.data.FakeSHACLValidationReport;
import fr.inria.kgindex.data.ManifestEntry;
>>>>>>> ModelToDataset:code/src/main/java/fr/inria/kgindex/util/EarlReport.java
import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.ValidationReport;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.sparql.vocabulary.EARL;
import org.apache.jena.vocabulary.RDF;

import java.util.Date;

import static fr.inria.kgindex.main.util.Utils.dateFormatter;

public class EarlReport {

    public static Model createEarlReport(boolean passed, DescribedDataset describedDataset, ManifestEntry entry, String message, Literal startDate, Literal endDate) {
        Model result = ModelFactory.createDefaultModel();
        Resource assertionResource = result.createResource();

        result.add(assertionResource, RDF.type, EARL.Assertion);
        result.add(assertionResource, RDF.type, PROV.Activity);
        result.add(assertionResource, EARL.subject, describedDataset.getMetadataDescriptionResource());
        result.add(assertionResource, EARL.test, entry.getTestResource());
        result.add(assertionResource, PROV.startedAtTime, startDate);
        result.add(assertionResource, PROV.endedAtTime, endDate);
        Resource assertionResult = result.createResource();
        result.add(assertionResource, EARL.result, assertionResult);
        result.add(assertionResult, EARL.info, result.createLiteral(entry.getTitle()));
        if(passed) {
            result.add(assertionResult, EARL.outcome, EARL.passed);
        } else {
            result.add(assertionResult, EARL.outcome, EARL.failed);
            result.add(assertionResult, EARL.info, result.createLiteral(message));
        }
        Date date = new Date();
        result.add(assertionResult, PROV.generatedAtTime, result.createLiteral(dateFormatter.format(date)));
        result.add(describedDataset.getMetadataDescriptionResource(), KGIndex.trace, assertionResource);

        return result;
    }

    public static Model createEarlQueryReport(boolean passed, DescribedDataset describedDataset, String sentQuery, ManifestEntry entry, String message, Literal startDate, Literal endDate) {
        Model result = createEarlReport(passed, describedDataset, entry, message, startDate, endDate);

        if(sentQuery != null) {
            ResIterator itAssertionResult = result.listSubjectsWithProperty(EARL.outcome );
            while(itAssertionResult.hasNext()) {
                Resource assertionResult = itAssertionResult.nextResource();
                result.add(assertionResult, KGIndex.sentQuery, sentQuery);
            }
        }

        return result;
    }

    public static Model createEarlPassedQueryReport(DescribedDataset describedDataset, String sentQuery, ManifestEntry entry, Literal startDateLiteral, Literal endDateLiteral) {
        return createEarlQueryReport(true, describedDataset, sentQuery, entry, "", startDateLiteral, endDateLiteral);
    }

    public static Model createEarlFailedQueryReport(DescribedDataset describedDataset, String sentQuery, ManifestEntry entry, String message, Literal startDateLiteral, Literal endDateLiteral) {
        return createEarlQueryReport(false, describedDataset, sentQuery, entry, message, startDateLiteral, endDateLiteral);
    }

    public static Model createEarlSHACLReport(DescribedDataset describedDataset, ValidationReport report, ManifestEntry entry, Literal startDateLiteral, Literal endDateLiteral) {
        Model result = createEarlReport(report.conforms(), describedDataset, entry, entry.getTitle(), startDateLiteral, endDateLiteral);

        if(report != null) {
            ResIterator itAssertionResult = result.listSubjectsWithProperty(EARL.outcome );
            while(itAssertionResult.hasNext()) {
                Resource assertionResult = itAssertionResult.next();
                result.add(assertionResult, EARL.info, report.getResource());
                result.add(report.getModel());
            }
        }

        return result;
    }

    public static Model createEarlSHACLReport(DescribedDataset describedDataset, FakeSHACLValidationReport report, ManifestEntry entry, Literal startDateLiteral, Literal endDateLiteral) {
        Property conforms = report.getValue().createProperty(SHACL.conforms.getURI());
        boolean reportConforms = report.getValue().contains(null, conforms, report.getValue().createTypedLiteral(true));
        Model result = createEarlReport(reportConforms, describedDataset, entry, entry.getTitle(), startDateLiteral, endDateLiteral);

        if(report != null) {
            ResIterator itAssertionResult = result.listSubjectsWithProperty(EARL.outcome );
            while(itAssertionResult.hasNext()) {
                Resource assertionResult = itAssertionResult.next();
                result.add(assertionResult, EARL.info, report.getKey());
                result.add(report.getValue());
            }
        }

        return result;
    }
}
