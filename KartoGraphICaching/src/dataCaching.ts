import * as fs from 'node:fs';
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
dayjs.extend(duration);
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
import md5 from 'md5';
import * as Global from "./GlobalUtils";

const queryPaginationSize = 500;

const dataFilePrefix = "./data/cache/";
const graphLists = fs.readFileSync(dataFilePrefix + 'runSets.json');
const timezoneMap = fs.readFileSync(dataFilePrefix + 'timezoneMap.json');
const endpointIpMap = fs.readFileSync(dataFilePrefix + 'endpointIpGeoloc.json');

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

function generateGraphValueFilterClause(graphList) {
    let result = "FILTER( ";
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

function sparqlQueryPromise(query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return Global.fetchJSONPromise('http://prod-dekalog.inria.fr/sparql?query=' + encodeURIComponent(query) + '&format=json');
    }
    else {
        throw "ERROR " + query;
    }
}

function paginatedSparqlQueryPromise(query, limit = queryPaginationSize, offset = 0, finalResult = []) {
    let paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
    return sparqlQueryPromise(paginatedQuery)
        .then(queryResult => {
            queryResult.results.bindings.forEach(resultItem => {
                let finaResultItem = {};
                queryResult.head.vars.forEach(variable => {
                    finaResultItem[variable] = resultItem[variable];
                })
                finalResult.push(finaResultItem);
            })
            if (queryResult.results.bindings.length > 0) {
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
        .finally(() => {
            return finalResult;
        })
}

function whiteListFill() {
    console.log("whiteListFill START")
    return Promise.all(
        graphLists.map(graphListItem => {
            let graphList = graphListItem.graphs
            let endpointListQuery = 'SELECT DISTINCT ?endpointUrl WHERE {' +
                ' GRAPH ?g { ' +
                "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
                "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
                "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
                '?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ' +
                '} ' +
                generateGraphValueFilterClause(graphList) +
                '} ' +
                'GROUP BY ?endpointUrl';
            let graphListKey = md5(''.concat(graphList));
            return paginatedSparqlQueryPromise(endpointListQuery)
                .then(json => {
                    let endpointList = [];
                    json.forEach((item) => {
                        endpointList.push(item.endpointUrl.value);
                    });
                    return { graphKey: graphListKey, endpoints: endpointList };
                });
        }))
        .then(graphListItemArray => {
            let tmpWhiteListMap = {};
            graphListItemArray.forEach(graphListItem => {
                tmpWhiteListMap[graphListItem.graphKey] = graphListItem.endpoints;
            });
            try {
                let content = JSON.stringify(tmpWhiteListMap);
                fs.writeFileSync(whiteListFilename, content)
                console.log("whiteListFill END")
            } catch (err) {
                console.error(err)
            }
        }).catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(whiteListFilename, content)
                console.log("whiteListFill END")
            } catch (err) {
                console.error(err)
            }
        });
}

type EndpointItem = {
    endpoint: string
    lat: number
    lon: number
    country: string
    region: string
    city: string
    org: string
    timezone: string
    sparqlTimezone: string
    popupHTML: string
}

function endpointMapfill() {
    console.log("endpointMapfill START")
    let endpointGeolocData = [];

    // Marked map with the geoloc of each endpoint
    return Promise.all(endpointIpMap.map((item) => {
        // Add the markers for each endpoints.
        let endpoint = item.key;
        let endpointItem: EndpointItem;

        let timezoneSPARQLquery = "SELECT DISTINCT ?timezone { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <" + endpoint + "> . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <https://schema.org/broadcastTimezone> ?timezone } }";
        return paginatedSparqlQueryPromise(timezoneSPARQLquery)
            .then(jsonResponse => {
                let endpointTimezoneSPARQL = new Map();
                jsonResponse.forEach((itemResponse, i) => {
                    endpointTimezoneSPARQL.set(endpoint, itemResponse.timezone.value);
                });

                let ipTimezoneArrayFiltered = timezoneMap.filter(itemtza => itemtza.key == item.value.geoloc.timezone);
                let ipTimezone;
                if (ipTimezoneArrayFiltered.length > 0) {
                    ipTimezone = ipTimezoneArrayFiltered[0].value.utc_offset.padStart(6, '-').padStart(6, '+');
                }
                let sparqlTimezone;
                if (endpointTimezoneSPARQL.get(endpoint) != undefined) {
                    sparqlTimezone = endpointTimezoneSPARQL.get(endpoint).padStart(6, '-').padStart(6, '+');
                }

                endpointItem = { endpoint: endpoint, lat: item.value.geoloc.lat, lon: item.value.geoloc.lon, country: "", region: "", city: "", org: "", timezone: ipTimezone, sparqlTimezone: sparqlTimezone, popupHTML: "" };
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
                let labelQuery = "SELECT DISTINCT ?label  { GRAPH ?g { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> <" + endpoint + "> . { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } UNION { ?dataset <http://purl.org/dc/terms/title> ?label } UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } UNION { ?dataset <http://schema.org/name> ?label } . }  }";
                return labelQuery;
            })
            .then(labelQuery => sparqlQueryPromise(labelQuery)
                .then(responseLabels => {
                    let popupString = "<table> <thead> <tr> <th colspan='2'> <a href='" + endpointItem.endpoint + "' >" + endpointItem.endpoint + "</a> </th> </tr> </thead>";
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
                        if (endpointItem.sparqlTimezone != undefined) {
                            let badTimezone = endpointItem.timezone.localeCompare(endpointItem.sparqlTimezone) != 0;
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
                let content = JSON.stringify(endpointGeolocData);
                fs.writeFileSync(geolocFilename, content)
                console.log("endpointMapfill END")
            } catch (err) {
                console.error(err)
            }
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(geolocFilename, content)
                console.log("endpointMapfill END")
            } catch (err) {
                console.error(err)
            }
        })

}

function SPARQLCoverageFill() {
    console.log("SPARQLCoverageFill START")
    // Create an histogram of the SPARQLES rules passed by endpoint.
    let sparqlesFeatureQuery = 'SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) { ' +
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
    let jsonBaseFeatureSparqles = [];
    let sparqlFeaturesDataArray = [];
    return paginatedSparqlQueryPromise(sparqlesFeatureQuery)
        .then(json => {
            let endpointSet = new Set();
            let sparql10Map = new Map();
            let sparql11Map = new Map();
            json.forEach((bindingItem, i) => {
                let endpointUrl = bindingItem.endpoint.value;
                endpointSet.add(endpointUrl);
                let feature = undefined;
                if (bindingItem.sparqlNorm != undefined) {
                    feature = bindingItem.sparqlNorm.value;
                }
                let count = bindingItem.count.value;
                if (feature == undefined || feature.localeCompare("SPARQL10") == 0) {
                    sparql10Map.set(endpointUrl, Number(count));
                }
                if (feature == undefined || feature.localeCompare("SPARQL11") == 0) {
                    sparql11Map.set(endpointUrl, Number(count));
                }
            });

            endpointSet.forEach((item) => {
                let sparql10 = sparql10Map.get(item);
                let sparql11 = sparql11Map.get(item);
                if (sparql10 == undefined) {
                    sparql10 = 0;
                }
                if (sparql11 == undefined) {
                    sparql11 = 0;
                }
                let sparqlJSONObject = { 'endpoint': item, 'sparql10': sparql10, 'sparql11': sparql11, 'sparqlTotal': (sparql10 + sparql11) };
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
            let endpointFeatureMap = new Map();
            let featuresShortName = new Map();
            return paginatedSparqlQueryPromise(sparqlFeatureQuery)
                .then(json => {
                    endpointFeatureMap = new Map();
                    let featuresSet = new Set();
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
                        let sortedFeatureArray = [...featureSet].sort((a, b) => a.localeCompare(b));
                        sparqlFeaturesDataArray.push({ endpoint: endpointUrl, features: sortedFeatureArray });
                    });

                    sparqlFeaturesDataArray.sort((a, b) => {
                        return a.endpoint.localeCompare(b.endpoint);
                    });
                })
        })
        .finally(() => {
            try {
                let content = JSON.stringify(jsonBaseFeatureSparqles);
                fs.writeFileSync(sparqlCoverageFilename, content)
            } catch (err) {
                console.error(err)
            }
            try {
                let content = JSON.stringify(sparqlFeaturesDataArray);
                fs.writeFileSync(sparqlFeaturesFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("SPARQLCoverageFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(sparqlCoverageFilename, content)
            } catch (err) {
                console.error(err)
            }
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(sparqlFeaturesFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
}

function vocabFill() {
    console.log("vocabFill START")
    // Create an force graph with the graph linked by co-ocurrence of vocabularies
    let sparqlesVocabulariesQuery = "SELECT DISTINCT ?endpointUrl ?vocabulary { GRAPH ?g { " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . " +
        "?dataset <http://rdfs.org/ns/void#vocabulary> ?vocabulary " +
        "} " +
        " } " +
        "GROUP BY ?endpointUrl ?vocabulary ";
    let knownVocabularies = new Set();
    let rawGatherVocab = new Map();
    let gatherVocabData = [];
    let rawVocabSet = new Set();
    let vocabSet = new Set();
    let keywordSet = new Set();
    let vocabKeywordData = [];

    return paginatedSparqlQueryPromise(sparqlesVocabulariesQuery)
        .then(json => {

            let endpointSet = new Set();
            json.forEach((bindingItem, i) => {
                let vocabulariUri = bindingItem.vocabulary.value;
                let endpointUri = bindingItem.endpointUrl.value;
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
        .then(Global.fetchJSONPromise("https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list")
            .then(responseLOV => {
                responseLOV.forEach((item, i) => {
                    knownVocabularies.add(item.uri)
                });
                try {
                    let content = JSON.stringify(responseLOV);
                    fs.writeFileSync(LOVFilename, content)
                } catch (err) {
                    console.error(err)
                }
            }))
        .then(Global.fetchJSONPromise("http://prefix.cc/context")
            .then(responsePrefixCC => {
                for (let prefix of Object.keys(responsePrefixCC['@context'])) {
                    knownVocabularies.add(responsePrefixCC['@context'][prefix])
                };
            }))
        .then(Global.fetchJSONPromise("https://www.ebi.ac.uk/ols/api/ontologies?page=0&size=1000")
            .then(responseOLS => {
                responseOLS._embedded.ontologies.forEach(ontologyItem => {
                    if (ontologyItem.config.baseUris.length > 0) {
                        let ontology = ontologyItem.config.baseUris[0]
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

            let queryArray = [];
            let vocabArray = [...vocabSet];
            for (let i = 20; i < vocabArray.length + 20; i += 20) {
                let vocabSetSlice = vocabArray.slice(i - 20, i); // Slice the array into arrays of 20 elements
                // Endpoint and vocabulary keywords graph
                let vocabularyQueryValues = "";
                vocabSetSlice.forEach((item, i) => {
                    vocabularyQueryValues += "<" + item + ">";
                    vocabularyQueryValues += " ";
                });

                let keywordLOVQuery = "SELECT DISTINCT ?vocabulary ?keyword { " +
                    "GRAPH <https://lov.linkeddata.es/dataset/lov> { " +
                    "   ?vocabulary a <http://purl.org/vocommons/voaf#Vocabulary> . " +
                    "   ?vocabulary <http://www.w3.org/ns/dcat#keyword> ?keyword . " +
                    "} " +
                    "VALUES ?vocabulary { " + vocabularyQueryValues + " } " +
                    "}"
                queryArray.push(Global.fetchJSONPromise("https://lov.linkeddata.es/dataset/lov/sparql?query=" + encodeURIComponent(keywordLOVQuery) + "&format=json"));
            }

            return Promise.all(queryArray)
                .then(jsonKeywordsArray => {
                    let vocabKeywordMap = new Map();
                    jsonKeywordsArray.forEach(jsonKeywords => {
                        jsonKeywords.results.bindings.forEach((keywordItem, i) => {
                            let keyword = keywordItem.keyword.value;
                            let vocab = keywordItem.vocabulary.value;
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
                let content = JSON.stringify(gatherVocabData);
                fs.writeFileSync(vocabEndpointFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
        .finally(() => {
            try {
                let content = JSON.stringify([...knownVocabularies]);
                fs.writeFileSync(knownVocabsFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
        .finally(() => {
            try {
                let content = JSON.stringify(vocabKeywordData);
                fs.writeFileSync(vocabKeywordsFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("vocabFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(vocabEndpointFilename, content)
            } catch (err) {
                console.error(err)
            }
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(knownVocabsFilename, content)
            } catch (err) {
                console.error(err)
            }
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(vocabKeywordsFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
}

function tripleDataFill() {
    console.log("tripleDataFill START")
    // Scatter plot of the number of triples through time
    let triplesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?curated <http://rdfs.org/ns/void#triples> ?rawO ." +
        "}" +
        "} GROUP BY ?g ?date ?endpointUrl ?o";
    let endpointTripleData = [];
    return paginatedSparqlQueryPromise(triplesSPARQLquery)
        .then(json => {
            json.forEach((itemResult, i) => {
                let graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                let date = Global.parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                let endpointUrl = itemResult.endpointUrl.value;
                let triples = Number.parseInt(itemResult.o.value);
                endpointTripleData.push({ endpoint: endpointUrl, graph: graph, date: date, triples: triples })
            });
        })
        .then(() => {
            try {
                let content = JSON.stringify(endpointTripleData);
                fs.writeFileSync(tripleCountFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("tripleDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(tripleCountFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function classDataFill() {
    console.log("classDataFill START")
    // Scatter plot of the number of classes through time
    let classesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) ?modifDate { " +
        "GRAPH ?g {" +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?base <http://rdfs.org/ns/void#classes> ?rawO ." +
        "}" +
        "} GROUP BY ?g ?date ?endpointUrl ?modifDate ?o";
    let endpointClassCountData = [];
    return paginatedSparqlQueryPromise(classesSPARQLquery)
        .then(json => {
            json.forEach((itemResult, i) => {
                let graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                let date = Global.parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                let endpointUrl = itemResult.endpointUrl.value;
                let triples = Number.parseInt(itemResult.o.value);
                endpointClassCountData.push({ endpoint: endpointUrl, graph: graph, date: date, classes: triples })
            });

        })
        .then(() => {
            try {
                let content = JSON.stringify(endpointClassCountData);
                fs.writeFileSync(classCountFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("classDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(classCountFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function propertyDataFill() {
    console.log("propertyDataFill START")
    // scatter plot of the number of properties through time
    let propertiesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?base <http://rdfs.org/ns/void#properties> ?rawO ." +
        "}" +
        "} GROUP BY ?endpointUrl ?g ?date ?o";
    let endpointPropertyCountData = [];
    return paginatedSparqlQueryPromise(propertiesSPARQLquery)
        .then(json => {
            json.forEach((itemResult, i) => {
                let graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                let endpointUrl = itemResult.endpointUrl.value;
                let properties = Number.parseInt(itemResult.o.value);
                let date = Global.parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                endpointPropertyCountData.push({ endpoint: endpointUrl, graph: graph, date: date, properties: properties })
            });
        })
        .then(() => {
            try {
                let content = JSON.stringify(endpointPropertyCountData);
                fs.writeFileSync(propertyCountFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("propertyDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(propertyCountFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function categoryTestCountFill() {
    console.log("categoryTestCountFill START")
    let testCategoryData = [];
    // Number of tests passed by test categories
    let testCategoryQuery = "SELECT DISTINCT ?g ?date ?category (count(DISTINCT ?test) AS ?count) ?endpointUrl { " +
        "GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
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
                let category = itemResult.category.value;
                let count = itemResult.count.value;
                let endpoint = itemResult.endpointUrl.value;
                let graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                let date = Global.parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                testCategoryData.push({ category: category, graph: graph, date: date, endpoint: endpoint, count: count });
            });
        })
        .then(() => {
            try {
                let content = JSON.stringify(testCategoryData);
                fs.writeFileSync(categoryTestCountFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("categoryTestCountFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(categoryTestCountFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function totalCategoryTestCountFill() {
    console.log("totalCategoryTestCountFill START")
    // Number of tests passed by test categories
    let testCategoryQuery = "SELECT DISTINCT ?category ?g ?date (count(DISTINCT ?test) AS ?count) ?endpointUrl { " +
        "GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?trace <http://www.w3.org/ns/earl#test> ?test . " +
        "?trace <http://www.w3.org/ns/earl#result> ?result . " +
        "?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#passed> . " +
        "FILTER(STRSTARTS(str(?test), str(?category))) " +
        "VALUES ?category { " +
        "<https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/> " +
        "<https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/> " +
        "<https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/> " +
        "<https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/> " +
        "<https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/> " +
        "<https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/> " +
        "} " +
        "} " +
        "} " +
        "GROUP BY ?g ?date ?category ?endpointUrl " +
        "ORDER BY ?category ";
    let totalTestCategoryData = [];
    return paginatedSparqlQueryPromise(testCategoryQuery).then(json => {
        json.forEach((itemResult, i) => {
            let category = itemResult.category.value;
            let count = itemResult.count.value;
            let endpoint = itemResult.endpointUrl.value;
            let graph = itemResult.g.value;
            let date = Global.parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');

            totalTestCategoryData.push({ category: category, endpoint: endpoint, graph: graph, date: date, count: count })
        });
    })
        .then(() => {
            try {
                let content = JSON.stringify(totalTestCategoryData);
                fs.writeFileSync(totalCategoryTestCountFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("totalCategoryTestCountFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(totalCategoryTestCountFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function endpointTestsDataFill() {
    console.log("endpointTestsDataFill START")

    let appliedTestQuery = "SELECT DISTINCT ?endpointUrl ?g ?date ?rule { " +
        "GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?curated <http://www.w3.org/ns/prov#wasGeneratedBy> ?rule . " +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "} " +
        "}";
    let endpointTestsData = [];
    return paginatedSparqlQueryPromise(appliedTestQuery)
        .then(json => {
            json.forEach((item, i) => {
                let endpointUrl = item.endpointUrl.value;
                let rule = item.rule.value;
                let graph = item.g.value;
                let date = Global.parseDate(item.date.value, 'YYYY-MM-DDTHH:mm:ss');

                endpointTestsData.push({ endpoint: endpointUrl, activity: rule, graph: graph, date: date })
            });
        })
        .then(() => {
            try {
                let content = JSON.stringify(endpointTestsData);
                fs.writeFileSync(endpointTestsDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("endpointTestsDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(endpointTestsDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function totalRuntimeDataFill() {
    console.log("totalRuntimeDataFill START")
    let maxMinTimeQuery = "SELECT DISTINCT ?g ?endpointUrl ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { " +
        " GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . " +
        "?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . " +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "} " +
        "} ";
    let totalRuntimeData = []
    return paginatedSparqlQueryPromise(maxMinTimeQuery).then(jsonResponse => {
        jsonResponse.forEach((itemResult, i) => {
            let graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
            let date = Global.parseDate(itemResult.date.value);
            let start = Global.parseDate(itemResult.start.value);
            let end = Global.parseDate(itemResult.end.value);
            let endpointUrl = itemResult.endpointUrl.value;
            let runtimeData = dayjs.duration(end.diff(start));
            totalRuntimeData.push({ graph: graph, endpoint: endpointUrl, date: date, start: start, end: end, runtime: runtimeData })
        });
    })
        .then(() => {
            try {
                let content = JSON.stringify(totalRuntimeData);
                fs.writeFileSync(totalRuntimeDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("totalRuntimeDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(totalRuntimeDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function averageRuntimeDataFill() {
    console.log("averageRuntimeDataFill START")
    let maxMinTimeQuery = "SELECT DISTINCT ?g ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end)" +
        " { " +
        "GRAPH ?g {" +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?data , ?endpoint . " +
        "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . " +
        "?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . " +
        "} " +
        "}";
    let numberOfEndpointQuery = "SELECT DISTINCT ?g (COUNT(?endpointUrl) AS ?count) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?dataset . { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } } }";
    let averageRuntimeData = [];
    let graphStartEndMap = new Map();
    return Promise.all([
        paginatedSparqlQueryPromise(maxMinTimeQuery)
            .then(jsonResponse => {
                jsonResponse.forEach((itemResult, i) => {
                    let graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                    let date = Global.parseDate(itemResult.date.value, 'YYYY-MM-DDTHH:mm:ss');
                    let start = Global.parseDate(itemResult.start.value, 'YYYY-MM-DDTHH:mm:ss');
                    let end = Global.parseDate(itemResult.end.value, 'YYYY-MM-DDTHH:mm:ss');
                    let runtime = dayjs.duration(end.diff(start));

                    if (graphStartEndMap.get(graph) == undefined) {
                        graphStartEndMap.set(graph, {});
                    }
                    graphStartEndMap.get(graph).start = start;
                    graphStartEndMap.get(graph).end = end;
                    graphStartEndMap.get(graph).runtime = runtime;
                    graphStartEndMap.get(graph).graph = graph;
                    graphStartEndMap.get(graph).date = date;
                })
            }),
        paginatedSparqlQueryPromise(numberOfEndpointQuery)
            .then(numberOfEndpointJson => {
                numberOfEndpointJson.forEach((numberEndpointItem, i) => {
                    let graph = numberEndpointItem.g.value;
                    graph = graph.replace('http://ns.inria.fr/indegx#', '');
                    let count = numberEndpointItem.count.value;
                    if (graphStartEndMap.get(graph) == undefined) {
                        graphStartEndMap.set(graph, {});
                    }
                    graphStartEndMap.get(graph).count = count
                    averageRuntimeData.push(graphStartEndMap.get(graph))
                });
            })
    ])
        .then(() => {
            try {
                let content = JSON.stringify(averageRuntimeData);
                fs.writeFileSync(averageRuntimeDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("averageRuntimeDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(averageRuntimeDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}


function classAndPropertiesDataFill() {
    console.log("classAndPropertiesDataFill START")
    let classPartitionQuery = "SELECT DISTINCT ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co { " +
        "GRAPH ?g {" +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }" +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
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
    let classSet = new Set();
    let classCountsEndpointsMap = new Map();
    let classPropertyCountsEndpointsMap = new Map();
    let classContentData = [];
    return paginatedSparqlQueryPromise(classPartitionQuery)
        .then(json => {
            json.forEach((item, i) => {
                let c = item.c.value;
                classSet.add(c);
                let endpointUrl = item.endpointUrl.value;
                if (classCountsEndpointsMap.get(c) == undefined) {
                    classCountsEndpointsMap.set(c, { class: c });
                }
                if (item.ct != undefined) {
                    let ct = Number.parseInt(item.ct.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).triples == undefined) {
                        currentClassItem.triples = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.triples = currentClassItem.triples + ct;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.cc != undefined) {
                    let cc = Number.parseInt(item.cc.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).classes == undefined) {
                        currentClassItem.classes = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.classes = currentClassItem.classes + cc;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.cp != undefined) {
                    let cp = Number.parseInt(item.cp.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).properties == undefined) {
                        currentClassItem.properties = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.properties = currentClassItem.properties + cp;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.cs != undefined) {
                    let cs = Number.parseInt(item.cs.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).distinctSubjects == undefined) {
                        currentClassItem.distinctSubjects = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.distinctSubjects = currentClassItem.distinctSubjects + cs;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (item.co != undefined) {
                    let co = Number.parseInt(item.co.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).distinctObjects == undefined) {
                        currentClassItem.distinctObjects = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.distinctObjects = currentClassItem.distinctObjects + co;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                if (classCountsEndpointsMap.get(c).endpoints == undefined) {
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    currentClassItem.endpoints = new Set();
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                classCountsEndpointsMap.get(c).endpoints.add(endpointUrl);
            });
        })
        .then(() => {
            let classPropertyPartitionQuery = "SELECT DISTINCT ?endpointUrl ?c ?p ?pt ?po ?ps { " +
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
                    let c = item.c.value;
                    let p = item.p.value;
                    let endpointUrl = item.endpointUrl.value;

                    classSet.add(c);

                    if (classPropertyCountsEndpointsMap.get(c) == undefined) {
                        classPropertyCountsEndpointsMap.set(c, new Map());
                    }
                    if (classPropertyCountsEndpointsMap.get(c).get(p) == undefined) {
                        classPropertyCountsEndpointsMap.get(c).set(p, { property: p });
                    }
                    if (item.pt != undefined) {
                        let pt = Number.parseInt(item.pt.value);
                        if (classPropertyCountsEndpointsMap.get(c).get(p).triples == undefined) {
                            classPropertyCountsEndpointsMap.get(c).get(p).triples = 0;
                        }
                        classPropertyCountsEndpointsMap.get(c).get(p).triples = classPropertyCountsEndpointsMap.get(c).get(p).triples + pt;
                    }
                    if (item.ps != undefined) {
                        let ps = Number.parseInt(item.ps.value);
                        if (classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects == undefined) {
                            classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = 0;
                        }
                        classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects + ps;
                    }
                    if (item.po != undefined) {
                        let po = Number.parseInt(item.po.value);
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
                let classCountItem = classCountsEndpointsMap.get(className);
                let classItem = classCountItem;
                if (classCountItem == undefined) {
                    classItem = { class: className };
                }
                if (classItem.endpoints != undefined) {
                    classItem.endpoints = [...classItem.endpoints]
                }
                let classPropertyItem = classPropertyCountsEndpointsMap.get(className);
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
                let content = JSON.stringify(classContentData);
                fs.writeFileSync(classPropertyDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("classAndPropertiesDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(classPropertyDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
}

function datasetDescriptionDataFill() {
    console.log("datasetDescriptionDataDataFill START")
    let provenanceWhoCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        "{ ?dataset <http://purl.org/dc/terms/creator> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/contributor> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/publisher> ?o } " +
        "} " +
        "} " +
        "} ";
    let provenanceLicenseCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        "{ ?dataset <http://purl.org/dc/terms/license> ?o } " +
        "UNION {?dataset <http://purl.org/dc/terms/conformsTo> ?o } " +
        "} " +
        "} " +
        "} ";
    let provenanceDateCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        " { ?dataset <http://purl.org/dc/terms/modified> ?o } " +
        "UNION { ?dataset <http://www.w3.org/ns/prov#wasGeneratedAtTime> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/issued> ?o } " +
        "} " +
        "} " +
        "} ";
    let provenanceSourceCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
        "GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . " +
        "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } " +
        "UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }" +
        "OPTIONAL {" +
        "{ ?dataset <http://purl.org/dc/terms/source> ?o } " +
        "UNION { ?dataset <http://www.w3.org/ns/prov#wasDerivedFrom> ?o } " +
        "UNION { ?dataset <http://purl.org/dc/terms/format> ?o } " +
        "} " +
        "} " +
        "} ";
    let endpointDescriptionElementMap = new Map();

    let datasetDescriptionData = [];
    return Promise.all([
        paginatedSparqlQueryPromise(provenanceWhoCheckQuery)
            .then(json => {
                json.forEach((item, i) => {
                    let endpointUrl = item.endpointUrl.value;
                    let who = (item.o != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
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
                    let endpointUrl = item.endpointUrl.value;
                    let license = (item.o != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
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
                    let endpointUrl = item.endpointUrl.value;
                    let time = (item.o != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
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
                    let endpointUrl = item.endpointUrl.value;
                    let source = (item.o != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
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
                let content = JSON.stringify(datasetDescriptionData);
                fs.writeFileSync(datasetDescriptionDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("datasetDescriptionDataDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(datasetDescriptionDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function shortUrisDataFill() {
    console.log("shortUrisDataFill START")
    let shortUrisMeasureQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/shortUris.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "}" +
        " } GROUP BY ?g ?date ?endpointUrl ?measure ";
    let shortUriData = []
    return paginatedSparqlQueryPromise(shortUrisMeasureQuery)
        .then(json => {
            let graphSet = new Set();
            json.forEach((jsonItem, i) => {
                let endpoint = jsonItem.endpointUrl.value;
                let shortUriMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
                let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
                let date = Global.parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

                graphSet.add(graph);
                shortUriData.push({ graph: graph, date: date, endpoint: endpoint, measure: shortUriMeasure })
            });
        })
        .then(() => {
            try {
                let content = JSON.stringify(shortUriData);
                fs.writeFileSync(shortUriDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("shortUrisDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(shortUriDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function readableLabelsDataFill() {
    console.log("readableLabelsDataFill START")
    let readableLabelsQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "} " +
        " } GROUP BY ?g ?date ?endpointUrl ?measure ";

    let readableLabelData = [];
    return paginatedSparqlQueryPromise(readableLabelsQuery)
        .then(json => {
            json.forEach((jsonItem, i) => {
                let endpoint = jsonItem.endpointUrl.value;
                let readableLabelMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
                let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
                let date = Global.parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

                readableLabelData.push({ graph: graph, date: date, endpoint: endpoint, measure: readableLabelMeasure })
            });

        })
        .then(() => {
            try {
                let content = JSON.stringify(readableLabelData);
                fs.writeFileSync(readableLabelDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("readableLabelsDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(readableLabelDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function rdfDataStructureDataFill() {
    console.log("rdfDataStructureDataFill START")
    let rdfDataStructureQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/RDFDataStructures.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "}" +
        " } GROUP BY ?g ?date ?endpointUrl ?measure ";

    let rdfDataStructureData = []
    paginatedSparqlQueryPromise(rdfDataStructureQuery).then(json => {
        json.forEach((jsonItem, i) => {
            let endpoint = jsonItem.endpointUrl.value;
            let rdfDataStructureMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
            let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = Global.parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

            rdfDataStructureData.push({ graph: graph, date: date, endpoint: endpoint, measure: rdfDataStructureMeasure })
        });
    })
        .then(() => {
            try {
                let content = JSON.stringify(rdfDataStructureData);
                fs.writeFileSync(rdfDataStructureDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("rdfDataStructureDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(rdfDataStructureDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

function blankNodeDataFill() {
    console.log("blankNodeDataFill START")
    let blankNodeQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { " +
        "GRAPH ?g {" +
        "?metadata <http://purl.org/dc/terms/modified> ?date . " +
        "{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
        "UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?curated . " +
        "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
        "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/blankNodeUsage.ttl> . " +
        "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
        "}" +
        " } " +
        "GROUP BY ?g ?date ?endpointUrl ?measure ";

    let blankNodeData = []
    return sparqlQueryPromise(blankNodeQuery).then(json => {
        let graphSet = new Set();
        json.results.bindings.forEach((jsonItem, i) => {
            let endpoint = jsonItem.endpointUrl.value;
            let blankNodeMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
            let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = Global.parseDate(jsonItem.date.value, 'YYYY-MM-DDTHH:mm:ss');

            graphSet.add(graph);
            blankNodeData.push({ graph: graph, date: date, endpoint: endpoint, measure: blankNodeMeasure })
        });
    })
        .then(() => {
            try {
                let content = JSON.stringify(blankNodeData);
                fs.writeFileSync(blankNodesDataFilename, content)
            } catch (err) {
                console.error(err)
            }
            console.log("blankNodeDataFill END")
        })
        .catch(error => {
            console.log(error)
            try {
                let content = JSON.stringify([]);
                fs.writeFileSync(blankNodesDataFilename, content)
            } catch (err) {
                console.error(err)
            }
        });
}

Promise.allSettled([
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