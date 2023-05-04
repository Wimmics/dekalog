import dayjs from "dayjs";
import L from "leaflet";
import $ from 'jquery';
import * as echarts from "echarts";
import { greenIcon, orangeIcon } from "./leaflet-color-markers";
import { KartoChart } from "./ViewClasses";
import { collapseHtml, unCollapseHtml, getMainContentColWidth } from "./ViewUtils";
import { Control } from "./Control";
import { parseDate, precise } from "./Utils";
import { getCircularGraphOption, getForceGraphOption, getScatterDataSeriesFromMap, getTimeScatterOption } from "./ChartsUtils";

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

const numberOfVocabulariesLimit = 100;

export let geolocChart = new KartoChart({
    chartObject: L.map('map').setView([39.36827914916014, 12.117919921875002], 2),
    fillFunction: function () {
        return new Promise<void>((resolve, reject) => {
            if (!this.filled) {
                let endpointGeolocTableBody = $('#endpointGeolocTableBody');
                endpointGeolocTableBody.empty();

                this.chartObject.invalidateSize();
                $('#map').width(getMainContentColWidth());

                let graphEndpointGeolocData = Control.getInstance().geolocData();

                function addLineToEndpointGeolocTable(item) {
                    let endpointRow = $(document.createElement('tr'));
                    let endpointCell = $(document.createElement('td'));
                    endpointCell.text(item.endpoint);
                    let latCell = $(document.createElement('td'));
                    latCell.text(item.lat);
                    let lonCell = $(document.createElement('td'));
                    lonCell.text(item.lon);
                    let countryCell = $(document.createElement('td'));
                    countryCell.text(item.country);
                    let regionCell = $(document.createElement('td'));
                    regionCell.text(item.region);
                    let cityCell = $(document.createElement('td'));
                    cityCell.text(item.city);
                    let orgCell = $(document.createElement('td'));
                    orgCell.text(item.org);

                    endpointRow.append(endpointCell);
                    endpointRow.append(latCell);
                    endpointRow.append(lonCell);
                    endpointRow.append(countryCell);
                    endpointRow.append(regionCell);
                    endpointRow.append(cityCell);
                    endpointRow.append(orgCell);

                    endpointGeolocTableBody.append(endpointRow);
                }
                function endpointGeolocTableFill() {
                    endpointGeolocTableBody.empty();
                    graphEndpointGeolocData.forEach((item, i) => {
                        addLineToEndpointGeolocTable(item);
                    });
                    $("#endpointGeolocTable").DataTable()
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
                    endpointMarker.addTo(this.layerGroup);
                });
                endpointGeolocTableFill();
                this.redraw();
            }
            resolve();
        }).then(() => { this.filled = true; });
    },
    redrawFunction: function () {
        this.chartObject.invalidateSize();
        $('#map').width(getMainContentColWidth());
        this.chartObject.setView([39.36827914916014, 12.117919921875002], 2);
    },
    clearFunction: function () {
        (geolocChart.chartObject as L.Map).eachLayer(layer => {
            (geolocChart.chartObject as L.Map).removeLayer(layer);
        });
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
        Control.getInstance().sparqlFeatureDesc.forEach(featureDesc => {
            featuresDescriptionMap.set(featureDesc.feature, featureDesc.description);
            featuresQueryMap.set(featureDesc.feature, featureDesc.query);
        });

        let sparqlFeaturesDataArray = Control.getInstance().sparqlFeaturesData;

        sparqlFeaturesDataArray.sort((a, b) => {
            return a.endpoint.localeCompare(b.endpoint);
        });
        function fillFeaturesTable() {
            let tableBody = $('#SPARQLFeaturesTableBody');
            tableBody.empty();
            sparqlFeaturesDataArray.forEach((item, i) => {
                let endpoint = item.endpoint;
                let endpointRow = $(document.createElement("tr"));
                let endpointCell = $(document.createElement("td"));
                let featuresCell = $(document.createElement("td"));
                item.features.forEach(feature => {
                    let featureAloneCell = $(document.createElement("p"));
                    featureAloneCell.addClass(feature + "Feature");
                    featureAloneCell.prop("title", featuresDescriptionMap.get(feature) + "\n" + featuresQueryMap.get(feature));
                    featureAloneCell.text(feature);
                    featuresCell.append(featureAloneCell);
                })
                endpointCell.text(endpoint);
                endpointRow.append(endpointCell);
                endpointRow.append(featuresCell);
                tableBody.append(endpointRow);
            });

            $("#SPARQLFeaturesTable").DataTable()
        }

        fillFeaturesTable()
        this.filled = true;
    }
});

export let sparql10Chart = new KartoChart({
    chartObject: echarts.init(document.getElementById('SPARQL10histo')),
    fillFunction: function () {
        let option = Control.getInstance().retrieveFileFromVault(sparql10CoverageEchartsOptionFilename);
        this.chartObject.setOption(option);
        this.option = option;
        return Promise.resolve();
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
        let option = Control.getInstance().retrieveFileFromVault(sparql11CoverageEchartsOptionFilename);
        this.chartObject.setOption(option);
        this.option = option;

        this.redraw();
        return Promise.resolve();
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
        let option = Control.getInstance().retrieveFileFromVault(sparqlCoverageEchartsOptionFilename);
        this.option = option;
        this.chartObject.setOption(option);

        let maxSparql10 = 24;
        let maxSparql11 = 19;

        this.redraw();

        function fillTestTable() {
            let tableBody = $('#SPARQLFeaturesCountTableBody');
            tableBody.empty();
            Control.getInstance().sparqlCoverCountData().sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            }).forEach((item, i) => {
                let endpoint = item.endpoint;
                let sparql10 = precise((item.sparql10 / maxSparql10) * 100, 3);
                let sparql11 = precise((item.sparql11 / maxSparql11) * 100, 3);
                let endpointRow = $(document.createElement("tr"));
                let endpointCell = $(document.createElement("td"));
                let sparql10Cell = $(document.createElement("td"));
                let sparql11Cell = $(document.createElement("td"));
                endpointCell.text(endpoint);
                sparql10Cell.text(sparql10 + "%");
                sparql11Cell.text(sparql11 + "%");
                endpointRow.append(endpointCell);
                endpointRow.append(sparql10Cell);
                endpointRow.append(sparql11Cell);
                tableBody.append(endpointRow);
            });

            $("#SPARQLFeaturesCountTable").DataTable()
        }

        fillTestTable();
        return Promise.resolve()
            .then(() => { this.filled = true; });
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

export let filteredVocabChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('vocabs')),
    option: {},
    sparqlesVocabulariesQuery: '',
    fillFunction: function () {
        return new Promise<void>((resolve, reject) => {
            if (!this.filled) {
                this.sparqlesVocabulariesQuery = "SELECT DISTINCT ?endpointUrl ?vocabulary { GRAPH ?g { " +
                    "{ ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
                    "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
                    "?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?dataset . " +
                    "?dataset <http://rdfs.org/ns/void#vocabulary> ?vocabulary " +
                    "} " +
                    " } " +
                    "GROUP BY ?endpointUrl ?vocabulary ";

                // Create an force graph with the graph linked by co-ocurrence of vocabularies

                let endpointSet = new Set();
                let vocabSet = new Set();
                let rawVocabSet = new Set<string>();
                let rawGatherVocab = new Map();
                Control.getInstance().vocabEndpointData().forEach((item, i) => {
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
                    if (Control.getInstance().knownVocabData().includes(vocabulariUri)) {
                        vocabSet.add(vocabulariUri);
                    }
                });
                rawGatherVocab.forEach((vocabulariUriSet, endpointUri, map) => {
                    vocabulariUriSet.forEach(vocabulariUri => {
                        if (Control.getInstance().knownVocabData().includes(vocabulariUri)) {
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
                    this.show();

                    let endpointKnownVocabulariestableBody = $('#endpointKnownVocabsTableBody');
                    let sumknowVocabMeasure = 0;
                    let knowVocabsData = [];
                    gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
                        let measure = (endpointVocabs.size / rawGatherVocab.get(endpointUrl).length);
                        knowVocabsData.push({ 'endpoint': endpointUrl, 'measure': measure })

                        endpointVocabs.forEach((vocab, i) => {
                            jsonVocabLinks.add({ source: endpointUrl, target: vocab });
                        });
                    });


                    this.option = getForceGraphOption('Endpoints and vocabularies with filtering*', ["Vocabulary", "Endpoint"], [...jsonVocabNodes], [...jsonVocabLinks]);
                    this.chartObject.setOption(this.option, true);

                    // Measure Table
                    function endpointKnowVocabsMeasureFill() {
                        let tableContent = knowVocabsData.map(item => [item.endpoint, item.measure])
                        knowVocabsData.forEach((item, i) => {
                            let endpointUrl = item.endpoint;
                            let measure = item.measure;
                            sumknowVocabMeasure += measure;
                            let endpointRow = $(document.createElement("tr"));
                            let endpointCell = $(document.createElement('td'));
                            endpointCell.text(endpointUrl);
                            endpointRow.append(endpointCell);
                            let knownVocabMeasureCell = $(document.createElement('td'));
                            knownVocabMeasureCell.text(precise(measure * 100, 3) + "%");
                            endpointRow.append(knownVocabMeasureCell);
                            endpointKnownVocabulariestableBody.append(endpointRow);
                        });
                    };
                    endpointKnowVocabsMeasureFill();
                    $("#knowVocabEndpointTable").DataTable()

                    // computation of the know vocabularies measure
                    let knownVocabulariesMeasureHtml = $('#KnownVocabulariesMeasure');
                    knownVocabulariesMeasureHtml.text(precise((sumknowVocabMeasure / endpointSet.size) * 100, 3) + "%");
                } else {
                    this.hide();
                }
                this.chartObject.on('click', 'series', event => {
                    if (event.dataType.localeCompare("node") == 0) {
                        let uriLink = event.data.name;
                        window.open(uriLink, '_blank');
                    }
                })
            }
            resolve();

        }).then(() => { this.filled = true; });
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('vocabs');
        collapseHtml('knowVocabEndpointMeasureRow');
        collapseHtml('knowVocabEndpointTable');
    },
    showFunction: function () {
        unCollapseHtml('knowVocabEndpointMeasureRow');
        unCollapseHtml('knowVocabEndpointTable');
        unCollapseHtml('vocabs');

        this.redraw()
    },
    redrawFunction: function () {
        $('#vocabs').width(getMainContentColWidth());
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();

        let codeQuery1Div = $(document.createElement('code')).text(this.sparqlesVocabulariesQuery);
        $('#endpointVocabularyQueryCell').empty()
        $('#endpointVocabularyQueryCell').append(codeQuery1Div)
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#endpointVocabularyQueryCell').empty()
    }
})

export let rawVocabChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('rawVocabs')),
    option: {},
    fillFunction: function () {

        return new Promise<void>((resolve, reject) => {
            if (!this.filled) {
                if (jsonRawVocabNodes.size > 0 && jsonRawVocabLinks.size > 0) {
                    this.show();

                    this.option = getForceGraphOption('Endpoints and vocabularies without filtering', ["Vocabulary", "Endpoint"], [...jsonRawVocabNodes], [...jsonRawVocabLinks]);
                    this.chartObject.setOption(this.option, true);
                } else {
                    this.hide();
                }
                this.chartObject.on('click', 'series', event => {
                    if (event.dataType.localeCompare("node") == 0) {
                        let uriLink = event.data.name;
                        window.open(uriLink, '_blank').focus();
                    }
                })
            }
            resolve();
        }).then(() => { this.filled = true; });
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('rawVocabs');
    },
    showFunction: function () {
        this.redraw();
        unCollapseHtml('rawVocabs');
    },
    redrawFunction: function () {
        $('#rawVocabs').width(getMainContentColWidth());
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
        return new Promise<void>((resolve, reject) => {
            if (!this.filled) {
                // Create an force graph with the graph linked by co-ocurrence of vocabularies

                let endpointSet = new Set();
                let vocabSet = new Set();
                let rawVocabSet = new Set();
                let rawGatherVocab = new Map();
                Control.getInstance().vocabEndpointData().forEach((item, i) => {
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
                    if (Control.getInstance().knownVocabData.includes(vocabulariUri)) {
                        vocabSet.add(vocabulariUri);
                    }
                });
                rawGatherVocab.forEach((vocabulariUriSet, endpointUri, map) => {
                    vocabulariUriSet.forEach(vocabulariUri => {
                        if (Control.getInstance().knownVocabData.includes(vocabulariUri)) {
                            if (!gatherVocab.has(endpointUri)) {
                                gatherVocab.set(endpointUri, new Set());
                            }
                            gatherVocab.get(endpointUri).add(vocabulariUri);
                        }
                    });
                });

                let jsonKeywordLinks = new Set();
                let jsonKeywordNodes = new Set();

                let keywordSet = new Set();
                let vocabKeywordMap = new Map();
                let endpointKeywordsMap = new Map();

                Control.getInstance().vocabKeywordData.forEach(item => {
                    vocabKeywordMap.set(item.vocabulary, item.keywords);

                    item.keywords.forEach(keyword => {
                        keywordSet.add(keyword);
                    })
                });

                gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
                    endpointVocabs.forEach((endpointVocab, i) => {
                        let vocabKeywords = vocabKeywordMap.get(endpointVocab);
                        if (vocabKeywords != undefined) {
                            vocabKeywords.forEach((endpointKeyword, i) => {
                                jsonKeywordLinks.add({ source: endpointUrl, target: endpointKeyword })

                                if (endpointKeywordsMap.get(endpointUrl) == undefined) {
                                    endpointKeywordsMap.set(endpointUrl, new Set());
                                }
                                endpointKeywordsMap.get(endpointUrl).add(endpointKeyword);
                            });
                        }
                    });
                });

                keywordSet.forEach(item => {
                    jsonKeywordNodes.add({ name: item, category: 'Keyword', symbolSize: 5 })
                });
                endpointSet.forEach(item => {
                    jsonKeywordNodes.add({ name: item, category: 'Endpoint', symbolSize: 5 })
                });

                if (jsonKeywordNodes.size > 0 && jsonKeywordLinks.size > 0) {
                    this.show();

                    this.option = getForceGraphOption('Endpoints and keywords', ["Keyword", "Endpoint"], [...jsonKeywordNodes], [...jsonKeywordLinks]);
                    this.chartObject.setOption(this.option, true);

                    let endpointKeywordsData = [];
                    endpointKeywordsMap.forEach((keywords, endpoint, map) => {
                        endpointKeywordsData.push({ endpoint: endpoint, keywords: keywords })
                    });

                    // Endpoint and vocabulary keywords table
                    let endpointKeywordsTableBody = $('#endpointKeywordsTableBody');
                    function endpointKeywordsTableFill() {
                        endpointKeywordsTableBody.empty();
                        endpointKeywordsData.forEach(endpointKeywordsItem => {
                            let endpoint = endpointKeywordsItem.endpoint;
                            let keywords = endpointKeywordsItem.keywords;
                            let endpointRow = $(document.createElement("tr"));
                            let endpointCell = $(document.createElement("td"));
                            endpointCell.text(endpoint);
                            let keywordsCell = $(document.createElement("td"));
                            let keywordsText = "";
                            let keywordCount = 0;
                            let keywordsArray = [...keywords].sort((a, b) => a.localeCompare(b))
                            keywordsArray.forEach((keyword) => {
                                if (keywordCount > 0) {
                                    keywordsText += ", ";
                                }
                                keywordsText += keyword;
                                keywordCount++;
                            });
                            keywordsCell.text(keywordsText);

                            endpointRow.append(endpointCell);
                            endpointRow.append(keywordsCell);
                            endpointKeywordsTableBody.append(endpointRow);
                        });
                    }
                    endpointKeywordsTableFill()
                    $("#endpointKeywordsTable").DataTable()
                } else {
                    this.hide();
                } this.chartObject.on('click', 'series', event => {
                    if ((event.dataType.localeCompare("node") == 0) && (event.data.category.localeCompare("Endpoint") == 0)) {
                        let uriLink = event.data.name;
                        window.open(uriLink, '_blank').focus();
                    }
                })
            }
            resolve();
        }).then(() => { this.filled = true; });
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
        let option = Control.getInstance().retrieveFileFromVault(triplesEchartsOptionFilename);
        this.option = option;

        this.filled = true;

        this.redraw();
        return Promise.resolve();
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
        let option = Control.getInstance().retrieveFileFromVault(classesEchartsOptionFilename);
        this.option = option;
        this.filled = true;
        this.redraw();
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
        let option = Control.getInstance().retrieveFileFromVault(propertiesEchartsOptionFilename);
        this.option = option;
        this.filled = true;
        this.redraw();
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

// export let categoryTestNumberChart = new KartoChart({
//     chartObject: echarts.init(document.getElementById('testCategoryScatter')),
//     option: {},
//     fillFunction: function () {
//         return new Promise((resolve, reject) => {
//             if (!this.filled) {
//                 // Number of tests passed by test categories
//                 let endpointDataSerieMap = new Map();

//                 Control.getInstance().categoryTestCountData().forEach(item => {
//                         let category = item.category;
//                         endpointDataSerieMap.set(category, new Map());

//                     })
//                 Control.getInstance().categoryTestCountData().forEach(item => {
//                     let category = item.category;
//                     let count = item.count;
//                     let endpoint = item.endpoint;
//                     let graph = item.graph;

//                     if (endpointDataSerieMap.get(category).get(graph) == undefined) {
//                         endpointDataSerieMap.get(category).set(graph, new Map());
//                     }
//                     endpointDataSerieMap.get(category).get(graph).set(endpoint, count);

//                 })
//                 if (endpointDataSerieMap.size > 0) {
//                     this.show();

//                     let triplesSeries = [];
//                     let categoryXAxisData: string[] = [];
//                     endpointDataSerieMap.forEach((gemap, category, map1) => {
//                         let categoryName: string = category.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/", "").replace("/", "").replace("check", "Quality").replace('computed', "Computed").replace('asserted', "Asserted").replace("sportal", 'SPORTAL');
//                         categoryXAxisData.push(categoryName);
//                         let dataCategory = [];
//                         gemap.forEach((endpointMap, graph, map2) => {
//                             let totalEndpointGraph = 0;
//                             endpointMap.forEach((count, endpoint, map3) => {
//                                 totalEndpointGraph = totalEndpointGraph + Number.parseInt(count);
//                             });
//                             let numberOfEndpoint = endpointMap.size;
//                             let avgEndpointGraph = precise(totalEndpointGraph / numberOfEndpoint);
//                             let percentageAvrEndpointCategory = avgEndpointGraph;
//                             if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/")) {
//                                 percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 8) * 100);
//                             } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/")) {
//                                 percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 4) * 100);
//                             } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/")) {
//                                 percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 10) * 100);
//                             } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/")) {
//                                 percentageAvrEndpointCategory = (precise(percentageAvrEndpointCategory / 23) * 100);
//                             } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/")) {
//                                 percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 25) * 100);
//                             } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/")) {
//                                 percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 20) * 100);
//                             }

//                             dataCategory.push([graph, percentageAvrEndpointCategory]);
//                         });

//                         dataCategory.sort((a, b) => a[0].localeCompare(b[0]));
//                         let chartSerie = {
//                             name: categoryName,
//                             label: {
//                                 show: true,
//                                 formatter: "{a}"
//                             },
//                             symbolSize: 5,
//                             data: dataCategory,
//                             type: 'bar'
//                         };
//                         triplesSeries.push(chartSerie);
//                     });

//                     let categoriesArray = categoryXAxisData.sort((a, b) => a.localeCompare(b));
//                     triplesSeries.sort((a, b) => a.name.localeCompare(b.name))

//                     this.option = {
//                         title: {
//                             left: 'center',
//                             text: "Proportion of tests passed by category",
//                         },
//                         xAxis: {
//                             type: 'category',
//                             //    data:categoriesArray
//                         },
//                         yAxis: {
//                             max: 100
//                         },
//                         series: triplesSeries,
//                         tooltip: {
//                             show: 'true'
//                         }
//                     };

//                     this.chartObject.setOption(this.option, true);
//                 } else {
//                     this.hide();
//                 }
//             }
//             resolve();
//         }).then(() => { this.filled = true; });
//     },
//     hideFunction: function () {
//         this.chartObject.setOption({ series: [] }, true);
//         collapseHtml('testCategoryScatter');
//     },
//     showFunction: function () {
//         unCollapseHtml('testCategoryScatter');
//     },
//     redrawFunction: function () {
//         $('#testCategoryScatter').width(getMainContentColWidth());
//         this.chartObject.setOption(this.option, true);
//         this.chartObject.resize();
//     }
// });

// export let totalCategoryTestNumberChart = new KartoChart({
//     chartObject: echarts.init(document.getElementById('totalTestCategoryScatter')),
//     option: {},
//     fillFunction: function () {
//         return new Promise<void>((resolve, reject) => {
//             if (!this.filled) {
//                 // Number of tests passed by test categories
//                 let endpointDataSerieMap = new Map();
//                 Control.getInstance().totalCategoryTestCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
//                     && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
//                     && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
//                 ).forEach(item => {
//                     let category = item.category;

//                     endpointDataSerieMap.set(category, new Map());
//                 })
//                 Control.getInstance().totalCategoryTestCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
//                     && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
//                     && (Control.getInstance().graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
//                 ).forEach(item => {
//                     let category = item.category;
//                     let count = item.count;
//                     let endpoint = item.endpoint;

//                     endpointDataSerieMap.get(category).set(endpoint, count);
//                 })

//                 if (endpointDataSerieMap.size > 0) {
//                     this.show();

//                     let triplesSeries: echarts.EChartOption.SeriesBar[] = [];
//                     let categoryXAxisData: string[] = [];
//                     endpointDataSerieMap.forEach((endpointMap, category, map1) => {
//                         let categoryName = category.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/", "").replace("/", "").replace("check", "Quality").replace('computed', "Computed").replace('asserted', "Asserted").replace("sportal", 'SPORTAL');
//                         categoryXAxisData.push(categoryName);
//                         let dataCategory = [];
//                         let totalEndpointGraph = 0;
//                         endpointMap.forEach((count, endpoint, map3) => {
//                             totalEndpointGraph = totalEndpointGraph + Number.parseInt(count);
//                         });
//                         let numberOfEndpoint = endpointMap.size;
//                         let avgEndpointGraph = totalEndpointGraph / numberOfEndpoint;
//                         let percentageAvrEndpointCategory = avgEndpointGraph;
//                         if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/")) {
//                             percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 8) * 100);
//                         } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/")) {
//                             percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 4) * 100);
//                         } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/")) {
//                             percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 10) * 100);
//                         } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/")) {
//                             percentageAvrEndpointCategory = (precise(percentageAvrEndpointCategory / 23) * 100);
//                         } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/")) {
//                             percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 25) * 100);
//                         } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/")) {
//                             percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 20) * 100);
//                         }

//                         dataCategory.push(percentageAvrEndpointCategory);
//                         let chartSerie: echarts.EChartOption.SeriesBar = {
//                             name: categoryName,
//                             label: {
//                                 show: true,
//                                 formatter: "{a}"
//                             },
//                             data: dataCategory,
//                             type: 'bar'
//                         };
//                         triplesSeries.push(chartSerie);
//                     });

//                     triplesSeries.sort((a, b) => a.name.localeCompare(b.name))

//                     this.option = {
//                         title: {
//                             left: 'center',
//                             text: "Proportion of tests passed by category for all runs",
//                         },
//                         xAxis: {
//                             show: false,
//                             type: 'category',
//                             //    data:categoriesArray
//                         },
//                         yAxis: {
//                             max: 100
//                         },
//                         series: triplesSeries,
//                         tooltip: {
//                             show: 'true'
//                         }
//                     };

//                     this.chartObject.setOption(this.option, true);
//                 } else {
//                     this.hide();
//                 }
//             }
//             resolve();
//         }).then(() => { this.filled = true; });
//     },
//     hideFunction: function () {
//         this.chartObject.setOption({ series: [] }, true);
//         collapseHtml('totalTestCategoryScatter');
//     },
//     showFunction: function () {
//         unCollapseHtml('totalTestCategoryScatter');
//     },
//     redrawFunction: function () {
//         $('#totalTestCategoryScatter').width(getMainContentColWidth());
//         this.chartObject.setOption(this.option, true);
//         this.chartObject.resize();
//     }
// });

// export let testTableContent = new KartoChart({
//     fillFunction: function () {
//         return new Promise((resolve, reject) => {
//             if (!this.filled) {
//                 let appliedTestMap = new Map();
//                 Control.getInstance().endpointTestsData().filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
//                     && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
//                     && (Control.getInstance().graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
//                 ).forEach((item, i) => {
//                     let endpointUrl = item.endpoint;
//                     let rule = item.activity;

//                     if (appliedTestMap.get(endpointUrl) == undefined) {
//                         appliedTestMap.set(endpointUrl, []);
//                     }
//                     appliedTestMap.get(endpointUrl).push(rule);
//                 });

//                 let appliedTestData = [];
//                 appliedTestMap.forEach((rules, endpoint, map) => {
//                     rules.sort((a, b) => a.localeCompare(b))
//                     appliedTestData.push({ 'endpoint': endpoint, 'rules': rules })
//                 });

//                 appliedTestData.sort((a, b) => {
//                     return a.endpoint.localeCompare(b.endpoint);
//                 });

//                 function fillTestTable() {
//                     let tableBody = $('#rulesTableBody');
//                     tableBody.empty();
//                     appliedTestData.forEach((item, i) => {
//                         let endpoint = item.endpoint;
//                         let rules = item.rules;
//                         let endpointRow = $(document.createElement("tr"));
//                         let endpointCell = $(document.createElement("td"));
//                         endpointCell.text(endpoint);
//                         let rulesCell = $(document.createElement("td"));
//                         let ruleCol = $(document.createElement("div"));
//                         ruleCol.addClass("col");
//                         rules.forEach((item, i) => {
//                             let ruleLine = $(document.createElement("div"));
//                             ruleLine.addClass("row")
//                             ruleLine.addClass("border-top")
//                             ruleLine.addClass("border-bottom")
//                             ruleLine.text(item);
//                             ruleCol.append(ruleLine);
//                         });
//                         rulesCell.append(ruleCol)
//                         endpointRow.append(endpointCell);
//                         endpointRow.append(rulesCell);
//                         tableBody.append(endpointRow);
//                     });
//                     $("#rulesTable").DataTable()
//                 }

//                 fillTestTable();
//             }
//             resolve();
//         }).then(() => { this.filled = true; });
//     },
//     clearFunction: function () {
//         $('#rulesTableBody').empty();
//     }
// });

// export let totalRuntimeChart = new KartoChart({
//     chartObject: echarts.init(document.getElementById('totalRuntimeScatter')),
//     option: {},
//     fillFunction: function () {
//         return new Promise<void>((resolve, reject) => {
//             if (!this.filled) {

//                 this.chartObject.setOption(this.option, true);
//                 $('#totalRuntimeScatter').width(getMainContentColWidth());
//             }
//             resolve();
//         }).then(() => { this.filled = true; });
//     },
//     redrawFunction: function () {
//         $('#totalRuntimeScatter').width(getMainContentColWidth());
//         this.chartObject.setOption(this.option, true);
//         this.chartObject.resize();
//     },
//     clearFunction: function () {
//         this.chartObject.setOption({ series: [] }, true);
//     }
// });

// export let averageRuntimeChart = new KartoChart({
//     chartObject: echarts.init(document.getElementById('averageRuntimeScatter')),
//     option: {},
//     fillFunction: function () {
//         return new Promise<void>((resolve, reject) => {
//             if (!this.filled) {
//                 let runtimeDataSerie = []
//                 Control.getInstance().averageRuntimeData.filter(item => (Control.getInstance().graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)).forEach((itemResult, i) => {
//                     let graph = itemResult.graph;
//                     let start = parseDate(itemResult.start);
//                     let end = parseDate(itemResult.end);
//                     let date = parseDate(itemResult.date);
//                     let count = itemResult.count;
//                     let runtime = dayjs.duration(itemResult.runtime);
//                     let value = runtime.asSeconds() / count;

//                     runtimeDataSerie.push([date, runtime, count])
//                 });

//                 let runtimeSerie = {
//                     name: "Average runtime in seconds",
//                     label: 'show',
//                     symbolSize: 5,
//                     data: runtimeDataSerie.map(item => [item[0].toDate(), item[1].asSeconds() / item[2]]),
//                     tooltip: {
//                         show: true,
//                         formatter: function (value) {
//                             let source = runtimeDataSerie.filter(a => a[0].isSame(dayjs(value.value[0])))[0];
//                             let date = source[0];
//                             let runtime = source[1];
//                             let count = source[2];

//                             let tooltip = date.toString() + "<br/> " + dayjs.duration(runtime.asSeconds() / count, "seconds").humanize();
//                             return tooltip;
//                         }
//                     },
//                     type: 'scatter'
//                 };
//                 this.option = getTimeScatterOption("Average runtime of the framework for each run (in seconds)", [runtimeSerie]);
//                 this.chartObject.setOption(this.option, true);
//             }
//             resolve();
//         }).then(() => { this.filled = true; return; });
//     },
//     redrawFunction: function () {
//         $('#averageRuntimeScatter').width(getMainContentColWidth());
//         this.chartObject.setOption(this.option, true);
//         this.chartObject.resize();
//     },
//     hideFunction: function () {
//         this.chartObject.setOption({}, true);
//     }
// });

export let classAndPropertiesContent = new KartoChart({
    fillFunction: () => {
        if (!this.filled) {
            let classPropertyDataTmp = Control.getInstance().classPropertyData().filter(classPropertyItem => [...knownVocabData].find(item => classPropertyItem.class.startsWith(item)))

            classPropertyDataTmp.sort((a, b) => a.class.localeCompare(b.class));

            function fillclassDescriptionTable() {
                let tableBody = $("#classDescriptionTableBody");
                tableBody.empty();
                classPropertyDataTmp.forEach((countsItem, i) => {
                    let classRow = $(document.createElement("tr"))
                    let classCell = $(document.createElement("td"))
                    let classTriplesCell = $(document.createElement("td"))
                    let classClassesCell = $(document.createElement("td"))
                    let classPropertiesCell = $(document.createElement("td"))
                    let classDistinctSubjectsCell = $(document.createElement("td"))
                    let classDistinctObjectsCell = $(document.createElement("td"))
                    let endpointsCell = $(document.createElement("td"))

                    classCell.text(countsItem.class);
                    classTriplesCell.text(countsItem.triples);
                    classClassesCell.text(countsItem.classes);
                    classPropertiesCell.text(countsItem.properties);
                    classDistinctSubjectsCell.text(countsItem.distinctSubjects);
                    classDistinctObjectsCell.text(countsItem.distinctObjects);
                    if (countsItem.endpoints != undefined) {
                        endpointsCell.text(countsItem.endpoints.length);
                    }

                    classRow.append(classCell);
                    classRow.append(classTriplesCell);
                    classRow.append(classClassesCell);
                    classRow.append(classPropertiesCell);
                    classRow.append(classDistinctSubjectsCell);
                    classRow.append(classDistinctObjectsCell);
                    classRow.append(endpointsCell);
                    tableBody.append(classRow);
                });

                $("#classDescriptionTable").DataTable()
            }
            fillclassDescriptionTable()
        }
        this.filled = true;
    }
});

export let descriptionElementChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('datasetdescriptionRadar')),
    option: {},
    fillFunction: function () {
        if (!this.filled) {
            let datasetDescriptionDataTmp = Control.getInstance().datasetDescriptionData();
            datasetDescriptionDataTmp.sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            });

            // Table
            function fillTestTable() {
                let tableBody = $('#datasetDescriptionTableBody');
                tableBody.empty();
                datasetDescriptionDataTmp.forEach((item, i) => {
                    let endpoint = item.endpoint;
                    let who = item.who;
                    let license = item.license;
                    let time = item.time;
                    let source = item.source;
                    let endpointRow = $(document.createElement("tr"));
                    let endpointCell = $(document.createElement("td"));
                    endpointCell.text(endpoint);
                    let whoCell = $(document.createElement("td"));
                    whoCell.text(who);
                    let licenseCell = $(document.createElement("td"));
                    licenseCell.text(license);
                    let timeCell = $(document.createElement("td"));
                    timeCell.text(time);
                    let sourceCell = $(document.createElement("td"));
                    sourceCell.text(source);
                    endpointRow.append(endpointCell);
                    endpointRow.append(whoCell);
                    endpointRow.append(licenseCell);
                    endpointRow.append(timeCell);
                    endpointRow.append(sourceCell);
                    tableBody.append(endpointRow);
                });
                $("#datasetDescriptionTable").DataTable()
            }


            fillTestTable();

            // chart
            let option = Control.getInstance().retrieveFileFromVault(datasetDescriptionEchartsOptionFilename);
            this.option = option;
            this.redraw();
        }
        this.filled = true;
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
            $('#shortUrisMeasure').text(precise(shortUrisAverageMeasure) + "%");

            // Measire Details
            function fillShortUriTable() {
                let shortUrisDetailTableBody = $('#shortUrisTableBody');
                let endpointDataSerieMap = new Map();
                Control.getInstance().shortUriData().forEach((shortUriItem, i) => {
                    if (endpointDataSerieMap.get(shortUriItem.endpoint) == undefined) {
                        endpointDataSerieMap.set(shortUriItem.endpoint, []);
                    }
                    endpointDataSerieMap.get(shortUriItem.endpoint).push([shortUriItem.date, precise(shortUriItem.measure)]);
                });
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    let endpointRow = $(document.createElement('tr'));

                    let endpointCell = $(document.createElement('td'));
                    endpointCell.text(endpoint);
                    let measureCell = $(document.createElement('td'));
                    let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                    let measureAverage = endpointMeasureSum / serieData.length;
                    measureCell.text(precise(measureAverage, 3) + "%");

                    endpointRow.append(endpointCell);
                    endpointRow.append(measureCell);

                    shortUrisDetailTableBody.append(endpointRow);
                });
                $('#shortUrisTable').DataTable()
            }
            fillShortUriTable();
        } else {
            this.hide();
        }
        this.filled = true;
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
        return new Promise<void>((resolve, reject) => {
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
                    let rdfDataStructuresDetailTableBody = $('#rdfDataStructuresTableBody');
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        let endpointRow = $(document.createElement('tr'));

                        let endpointCell = $(document.createElement('td'));
                        endpointCell.text(endpoint);
                        let measureCell = $(document.createElement('td'));
                        let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        let measureAverage = endpointMeasureSum / serieData.length;
                        measureCell.text(precise(measureAverage, 3) + "%");

                        endpointRow.append(endpointCell);
                        endpointRow.append(measureCell);

                        rdfDataStructuresDetailTableBody.append(endpointRow);
                    });
                    $('#rdfDataStructuresTable').DataTable()
                } else {
                    this.hide();
                }
            }
            resolve();
        }).then(() => { this.filled = true; });
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
    chartObject: echarts.init(document.getElementById('readableLabelsScatter')), option: {},
    fillFunction: function () {
        return new Promise<void>((resolve, reject) => {
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
                    let readableLabelsDetailTableBody = $('#readableLabelsTableBody');
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        let endpointRow = $(document.createElement('tr'));

                        let endpointCell = $(document.createElement('td'));
                        endpointCell.text(endpoint);
                        let measureCell = $(document.createElement('td'));
                        let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        let measureAverage = endpointMeasureSum / serieData.length;
                        measureCell.text(precise(measureAverage, 3) + "%");

                        endpointRow.append(endpointCell);
                        endpointRow.append(measureCell);

                        readableLabelsDetailTableBody.append(endpointRow);
                    });
                } else {
                    this.hide();
                }

                $('#readableLabelsTable').DataTable()
            }
            resolve();
        }).then(() => { this.filled = true; });
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
        return new Promise<void>((resolve, reject) => {
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
                    let blankNodesDetailTableBody = $('#blankNodesTableBody');
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        let endpointRow = $(document.createElement('tr'));

                        let endpointCell = $(document.createElement('td'));
                        endpointCell.text(endpoint);
                        let measureCell = $(document.createElement('td'));
                        let endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        let measureAverage = endpointMeasureSum / serieData.length;
                        measureCell.text(precise(measureAverage, 3) + "%");

                        endpointRow.append(endpointCell);
                        endpointRow.append(measureCell);

                        blankNodesDetailTableBody.append(endpointRow);
                    });
                } else {
                    this.hide();
                }
                $('#blankNodesTable').DataTable()
            }
            resolve();
        }).then(() => { this.filled = true; });
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
        return new Promise<void>((resolve, reject) => {
            if (!this.filled) {
                let endpointSet = new Set();
                let vocabStandardSet = new Set();
                let vocabStandardNameMap = new Map([["http://www.w3.org/1999/02/22-rdf-syntax-ns#", "RDF"], ["http://www.w3.org/2000/01/rdf-schema#", "RDFS"], ["http://www.w3.org/ns/shacl#", "SHACL"], ["http://www.w3.org/2002/07/owl#", "OWL"], ["http://www.w3.org/2004/02/skos/core#", "SKOS"], ["http://spinrdf.org/spin#", "SPIN"], ["http://www.w3.org/2003/11/swrl#", "SWRL"]]);
                vocabStandardNameMap.forEach((value, key, map) => {
                    vocabStandardSet.add(key);
                });

                let gatherStandardVocab = new Map();
                let standardVocabSet = new Set();

                Control.getInstance().vocabEndpointData().forEach((item, i) => {
                    let endpoint = item.endpoint;
                    let vocabularies = item.vocabularies;
                    endpointSet.add(endpoint);
                    let filteredVocabularies = new Set(vocabularies.filter(vocab => vocabStandardSet.has(vocab)));
                    if (filteredVocabularies.size > 0) {
                        filteredVocabularies.forEach(item => { standardVocabSet.add(item) })
                        if (!gatherStandardVocab.has(endpoint)) {
                            gatherStandardVocab.set(endpoint, new Set());
                        }
                        gatherStandardVocab.set(endpoint, filteredVocabularies);
                    }
                });

                let jsonStandardVocabNodes = new Set();
                let jsonStandardVocabLinks = new Set();

                endpointSet.forEach(item => {
                    jsonStandardVocabNodes.add({ name: item, category: 'Endpoint', symbolSize: 5 });
                });
                standardVocabSet.forEach(item => {
                    jsonStandardVocabNodes.add({ name: item, category: vocabStandardNameMap.get(item), symbolSize: 5 })
                });
                gatherStandardVocab.forEach((endpointVocabs, endpointUrl, map1) => {
                    endpointVocabs.forEach((vocab, i) => {
                        jsonStandardVocabLinks.add({ target: endpointUrl, source: vocab })
                    });
                });

                if (jsonStandardVocabNodes.size > 0 && jsonStandardVocabLinks.size > 0) {
                    this.show();

                    let categoryArray = [...standardVocabSet].map(vocab => vocabStandardNameMap.get(vocab));
                    categoryArray.push("Endpoint")
                    this.option = getCircularGraphOption('Endpoints and meta-vocabularies', categoryArray, [...jsonStandardVocabNodes], [...jsonStandardVocabLinks]);
                } else {
                    this.hide();
                }
                this.chartObject.on('click', 'series', event => {
                    if (event.dataType.localeCompare("node") == 0) {
                        let uriLink = event.data.name;
                        window.open(uriLink, '_blank').focus();
                    }
                })
            }
            resolve();
        }).then(() => { this.filled = true; });
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