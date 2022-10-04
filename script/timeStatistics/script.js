import * as $rdf from "rdflib";
import * as http from "node:http";
import * as https from "node:https";
import fetch, {
    FetchError,
    Headers,
    Request,
    Response
} from 'node-fetch';
import * as fs from "fs";
import XMLHttpRequest from "xmlhttprequest-ssl";
const xhr = new XMLHttpRequest();

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

const queryPaginationSize = 1000;
const dekalogEndpoint = "http://prod-dekalog.inria.fr/sparql";
const csvDelimiter = ";";

const httpAgent = new http.Agent({
    keepAlive: true,
    rejectUnauthorized: false
});
const httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false
});
const fetchInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'follow',
    keepalive: "true",
    agent: function (_parsedURL) {
        if (_parsedURL.protocol == 'http:') {
            return httpAgent;
        } else {
            return httpsAgent;
        }
    }
};

function appendToFile(filename, content) {
    fs.writeFile(filename, content, { flag: 'a+' }, err => {
        if (err) {
            console.error(err);
        }
    });
}

function writeFile(filename, content) {
    fs.writeFile(filename, content, err => {
        if (err) {
            console.error(err);
        }
    });
}

function fetchPromise(url, header = new Map()) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('load', function () {
            resolve(xhr.responseText);
        });

        xhr.addEventListener('error', reject);
        xhr.open('GET', url, true);
        xhr.responseType = header.get("responseType")
        header.forEach((value, key) => {
            xhr.setRequestHeader(key, value);
        })
        xhr.send();
    });
}

function fetchURLGetJSONPromise(url) {
    return fetchPromise(url, new Map([["responseType", "json"]])).then(response => {
        try {
            var jsonResult = JSON.parse(response);
            return jsonResult;
        } catch (error) {
            console.error(response)
            return new Promise((resolve, reject) => reject(error))
        }
    }).catch(error => {
        console.error(error);
    })
}

function sparqlQueryPromise(endpoint, query, timeout = 120000) {
    if (query.length > 0 && endpoint.length > 0 && (query.includes("SELECT") || query.includes("ASK"))) {
        return fetchURLGetJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=' + timeout)
    }
    else {
        throw new Error("Unexpected query type " + query);
    }
}

function paginatedSparqlQueryPromise(endpoint, query, limit = queryPaginationSize, offset = 0, finalResult = []) {
    var paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
    return sparqlQueryPromise(endpoint, paginatedQuery)
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
            } else {
                return finalResult;
            }
        })
        .then(() => {
            return finalResult;
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            return finalResult;
        })
}

var graphQuery = "SELECT DISTINCT ?g { GRAPH ?g { ?s ?p ?o } FILTER( STRSTARTS(str(?g), 'http://ns.inria.fr/indegx#' ) ) }";

sparqlQueryPromise(dekalogEndpoint, graphQuery)
    .then(graphResults => {
        graphResults.results.bindings.forEach(graphBinding => {
            var graph = graphBinding.g.value;

            const timeFilenamePrefix = "times.";
            const timeFilenameSuffix = ".passed.csv";
            const graphFilename = timeFilenamePrefix + graph.replace("http://ns.inria.fr/indegx#", "") + timeFilenameSuffix;

            var queryTimes = "PREFIX kgi: <http://ns.inria.fr/kg/index#> PREFIX prov: <http://www.w3.org/ns/prov#> PREFIX void: <http://rdfs.org/ns/void#> PREFIX dcat: <http://www.w3.org/ns/dcat#> PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> PREFIX schema: <http://schema.org/> PREFIX voidex: <http://ldf.fi/void-ext#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX earl: <http://www.w3.org/ns/earl#> SELECT DISTINCT ?endpointUrl ?startTime ?endTime { GRAPH <" + graph + "> { ?metadata kgi:curated ?data . ?data void:sparqlEndpoint ?endpointUrl . ?metadata kgi:trace ?trace . ?trace prov:startedAtTime ?startTime . ?trace prov:endedAtTime ?endTime . ?trace earl:result ?result . ?result earl:outcome earl:passed } } ";

            writeFile(graphFilename, "EndpointUrl;Start;End\n")
            paginatedSparqlQueryPromise(dekalogEndpoint, queryTimes).then(SPARQLresults => {
                SPARQLresults.forEach(binding => {
                    var endpointUrl = binding.endpointUrl.value;
                    var start = binding.startTime.value;
                    var end = binding.endTime.value;
                    var timeCorrectRegex = /\.[0-9][0-9][0-9]\+[0-9][0-9][0-9][0-9]/ig;
                    if (timeCorrectRegex.test(start)) {
                        start = start.replace(timeCorrectRegex, "");
                    }
                    if (timeCorrectRegex.test(end)) {
                        end = end.replace(timeCorrectRegex, "");
                    }
                    var csvLine = endpointUrl + ";" + start + ";" + end + "\n";
                    console.log(graphFilename, csvLine)
                    appendToFile(graphFilename, csvLine);
                })
                return;
            }).catch(error => {
                console.error(error)
            })
        })
        return;
    })


