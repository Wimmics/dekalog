package fr.inria.kgindex.util;

import fr.inria.kgindex.data.DescribedDataset;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.*;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

public class Utils {

    public static final SimpleDateFormat dateFormatter = new SimpleDateFormat("dd-MM-yyyy'T'HH:mm:ss");
    public static long queryTimeout = 30000;

    public static String PLACEHOLDER_DATASETDESCRIPTION = "$datasetDescription";
    public static String PLACEHOLDER_ENDPOINTDESCRIPTION = "$endpointDescription";
    public static String PLACEHOLDER_METADATADESCRIPTION = "$metadataDescription";
    public static String PLACEHOLDER_GRAPHLIST = "$graphList";
    public static String PLACEHOLDER_LIMIT = "$LIMIT";
    public static String PLACEHOLDER_DATASETNAME = "$name$";
    public static String PLACEHOLDER_DATETIME = "$dateLiteral";
    public static String PLACEHOLDER_FROM = "$FROM";
    public static String PLACEHOLDER_NAMESPACE = "$namespace";
    public static String PLACEHOLDER_ENDPOINTURL = "$endpointUrl";

    /**
     * Replace the placeholders in tests and queries. Placeholders include "$datasetDescription", "$endpointDescription", "$metadataDescription", "$graphList", "$LIMIT", "FROM", "$namespace", "$endpoint", "$name$", $dateLiteral.
     * To take into account the usage of HTTP or HTTPS in endpoint URL, the result can be two different strings with endoint url variants instead of one.
     * @param queryString
     * @param describedDataset
     * @return a set of transformed strings.
     */
    public static Set<String> rewriteQueryPlaceholders(String queryString, DescribedDataset describedDataset) {
        HashSet<String> result = new HashSet<String>();

        queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_DATASETDESCRIPTION), "<"+describedDataset.getDatasetDescriptionResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_ENDPOINTDESCRIPTION), "<"+describedDataset.getEndpointDescriptionResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_METADATADESCRIPTION), "<"+describedDataset.getMetadataDescriptionResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_GRAPHLIST), "<"+describedDataset.getGraphListResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_LIMIT), "");
        queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_DATASETNAME), describedDataset.getName());
        Date date = new Date();
        Model tmpModel = ModelFactory.createDefaultModel();
        queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_DATETIME),"\"" + dateFormatter.format(date) + "\"^^<http://www.w3.org/2001/XMLSchema#datetime>");
        tmpModel.close();

        if(queryString.contains(PLACEHOLDER_FROM) && describedDataset.areGraphsRequired()) {
            String fromString = "";
            Iterator<Resource> graphIt = describedDataset.getGraphList().iterator();
            while(graphIt.hasNext()) {
                Resource graph = graphIt.next();
                fromString += "FROM <" + graph.getURI() + ">\n";
            }
            queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_FROM), fromString);
        } else {
            queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_FROM), "");
        }

        if(queryString.contains(PLACEHOLDER_NAMESPACE)) {
            String namespaceString = "\"";
            ListIterator<String> namespaceIt = describedDataset.getNamespaces().listIterator();
            if(namespaceIt.hasNext()) {
                String namespace = namespaceIt.next();
                namespaceString += namespace;
            }
            while(namespaceIt.hasNext()) {
                String namespace = namespaceIt.next();
                namespaceString += "|" + namespace;
            }
            namespaceString += "\"";
            queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_NAMESPACE), namespaceString);
        }

        // URL de l'endpoint avec generation de variantes HTTP HTTPS
        if(queryString.contains(PLACEHOLDER_ENDPOINTURL)) {
            String queryVariant = queryString;
            String endpointUrlVariant = describedDataset.getEndpointUrl();
            if(describedDataset.getEndpointUrl().startsWith("http:")) {
                endpointUrlVariant = endpointUrlVariant.replace("http://", "https://");
                queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_ENDPOINTURL), "<"+describedDataset.getEndpointUrl()+">");
                queryVariant = queryVariant.replaceAll(Pattern.quote(PLACEHOLDER_ENDPOINTURL), "<"+endpointUrlVariant+">");
            } else if(describedDataset.getEndpointUrl().startsWith("https:")) {
                endpointUrlVariant = endpointUrlVariant.replace("https://", "http://");
                queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_ENDPOINTURL), "<"+describedDataset.getEndpointUrl()+">");
                queryVariant = queryVariant.replaceAll(Pattern.quote(PLACEHOLDER_ENDPOINTURL), "<"+endpointUrlVariant+">");
            } else {
                queryString = queryString.replaceAll(Pattern.quote(PLACEHOLDER_ENDPOINTURL), "<"+describedDataset.getEndpointUrl()+">");
            }
            result.add(queryVariant);
        }
        result.add(queryString);

        return result;
    }
}
