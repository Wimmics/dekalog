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

function fetchPromise(url, header = new Map()) {
    var myHeaders = new Headers();
    header.forEach((value, key) => {
        myHeaders.set(key, value);
    });
    var myInit = {
        method: 'GET',
        headers: myHeaders,
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'follow'
    };
    return fetch(url, myInit)
        .then(response => {
            if (response.ok) {
                return response.blob().then(blob => blob.text())
            } else {
                throw response;
            }
        });
}

function fetchURLGetJSONPromise(url) {
    return fetchPromise(url).then(response => {
        return JSON.parse(response)
    }).catch(e => {
        console.error(url, e)
    });
}

function sparqlQueryPromise(endpoint, query) {
    if (query.length > 0 && endpoint.length > 0 && (query.includes("SELECT") || query.includes("ASK"))) {
        return fetchURLGetJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json')
            .catch(error => {
                console.error(query, error)
            });
    }
    else {
        throw new Error("Unexpected query type " + query);
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

function promisePoolExecution(promiseArray, poolSize = 5, offset = 0) {
    console.log(offset)
    var finalResult = [];
    if ((promiseArray.length > 0) && (offset < promiseArray.length)) {
        var tmpArray = [];
        for (var i = 0; i < promiseArray.length && i < poolSize; i++) {
            tmpArray.push(promiseArray[i]);
        }

        return Promise.all(tmpArray).then(results => {
            console.log("Pool n°", offset, "Results: ", results)
            return promisePoolExecution(promiseArray, poolSize, offset + poolSize).then(nextResults => {
                finalResult = results.concat(nextResults)
                return finalResult;
            });
        });
    } else {
        return new Promise((resolve, reject) => resolve(finalResult));
    }
}

// MAIN
const dekalogEndpoint = "http://prod-dekalog.inria.fr/sparql";

var fetchInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'follow'
};

function mapToCSV(matrix = new Map(), testFileSet = new Set(), graphSet = new Set(), delimiter = ";") {
    var resultArray = [];
    var header = "test;"+Array.from(graphSet).join(delimiter);
    resultArray.push(header);
    testFileSet.forEach(testFileUrl => {
        var lineMap = matrix.get(testFileUrl);
            
        var lineString = testFileUrl + ";";
        graphSet.forEach(graphUri => {
            if(lineMap != undefined) {
                var testGraphCount = lineMap.get(graphUri);
                if(testGraphCount != undefined) {
                    lineString += testGraphCount + ";";
                } else {
                    lineString += "0;";
                }
            } else {
                lineString += "0;";
            }
        })
        resultArray.push(lineString);
    })

    return resultArray.join('\n')
}

fetch("https://raw.githubusercontent.com/Wimmics/dekalog/statscript/script/Generation_assets_application_statistics/queries.json", fetchInit).then(queriesJsonResponse => {
    return queriesJsonResponse.json()
}).then(queriesJson => {
    var endpointsPromiseArray = []
    var countResultsEndpointsTestMap = new Map();
    var countResultsTriplesTestMap = new Map();
    var graphSet = new Set();
    var testFileSet = new Set();
    Object.entries(queriesJson).forEach(testObject => {

        const testFileUrl = testObject[0];
        const testEndpointsQuery = testObject[1].endpoints;
        const testTriplesQuery = testObject[1].triples;
        testFileSet.add(testFileUrl);
        if (testEndpointsQuery.length > 0) {
            var testEndpointsPromise = sparqlQueryPromise(dekalogEndpoint, testEndpointsQuery).then(results => {
                var testGraphCountMap = new Map();
                results.results.bindings.forEach(binding => {
                    var graph = binding.g.value;
                    var count = binding.count.value;
                    graphSet.add(graph);
                    testGraphCountMap.set(graph, count);
                })
                countResultsEndpointsTestMap.set(testFileUrl, testGraphCountMap);
                return results;
            })
            endpointsPromiseArray.push(testEndpointsPromise)
        }
        // if (testTriplesQuery.length > 0) {
        //     var testTriplesPromise = sparqlQueryPromise(dekalogEndpoint, testTriplesQuery).then(results => {
        //         var testGraphCountMap = new Map();
        //         results.results.bindings.forEach(binding => {
        //             var graph = binding.g.value;
        //             var count = binding.count.value;
        //             graphSet.add(graph);
        //             testGraphCountMap.set(graph, count);
        //         })
        //         countResultsTriplesTestMap.set(testFileUrl, testGraphCountMap);
        //         return results;
        //     })
        //     endpointsPromiseArray.push(testTriplesPromise)
        // }

    })
    promisePoolExecution(endpointsPromiseArray).then(results => {
        console.log(mapToCSV(countResultsEndpointsTestMap, testFileSet, graphSet))
        // console.log(mapToCSV(countResultsTriplesTestMap, testFileSet, graphSet))
        console.log("END")
    }).catch(error => console.error(error));

})