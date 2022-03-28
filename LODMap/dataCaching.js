const fs = require('fs');
var md5 = require('md5');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const graphLists = require('./src/data/runSets.json');
const timezoneMap = require('./src/data/timezoneMap.json');
const endpointIpMap = require('./src/data/endpointIpGeoloc.json');
const dataFilePrefix = "./src/data/cache/";

const whiteListFilename = dataFilePrefix + "whiteLists.json";
const geolocFilename = dataFilePrefix + "geolocData.json";
const sparqlCoverageFilename = dataFilePrefix + "sparqlCoverageData.json";
const sparqlFeaturesFilename = dataFilePrefix + "sparqlFeaturesData.json";
const vocabEndpointFilename = dataFilePrefix + "vocabEndpointData.json";
const knownVocabsFilename = dataFilePrefix + "knownVocabsData.json";
const vocabKeywordsFilename = dataFilePrefix + "vocabKeywordsData.json";
const tripleCountFilename = dataFilePrefix + "tripleCountData.json";
const classCountFilename = dataFilePrefix + "classCountData.json";
const propertyCountFilename = dataFilePrefix + "propertyCountData.json";
const categoryTestCountFilename = dataFilePrefix + "categoryTestCountData.json";

const LOVFilename = dataFilePrefix + "knownVocabulariesLOV.json"


function generateGraphValueFilterClause(graphList) {
    var result = "FILTER( ";
    graphList.forEach((item, i) => {
        if (i > 0) {
            result += " || REGEX( str(?g) , '" + item + "' )";
        } else {
            result += "REGEX( str(?g) , '" + item + "' )";
        }
    });
    result += " )";
    return result;
}

function xmlHTTPRequestGetPromise(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject({
                    url: url,
                    response: xhr.responseText,
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                url: url,
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

function sparqlQueryPromise(query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return xmlhttpRequestJSONPromise('http://prod-dekalog.inria.fr/sparql?query=' + encodeURIComponent(query) + '&format=json');
    }
    else {
        throw "ERROR " + query;
    }
}

function whiteListFill() {
    console.log("whiteListFill START")
    return Promise.all(
        graphLists.map(graphListItem => {
            var graphList = graphListItem.graphs
            var endpointListQuery = 'SELECT DISTINCT ?endpointUrl WHERE {' +
                ' GRAPH ?g { ' +
                "{ ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
                "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
                '?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . ' +
                '} ' +
                generateGraphValueFilterClause(graphList) +
                '} ' +
                'GROUP BY ?endpointUrl';
            var graphListKey = md5(''.concat(graphList));
            return sparqlQueryPromise(endpointListQuery)
                .then(json => {
                    var endpointList = [];
                    json.results.bindings.forEach((item) => {
                        endpointList.push(item.endpointUrl.value);
                    });
                    return { graphKey:graphListKey, endpoints:endpointList};
                });
        }))
        .then(graphListItemArray => {
            var tmpWhiteListMap = {};
            graphListItemArray.forEach(graphListItem => {
                tmpWhiteListMap[graphListItem.graphKey] = graphListItem.endpoints;
            });
            try {
                var content = JSON.stringify(tmpWhiteListMap);
                fs.writeFileSync(whiteListFilename, content)
                console.log("whiteListFill END")
            } catch (err) {
                console.error(err)
            }
        }).catch(error => {
            console.log(error)
        });
}


function endpointMapfill() {
    console.log("endpointMapfill START")
    var endpointGeolocData = [];

    // Marked map with the geoloc of each endpoint
    return Promise.all(endpointIpMap.map((item) => {
        // Add the markers for each endpoints.
        var endpoint = item.key;
        var endpointItem = {};

        var timezoneSPARQLquery = "SELECT DISTINCT ?timezone { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <" + endpoint + "> . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <https://schema.org/broadcastTimezone> ?timezone } }";
        return sparqlQueryPromise(timezoneSPARQLquery)
            .then(jsonResponse => {
                var endpointTimezoneSPARQL = new Map();
                jsonResponse.results.bindings.forEach((itemResponse, i) => {
                    endpointTimezoneSPARQL.set(endpoint, itemResponse.timezone.value);
                });

                var ipTimezoneArrayFiltered = timezoneMap.filter(itemtza => itemtza.key == item.value.geoloc.timezone);
                var ipTimezone;
                if (ipTimezoneArrayFiltered.length > 0) {
                    ipTimezone = ipTimezoneArrayFiltered[0].value.utc_offset.padStart(6, '-').padStart(6, '+');
                }
                var sparqlTimezone;
                if (endpointTimezoneSPARQL.get(endpoint) != undefined) {
                    sparqlTimezone = endpointTimezoneSPARQL.get(endpoint).padStart(6, '-').padStart(6, '+');
                }

                endpointItem = { endpoint: endpoint, lat: item.value.geoloc.lat, lon: item.value.geoloc.lon, country: "", region: "", city: "", org: "", timezone: ipTimezone, sparqlTimezone: sparqlTimezone };
                if (item.value.geoloc.country != undefined) {
                    endpointItem.country = item.value.geoloc.country;
                }
                if (item.value.geoloc.regionName != undefined) {
                    endpointItem.region = item.value.geoloc.regionName;
                }
                if (item.value.geoloc.city != undefined) {
                    endpointItem.city = item.value.geoloc.city;
                }
                if (item.value.geoloc.org != undefined) {
                    endpointItem.org = item.value.geoloc.org;
                }
                var labelQuery = "SELECT DISTINCT ?label  { GRAPH ?g { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> <" + endpoint + "> . { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } UNION { ?dataset <http://purl.org/dc/terms/title> ?label } UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } UNION { ?dataset <http://schema.org/name> ?label } . }  }";
                return labelQuery;
            })
            .then(labelQuery => sparqlQueryPromise(labelQuery)
                .then(responseLabels => {
                    var popupString = "<table> <thead> <tr> <th colspan='2'> <a href='" + endpointItem.endpoint + "' >" + endpointItem.endpoint + "</a> </th> </tr> </thead>";
                    popupString += "</body>"
                    if (endpointItem.country != undefined) {
                        popupString += "<tr><td>Country: </td><td>" + endpointItem.country + "</td></tr>";
                    }
                    if (endpointItem.region != undefined) {
                        popupString += "<tr><td>Region: </td><td>" + endpointItem.region + "</td></tr>";
                    }
                    if (endpointItem.city != undefined) {
                        popupString += "<tr><td>City: </td><td>" + endpointItem.city + "</td></tr>";
                    }
                    if (endpointItem.org != undefined) {
                        popupString += "<tr><td>Organization: </td><td>" + endpointItem.org + "</td></tr>";
                    }
                    if (endpointItem.timezone != undefined) {
                        var badTimezone = endpointItem.timezone.localeCompare(endpointItem.sparqlTimezone) != 0;
                        if (badTimezone) {
                            popupString += "<tr><td>Timezone of endpoint URL: </td><td>" + endpointItem.timezone + "</td></tr>";
                            popupString += "<tr><td>Timezone declared by endpoint: </td><td>" + endpointItem.sparqlTimezone + "</td></tr>";
                        }
                    }
                    if (responseLabels.results.bindings.size > 0) {
                        popupString += "<tr><td colspan='2'>" + responseLabels + "</td></tr>";
                    }
                    popupString += "</tbody>"
                    popupString += "</table>"
                    endpointItem.popupHTML = popupString;
                })
                .catch(error => {
                    console.log(error)
                })
            ).then(() => {
                endpointGeolocData.push(endpointItem);
            })
            .catch(error => {
                console.log(error)
            })
    }))
        .finally(() => {
            try {
                var content = JSON.stringify(endpointGeolocData);
                fs.writeFileSync(geolocFilename, content)
                console.log("endpointMapfill END")
            } catch (err) {
                console.error(err)
            }
        })
        .catch(error => {
            console.log(error)
        })

}

function SPARQLCoverageFill() {
    console.log("SPARQLCoverageFill START")
    // Create an histogram of the SPARQLES rules passed by endpoint.
    var sparqlesFeatureQuery = 'SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) { ' +
        'GRAPH ?g { ' +
        '?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . ' +
        '?metadata <http://ns.inria.fr/kg/index#curated> ?base . ' +
        'OPTIONAL { ' +
        '?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . ' +
        'FILTER(CONTAINS(str(?activity), ?sparqlNorm)) ' +
        'VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } ' +
        '} ' +
        '} ' +
        '} ' +
        'GROUP BY ?endpoint ?sparqlNorm ' +
        'ORDER BY DESC( ?sparqlNorm)';
    var jsonBaseFeatureSparqles = [];
    var sparqlFeaturesDataArray = [];
    return sparqlQueryPromise(sparqlesFeatureQuery)
        .then(json => {
            var endpointSet = new Set();
            var sparql10Map = new Map();
            var sparql11Map = new Map();
            json.results.bindings.forEach((bindingItem, i) => {
                var endpointUrl = bindingItem.endpoint.value;
                endpointSet.add(endpointUrl);
                var feature = undefined;
                if (bindingItem.sparqlNorm != undefined) {
                    feature = bindingItem.sparqlNorm.value;
                }
                var count = bindingItem.count.value;
                if (feature == undefined || feature.localeCompare("SPARQL10") == 0) {
                    sparql10Map.set(endpointUrl, Number(count));
                }
                if (feature == undefined || feature.localeCompare("SPARQL11") == 0) {
                    sparql11Map.set(endpointUrl, Number(count));
                }
            });

            endpointSet.forEach((item) => {
                var sparql10 = sparql10Map.get(item);
                var sparql11 = sparql11Map.get(item);
                if (sparql10 == undefined) {
                    sparql10 = 0;
                }
                if (sparql11 == undefined) {
                    sparql11 = 0;
                }
                var sparqlJSONObject = { 'endpoint': item, 'sparql10': sparql10, 'sparql11': sparql11, 'sparqlTotal': (sparql10 + sparql11) };
                jsonBaseFeatureSparqles.push(sparqlJSONObject);
            });


        })
        .then(() => {
            const sparqlFeatureQuery = 'SELECT DISTINCT ?endpoint ?activity { ' +
                'GRAPH ?g { ' +
                '?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . ' +
                '?metadata <http://ns.inria.fr/kg/index#curated> ?base . ' +
                'OPTIONAL { ' +
                '?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . ' +
                'FILTER(CONTAINS(str(?activity), ?sparqlNorm)) ' +
                'VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } ' +
                '} ' +
                '} ' +
                '} ' +
                'GROUP BY ?endpoint ?activity ' +
                'ORDER BY DESC( ?endpoint)';
            var endpointFeatureMap = new Map();
            var featuresShortName = new Map();
            return sparqlQueryPromise(sparqlFeatureQuery)
                .then(json => {
                    endpointFeatureMap = new Map();
                    var featuresSet = new Set();
                    json.results.bindings.forEach(bindingItem => {
                        const endpointUrl = bindingItem.endpoint.value;
                        if (!endpointFeatureMap.has(endpointUrl)) {
                            endpointFeatureMap.set(endpointUrl, new Set());
                        }
                        if (bindingItem.activity != undefined) {
                            const activity = bindingItem.activity.value;
                            if (!endpointFeatureMap.has(endpointUrl)) {
                                endpointFeatureMap.set(endpointUrl, new Set());
                            }
                            featuresSet.add(activity);
                            if (featuresShortName.get(activity) == undefined) {
                                featuresShortName.set(activity, activity.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/SPARQLES_", "sparql10:").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/SPARQLES_", "sparql11:").replace(".ttl#activity", ""))
                            }
                            endpointFeatureMap.get(endpointUrl).add(featuresShortName.get(activity));
                        }
                    });
                    endpointFeatureMap.forEach((featureSet, endpointUrl, map) => {
                        var sortedFeatureArray = [...featureSet].sort((a, b) => a.localeCompare(b));
                        sparqlFeaturesDataArray.push({ endpoint: endpointUrl, features: sortedFeatureArray });
                    });

                    sparqlFeaturesDataArray.sort((a, b) => {
                        return a.endpoint.localeCompare(b.endpoint);
                    });
                })
        })
        .finally(() => {
            try {
                var content = JSON.stringify(jsonBaseFeatureSparqles);
                fs.writeFileSync(sparqlCoverageFilename, content)
            } catch (err) {
                console.error(err)
            }
            try {
                var content = JSON.stringify(sparqlFeaturesDataArray);
                fs.writeFileSync(sparqlFeaturesFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("SPARQLCoverageFill END")
        })
        .catch(error => {
            console.log(error)
        })
}

function vocabFill() {
    console.log("vocabFill START")
    // Create an force graph with the graph linked by co-ocurrence of vocabularies
    sparqlesVocabulariesQuery = "SELECT DISTINCT ?endpointUrl ?vocabulary { GRAPH ?g { " +
        "{ ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
        "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?dataset . " +
        "?dataset <http://rdfs.org/ns/void#vocabulary> ?vocabulary " +
        "} " +
        " } " +
        "GROUP BY ?endpointUrl ?vocabulary ";
    var knownVocabularies = new Set();
    var rawGatherVocab = new Map();
    var gatherVocabData = [];
    var rawVocabSet = new Set();
    var vocabSet = new Set();
    var keywordSet = new Set();
    var vocabKeywordData = [];

    return sparqlQueryPromise(sparqlesVocabulariesQuery)
        .then(json => {

            var endpointSet = new Set();
            json.results.bindings.forEach((bindingItem, i) => {
                var vocabulariUri = bindingItem.vocabulary.value;
                var endpointUri = bindingItem.endpointUrl.value;
                endpointSet.add(endpointUri);
                rawVocabSet.add(vocabulariUri);
                if (!rawGatherVocab.has(endpointUri)) {
                    rawGatherVocab.set(endpointUri, new Set());
                }
                rawGatherVocab.get(endpointUri).add(vocabulariUri);
            });

            // https://obofoundry.org/ // No ontology URL available in ontology description
            // http://prefix.cc/context // done
            // http://data.bioontology.org/resource_index/resources?apikey=b86b12d8-dc46-4528-82e3-13fbdabf5191 // No ontology URL available in ontology description
            // https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list // done

            // Retrieval of the list of LOV vocabularies to filter the ones retrieved in the index
        })
        .then(xmlhttpRequestJSONPromise("https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list")
            .then(responseLOV => {
                responseLOV.forEach((item, i) => {
                    knownVocabularies.add(item.uri)
                });
                try {
                    var content = JSON.stringify(responseLOV);
                    fs.writeFileSync(LOVFilename, content)
                } catch (err) {
                    console.error(err)
                }
            }))
        .then(xmlhttpRequestJSONPromise("http://prefix.cc/context")
            .then(responsePrefixCC => {
                for (var prefix of Object.keys(responsePrefixCC['@context'])) {
                    knownVocabularies.add(responsePrefixCC['@context'][prefix])
                };
            }))
        .then(xmlhttpRequestJSONPromise("https://www.ebi.ac.uk/ols/api/ontologies?page=0&size=1000")
            .then(responseOLS => {
                responseOLS._embedded.ontologies.forEach(ontologyItem => {
                    if (ontologyItem.config.baseUris.length > 0) {
                        var ontology = ontologyItem.config.baseUris[0]
                        knownVocabularies.add(ontology);
                    }
                });
            }))
        .then(() => {
            // Filtering according to ontology repositories
            rawVocabSet.forEach(vocabulariUri => {
                if (knownVocabularies.has(vocabulariUri)) {
                    vocabSet.add(vocabulariUri);
                }
            });
            rawGatherVocab.forEach((vocabulariUriSet, endpointUri, map) => {
                gatherVocabData.push({ endpoint: endpointUri, vocabularies: [...vocabulariUriSet] })
            });

            var queryArray = [];
            var vocabArray = [...vocabSet];
            for (var i = 20; i < vocabArray.length + 20; i += 20) {
                var vocabSetSlice = vocabArray.slice(i - 20, i); // Slice the array into arrays of 20 elements
                // Endpoint and vocabulary keywords graph
                var vocabularyQueryValues = "";
                vocabSetSlice.forEach((item, i) => {
                    vocabularyQueryValues += "<" + item + ">";
                    vocabularyQueryValues += " ";
                });

                var keywordLOVQuery = "SELECT DISTINCT ?vocabulary ?keyword { " +
                    "GRAPH <https://lov.linkeddata.es/dataset/lov> { " +
                    "   ?vocabulary a <http://purl.org/vocommons/voaf#Vocabulary> . " +
                    "   ?vocabulary <http://www.w3.org/ns/dcat#keyword> ?keyword . " +
                    "} " +
                    "VALUES ?vocabulary { " + vocabularyQueryValues + " } " +
                    "}"
                queryArray.push(xmlhttpRequestJSONPromise("https://lov.linkeddata.es/dataset/lov/sparql?query=" + encodeURIComponent(keywordLOVQuery) + "&format=json"));
            }

            return Promise.all(queryArray)
                .then(jsonKeywordsArray => {
                    var vocabKeywordMap = new Map();
                    jsonKeywordsArray.forEach(jsonKeywords => {
                        jsonKeywords.results.bindings.forEach((keywordItem, i) => {
                            var keyword = keywordItem.keyword.value;
                            var vocab = keywordItem.vocabulary.value;
                            if (vocabKeywordMap.get(vocab) == undefined) {
                                vocabKeywordMap.set(vocab, []);
                            }
                            vocabKeywordMap.get(vocab).push(keyword);

                            keywordSet.add(keyword);
                        });
                    })
                    vocabKeywordMap.forEach((keywordList, vocab) => {
                        vocabKeywordData.push({ vocabulary: vocab, keywords: keywordList })
                    })
                })
        })
        .finally(() => {
            try {
                var content = JSON.stringify(gatherVocabData);
                fs.writeFileSync(vocabEndpointFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
        .finally(() => {
            try {
                var content = JSON.stringify([...knownVocabularies]);
                fs.writeFileSync(knownVocabsFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
        .finally(() => {
            try {
                var content = JSON.stringify(vocabKeywordData);
                fs.writeFileSync(vocabKeywordsFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("vocabFill END")
        })
        .catch(error => {
            console.log(error)
        })
}

function tripleDataFill() {
    console.log("tripleDataFill START")
    // Scatter plot of the number of triples through time
    var triplesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?base <http://rdfs.org/ns/void#triples> ?rawO ." +
        "}" +
        "} GROUP BY ?g ?endpointUrl ?o ORDER BY DESC(?g) DESC(?endpointUrl)";
    var endpointTripleData = [];
    return sparqlQueryPromise(triplesSPARQLquery)
        .then(json => {
            json.results.bindings.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var endpointUrl = itemResult.endpointUrl.value;
                var triples = Number.parseInt(itemResult.o.value);
                endpointTripleData.push({endpoint:endpointUrl, graph:graph, triples:triples})
            });
        })
        .then(() => {
            try {
                var content = JSON.stringify(endpointTripleData);
                fs.writeFileSync(tripleCountFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("tripleDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function classDataFill() {
    console.log("classDataFill START")
    // Scatter plot of the number of classes through time
    var classesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) ?modifDate { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
        "?base <http://rdfs.org/ns/void#classes> ?rawO ." +
        "}" +
        "} GROUP BY ?g ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
    var endpointClassCountData = [];
    return sparqlQueryPromise(classesSPARQLquery)
        .then(json => {
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
            var endpointUrl = itemResult.endpointUrl.value;
            var triples = Number.parseInt(itemResult.o.value);
            endpointClassCountData.push({endpoint:endpointUrl, graph:graph, classes:triples})
        });

    })
    .then(() => {
        try {
            var content = JSON.stringify(endpointClassCountData);
            fs.writeFileSync(classCountFilename, content)
        } catch (err) {
            console.error(err)
        }
        console.log("classDataFill END")
    })
    .catch(error => {
        console.log(error)
    });
}

function propertyDataFill() {
    console.log("propertyDataFill START")
    // scatter plot of the number of properties through time
    var propertiesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?base <http://rdfs.org/ns/void#properties> ?rawO ." +
        "}" +
        "} GROUP BY ?endpointUrl ?g ?o ORDER BY DESC(?g) DESC(?endpointUrl) ";
        var endpointPropertyCountData = [];
    return sparqlQueryPromise(propertiesSPARQLquery)
    .then(json => {
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
            var endpointUrl = itemResult.endpointUrl.value;
            var properties = Number.parseInt(itemResult.o.value);
            endpointPropertyCountData.push({endpoint:endpointUrl, graph:graph, properties:properties})
        });
    })
    .then(() => {
        try {
            var content = JSON.stringify(endpointPropertyCountData);
            fs.writeFileSync(propertyCountFilename, content)
        } catch (err) {
            console.error(err)
        }
        console.log("propertyDataFill END")
    })
    .catch(error => {
        console.log(error)
    });
}

function categoryTestCountFill() {
    console.log("categoryTestCountFill START")
    var testCategoryData = [];
    // Number of tests passed by test categories
    var testCategoryQuery = "SELECT DISTINCT ?g ?category (count(DISTINCT ?test) AS ?count) ?endpointUrl { " +
        "GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl ." +
        "?metadata <http://purl.org/dc/terms/modified> ?modifDate . " +
        "?trace <http://www.w3.org/ns/earl#test> ?test . " +
        "?trace <http://www.w3.org/ns/earl#result> ?result . " +
        "?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#passed> . " +
        "FILTER(STRSTARTS(str(?test), ?category)) " +
        "VALUES ?category { " +
        "'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/' " +
        "'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/' " +
        "'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/' " +
        "'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/' " +
        "'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/' " +
        "'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/' " +
        "}" +
        "}  " +
        "} GROUP BY ?g ?category ?endpointUrl";
    return sparqlQueryPromise(testCategoryQuery)
    .then(json => {
        json.results.bindings.forEach((itemResult, i) => {
            var category = itemResult.category.value;
            var count = itemResult.count.value;
            var endpoint = itemResult.endpointUrl.value;
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
            testCategoryData.push({category:category, graph:graph, endpoint:endpoint, count:count });
        });
    })
    .then(() => {
        try {
            var content = JSON.stringify(testCategoryData);
            fs.writeFileSync(categoryTestCountFilename, content)
        } catch (err) {
            console.error(err)
        }
        console.log("categoryTestCountFill END")
    })
    .catch(error => {
        console.log(error)
    });
}

whiteListFill()
    .finally(endpointMapfill())
    .finally(SPARQLCoverageFill())
    .finally(vocabFill())
    .finally(tripleDataFill())
    .finally(classDataFill())
    .finally(propertyDataFill())
    .finally(categoryTestCountFill())
    .catch(error => {
        console.log(error)
    });