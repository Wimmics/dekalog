import * as $rdf from "rdflib";
import * as http from "node:http";
import * as https from "node:https";
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
            if (xhr.status >= 300 && xhr.status <= 308) {
                var location = xhr.getResponseHeader("Location");
                if (url.localeCompare(location) != 0) {
                    fetchPromise(location, header).then(content => {
                        resolve(content);
                    })
                }
            } else {
                resolve(xhr.responseText);
            }
        });

        xhr.addEventListener('error', reject);
        xhr.open('GET', url, true);
        xhr.responseType = header.get("responseType")
        header.forEach((value, key) => {
            xhr.setRequestHeader(key, value);
        })
        xhr.send();
    }).catch(error => {
        if (error !== undefined) {
            console.error(error)
            return;
        }
    }).finally(() => {
        return;
    })
}

function fetchURLGetJSONPromise(url) {
    return fetchPromise(url, new Map([["responseType", "json"]])).then(response => {
        try {
            var jsonResult = JSON.parse(response);
            return jsonResult;
        } catch (error) {
            console.error(response)
            return;
        }
    }).catch(error => {
        if (error !== undefined) {
            console.error(error)
            return;
        }
    }).finally(() => {
        return;
    })
}

function loadToGraph(graph, url) {
    return fetchPromise(url).then(ttlDoc => {
        $rdf.parse(ttlDoc, graph, "http://ns.inria.fr/kg/index/", "text/turtle");
    }).catch(error => {
        if (error !== undefined) {
            console.error(error)
            return;
        }
    }).finally(() => {
        return;
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
    }).catch(error => {
        if (error !== undefined) {
            console.error(error)
            return;
        }

    }).finally(() => {
        return;
    })
}


const catalogFileUrl = "https://raw.githubusercontent.com/Wimmics/dekalog/well-knownscript/script/well-known_script/web_semantics_catalog.ttl";
var graph = $rdf.graph();
const csvDelimiter = '\t';
const tripleCountFilename = "return.csv";
const descriptionsFilename = "descriptions.json";
const headers = new Map([["Content-Type", "application/rdf+xml"], ["Content-Type", "text/turtle"], ["Content-Type", "application/rdf+json"]]);
var countDescription = 0;
var countUrl = 0;
var descriptionsObject = new Map();
var descriptionsSizeObject = new Map();

function createWellKnownFilePromise(url, endpointUrl) {
    return fetchPromise(url, headers).then(content => {
        if (content !== undefined) {
            var editedContent = content.split('\n').join(' ');
            editedContent = editedContent.split('\r').join(' ');
            editedContent = editedContent.split(csvDelimiter).join(' ');
            return new Promise((resolve, reject) => {
                try {
                    var kb = $rdf.graph();
                    $rdf.parse(editedContent, kb, "http://e.g", "text/turtle", () => {
                        if (!descriptionsObject.has(endpointUrl)) {
                            descriptionsObject.set(endpointUrl, new Map())
                        }
                        if (!descriptionsSizeObject.has(endpointUrl)) {
                            descriptionsSizeObject.set(endpointUrl, new Map())
                        }
                        if (kb.length > 1) {
                            countDescription++;
                            serializeStoreToTurtlePromise(kb).then(text => {
                                descriptionsObject.get(endpointUrl).set(url, text);
                                return;
                            })
                            descriptionsSizeObject.get(endpointUrl).set(url, kb.length);
                        } else {
                            descriptionsSizeObject.get(endpointUrl).set(url, 0);
                        }
                        resolve(descriptionsObject);
                    })
                } catch (error) {
                    reject(error)
                }
            }).finally(() => { return; });
        }
        return new Promise((resolve, reject) => reject);
    }).catch(error => {
        if (error !== undefined) {
            console.error(error)
            return;
        }

    }).finally(() => {
        console.log(countUrl);
        countUrl++;
        return;
    })
}

function writeDescriptionObjectToFile(descriptionsObject, filename) {
    writeFile(filename, "url" + csvDelimiter + "well-known" + csvDelimiter + "attribute" + "\n");
    descriptionsObject.forEach((urlMap, endpointUrl) => {
        urlMap.forEach((( kbSize, url) => {
            var csvLine = endpointUrl + csvDelimiter + url + csvDelimiter + kbSize + "\n";
            appendToFile(filename, csvLine);
        }));
    });
}

loadToGraph(graph, catalogFileUrl).then(() => {
    var sparqlEndpointUrls = graph.match(null, VOID("sparqlEndpoint"), null).map(triple => triple.object.value);
    console.log(sparqlEndpointUrls.length, "endpoints")
    var promiseArray = [];
    sparqlEndpointUrls.forEach(endpointUrl => {
        var simpleAddition = endpointUrl + ".well-known/void"
        if (!endpointUrl.endsWith("/")) {
            simpleAddition = endpointUrl + "/.well-known/void"
        }
        promiseArray.push(createWellKnownFilePromise(simpleAddition, endpointUrl));

        var sparqlReplaceAddition = endpointUrl.replace("sparql/", "");
        sparqlReplaceAddition = endpointUrl.replace("sparql", "");
        sparqlReplaceAddition = sparqlReplaceAddition + ".well-known/void";
        if ((endpointUrl.endsWith("sparql") || endpointUrl.endsWith("sparql/")) && (simpleAddition.localeCompare(sparqlReplaceAddition) != 0)) {
            promiseArray.push(createWellKnownFilePromise(sparqlReplaceAddition, endpointUrl).then(() => {
                writeDescriptionObjectToFile(descriptionsSizeObject, tripleCountFilename);
                writeFile(descriptionsFilename, JSON.stringify(descriptionsObject));
                return;
            }));
        }

        var endpointUrlObject = new URL(endpointUrl);
        var protocol = endpointUrlObject.protocol;
        var domain = endpointUrlObject.hostname;
        var basicUrl = protocol + "//" + domain;
        var basicAndSimpleAddition = basicUrl + ".well-known/void"
        if (!basicUrl.endsWith("/")) {
            basicAndSimpleAddition = basicUrl + "/.well-known/void"
        }
        if(basicAndSimpleAddition.localeCompare(simpleAddition) != 0  && (basicAndSimpleAddition.localeCompare(sparqlReplaceAddition) != 0)) {
            promiseArray.push(createWellKnownFilePromise(basicAndSimpleAddition, endpointUrl).then(() => {
                writeDescriptionObjectToFile(descriptionsSizeObject, tripleCountFilename);
                writeFile(descriptionsFilename, JSON.stringify(descriptionsObject));
                return;
            }));
        }
    })
    console.log(promiseArray.length, " urls")
    return Promise.allSettled(promiseArray).catch(error => {
        if (error !== undefined) {
            console.error(error)
            return;
        }
    }).finally(() => {
        return;
    })
}).then(() => {
    console.log("============== ", countDescription, "descriptions =================")
    console.log("============== DONE =================")
    return;
}).catch(error => {
    if (error !== undefined) {
        console.error(error)
        return;
    }

}).finally(() => {
    return;
})