import dayjs from "dayjs";
import L from "leaflet";
import 'leaflet/dist/leaflet.css'
import 'leaflet-providers';
import $ from 'jquery';
import * as echarts from "echarts";
import { greenIcon, orangeIcon } from "./leaflet-color-markers";
import { KartoChart, KartoMapChart } from "./ViewClasses";
import { collapseHtml, unCollapseHtml, getMainContentColWidth } from "./ViewUtils";
import { Control } from "./Control";
import { precise } from "./Utils";
import { getCircularGraphOption, getForceGraphOption, } from "./ChartsUtils";
import * as gridjs from "gridjs";
import "gridjs/dist/theme/mermaid.css";

export const sparqlCoverageEchartsOptionFilename = "sparqlCoverageEchartsOption";
export const sparql10CoverageEchartsOptionFilename = "sparql10CoverageEchartsOption";
export const sparql11CoverageEchartsOptionFilename = "sparql11CoverageEchartsOption";
export const vocabEndpointEchartsOptionFilename = "vocabEndpointEchartsOption";
export const triplesEchartsOptionFilename = "triplesEchartOption";
export const classesEchartsOptionFilename = "classesEchartOption";
export const propertiesEchartsOptionFilename = "propertiesEchartOption";
export const shortUrisEchartsOptionFilename = "shortUrisEchartOption";
export const rdfDataStructuresEchartsOptionFilename = "rdfDataStructuresEchartOption";
export const readableLabelsEchartsOptionFilename = "readableLabelsEchartOption";
export const blankNodesEchartsOptionFilename = "blankNodesEchartOption";
export const datasetDescriptionEchartsOptionFilename = "datasetDescriptionEchartOption";
export const totalRuntimeEchartsOptionFilename = "totalRuntimeEchartsOption";
export const keywordEndpointEchartsOptionFilename = "keywordEndpointEchartsOption";
export const standardVocabulariesEndpointGraphEchartsOptionFilename = "standardVocabulariesEndpointGraphEchartsOption";

const numberOfVocabulariesLimit = 100;

export let geolocChart = new KartoMapChart({
    chartObject: L.map('map').setView([39.36827914916014, 12.117919921875002], 2).addLayer(L.tileLayer('https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=915b5d333bmshb215b63b0519269p1a2e4ejsn5cfd1822e416', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    })),
    fillFunction: function () {
        if (!this.filled) {

            console.info("Filling geoloc chart...")

            this.chartObject.invalidateSize();
            $('#map').width(getMainContentColWidth());

            let graphEndpointGeolocData = Control.getInstance().geolocData();
            console.log("graphEndpointGeolocData", graphEndpointGeolocData)

            function endpointGeolocTableFill() {
                let endpointGeolocTable = $('#endpointGeolocTable');
                endpointGeolocTable.empty();
                let gridJSColumns = [
                    { name: 'Endpoint', sort: 'asc' },
                    'Latitude',
                    'Longitude',
                    'Country',
                    'Region',
                    'City',
                    'Organization'
                ];
                let gridJSData = graphEndpointGeolocData.map(item => {
                    return [item.endpoint, item.lat, item.lon, item.country, item.region, item.city, item.org];
                });
                let gridJS = new gridjs.Grid({
                    columns: gridJSColumns,
                    data: gridJSData,
                    sort: true,
                    search: true,
                    pagination: {
                        limit: 10,
                        summary: false
                    }
                });
                gridJS.render(endpointGeolocTable[0]);
            }

            graphEndpointGeolocData.forEach(endpointGeoloc => {
                let markerIcon = greenIcon;
                if (endpointGeoloc.timezone != undefined
                    && endpointGeoloc.sparqlTimezone != undefined
                    && endpointGeoloc.timezone.localeCompare(endpointGeoloc.sparqlTimezone) != 0) {
                    markerIcon = orangeIcon;
                }

                let endpointMarker = L.marker([endpointGeoloc.lat, endpointGeoloc.lon], { icon: markerIcon });
                endpointMarker.on('click', clickEvent => {
                    endpointMarker.bindPopup(endpointGeoloc.popupHTML).openPopup();
                });
                endpointMarker.addTo(this.chartObject);
                this.markerArray.push(endpointMarker);
            });
            endpointGeolocTableFill();
            this.redraw();
            this.filled = true;
        }
        return Promise.resolve();
    },
    redrawFunction: function () {
        this.chartObject.invalidateSize();
        $('#map').width(getMainContentColWidth());
        this.chartObject.setView([39.36827914916014, 12.117919921875002], 2);
    },
    clearFunction: function () {
        this.markerArray.forEach(marker => {
            marker.removeFrom(this.chartObject);
        });
        this.markerArray = [];
        this.filled = false;
    },
    hideFunction: function () {
    },
    showFunction: function () {
    },
});

export let sparqlFeaturesContent = new KartoChart({
    fillFunction: () => {
        let featuresDescriptionMap = new Map();
        let featuresQueryMap = new Map();
        try {
            Control.getInstance().sparqlFeatureDesc.forEach(featureDesc => {
                featuresDescriptionMap.set(featureDesc.feature, featureDesc.description);
                featuresQueryMap.set(featureDesc.feature, featureDesc.query);
            });

            let sparqlFeaturesDataArray = Control.getInstance().sparqlFeaturesData();

            sparqlFeaturesDataArray.sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            });
            function fillFeaturesTable() {
                let tableHTML = $('#SPARQLFeaturesTable');
                tableHTML.empty();
                let grisJSData = sparqlFeaturesDataArray.map((item, i) => {
                    return [item.endpoint, item.features.map(feature => {
                        return `<span title="${featuresDescriptionMap.get(feature)}">${feature}</span>` ;
                    }).join(", ")];
                });
                let gridJSColumns = [
                    { name: 'Endpoint', sort: 'asc' },
                    { 
                        name: 'Features',
                        formatter: (cell) => gridjs.html(`${cell}`)
                    }
                ];
                let gridJS = new gridjs.Grid({
                    columns: gridJSColumns,
                    data: grisJSData,
                    sort: true,
                    search: true,
                    pagination: {
                        limit: 10,
                        summary: false
                    },
                });
                gridJS.render(document.getElementById('SPARQLFeaturesTable'));

            }

            fillFeaturesTable()
            sparqlFeaturesContent.filled = true;
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    }
});

export let sparql10Chart = new KartoChart({
    chartObject: echarts.init(document.getElementById('SPARQL10histo')),
    fillFunction: function () {
        try {
            let option = Control.getInstance().retrieveFileFromVault(sparql10CoverageEchartsOptionFilename);
            this.chartObject.setOption(option);
            this.option = option;
            return Promise.resolve();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    },
    redrawFunction: function () {
        $('#SPARQL10histo').width(getMainContentColWidth() * .48);
        $('#SPARQL10histo').height(500);

        $(this.chartObject.getDom()).removeClass('placeholder');
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $(this.chartObject.getDom()).addClass('placeholder');
    }
});

export let sparql11Chart = new KartoChart({
    chartObject: echarts.init(document.getElementById('SPARQL11histo')),
    fillFunction: function () {
        try {
            let option = Control.getInstance().retrieveFileFromVault(sparql11CoverageEchartsOptionFilename);
            this.chartObject.setOption(option);
            this.option = option;

            this.redraw();
            return Promise.resolve();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    },
    redrawFunction: function () {
        $('#SPARQL11histo').width(getMainContentColWidth() * .48);
        $('#SPARQL11histo').height(500);

        $(this.chartObject.getDom()).removeClass('placeholder');
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $(this.chartObject.getDom()).addClass('placeholder');
    }
});

export let sparqlCoverCharts = new KartoChart({
    chartObject: echarts.init(document.getElementById('SPARQLCoverageHisto')),
    fillFunction: function () {
        try {
            let option = Control.getInstance().retrieveFileFromVault(sparqlCoverageEchartsOptionFilename);
            this.option = option;
            this.chartObject.setOption(option);

            let maxSparql10 = 24;
            let maxSparql11 = 19;

            this.redraw();

            function fillTestTable() {
                let tableHTML = $('#SPARQLFeaturesCountTable');
                tableHTML.empty();
                let gridJSData = Control.getInstance().sparqlCoverCountData().sort((a, b) => {
                    return a.endpoint.localeCompare(b.endpoint);
                }).map((item, i) => {
                    return [item.endpoint, precise((item.sparql10 / maxSparql10) * 100, 3) + "%", precise((item.sparql11 / maxSparql11) * 100, 3) + "%"];
                });
                let gridJSColumns = [
                    { name: 'Endpoint', sort: 'asc' },
                    {
                        name: 'SPARQL 1.0',
                        attributes: (cell) => {
                            // add these attributes to the td elements only
                            if (cell) {
                                return {
                                    'data-cell-content': cell,
                                    'onclick': () => console.log(cell),
                                    'style': 'cursor: pointer',
                                };
                            }
                        }
                    },
                    'SPARQL 1.1'
                ];
                let gridJS = new gridjs.Grid({
                    columns: gridJSColumns,
                    data: gridJSData,
                    sort: true,
                    search: true,
                    pagination: {
                        limit: 10,
                        summary: false
                    },
                });
                gridJS.render(document.getElementById('SPARQLFeaturesCountTable'));
            }

            fillTestTable();
            return Promise.resolve()
                .then(() => { this.filled = true; });
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    },
    redrawFunction: function () {
        $('#SPARQLCoverageHisto').width(getMainContentColWidth());
        $(this.chartObject.getDom()).removeClass('placeholder');
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $(this.chartObject.getDom()).addClass('placeholder');
    }
});

// export let filteredVocabChart = new KartoChart({
//     chartObject: echarts.init(document.getElementById('vocabs')),
//     option: {},
//     sparqlesVocabulariesQuery: '',
//     fillFunction: function () {
//         try {
//             return new Promise<void>((resolve, reject) => {
//                 if (!this.filled) {
//                     this.sparqlesVocabulariesQuery = "SELECT DISTINCT ?endpointUrl ?vocabulary { GRAPH ?g { " +
//                         "{ ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
//                         "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
//                         "?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?dataset . " +
//                         "?dataset <http://rdfs.org/ns/void#vocabulary> ?vocabulary " +
//                         "} " +
//                         " } " +
//                         "GROUP BY ?endpointUrl ?vocabulary ";

//                     // Create an force graph with the graph linked by co-ocurrence of vocabularies

//                     let endpointSet = new Set();
//                     let vocabSet = new Set();
//                     let rawVocabSet = new Set<string>();
//                     let rawGatherVocab = new Map();
//                     Control.getInstance().vocabEndpointData().forEach((item, i) => {
//                         let endpoint = item.endpoint;
//                         let vocabularies = item.vocabularies;
//                         if ( vocabularies != undefined && vocabularies.length < numberOfVocabulariesLimit) {
//                             endpointSet.add(endpoint);
//                             vocabularies.forEach(vocab => {
//                                 rawVocabSet.add(vocab);
//                             })
//                             if (!rawGatherVocab.has(endpoint)) {
//                                 rawGatherVocab.set(endpoint, new Set());
//                             }
//                             rawGatherVocab.set(endpoint, vocabularies);
//                         }
//                     });

//                     let jsonRawVocabNodes = new Set();
//                     let jsonRawVocabLinks = new Set();

//                     endpointSet.forEach(item => {
//                         jsonRawVocabNodes.add({ name: item, category: 'Endpoint', symbolSize: 5 });
//                     });
//                     rawVocabSet.forEach(item => {
//                         jsonRawVocabNodes.add({ name: item, category: 'Vocabulary', symbolSize: 5 })
//                     });
//                     rawGatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
//                         endpointVocabs.forEach((vocab, i) => {
//                             jsonRawVocabLinks.add({ source: endpointUrl, target: vocab })
//                         });
//                     });

//                     let gatherVocab = new Map();
//                     // Filtering according to ontology repositories
//                     rawVocabSet.forEach(vocabulariUri => {
//                         if (Control.getInstance().knownVocabData().includes(vocabulariUri)) {
//                             vocabSet.add(vocabulariUri);
//                         }
//                     });
//                     rawGatherVocab.forEach((vocabulariUriSet, endpointUri, map) => {
//                         vocabulariUriSet.forEach(vocabulariUri => {
//                             if (Control.getInstance().knownVocabData().includes(vocabulariUri)) {
//                                 if (!gatherVocab.has(endpointUri)) {
//                                     gatherVocab.set(endpointUri, new Set());
//                                 }
//                                 gatherVocab.get(endpointUri).add(vocabulariUri);
//                             }
//                         });
//                     });

//                     // Endpoint and vocabularies graph
//                     let jsonVocabLinks = new Set();
//                     let jsonVocabNodes = new Set();

//                     endpointSet.forEach(item => {
//                         jsonVocabNodes.add({ name: item, category: 'Endpoint', symbolSize: 5 });
//                     });
//                     vocabSet.forEach(item => {
//                         jsonVocabNodes.add({ name: item, category: 'Vocabulary', symbolSize: 5 })
//                     });

//                     gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
//                         endpointVocabs.forEach((vocab, i) => {
//                             jsonVocabLinks.add({ source: endpointUrl, target: vocab })
//                         });
//                     });
//                     if (jsonVocabNodes.size > 0 && jsonVocabLinks.size > 0) {
//                         this.show();

//                         let sumknowVocabMeasure = 0;
//                         let knowVocabsData: { endpoint: string, measure: number }[] = [];
//                         gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
//                             let measure = (endpointVocabs.size / rawGatherVocab.get(endpointUrl).length);
//                             knowVocabsData.push({ endpoint: endpointUrl, measure: measure })

//                             endpointVocabs.forEach((vocab, i) => {
//                                 jsonVocabLinks.add({ source: endpointUrl, target: vocab });
//                             });
//                         });


//                         this.option = getForceGraphOption('Endpoints and vocabularies with filtering*', ["Vocabulary", "Endpoint"], [...jsonVocabNodes], [...jsonVocabLinks]);
//                         this.chartObject.setOption(this.option, true);

//                         // Measure Table
//                         function endpointKnowVocabsMeasureFill() {
//                             let endpointKnownVocabulariestable = $('#endpointKnownVocabsTable');
//                             endpointKnownVocabulariestable.empty();
//                             sumknowVocabMeasure = 0;

//                             let gridJSData = knowVocabsData.map((item, i) => {
//                                 let endpointUrl = item.endpoint;
//                                 let measure = item.measure;
//                                 sumknowVocabMeasure += measure;
//                                 return [endpointUrl, precise(measure * 100, 3) + "%"];
//                             });
//                             let gridJSColumns = [
//                                 { title: "Endpoint", type: "text" },
//                                 { title: "Measure", type: "number" }
//                             ];
//                             let gridJSTable = new gridjs.Grid({
//                                 columns: gridJSColumns,
//                                 data: gridJSData,
//                                 sort: true,
//                                 search: true,
//                                 pagination: {
//                                     limit: 10,
//                                     summary: true
//                                 },
//                             })
//                             gridJSTable.render(document.getElementById("knowVocabEndpointTable"));
//                         };
//                         endpointKnowVocabsMeasureFill();

//                         // computation of the know vocabularies measure
//                         let knownVocabulariesMeasureHtml = $('#KnownVocabulariesMeasure');
//                         knownVocabulariesMeasureHtml.text(precise((sumknowVocabMeasure / endpointSet.size) * 100, 3) + "%");
//                     } else {
//                         this.hide();
//                     }
//                     this.chartObject.on('click', 'series', event => {
//                         if (event.dataType.localeCompare("node") == 0) {
//                             let uriLink = event.data.name;
//                             window.open(uriLink, '_blank');
//                         }
//                     })
//                 }
//                 resolve();

//             }).then(() => { this.filled = true; });
//         } catch (e) {
//             console.error(e);
//             return Promise.reject(e);
//         }
//     },
//     hideFunction: function () {
//         this.chartObject.setOption({ series: [] }, true);
//         collapseHtml('vocabs');
//         collapseHtml('knowVocabEndpointMeasureRow');
//         collapseHtml('knowVocabEndpointTable');
//     },
//     showFunction: function () {
//         unCollapseHtml('knowVocabEndpointMeasureRow');
//         unCollapseHtml('knowVocabEndpointTable');
//         unCollapseHtml('vocabs');

//         this.redraw()
//     },
//     redrawFunction: function () {
//         $('#vocabs').width(getMainContentColWidth());
//         this.chartObject.setOption(this.option, true);
//         this.chartObject.resize();

//         let codeQuery1Div = $(document.createElement('code')).text(this.sparqlesVocabulariesQuery);
//         $('#endpointVocabularyQueryCell').empty()
//         $('#endpointVocabularyQueryCell').append(codeQuery1Div)
//     },
//     clearFunction: function () {
//         this.chartObject.setOption({ series: [] }, true);
//         $('#endpointVocabularyQueryCell').empty()
//     }
// })

export let endpointVocabsChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('vocabs')),
    option: {},
    fillFunction: function () {
        try {
            return new Promise<void>((resolve, reject) => {
                if (!this.filled) {
                    this.show();

                    this.option = Control.getInstance().retrieveFileFromVault(vocabEndpointEchartsOptionFilename);
                    this.chartObject.setOption(this.option, true);
                    this.chartObject.on('click', 'series', event => {
                        if (event.dataType.localeCompare("node") == 0) {
                            let uriLink = event.data.name;
                            window.open(uriLink, '_blank').focus();
                        }
                    })
                }
                resolve();
            }).then(() => { this.filled = true; });
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('vocabs');
    },
    showFunction: function () {
        this.redraw();
        unCollapseHtml('vocabs');
    },
    redrawFunction: function () {
        $('#vocabs').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
    }
});

export let vocabKeywordChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('endpointKeywords')),
    option: {},
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('endpointKeywords');
        collapseHtml('endpointKeywordsDetails');
        $('#endpointKeywordsTableBody').empty();
    },
    showFunction: function () {
        this.redraw();
        unCollapseHtml('endpointKeywords');
        unCollapseHtml('endpointKeywordsDetails');
    },
    fillFunction: function () {
        try {
            return new Promise<void>((resolve, reject) => {
                if (!this.filled) {
                    this.show();

                    this.option = Control.getInstance().retrieveFileFromVault(keywordEndpointEchartsOptionFilename);
                    this.chartObject.setOption(this.option, true);
                    this.chartObject.on('click', 'series', event => {
                        if (event.dataType.localeCompare("node") == 0) {
                            let uriLink = event.data.name;
                            window.open(uriLink, '_blank').focus();
                        }
                    })
                }
                resolve();
            }).then(() => { this.filled = true; });
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    },
    redrawFunction: function () {
        $('#endpointKeywords').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
        let codeQuery2Div = $(document.createElement('code')).text(`SELECT DISTINCT ?endpointUrl ?vocabulary { 
            SERVICE <http://prod-dekalog.inria.fr/sparql> { 
                GRAPH ?g { 
                    { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } 
                    UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } 
                    ?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?endpoint . 
                    ?base <http://rdfs.org/ns/void#vocabulary> ?vocabulary . 
                    FILTER(isIri(?vocabulary)) 
                } 
            } 
            SERVICE <https://lov.linkeddata.es/dataset/lov/sparql> { 
                GRAPH <https://lov.linkeddata.es/dataset/lov> { 
                    ?vocabURI a <http://purl.org/vocommons/voaf#Vocabulary> . } 
                } 
            } 
            GROUP BY ?endpointUrl ?vocabulary`);
        $('#endpointKeywordQueryCell').empty();
        $('#endpointKeywordQueryCell').append(codeQuery2Div);
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#endpointKeywordQueryCell').empty();
    }
});

export let tripleChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('tripleScatter')),
    option: {},
    fillFunction: function () {
        try {
            let option = Control.getInstance().retrieveFileFromVault(triplesEchartsOptionFilename);
            this.option = option;

            this.filled = true;

            this.redraw();
            return Promise.resolve();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('tripleScatter');
        //collapseHtml('triplesContentCol');
    },
    showFunction: function () {
        unCollapseHtml('tripleScatter');
        //unCollapseHtml('triplesContentCol');
    },
    redrawFunction: function () {
        $('#tripleScatter').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

export let classNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('classScatter')),
    option: {},
    fillFunction: function () {
        try {
            let option = Control.getInstance().retrieveFileFromVault(classesEchartsOptionFilename);
            this.option = option;
            this.filled = true;
            this.redraw();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('classScatter');
    },
    showFunction: function () {
        unCollapseHtml('classScatter');
    },
    redrawFunction: function () {
        $('#classScatter').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

export let propertyNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('propertyScatter')),
    option: {},
    fillFunction: function () {
        try {
            let option = Control.getInstance().retrieveFileFromVault(propertiesEchartsOptionFilename);
            this.option = option;
            this.filled = true;
            this.redraw();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('propertyScatter');
    },
    showFunction: function () {
        unCollapseHtml('propertyScatter');
    },
    redrawFunction: function () {
        $('#propertyScatter').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

export let classAndPropertiesContent = new KartoChart({
    fillFunction: () => {
        try {
            if (classAndPropertiesContent !== undefined) {
                if (!classAndPropertiesContent.filled) {
                    let classPropertyDataTmp = Control.getInstance().classPropertyData().filter(classPropertyItem => [...knownVocabData].find(item => classPropertyItem.class.startsWith(item)))

                    classPropertyDataTmp.sort((a, b) => a.class.localeCompare(b.class));

                    function fillclassDescriptionTable() {
                        let tableHTML = $("#classDescriptionTable");
                        tableHTML.empty();

                        let gridJSData = classPropertyDataTmp.map((countsItem, i) => {
                            let classDescription = countsItem.class;
                            let classTriples = countsItem.triples;
                            let classClasses = countsItem.classes;
                            let classProperties = countsItem.properties;
                            let classDistinctSubjects = countsItem.distinctSubjects;
                            let classDistinctObjects = countsItem.distinctObjects;
                            let endpoints = countsItem.endpoints;

                            return {
                                classDescription: classDescription,
                                classTriples: classTriples,
                                classClasses: classClasses,
                                classProperties: classProperties,
                                classDistinctSubjects: classDistinctSubjects,
                                classDistinctObjects: classDistinctObjects,
                                endpoints: endpoints
                            }
                        });
                        let gridJSColumns = [
                            { field: "classDescription", title: "Class" },
                            { field: "classTriples", title: "Triples" },
                            { field: "classClasses", title: "Classes" },
                            { field: "classProperties", title: "Properties" },
                            { field: "classDistinctSubjects", title: "Distinct Subjects" },
                            { field: "classDistinctObjects", title: "Distinct Objects" },
                            { field: "endpoints", title: "Endpoints" }
                        ];
                        let gridJSTable = new gridjs.Grid({
                            columns: gridJSColumns,
                            data: gridJSData,
                            sort: true,
                            search: true,
                            pagination: {
                                limit: 10,
                                summary: false
                            }
                        });
                        gridJSTable.render(document.getElementById("classDescriptionTable"));
                    }
                    fillclassDescriptionTable()
                    classAndPropertiesContent.filled = true;
                }
            }
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    }
});

export let descriptionElementChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('datasetdescriptionRadar')),
    option: {},
    fillFunction: function () {
        try {
            if (!this.filled) {
                let datasetDescriptionDataTmp = Control.getInstance().datasetDescriptionData();
                datasetDescriptionDataTmp.sort((a, b) => {
                    return a.endpoint.localeCompare(b.endpoint);
                });

                // Table
                let tableHTML = $('#datasetDescriptionTable');
                tableHTML.empty();
                let gridJSData = datasetDescriptionDataTmp.map(item => {
                    return {
                        endpoint: item.endpoint,
                        who: item.who,
                        license: item.license,
                        time: item.time,
                        source: item.source
                    }
                });
                let gridJSColumns = [
                    { id: "endpoint", name: "Endpoint", field: "endpoint", sortable: true },
                    { id: "who", name: "Who", field: "who", sortable: true },
                    { id: "license", name: "License", field: "license", sortable: true },
                    { id: "time", name: "Time", field: "time", sortable: true },
                    { id: "source", name: "Source", field: "source", sortable: true }
                ];
                let gridJSTable = new gridjs.Grid({
                    columns: gridJSColumns,
                    data: gridJSData,
                    sort: true,
                    search: true,
                    pagination: {
                        limit: 10,
                        summary: false
                    }
                });
                gridJSTable.render(document.getElementById("datasetDescriptionTable"));

                // chart
                let option = Control.getInstance().retrieveFileFromVault(datasetDescriptionEchartsOptionFilename);
                this.option = option;
                this.redraw();
            }
            this.filled = true;
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    },
    redrawFunction: function () {
        $('#datasetdescriptionRadar').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#datasetDescriptionTableBody').empty();
    }
});

export let shortUriChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('shortUrisScatter')),
    option: {},
    fillFunction: function () {
        try {
            if (!this.filled) {
                let shortUrisMeasureQuery = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
                    "GRAPH ?g {" +
                    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
                    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
                    "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
                    "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/shortUris.ttl> . " +
                    "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
                    "}" +
                    " } GROUP BY ?g ?endpointUrl ?measure ";
                this.shortUrisMeasureQuery = shortUrisMeasureQuery;
                $('#shortUrisQueryCell').empty();
                $('#shortUrisQueryCell').append($(document.createElement('code')).text(shortUrisMeasureQuery))


                this.option = Control.getInstance().retrieveFileFromVault(shortUrisEchartsOptionFilename);
                this.redraw();

                // Average measure
                let shortUriMeasureSum = Control.getInstance().shortUriData().map(a => a.measure).reduce((previous, current) => current + previous);
                let shortUrisAverageMeasure = shortUriMeasureSum / Control.getInstance().shortUriData().length;
                console.log("shortUrisAverageMeasure", shortUrisAverageMeasure)
                $('#shortUrisMeasure').text(precise(shortUrisAverageMeasure) + "%");

                // Measure Details
                function fillShortUriTable() {
                    let tableHTML = $('#shortUrisTable');
                    tableHTML.empty();

                    let endpointDataSerieMap = new Map();
                    Control.getInstance().shortUriData().forEach((shortUriItem, i) => {
                        if (endpointDataSerieMap.get(shortUriItem.endpoint) == undefined) {
                            endpointDataSerieMap.set(shortUriItem.endpoint, []);
                        }
                        endpointDataSerieMap.get(shortUriItem.endpoint).push([shortUriItem.date, precise(shortUriItem.measure)]);
                    });

                    let gridJSData: { endpoint: string, measure: number }[] = [];
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        let measureAverage = endpointMeasureSum / serieData.length;
                        let measureAverageRounded = Number.parseFloat(precise(measureAverage, 3));
                        gridJSData.push({ endpoint: endpoint, measure: measureAverageRounded });
                    });
                    let gridJSColumns = [
                        { id: "endpoint", name: "Endpoint", field: "endpoint", sortable: true },
                        { id: "measure", name: "Measure", field: "measure", sortable: true, formatter: (cell, row) => {
                                return cell + "%";
                            }
                         }
                    ];
                    let gridJSTable = new gridjs.Grid({
                        columns: gridJSColumns,
                        data: gridJSData,
                        sort: true,
                        search: true,
                        pagination: {
                            limit: 10,
                            summary: false
                        }
                    });
                    gridJSTable.render(document.getElementById("shortUrisTable"));
                }
                fillShortUriTable();
            } else {
                this.hide();
            }
            this.filled = true;
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    },
    redrawFunction: function () {
        $('#shortUrisQueryCell').empty();
        $('#shortUrisQueryCell').append($(document.createElement('code')).text(this.shortUrisMeasureQuery));
        $('#shortUrisScatter').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
    , clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#shortUrisMeasure').empty();
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#shortUrisMeasure').empty();
        collapseHtml('shortUrisScatter');
        collapseHtml('shortUriMeasureRow');
    },
    showFunction: function () {
        unCollapseHtml('shortUrisScatter');
        unCollapseHtml('shortUriMeasureRow');
    }
});

export let rdfDataStructureChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('rdfDataStructuresScatter')),
    option: {},
    fillFunction: function () {
            if (!this.filled) {
                this.query = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
                    "GRAPH ?g {" +
                    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
                    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
                    "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
                    "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/RDFDataStructures.ttl> . " +
                    "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
                    "}" +
                    " } GROUP BY ?g ?endpointUrl ?measure ";
                $('#rdfDataStructuresQueryCell').empty();
                $('#rdfDataStructuresQueryCell').append($(document.createElement('code')).text(this.query));

                let rdfDataStructureDataTmp = Control.getInstance().rdfDataStructureData();
                let endpointDataSerieMap = new Map();
                rdfDataStructureDataTmp.forEach((rdfDataStructureItem, i) => {
                    if (endpointDataSerieMap.get(rdfDataStructureItem.endpoint) == undefined) {
                        endpointDataSerieMap.set(rdfDataStructureItem.endpoint, []);
                    }
                    endpointDataSerieMap.get(rdfDataStructureItem.endpoint).push([rdfDataStructureItem.date, precise(rdfDataStructureItem.measure)]);
                });

                if (endpointDataSerieMap.size > 0) {
                    this.show()

                    // Chart
                    this.option = Control.getInstance().retrieveFileFromVault(rdfDataStructuresEchartsOptionFilename);
                    this.redraw();

                    // Average measure
                    let rdfDataStructureMeasureSum = rdfDataStructureDataTmp.map(a => a.measure).reduce((previous, current) => current + previous);
                    let rdfDataStructuresAverageMeasure = rdfDataStructureMeasureSum / rdfDataStructureDataTmp.length;
                    $('#rdfDataStructuresMeasure').text(precise(rdfDataStructuresAverageMeasure, 3) + "%");

                    // Measire Details
                    let tableHTML = $('#rdfDataStructuresTable');
                    tableHTML.empty();

                    let gridJSData: { endpoint: string, measure: number }[] = [];
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        let measureAverage = endpointMeasureSum / serieData.length;
                        let measureAverageRounded = Number.parseFloat(precise(measureAverage, 3));
                        gridJSData.push({ endpoint: endpoint, measure: measureAverageRounded });
                    });
                    let gridJSColumns = [
                        { id: "endpoint", name: "Endpoint", field: "endpoint", sortable: true },
                        { id: "measure", name: "Measure", field: "measure", sortable: true, formatter: (cell, row) => {
                                return cell + "%";
                            }
                         }
                    ];
                    let gridJSTable = new gridjs.Grid({
                        columns: gridJSColumns,
                        data: gridJSData,
                        sort: true,
                        search: true,
                        pagination: {
                            limit: 10,
                            summary: false
                        }
                    });
                    gridJSTable.render(document.getElementById("rdfDataStructuresTable"));
                } else {
                    this.hide();
                }
            }
            return Promise.resolve().then(() => { this.filled = true; });
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#rdfDataStructuresMeasure').empty();
        collapseHtml('rdfDataStructuresScatter');
        collapseHtml("rdfDataStructureMeasureRow");
    },
    showFunction: function () {
        unCollapseHtml('rdfDataStructuresScatter');
        unCollapseHtml("rdfDataStructureMeasureRow");
    },
    redrawFunction: function () {
        $('#rdfDataStructuresQueryCell').empty();
        $('#rdfDataStructuresQueryCell').append($(document.createElement('code')).text(this.query));
        $('#rdfDataStructuresScatter').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

export let readableLabelsChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('readableLabelsScatter')), 
    option: {},
    fillFunction: function () {
            if (!this.filled) {
                this.query = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
                    "GRAPH ?g {" +
                    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
                    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
                    "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
                    "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . " +
                    "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
                    "} " +
                    "} GROUP BY ?g ?endpointUrl ?measure ";
                $('#readableLabelsQueryCell').empty();
                $('#readableLabelsQueryCell').append($(document.createElement('code')).text(this.query))

                let readableLabelDataTmp = Control.getInstance().readableLabelData()

                let graphSet = new Set(readableLabelDataTmp.map(a => a.graph))

                let endpointDataSerieMap = new Map();
                readableLabelDataTmp.forEach((readableLabelItem, i) => {
                    if (endpointDataSerieMap.get(readableLabelItem.endpoint) == undefined) {
                        endpointDataSerieMap.set(readableLabelItem.endpoint, []);
                    }
                    endpointDataSerieMap.get(readableLabelItem.endpoint).push([readableLabelItem.date, precise(readableLabelItem.measure)]);
                });

                if (endpointDataSerieMap.size > 0) {
                    this.show();

                    // Chart
                    this.option = Control.getInstance().retrieveFileFromVault(readableLabelsEchartsOptionFilename);
                    this.redraw();

                    // Average measure
                    let readableLabelMeasureSum = readableLabelDataTmp.map(a => a.measure).reduce((previous, current) => current + previous);
                    let readableLabelsAverageMeasure = readableLabelMeasureSum / readableLabelDataTmp.length;
                    $('#readableLabelsMeasure').text(precise(readableLabelsAverageMeasure, 3) + "%");

                    // Measire Details
                    let tableHTML = $('#readableLabelsTable');
                    tableHTML.empty();

                    let gridJSData: { endpoint: string, measure: number }[] = [];
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        let measureAverage = endpointMeasureSum / serieData.length;
                        let measureAverageRounded = Number.parseFloat(precise(measureAverage, 3));
                        gridJSData.push({ endpoint: endpoint, measure: measureAverageRounded });
                    });
                    let gridJSColumns = [
                        { id: "endpoint", name: "Endpoint", field: "endpoint", sortable: true },
                        { id: "measure", name: "Measure", field: "measure", sortable: true, formatter: (cell, row) => {
                                return cell + "%";
                            }
                         }
                    ];
                    let gridJSTable = new gridjs.Grid({
                        columns: gridJSColumns,
                        data: gridJSData,
                        sort: true,
                        search: true,
                        pagination: {
                            limit: 10,
                            summary: false
                        }
                    });
                    gridJSTable.render(document.getElementById('readableLabelsTable'));
                } else {
                    this.hide();
                }
            }
            return Promise.resolve().then(() => { this.filled = true; });
    }, hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#readableLabelMeasure').empty();
        collapseHtml('readableLabelsMeasureRow');
        collapseHtml('readableLabelsScatter');
    },
    showFunction: function () {
        unCollapseHtml('readableLabelsScatter');
        unCollapseHtml('readableLabelsMeasureRow');
    },
    redrawFunction: function () {
        $('#readableLabelsQueryCell').empty();
        $('#readableLabelsQueryCell').append($(document.createElement('code')).text(this.query))
        $('#readableLabelsScatter').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

export let blankNodesChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('blankNodesScatter')),
    option: {},
    fillFunction: function () {
            if (!this.filled) {
                this.query = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
                    "GRAPH ?g {" +
                    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
                    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
                    "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
                    "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/blankNodeUsage.ttl> . " +
                    "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
                    "}" +
                    " } " +
                    "GROUP BY ?g ?endpointUrl ?measure ";
                $('#blankNodesQueryCell').empty();
                $('#blankNodesQueryCell').append($(document.createElement('code')).text(this.query))

                let blankNodeDataTmp = Control.getInstance().blankNodesData()

                let endpointDataSerieMap = new Map();
                blankNodeDataTmp.forEach((blankNodeItem, i) => {
                    if (endpointDataSerieMap.get(blankNodeItem.endpoint) == undefined) {
                        endpointDataSerieMap.set(blankNodeItem.endpoint, []);
                    }
                    endpointDataSerieMap.get(blankNodeItem.endpoint).push([blankNodeItem.date, precise(blankNodeItem.measure, 3)]);
                });

                if (endpointDataSerieMap.size > 0) {
                    this.show();

                    // Chart
                    this.option = Control.getInstance().retrieveFileFromVault(blankNodesEchartsOptionFilename);
                    this.redraw();

                    // Average measure
                    let blankNodeMeasureSum = blankNodeDataTmp.map(a => a.measure).reduce((previous, current) => current + previous);
                    let blankNodesAverageMeasure = blankNodeMeasureSum / blankNodeDataTmp.length;
                    $('#blankNodesMeasure').text(precise(blankNodesAverageMeasure, 3) + "%");

                    // Measire Details
                    let tableHTMl = $('#blankNodesTable');
                    tableHTMl.empty();

                    let gridJSData: { endpoint: string, measure: number }[] = [];
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        let measureAverage = endpointMeasureSum / serieData.length;
                        let measureAverageRounded = Number.parseFloat(precise(measureAverage, 3));
                        gridJSData.push({ endpoint: endpoint, measure: measureAverageRounded });
                    });
                    let gridJSColumns = [
                        { id: "endpoint", name: "Endpoint", field: "endpoint", sortable: true },
                        { id: "measure", name: "Measure", field: "measure", sortable: true, formatter: (cell, row) => {
                                return cell + "%";
                            }
                         }
                    ];
                    let gridJSTable = new gridjs.Grid({
                        columns: gridJSColumns,
                        data: gridJSData,
                        sort: true,
                        search: true,
                        pagination: {
                            limit: 10,
                            summary: false
                        }
                    });
                    gridJSTable.render(document.getElementById('blankNodesTable'));
                } else {
                    this.hide();
                }
            }
            return Promise.resolve().then(() => { this.filled = true; });
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#blankNodeMeasure').empty();
        collapseHtml('blankNodesMeasureRow');
        collapseHtml('blankNodesScatter');
    },
    showFunction: function () {
        unCollapseHtml('blankNodesScatter');
        unCollapseHtml('blankNodesMeasureRow');
    },
    redrawFunction: function () {
        $('#blankNodesQueryCell').empty();
        $('#blankNodesQueryCell').append($(document.createElement('code')).text(this.query))
        $('#blankNodesScatter').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

export let standardVocabCharts = new KartoChart({
    chartObject: echarts.init(document.getElementById('standardVocabs')),
    option: {},
    fillFunction: function () {
        try {
            let option = Control.getInstance().retrieveFileFromVault(standardVocabulariesEndpointGraphEchartsOptionFilename);
            this.option = option;

            this.filled = true;

            this.redraw();
            return Promise.resolve();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        } finally {
            return Promise.resolve();
        }
    },
    hideFunction: function () {
        collapseHtml('standardVocabs');
    },
    showFunction: function () {
        unCollapseHtml('standardVocabs')
        this.redraw()
    },
    redrawFunction: function () {
        $('#standardVocabs').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
    }
});