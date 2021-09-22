package fr.inria.kgindex.util;

import fr.inria.kgindex.data.Dataset;
import org.apache.jena.rdf.model.Resource;

import java.text.SimpleDateFormat;
import java.util.HashSet;
import java.util.Iterator;
import java.util.ListIterator;
import java.util.Set;
import java.util.regex.Pattern;

public class Utils {

    public static final SimpleDateFormat dateFormatter = new SimpleDateFormat("dd-MM-yyyy'T'HH:mm:ss");
    public static long queryTimeout = 30000;

    /**
     * Replace the placeholders in tests and queries. Placeholders include "$datasetDescription", "$endpointDescription", "$metadataDescription", "$graphList", "$LIMIT", "FROM", "$namespace", "$endpoint", "$name$". To take into account the usage of HTTP or HTTPS in endpoint URL, the result can be two different strings with endoint url variants instead of one.
     * @param queryString
     * @param describedDataset
     * @return a set of transformed strings.
     */
    public static Set<String> rewriteQueryPlaceholders(String queryString, Dataset describedDataset) {
        HashSet<String> result = new HashSet<String>();

        queryString = queryString.replaceAll(Pattern.quote("$datasetDescription"), "<"+describedDataset.getDatasetDescriptionResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote("$endpointDescription"), "<"+describedDataset.getEndpointDescriptionResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote("$metadataDescription"), "<"+describedDataset.getMetadataDescriptionResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote("$graphList"), "<"+describedDataset.getGraphListResource().getURI()+">");
        queryString = queryString.replaceAll(Pattern.quote("$LIMIT"), "");
        queryString = queryString.replaceAll(Pattern.quote("$name$"), describedDataset.getName());

        if(queryString.contains("$FROM") && describedDataset.areGraphsRequired()) {
            String fromString = "";
            Iterator<Resource> graphIt = describedDataset.getGraphList().iterator();
            while(graphIt.hasNext()) {
                Resource graph = graphIt.next();
                fromString += "FROM <" + graph.getURI() + ">\n";
            }
            queryString = queryString.replaceAll(Pattern.quote("$FROM"), fromString);
        } else {
            queryString = queryString.replaceAll(Pattern.quote("$FROM"), "");
        }

        if(queryString.contains("$namespace")) {
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
            queryString = queryString.replaceAll(Pattern.quote("$namespace"), namespaceString);
        }

        // URL de l'endpoint avec generation de variantes HTTP HTTPS
        if(queryString.contains("$endpoint")) {
            String queryVariant = queryString;
            String endpointUrlVariant = describedDataset.getEndpointUrl();
            if(describedDataset.getEndpointUrl().startsWith("http:")) {
                endpointUrlVariant = endpointUrlVariant.replace("http://", "https://");
                queryString = queryString.replaceAll(Pattern.quote("$endpoint"), "<"+describedDataset.getEndpointUrl()+">");
                queryVariant = queryVariant.replaceAll(Pattern.quote("$endpoint"), "<"+endpointUrlVariant+">");
            } else if(describedDataset.getEndpointUrl().startsWith("https:")) {
                endpointUrlVariant = endpointUrlVariant.replace("https://", "http://");
                queryString = queryString.replaceAll(Pattern.quote("$endpoint"), "<"+describedDataset.getEndpointUrl()+">");
                queryVariant = queryVariant.replaceAll(Pattern.quote("$endpoint"), "<"+endpointUrlVariant+">");
            } else {
                queryString = queryString.replaceAll(Pattern.quote("$endpoint"), "<"+describedDataset.getEndpointUrl()+">");
            }
            result.add(queryVariant);
        }
        result.add(queryString);

        return result;
    }

    public static String rewriteUrlWithPlaceholders(String url, Dataset describedDataset) {

        String urlWithLowerCaseName = url.replaceAll(Pattern.quote("$name$"), describedDataset.getName().toLowerCase());

        return urlWithLowerCaseName;
    }
}
