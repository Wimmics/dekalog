package fr.inria.kgindex.main.util;

import org.apache.jena.query.Dataset;
import org.apache.jena.rdfconnection.RDFConnection;

public class DatasetUtils {

    /**
     * Add d1 to d2.
     * @param d1
     * @param d2
     * @return d1 after addition
     */
    public static void addToDataset(Dataset d1, final Dataset d2) {
        RDFConnection connect = RDFConnection.connect(d1);
        connect.loadDataset(d2);
        connect.close();
    }
}
