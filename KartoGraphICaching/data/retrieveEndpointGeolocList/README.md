# Script to retrieve the geolocation of endpoints

The script in this folder are used to retrieve the geolocation data for KartoGraphI.
`endpointListFromServer.json` contains the result of the following query sent to the IndeGx SPARQL server:

```sparql
SELECT DISTINCT ?endpointUrl { 
?kb <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl  
FILTER( !  STRSTARTS( str(?endpointUrl), "http://ns.inria.fr/kg/index#" ) )
FILTER( !  STRSTARTS( str(?endpointUrl), "http://localhost" ) )
}
```

The script is run with `node endpointIpMapRetrieval.js` retrieved the geolocation data of each endpoint and add them to the file `data.json`.
