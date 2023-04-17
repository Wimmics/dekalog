import * as echarts from "echarts";
import * as dataChache from "./DataCaching";
import { readFile, writeFile } from "fs/promises";
import { AverageRuntimeDataObject, ClassCountDataObject, DatasetDescriptionDataObject, EndpointTestDataObject, GeolocDataObject, GraphListDataObject, PropertyCountDataObject, QualityMeasureDataObject, ShortUriDataObject, SPARQLCoverageDataObject, SPARQLFeatureDataObject, SPARQLFeatureDescriptionDataObject, TotalRuntimeDataObject, TripleCountDataObject, VocabEndpointDataObject, VocabKeywordsDataObject } from "./DataTypes";
import * as Logger from "./LogUtils";

export const sparqlCoverageEchartsOptionFilename = dataChache.dataCachedFilePrefix + "sparqlCoverageEchartsOption.json";
export const sparql10CoverageEchartsOptionFilename = dataChache.dataCachedFilePrefix + "sparql10CoverageEchartsOption.json";
export const sparql11CoverageEchartsOptionFilename = dataChache.dataCachedFilePrefix + "sparql11CoverageEchartsOption.json";


let whiteListData: Map<string, Array<string>>;
let geolocData: Array<GeolocDataObject>;
let sparqlFeaturesData: Array<SPARQLFeatureDataObject>;
let knownVocabData: Array<string>;
let vocabEndpointData: Array<VocabEndpointDataObject>;
let vocabKeywordData: Array<VocabKeywordsDataObject>;
let classCountData: Array<ClassCountDataObject>;
let propertyCountData: Array<PropertyCountDataObject>;
let tripleCountData: Array<TripleCountDataObject>;
let categoryTestCountData: any;
let totalCategoryTestCountData: any;
let endpointTestsData: Array<EndpointTestDataObject>;
let totalRuntimeData: Array<TotalRuntimeDataObject>;
let averageRuntimeData: Array<AverageRuntimeDataObject>;
let classPropertyData: any;
let datasetDescriptionData: Array<DatasetDescriptionDataObject>;
let shortUriData: Array<ShortUriDataObject>;
let rdfDataStructureData: Array<QualityMeasureDataObject>;
let readableLabelData: Array<QualityMeasureDataObject>;
let blankNodesData: Array<QualityMeasureDataObject>;
let graphLists: Array<GraphListDataObject>;
let sparqlFeatureDesc: Array<SPARQLFeatureDescriptionDataObject>;
// let textElements: Array<TextElement>;

export function sparqlCoverageEchartsOption(): Promise<void> {
    return readFile(dataChache.sparqlCoverageFilename, "utf8").then(sparqlCoverageCountRawData => {

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

        let sparql10Series: echarts.EChartsOption.SeriesBar[] = [];
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
        let sparql11Series: echarts.EChartOption.SeriesBar[] = [];
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
        let sparqlCategorySeries: echarts.EChartOption.SeriesBar[] = [];
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
            writeFile(sparql10CoverageEchartsOptionFilename, JSON.stringify(sparql10ChartOption)).then(() => { Logger.log("SPARQL 1.0 chart data generated"); }),
            writeFile(sparql11CoverageEchartsOptionFilename, JSON.stringify(sparql11ChartOption)).then(() => { Logger.log("SPARQL 1.1 chart data generated"); }),
            writeFile(sparqlCoverageEchartsOptionFilename, JSON.stringify(sparqlChartOption)).then(() => { Logger.log("SPARQL chart data generated"); })
        ]).then(() => {
        });
    }).catch((error) => {
        Logger.error("Error during sparql cached data reading", error)
    });
}