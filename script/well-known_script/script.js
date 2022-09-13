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

const dekalogEndpoint = "http://prod-dekalog.inria.fr/sparql";
var timeout = 5000;

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
            if(xhr.status >= 300 && xhr.status <= 308 ) {
                var location = xhr.getResponseHeader("Location");
                return fetchPromise(location, header);
            }
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

function loadToGraph(graph, url) {
    return fetchPromise(url).then(ttlDoc => {
        $rdf.parse(ttlDoc, graph, "http://ns.inria.fr/kg/index/", "text/turtle");
    }).catch(error => {
        console.error(error);
    })
}

function serializeStoreToTurtlePromise(store) {
    store.setPrefixForURI("dcat", "http://www.w3.org/ns/dcat#");
    store.setPrefixForURI("ex", "http://e.g/#");
    return new Promise((accept, reject) => {
        $rdf.serialize(null, store, undefined, 'text/turtle', function (err, str) {
            if (err != null) {
                reject(err);
            }
            accept(str)
        }, { namespaces: store.namespaces });
    })
}


var catalogFileUrl = "https://raw.githubusercontent.com/Wimmics/dekalog/master/catalogs/web_semantics_catalog.ttl";
var graph = $rdf.graph();
var csvDelimiter = "\t";

loadToGraph(graph, catalogFileUrl).then(() => {
    var sparqlEndpointUrls = graph.match(null, VOID("sparqlEndpoint"), null).map(triple => triple.object.value);
    console.log(sparqlEndpointUrls);
    writeFile("return.csv","")
    sparqlEndpointUrls.forEach(endpointUrl => {
        var simpleAddition = endpointUrl + ".well-known/void" 
        if(! endpointUrl.endsWith("/")) {
            simpleAddition = endpointUrl + "/.well-known/void" 
        }
        return fetchPromise(simpleAddition).then(content => {
            console.log(simpleAddition, content);
            var csvLine = endpointUrl + csvDelimiter + content.replaceAll("\n", "").replaceAll(csvDelimiter, "");
            appendToFile("return.csv", csvLine);
        }).then(() => {
            if(endpointUrl.endsWith("sparql") || endpointUrl.endsWith("sparql/")) {
                var sparqlReplaceAddition = endpointUrl.replace("sparql/", "");
                sparqlReplaceAddition = sparqlReplaceAddition + ".well-known/void" ;
                return fetchPromise(sparqlReplaceAddition).then(content => {
                    console.log(sparqlReplaceAddition, content);
                    var csvLine = endpointUrl + csvDelimiter + content.replaceAll("\n", "").replaceAll(csvDelimiter, "");
                    appendToFile("return.csv", csvLine);
                }).catch(error => {});
            }
        }).catch(error => {});
    })
    // serializeStoreToTurtlePromise(graph).then(ttl => {
    //     console.log(ttl)
    // })
})