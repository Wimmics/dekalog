import * as fs from 'node:fs';
import * as $rdf from "rdflib";
import dayjs, { Dayjs } from "dayjs";
import duration from 'dayjs/plugin/duration.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
dayjs.extend(duration);
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
import md5 from 'md5';
import * as Global from "./GlobalUtils";
import * as Logger from "./LogUtils";
import * as Sparql from "./SparqlUtils";
import * as RDFUtils from "./RDFUtils";
import { ClassCountDataObject, EndpointIpGeolocObject, EndpointItem, EndpointTestObject, JSONValue, RunSetObject, SPARQLJSONResult, TimezoneMapObject, TripleCountDataObject } from './DataTypes';

const dataFilePrefix = "./data/";
export const dataCachedFilePrefix = "./data/cache/";
export const runsetList = Global.readJSONFile(dataFilePrefix + 'runSets.json') as Promise<RunSetObject[]>;
const timezoneMap = Global.readJSONFile(dataFilePrefix + 'timezoneMap.json');
const endpointIpMap = Global.readJSONFile(dataFilePrefix + 'endpointIpGeoloc.json');

export const geolocFilename = "geolocData";
export const sparqlCoverageFilename = "sparqlCoverageData";
export const sparqlFeaturesFilename = "sparqlFeaturesData";
export const vocabEndpointFilename = "vocabEndpointData";
export const knownVocabsFilename = "knownVocabsData";
export const vocabKeywordsFilename = "vocabKeywordsData";
export const tripleCountFilename = "tripleCountData";
export const classCountFilename = "classCountData";
export const propertyCountFilename = "propertyCountData";
export const categoryTestCountFilename = "categoryTestCountData";
export const totalCategoryTestCountFilename = "totalCategoryTestCountData";
export const endpointTestsDataFilename = "endpointTestsData";
export const totalRuntimeDataFilename = "totalRuntimeData";
export const averageRuntimeDataFilename = "averageRuntimeData";
export const classPropertyDataFilename = "classPropertyData";
export const datasetDescriptionDataFilename = "datasetDescriptionData";
export const shortUriDataFilename = "shortUriData";
export const rdfDataStructureDataFilename = "rdfDataStructureData";
export const readableLabelDataFilename = "readableLabelData";
export const blankNodesDataFilename = "blankNodesData";

export const LOVFilename = "knownVocabulariesLOV"

function generateGraphValueFilterClause(graphList: string[]) {
    let result = "FILTER( ";
    graphList.forEach((item, i) => {
        if (i > 0) {
            result += ` || REGEX( str(?g) , '${item}' )`;
        } else {
            result += `REGEX( str(?g) , '${item}' )`;
        }
    });
    result += " )";
    return result;
}

export function endpointMapfill(runset: RunSetObject) {
    Logger.info("endpointMapfill START")
    let endpointGeolocData = [];
    let endpointTimezoneSPARQL = new Map();
    let endpointLabelMap = new Map<string, string>();
    let endpointIpMapArray: EndpointIpGeolocObject[] = [];

    // Marked map with the geoloc of each endpoint
    return endpointIpMap.then(endpointIpMap => {
        endpointIpMapArray = endpointIpMap as EndpointIpGeolocObject[];
        return Promise.resolve();
    })
        .then(() => {
            let timezoneSPARQLquery = `SELECT DISTINCT ?timezone ?endpoint { 
            GRAPH ?g { 
                ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . 
                ?metadata <http://ns.inria.fr/kg/index#curated> ?base . 
                ?base <https://schema.org/broadcastTimezone> ?timezone .
            } 
            ${generateGraphValueFilterClause(runset.graphs)}
        }`;
            return Sparql.paginatedSparqlQueryToIndeGxPromise(timezoneSPARQLquery)
                .then(jsonResponse => {
                    if (jsonResponse != undefined) {
                        (jsonResponse as JSONValue[]).forEach((itemResponse, i) => {
                            endpointTimezoneSPARQL.set(itemResponse["endpoint"].value, itemResponse["timezone"].value);
                        });
                    }
                    return Promise.resolve();
                })
        })
        .then(() => {
            let labelQuery = `SELECT DISTINCT ?label ?endpoint { 
                GRAPH ?g { 
                    ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpoint . 
                    { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } 
                    UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } 
                    UNION { ?dataset <http://purl.org/dc/terms/title> ?label } 
                    UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } 
                    UNION { ?dataset <http://schema.org/name> ?label } . 
                }  
                ${generateGraphValueFilterClause(runset.graphs)}
            }`;
            return Sparql.sparqlQueryToIndeGxPromise(labelQuery)
                .then(responseLabels => {
                    responseLabels = responseLabels as SPARQLJSONResult;
                    if (responseLabels != undefined) {
                        responseLabels.results.bindings.forEach((itemResponse, i) => {
                            endpointLabelMap.set(itemResponse["endpoint"].value, itemResponse["label"].value);
                        });
                    }
                })
        })
        .then(() => {
            let endpointItemMap = new Map<string, any>();
            return Promise.allSettled((endpointIpMapArray as EndpointIpGeolocObject[]).map((item) => {
                if (item !== undefined) {
                    // Add the markers for each endpoints.
                    let endpoint = item.key;
                    let endpointItem: EndpointItem;

                    return timezoneMap.then(timeZoneMapArray => {
                        let ipTimezoneArrayFiltered = (timeZoneMapArray as TimezoneMapObject[]).filter(itemtza => itemtza.key == item.value.geoloc.timezone);
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
                        endpointItemMap.set(endpoint, endpointItem);
                        return Promise.resolve()
                    })
                } else {
                    return Promise.reject();
                }
            })
            ).then(() => {
                return Promise.resolve(endpointItemMap);
            });
        })
        .then(endpointItemMap => {
            endpointItemMap.forEach((endpointItem, endpoint) => {
                let popupString = `<table> <thead> <tr> <th colspan='2'> <a href='${endpointItem.endpoint}' >${endpointItem.endpoint}</a> </th> </tr> </thead></body>`;
                if (endpointItem.country != undefined) {
                    popupString += `<tr><td>Country: </td><td>${endpointItem.country}</td></tr>`;
                }
                if (endpointItem.region != undefined) {
                    popupString += `<tr><td>Region: </td><td>${endpointItem.region}</td></tr>`;
                }
                if (endpointItem.city != undefined) {
                    popupString += `<tr><td>City: </td><td>${endpointItem.city}</td></tr>`;
                }
                if (endpointItem.org != undefined) {
                    popupString += `<tr><td>Organization: </td><td>${endpointItem.org}</td></tr>`;
                }
                if (endpointItem.timezone != undefined) {
                    popupString += `<tr><td>Timezone of endpoint URL: </td><td>${endpointItem.timezone}</td></tr>`;
                    if (endpointItem.sparqlTimezone != undefined) {
                        let badTimezone = endpointItem.timezone.localeCompare(endpointItem.sparqlTimezone) != 0;
                        if (badTimezone) {
                            popupString += `<tr><td>Timezone declared by endpoint: </td><td>${endpointItem.sparqlTimezone}</td></tr>`;
                        }
                    }
                }
                if (endpointLabelMap.get(endpoint) != undefined) {
                    let endpointLabel = endpointLabelMap.get(endpoint);
                    popupString += `<tr><td colspan='2'>${endpointLabel}</td></tr>`;
                }
                popupString += "</tbody></table>"
                endpointItem.popupHTML = popupString;
            })

            endpointItemMap.forEach((endpointItem, endpoint) => {
                endpointGeolocData.push(endpointItem);
            });
            return Promise.resolve(endpointGeolocData);
        })
        .then(endpointGeolocData => {
            try {
                let content = JSON.stringify(endpointGeolocData);
                Logger.info("endpointMapfill for", runset.name, "END")
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, geolocFilename), content)
            } catch (err) {
                Logger.error(err)
            }
        })
        .catch(error => {
            Logger.error(error)
        })
}

export function SPARQLCoverageFill(runset: RunSetObject) {
    Logger.info("SPARQLCoverageFill START")
    // Create an histogram of the SPARQLES rules passed by endpoint.
    let sparqlesFeatureQuery = `SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) { 
            GRAPH ?g { 
                ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . 
                ?metadata <http://ns.inria.fr/kg/index#curated> ?base . 
                OPTIONAL {
                    ?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . 
                    FILTER(CONTAINS(str(?activity), ?sparqlNorm)) 
                    VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } 
                } 
            } 
            ${generateGraphValueFilterClause(runset.graphs)}
        } 
        GROUP BY ?endpoint ?sparqlNorm `;
    let jsonBaseFeatureSparqles = [];
    let sparqlFeaturesDataArray = [];
    return Sparql.paginatedSparqlQueryToIndeGxPromise(sparqlesFeatureQuery)
        .then(json => {
            let endpointSet = new Set();
            let sparql10Map = new Map();
            let sparql11Map = new Map();
            (json as JSONValue[]).forEach((bindingItem, i) => {
                let endpointUrl = bindingItem["endpoint"].value;
                endpointSet.add(endpointUrl);
                let feature = undefined;
                if (bindingItem["sparqlNorm"] != undefined) {
                    feature = bindingItem["sparqlNorm"].value;
                }
                let count = bindingItem["count"].value;
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
            const sparqlFeatureQuery = `SELECT DISTINCT ?endpoint ?activity { 
                GRAPH ?g { 
                    ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . 
                    ?metadata <http://ns.inria.fr/kg/index#curated> ?base . 
                    OPTIONAL { 
                        ?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . 
                        FILTER(CONTAINS(str(?activity), ?sparqlNorm)) 
                        VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } 
                    } 
                } 
                ${generateGraphValueFilterClause(runset.graphs)}
            } GROUP BY ?endpoint ?activity `;
            let endpointFeatureMap = new Map();
            let featuresShortName = new Map();
            return Sparql.paginatedSparqlQueryToIndeGxPromise(sparqlFeatureQuery)
                .then(json => {
                    endpointFeatureMap = new Map();
                    let featuresSet = new Set();
                    (json as JSONValue[]).forEach(bindingItem => {
                        const endpointUrl = bindingItem["endpoint"].value;
                        if (!endpointFeatureMap.has(endpointUrl)) {
                            endpointFeatureMap.set(endpointUrl, new Set());
                        }
                        if (bindingItem["activity"] != undefined) {
                            const activity = bindingItem["activity"].value;
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
            if (jsonBaseFeatureSparqles.length > 0) {
                try {
                    let content = JSON.stringify(jsonBaseFeatureSparqles);
                    fs.writeFileSync(Global.getCachedFilenameForRunset(runset.id, sparqlCoverageFilename), content)
                } catch (err) {
                    Logger.error(err)
                }
            }
            if (sparqlFeaturesDataArray.length > 0) {
                try {
                    let content = JSON.stringify(sparqlFeaturesDataArray);
                    fs.writeFileSync(Global.getCachedFilenameForRunset(runset.id, sparqlFeaturesFilename), content)
                } catch (err) {
                    Logger.error(err)
                }
            }
            Logger.info("SPARQLCoverageFill END")
        })
        .catch(error => {
            Logger.error(error)
        })
}

export function vocabFill(runset: RunSetObject): Promise<void> {
    Logger.info("vocabFill START")
    // Create an force graph with the graph linked by co-ocurrence of vocabularies
    let sparqlesVocabulariesQuery = `SELECT DISTINCT ?endpointUrl ?vocabulary { 
        GRAPH ?g { 
            { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
            UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
            ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . 
            ?dataset <http://rdfs.org/ns/void#vocabulary> ?vocabulary 
        } 
        ${generateGraphValueFilterClause(runset.graphs)}
    } 
    GROUP BY ?endpointUrl ?vocabulary `;
    let knownVocabularies = new Set();
    let rawGatherVocab = new Map();
    let gatherVocabData = [];
    let rawVocabSet = new Set();
    let vocabSet = new Set();
    let keywordSet = new Set();
    let vocabKeywordData = [];

    return Sparql.paginatedSparqlQueryToIndeGxPromise(sparqlesVocabulariesQuery)
        .then(json => {

            let endpointSet = new Set();
            (json as JSONValue[]).forEach((bindingItem, i) => {
                let vocabulariUri = bindingItem["vocabulary"].value;
                let endpointUri = bindingItem["endpointUrl"].value;
                endpointSet.add(endpointUri);
                rawVocabSet.add(vocabulariUri);
                if (!rawGatherVocab.has(endpointUri)) {
                    rawGatherVocab.set(endpointUri, new Set());
                }
                rawGatherVocab.get(endpointUri).add(vocabulariUri);
            });
            return Promise.resolve();

            // https://obofoundry.org/ // No ontology URL available in ontology description
            // http://prefix.cc/context // done
            // http://data.bioontology.org/resource_index/resources?apikey=b86b12d8-dc46-4528-82e3-13fbdabf5191 // No ontology URL available in ontology description
            // https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list // done

            // Retrieval of the list of LOV vocabularies to filter the ones retrieved in the index
        })
        .then(() => Global.fetchJSONPromise("https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list")
            .then(responseLOV => {
                if (responseLOV !== undefined) {
                    (responseLOV as JSONValue[]).forEach((item) => {
                        knownVocabularies.add(item["uri"])
                    });
                    try {
                        let content = JSON.stringify(responseLOV);
                        return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, LOVFilename), content)
                    } catch (err) {
                        Logger.error(err)
                        return Promise.reject(err);
                    }
                } else {
                    return Promise.reject("LOV response is undefined");
                }
            }))
        .then(() => Global.fetchJSONPromise("http://prefix.cc/context")
            .then(responsePrefixCC => {
                for (let prefix of Object.keys(responsePrefixCC['@context'])) {
                    knownVocabularies.add(responsePrefixCC['@context'][prefix])
                };
                return Promise.resolve();
            }))
        .then(() => Global.fetchJSONPromise("https://www.ebi.ac.uk/ols/api/ontologies?page=0&size=1000")
            .then(responseOLS => {
                responseOLS["_embedded"].ontologies.forEach(ontologyItem => {
                    if (ontologyItem.config.baseUris.length > 0) {
                        let ontology = ontologyItem.config.baseUris[0]
                        knownVocabularies.add(ontology);
                    }
                });
                return Promise.resolve();
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
                    vocabularyQueryValues += `<${item}> `;
                });

                let keywordLOVQuery = `SELECT DISTINCT ?vocabulary ?keyword { 
                    GRAPH <https://lov.linkeddata.es/dataset/lov> { 
                        ?vocabulary a <http://purl.org/vocommons/voaf#Vocabulary> .
                        ?vocabulary <http://www.w3.org/ns/dcat#keyword> ?keyword .
                    }
                    VALUES ?vocabulary { ${vocabularyQueryValues} } 
                }`
                queryArray.push(Global.fetchJSONPromise("https://lov.linkeddata.es/dataset/lov/sparql?query=" + encodeURIComponent(keywordLOVQuery) + "&format=json"));
            }

            return Promise.allSettled(queryArray)
                .then(jsonKeywordsArraySettled => {
                    let jsonKeywordsArray = Global.extractSettledPromiseValues(jsonKeywordsArraySettled);
                    let vocabKeywordMap = new Map();
                    jsonKeywordsArray.forEach(jsonKeywords => {
                        if (jsonKeywords !== undefined) {
                            jsonKeywords.results.bindings.forEach((keywordItem, i) => {
                                let keyword = keywordItem.keyword.value;
                                let vocab = keywordItem.vocabulary.value;
                                if (vocabKeywordMap.get(vocab) == undefined) {
                                    vocabKeywordMap.set(vocab, []);
                                }
                                vocabKeywordMap.get(vocab).push(keyword);

                                keywordSet.add(keyword);
                            });
                        }
                    })
                    vocabKeywordMap.forEach((keywordList, vocab) => {
                        vocabKeywordData.push({ vocabulary: vocab, keywords: keywordList })
                    })
                    return Promise.resolve();
                })
        })
        .finally(() => {
            if (gatherVocabData.length > 0) {
                try {
                    let content = JSON.stringify(gatherVocabData);
                    return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, vocabEndpointFilename), content)
                } catch (err) {
                    Logger.error(err)
                }
            }
        })
        .finally(() => {
            if (knownVocabularies.size > 0) {
                try {
                    let content = JSON.stringify([...knownVocabularies]);
                    return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, knownVocabsFilename), content)
                } catch (err) {
                    Logger.error(err)
                }
            }
        })
        .finally(() => {
            if (vocabKeywordData.length > 0) {
                try {
                    let content = JSON.stringify(vocabKeywordData);
                    return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, vocabKeywordsFilename), content).then(() => {
                        Logger.info("vocabFill END");
                        return Promise.resolve();
                    });
                } catch (err) {
                    Logger.error(err)
                }
            }
        })
        .catch(error => {
            Logger.error(error);
            return Promise.reject(error);
        })
}

export function tripleDataFill(runset: RunSetObject) {
    Logger.info("tripleDataFill START")
    // Scatter plot of the number of triples through time
    let triplesSPARQLquery = `SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) {
        GRAPH ?g {
            { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
            UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
    		{?metadata <http://purl.org/dc/terms/modified> ?date .}
            UNION { ?curated <http://purl.org/dc/terms/modified> ?date . }
            ?curated <http://rdfs.org/ns/void#triples> ?rawO .
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    } GROUP BY ?g ?date ?endpointUrl`;
    type EndpointTripleIndexItem = { date: Dayjs, triples: number };
    return Sparql.paginatedSparqlQueryToIndeGxPromise(triplesSPARQLquery)
        .then(json => {
            let endpointTriplesDataIndex: Map<string, Map<string, EndpointTripleIndexItem>> = new Map();
            let endpointTriplesData: TripleCountDataObject[] = [];
            (json as JSONValue[]).forEach((itemResult, i) => {
                let graph = itemResult["g"].value.replace('http://ns.inria.fr/indegx#', '');
                let date = Global.parseDate(itemResult["date"].value);
                let endpointUrl = itemResult["endpointUrl"].value;
                let triples = Number.parseInt(itemResult["o"].value);

                if (endpointTriplesDataIndex.get(endpointUrl) == undefined) {
                    endpointTriplesDataIndex.set(endpointUrl, new Map());
                }
                if (endpointTriplesDataIndex.get(endpointUrl).get(graph) == undefined) {
                    endpointTriplesDataIndex.get(endpointUrl).set(graph, { date: date, triples: triples });
                } else {
                    let previousDate = endpointTriplesDataIndex.get(endpointUrl).get(graph).date;
                    if (date.isBefore(previousDate) && date.year() != previousDate.year() && date.month() != previousDate.month() && date.date() != previousDate.date()) {
                        endpointTriplesDataIndex.get(endpointUrl).set(graph, { date: date, triples: triples });
                    }
                }
            });
            endpointTriplesDataIndex.forEach((graphTripleMap, endpointUrl) => {
                graphTripleMap.forEach((tripleData, graph) => {
                    endpointTriplesData.push({ endpoint: endpointUrl, graph: graph, date: tripleData.date, triples: tripleData.triples })
                })
            });
            return Promise.resolve(endpointTriplesData);
        })
        .then(endpointTriplesData => {
            try {
                let content = JSON.stringify(endpointTriplesData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, tripleCountFilename), content).then(() => {
                    Logger.info("tripleDataFill END");
                    return Promise.resolve();
                })
            } catch (err) {
                Logger.error(err)
                return Promise.reject(err);
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function classDataFill(runset: RunSetObject) {
    Logger.info("classDataFill START")
    // Scatter plot of the number of classes through time
    let classesSPARQLquery = `SELECT DISTINCT ?g ?endpointUrl ?date (MAX(?rawO) AS ?o) { 
        GRAPH ?g {
            { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
            UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
    		{?metadata <http://purl.org/dc/terms/modified> ?date .}
            UNION { ?curated <http://purl.org/dc/terms/modified> ?date . }
            ?curated <http://rdfs.org/ns/void#classes> ?rawO .
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    } GROUP BY ?g ?endpointUrl ?date`;
    type EndpointClassesIndexItem = { date: Dayjs, classes: number };
    let endpointClassesDataIndex: Map<string, Map<string, EndpointClassesIndexItem>> = new Map();
    return Sparql.paginatedSparqlQueryToIndeGxPromise(classesSPARQLquery)
        .then(json => {
            let endpointClassCountData: ClassCountDataObject[] = [];
            (json as JSONValue[]).forEach((itemResult, i) => {
                let graph = itemResult["g"].value.replace('http://ns.inria.fr/indegx#', '');
                let date = Global.parseDate(itemResult["date"].value);
                let endpointUrl = itemResult["endpointUrl"].value;
                let classes = Number.parseInt(itemResult["o"].value);
                if (endpointClassesDataIndex.get(endpointUrl) == undefined) {
                    endpointClassesDataIndex.set(endpointUrl, new Map());
                }
                if (endpointClassesDataIndex.get(endpointUrl).get(graph) == undefined) {
                    endpointClassesDataIndex.get(endpointUrl).set(graph, { date: date, classes: classes });
                } else {
                    let previousDate = endpointClassesDataIndex.get(endpointUrl).get(graph).date;
                    if (date.isBefore(previousDate) && date.year() != previousDate.year() && date.month() != previousDate.month() && date.date() != previousDate.date()) {
                        endpointClassesDataIndex.get(endpointUrl).set(graph, { date: date, classes: classes });
                    }
                }
            });
            endpointClassesDataIndex.forEach((graphClassesMap, endpointUrl) => {
                graphClassesMap.forEach((classesData, graph) => {
                    endpointClassCountData.push({ endpoint: endpointUrl, graph: graph, date: classesData.date, classes: classesData.classes })
                })
            });
            return Promise.resolve(endpointClassCountData);
        })
        .then(endpointClassCountData => {
            try {
                let content = JSON.stringify(endpointClassCountData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, classCountFilename), content).then(() => {
                    Logger.info("classDataFill END")
                    return Promise.resolve();
                })
            } catch (err) {
                Logger.error(err);
                return Promise.reject(err);
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function propertyDataFill(runset: RunSetObject) {
    Logger.info("propertyDataFill START")
    // scatter plot of the number of properties through time
    let propertiesSPARQLquery = `SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) {
        GRAPH ?g {
            { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
            UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
    		{?metadata <http://purl.org/dc/terms/modified> ?date .}
            UNION { ?curated <http://purl.org/dc/terms/modified> ?date . }
            ?curated <http://rdfs.org/ns/void#properties> ?rawO .
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    } GROUP BY ?endpointUrl ?g ?date`;
    type EndpointPropertiesIndexItem = { date: Dayjs, properties: number };
    let endpointPropertiesDataIndex = new Map();
    return Sparql.paginatedSparqlQueryToIndeGxPromise(propertiesSPARQLquery)
        .then(json => {
            let endpointPropertyCountData = [];
            (json as JSONValue[]).forEach((itemResult, i) => {
                let graph = itemResult["g"].value.replace('http://ns.inria.fr/indegx#', '');
                let endpointUrl = itemResult["endpointUrl"].value;
                let properties = Number.parseInt(itemResult["o"].value);
                let date = Global.parseDate(itemResult["date"].value);

                if (endpointPropertiesDataIndex.get(endpointUrl) == undefined) {
                    endpointPropertiesDataIndex.set(endpointUrl, new Map());
                }
                if (endpointPropertiesDataIndex.get(endpointUrl).get(graph) == undefined) {
                    endpointPropertiesDataIndex.get(endpointUrl).set(graph, { date: date, properties: properties });
                } else {
                    let previousDate = endpointPropertiesDataIndex.get(endpointUrl).get(graph).date;
                    if (date.isAfter(previousDate)) {
                        endpointPropertiesDataIndex.get(endpointUrl).set(graph, { date: date, properties: properties });
                    }
                }
            });
            endpointPropertiesDataIndex.forEach((graphPropertiesMap, endpointUrl) => {
                graphPropertiesMap.forEach((propertiesData, graph) => {
                    endpointPropertyCountData.push({ endpoint: endpointUrl, graph: graph, date: propertiesData.date, properties: propertiesData.properties })
                })
            });
            return Promise.resolve(endpointPropertyCountData);
        })
        .then(endpointPropertyCountData => {
            try {
                let content = JSON.stringify(endpointPropertyCountData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, propertyCountFilename), content).then(() => {
                    Logger.info("propertyDataFill END")
                    return Promise.resolve();
                })
            } catch (err) {
                Logger.error(err)
                return Promise.reject(err);
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function categoryTestCountFill(runset: RunSetObject) {
    Logger.info("categoryTestCountFill START")
    let testCategoryData = [];
    // Number of tests passed by test categories
    let testCategoryQuery = `SELECT DISTINCT ?g ?date ?category (count(DISTINCT ?test) AS ?count) ?endpointUrl { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
            ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . 
            { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
            UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
            UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
    		{?metadata <http://purl.org/dc/terms/modified> ?date .}
            UNION { ?curated <http://purl.org/dc/terms/modified> ?date . }
            ?trace <http://www.w3.org/ns/earl#test> ?test . 
            ?trace <http://www.w3.org/ns/earl#result> ?result .
            ?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#passed> .
            FILTER(STRSTARTS(str(?test), ?category))
            VALUES ?category { 
                'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/' 
                'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/' 
                'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/' 
                'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/' 
                'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/'
                'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/' 
            }
        }  
        ${generateGraphValueFilterClause(runset.graphs)}
    } GROUP BY ?g ?date ?category ?endpointUrl`;
    return Sparql.paginatedSparqlQueryToIndeGxPromise(testCategoryQuery)
        .then(json => {
            (json as JSONValue[]).forEach((itemResult, i) => {
                let category = itemResult["category"].value;
                let count = itemResult["count"].value;
                let endpoint = itemResult["endpointUrl"].value;
                let graph = itemResult["g"].value.replace('http://ns.inria.fr/indegx#', '');
                let date = Global.parseDate(itemResult["date"].value);
                testCategoryData.push({ category: category, graph: graph, date: date, endpoint: endpoint, count: count });
            });
            return Promise.resolve();
        })
        .then(() => {
            if (testCategoryData.length > 0) {
                try {
                    let content = JSON.stringify(testCategoryData);
                    return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, categoryTestCountFilename), content).then(() => {
                        Logger.info("categoryTestCountFill END")
                        return Promise.resolve();
                    });
                } catch (err) {
                    Logger.error(err)
                }
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function totalCategoryTestCountFill(runset: RunSetObject) {
    Logger.info("totalCategoryTestCountFill START")
    // Number of tests passed by test categories
    let testCategoryQuery = `SELECT DISTINCT ?category ?g ?date (count(DISTINCT ?test) AS ?count) ?endpointUrl { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
            ?metadata <http://ns.inria.fr/kg/index#trace> ?trace .
            { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
            UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
            ?metadata <http://purl.org/dc/terms/modified> ?date .
            ?trace <http://www.w3.org/ns/earl#test> ?test .
            ?trace <http://www.w3.org/ns/earl#result> ?result .
            ?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#passed> .
            FILTER(STRSTARTS(str(?test), str(?category))) 
            VALUES ?category {
                <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/> 
                <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/> 
                <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/> 
                <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/>
                <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/> 
                <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/> 
            } 
        } 
        ${generateGraphValueFilterClause(runset.graphs)}
    } 
    GROUP BY ?g ?date ?category ?endpointUrl 
    ORDER BY ?category `;
    return Sparql.paginatedSparqlQueryToIndeGxPromise(testCategoryQuery).then(json => {
        let totalTestCategoryData = [];
        (json as JSONValue[]).forEach((itemResult, i) => {
            let category = itemResult["category"].value;
            let count = itemResult["count"].value;
            let endpoint = itemResult["endpointUrl"].value;
            let graph = itemResult["g"].value;
            let date = Global.parseDate(itemResult["date"].value);

            totalTestCategoryData.push({ category: category, endpoint: endpoint, graph: graph, date: date, count: count })
            return Promise.resolve(totalTestCategoryData);
        });
    })
        .then(totalTestCategoryData => {
            try {
                let content = JSON.stringify(totalTestCategoryData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, totalCategoryTestCountFilename), content).then(() => {
                    Logger.info("totalCategoryTestCountFill END")
                    return Promise.resolve();
                })
            } catch (err) {
                Logger.error(err)
                return Promise.reject(err);
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject();
        });
}

export function endpointTestsDataFill(runset: RunSetObject) {
    Logger.info("endpointTestsDataFill START")

    let appliedTestQuery = `SELECT DISTINCT ?endpointUrl ?g ?date ?rule { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . 
    		{?metadata <http://purl.org/dc/terms/modified> ?date .}
            UNION { ?curated <http://purl.org/dc/terms/modified> ?date . }
            ?curated <http://www.w3.org/ns/prov#wasGeneratedBy> ?rule . 
            { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
            UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
            UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
        } 
        ${generateGraphValueFilterClause(runset.graphs)}
    }`;
    type EndpointTestItem = { activity: string, date: Dayjs };
    let endpointGraphTestsIndex: Map<string, Map<string, EndpointTestItem>> = new Map();
    return Sparql.paginatedSparqlQueryToIndeGxPromise(appliedTestQuery)
        .then(json => {
            let endpointTestsData: EndpointTestObject[] = [];
            (json as JSONValue[]).forEach((item, i) => {
                let endpointUrl = item["endpointUrl"].value;
                let rule = item["rule"].value;
                let graph = item["g"].value;
                let date = Global.parseDate(item["date"].value);

                if (!endpointGraphTestsIndex.has(endpointUrl)) {
                    endpointGraphTestsIndex.set(endpointUrl, new Map());
                }
                let graphTestsIndex = endpointGraphTestsIndex.get(endpointUrl);
                if (!graphTestsIndex.has(graph)) {
                    graphTestsIndex.set(graph, { activity: rule, date: date });
                } else {
                    let previousDate = endpointGraphTestsIndex.get(endpointUrl).get(graph).date;
                    if (date.isBefore(previousDate)) {
                        endpointGraphTestsIndex.get(endpointUrl).set(graph, { activity: rule, date: date });
                    }
                }

                endpointGraphTestsIndex.forEach((graphTestsIndex, endpointUrl) => {
                    graphTestsIndex.forEach((item, graph) => {
                        endpointTestsData.push({ endpoint: endpointUrl, activity: item.activity, graph: graph, date: item.date })
                    })
                })
            });
            return Promise.resolve(endpointTestsData);
        })
        .then(endpointTestsData => {
            try {
                let content = JSON.stringify(endpointTestsData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, endpointTestsDataFilename), content).then(() => {
                    Logger.info("endpointTestsDataFill END")
                    return Promise.resolve();
                })
            } catch (err) {
                Logger.error(err)
                return Promise.reject(err);
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function totalRuntimeDataFill(runset: RunSetObject) {
    Logger.info("totalRuntimeDataFill START")
    let maxMinTimeQuery = `SELECT DISTINCT ?g ?endpointUrl ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
            ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . 
            ?metadata <http://purl.org/dc/terms/modified> ?date .
            ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime .
            ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime .
            { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
            UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    } `;
    return Sparql.paginatedSparqlQueryToIndeGxPromise(maxMinTimeQuery).then(jsonResponse => {
        let totalRuntimeData = [];
        (jsonResponse as JSONValue[]).forEach((itemResult, i) => {
            let graph = itemResult["g"].value.replace('http://ns.inria.fr/indegx#', '');
            let date = Global.parseDate(itemResult["date"].value);
            let start = Global.parseDate(itemResult["start"].value);
            let end = Global.parseDate(itemResult["end"].value);
            let endpointUrl = itemResult["endpointUrl"].value;
            let runtimeData = dayjs.duration(end.diff(start));
            totalRuntimeData.push({ graph: graph, endpoint: endpointUrl, date: date, start: start, end: end, runtime: runtimeData })
        });
        return Promise.resolve(totalRuntimeData);
    })
        .then(totalRuntimeData => {
            try {
                let content = JSON.stringify(totalRuntimeData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, totalRuntimeDataFilename), content).then(() => {
                    Logger.info("totalRuntimeDataFill END")
                    return Promise.resolve();
                });
            } catch (err) {
                Logger.error(err)
                return Promise.reject(err);
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function averageRuntimeDataFill(runset: RunSetObject) {
    Logger.info("averageRuntimeDataFill START")
    let maxMinTimeQuery = `SELECT DISTINCT ?g ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { 
        GRAPH ?g {
            ?metadata <http://ns.inria.fr/kg/index#curated> ?data , ?endpoint .
            ?metadata <http://ns.inria.fr/kg/index#trace> ?trace .
            ?metadata <http://purl.org/dc/terms/modified> ?date .
            ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime .
            ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime .
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    }`;
    let numberOfEndpointQuery = `SELECT DISTINCT ?g (COUNT(?endpointUrl) AS ?count) { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?dataset . 
            { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
            UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
        } 
        ${generateGraphValueFilterClause(runset.graphs)}
    } GROUP BY ?g`;
    let averageRuntimeData = [];
    let graphStartEndMap = new Map();
    return Promise.allSettled([
        Sparql.paginatedSparqlQueryToIndeGxPromise(maxMinTimeQuery)
            .then(jsonResponse => {
                (jsonResponse as JSONValue[]).forEach((itemResult, i) => {
                    let graph = itemResult["g"].value.replace('http://ns.inria.fr/indegx#', '');
                    let date = Global.parseDate(itemResult["date"].value);
                    let start = Global.parseDate(itemResult["start"].value);
                    let end = Global.parseDate(itemResult["end"].value);
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
                return Promise.resolve();
            }),
        Sparql.paginatedSparqlQueryToIndeGxPromise(numberOfEndpointQuery)
            .then(numberOfEndpointJson => {
                (numberOfEndpointJson as JSONValue[]).forEach((numberEndpointItem, i) => {
                    let graph = numberEndpointItem["g"].value;
                    graph = graph.replace('http://ns.inria.fr/indegx#', '');
                    let count = numberEndpointItem["count"].value;
                    if (graphStartEndMap.get(graph) == undefined) {
                        graphStartEndMap.set(graph, {});
                    }
                    graphStartEndMap.get(graph).count = count
                    averageRuntimeData.push(graphStartEndMap.get(graph))
                });
                return Promise.resolve();
            })
    ])
        .then(() => {
            if (averageRuntimeData.length > 0) {
                try {
                    let content = JSON.stringify(averageRuntimeData);
                    return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, averageRuntimeDataFilename), content)
                } catch (err) {
                    Logger.error(err)
                }
            }
            Logger.info("averageRuntimeDataFill END")
            return Promise.resolve();
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject();
        });
}

export function classAndPropertiesDataFill(runset: RunSetObject) {
    Logger.info("classAndPropertiesDataFill START")
    let classPartitionQuery = `CONSTRUCT { ?classPartition <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl ;
            <http://rdfs.org/ns/void#class> ?c ;
            <http://rdfs.org/ns/void#triples> ?ct ;
            <http://rdfs.org/ns/void#classes> ?cc ;
            <http://rdfs.org/ns/void#properties> ?cp ;
            <http://rdfs.org/ns/void#distinctSubjects> ?cs ;
            <http://rdfs.org/ns/void#distinctObjects> ?co . 
    } WHERE { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . 
            ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . 
            ?base <http://rdfs.org/ns/void#classPartition> ?classPartition . 
            ?classPartition <http://rdfs.org/ns/void#class> ?c . 
            OPTIONAL { ?classPartition <http://rdfs.org/ns/void#triples> ?ct . } 
            OPTIONAL { ?classPartition <http://rdfs.org/ns/void#classes> ?cc . }
            OPTIONAL { ?classPartition <http://rdfs.org/ns/void#properties> ?cp . } 
            OPTIONAL { ?classPartition <http://rdfs.org/ns/void#distinctSubjects> ?cs . } 
            OPTIONAL { ?classPartition <http://rdfs.org/ns/void#distinctObjects> ?co . } 
            FILTER(! isBlank(?c)) 
        } 
        ${generateGraphValueFilterClause(runset.graphs)}
    }`
    let classSet = new Set();
    let classCountsEndpointsMap = new Map();
    let classPropertyCountsEndpointsMap = new Map();
    let classContentData = [];
    return Sparql.paginatedSparqlQueryToIndeGxPromise(classPartitionQuery)
        .then(classPartitionStore => {
            classPartitionStore = classPartitionStore as $rdf.Store;
            let classStatements: $rdf.Statement[] = classPartitionStore.statementsMatching(null, RDFUtils.VOID("class"), null);
            classStatements.forEach((classStatement, i) => {
                let c = classStatement.subject.value; //item.c.value;
                classSet.add(c);
                (classPartitionStore as $rdf.Store).statementsMatching(classStatement.subject, RDFUtils.SD("endpoint"), null).forEach((classEndpointStatement, i) => {
                    let endpointUrl = classEndpointStatement.object.value;
                    if (classCountsEndpointsMap.get(c) == undefined) {
                        classCountsEndpointsMap.set(c, { class: c });
                    }
                    classCountsEndpointsMap.get(c).endpoints.add(endpointUrl);
                });
                (classPartitionStore as $rdf.Store).statementsMatching(classStatement.subject, RDFUtils.VOID("triples"), null).forEach((classTriplesStatement, i) => {
                    let ct = Number.parseInt(classTriplesStatement.object.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).triples == undefined) {
                        currentClassItem.triples = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.triples = currentClassItem.triples + ct;
                    classCountsEndpointsMap.set(c, currentClassItem);
                });
                (classPartitionStore as $rdf.Store).statementsMatching(classStatement.subject, RDFUtils.VOID("classes"), null).forEach((classClassesStatement, i) => {
                    let cc = Number.parseInt(classClassesStatement.object.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).classes == undefined) {
                        currentClassItem.classes = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.classes = currentClassItem.classes + cc;
                    classCountsEndpointsMap.set(c, currentClassItem);
                });
                (classPartitionStore as $rdf.Store).statementsMatching(classStatement.subject, RDFUtils.VOID("properties"), null).forEach((classPropertiesStatement, i) => {
                    let cp = Number.parseInt(classPropertiesStatement.object.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).properties == undefined) {
                        currentClassItem.properties = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.properties = currentClassItem.properties + cp;
                    classCountsEndpointsMap.set(c, currentClassItem);
                });
                (classPartitionStore as $rdf.Store).statementsMatching(classStatement.subject, RDFUtils.VOID("distinctSubjects"), null).forEach((classDistinctSubjectsStatement, i) => {
                    let cs = Number.parseInt(classDistinctSubjectsStatement.object.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).distinctSubjects == undefined) {
                        currentClassItem.distinctSubjects = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.distinctSubjects = currentClassItem.distinctSubjects + cs;
                    classCountsEndpointsMap.set(c, currentClassItem);
                });
                (classPartitionStore as $rdf.Store).statementsMatching(classStatement.subject, RDFUtils.VOID("distinctObjects"), null).forEach((classDistinctObjectsStatement, i) => {
                    let co = Number.parseInt(classDistinctObjectsStatement.object.value);
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    if (classCountsEndpointsMap.get(c).distinctObjects == undefined) {
                        currentClassItem.distinctObjects = 0;
                        classCountsEndpointsMap.set(c, currentClassItem);
                    }
                    currentClassItem.distinctObjects = currentClassItem.distinctObjects + co;
                    classCountsEndpointsMap.set(c, currentClassItem);
                });
                if (classCountsEndpointsMap.get(c).endpoints == undefined) {
                    let currentClassItem = classCountsEndpointsMap.get(c);
                    currentClassItem.endpoints = new Set();
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
            });
            return Promise.resolve();
        })
        .then(() => {
            let classPropertyPartitionQuery = `CONSTRUCT {
                ?classPropertyPartition <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl  ;
                    <http://rdfs.org/ns/void#class> ?c ;
                    <http://rdfs.org/ns/void#property> ?p ;
                    <http://rdfs.org/ns/void#triples> ?pt ;
                    <http://rdfs.org/ns/void#distinctSubjects> ?ps ;
                    <http://rdfs.org/ns/void#distinctObjects> ?po .
            } { 
                GRAPH ?g {
                    ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . 
                    ?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . 
                    ?base <http://rdfs.org/ns/void#classPartition> ?classPartition . 
                    ?classPartition <http://rdfs.org/ns/void#class> ?c . 
                    ?classPartition <http://rdfs.org/ns/void#propertyPartition> ?classPropertyPartition . 
                    ?classPropertyPartition <http://rdfs.org/ns/void#property> ?p . 
                    OPTIONAL { ?classPropertyPartition <http://rdfs.org/ns/void#triples> ?pt . } 
                    OPTIONAL { ?classPropertyPartition <http://rdfs.org/ns/void#distinctSubjects> ?ps . } 
                    OPTIONAL { ?classPropertyPartition <http://rdfs.org/ns/void#distinctObjects> ?po . } 
                    FILTER(! isBlank(?c)) 
                }
                ${generateGraphValueFilterClause(runset.graphs)}
            }`;
            return Sparql.paginatedSparqlQueryToIndeGxPromise(classPropertyPartitionQuery).then(classPropertyStore => {
                classPropertyStore = classPropertyStore as $rdf.Store;
                (classPropertyStore as $rdf.Store).statementsMatching(null, RDFUtils.VOID("class"), null).forEach((classPropertyStatement, i) => {
                    let partitionNode = classPropertyStatement.subject;
                    let c = classPropertyStatement.object.value;
                    classSet.add(c);
                    if (classPropertyCountsEndpointsMap.get(c) == undefined) {
                        classPropertyCountsEndpointsMap.set(c, new Map());
                    }
                    (classPropertyStore as $rdf.Store).statementsMatching(partitionNode, RDFUtils.VOID("property"), null).forEach((propertyStatement, i) => {
                        let p = propertyStatement.object.value;
                        if (classPropertyCountsEndpointsMap.get(c).get(p) == undefined) {
                            classPropertyCountsEndpointsMap.get(c).set(p, { property: p });
                        }
                        (classPropertyStore as $rdf.Store).statementsMatching(partitionNode, RDFUtils.SD("endpoint"), null).forEach((endpointStatement, i) => {
                            let endpointUrl = endpointStatement.object.value;
                            if (classPropertyCountsEndpointsMap.get(c).get(p).endpoints == undefined) {
                                classPropertyCountsEndpointsMap.get(c).get(p).endpoints = new Set();
                            }
                            classPropertyCountsEndpointsMap.get(c).get(p).endpoints.add(endpointUrl);
                        });
                        (classPropertyStore as $rdf.Store).statementsMatching(partitionNode, RDFUtils.VOID("triples"), null).forEach((triplesStatement, i) => {
                            let pt = Number.parseInt(triplesStatement.object.value);
                            if (classPropertyCountsEndpointsMap.get(c).get(p).triples == undefined) {
                                classPropertyCountsEndpointsMap.get(c).get(p).triples = 0;
                            }
                            classPropertyCountsEndpointsMap.get(c).get(p).triples = classPropertyCountsEndpointsMap.get(c).get(p).triples + pt;
                        });
                        (classPropertyStore as $rdf.Store).statementsMatching(partitionNode, RDFUtils.VOID("distinctSubjects"), null).forEach((distinctSubjectsStatement, i) => {
                            let ps = Number.parseInt(distinctSubjectsStatement.object.value);
                            if (classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects == undefined) {
                                classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = 0;
                            }
                            classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects + ps;
                        });
                        (classPropertyStore as $rdf.Store).statementsMatching(partitionNode, RDFUtils.VOID("distinctObjects"), null).forEach((distinctObjectsStatement, i) => {
                            let po = Number.parseInt(distinctObjectsStatement.object.value);
                            if (classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects == undefined) {
                                classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects = 0;
                            }
                            classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects = classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects + po;
                        });
                    })
                });
                return Promise.resolve();
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
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, classPropertyDataFilename), content).then(() => {
                    Logger.info("classAndPropertiesDataFill END")
                    return Promise.resolve();
                })
            } catch (err) {
                Logger.error(err)
                return Promise.reject(err);
            }
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        })
}

export function datasetDescriptionDataFill(runset: RunSetObject) {
    Logger.info("datasetDescriptionDataDataFill START")
    let provenanceWhoCheckQuery = `SELECT DISTINCT ?endpointUrl ?o { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . 
            { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
            UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl }
            UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }
            OPTIONAL {
                { ?dataset <http://purl.org/dc/terms/creator> ?o }
                UNION { ?dataset <http://purl.org/dc/terms/contributor> ?o }
                UNION { ?dataset <http://purl.org/dc/terms/publisher> ?o }
            }
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    }`;
    let provenanceLicenseCheckQuery = `SELECT DISTINCT ?endpointUrl ?o { 
        GRAPH ?g {
            ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset .
            { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } 
            UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }
            OPTIONAL {
                { ?dataset <http://purl.org/dc/terms/license> ?o } 
                UNION {?dataset <http://purl.org/dc/terms/conformsTo> ?o }
            } 
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    } `;
    let provenanceDateCheckQuery = `SELECT DISTINCT ?endpointUrl ?o { 
        GRAPH ?g { 
            ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . 
            { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl }
            UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }
            OPTIONAL {
                { ?dataset <http://purl.org/dc/terms/modified> ?o }
                UNION { ?dataset <http://www.w3.org/ns/prov#wasGeneratedAtTime> ?o } 
                UNION { ?dataset <http://purl.org/dc/terms/issued> ?o }
            }
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    } `;
    let provenanceSourceCheckQuery = `SELECT DISTINCT ?endpointUrl ?o {
        GRAPH ?g {
            ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset .
            { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
            UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl }
            UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }
            OPTIONAL {
                { ?dataset <http://purl.org/dc/terms/source> ?o } 
                UNION { ?dataset <http://www.w3.org/ns/prov#wasDerivedFrom> ?o }
                UNION { ?dataset <http://purl.org/dc/terms/format> ?o }
            }
        }
        ${generateGraphValueFilterClause(runset.graphs)}
    } `;
    let endpointDescriptionElementMap = new Map();

    let datasetDescriptionData = [];
    return Promise.allSettled([
        Sparql.paginatedSparqlQueryToIndeGxPromise(provenanceWhoCheckQuery)
            .then(json => {
                (json as JSONValue[]).forEach((item, i) => {
                    let endpointUrl = item["endpointUrl"].value;
                    let who = (item["o"] != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.who = who;
                    if (who) {
                        currentEndpointItem.whoValue = item["o"].value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                })
                return Promise.resolve();
            }),
        Sparql.paginatedSparqlQueryToIndeGxPromise(provenanceLicenseCheckQuery)
            .then(json => {
                (json as JSONValue[]).forEach((item, i) => {
                    let endpointUrl = item["endpointUrl"].value;
                    let license = (item["o"] != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.license = license;
                    if (license) {
                        currentEndpointItem.licenseValue = item["o"].value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                })
                return Promise.resolve();
            })
            .catch(error => {
                Logger.error(error)
                return Promise.reject(error);
            })
        ,
        Sparql.paginatedSparqlQueryToIndeGxPromise(provenanceDateCheckQuery)
            .then(json => {
                (json as JSONValue[]).forEach((item, i) => {
                    let endpointUrl = item["endpointUrl"].value;
                    let time = (item["o"] != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.time = time;
                    if (time) {
                        currentEndpointItem.timeValue = item["o"].value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                })
                return Promise.resolve();
            })
            .catch(error => {
                Logger.error(error)
                return Promise.reject(error);
            })
        ,
        Sparql.paginatedSparqlQueryToIndeGxPromise(provenanceSourceCheckQuery)
            .then(json => {
                (json as JSONValue[]).forEach((item, i) => {
                    let endpointUrl = item["endpointUrl"].value;
                    let source = (item["o"] != undefined);
                    let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    if (currentEndpointItem == undefined) {
                        endpointDescriptionElementMap.set(endpointUrl, { endpoint: endpointUrl })
                        currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                    }
                    currentEndpointItem.source = source;
                    if (source) {
                        currentEndpointItem.sourceValue = item["o"].value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                });
                endpointDescriptionElementMap.forEach((prov, endpoint, map) => {
                    datasetDescriptionData.push(prov)
                });
                return Promise.resolve();
            })
            .catch(error => {
                Logger.error(error)
                return Promise.reject(error);
            })
    ])
        .finally(() => {
            if (datasetDescriptionData.length > 0) {
                try {
                    let content = JSON.stringify(datasetDescriptionData);
                    return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, datasetDescriptionDataFilename), content)
                } catch (err) {
                    Logger.error(err)
                }
            }
            Logger.info("datasetDescriptionDataDataFill END")
            return Promise.resolve();
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function shortUrisDataFill(runset: RunSetObject) {
    Logger.info("shortUrisDataFill START")
    let shortUrisMeasureQuery = `SELECT DISTINCT ?g ?date ?endpointUrl ?measure {
            GRAPH ?g {
                { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
                UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
                ?metadata <http://purl.org/dc/terms/modified> ?date . 
                ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
                ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode .
                ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/shortUris.ttl> .
                ?measureNode <http://www.w3.org/ns/dqv#value> ?measure .
            }
            ${generateGraphValueFilterClause(runset.graphs)}
        } GROUP BY ?g ?date ?endpointUrl ?measure`;
    return Sparql.paginatedSparqlQueryToIndeGxPromise(shortUrisMeasureQuery)
        .then(json => {
            let shortUriData = []
            let graphSet = new Set();
            (json as JSONValue[]).forEach((jsonItem, i) => {
                let endpoint = jsonItem["endpointUrl"].value;
                let shortUriMeasure = Number.parseFloat(jsonItem["measure"].value) * 100;
                let graph = jsonItem["g"].value.replace("http://ns.inria.fr/indegx#", "");
                let date = Global.parseDate(jsonItem["date"].value);

                graphSet.add(graph);
                shortUriData.push({ graph: graph, date: date, endpoint: endpoint, measure: shortUriMeasure })
            });
            return Promise.resolve(shortUriData);
        })
        .then(shortUriData => {
            if (shortUriData.length > 0) {
                try {
                    let content = JSON.stringify(shortUriData);
                    fs.writeFileSync(Global.getCachedFilenameForRunset(runset.id, shortUriDataFilename), content)
                } catch (err) {
                    Logger.error(err)
                }
            }
            Logger.info("shortUrisDataFill END")
            return Promise.resolve();
        })
        .catch(error => {
            Logger.error(error)
            return Promise.reject(error);
        });
}

export function readableLabelsDataFill(runset: RunSetObject) {
    Logger.info("readableLabelsDataFill START")
    let readableLabelsQuery = `SELECT DISTINCT ?g ?date ?endpointUrl ?measure { 
            GRAPH ?g {
                { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
                UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
                ?metadata <http://purl.org/dc/terms/modified> ?date . 
                ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . 
                ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . 
                ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . 
                ?measureNode <http://www.w3.org/ns/dqv#value> ?measure . 
            } 
            ${generateGraphValueFilterClause(runset.graphs)}
        } GROUP BY ?g ?date ?endpointUrl ?measure`;

    return Sparql.paginatedSparqlQueryToIndeGxPromise(readableLabelsQuery)
        .then(json => {
            let readableLabelData = [];
            (json as JSONValue[]).forEach((jsonItem, i) => {
                let endpoint = jsonItem["endpointUrl"].value;
                let readableLabelMeasure = Number.parseFloat(jsonItem["measure"].value) * 100;
                let graph = jsonItem["g"].value.replace("http://ns.inria.fr/indegx#", "");
                let date = Global.parseDate(jsonItem["date"].value);

                readableLabelData.push({ graph: graph, date: date, endpoint: endpoint, measure: readableLabelMeasure })
            });
            return Promise.resolve(readableLabelData);
        })
        .then(readableLabelData => {
            if (readableLabelData.length > 0) {
                try {
                    let content = JSON.stringify(readableLabelData);
                    return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, readableLabelDataFilename), content).then(() => {
                        Logger.info("readableLabelsDataFill END")
                        return Promise.resolve();
                    });
                } catch (err) {
                    Logger.error(err)
                }
            }
            return Promise.resolve();
        })
        .catch(error => {
            Logger.error(error);
            return Promise.reject(error);
        });
}

export function rdfDataStructureDataFill(runset: RunSetObject) {
    Logger.info("rdfDataStructureDataFill START")
    let rdfDataStructureQuery = `SELECT DISTINCT ?g ?date ?endpointUrl ?measure { 
            GRAPH ?g {
                { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
                UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
                ?metadata <http://purl.org/dc/terms/modified> ?date . 
                ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . 
                ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . 
                ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/RDFDataStructures.ttl> . 
                ?measureNode <http://www.w3.org/ns/dqv#value> ?measure . 
            }
            ${generateGraphValueFilterClause(runset.graphs)}
        } 
        GROUP BY ?g ?date ?endpointUrl ?measure` ;

    return Sparql.paginatedSparqlQueryToIndeGxPromise(rdfDataStructureQuery).then(json => {
        let rdfDataStructureData = [];
        (json as JSONValue[]).forEach((jsonItem, i) => {
            let endpoint = jsonItem["endpointUrl"].value;
            let rdfDataStructureMeasure = Number.parseFloat(jsonItem["measure"].value) * 100;
            let graph = jsonItem["g"].value.replace("http://ns.inria.fr/indegx#", "");
            let date = Global.parseDate(jsonItem["date"].value);

            rdfDataStructureData.push({ graph: graph, date: date, endpoint: endpoint, measure: rdfDataStructureMeasure })
        });
        return Promise.resolve(rdfDataStructureData);
    })
        .then(rdfDataStructureData => {
            try {
                let content = JSON.stringify(rdfDataStructureData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, rdfDataStructureDataFilename), content).then(() => {
                    Logger.info("rdfDataStructureDataFill END");
                    return;
                })

            } catch (err) {
                Logger.error(err)
            }
            return Promise.resolve();
        })
        .catch(error => {
            Logger.error(error);
        });
}

export function blankNodeDataFill(runset: RunSetObject) {
    Logger.info("blankNodeDataFill START")
    let blankNodeQuery = `SELECT DISTINCT ?g ?date ?endpointUrl ?measure { 
            GRAPH ?g {
                ?metadata <http://purl.org/dc/terms/modified> ?date . 
                { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
                UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
                ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . 
                ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . 
                ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/blankNodeUsage.ttl> . 
                ?measureNode <http://www.w3.org/ns/dqv#value> ?measure . 
            }
            ${generateGraphValueFilterClause(runset.graphs)}
        } 
        GROUP BY ?g ?date ?endpointUrl ?measure` ;
    return Sparql.sparqlQueryToIndeGxPromise(blankNodeQuery).then(json => {

        let blankNodeData = []
        let graphSet = new Set();
        (json as SPARQLJSONResult).results.bindings.forEach((jsonItem, i) => {
            let endpoint = jsonItem.endpointUrl.value;
            let blankNodeMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
            let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = Global.parseDate(jsonItem.date.value);

            graphSet.add(graph);
            blankNodeData.push({ graph: graph, date: date, endpoint: endpoint, measure: blankNodeMeasure })
        });
        return Promise.resolve(blankNodeData);
    })
        .then(blankNodeData => {
            try {
                let content = JSON.stringify(blankNodeData);
                return Global.writeFile(Global.getCachedFilenameForRunset(runset.id, blankNodesDataFilename), content).then(() => {
                    Logger.info("blankNodeDataFill END");
                    return Promise.resolve();
                })
            } catch (err) {
                Logger.error(err)
            }
            return Promise.reject();
        })
        .catch(error => {
            Logger.error(error)
        });
}