
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const $rdf = require('rdflib');

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

function xmlHTTPRequestGetPromise(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject({
                    url: decodeURIComponent(url),
                    encodedUrl: url,
                    response: xhr.responseText,
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                url: decodeURIComponent(url),
                encodedUrl: url,
                response: xhr.responseText,
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function xmlhttpRequestJSONPromise(url) {
    return xmlHTTPRequestGetPromise(url).then(response => {
        return JSON.parse(response);
    });
}

function sparqlQueryPromise(endpoint, query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return xmlhttpRequestJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json')
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


xmlHTTPRequestGetPromise("http://lod-cloud.net/lod-data.json").then(jsonData => {
    console.log(JSON.stringify(jsonData));
    var store = $rdf.graph();
    Object.keys(jsonData).forEach(datasetKey => {
        var dataset = {
            identifier: jsonData[datasetKey].identifier,
            website: jsonData[datasetKey].website,
            domain: jsonData[datasetKey].domain,
            title: jsonData[datasetKey].title,
            namespace: jsonData[datasetKey].namespace,
            keywords: jsonData[datasetKey].keywords,
            contact: jsonData[datasetKey].contact_point,
            descriptions: jsonData[datasetKey].description,
            sparqls: jsonData[datasetKey].sparql
        }
        var datasetResource = KGI(dataset.identifier);
        
    });

})
.catch(e => {
    console.error(e);
})
.finally(() => {
    console.log("DONE");
});