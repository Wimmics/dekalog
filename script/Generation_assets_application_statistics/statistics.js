import * as $rdf from "rdflib";
import * as http from "node:http";
import * as https from "node:https";
import fetch from 'node-fetch';

var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
var XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
var DCAT = $rdf.Namespace("http://www.w3.org/ns/dcat#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var PROV = $rdf.Namespace("http://www.w3.org/ns/prov#");
var SCHEMA = $rdf.Namespace("http://schema.org/");
var VOID = $rdf.Namespace("http://rdfs.org/ns/void#");
var SD = $rdf.Namespace("http://www.w3.org/ns/sparql-service-description#");
var DCE = $rdf.Namespace("http://purl.org/dc/elements/1.1/");
var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
var SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
var PAV = $rdf.Namespace("http://purl.org/pav/");
var MOD = $rdf.Namespace("https://w3id.org/mod#");
var KGI = $rdf.Namespace("http://ns.inria.fr/kg/index/")

const queryPaginationSize = 500;

function fetchURLGetPromise(url) {
    const httpAgent = new http.Agent({
        keepAlive: true,
        rejectUnauthorized: false
    });
    const httpsAgent = new https.Agent({
        keepAlive: true,
        rejectUnauthorized: false
    });

    let settings = {
        method: "GET",
        agent: function (_parsedURL) {
            if (_parsedURL.protocol == 'http:') {
                return httpAgent;
            } else {
                return httpsAgent;
            }
        }
    };

    return fetch(decodeURIComponent(url), settings)
}

function fetchURLGetJSONPromise(url) {
    return fetchURLGetPromise(url).then(response => {
        return response.json();
    });
}

function sparqlQueryPromise(endpoint, query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return fetchURLGetJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json')
            .catch(error => {
                console.error(error)
            });
    }
    else {
        console.error(error)
    }
}

function paginatedSparqlQueryPromise(endpoint, query, limit = queryPaginationSize, offset = 0, finalResult = []) {
    var paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
    return sparqlQueryPromise(paginatedQuery)
        .then(queryResult => {
            queryResult.results.bindings.forEach(resultItem => {
                var finaResultItem = {};
                queryResult.head.vars.forEach(variable => {
                    finaResultItem[variable] = resultItem[variable];
                })
                finalResult.push(finaResultItem);
            })
            if (queryResult.results.bindings.length > 0) {
                return paginatedSparqlQueryPromise(endpoint, query, limit + queryPaginationSize, offset + queryPaginationSize, finalResult)
            }
        })
        .then(() => {
            return finalResult;
        })
        .catch(error => {
            console.error(error)
            return finalResult;
        })
        .finally(() => {
            return finalResult;
        })
}


// MAIN
fetch("file:///./queries.json").then(queriesJsonResponse => {
    return queriesJsonResponse.json()
}).then(queriesJson => {
    Object.entries(queriesJson).forEach(testFile => {
        console.log(testFile);
    })
}).catch(error => console.error(error));