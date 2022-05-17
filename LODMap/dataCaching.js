const fs = require('fs');
const dayjs = require('dayjs')
const md5 = require('md5');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const duration = require('dayjs/plugin/duration');
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const dataFilePrefix = "./src/data/cache/";
const graphLists = require(dataFilePrefix + 'runSets.json');
const timezoneMap = require(dataFilePrefix + 'timezoneMap.json');
const endpointIpMap = require(dataFilePrefix + 'endpointIpGeoloc.json');
const queryPaginationSize = 10000;

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
const totalCategoryTestCountFilename = dataFilePrefix + "totalCategoryTestCountData.json";
const endpointTestsDataFilename = dataFilePrefix + "endpointTestsData.json";
const totalRuntimeDataFilename = dataFilePrefix + "totalRuntimeData.json";
const averageRuntimeDataFilename = dataFilePrefix + "averageRuntimeData.json";
const classPropertyDataFilename = dataFilePrefix + "classPropertyData.json";
const datasetDescriptionDataFilename = dataFilePrefix + "datasetDescriptionData.json";
const shortUriDataFilename = dataFilePrefix + "shortUriData.json";
const rdfDataStructureDataFilename = dataFilePrefix + "rdfDataStructureData.json";
const readableLabelDataFilename = dataFilePrefix + "readableLabelData.json";
const blankNodesDataFilename = dataFilePrefix + "blankNodesData.json";

const LOVFilename = dataFilePrefix + "knownVocabulariesLOV.json"

// Parse the date in any format
function parseDate(input, format) {
    return dayjs(input, format);
}

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

function sparqlQueryPromise(query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return xmlhttpRequestJSONPromise('http://prod-dekalog.inria.fr/sparql?query=' + encodeURIComponent(query) + '&format=json');
    }
    else {
        throw "ERROR " + query;
    }
}

function paginatedSparqlQueryPromise(query, limit = queryPaginationSize, offset = 0, finalResult = []) {
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
        if(queryResult.results.bindings.length > 0) {
            return paginatedSparqlQueryPromise(query, limit + queryPaginationSize, offset + queryPaginationSize, finalResult)
        } 
    })
    .then(() => {
        return finalResult;
    })
    .catch(error => {
        console.log(error)
        return finalResult;
    })
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
            return paginatedSparqlQueryPromise(endpointListQuery)
                .then(json => {
                    var endpointList = [];
                    json.forEach((item) => {
                        endpointList.push(item.endpointUrl.value);
                    });
                    return { graphKey: graphListKey, endpoints: endpointList };
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
        return paginatedSparqlQueryPromise(timezoneSPARQLquery)
            .then(jsonResponse => {
                var endpointTimezoneSPARQL = new Map();
                jsonResponse.forEach((itemResponse, i) => {
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
                        popupString += "<tr><td>Timezone of endpoint URL: </td><td>" + endpointItem.timezone + "</td></tr>";
                        if(endpointItem.sparqlTimezone != undefined) {
                            var badTimezone = endpointItem.timezone.localeCompare(endpointItem.sparqlTimezone) != 0;
                            if (badTimezone) {
                                popupString += "<tr><td>Timezone declared by endpoint: </td><td>" + endpointItem.sparqlTimezone + "</td></tr>";
                            }
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
        'GROUP BY ?endpoint ?sparqlNorm ';
    var jsonBaseFeatureSparqles = [];
    var sparqlFeaturesDataArray = [];
    return paginatedSparqlQueryPromise(sparqlesFeatureQuery)
        .then(json => {
            var endpointSet = new Set();
            var sparql10Map = new Map();
            var sparql11Map = new Map();
            json.forEach((bindingItem, i) => {
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
                'GROUP BY ?endpoint ?activity ';
            var endpointFeatureMap = new Map();
            var featuresShortName = new Map();
            return paginatedSparqlQueryPromise(sparqlFeatureQuery)
                .then(json => {
                    endpointFeatureMap = new Map();
                    var featuresSet = new Set();
                    json.forEach(bindingItem => {
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

    return paginatedSparqlQueryPromise(sparqlesVocabulariesQuery)
        .then(json => {

            var endpointSet = new Set();
            json.forEach((bindingItem, i) => {
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
    var triplesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?base <http://rdfs.org/ns/void#triples> ?rawO ." +
        "}" +
        "} GROUP BY ?g ?date ?endpointUrl ?o";
    var endpointTripleData = [];
    return paginatedSparqlQueryPromise(triplesSPARQLquery)
        .then(json => {
            json.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var date = parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                var endpointUrl = itemResult.endpointUrl.value;
                var triples = Number.parseInt(itemResult.o.value);
                endpointTripleData.push({ endpoint: endpointUrl, graph: graph, date:date, triples: triples })
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
    var classesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) ?modifDate { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?base <http://rdfs.org/ns/void#classes> ?rawO ." +
        "}" +
        "} GROUP BY ?g ?date ?endpointUrl ?modifDate ?o";
    var endpointClassCountData = [];
    return paginatedSparqlQueryPromise(classesSPARQLquery)
        .then(json => {
            json.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var date = parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                var endpointUrl = itemResult.endpointUrl.value;
                var triples = Number.parseInt(itemResult.o.value);
                endpointClassCountData.push({ endpoint: endpointUrl, graph: graph, date:date, classes: triples })
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
    var propertiesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?base <http://rdfs.org/ns/void#properties> ?rawO ." +
        "}" +
        "} GROUP BY ?endpointUrl ?g ?date ?o";
    var endpointPropertyCountData = [];
    return paginatedSparqlQueryPromise(propertiesSPARQLquery)
        .then(json => {
            json.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var endpointUrl = itemResult.endpointUrl.value;
                var properties = Number.parseInt(itemResult.o.value);
                var date = parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                endpointPropertyCountData.push({ endpoint: endpointUrl, graph: graph, date:date, properties: properties })
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
    var testCategoryQuery = "SELECT DISTINCT ?g ?date ?category (count(DISTINCT ?test) AS ?count) ?endpointUrl { " +
        "GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl ." +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
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
        "} GROUP BY ?g ?date ?category ?endpointUrl";
    return paginatedSparqlQueryPromise(testCategoryQuery)
        .then(json => {
            json.forEach((itemResult, i) => {
                var category = itemResult.category.value;
                var count = itemResult.count.value;
                var endpoint = itemResult.endpointUrl.value;
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var date = parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                testCategoryData.push({ category: category, graph: graph, date:date, endpoint: endpoint, count: count });
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

function totalCategoryTestCountFill() {
    console.log("totalCategoryTestCountFill START")
    // Number of tests passed by test categories
    var testCategoryQuery = "SELECT DISTINCT ?category ?g ?date (count(DISTINCT ?test) AS ?count) ?endpointUrl { " +
        "GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl ." +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
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
        "} GROUP BY ?g ?date ?category ?endpointUrl";
    var totalTestCategoryData = [];
    return paginatedSparqlQueryPromise(testCategoryQuery).then(json => {
        json.forEach((itemResult, i) => {
            var category = itemResult.category.value;
            var count = itemResult.count.value;
            var endpoint = itemResult.endpointUrl.value;
            var graph = itemResult.g.value;
            var date = parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');

            totalTestCategoryData.push({ category: category, endpoint: endpoint, graph: graph, date:date, count: count })
        });
    })
        .then(() => {
            try {
                var content = JSON.stringify(totalTestCategoryData);
                fs.writeFileSync(totalCategoryTestCountFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("totalCategoryTestCountFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function endpointTestsDataFill() {
    console.log("endpointTestsDataFill START")

    var appliedTestQuery = "SELECT DISTINCT ?endpointUrl ?g ?date ?rule { " +
        "GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?curated . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?curated <http://www.w3.org/ns/prov#wasGeneratedBy> ?rule . " +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "} " +
        "}";
    var endpointTestsData = [];
    return paginatedSparqlQueryPromise(appliedTestQuery)
        .then(json => {
            json.forEach((item, i) => {
                var endpointUrl = item.endpointUrl.value;
                var rule = item.rule.value;
                var graph = item.g.value;
                var date = parseDate(item.date.value, 'YYYY-MM-DDTHH:mm:ss');

                endpointTestsData.push({ endpoint: endpointUrl, activity: rule, graph: graph, date:date })
            });
        })
        .then(() => {
            try {
                var content = JSON.stringify(endpointTestsData);
                fs.writeFileSync(endpointTestsDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("endpointTestsDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function totalRuntimeDataFill() {
    console.log("totalRuntimeDataFill START")
    var maxMinTimeQuery = "SELECT DISTINCT ?g ?endpointUrl ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { " +
    " GRAPH ?g { " +
    "?metadata <http://ns.inria.fr/kg/index#curated> ?data , ?endpoint . " + 
    "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
    "?metadata <http://purl.org/dc/terms/modified> ?date . " +
    "?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . " +
    "?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . " +
    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
    "} "+
    "} ";
    var totalRuntimeData = []
    return paginatedSparqlQueryPromise(maxMinTimeQuery).then(jsonResponse => {
        jsonResponse.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
            var date = parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
            var start = parseDate(itemResult.start.value, 'YYYY-MM-DDTHH:mm:ss');
            var end = parseDate(itemResult.end.value, 'YYYY-MM-DDTHH:mm:ss');
            var endpointUrl = itemResult.endpointUrl.value;
            var runtimeData = dayjs.duration(end.diff(start));
            totalRuntimeData.push({ graph: graph, endpoint: endpointUrl, date:date, start: start, end: end, runtime: runtimeData })
        });
    })
        .then(() => {
            try {
                var content = JSON.stringify(totalRuntimeData);
                fs.writeFileSync(totalRuntimeDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("totalRuntimeDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function averageRuntimeDataFill() {
    console.log("averageRuntimeDataFill START")
    var maxMinTimeQuery = "SELECT DISTINCT ?g ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end)" +
        " { " +
        "GRAPH ?g {" +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?data , ?endpoint . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . " +
        "?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . " +
        "} " +
        "}";
    var numberOfEndpointQuery = "SELECT DISTINCT ?g (COUNT(?endpointUrl) AS ?count) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?dataset . { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } } }";
    var averageRuntimeData = [];
    var graphStartEndMap = new Map();
    return Promise.all([
        paginatedSparqlQueryPromise(maxMinTimeQuery)
            .then(jsonResponse => {
                jsonResponse.forEach((itemResult, i) => {
                    var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                    var date = parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                    var start = parseDate(itemResult.start.value, 'YYYY-MM-DDTHH:mm:ss');
                    var end = parseDate(itemResult.end.value, 'YYYY-MM-DDTHH:mm:ss');
                    var runtime = dayjs.duration(end.diff(start));

                    if(graphStartEndMap.get(graph) == undefined) {
                        graphStartEndMap.set(graph, {  });
                    }
                    graphStartEndMap.get(graph).start = start;
                    graphStartEndMap.get(graph).end = end; 
                    graphStartEndMap.get(graph).runtime = runtime ;
                    graphStartEndMap.get(graph).graph = graph ;
                    graphStartEndMap.get(graph).date = date ;
                })
            }),
            paginatedSparqlQueryPromise(numberOfEndpointQuery)
            .then(numberOfEndpointJson => {
                numberOfEndpointJson.forEach((numberEndpointItem, i) => {
                    var graph = numberEndpointItem.g.value;
                    graph = graph.replace('http://ns.inria.fr/indegx#', '');
                    var count = numberEndpointItem.count.value;
                    if(graphStartEndMap.get(graph) == undefined) {
                        graphStartEndMap.set(graph, {  });
                    }
                    graphStartEndMap.get(graph).count = count
                    averageRuntimeData.push(graphStartEndMap.get(graph))
                });
            })
    ])
        .then(() => {
            try {
                var content = JSON.stringify(averageRuntimeData);
                fs.writeFileSync(averageRuntimeDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("averageRuntimeDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}


function classAndPropertiesDataFill() {
    console.log("classAndPropertiesDataFill START")
    var classPartitionQuery = "SELECT DISTINCT ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?base <http://rdfs.org/ns/void#classPartition> ?classPartition . " +
        "?classPartition <http://rdfs.org/ns/void#class> ?c . " +
        "OPTIONAL { " +
        "?classPartition <http://rdfs.org/ns/void#triples> ?ct . " +
        "} " +
        "OPTIONAL { " +
        "?classPartition <http://rdfs.org/ns/void#classes> ?cc . " +
        "} " +
        "OPTIONAL { " +
        "?classPartition <http://rdfs.org/ns/void#properties> ?cp . " +
        "} " +
        "OPTIONAL { " +
        "?classPartition <http://rdfs.org/ns/void#distinctSubjects> ?cs . " +
        "} " +
        "OPTIONAL { " +
        "?classPartition <http://rdfs.org/ns/void#distinctObjects> ?co . " +
        "} " +
        "FILTER(! isBlank(?c)) " +
        "}" +
        "} GROUP BY ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co ";
    var classSet = new Set();
    var classCountsEndpointsMap = new Map();
    var classPropertyCountsEndpointsMap = new Map();
    var classContentData = [];
    return paginatedSparqlQueryPromise(classPartitionQuery)
        .then(json => {
            json.forEach((item, i) => {
                var c = item.c.value;
                classSet.add(c);
                var endpointUrl = item.endpointUrl.value;
                if (classCountsEndpointsMap.get(c) == undefined) {
                    classCountsEndpointsMap.set(c, { class: c });
                }
                if (item.ct != undefined) {
                    var ct = Number.parseInt(item.ct.value);
                    var currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).triples == undefined) {
                        currentClassItem.triples = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.triples = currentClassItem.triples + ct;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.cc != undefined) {
                    var cc = Number.parseInt(item.cc.value);
                    var currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).classes == undefined) {
                        currentClassItem.classes = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.classes = currentClassItem.classes + cc;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.cp != undefined) {
                    var cp = Number.parseInt(item.cp.value);
                    var currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).properties == undefined) {
                        currentClassItem.properties = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.properties = currentClassItem.properties + cp;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.cs != undefined) {
                    var cs = Number.parseInt(item.cs.value);
                    var currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).distinctSubjects == undefined) {
                        currentClassItem.distinctSubjects = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.distinctSubjects = currentClassItem.distinctSubjects + cs;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.co != undefined) {
                    var co = Number.parseInt(item.co.value);
                    var currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).distinctObjects == undefined) {
                        currentClassItem.distinctObjects = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.distinctObjects = currentClassItem.distinctObjects + co;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (classCountsEndpointsMap.get(c).endpoints == undefined) {
                    var currentClassItem = classCountsEndpointsMap.get(c);
                    currentClassItem.endpoints = new Set();
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                classCountsEndpointsMap.get(c).endpoints.add(endpointUrl);
            });
        })
        .then(() => {
            var classPropertyPartitionQuery = "SELECT DISTINCT ?endpointUrl ?c ?p ?pt ?po ?ps { " +
                "GRAPH ?g {" +
                "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
                "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
                "?base <http://rdfs.org/ns/void#classPartition> ?classPartition . " +
                "?classPartition <http://rdfs.org/ns/void#class> ?c . " +
                "?classPartition <http://rdfs.org/ns/void#propertyPartition> ?classPropertyPartition . " +
                "?classPropertyPartition <http://rdfs.org/ns/void#property> ?p . " +
                "OPTIONAL { " +
                "?classPropertyPartition <http://rdfs.org/ns/void#triples> ?pt . " +
                "} " +
                "OPTIONAL { " +
                "?classPropertyPartition <http://rdfs.org/ns/void#distinctSubjects> ?ps . " +
                "} " +
                "OPTIONAL { " +
                "?classPropertyPartition <http://rdfs.org/ns/void#distinctObjects> ?po . " +
                "} " +
                "FILTER(! isBlank(?c)) " +
                "}" +
                "} GROUP BY ?endpointUrl ?c ?p ?pt ?po ?ps ";
            return paginatedSparqlQueryPromise(classPropertyPartitionQuery).then(json => {
                json.forEach((item, i) => {
                    var c = item.c.value;
                    var p = item.p.value;
                    var endpointUrl = item.endpointUrl.value;

                    classSet.add(c);

                    if (classPropertyCountsEndpointsMap.get(c) == undefined) {
                        classPropertyCountsEndpointsMap.set(c, new Map());
                    }
                    if (classPropertyCountsEndpointsMap.get(c).get(p) == undefined) {
                        classPropertyCountsEndpointsMap.get(c).set(p, { property: p });
                    }
                    if (item.pt != undefined) {
                        var pt = Number.parseInt(item.pt.value);
                        if (classPropertyCountsEndpointsMap.get(c).get(p).triples == undefined) {
                            classPropertyCountsEndpointsMap.get(c).get(p).triples = 0;
                        }
                        classPropertyCountsEndpointsMap.get(c).get(p).triples = classPropertyCountsEndpointsMap.get(c).get(p).triples + pt;
                    }
                    if (item.ps != undefined) {
                        var ps = Number.parseInt(item.ps.value);
                        if (classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects == undefined) {
                            classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = 0;
                        }
                        classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects + ps;
                    }
                    if (item.po != undefined) {
                        var po = Number.parseInt(item.po.value);
                        if (classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects == undefined) {
                            classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects = 0;
                        }
                        classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects = classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects + po;
                    }
                    if (classPropertyCountsEndpointsMap.get(c).get(p).endpoints == undefined) {
                        classPropertyCountsEndpointsMap.get(c).get(p).endpoints = new Set();
                    }
                    classPropertyCountsEndpointsMap.get(c).get(p).endpoints.add(endpointUrl);
                });

            });
        })
        .then(() => {
            classSet.forEach(className => {
                var classCountItem = classCountsEndpointsMap.get(className);
                var classItem = classCountItem;
                if (classCountItem == undefined) {
                    classItem = { class: className };
                }
                if(classItem.endpoints != undefined) {
                    classItem.endpoints = [...classItem.endpoints]
                }
                var classPropertyItem = classPropertyCountsEndpointsMap.get(className);
                if (classPropertyItem != undefined) {
                    classItem.propertyPartitions = [];
                    classPropertyItem.forEach((propertyPartitionItem, propertyName, map1) => {
                        propertyPartitionItem.endpoints = [...propertyPartitionItem.endpoints]
                        classItem.propertyPartitions.push(propertyPartitionItem);
                    });
                }
                classContentData.push(classItem)
            })
            try {
                var content = JSON.stringify(classContentData);
                fs.writeFileSync(classPropertyDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("classAndPropertiesDataFill END")
        })
        .catch(error => {
            console.log(error)
        })
}

function datasetDescriptionDataFill() {
    console.log("datasetDescriptionDataDataFill START")
    var provenanceWhoCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
        "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        "{ ?dataset <http://purl.org/dc/terms/creator> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/contributor> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/publisher> ?o } " +
        "} " +
        "} " +
        "} ";
    var provenanceLicenseCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
        "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        "{ ?dataset <http://purl.org/dc/terms/license> ?o } " +
        "UNION {?dataset <http://purl.org/dc/terms/conformsTo> ?o } " +
        "} " +
        "} " +
        "} ";
    var provenanceDateCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
        "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        " { ?dataset <http://purl.org/dc/terms/modified> ?o } " +
        "UNION { ?dataset <http://www.w3.org/ns/prov#wasGeneratedAtTime> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/issued> ?o } " +
        "} " +
        "} " +
        "} ";
    var provenanceSourceCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
        "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        "{ ?dataset <http://purl.org/dc/terms/source> ?o } " +
        "UNION { ?dataset <http://www.w3.org/ns/prov#wasDerivedFrom> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/format> ?o } " +
        "} " +
        "} " +
        "} ";
    var endpointDescriptionElementMap = new Map();

    var datasetDescriptionData = [];
    return Promise.all([
        paginatedSparqlQueryPromise(provenanceWhoCheckQuery)
            .then(json => {
                json.forEach((item, i) => {
                    var endpointUrl = item.endpointUrl.value;
                    var who = (item.o != undefined);
                    var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.who = who;
                    if (who) {
                        currentEndpointItem.whoValue = item.o.value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                })
            }),
        paginatedSparqlQueryPromise(provenanceLicenseCheckQuery)
            .then(json => {
                json.forEach((item, i) => {
                    var endpointUrl = item.endpointUrl.value;
                    var license = (item.o != undefined);
                    var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.license = license;
                    if (license) {
                        currentEndpointItem.licenseValue = item.o.value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                })
            })
            .catch(error => {
                console.log(error)
            })
        ,
        paginatedSparqlQueryPromise(provenanceDateCheckQuery)
            .then(json => {
                json.forEach((item, i) => {
                    var endpointUrl = item.endpointUrl.value;
                    var time = (item.o != undefined);
                    var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.time = time;
                    if (time) {
                        currentEndpointItem.timeValue = item.o.value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                })
            })
            .catch(error => {
                console.log(error)
            })
        ,
        paginatedSparqlQueryPromise(provenanceSourceCheckQuery)
            .then(json => {
                json.forEach((item, i) => {
                    var endpointUrl = item.endpointUrl.value;
                    var source = (item.o != undefined);
                    var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.source = source;
                    if (source) {
                        currentEndpointItem.sourceValue = item.o.value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                });
                endpointDescriptionElementMap.forEach((prov, endpoint, map) => {
                    datasetDescriptionData.push(prov)
                });
            })
            .catch(error => {
                console.log(error)
            })
    ])
        .finally(() => {
            try {
                var content = JSON.stringify(datasetDescriptionData);
                fs.writeFileSync(datasetDescriptionDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("datasetDescriptionDataDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function shortUrisDataFill() {
    console.log("shortUrisDataFill START")
    var shortUrisMeasureQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/shortUris.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "}" +
        " } GROUP BY ?g ?date ?endpointUrl ?measure ";
    var shortUriData = []
    return paginatedSparqlQueryPromise(shortUrisMeasureQuery)
        .then(json => {
            var graphSet = new Set();
            json.forEach((jsonItem, i) => {
                var endpoint = jsonItem.endpointUrl.value;
                var shortUriMeasure = Number.parseFloat(jsonItem.measure.value * 100);
                var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
                var date = parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

                graphSet.add(graph);
                shortUriData.push({ graph: graph, date:date, endpoint: endpoint, measure: shortUriMeasure })
            });
        })
        .then(() => {
            try {
                var content = JSON.stringify(shortUriData);
                fs.writeFileSync(shortUriDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("shortUrisDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function readableLabelsDataFill() {
    console.log("readableLabelsDataFill START")
    var readableLabelsQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "} " +
        " } GROUP BY ?g ?date ?endpointUrl ?measure ";

    var readableLabelData = [];
    return paginatedSparqlQueryPromise(readableLabelsQuery)
        .then(json => {
            json.forEach((jsonItem, i) => {
                var endpoint = jsonItem.endpointUrl.value;
                var readableLabelMeasure = Number.parseFloat(jsonItem.measure.value * 100);
                var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
                var date = parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

                readableLabelData.push({ graph: graph, date:date, endpoint: endpoint, measure: readableLabelMeasure })
            });

        })
        .then(() => {
            try {
                var content = JSON.stringify(readableLabelData);
                fs.writeFileSync(readableLabelDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("readableLabelsDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function rdfDataStructureDataFill() {
    console.log("rdfDataStructureDataFill START")
    var rdfDataStructureQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/RDFDataStructures.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "}" +
        " } GROUP BY ?g ?date ?endpointUrl ?measure ";

    var rdfDataStructureData = []
    paginatedSparqlQueryPromise(rdfDataStructureQuery).then(json => {
        json.forEach((jsonItem, i) => {
            var endpoint = jsonItem.endpointUrl.value;
            var rdfDataStructureMeasure = Number.parseFloat(jsonItem.measure.value * 100);
            var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            var date = parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

            rdfDataStructureData.push({ graph: graph, date:date, endpoint: endpoint, measure: rdfDataStructureMeasure })
        });
    })
        .then(() => {
            try {
                var content = JSON.stringify(rdfDataStructureData);
                fs.writeFileSync(rdfDataStructureDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("rdfDataStructureDataFill END")
        })
        .catch(error => {
            console.log(error)
        });
}

function blankNodeDataFill() {
    console.log("blankNodeDataFill START")
    var blankNodeQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/blankNodeUsage.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "}" +
        " } " +
        "GROUP BY ?g ?date ?endpointUrl ?measure ";

        var blankNodeData = []
    sparqlQueryPromise(blankNodeQuery).then(json => {
        var graphSet = new Set();
        json.results.bindings.forEach((jsonItem, i) => {
            var endpoint = jsonItem.endpointUrl.value;
                var blankNodeMeasure = Number.parseFloat(jsonItem.measure.value * 100);
                var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
                var date = parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

                graphSet.add(graph);
                blankNodeData.push({ graph: graph, date: date, endpoint: endpoint, measure: blankNodeMeasure })
        });
    })
    .then(() => {
        try {
            var content = JSON.stringify(blankNodeData);
            fs.writeFileSync(blankNodesDataFilename, content)
        } catch (err) {
            console.error(err)
        }
        console.log("blankNodeDataFill END")
    })
    .catch(error => {
        console.log(error)
    });
}

Promise.all([
    whiteListFill(),
    endpointMapfill(),
    SPARQLCoverageFill(),
    vocabFill(),
    tripleDataFill(),
    classDataFill(),
    propertyDataFill(),
    categoryTestCountFill(),
    totalCategoryTestCountFill(),
    endpointTestsDataFill(),
    totalRuntimeDataFill(),
    averageRuntimeDataFill(),
    classAndPropertiesDataFill(),
    datasetDescriptionDataFill(),
    shortUrisDataFill(),
    rdfDataStructureDataFill(),
    readableLabelsDataFill(),
    blankNodeDataFill()
])
    .catch(error => {
        console.log(error)
    });