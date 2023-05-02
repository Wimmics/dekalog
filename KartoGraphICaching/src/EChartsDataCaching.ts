import * as echarts from "echarts";
import * as DataCache from "./DataCaching";
import { readFile, writeFile } from "fs/promises";
import { AverageRuntimeDataObject, ClassCountDataObject, DatasetDescriptionDataObject, EndpointTestDataObject, GeolocDataObject, GraphListDataObject, PropertyCountDataObject, QualityMeasureDataObject, ShortUriDataObject, SPARQLCoverageDataObject, SPARQLFeatureDataObject, SPARQLFeatureDescriptionDataObject, TotalRuntimeDataObject, TripleCountDataObject, VocabEndpointDataObject, VocabKeywordsDataObject } from "./DataTypes";
import * as Logger from "./LogUtils";
import * as ChartsUtils from "./ChartsUtils";

const numberOfVocabulariesLimit = 1000;

export const sparqlCoverageEchartsOptionFilename = DataCache.dataCachedFilePrefix + "sparqlCoverageEchartsOption.json";
export const sparql10CoverageEchartsOptionFilename = DataCache.dataCachedFilePrefix + "sparql10CoverageEchartsOption.json";
export const sparql11CoverageEchartsOptionFilename = DataCache.dataCachedFilePrefix + "sparql11CoverageEchartsOption.json";
export const vocabEndpointEchartsOptionFilename = DataCache.dataCachedFilePrefix + "vocabEndpointEchartsOption.json";
export const triplesEchartOptionFilename = DataCache.dataCachedFilePrefix + "triplesEchartOption.json";
export const classesEchartOptionFilename = DataCache.dataCachedFilePrefix + "classesEchartOption.json";
export const propertiesEchartOptionFilename = DataCache.dataCachedFilePrefix + "propertiesEchartOption.json";
export const shortUrisEchartOptionFilename = DataCache.dataCachedFilePrefix + "shortUrisEchartOption.json";
export const rdfDataStructuresEchartOptionFilename = DataCache.dataCachedFilePrefix + "rdfDataStructuresEchartOption.json";
export const readableLabelsEchartOptionFilename = DataCache.dataCachedFilePrefix + "readableLabelsEchartOption.json";
export const blankNodesEchartOptionFilename = DataCache.dataCachedFilePrefix + "blankNodesEchartOption.json";


let whiteListData: Map<string, Array<string>>;
let geolocData: Array<GeolocDataObject>;
let sparqlFeaturesData: Array<SPARQLFeatureDataObject>;
let knownVocabData: Array<string>;
let vocabEndpointData: Array<VocabEndpointDataObject>;
let vocabKeywordData: Array<VocabKeywordsDataObject>;
let classCountData: Array<ClassCountDataObject>;
let propertyCountData: Array<PropertyCountDataObject>;
let tripleCountData: Array<TripleCountDataObject>;
let shortUrisData: Array<ShortUriDataObject>;
let rdfDataStructureData: Array<QualityMeasureDataObject>;
let readableLabelData: Array<QualityMeasureDataObject>;
let blankNodesData: Array<QualityMeasureDataObject>;
let categoryTestCountData: any;
let totalCategoryTestCountData: any;
let endpointTestsData: Array<EndpointTestDataObject>;
let totalRuntimeData: Array<TotalRuntimeDataObject>;
let averageRuntimeData: Array<AverageRuntimeDataObject>;
let classPropertyData: any;
let datasetDescriptionData: Array<DatasetDescriptionDataObject>;
let graphLists: Array<GraphListDataObject>;
let sparqlFeatureDesc: Array<SPARQLFeatureDescriptionDataObject>;
// let textElements: Array<TextElement>;

export function sparqlCoverageEchartsOption(): Promise<void> {
    return readFile(DataCache.sparqlCoverageFilename, "utf8").then(sparqlCoverageCountRawData => {

        const sparqlCoverageCountData: Array<SPARQLCoverageDataObject> = JSON.parse(sparqlCoverageCountRawData);

        let maxSparql10 = 24;
        let maxSparql11 = 19;
        let maxSparqlTotal = maxSparql10 + maxSparql11;

        let chart10ValueMap = new Map();
        let chart11ValueMap = new Map();
        let chartSPARQLValueMap = new Map();

        for (let i = -1; i < 10; i++) {
            chart10ValueMap.set(i, 0);
            chart11ValueMap.set(i, 0);
            chartSPARQLValueMap.set(i, 0);
        }
        let sparql10Step = maxSparql10 / 10;
        let sparql11Step = maxSparql11 / 10;
        let sparqlTotalStep = maxSparqlTotal / 10;
        sparqlCoverageCountData.forEach((item) => {
            let itemBinSparql10 = -1;
            if (item.sparql10 > 0) {
                itemBinSparql10 = Math.floor(item.sparql10 / sparql10Step);
                if (itemBinSparql10 == 10) {
                    itemBinSparql10 = 9;
                }
            }
            chart10ValueMap.set(itemBinSparql10, chart10ValueMap.get(itemBinSparql10) + 1);
            let itemBinSparql11 = -1;
            if (item.sparql11 > 0) {
                itemBinSparql11 = Math.floor(item.sparql11 / sparql11Step);
                if (itemBinSparql11 == 10) {
                    itemBinSparql11 = 9;
                }
            }
            chart11ValueMap.set(itemBinSparql11, chart11ValueMap.get(itemBinSparql11) + 1);
            let itemBinSparqlTotal = -1;
            if (item.sparql11 > 0 || item.sparql10 > 0) {
                let itemBinSparqlTotal = Math.floor(item.sparqlTotal / sparqlTotalStep);
                if (itemBinSparqlTotal == 10) {
                    itemBinSparqlTotal = 9;
                }
            }
            chartSPARQLValueMap.set(itemBinSparqlTotal, chartSPARQLValueMap.get(itemBinSparqlTotal) + 1);
        });

        let chart10DataMap = new Map();
        let chart11DataMap = new Map();
        let chartSPARQLDataMap = new Map();
        let categorySet = new Set<string>();
        chart10ValueMap.forEach((binCount, itemBin, map) => {
            let categoryName = "[ " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
            if (itemBin == 0) {
                categoryName = "] " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
            }
            if (itemBin == -1) {
                categoryName = "[ 0% ]";
            }
            categorySet.add(categoryName);
            chart10DataMap.set(categoryName, binCount);
        });
        chart11ValueMap.forEach((binCount, itemBin, map) => {
            let categoryName = "[ " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
            if (itemBin == 0) {
                categoryName = "] " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
            }
            if (itemBin == -1) {
                categoryName = "[ 0% ]";
            }
            categorySet.add(categoryName);
            chart11DataMap.set(categoryName, binCount);
        });
        chartSPARQLValueMap.forEach((binCount, itemBin, map) => {
            let categoryName = "[ " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
            if (itemBin == 0) {
                categoryName = "] " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
            }
            if (itemBin == -1) {
                categoryName = "[ 0% ]";
            }
            categorySet.add(categoryName);
            chartSPARQLDataMap.set(categoryName, binCount);
        });
        // let categories = ([...categorySet]).sort((a, b) => a.localeCompare(b));

        let sparql10Series: any[] = [];
        chart10DataMap.forEach((percentage, category, map) => {
            sparql10Series.push({
                name: category,
                type: 'bar',
                data: [percentage],
                label: {
                    show: true,
                    formatter: "{a}",
                    verticalAlign: "bottom",
                    position: "top"
                }
            })
        });
        let sparql11Series: any[] = [];
        chart11DataMap.forEach((percentage, category, map) => {
            sparql11Series.push({
                name: category,
                type: 'bar',
                data: [percentage],
                label: {
                    show: true,
                    formatter: "{a}",
                    verticalAlign: "bottom",
                    position: "top"
                }
            })
        });
        let sparqlCategorySeries: any[] = [];
        chartSPARQLDataMap.forEach((percentage, category, map) => {
            sparqlCategorySeries.push({
                name: category,
                type: 'bar',
                data: [percentage],
                label: {
                    show: true,
                    formatter: "{a}",
                    verticalAlign: "bottom",
                    position: "top"
                }
            })
        });

        let sparql10ChartOption = {
            title: {
                left: 'center',
                text: "Number of endpoints according to\n their coverage of SPARQL 1.0 features",
                textStyle: {
                    overflow: 'breakAll',
                    width: "80%"
                }
            },
            legend: {
                show: false,
            },
            toolbox: {
                show: false
            },
            tooltip: {
                show: true
            },
            xAxis: {
                type: 'category',
                data: ["Endpoints supporting SPARQL 1.0 features"],
                show: false,
                splitLine: { show: false },
                splitArea: { show: false }
            },
            yAxis: {
                type: 'value',
                max: 'dataMax',
            },
            color: ["#060705ff", "#10200Eff", "#1A3917ff", "#245121ff", "#2E6A2Aff", "#388333ff", "#419C3Cff", "#4BB545ff", "#55CD4Fff", "#5FE658ff", "#69FF61ff"],
            series: sparql10Series,
        };
        let sparql11ChartOption = {
            title: {
                left: 'center',
                text: "Number of endpoints according to\n their coverage of SPARQL 1.1 features",
                textStyle: {
                    overflow: 'breakAll',
                    width: "80%"
                }
            },
            legend: {
                show: false,
            },
            toolbox: {
                show: false
            },
            tooltip: {
                show: true
            },
            xAxis: {
                type: 'category',
                data: ["Endpoints supporting SPARQL 1.1 features"],
                show: false,
                splitLine: { show: false },
                splitArea: { show: false }
            },
            yAxis: {
                type: 'value',
                max: 'dataMax',
            },
            color: ["#060705ff", "#10200Eff", "#1A3917ff", "#245121ff", "#2E6A2Aff", "#388333ff", "#419C3Cff", "#4BB545ff", "#55CD4Fff", "#5FE658ff", "#69FF61ff"],
            series: sparql11Series,
        };
        let sparqlChartOption = {
            title: {
                left: 'center',
                text: "Number of endpoints according to\n their coverage of all SPARQL features",
                textStyle: {
                    overflow: 'breakAll',
                    width: "80%"
                }
            },
            legend: {
                show: false,
            },
            toolbox: {
                show: false
            },
            tooltip: {
                show: true
            },
            xAxis: {
                type: 'category',
                data: ["Endpoints supporting SPARQL 1.0 and 1.1 features"],
                splitLine: { show: false },
                splitArea: { show: false },
                show: false
            },
            yAxis: {
                type: 'value',
                max: 'dataMax',
            },
            color: ["#060705ff", "#10200Eff", "#1A3917ff", "#245121ff", "#2E6A2Aff", "#388333ff", "#419C3Cff", "#4BB545ff", "#55CD4Fff", "#5FE658ff", "#69FF61ff"],
            series: sparqlCategorySeries,
        };

        return Promise.allSettled([
            writeFile(sparql10CoverageEchartsOptionFilename, JSON.stringify(sparql10ChartOption)).then(() => { Logger.info("SPARQL 1.0 chart data generated"); }),
            writeFile(sparql11CoverageEchartsOptionFilename, JSON.stringify(sparql11ChartOption)).then(() => { Logger.info("SPARQL 1.1 chart data generated"); }),
            writeFile(sparqlCoverageEchartsOptionFilename, JSON.stringify(sparqlChartOption)).then(() => { Logger.info("SPARQL chart data generated"); })
        ]).then(() => {
        });
    }).catch((error) => {
        Logger.error("Error during sparql cached data reading", error)
    });
}

export function vocabGraphEchartsOption(): Promise<void> {
    return readFile(DataCache.vocabEndpointFilename, "utf-8").then(vocabEndpointRawData => {

        vocabEndpointData = JSON.parse(vocabEndpointRawData);
        // Create an force graph with the graph linked by co-ocurrence of vocabularies

        let endpointSet = new Set();
        let vocabSet = new Set();
        let rawVocabSet = new Set<string>();
        let rawGatherVocab = new Map();
        vocabEndpointData.forEach((item, i) => {
            let endpoint = item.endpoint;
            let vocabularies = item.vocabularies;
            if (vocabularies.length < numberOfVocabulariesLimit) {
                endpointSet.add(endpoint);
                vocabularies.forEach(vocab => {
                    rawVocabSet.add(vocab);
                })
                if (!rawGatherVocab.has(endpoint)) {
                    rawGatherVocab.set(endpoint, new Set());
                }
                rawGatherVocab.set(endpoint, vocabularies);
            }
        });

        let jsonRawVocabNodes = new Set();
        let jsonRawVocabLinks = new Set();

        endpointSet.forEach(item => {
            jsonRawVocabNodes.add({ name: item, category: 'Endpoint', symbolSize: 5 });
        });
        rawVocabSet.forEach(item => {
            jsonRawVocabNodes.add({ name: item, category: 'Vocabulary', symbolSize: 5 })
        });
        rawGatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
            endpointVocabs.forEach((vocab, i) => {
                jsonRawVocabLinks.add({ source: endpointUrl, target: vocab })
            });
        });

        let gatherVocab = new Map();
        // Filtering according to ontology repositories
        rawVocabSet.forEach(vocabulariUri => {
            if (knownVocabData.includes(vocabulariUri)) {
                vocabSet.add(vocabulariUri);
            }
        });
        rawGatherVocab.forEach((vocabulariUriSet, endpointUri, map) => {
            vocabulariUriSet.forEach(vocabulariUri => {
                if (knownVocabData.includes(vocabulariUri)) {
                    if (!gatherVocab.has(endpointUri)) {
                        gatherVocab.set(endpointUri, new Set());
                    }
                    gatherVocab.get(endpointUri).add(vocabulariUri);
                }
            });
        });

        // Endpoint and vocabularies graph
        let jsonVocabLinks = new Set();
        let jsonVocabNodes = new Set();

        endpointSet.forEach(item => {
            jsonVocabNodes.add({ name: item, category: 'Endpoint', symbolSize: 5 });
        });
        vocabSet.forEach(item => {
            jsonVocabNodes.add({ name: item, category: 'Vocabulary', symbolSize: 5 })
        });

        gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
            endpointVocabs.forEach((vocab, i) => {
                jsonVocabLinks.add({ source: endpointUrl, target: vocab })
            });
        });
        if (jsonVocabNodes.size > 0 && jsonVocabLinks.size > 0) {
            let knowVocabsData = [];
            gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
                let measure = (endpointVocabs.size / rawGatherVocab.get(endpointUrl).length);
                knowVocabsData.push({ 'endpoint': endpointUrl, 'measure': measure })

                endpointVocabs.forEach((vocab, i) => {
                    jsonVocabLinks.add({ source: endpointUrl, target: vocab });
                });
            });

            return writeFile(vocabEndpointEchartsOptionFilename, JSON.stringify(ChartsUtils.getForceGraphOption('Endpoints and vocabularies with filtering*', ["Vocabulary", "Endpoint"], [...jsonVocabNodes], [...jsonVocabLinks])));
        } else {
            return Promise.reject("No data to generate the vocabulary graph");
        }
    }).catch((error) => {
        Logger.error("Error during vocab graph data reading", error)
    });
}

export function triplesEchartsOption(): Promise<void> {
    return readFile(DataCache.tripleCountFilename, "utf-8").then(tripleCountRawData => {
        tripleCountData = JSON.parse(tripleCountRawData);
        // Scatter plot of the number of triples through time
        let endpointDataSerieMap = new Map();
        tripleCountData.forEach((itemResult, i) => {
            let endpointUrl = itemResult.endpoint;
            endpointDataSerieMap.set(endpointUrl, []);
        });
        tripleCountData.forEach((itemResult, i) => {
            let date = itemResult.date;
            let endpointUrl = itemResult.endpoint;
            let triples = itemResult.triples;
            endpointDataSerieMap.get(endpointUrl).push([date, triples])
        });

        if (endpointDataSerieMap.size > 0) {
            let triplesSeries = ChartsUtils.getScatterDataSeriesFromMap(endpointDataSerieMap);
            return writeFile(triplesEchartOptionFilename, JSON.stringify(ChartsUtils.getTimeScatterOption("Size of the datasets", triplesSeries))).then(() => {
                Logger.info("Triple chart data generated");
            });

        } else {
            return Promise.reject("No data to generate the triple graph");
        }
    }).catch((error) => {
        Logger.error("Error during triple data reading", error)
    });

}

export function classesEchartsOption(): Promise<void> {
    return readFile(DataCache.classCountFilename, "utf-8").then(classesCountRawData => {
        classCountData = JSON.parse(classesCountRawData);
        // Scatter plot of the number of classes through time
        let endpointDataSerieMap = new Map();
        classCountData.forEach((itemResult, i) => {
            let endpointUrl = itemResult.endpoint;
            endpointDataSerieMap.set(endpointUrl, []);
        });
        classCountData.forEach((itemResult, i) => {
            let date = itemResult.date;
            let endpointUrl = itemResult.endpoint;
            let classes = itemResult.classes;
            endpointDataSerieMap.get(endpointUrl).push([date, classes])
        });

        if (endpointDataSerieMap.size > 0) {
            let classesSeries = ChartsUtils.getScatterDataSeriesFromMap(endpointDataSerieMap);
            return writeFile(classesEchartOptionFilename, JSON.stringify(ChartsUtils.getTimeScatterOption("Number of classes in the datasets", classesSeries))).then(() => {
                Logger.info("Class chart data generated");
            });

        } else {
            return Promise.reject("No data to generate the classes graph");
        }
    }).catch((error) => {
        Logger.error("Error during classes data reading", error)
    });

}

export function propertiesEchartsOption(): Promise<void> {
    return readFile(DataCache.propertyCountFilename, "utf-8").then(propertiesCountRawData => {
        propertyCountData = JSON.parse(propertiesCountRawData);
        // Scatter plot of the number of classes through time
        let endpointDataSerieMap = new Map();
        propertyCountData.forEach((itemResult, i) => {
            let endpointUrl = itemResult.endpoint;
            endpointDataSerieMap.set(endpointUrl, []);
        });
        propertyCountData.forEach((itemResult, i) => {
            let date = itemResult.date;
            let endpointUrl = itemResult.endpoint;
            let properties = itemResult.properties;
            endpointDataSerieMap.get(endpointUrl).push([date, properties])
        });

        if (endpointDataSerieMap.size > 0) {
            let propertiesSeries = ChartsUtils.getScatterDataSeriesFromMap(endpointDataSerieMap);
            return writeFile(propertiesEchartOptionFilename, JSON.stringify(ChartsUtils.getTimeScatterOption("Number of properties in the datasets", propertiesSeries))).then(() => {
                Logger.info("Property chart data generated");
            });

        } else {
            return Promise.reject("No data to generate the properties graph");
        }
    }).catch((error) => {
        Logger.error("Error during properties data reading", error)
    });
}

export function shortUrisEchartsOption(): Promise<void> {
    return readFile(DataCache.shortUriDataFilename, "utf-8").then(shortUrisCountRawData => {
        shortUrisData = JSON.parse(shortUrisCountRawData);
        // Scatter plot of the number of classes through time
        let endpointDataSerieMap = new Map();
        shortUrisData.forEach((itemResult, i) => {
            let endpointUrl = itemResult.endpoint;
            endpointDataSerieMap.set(endpointUrl, []);
        });
        shortUrisData.forEach((itemResult, i) => {
            let date = itemResult.date;
            let endpointUrl = itemResult.endpoint;
            let shortUris = itemResult.measure;
            endpointDataSerieMap.get(endpointUrl).push([date, shortUris])
        });

        if (endpointDataSerieMap.size > 0) {
            let shortUrisSeries = ChartsUtils.getScatterDataSeriesFromMap(endpointDataSerieMap);
            return writeFile(shortUrisEchartOptionFilename, JSON.stringify(ChartsUtils.getTimeScatterOption("Proportion of short URIs in the datasets", shortUrisSeries))).then(() => {
                Logger.info("Short URIs chart data generated");
            });

        } else {
            return Promise.reject("No data to generate the Short URIs graph");
        }
    }).catch((error) => {
        Logger.error("Error during Short URIs data reading", error)
    });
}

export function rdfDataStructuresEchartsOption(): Promise<void> {
    return readFile(DataCache.rdfDataStructureDataFilename, "utf-8").then(rdfDataStructuresCountRawData => {
        rdfDataStructureData = JSON.parse(rdfDataStructuresCountRawData);
        // Scatter plot of the number of classes through time
        let endpointDataSerieMap = new Map();
        rdfDataStructureData.forEach((itemResult, i) => {
            let endpointUrl = itemResult.endpoint;
            endpointDataSerieMap.set(endpointUrl, []);
        });
        rdfDataStructureData.forEach((itemResult, i) => {
            let date = itemResult.date;
            let endpointUrl = itemResult.endpoint;
            let rdfDatastructures = itemResult.measure;
            endpointDataSerieMap.get(endpointUrl).push([date, rdfDatastructures])
        });

        if (endpointDataSerieMap.size > 0) {
            let rdfDataStructuresSeries = ChartsUtils.getScatterDataSeriesFromMap(endpointDataSerieMap);
            return writeFile(shortUrisEchartOptionFilename, JSON.stringify(ChartsUtils.getTimeScatterOption("Proportion of RDF data structures in the datasets", rdfDataStructuresSeries))).then(() => {
                Logger.info("RDF data structures chart data generated");
            });

        } else {
            return Promise.reject("No data to generate the RDF data structures chart");
        }
    }).catch((error) => {
        Logger.error("Error during RDF data structures data reading", error)
    });
}

export function readableLabelsEchartsOption(): Promise<void> {
    return readFile(DataCache.rdfDataStructureDataFilename, "utf-8").then(readableLabelsCountRawData => {
        readableLabelData = JSON.parse(readableLabelsCountRawData);
        // Scatter plot of the number of classes through time
        let endpointDataSerieMap = new Map();
        readableLabelData.forEach((itemResult, i) => {
            let endpointUrl = itemResult.endpoint;
            endpointDataSerieMap.set(endpointUrl, []);
        });
        readableLabelData.forEach((itemResult, i) => {
            let date = itemResult.date;
            let endpointUrl = itemResult.endpoint;
            let readableLabels = itemResult.measure;
            endpointDataSerieMap.get(endpointUrl).push([date, readableLabels])
        });

        if (endpointDataSerieMap.size > 0) {
            let readableLabelsSeries = ChartsUtils.getScatterDataSeriesFromMap(endpointDataSerieMap);
            return writeFile(shortUrisEchartOptionFilename, JSON.stringify(ChartsUtils.getTimeScatterOption("Proportion of resources with readable labels in the datasets", readableLabelsSeries))).then(() => {
                Logger.info("Readable labels chart data generated");
            });

        } else {
            return Promise.reject("No data to generate the readable labels chart");
        }
    }).catch((error) => {
        Logger.error("Error during RDF data structures data reading", error)
    });
}

export function blankNodesEchartsOption(): Promise<void> {
    return readFile(DataCache.blankNodesDataFilename, "utf-8").then(blankNodesCountRawData => {
        blankNodesData = JSON.parse(blankNodesCountRawData);
        // Scatter plot of the number of classes through time
        let endpointDataSerieMap = new Map();
        blankNodesData.forEach((itemResult, i) => {
            let endpointUrl = itemResult.endpoint;
            endpointDataSerieMap.set(endpointUrl, []);
        });
        blankNodesData.forEach((itemResult, i) => {
            let date = itemResult.date;
            let endpointUrl = itemResult.endpoint;
            let blankNodes = itemResult.measure;
            endpointDataSerieMap.get(endpointUrl).push([date, blankNodes])
        });

        if (endpointDataSerieMap.size > 0) {
            let blankNodesSeries = ChartsUtils.getScatterDataSeriesFromMap(endpointDataSerieMap);
            return writeFile(shortUrisEchartOptionFilename, JSON.stringify(ChartsUtils.getTimeScatterOption("Proportion of blank nodes in the datasets", blankNodesSeries))).then(() => {
                Logger.info("Blank nodes chart data generated");
            });

        } else {
            return Promise.reject("No data to generate the blank nodes chart");
        }
    }).catch((error) => {
        Logger.error("Error during blank nodes data reading", error)
    });
}