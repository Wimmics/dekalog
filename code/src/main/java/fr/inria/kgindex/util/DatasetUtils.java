package fr.inria.kgindex.util;

import org.apache.jena.query.Dataset;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;

public class DatasetUtils {

    /**
     * Add d1 to d2.
     * @param d1
     * @param d2
     * @return d1 after addition
     */
    public static Dataset addDataset(Dataset d1, Dataset d2) {
        RDFConnection connect = RDFConnectionFactory.connect(d1);
        connect.loadDataset(d2);
        connect.close();
        return d1;
    }
}
