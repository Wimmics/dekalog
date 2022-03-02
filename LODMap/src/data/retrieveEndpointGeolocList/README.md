The script in the folder are used to retrieve the geolocation data for KartoGraphI.
`endpointListFromServer.json` contains the result of that query `SELECT DISTINCT ?endpointUrl { {  ?kb <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl } UNION { ?kb <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl } }` sent to the IndeGx SPARQL server.

The script is runned with `node endpointIpMapRetrieval.js` retrieved the geolocation data of each endpoint and add them to the file `data.json`.