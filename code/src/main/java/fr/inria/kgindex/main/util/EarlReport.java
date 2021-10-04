package fr.inria.kgindex.main.util;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.FakeSHACLValidationReport;
import fr.inria.kgindex.main.data.ManifestEntry;
import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.ValidationReport;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.sparql.vocabulary.EARL;
import org.apache.jena.vocabulary.RDF;

import java.util.Date;

import static fr.inria.kgindex.main.util.Utils.dateFormatter;

public class EarlReport {

    private Model _report = ModelFactory.createDefaultModel();
    private Resource _assertionResource = null;
    private Resource _assertionResult = null;

    private EarlReport() {
        this._assertionResource = this._report.createResource();
        this._assertionResult = this._report.createResource();
        this._report.add(this._assertionResource, EARL.result, this._assertionResult);
        this._report.add(this._assertionResource, RDF.type, EARL.Assertion);
        this._report.add(this._assertionResource, RDF.type, PROV.Activity);

        Date date = new Date();
        this._report.add(this._assertionResult, PROV.generatedAtTime, this._report.createLiteral(dateFormatter.format(date)));
    }

    public Model getReport() {
        return this._report;
    }

    private Resource getAssertionResource() {
        return this._assertionResource;
    }

    private Resource getAssertionResultResource() {
        return this._assertionResult;
    }

    private void addStartDatetime(Literal start) {
        this._report.add(this._assertionResource, PROV.startedAtTime, start);
    }

    private void addEndDatetime(Literal end) {
        this._report.add(this._assertionResource, PROV.endedAtTime, end);
    }

    private void setStartEndDatetimes(Literal start, Literal end) {
        this.addStartDatetime(start);
        this.addEndDatetime(end);
    }

    private void addSubject(DescribedDataset dataset) {
        this._report.add(this._assertionResource, EARL.subject, dataset.getMetadataDescriptionResource());
        this._report.add(dataset.getMetadataDescriptionResource(), KGIndex.trace, this._assertionResource);
    }

    private void addResult(boolean result) {
        if(result) {
            this._report.add(this._assertionResult, EARL.outcome, EARL.passed);
        } else {
            this._report.add(this._assertionResult, EARL.outcome, EARL.failed);
        }
    }

    private void addResultInfo(String info) {
        if(! info.equals("")) {
            this._report.add(this._assertionResult, EARL.info, this._report.createLiteral(info));
        }
    }

    private void addTest(ManifestEntry entry) {
        this._report.add(this._assertionResource, EARL.test, entry.getTestResource());
    }

    private static EarlReport createBasicEarlReport(DescribedDataset describedDataset, Literal startDate, Literal endDate) {
        EarlReport result = new EarlReport();

        result.addSubject(describedDataset);
        result.setStartEndDatetimes(startDate, endDate);

        return result;
    }

    public static EarlReport createEarlReport(boolean passed, DescribedDataset describedDataset, ManifestEntry entry, String message, Literal startDate, Literal endDate) {
        EarlReport result = createBasicEarlReport(describedDataset, startDate, endDate);

        result.addTest(entry);
        result.addResult(passed);
        result.addResultInfo(message);
        result.addResultInfo(entry.getTitle());

        return result;
    }

    public static EarlReport createEarlQueryReport(boolean passed, DescribedDataset describedDataset, String sentQuery, ManifestEntry entry, String message, Literal startDate, Literal endDate) {
        EarlReport result = createEarlReport(passed, describedDataset, entry, message, startDate, endDate);

        if(sentQuery != null) {
            ResIterator itAssertionResult = result.getReport().listSubjectsWithProperty(EARL.outcome );
            while(itAssertionResult.hasNext()) {
                Resource assertionResult = itAssertionResult.nextResource();
                result.getReport().add(assertionResult, KGIndex.sentQuery, sentQuery);
            }
        }

        return result;
    }

    public static EarlReport createEarlPassedQueryReport(DescribedDataset describedDataset, String sentQuery, ManifestEntry entry, Literal startDateLiteral, Literal endDateLiteral) {
        return createEarlQueryReport(true, describedDataset, sentQuery, entry, "", startDateLiteral, endDateLiteral);
    }

    public static EarlReport createEarlFailedQueryReport(DescribedDataset describedDataset, String sentQuery, ManifestEntry entry, String message, Literal startDateLiteral, Literal endDateLiteral) {
        return createEarlQueryReport(false, describedDataset, sentQuery, entry, message, startDateLiteral, endDateLiteral);
    }

    public static EarlReport createEarlSHACLReport(DescribedDataset describedDataset, ValidationReport report, ManifestEntry entry, Literal startDateLiteral, Literal endDateLiteral) {
        EarlReport result = createEarlReport(report.conforms(), describedDataset, entry, entry.getTitle(), startDateLiteral, endDateLiteral);

        Resource assertionResult = result.getAssertionResultResource();
        result.getReport().add(assertionResult, EARL.info, report.getResource());
        result.getReport().add(report.getModel());

        return result;
    }

    public static EarlReport createEarlSHACLReport(DescribedDataset describedDataset, FakeSHACLValidationReport report, ManifestEntry entry, Literal startDateLiteral, Literal endDateLiteral) {
        Property conforms = report.getValue().createProperty(SHACL.conforms.getURI());
        boolean reportConforms = report.getValue().contains(null, conforms, report.getValue().createTypedLiteral(true));
        EarlReport result = createEarlReport(reportConforms, describedDataset, entry, entry.getTitle(), startDateLiteral, endDateLiteral);

        Resource assertionResult = result.getAssertionResultResource();
        result.getReport().add(assertionResult, EARL.info, report.getKey());
        result.getReport().add(report.getValue());

        return result;
    }
}
