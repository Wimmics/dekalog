package fr.inria.kgindex.main.rules;

import fr.inria.kgindex.main.data.DescribedDataset;
import fr.inria.kgindex.main.data.EarlReport;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;

public class DummyTestExecution extends TestExecution {

    public DummyTestExecution(Tests tests, String endpointUrl) {
        super(tests, endpointUrl);
    }

    @Override
    public Dataset execute(DescribedDataset describedDataset, Dataset datasetDescription) {
        Dataset result  = DatasetFactory.create();
        result.setDefaultModel(EarlReport.createBasicEarlReport(true, describedDataset, this.getTests().getManifestEntry()).getReport());
        return result;
    }
}
