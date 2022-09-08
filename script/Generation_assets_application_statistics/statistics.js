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

const queryPaginationSize = 500;
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
    fs.writeFile(filename, content, {flag:'a+'}, err => {
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
    // var myHeaders = new Headers();
    // header.forEach((value, key) => {
    //     myHeaders.set(key, value);
    // });
    // const myInit = {
    //     method: fetchInit.method,
    //     headers: myHeaders,
    //     mode: fetchInit.mode,
    //     cache: fetchInit.cache,
    //     redirect: fetchInit.redirect,
    //     keepalive: fetchInit.keepalive,
    //     agent: fetchInit.agent
    // };
    // const request = new Request(url, myInit);
    // return fetch(request)
    //     .then(response => {
    //         if (response.ok && response.status >= 200 && response.status < 400) {
    //             return response.blob().then(blob => blob.text())
    //         } else {
    //             throw new FetchError(url + " " + response.text);
    //         }
    //     }).catch(e => {
    //         console.error(e)
    //     })
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
        .finally(() => {
            return finalResult;
        })
}

function promisePoolExecution(promiseArray, poolSize = 10, offset = 0, nbRelaunch = 0) {
    var finalResult = [];
    try {
        if ((promiseArray.length > 0) && (offset < promiseArray.length) && nbRelaunch < 5) {
            var tmpArray = [];
            for (var i = 0; i < promiseArray.length && i < poolSize; i++) {
                tmpArray.push(promiseArray[i]);
            }
            var poolNumber = Math.floor(offset / poolSize);

            return Promise.allSettled(tmpArray).then(results => {
                if (results.every(result => result.status.localeCompare("fulfilled") == 0)) {
                    console.log("Pool n°", poolNumber, " fulfilled")
                    return promisePoolExecution(promiseArray, poolSize, offset + poolSize).then(nextResults => {
                        finalResult = results.concat(nextResults)
                        return finalResult;
                    }).catch(e => {
                        console.error(e);
                        console.log("ERROR in Pool n°", poolNumber, ", relaunched");
                        return promisePoolExecution(promiseArray, poolSize, offset, nbRelaunch + 1);
                    });
                }
                else {
                    console.log("Pool n°", Math.floor(offset / poolSize), " not fulfilled, relaunched")
                    return promisePoolExecution(promiseArray, poolSize, offset, nbRelaunch + 1);
                }
            });
        } else {
            return new Promise((resolve, reject) => resolve(finalResult));
        }
    } catch (error) {
        return new Promise((resolve, reject) => reject(error));
    }
}

// MAIN

function mapToCSV(matrix = new Map(), lineHeads = new Set(), columnHeads = new Set(), delimiter = csvDelimiter) {
    var resultArray = [];
    var header = "test;" + Array.from(columnHeads).join(delimiter);
    resultArray.push(header);
    lineHeads.forEach(testFileUrl => {
        var lineMap = matrix.get(testFileUrl);

        if (lineMap != undefined) {
            var lineString = matrixLineToCSV(lineMap, testFileUrl, columnHeads, delimiter);
            console.log(lineString)
            resultArray.push(lineString);
        }
    })
    return resultArray.join('\n');
}

function matrixLineToCSV(lineMap, lineHead, columnHeads, delimiter = csvDelimiter) {
    var lineString = lineHead + delimiter;
    columnHeads.forEach(graphUri => {
        if (lineMap != undefined) {
            var testGraphCount = lineMap.get(graphUri);
            if (testGraphCount != undefined) {
                lineString += testGraphCount + delimiter;
            } else {
                lineString += "0" + delimiter;
            }
        } else {
            lineString += "0" + delimiter;
        }
    })
    return lineString;
}

function createGraphCountSPARQLPromise(query, ref = "") {
    return sparqlQueryPromise(dekalogEndpoint, query).then(resultsObject => {
        var testGraphCountMap = new Map();
        resultsObject.results.bindings.forEach(binding => {
            var graph = binding.g.value;
            var count = binding.count.value;
            testGraphCountMap.set(graph, count);
        })
        return { test: ref, results: resultsObject, map: testGraphCountMap };
    }).catch(error => {
        console.error(error);
    }).finally(() => {
        return { test: ref, results: {}, map: new Map() }
    });
}

fetchURLGetJSONPromise("https://raw.githubusercontent.com/Wimmics/dekalog/statscript/script/Generation_assets_application_statistics/queries.json").then(queriesJson => {
    var endpointsPromiseArray = [];
    var triplesPromiseArray = [];
    var graphSet = new Set();
    var testFileSet = new Set();

    sparqlQueryPromise(dekalogEndpoint, "SELECT DISTINCT ?g { GRAPH ?g { ?s ?p ?o } }").then(jsonGraphQueryResults => {
        jsonGraphQueryResults.results.bindings.forEach(resultLine => {
            graphSet.add(resultLine.g.value)
        })

        return sparqlQueryPromise(dekalogEndpoint, "PREFIX dcterms: <http://purl.org/dc/terms/>  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX dqv: <http://www.w3.org/ns/dqv#> PREFIX kgi: <http://ns.inria.fr/kg/index#> PREFIX prov: <http://www.w3.org/ns/prov#> PREFIX void: <http://rdfs.org/ns/void#> PREFIX dcat: <http://www.w3.org/ns/dcat#> PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> PREFIX schema: <http://schema.org/> PREFIX voidex: <http://ldf.fi/void-ext#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX earl: <http://www.w3.org/ns/earl#> SELECT DISTINCT ?test {  GRAPH ?g { { ?curated  void:sparqlEndpoint ?endpointUrl . } UNION { ?curated sd:endpoint ?endpointUrl } ?metadataDescription kgi:curated ?curated . { ?curated prov:wasGeneratedBy ?activity . } UNION { ?metadataDescription prov:wasGeneratedBy ?activity }  ?activity prov:used ?test . } }").then(testListQueryResult => {
            testListQueryResult.results.bindings.forEach(resultLine => {
                testFileSet.add(resultLine.test.value)
            })

            function createPromises(testObject) {
                const testFileUrl = testObject[0];
                const testEndpointsQuery = testObject[1].endpoints;
                const testTriplesQuery = testObject[1].triples;
                var testEndpointsPromise = null;
                var testTriplesPromise = null;
                if (testEndpointsQuery.length > 0) {
                    testEndpointsPromise = createGraphCountSPARQLPromise(testEndpointsQuery, testFileUrl);
                }
                if (testTriplesQuery.length > 0) {
                    testTriplesPromise = createGraphCountSPARQLPromise(testTriplesQuery, testFileUrl);
                }

                return { ref: testFileUrl, endpoints: testEndpointsPromise, triples: testTriplesPromise }
            }


            var header = "test;" + Array.from(graphSet).join(csvDelimiter);
            writeFile("endpoints.csv", header);
            writeFile("triples.csv", header);
            Object.entries(queriesJson).forEach(testObject => {
                var promisesObject = createPromises(testObject);

                if (promisesObject.endpoints != null) {
                    endpointsPromiseArray.push(promisesObject.endpoints.then(resultObject => {
                        appendToFile("endpoints.csv", matrixLineToCSV(resultObject.map, resultObject.test, graphSet) + "\n");
                        return resultObject;
                    }));
                }
                if (promisesObject.triples != null) {
                    triplesPromiseArray.push(promisesObject.triples.then(resultObject => {
                        appendToFile("triples.csv", matrixLineToCSV(resultObject.map, resultObject.test, graphSet) + "\n");
                        return resultObject;
                    }));
                }
            })

            promisePoolExecution(endpointsPromiseArray).finally(() => {
                return promisePoolExecution(triplesPromiseArray)
            })
        })
    })
})