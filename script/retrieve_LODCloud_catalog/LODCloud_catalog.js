
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const $rdf = require('rdflib');
const fs = require('fs');

const http = require('node:http');
const https = require('node:https');

const fetch = require('node-fetch');

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

function isLiteral(value) {
    try {
        return value != undefined && value.length > 0 && $rdf.isLiteral($rdf.lit(value));
    } catch (e) {
        return false;
    }
}

function isURI(value) {
    try {
        return value != undefined && value.length > 0 && $rdf.isNamedNode($rdf.sym(value));
    } catch (e) {
        return false;
    }
}

function serializeStorePromise(store) {
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

var url = "http://lod-cloud.net/lod-data.json";
var domain = "http://e.g/#";

fetchURLGetJSONPromise(url)
    .then(json => {
        var entryMap = new Map();
        var store = $rdf.graph();

        for ([prop, object] of Object.entries(json)) {
            entryMap.set(prop, object);

            var objectUri = domain + encodeURI(prop);
            var datasetResource = $rdf.sym(objectUri);
            store.add(datasetResource, RDF("type"), DCAT("Dataset"));
            if (object.title != undefined & object.title != null && object.title.length > 0) {
                store.add(datasetResource, DCT("title"), $rdf.lit(object.title));
            }
            if (object.domain != undefined & object.domain != null && object.domain.length > 0) {
                store.add(datasetResource, SCHEMA("category"), $rdf.lit(object.domain));
            }
            if (object.license != undefined & object.license != null && object.license.length > 0) {
                if (isURI(object.license)) {
                    store.add(datasetResource, DCT("license"), $rdf.sym(object.license));
                }
            }
            if (object.contact_point != undefined & object.contact_point != null) {
                var contactBN = $rdf.blankNode();
                store.add(datasetResource, SCHEMA("contactPoint"), contactBN);
                store.add(contactBN, RDF("type"), SCHEMA("ContactPoint"));
                if (isLiteral(object.contact_point.email)) {
                    store.add(contactBN, FOAF("mbox"), $rdf.lit(object.contact_point.email));
                } else if (isURI(object.contact_point.email)) {
                    store.add(contactBN, FOAF("mbox"), $rdf.sym(object.contact_point.email));
                }
                if (isLiteral(object.contact_point.name)) {
                    store.add(contactBN, FOAF("name"), $rdf.lit(object.contact_point.name));
                }
            }
            if (object.website != undefined & object.website != null && object.website.length > 0) {
                if (isURI(object.website)) {
                    store.add(datasetResource, FOAF("page"), $rdf.sym(object.website))
                }
            }
            if (object.description != undefined & object.description != null) {
                Object.entries(object.description).forEach(([lang, description]) => {
                    if (isLiteral(description)) {
                        store.add(datasetResource, DCT("description"), $rdf.lit(description, lang));
                    }
                })
            }
            if (object.triples != undefined & object.triples != null && object.triples.length > 0) {
                if (isLiteral(object.triples)) {
                    store.add(datasetResource, VOID("triples"), $rdf.lit(object.triples, undefined, XSD("integer")));
                }
            }
            if (object.namespace != undefined & object.namespace != null && object.namespace.length > 0) {
                if (isLiteral(object.namespace)) {
                    store.add(datasetResource, VOID("uriSpace"), $rdf.lit(object.namespace));
                }
            }
            if (object.image != undefined & object.image != null && object.image.length > 0) {
                if (isLiteral(object.image)) {
                    store.add(datasetResource, FOAF("depiction"), $rdf.lit(object.image));
                } else if (isURI(object.image)) {
                    store.add(datasetResource, FOAF("depiction"), $rdf.sym(object.image));
                }
            }
            if (object.keywords != undefined & object.keywords != null && object.keywords.length > 0) {
                object.keywords.forEach(keyword => {
                    if (isURI(keyword)) {
                        store.add(datasetResource, DCAT("theme"), $rdf.sym(keyword));
                    } else if (isLiteral(keyword)) {
                        store.add(datasetResource, DCAT("keyword"), $rdf.lit(keyword));
                    }
                })
            }

            if (object.sparql != undefined & object.sparql != null && object.sparql.length > 0) {
                object.sparql.forEach(sparqlObject => {
                    if (isURI(sparqlObject.access_url)) {
                        var distribBN = $rdf.blankNode();
                        store.add(datasetResource, DCAT("distribution"), distribBN);
                        store.add(distribBN, RDF("type"), DCAT("Distribution"));
                        store.add(distribBN, DCAT("accessURL"), $rdf.sym(sparqlObject.access_url));
                        store.add(datasetResource, VOID("sparqlEndpoint"), $rdf.sym(sparqlObject.access_url));
                    }
                })
            }

            if (object.full_download != undefined & object.full_download != null && object.full_download.length > 0) {
                object.full_download.forEach(downloadObject => {
                    var distribBN = $rdf.blankNode();
                    store.add(datasetResource, DCAT("distribution"), distribBN);
                    store.add(distribBN, RDF("type"), DCAT("Distribution"));
                    if (isURI(downloadObject.download_url)) {
                        store.add(distribBN, DCAT("downloadURL"), $rdf.sym(downloadObject.download_url));
                    }
                    if (isLiteral(downloadObject.media_type)) {
                        store.add(distribBN, DCT("format"), $rdf.lit(downloadObject.media_type));
                    }
                    if (isLiteral(downloadObject.title)) {
                        store.add(distribBN, DCT("title"), $rdf.lit(downloadObject.title));
                    }
                    if (isLiteral(downloadObject.description)) {
                        store.add(distribBN, DCT("description"), $rdf.lit(downloadObject.description));
                    }
                })
            }
        }


        serializeStorePromise(store)
            .then(str => {
                const content = str;

                fs.writeFile("catalog.ttl", content, err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    //file written successfully
                })
            })
            .catch(e => {
                console.error(e);
            })
    })