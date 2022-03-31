import * as echarts from "./echarts.js";
import $, { get } from 'jquery';
import 'leaflet';
const dt = require('datatables.net-bs5')();
const ttl_read = require('@graphy/content.ttl.read');
const dayjs = require('dayjs')
const md5 = require('md5');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const duration = require('dayjs/plugin/duration');
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
import { greenIcon, orangeIcon } from "./leaflet-color-markers.js";

// Cached files
const whiteListFile = cachePromise('whiteLists.json');
const geolocDataFile = cachePromise('geolocData.json');
const sparqlCoverCountFile = cachePromise('sparqlCoverageData.json')
const sparqlFeaturesDataFile = cachePromise('sparqlFeaturesData.json')
const knownVocabDataFile = cachePromise('knownVocabsData.json')
const vocabEndpointDataFile = cachePromise('vocabEndpointData.json')
const vocabKeywordDataFile = cachePromise('vocabKeywordsData.json')
const classCountDataFile = cachePromise('classCountData.json')
const propertyCountDataFile = cachePromise('propertyCountData.json')
const tripleCountDataFile = cachePromise('tripleCountData.json')
const categoryTestCountDataFile = cachePromise("categoryTestCountData.json");
const totalCategoryTestCountFile = cachePromise("totalCategoryTestCountData.json");
const endpointTestsDataFile = cachePromise("endpointTestsData.json");
const totalRuntimeDataFile = cachePromise("totalRuntimeData.json");
const averageRuntimeDataFile = cachePromise("averageRuntimeData.json");
const classPropertyDataFile = cachePromise("classPropertyData.json");
const datasetDescriptionDataFile = cachePromise("datasetDescriptionData.json");
const shortUriDataFile = cachePromise("shortUriData.json");
const rdfDataStructureDataFile = cachePromise("rdfDataStructureData.json");
const readableLabelDataFile = cachePromise("readableLabelData.json");
const blankNodesDataFile = cachePromise("blankNodesData.json");

const numberOfVocabulariesLimit = 1000;

var filteredEndpointWhiteList = [];

const graphLists = require('../data/runSets.json');
const sparqlFeatureDesc = require('../data/SPARQLFeatureDescriptions.json');

class KartoChart {
    constructor(config = { chartObject, option, fillFunction: () => { }, redrawFunction: () => { }, clearFunction: () => { }, hideFunction: () => { }, showFunction: () => { }, divId }) {
        this.chartObject = config.chartObject;
        this.option = config.option;
        this.fill = config.fillFunction;
        if (this.fill === undefined) {
            this.fill = () => { };
        }
        this.redraw = config.redrawFunction;
        if (this.redraw === undefined) {
            this.redraw = () => { };
        }
        this.clear = config.clearFunction;
        if (this.clear === undefined) {
            this.clear = () => { };
        }
        this.hide = config.hideFunction;
        if (this.hide === undefined) {
            this.hide = () => { };
        }
        this.show = config.showFunction;
        if (this.show === undefined) {
            this.show = () => { };
        }
    }
};

// Setup tab menu
var geolocTabButton = $('#geoloc-tab')
var vocabRelatedContentTabButton = $('#vocabRelatedContent-tab')
var sparqlTabButton = $('#sparql-tab')
var populationTabButton = $('#population-tab')
var descriptionTabButton = $('#description-tab')
var runtimeTabButton = $('#runtime-tab')
var qualityTabButton = $('#quality-tab')
var navTabs = [geolocTabButton, vocabRelatedContentTabButton, sparqlTabButton, populationTabButton, descriptionTabButton, runtimeTabButton, qualityTabButton];
geolocTabButton.on('click', function (event) {
    redrawGeolocContent()
})
vocabRelatedContentTabButton.on('click', function (event) {
    redrawVocabRelatedContent()
})
sparqlTabButton.on('click', function (event) {
    redrawSparqlCoverContent()
})
populationTabButton.on('click', function (event) {
    redrawDatasetPopulationsContent()
})
descriptionTabButton.on('click', function (event) {
    redrawDatasetDescriptionContent()
})
runtimeTabButton.on('click', function (event) {
    redrawFrameworkInformationContent()
})
qualityTabButton.on('click', function (event) {
    redrawDataQualityContent()
})
function sparqlQueryJSON(query, callback, errorCallback) {
    xmlhttpRequestJSON('http://prod-dekalog.inria.fr/sparql?query=' + encodeURIComponent(query) + "&format=json", callback, errorCallback);
};

function xhrGetPromise(url) {
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

function xhrJSONPromise(url) {
    return xhrGetPromise(url).then(response => {
        return JSON.parse(response);
    })
        .catch(error => {
            console.log(error)
        });
}

function cachePromise(cacheFile) {
    return xhrJSONPromise("http://prod-dekalog.inria.fr/cache/" + cacheFile);
}

function xmlhttpRequestJSON(url, callback, errorCallback) {
    xmlhttpRequestPlain(url, response => {
        callback(JSON.parse(response))
    }, errorCallback);
};

function xmlhttpRequestPlain(url, callback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                callback(this.responseText);
            } else if (errorCallback != undefined) {
                errorCallback(this);
            }
        }
    }
    xhr.open('GET', url, true);
    xhr.send();
};

function intersection(setA, setB) {
    var intersection = new Set();
    for (var elem of setB) {
        if (setA.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}

function haveIntersection(setA, setB) {
    return intersection(setA, setB).size > 0;
}

// Set the precision of a float
function precise(x, n) {
    if (n != undefined) {
        return Number.parseFloat(x).toPrecision(n);
    }
    return Number.parseFloat(x).toPrecision(2);
}

function collapseHtml(htmlId) {
    var jQuerySelect = $('#' + htmlId);
    jQuerySelect.removeClass('show');
    jQuerySelect.addClass('collapse');
}

function unCollapseHtml(htmlId) {
    var jQuerySelect = $('#' + htmlId);
    jQuerySelect.removeClass('collapse');
    jQuerySelect.addClass('show');
}

// Parse the date in any format
function parseDate(input, format) {
    return dayjs(input, format);
}

function getForceGraphOption(title, legendData, dataNodes, dataLinks) {
    var categories = [];
    legendData.forEach((item, i) => {
        categories.push({ name: item });
    });
    return {
        title: {
            text: title,
            top: 'top',
            left: 'center'
        },
        tooltip: {
            show: true,
            confine: true,
        },
        legend: [
            {
                data: legendData,
                top: 'bottom',
            }
        ],
        series: [
            {
                type: 'graph',
                layout: 'force',
                data: dataNodes,
                links: dataLinks,
                categories: categories,
                roam: true,
                draggable: true,
                label: {
                    show: false
                },
                force: {
                    repulsion: 50
                }
            }
        ]
    };
}

function getCategoryScatterOption(title, categories, series) {
    return {
        title: {
            left: 'center',
            text: title,
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                show: true,
                interval: 0
            }
        },
        yAxis: {
        },
        series: series,
        tooltip: {
            show: 'true'
        }
    };
}

function getCategoryScatterDataSeriesFromMap(dataMap) {
    var series = [];
    dataMap.forEach((value, key, map) => {
        var chartSerie = {
            name: key,
            label: 'show',
            symbolSize: 5,
            data: [...new Set(value)].sort((a, b) => a[0].localeCompare(b[0])),
            type: 'line'
        };

        series.push(chartSerie);
    });
    return series;
}

function setTableHeaderSort(tableBodyId, tableHeadersIds, tableColsSortFunction, tableFillFunction, dataArray) {
    var tableBody = $('#' + tableBodyId);
    tableHeadersIds.forEach((tableheaderId, i) => {
        $('#' + tableheaderId).on('click', function () {
            tableBody.empty();
            var ascSortColClass = "sortCol" + i + "Asc";
            var descSortColClass = "sortCol" + i + "Desc";
            var colSortFunction = tableColsSortFunction[i];
            if (!tableBody.hasClass(ascSortColClass)) {
                tableBody.removeClass(descSortColClass);
                tableBody.addClass(ascSortColClass);
                dataArray.sort((a, b) => colSortFunction(a, b));
            } else {
                tableBody.addClass(descSortColClass);
                tableBody.removeClass(ascSortColClass);
                dataArray.sort((a, b) => - colSortFunction(a, b));
            }
            tableFillFunction();
        });
    });
}

function getSpinner() {
    var result = $(document.createElement("div"));

    result.addClass('d-flex');
    result.addClass('justify-content-center');
    result.html('<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>')

    return result;
}

var geolocContent = [];
var sparqlCoverContent = [];
var vocabRelatedContent = [];
var datasetDescriptionContent = [];
var dataQualityContent = [];
var datasetPopulationsContent = [];
var frameworkInformationContent = [];
var allContent = [];

function refresh() {
    mainContentColWidth = $('#mainContentCol').width();
    clear();
    whiteListFill();
    allContent.forEach((content, i) => { content.fill() });
}

function clear() {
    allContent.forEach((content, i) => { content.clear() });
}

function redrawGeolocContent() {
    geolocContent.forEach(content => content.redraw());
}

function redrawSparqlCoverContent() {
    sparqlCoverContent.forEach(content => content.redraw());
}

function redrawVocabRelatedContent() {
    vocabRelatedContent.forEach(content => content.redraw());
}

function redrawDatasetDescriptionContent() {
    datasetDescriptionContent.forEach(content => content.redraw());
}

function redrawDataQualityContent() {
    dataQualityContent.forEach(content => content.redraw());
}

function redrawDatasetPopulationsContent() {
    datasetPopulationsContent.forEach(content => content.redraw());
}

function redrawFrameworkInformationContent() {
    frameworkInformationContent.forEach(content => content.redraw());
}

function redrawCharts() {
    mainContentColWidth = $('#mainContentCol').width();
    allContent.forEach((content, i) => { content.redraw() });
}

function generateGraphValueFilterClause() {
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

function addBlacklistedEndpoint(endpointIndex) {
    urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(blackListedEndpointParameter);
    var blackistedEndpointIndexSet = new Set(blackistedEndpointIndexList);
    blackistedEndpointIndexSet.add(endpointIndex);
    blacklistedEndpointList.push(endpointList[endpointIndex]);
    blackistedEndpointIndexList = [...blackistedEndpointIndexSet];
    var jsonBlacklist = encodeURI(JSON.stringify(blackistedEndpointIndexList));
    urlParams.append(blackListedEndpointParameter, jsonBlacklist);
    history.pushState(null, null, '?' + urlParams.toString());
    refresh();
}

function removeBlacklistedEndpoint(endpointIndex) {
    urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(blackListedEndpointParameter);
    var blackistedEndpointIndexSet = new Set(blackistedEndpointIndexList);
    var blacklistEndpointSet = new Set(blacklistedEndpointList);
    blacklistEndpointSet.delete(endpointList[endpointIndex]);
    blacklistedEndpointList = [...blacklistEndpointSet]
    blackistedEndpointIndexSet.delete(endpointIndex);
    blackistedEndpointIndexList = [...blackistedEndpointIndexSet];
    var jsonBlacklist = encodeURI(JSON.stringify(blackistedEndpointIndexList));
    urlParams.append(blackListedEndpointParameter, jsonBlacklist);
    history.pushState(null, null, '?' + urlParams.toString());
    refresh();
}

function changeGraphSetIndex(index) {
    urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(graphSetIndexParameter);
    urlParams.append(graphSetIndexParameter, index);
    history.pushState(null, null, '?' + urlParams.toString());
    graphList = graphLists[index].graphs;
    var graphListEndpointKey = md5(''.concat(graphList));
    whiteListFile.then(whiteList => {
        filteredEndpointWhiteList = whiteList[graphListEndpointKey]
        filteredEndpointWhiteList.forEach((endpointUrl) => {
            endpointList.push(endpointUrl);
        });

        refresh();
        redrawCharts();
    })
}

function setButtonAsToggleCollapse(buttonId, tableId) {
    $('#' + buttonId).on('click', function () {
        if ($('#' + tableId).hasClass("show")) {
            collapseHtml(tableId);
        } else {
            unCollapseHtml(tableId);
        }
    });
}

function whiteListFill() {
    var tableBody = $('#whiteListTableBody');

    tableBody.empty();
    endpointList = [];
    blacklistedEndpointList = [];
    blackistedEndpointIndexList = [];

    endpointList.sort((a, b) => a.localeCompare(b))
    endpointList.forEach((item, i) => {
        tableBody.append(generateCheckEndpointLine(item, i));
    });

    function generateCheckEndpointLine(endpointUrl, i) {
        var endpointCheckId = 'endpoint' + i;
        var endpointRow = $(document.createElement('tr'));
        var endpointCell = $(document.createElement('td'));
        var endpointCheckCell = $(document.createElement('td'));
        var endpointCheck = $(document.createElement('input'));
        var endpointLabel = $(document.createElement('label'));
        endpointLabel.addClass('form-check-label');
        endpointLabel.attr('for', endpointCheckId);
        endpointLabel.text(endpointUrl)
        endpointCell.append(endpointLabel);
        endpointCheck.attr('id', endpointCheckId);
        endpointCheck.addClass('form-check-input');
        endpointCheck.attr('type', 'checkbox');
        if (blackistedEndpointIndexList.includes(i)) {
            endpointCheck.prop('checked', false);
        } else {
            endpointCheck.prop('checked', true);
        }
        endpointCheck.val(i);
        endpointCheckCell.append(endpointCheck);

        endpointCheck.change(() => {
            if (endpointCheck.prop('checked')) {
                removeBlacklistedEndpoint(i);
            } else {
                addBlacklistedEndpoint(i);
            }
        });

        endpointRow.append(endpointCell);
        endpointRow.append(endpointCheckCell);
        return endpointRow;
    }
}
setButtonAsToggleCollapse('whiteListShowButton', 'whiteListTable');


var geolocChart = new KartoChart({
    chartObject: L.map('map').setView([24.5271348225978, 62.22656250000001], 2),
    fillFunction: function () {
        var endpointGeolocTableBody = $('#endpointGeolocTableBody');
        endpointGeolocTableBody.empty();

        $('#map').width(mainContentColWidth);
        this.chartObject.invalidateSize();

        geolocDataFile.then(geolocData => {
            var graphEndpointGeolocData = geolocData.filter(endpointGeoloc => ((!(new Set(blackistedEndpointIndexList)).has(endpointGeoloc.endpoint)) && (new Set(filteredEndpointWhiteList).has(endpointGeoloc.endpoint))))

            function addLineToEndpointGeolocTable(item) {
                var endpointRow = $(document.createElement('tr'));
                var endpointCell = $(document.createElement('td'));
                endpointCell.text(item.endpoint);
                var latCell = $(document.createElement('td'));
                latCell.text(item.lat);
                var lonCell = $(document.createElement('td'));
                lonCell.text(item.lon);
                var countryCell = $(document.createElement('td'));
                countryCell.text(item.country);
                var regionCell = $(document.createElement('td'));
                regionCell.text(item.region);
                var cityCell = $(document.createElement('td'));
                cityCell.text(item.city);
                var orgCell = $(document.createElement('td'));
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
                var markerIcon = greenIcon;

                var endpointMarker = L.marker([endpointGeoloc.lat, endpointGeoloc.lon], { icon: markerIcon });
                endpointMarker.on('click', clickEvent => {
                    endpointMarker.bindPopup(endpointGeoloc.popupHTML).openPopup();
                });
                endpointMarker.addTo(this.layerGroup);
            });
            endpointGeolocTableFill();
        })
    },
    redrawFunction: function () {
        $('#map').width(mainContentColWidth);
        this.chartObject.invalidateSize();
        this.chartObject.setView([24.5271348225978, 62.22656250000001], 2);
    },
    clearFunction: function () {
        geolocChart.layerGroup.clearLayers();
    }
});
setButtonAsToggleCollapse('endpointGeolocDetails', 'endpointGeolocDatatable');

var sparqlFeaturesContent = new KartoChart({
    fillFunction: function () {
        var featuresDescriptionMap = new Map();
        var featuresQueryMap = new Map();
        sparqlFeatureDesc.forEach(featureDesc => {
            featuresDescriptionMap.set(featureDesc.feature, featureDesc.description);
            featuresQueryMap.set(featureDesc.feature, featureDesc.query);
        });

        sparqlFeaturesDataFile.then(sparqlFeaturesData => {

            sparqlFeaturesDataArray = sparqlFeaturesData.filter(endpointItem => ((!(new Set(blackistedEndpointIndexList)).has(endpointItem.endpoint)) && (new Set(filteredEndpointWhiteList).has(endpointItem.endpoint))));

            sparqlFeaturesDataArray.sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            });
            function fillFeaturesTable() {
                var tableBody = $('#SPARQLFeaturesTableBody');
                tableBody.empty();
                sparqlFeaturesDataArray.forEach((item, i) => {
                    var endpoint = item.endpoint;
                    var endpointRow = $(document.createElement("tr"));
                    var endpointCell = $(document.createElement("td"));
                    var featuresCell = $(document.createElement("td"));
                    item.features.forEach(feature => {
                        var featureAloneCell = $(document.createElement("p"));
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

            
            fillFeaturesTable();
        })
    }
});
setButtonAsToggleCollapse('tableSPARQLFeaturesDetails', 'SPARQLFeaturesDatatable');

var sparqlCoverCharts = new KartoChart({
    chartObject: { 'sparql10Chart': echarts.init(document.getElementById('SPARQL10histo')), 'sparql11Chart': echarts.init(document.getElementById('SPARQL11histo')), 'sparqlChart': echarts.init(document.getElementById('SPARQLCoverageHisto')) },
    option: { sparql10ChartOption: {}, sparql11ChartOption: {}, sparqlChartOption: {} },
    fillFunction: function () {
        // Create an histogram of the SPARQLES rules passed by endpoint.
        sparqlCoverCountFile.then(sparqlCoverCount => {
            var sparqlCoverageCountData = sparqlCoverCount.filter(endpointCoverage => ((!(new Set(blackistedEndpointIndexList)).has(endpointCoverage.endpoint)) && (new Set(filteredEndpointWhiteList).has(endpointCoverage.endpoint))));

            var maxSparql10 = 24;
            var maxSparql11 = 19;
            var maxSparqlTotal = maxSparql10 + maxSparql11;

            var chart10ValueMap = new Map();
            var chart11ValueMap = new Map();
            var chartSPARQLValueMap = new Map();

            for (var i = -1; i < 10; i++) {
                chart10ValueMap.set(i, 0);
                chart11ValueMap.set(i, 0);
                chartSPARQLValueMap.set(i, 0);
            }
            var sparql10Step = maxSparql10 / 10;
            var sparql11Step = maxSparql11 / 10;
            var sparqlTotalStep = maxSparqlTotal / 10;
            sparqlCoverageCountData.forEach((item) => {
                var itemBinSparql10 = -1;
                if (item.sparql10 > 0) {
                    itemBinSparql10 = Math.floor(item.sparql10 / sparql10Step);
                    if (itemBinSparql10 == 10) {
                        itemBinSparql10 = 9;
                    }
                }
                chart10ValueMap.set(itemBinSparql10, chart10ValueMap.get(itemBinSparql10) + 1);
                var itemBinSparql11 = -1;
                if (item.sparql11 > 0) {
                    itemBinSparql11 = Math.floor(item.sparql11 / sparql11Step);
                    if (itemBinSparql11 == 10) {
                        itemBinSparql11 = 9;
                    }
                }
                chart11ValueMap.set(itemBinSparql11, chart11ValueMap.get(itemBinSparql11) + 1);
                var itemBinSparqlTotal = -1;
                if (item.sparql11 > 0 || item.sparql10 > 0) {
                    var itemBinSparqlTotal = Math.floor(item.sparqlTotal / sparqlTotalStep);
                    if (itemBinSparqlTotal == 10) {
                        itemBinSparqlTotal = 9;
                    }
                }
                chartSPARQLValueMap.set(itemBinSparqlTotal, chartSPARQLValueMap.get(itemBinSparqlTotal) + 1);
            });

            var chart10DataMap = new Map();
            var chart11DataMap = new Map();
            var chartSPARQLDataMap = new Map();
            var categorySet = new Set();
            chart10ValueMap.forEach((binCount, itemBin, map) => {
                var categoryName = "[ " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
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
                var categoryName = "[ " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
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
                var categoryName = "[ " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
                if (itemBin == 0) {
                    categoryName = "] " + ((itemBin) * 10).toString() + "%, " + ((itemBin + 1) * 10).toString() + " % ]";
                }
                if (itemBin == -1) {
                    categoryName = "[ 0% ]";
                }
                categorySet.add(categoryName);
                chartSPARQLDataMap.set(categoryName, binCount);
            });
            var categories = ([...categorySet]).sort((a, b) => a.localeCompare(b));

            var sparql10Series = [];
            chart10DataMap.forEach((percentage, category, map) => {
                sparql10Series.push({
                    name: category,
                    type: 'bar',
                    data: [percentage],
                    showBackground: true,
                    label: {
                        show: true,
                        formatter: "{a}",
                        verticalAlign: "bottom",
                        position: "top"
                    }
                })
            });
            var sparql11Series = [];
            chart11DataMap.forEach((percentage, category, map) => {
                sparql11Series.push({
                    name: category,
                    type: 'bar',
                    data: [percentage],
                    showBackground: true,
                    label: {
                        show: true,
                        formatter: "{a}",
                        verticalAlign: "bottom",
                        position: "top"
                    }
                })
            });
            var sparqlCategorySeries = [];
            chartSPARQLDataMap.forEach((percentage, category, map) => {
                sparqlCategorySeries.push({
                    name: category,
                    type: 'bar',
                    data: [percentage],
                    showBackground: true,
                    label: {
                        show: true,
                        formatter: "{a}",
                        verticalAlign: "bottom",
                        position: "top"
                    }
                })
            });

            this.option.sparql10ChartOption = {
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
            this.option.sparql11ChartOption = {
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
                    //                    data: [...categories],
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
            this.option.sparqlChartOption = {
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

            this.redraw();

            sparqlCoverageCountData.sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            });

            function fillTestTable() {
                var tableBody = $('#SPARQLFeaturesCountTableBody');
                tableBody.empty();
                sparqlCoverageCountData.forEach((item, i) => {
                    var endpoint = item.endpoint;
                    var sparql10 = precise((item.sparql10 / maxSparql10) * 100, 3);
                    var sparql11 = precise((item.sparql11 / maxSparql11) * 100, 3);
                    var endpointRow = $(document.createElement("tr"));
                    var endpointCell = $(document.createElement("td"));
                    var sparql10Cell = $(document.createElement("td"));
                    var sparql11Cell = $(document.createElement("td"));
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
        })
    },
    redrawFunction: function () {
        $('#SPARQL10histo').width(mainContentColWidth * .48);
        $('#SPARQL11histo').width(mainContentColWidth * .48);
        $('#SPARQL10histo').height(500);
        $('#SPARQL11histo').height(500);
        $('#SPARQLCoverageHisto').width(mainContentColWidth);

        $(this.chartObject.sparql10Chart.getDom()).removeClass('placeholder');
        this.chartObject.sparql10Chart.setOption(this.option.sparql10ChartOption, true);
        this.chartObject.sparql10Chart.resize();
        $(this.chartObject.sparql11Chart.getDom()).removeClass('placeholder');
        this.chartObject.sparql11Chart.setOption(this.option.sparql11ChartOption, true);
        this.chartObject.sparql11Chart.resize();
        $(this.chartObject.sparqlChart.getDom()).removeClass('placeholder');
        this.chartObject.sparqlChart.setOption(this.option.sparqlChartOption, true);
        this.chartObject.sparqlChart.resize();
    },
    clearFunction: function () {
        this.chartObject.sparql10Chart.setOption({ series: [] }, true);
        $(this.chartObject.sparql10Chart.getDom()).addClass('placeholder');
        this.chartObject.sparql11Chart.setOption({ series: [] }, true);
        $(this.chartObject.sparql11Chart.getDom()).addClass('placeholder');
        this.chartObject.sparqlChart.setOption({ series: [] }, true);
        $(this.chartObject.sparqlChart.getDom()).addClass('placeholder');
    }
});
setButtonAsToggleCollapse('tableSPARQLFeaturesStatsDetails', 'SPARQLFeaturesCountDatatable');

var vocabRelatedChart = new KartoChart({
    chartObject: {
        vocabChart: echarts.init(document.getElementById('vocabs')),
        rawVocabChart: echarts.init(document.getElementById('rawVocabs')),
        keywordChart: echarts.init(document.getElementById('endpointKeywords'))
    },
    option: {
        vocabOption: {},
        rawVocabOption: {},
        keywordOption: {}
    },
    sparqlesVocabulariesQuery: '',
    fillFunction: function () {

        // Create an force graph with the graph linked by co-ocurrence of vocabularies

        this.hideEndpointVocabularyContent = function () {
            this.hideEndpointRawVocabularyContent();
            this.hideEndpointKnownVocabularyContent();
        }
        this.hideEndpointRawVocabularyContent = function () {
            this.chartObject.rawVocabChart.setOption({ series: [] }, true);
            collapseHtml('rawVocabs');
        }
        this.hideEndpointKnownVocabularyContent = function () {
            this.chartObject.vocabChart.setOption({ series: [] }, true);
            collapseHtml('vocabs');
            collapseHtml('knowVocabEndpointMeasureRow');
            collapseHtml('knowVocabEndpointTable');
        }
        this.hideEndpointKeywordContent = function () {
            this.chartObject.keywordChart.setOption({ series: [] }, true);
            collapseHtml('endpointKeywords');
            collapseHtml('endpointKeywordsDetails');
            $('#endpointKeywordsTableBody').empty();
        }
        this.showEndpointVocabularyContent = function () {
            this.show();
            this.showEndpointKnownVocabularyContent();
            this.showEndpointRawVocabularyContent();
        }
        this.showEndpointRawVocabularyContent = function () {
            this.show();
            unCollapseHtml('rawVocabs');
        }
        this.showEndpointKnownVocabularyContent = function () {
            this.show();
            unCollapseHtml('knowVocabEndpointMeasureRow');
            unCollapseHtml('knowVocabEndpointTable');
            unCollapseHtml('vocabs');
        }
        this.showEndpointKeywordContent = function () {
            this.show();
            unCollapseHtml('endpointKeywords');
            unCollapseHtml('endpointKeywordsDetails');
        }

        var endpointSet = new Set();
        var vocabSet = new Set();
        var rawVocabSet = new Set();
        var rawGatherVocab = new Map();
        vocabEndpointDataFile.then(vocabEndpointData => {
            vocabEndpointData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
            ).forEach((item, i) => {
                var endpoint = item.endpoint;
                var vocabularies = item.vocabularies;
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

            var jsonRawVocabNodes = new Set();
            var jsonRawVocabLinks = new Set();

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
            if (jsonRawVocabNodes.size > 0 && jsonRawVocabLinks.size > 0) {
                this.showEndpointRawVocabularyContent();

                this.option.rawVocabOption = getForceGraphOption('Endpoints and vocabularies without filtering', ["Vocabulary", "Endpoint"], [...jsonRawVocabNodes], [...jsonRawVocabLinks]);
                this.chartObject.rawVocabChart.setOption(this.option.rawVocabOption, true);
            } else {
                this.hideEndpointRawVocabularyContent();
            }

            var gatherVocab = new Map();
            // Filtering according to ontology repositories
            knownVocabDataFile.then(knownVocabData => {
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
                var jsonVocabLinks = new Set();
                var jsonVocabNodes = new Set();

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
                    this.showEndpointKnownVocabularyContent();

                    var endpointKnownVocabulariestableBody = $('#endpointKnownVocabsTableBody');
                    var sumknowVocabMeasure = 0;
                    var knowVocabsData = [];
                    gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
                        var measure = (endpointVocabs.size / rawGatherVocab.get(endpointUrl).length);
                        knowVocabsData.push({ 'endpoint': endpointUrl, 'measure': measure })

                        endpointVocabs.forEach((vocab, i) => {
                            jsonVocabLinks.add({ source: endpointUrl, target: vocab });
                        });
                    });


                    this.option.vocabOption = getForceGraphOption('Endpoints and vocabularies with filtering*', ["Vocabulary", "Endpoint"], [...jsonVocabNodes], [...jsonVocabLinks]);
                    this.chartObject.vocabChart.setOption(this.option.vocabOption, true);

                    // Measure Table
                    function endpointKnowVocabsMeasureFill() {
                        var tableContent = knowVocabsData.map(item => [item.endpoint, item.measure])
                        knowVocabsData.forEach((item, i) => {
                            var endpointUrl = item.endpoint;
                            var measure = item.measure;
                            sumknowVocabMeasure += measure;
                            var endpointRow = $(document.createElement("tr"));
                            var endpointCell = $(document.createElement('td'));
                            endpointCell.text(endpointUrl);
                            endpointRow.append(endpointCell);
                            var knownVocabMeasureCell = $(document.createElement('td'));
                            knownVocabMeasureCell.text(precise(measure * 100, 3) + "%");
                            endpointRow.append(knownVocabMeasureCell);
                            endpointKnownVocabulariestableBody.append(endpointRow);
                        });
                    };
                    endpointKnowVocabsMeasureFill();
                    $("#knowVocabEndpointTable").DataTable()

                    // computation of the know vocabularies measure
                    var knownVocabulariesMeasureHtml = $('#KnownVocabulariesMeasure');
                    knownVocabulariesMeasureHtml.text(precise((sumknowVocabMeasure / endpointSet.size) * 100, 3) + "%");
                } else {
                    this.hideEndpointKnownVocabularyContent();
                }

                var jsonKeywordLinks = new Set();
                var jsonKeywordNodes = new Set();

                var keywordSet = new Set();
                var vocabKeywordMap = new Map();
                var endpointKeywordsMap = new Map();
                vocabKeywordDataFile.then(vocabKeywordData => {
                    vocabKeywordData.forEach(item => {
                        vocabKeywordMap.set(item.vocabulary, item.keywords);

                        item.keywords.forEach(keyword => {
                            keywordSet.add(keyword);
                        })
                    });

                    gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
                        endpointVocabs.forEach((endpointVocab, i) => {
                            var vocabKeywords = vocabKeywordMap.get(endpointVocab);
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
                        this.showEndpointKeywordContent();

                        this.option.keywordOption = getForceGraphOption('Endpoints and keywords', ["Keyword", "Endpoint"], [...jsonKeywordNodes], [...jsonKeywordLinks]);
                        this.chartObject.keywordChart.setOption(this.option.keywordOption, true);

                        var endpointKeywordsData = [];
                        endpointKeywordsMap.forEach((keywords, endpoint, map) => {
                            endpointKeywordsData.push({ endpoint: endpoint, keywords: keywords })
                        });

                        // Endpoint and vocabulary keywords table
                        var endpointKeywordsTableBody = $('#endpointKeywordsTableBody');
                        function endpointKeywordsTableFill() {
                            endpointKeywordsTableBody.empty();
                            endpointKeywordsData.forEach(endpointKeywordsItem => {
                                var endpoint = endpointKeywordsItem.endpoint;
                                var keywords = endpointKeywordsItem.keywords;
                                var endpointRow = $(document.createElement("tr"));
                                var endpointCell = $(document.createElement("td"));
                                endpointCell.text(endpoint);
                                var keywordsCell = $(document.createElement("td"));
                                var keywordsText = "";
                                var keywordCount = 0;
                                var keywordsArray = [...keywords].sort((a, b) => a.localeCompare(b))
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
                        this.hideEndpointKeywordContent();
                    }


                })
            })
        })
    },
    hideFunction: function () {
        collapseHtml('vocabRelatedContent');
        this.hideEndpointVocabularyContent();
        this.hideEndpointKeywordContent();
    },
    showFunction: function () {
        unCollapseHtml('vocabRelatedContent')
        this.redraw()
    },
    redrawFunction: function () {
        $('#vocabs').width(mainContentColWidth);
        $('#rawVocabs').width(mainContentColWidth);
        $('#endpointKeywords').width(mainContentColWidth);
        this.chartObject.vocabChart.setOption(this.option.vocabOption, true);
        this.chartObject.vocabChart.resize();
        this.chartObject.rawVocabChart.setOption(this.option.rawVocabOption, true);
        this.chartObject.rawVocabChart.resize();
        this.chartObject.keywordChart.setOption(this.option.keywordOption, true);
        this.chartObject.keywordChart.resize();
        var codeQuery1Div = $(document.createElement('code')).text(this.sparqlesVocabulariesQuery);
        $('#endpointVocabularyQueryCell').empty()
        $('#endpointVocabularyQueryCell').append(codeQuery1Div)
        var codeQuery2Div = $(document.createElement('code')).text('SELECT DISTINCT ?endpointUrl ?vocabulary { SERVICE <http://prod-dekalog.inria.fr/sparql> { GRAPH ?g { { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } ?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?endpoint . ?base <http://rdfs.org/ns/void#vocabulary> ?vocabulary . FILTER(isIri(?vocabulary)) } ' + generateGraphValueFilterClause() + ' } SERVICE <https://lov.linkeddata.es/dataset/lov/sparql> { GRAPH <https://lov.linkeddata.es/dataset/lov> { ?vocabURI a <http://purl.org/vocommons/voaf#Vocabulary> . } } } GROUP BY ?endpointUrl ?vocabulary');
        $('#endpointKeywordQueryCell').empty();
        $('#endpointKeywordQueryCell').append(codeQuery2Div);
    },
    clearFunction: function () {
        this.chartObject.vocabChart.setOption({ series: [] }, true);
        this.chartObject.rawVocabChart.setOption({ series: [] }, true);
        this.chartObject.keywordChart.setOption({ series: [] }, true);
        $('#endpointVocabularyQueryCell').empty()
        $('#endpointKeywordQueryCell').empty();
    }
});
setButtonAsToggleCollapse('KnownVocabulariesDetails', 'knowVocabEndpointDatatable');
setButtonAsToggleCollapse('endpointKeywordsDetails', 'endpointKeywordsDatatable');

var tripleChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('tripleScatter')),
    option: {},
    fillFunction: function () {
        // Scatter plot of the number of triples through time
        tripleCountDataFile.then(tripleCountData => {
            var endpointDataSerieMap = new Map();
            tripleCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            ).forEach((itemResult, i) => {
                var endpointUrl = itemResult.endpoint;
                endpointDataSerieMap.set(endpointUrl, []);

            });
            var graphSet = new Set();
            tripleCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            ).forEach((itemResult, i) => {
                var graph = itemResult.graph;
                var endpointUrl = itemResult.endpoint;
                var triples = itemResult.triples;
                graphSet.add(graph);
                endpointDataSerieMap.get(endpointUrl).push([graph, triples])
            });

            if (endpointDataSerieMap.size > 0) {
                this.show();

                var triplesSeries = getCategoryScatterDataSeriesFromMap(endpointDataSerieMap);
                this.option = getCategoryScatterOption("Size of the datasets", [...graphSet].sort((a, b) => a.localeCompare(b)), triplesSeries);
                this.chartObject.setOption(this.option, true);
                this.chartObject.setOption({ xAxis: { axisLabel: { rotate: 27 } } });
                this.option = this.chartObject.getOption();
            } else {
                this.hide();
            }
        });
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
        $('#tripleScatter').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var classNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('classScatter')),
    option: {},
    fillFunction: function () {
        // Scatter plot of the number of classes through time
        classCountDataFile.then(classCountData => {
            var endpointDataSerieMap = new Map();
            var graphSet = new Set();
            classCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            ).forEach(item => {
                var graph = item.graph;
                var endpointUrl = item.endpoint;
                var triples = item.classes;
                graphSet.add(graph);
                if (endpointDataSerieMap.get(endpointUrl) == undefined) {
                    endpointDataSerieMap.set(endpointUrl, [])
                }
                endpointDataSerieMap.get(endpointUrl).push([graph, triples])
            });
            if (endpointDataSerieMap.size > 0) {
                this.show();

                var classesSeries = getCategoryScatterDataSeriesFromMap(endpointDataSerieMap);
                this.option = getCategoryScatterOption("Number of classes in the datasets", [...graphSet].sort((a, b) => a.localeCompare(b)), classesSeries);
                this.chartObject.setOption(this.option, true);
                this.chartObject.setOption({ xAxis: { axisLabel: { rotate: 27 } } });
                this.option = this.chartObject.getOption();
            } else {
                this.hide();
            }
        })
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('classScatter');
        //collapseHtml('tableClassesDetails');
    },
    showFunction: function () {
        unCollapseHtml('classScatter');
        //unCollapseHtml('tableClassesDetails');
    },
    redrawFunction: function () {
        $('#classScatter').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var propertyNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('propertyScatter')),
    option: {},
    fillFunction: function () {
        // scatter plot of the number of properties through time
        propertyCountDataFile.then(propertyCountData => {
            var endpointDataSerieMap = new Map();
            propertyCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint)) && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)).forEach((itemResult, i) => {
                    var endpointUrl = itemResult.endpoint;

                    if (!blacklistedEndpointList.includes(endpointUrl)) {
                        endpointDataSerieMap.set(endpointUrl, []);
                    }
                });
            var endpointGraphPropertiesData = [];
            var graphSet = new Set();
            propertyCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint)) && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)).forEach((itemResult, i) => {
                    var graph = itemResult.graph;
                    var endpointUrl = itemResult.endpoint;
                    var properties = itemResult.properties;
                    graphSet.add(graph);
                    endpointDataSerieMap.get(endpointUrl).push([graph, properties])
                    endpointGraphPropertiesData.push({ endpoint: endpointUrl, graph: graph, properties: properties })
                });

            if (endpointDataSerieMap.size > 0) {
                this.show();
                var propertiesSeries = getCategoryScatterDataSeriesFromMap(endpointDataSerieMap);

                this.option = getCategoryScatterOption("Number of properties in the datasets", [...graphSet].sort((a, b) => a.localeCompare(b)), propertiesSeries);
                this.chartObject.setOption(this.option, true);
                this.chartObject.setOption({ xAxis: { axisLabel: { rotate: 27 } } });
                this.option = this.chartObject.getOption();
            } else {
                this.hide();
            }

        });
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('propertyScatter');
        //collapseHtml('tablePropertiesDetails');
    },
    showFunction: function () {
        unCollapseHtml('propertyScatter');
        //unCollapseHtml('tablePropertiesDetails');
    },
    redrawFunction: function () {
        $('#propertyScatter').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var categoryTestNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('testCategoryScatter')),
    option: {},
    fillFunction: function () {
        // Number of tests passed by test categories
        categoryTestCountDataFile.then(categoryTestCountData => {
            var endpointDataSerieMap = new Map();

            categoryTestCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            )
                .forEach(item => {
                    var category = item.category;
                    endpointDataSerieMap.set(category, new Map());

                })
            categoryTestCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            ).forEach(item => {
                var category = item.category;
                var count = item.count;
                var endpoint = item.endpoint;
                var graph = item.graph;

                if (endpointDataSerieMap.get(category).get(graph) == undefined) {
                    endpointDataSerieMap.get(category).set(graph, new Map());
                }
                endpointDataSerieMap.get(category).get(graph).set(endpoint, count);

            })
            if (endpointDataSerieMap.size > 0) {
                this.show();

                var triplesSeries = [];
                var categoryXAxisData = [];
                endpointDataSerieMap.forEach((gemap, category, map1) => {
                    var categoryName = category.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/", "").replace("/", "").replace("check", "Quality").replace('computed', "Computed").replace('asserted', "Asserted").replace("sportal", 'SPORTAL');
                    categoryXAxisData.push(categoryName);
                    var dataCategory = [];
                    gemap.forEach((endpointMap, graph, map2) => {
                        var totalEndpointGraph = 0;
                        endpointMap.forEach((count, endpoint, map3) => {
                            totalEndpointGraph = totalEndpointGraph + Number.parseInt(count);
                        });
                        var numberOfEndpoint = endpointMap.size;
                        var avgEndpointGraph = precise(totalEndpointGraph / numberOfEndpoint);
                        var percentageAvrEndpointCategory = avgEndpointGraph;
                        if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/")) {
                            percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 8) * 100);
                        } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/")) {
                            percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 4) * 100);
                        } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/")) {
                            percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 10) * 100);
                        } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/")) {
                            percentageAvrEndpointCategory = (precise(percentageAvrEndpointCategory / 23) * 100);
                        } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/")) {
                            percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 25) * 100);
                        } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/")) {
                            percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 20) * 100);
                        }

                        dataCategory.push([graph, percentageAvrEndpointCategory]);
                    });

                    dataCategory.sort((a, b) => a[0].localeCompare(b[0]));
                    var chartSerie = {
                        name: categoryName,
                        label: {
                            show: true,
                            formatter: "{a}"
                        },
                        symbolSize: 5,
                        data: dataCategory,
                        type: 'bar'
                    };
                    triplesSeries.push(chartSerie);
                });

                var categoriesArray = categoryXAxisData.sort((a, b) => a.localeCompare(b));
                triplesSeries.sort((a, b) => a.name.localeCompare(b.name))

                this.option = {
                    title: {
                        left: 'center',
                        text: "Proportion of tests passed by category",
                    },
                    xAxis: {
                        type: 'category',
                        //    data:categoriesArray
                    },
                    yAxis: {
                        max: 100
                    },
                    series: triplesSeries,
                    tooltip: {
                        show: 'true'
                    }
                };

                this.chartObject.setOption(this.option, true);
            } else {
                this.hide();
            }
        });
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('testCategoryScatter');
    },
    showFunction: function () {
        unCollapseHtml('testCategoryScatter');
    },
    redrawFunction: function () {
        $('#testCategoryScatter').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var totalCategoryTestNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('totalTestCategoryScatter')),
    option: {},
    fillFunction: function () {
        // Number of tests passed by test categories
        totalCategoryTestCountFile.then(totalCategoryTestCountData => {
            var endpointDataSerieMap = new Map();
            totalCategoryTestCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            ).forEach(item => {
                var category = item.category;

                endpointDataSerieMap.set(category, new Map());
            })
            totalCategoryTestCountData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            ).forEach(item => {
                var category = item.category;
                var count = item.count;
                var endpoint = item.endpoint;

                endpointDataSerieMap.get(category).set(endpoint, count);
            })

            if (endpointDataSerieMap.size > 0) {
                this.show();

                var triplesSeries = [];
                var categoryXAxisData = [];
                endpointDataSerieMap.forEach((endpointMap, category, map1) => {
                    var categoryName = category.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/", "").replace("/", "").replace("check", "Quality").replace('computed', "Computed").replace('asserted', "Asserted").replace("sportal", 'SPORTAL');
                    categoryXAxisData.push(categoryName);
                    var dataCategory = [];
                    var totalEndpointGraph = 0;
                    endpointMap.forEach((count, endpoint, map3) => {
                        totalEndpointGraph = totalEndpointGraph + Number.parseInt(count);
                    });
                    var numberOfEndpoint = endpointMap.size;
                    var avgEndpointGraph = precise(totalEndpointGraph / numberOfEndpoint);
                    var percentageAvrEndpointCategory = avgEndpointGraph;
                    if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 8) * 100);
                    } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 4) * 100);
                    } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 10) * 100);
                    } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/")) {
                        percentageAvrEndpointCategory = (precise(percentageAvrEndpointCategory / 23) * 100);
                    } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 25) * 100);
                    } else if (category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 20) * 100);
                    }

                    dataCategory.push(percentageAvrEndpointCategory);
                    var chartSerie = {
                        name: categoryName,
                        label: {
                            show: true,
                            formatter: "{a}"
                        },
                        symbolSize: 5,
                        data: dataCategory,
                        type: 'bar'
                    };
                    triplesSeries.push(chartSerie);
                });

                triplesSeries.sort((a, b) => a.name.localeCompare(b.name))

                this.option = {
                    title: {
                        left: 'center',
                        text: "Proportion of tests passed by category for all runs",
                    },
                    xAxis: {
                        show: false,
                        type: 'category',
                        //    data:categoriesArray
                    },
                    yAxis: {
                        max: 100
                    },
                    series: triplesSeries,
                    tooltip: {
                        show: 'true'
                    }
                };

                this.chartObject.setOption(this.option, true);
            } else {
                this.hide();
            }
        });
    },
    hideFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        collapseHtml('totalTestCategoryScatter');
    },
    showFunction: function () {
        unCollapseHtml('totalTestCategoryScatter');
    },
    redrawFunction: function () {
        $('#totalTestCategoryScatter').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var testTableContent = new KartoChart({
    fillFunction: function () {
        endpointTestsDataFile.then(endpointTestsData => {
            var appliedTestMap = new Map();
            endpointTestsData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)
            ).forEach((item, i) => {
                var endpointUrl = item.endpoint;
                var rule = item.activity;

                if (appliedTestMap.get(endpointUrl) == undefined) {
                    appliedTestMap.set(endpointUrl, []);
                }
                appliedTestMap.get(endpointUrl).push(rule);
            });

            var appliedTestData = [];
            appliedTestMap.forEach((rules, endpoint, map) => {
                rules.sort((a, b) => a.localeCompare(b))
                appliedTestData.push({ 'endpoint': endpoint, 'rules': rules })
            });

            appliedTestData.sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            });

            function fillTestTable() {
                var tableBody = $('#rulesTableBody');
                tableBody.empty();
                appliedTestData.forEach((item, i) => {
                    var endpoint = item.endpoint;
                    var rules = item.rules;
                    var endpointRow = $(document.createElement("tr"));
                    var endpointCell = $(document.createElement("td"));
                    endpointCell.text(endpoint);
                    var rulesCell = $(document.createElement("td"));
                    var ruleCol = $(document.createElement("div"));
                    ruleCol.addClass("col");
                    rules.forEach((item, i) => {
                        var ruleLine = $(document.createElement("div"));
                        ruleLine.addClass("row")
                        ruleLine.addClass("border-top")
                        ruleLine.addClass("border-bottom")
                        ruleLine.text(item);
                        ruleCol.append(ruleLine);
                    });
                    rulesCell.append(ruleCol)
                    endpointRow.append(endpointCell);
                    endpointRow.append(rulesCell);
                    tableBody.append(endpointRow);
                });
                $("#rulesTable").DataTable()
            }

            fillTestTable();
        });
    },
    clearFunction: function () {
        $('#rulesTableBody').empty();
    }
});
setButtonAsToggleCollapse('tableRuleDetails', 'rulesDatatable');

var totalRuntimeChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('totalRuntimeScatter')),
    option: {},
    fillFunction: function () {
        var runtimeDataSerie = []
        totalRuntimeDataFile.then(jsonResponse => {
            var graphSet = new Set();
            jsonResponse.filter(item => (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)).forEach((itemResult, i) => {
                var graph = itemResult.graph;
                var start = parseDate(itemResult.start, 'DD-MM-YYYYTHH:mm:ss');
                var end = parseDate(itemResult.end, 'DD-MM-YYYYTHH:mm:ss');
                var runtime = dayjs.duration(itemResult.runtime);
                graphSet.add(graph);
                runtimeDataSerie.push([graph, runtime])
            });
            var runtimeSerie = {
                name: "Runtime in seconds",
                label: 'show',
                symbolSize: 5,
                data: runtimeDataSerie.map(a => [a[0], a[1].asSeconds()]),
                tooltip: {
                    show: true,
                    formatter: function (value) {
                        var source = runtimeDataSerie.filter(a => value.value[0].localeCompare(a[0]) == 0)[0];
                        var runtime = source[1];

                        var tooltip = "";
                        if (runtime.days() > 0) {
                            tooltip += runtime.days() + " days ";
                        }
                        if (runtime.hours() > 0) {
                            tooltip += runtime.hours() + " hours ";
                        }
                        if (runtime.minutes() > 0) {
                            tooltip += runtime.minutes() + " minutes ";
                        }
                        if (runtime.seconds() > 0) {
                            tooltip += runtime.seconds() + " seconds ";
                        }
                        return tooltip;
                    }
                },
                type: 'scatter'
            };
            this.option = getCategoryScatterOption("Runtime of the framework for each run (in seconds)", [...graphSet].sort((a, b) => a.localeCompare(b)), [runtimeSerie]);
            this.chartObject.setOption(this.option, true);
        });
    },
    redrawFunction: function () {
        $('#totalRuntimeScatter').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
    }
});

var averageRuntimeChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('averageRuntimeScatter')),
    option: {},
    fillFunction: function () {
        var runtimeDataSerie = []
        averageRuntimeDataFile.then(jsonResponse => {

            var graphSet = new Set();
            jsonResponse.filter(item => (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined)).forEach((itemResult, i) => {
                var graph = itemResult.graph;
                var start = parseDate(itemResult.start.value, 'DD-MM-YYYYTHH:mm:ss');
                var end = parseDate(itemResult.end.value, 'DD-MM-YYYYTHH:mm:ss');
                var count = itemResult.count;
                var runtime = dayjs.duration(itemResult.runtime);
                var value = runtime.asSeconds() / count;

                graphSet.add(graph);
                runtimeDataSerie.push([graph, value])
            });

            var runtimeSerie = {
                name: "Average runtime in seconds",
                label: 'show',
                symbolSize: 5,
                data: runtimeDataSerie,
                tooltip: {
                    show: true,
                    formatter: function (value) {
                        var source = runtimeDataSerie.filter(a => value.value[0].localeCompare(a[0]) == 0)[0];
                        var graph = source[0];
                        var runtimeTotal = source[1];
                        var runtime = dayjs.duration(runtimeTotal.asMilliseconds() / numberEndpointMap.get(graph));

                        var tooltip = "";
                        if (runtime.days() > 0) {
                            tooltip += runtime.days() + " days ";
                        }
                        if (runtime.hours() > 0) {
                            tooltip += runtime.hours() + " hours ";
                        }
                        if (runtime.minutes() > 0) {
                            tooltip += runtime.minutes() + " minutes ";
                        }
                        if (runtime.seconds() > 0) {
                            tooltip += runtime.seconds() + " seconds ";
                        }
                        return tooltip;
                    }
                },
                type: 'scatter'
            };
            this.option = getCategoryScatterOption("Average runtime of the framework for each run (in seconds)", [...graphSet].sort((a, b) => a.localeCompare(b)), [runtimeSerie]);
            this.chartObject.setOption(this.option, true);

        });
    },
    redrawFunction: function () {
        $('#averageRuntimeScatter').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    hideFunction: function () {
        this.chartObject.setOption({}, true);
    }
});

var classAndPropertiesContent = new KartoChart({
    fillFunction: function () {
        classPropertyDataFile.then(classPropertyData => {
            knownVocabDataFile.then(knowVocabsData => {
                classPropertyData = classPropertyData.filter(classPropertyItem => (classPropertyItem.endpoints != undefined) && haveIntersection((new Set(classPropertyItem.endpoints)), (new Set(filteredEndpointWhiteList))) && !haveIntersection((new Set(classPropertyItem.endpoints)), (new Set(blackistedEndpointIndexList)))).filter(classPropertyItem => [...knowVocabsData].find(item => classPropertyItem.class.startsWith(item)))

                classPropertyData.sort((a, b) => a.class.localeCompare(b.class));

                function fillclassDescriptionTable() {
                    var tableBody = $("#classDescriptionTableBody");
                    tableBody.empty();
                    classPropertyData.forEach((countsItem, i) => {
                        var classRow = $(document.createElement("tr"))
                        var classCell = $(document.createElement("td"))
                        var classTriplesCell = $(document.createElement("td"))
                        var classClassesCell = $(document.createElement("td"))
                        var classPropertiesCell = $(document.createElement("td"))
                        var classDistinctSubjectsCell = $(document.createElement("td"))
                        var classDistinctObjectsCell = $(document.createElement("td"))
                        var endpointsCell = $(document.createElement("td"))

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

                // setTableHeaderSort("classPropertiesDescriptionTableBody", ["classPropertiesDescriptionTableClassHeader", "classPropertiesDescriptionTablePropertyHeader", "classPropertiesDescriptionTableTriplesHeader", "classPropertiesDescriptionTableDistinctSubjectsHeader", "classPropertiesDescriptionTableDistinctObjectsHeader", "classPropertiesDescriptionTableEndpointsHeader"], [(a, b) => a.class.localeCompare(b.class), (a, b) => b.property.localeCompare(a.property), (a, b) => b.triples - a.triples, (a, b) => b.distinctSubjects - a.distinctSubjects, (a, b) => b.distinctObjects - a.distinctObjects, (a, b) => b.endpoints.length - a.endpoints.length], fillClassPropertiesDescriptionTable, classPropertyData);

                function fillClassPropertiesDescriptionTable() {
                    var tableBody = $("#classPropertiesDescriptionTableBody");
                    tableBody.empty();
                    classPropertyData.forEach((countsItem, i) => {
                        var classRow = $(document.createElement("tr"))
                        var classCell = $(document.createElement("td"))
                        var classTriplesCell = $(document.createElement("td"))
                        var classPropertyCell = $(document.createElement("td"))
                        var classDistinctSubjectsCell = $(document.createElement("td"))
                        var classDistinctObjectsCell = $(document.createElement("td"))
                        var endpointsCell = $(document.createElement("td"))

                        classCell.text(countsItem.class);
                        classTriplesCell.text(countsItem.triples);
                        classPropertyCell.text(countsItem.property);
                        classDistinctSubjectsCell.text(countsItem.distinctSubjects);
                        classDistinctObjectsCell.text(countsItem.distinctObjects);
                        if (countsItem.endpoints != undefined) {
                            endpointsCell.text(countsItem.endpoints.length);
                        }

                        classRow.append(classCell);
                        classRow.append(classPropertyCell);
                        classRow.append(classTriplesCell);
                        classRow.append(classDistinctSubjectsCell);
                        classRow.append(classDistinctObjectsCell);
                        classRow.append(endpointsCell);
                        tableBody.append(classRow);
                    });
                    $("#classPropertiesDescriptionTable").DataTable()
                }
                fillClassPropertiesDescriptionTable()
            });

        })
    }
});
setButtonAsToggleCollapse('classDescriptionDetails', 'classDescriptionDatatable');
setButtonAsToggleCollapse('classPropertiesDescriptionDetails', 'classPropertiesDescriptionDatatable');

var descriptionElementChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('datasetdescriptionRadar')),
    option: {},
    fillFunction: function () {
        datasetDescriptionDataFile.then(datasetDescriptionData => {
            datasetDescriptionData = datasetDescriptionData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint))))
            datasetDescriptionData.sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            });

            // Table
            function fillTestTable() {
                var tableBody = $('#datasetDescriptionTableBody');
                tableBody.empty();
                datasetDescriptionData.forEach((item, i) => {
                    var endpoint = item.endpoint;
                    var who = item.who;
                    var license = item.license;
                    var time = item.time;
                    var source = item.source;
                    var endpointRow = $(document.createElement("tr"));
                    var endpointCell = $(document.createElement("td"));
                    endpointCell.text(endpoint);
                    var whoCell = $(document.createElement("td"));
                    whoCell.text(who);
                    var licenseCell = $(document.createElement("td"));
                    licenseCell.text(license);
                    var timeCell = $(document.createElement("td"));
                    timeCell.text(time);
                    var sourceCell = $(document.createElement("td"));
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
            var whoDataScore = 0;
            var licenseDataScore = 0;
            var timeDataScore = 0;
            var sourceDataScore = 0;

            var dataSeries = datasetDescriptionData.forEach(dataItem => {
                var who = dataItem.who;
                if (who) {
                    whoDataScore++;
                }
                var license = dataItem.license;
                if (license) {
                    licenseDataScore++;
                }
                var time = dataItem.time;
                if (time) {
                    timeDataScore++;
                }
                var source = dataItem.source;
                if (source) {
                    sourceDataScore++;
                }
            });


            var whoTrueDataSerie = {
                name: 'Description of author',
                type: 'bar',
                stack: 'who',
                colorBy: 'data',
                data: [
                    { value: whoDataScore, name: 'Presence of the description of creator/owner/contributor' },
                ]
            };
            if (whoDataScore > 0) {
                whoTrueDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints with author description'
                }
            };
            var whoFalseDataSerie = {
                name: 'Description of author',
                type: 'bar',
                stack: 'who',
                colorBy: 'data',
                data: [
                    { value: (datasetDescriptionData.length - whoDataScore), name: 'Absence of the description of creator/owner/contributor' },
                ]
            };
            if ((datasetDescriptionData.length - whoDataScore) > 0) {
                whoFalseDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints without author description'
                }
            };
            var licenseTrueDataSerie = {
                name: 'Licensing description',
                type: 'bar',
                stack: 'license',
                colorBy: 'data',
                data: [
                    { value: licenseDataScore, name: 'Presence of licensing information' },
                ]
            };
            if (licenseDataScore > 0) {
                licenseTrueDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints with licensing description'
                }
            }
            var licenseFalseDataSerie = {
                name: 'Licensing description',
                type: 'bar',
                stack: 'license',
                colorBy: 'data',
                data: [
                    { value: (datasetDescriptionData.length - licenseDataScore), name: 'Absence of licensing description' },
                ]
            };
            if ((datasetDescriptionData.length - licenseDataScore) > 0) {
                licenseFalseDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints without licensing description'
                }
            }
            var timeTrueDataSerie = {
                name: 'Time related description of the creation of the dataset',
                type: 'bar',
                stack: 'time',
                colorBy: 'data',
                data: [
                    { value: timeDataScore, name: 'Presence of time-related information' },
                ]
            };
            if (timeDataScore > 0) {
                timeTrueDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints with time-related description'
                }
            }
            var timeFalseDataSerie = {
                name: 'Time related description of creation of the dataset',
                type: 'bar',
                stack: 'time',
                colorBy: 'data',
                data: [
                    { value: (datasetDescriptionData.length - timeDataScore), name: 'Absence of time-related description' },
                ]
            };
            if ((datasetDescriptionData.length - timeDataScore) > 0) {
                timeFalseDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints without time-related description'
                }
            }
            var sourceTrueDataSerie = {
                name: 'Description of the source or the process at the origin of the dataset',
                type: 'bar',
                stack: 'source',
                colorBy: 'data',
                data: [
                    { value: sourceDataScore, name: 'Presence of description of the origin of the dataset' },
                ]
            };
            if (sourceDataScore > 0) {
                sourceTrueDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints with source description'
                }
            }
            var sourceFalseDataSerie = {
                name: 'Description of the source or the process at the origin of the dataset',
                type: 'bar',
                stack: 'source',
                colorBy: 'data',
                data: [
                    { value: (datasetDescriptionData.length - sourceDataScore), name: 'Absence of description of the origin of the dataset' },
                ]
            };
            if ((datasetDescriptionData.length - sourceDataScore) > 0) {
                sourceFalseDataSerie.label = {
                    show: true,
                    formatter: '{c} endpoints without source description'
                }
            }
            this.option = {
                title: {
                    text: 'Dataset description features in all endpoints',
                    left: 'center'
                },
                tooltip: {
                    confine: true
                },
                xAxis: {
                    type: 'value',
                    max: 'dataMax',
                },
                yAxis: {
                    type: 'category',
                    axisLabel: {
                        formatter: 'Dataset\n description\n elements',
                        overflow: 'breakAll'
                    }
                },
                legend: {
                    left: 'left',
                    show: false
                },
                series: [whoTrueDataSerie, whoFalseDataSerie, licenseTrueDataSerie, licenseFalseDataSerie, timeTrueDataSerie, timeFalseDataSerie, sourceTrueDataSerie, sourceFalseDataSerie]
            };
            this.chartObject.setOption(this.option, true);
        });
    },
    redrawFunction: function () {
        $('#datasetdescriptionRadar').width(mainContentColWidth);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    },
    clearFunction: function () {
        this.chartObject.setOption({ series: [] }, true);
        $('#datasetDescriptionTableBody').empty();
    }
});
setButtonAsToggleCollapse('datasetDescriptionStatDetails', 'datasetDescriptionDatatable');

var shortUriChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('shortUrisScatter')),
    option: {},
    fillFunction: function () {
        var shortUrisMeasureQuery = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/shortUris.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "}" +
            generateGraphValueFilterClause() +
            " } GROUP BY ?g ?endpointUrl ?measure ";
        this.shortUrisMeasureQuery = shortUrisMeasureQuery;
        $('#shortUrisQueryCell').empty();
        $('#shortUrisQueryCell').append($(document.createElement('code')).text(shortUrisMeasureQuery))
        shortUriDataFile.then(shortUriData => {
            shortUriData = shortUriData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined))

            var graphSet = new Set(shortUriData.map(a => a.graph))
            var endpointDataSerieMap = new Map();
            shortUriData.forEach((shortUriItem, i) => {
                if (endpointDataSerieMap.get(shortUriItem.endpoint) == undefined) {
                    endpointDataSerieMap.set(shortUriItem.endpoint, []);
                }
                endpointDataSerieMap.get(shortUriItem.endpoint).push([shortUriItem.graph, precise(shortUriItem.measure)]);
            });

            if (endpointDataSerieMap.size > 0) {
                this.show();

                // Chart
                var shortUrisSeries = [];
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    var chartSerie = {
                        name: endpoint,
                        label: 'show',
                        symbolSize: 5,
                        data: serieData,
                        type: 'line'
                    };

                    shortUrisSeries.push(chartSerie);
                });

                this.option = getCategoryScatterOption("Short URIs (< 80 characters) quality measure through time", [...graphSet].sort((a, b) => a.localeCompare(b)), shortUrisSeries);
                this.chartObject.setOption(this.option, true);

                // Average measure
                var shortUriMeasureSum = shortUriData.map(a => a.measure).reduce((previous, current) => current + previous);
                var shortUrisAverageMeasure = shortUriMeasureSum / shortUriData.length;
                $('#shortUrisMeasure').text(precise(shortUrisAverageMeasure) + "%");

                // Measire Details
                function fillShortUriTable() {
                    var shortUrisDetailTableBody = $('#shortUrisTableBody');
                    endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                        var endpointRow = $(document.createElement('tr'));

                        var endpointCell = $(document.createElement('td'));
                        endpointCell.text(endpoint);
                        var measureCell = $(document.createElement('td'));
                        var endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                        var measureAverage = endpointMeasureSum / serieData.length;
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
        });
    },
    redrawFunction: function () {
        $('#shortUrisQueryCell').empty();
        $('#shortUrisQueryCell').append($(document.createElement('code')).text(this.shortUrisMeasureQuery));
        $('#shortUrisScatter').width(mainContentColWidth * .8);
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
setButtonAsToggleCollapse('shortUrisDetails', 'shortUrisDatatable');

var rdfDataStructureChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('rdfDataStructuresScatter')),
    option: {},
    fillFunction: function () {
        this.query = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/RDFDataStructures.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "}" +
            generateGraphValueFilterClause() +
            " } GROUP BY ?g ?endpointUrl ?measure ";
        $('#rdfDataStructuresQueryCell').empty();
        $('#rdfDataStructuresQueryCell').append($(document.createElement('code')).text(this.query));

        rdfDataStructureDataFile.then(rdfDataStructureData => {
            rdfDataStructureData = rdfDataStructureData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined))

            var graphSet = new Set(rdfDataStructureData.map(a => a.graph))

            var endpointDataSerieMap = new Map();
            rdfDataStructureData.forEach((rdfDataStructureItem, i) => {
                if (endpointDataSerieMap.get(rdfDataStructureItem.endpoint) == undefined) {
                    endpointDataSerieMap.set(rdfDataStructureItem.endpoint, []);
                }
                endpointDataSerieMap.get(rdfDataStructureItem.endpoint).push([rdfDataStructureItem.graph, precise(rdfDataStructureItem.measure)]);
            });

            if (endpointDataSerieMap.size > 0) {
                this.show()

                // Chart
                var rdfDataStructuresSeries = [];
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    var chartSerie = {
                        name: endpoint,
                        label: 'show',
                        symbolSize: 5,
                        data: serieData,
                        type: 'line'
                    };

                    rdfDataStructuresSeries.push(chartSerie);
                });

                this.option = getCategoryScatterOption("Minimal usage of RDF data structures measure through time", [...graphSet].sort((a, b) => a.localeCompare(b)), rdfDataStructuresSeries);
                this.chartObject.setOption(this.option, true);

                // Average measure
                var rdfDataStructureMeasureSum = rdfDataStructureData.map(a => a.measure).reduce((previous, current) => current + previous);
                var rdfDataStructuresAverageMeasure = rdfDataStructureMeasureSum / rdfDataStructureData.length;
                $('#rdfDataStructuresMeasure').text(precise(rdfDataStructuresAverageMeasure, 3) + "%");

                // Measire Details
                var rdfDataStructuresDetailTableBody = $('#rdfDataStructuresTableBody');
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    var endpointRow = $(document.createElement('tr'));

                    var endpointCell = $(document.createElement('td'));
                    endpointCell.text(endpoint);
                    var measureCell = $(document.createElement('td'));
                    var endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                    var measureAverage = endpointMeasureSum / serieData.length;
                    measureCell.text(precise(measureAverage, 3) + "%");

                    endpointRow.append(endpointCell);
                    endpointRow.append(measureCell);

                    rdfDataStructuresDetailTableBody.append(endpointRow);
                });
                $('#rdfDataStructuresTable').DataTable()
            } else {
                this.hide();
            }

        });
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
        $('#rdfDataStructuresScatter').width(mainContentColWidth * .8);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});
setButtonAsToggleCollapse('rdfDataStructuresDetails', 'rdfDataStructuresDatatable');

var readableLabelsChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('readableLabelsScatter')), option: {},
    fillFunction: function () {
        this.query = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "} " +
            generateGraphValueFilterClause() +
            " } GROUP BY ?g ?endpointUrl ?measure ";
        $('#readableLabelsQueryCell').empty();
        $('#readableLabelsQueryCell').append($(document.createElement('code')).text(this.query))

        readableLabelDataFile.then(readableLabelData => {
            readableLabelData = readableLabelData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined))

            var graphSet = new Set(readableLabelData.map(a => a.graph))

            var endpointDataSerieMap = new Map();
            readableLabelData.forEach((readableLabelItem, i) => {
                if (endpointDataSerieMap.get(readableLabelItem.endpoint) == undefined) {
                    endpointDataSerieMap.set(readableLabelItem.endpoint, []);
                }
                endpointDataSerieMap.get(readableLabelItem.endpoint).push([readableLabelItem.graph, precise(readableLabelItem.measure)]);
            });

            if (endpointDataSerieMap.size > 0) {
                this.show();

                // Chart
                var readableLabelsSeries = [];
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    var chartSerie = {
                        name: endpoint,
                        label: 'show',
                        symbolSize: 5,
                        data: serieData,
                        type: 'line'
                    };

                    readableLabelsSeries.push(chartSerie);
                });

                this.option = getCategoryScatterOption("Usage of readable label for every resource", [...graphSet].sort((a, b) => a.localeCompare(b)), readableLabelsSeries);
                this.chartObject.setOption(this.option, true);

                // Average measure
                var readableLabelMeasureSum = readableLabelData.map(a => a.measure).reduce((previous, current) => current + previous);
                var readableLabelsAverageMeasure = readableLabelMeasureSum / readableLabelData.length;
                $('#readableLabelsMeasure').text(precise(readableLabelsAverageMeasure, 3) + "%");

                // Measire Details
                var readableLabelsDetailTableBody = $('#readableLabelsTableBody');
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    var endpointRow = $(document.createElement('tr'));

                    var endpointCell = $(document.createElement('td'));
                    endpointCell.text(endpoint);
                    var measureCell = $(document.createElement('td'));
                    var endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                    var measureAverage = endpointMeasureSum / serieData.length;
                    measureCell.text(precise(measureAverage, 3) + "%");

                    endpointRow.append(endpointCell);
                    endpointRow.append(measureCell);

                    readableLabelsDetailTableBody.append(endpointRow);
                });
            } else {
                this.hide();
            }

            $('#readableLabelsTable').DataTable()
        });
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
        $('#readableLabelsScatter').width(mainContentColWidth * .8);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});
setButtonAsToggleCollapse('readableLabelsDetails', 'readableLabelsDatatable');

var blankNodesChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('blankNodesScatter')),
    option: {},
    fillFunction: function () {
        this.query = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/blankNodeUsage.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "}" +
            generateGraphValueFilterClause() +
            " } " +
            "GROUP BY ?g ?endpointUrl ?measure ";
        $('#blankNodesQueryCell').empty();
        $('#blankNodesQueryCell').append($(document.createElement('code')).text(this.query))

        blankNodesDataFile.then(blankNodeData => {
            blankNodeData = blankNodeData.filter(item => ((!(new Set(blackistedEndpointIndexList)).has(item.endpoint))
                && (new Set(filteredEndpointWhiteList).has(item.endpoint)))
                && (graphList.find(graphName => (new RegExp(graphName.replace('http://ns.inria.fr/indegx#', ''))).test(item.graph)) != undefined))

            var graphSet = new Set(blankNodeData.map(a => a.graph))

            var endpointDataSerieMap = new Map();
            blankNodeData.forEach((blankNodeItem, i) => {
                if (endpointDataSerieMap.get(blankNodeItem.endpoint) == undefined) {
                    endpointDataSerieMap.set(blankNodeItem.endpoint, []);
                }
                endpointDataSerieMap.get(blankNodeItem.endpoint).push([blankNodeItem.graph, precise(blankNodeItem.measure, 3)]);
            });

            if (endpointDataSerieMap.size > 0) {
                this.show();

                // Chart
                var blankNodesSeries = [];
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    var chartSerie = {
                        name: endpoint,
                        label: 'show',
                        symbolSize: 5,
                        data: serieData,
                        type: 'line'
                    };

                    blankNodesSeries.push(chartSerie);
                });

                this.option = getCategoryScatterOption("Usage of blank nodes", [...graphSet].sort((a, b) => a.localeCompare(b)), blankNodesSeries);
                this.chartObject.setOption(this.option, true);

                // Average measure
                var blankNodeMeasureSum = blankNodeData.map(a => a.measure).reduce((previous, current) => current + previous);
                var blankNodesAverageMeasure = blankNodeMeasureSum / blankNodeData.length;
                $('#blankNodesMeasure').text(precise(blankNodesAverageMeasure, 3) + "%");

                // Measire Details
                var blankNodesDetailTableBody = $('#blankNodesTableBody');
                endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                    var endpointRow = $(document.createElement('tr'));

                    var endpointCell = $(document.createElement('td'));
                    endpointCell.text(endpoint);
                    var measureCell = $(document.createElement('td'));
                    var endpointMeasureSum = serieData.map(a => Number.parseFloat(a[1])).reduce((previous, current) => current + previous);
                    var measureAverage = endpointMeasureSum / serieData.length;
                    measureCell.text(precise(measureAverage, 3) + "%");

                    endpointRow.append(endpointCell);
                    endpointRow.append(measureCell);

                    blankNodesDetailTableBody.append(endpointRow);
                });
            } else {
                this.hide();
            }
            $('#blankNodesTable').DataTable()
        });
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
        $('#blankNodesScatter').width(mainContentColWidth * .8);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});
setButtonAsToggleCollapse('blankNodesDetails', 'blankNodesDatatable');






var mainContentColWidth = 0; // Used to initialize graph width;

var graphList = [];
var currentGraphSetIndex = 0;
const graphSetIndexParameter = "graphSetIndex";
var endpointList = [];
var blacklistedEndpointList = [];
const blackListedEndpointParameter = "blackListedEndpoints";
var blackistedEndpointIndexList = [];
var url = new URL(window.location);
var urlParams = new URLSearchParams(url.search);
$(function () {
    mainContentColWidth = $('#mainContentCol').width();
    geolocContent = [geolocChart];
    sparqlCoverContent = [sparqlCoverCharts, testTableContent, sparqlFeaturesContent]
    vocabRelatedContent = [vocabRelatedChart];
    datasetDescriptionContent = [descriptionElementChart];
    dataQualityContent = [blankNodesChart, readableLabelsChart, rdfDataStructureChart, shortUriChart];
    datasetPopulationsContent = [tripleChart, classNumberChart, propertyNumberChart, classAndPropertiesContent];
    frameworkInformationContent = [categoryTestNumberChart, totalRuntimeChart, averageRuntimeChart, totalCategoryTestNumberChart];
    allContent = geolocContent.concat(sparqlCoverContent).concat(vocabRelatedContent).concat(datasetDescriptionContent).concat(dataQualityContent).concat(datasetPopulationsContent).concat(frameworkInformationContent);

    // Initialization of the map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFpbGxwaWVycmUiLCJhIjoiY2t5OXlxeXhkMDBlZDJwcWxpZTF4ZGkxZiJ9.dCeJEhUs7EF2HI50vdv-7Q', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFpbGxwaWVycmUiLCJhIjoiY2t5OXlxeXhkMDBlZDJwcWxpZTF4ZGkxZiJ9.dCeJEhUs7EF2HI50vdv-7Q'
    }).addTo(geolocChart.chartObject);
    geolocChart.layerGroup = L.layerGroup().addTo(geolocChart.chartObject);

    $(window).on('resize', () => {
        redrawCharts();
    })

    var url = new URL(window.location);
    urlParams = new URLSearchParams(url.search);
    // Set up graphs sets
    if (urlParams.has(graphSetIndexParameter)) {
        const givenGraphSetIndex = urlParams.get(graphSetIndexParameter);
        if (givenGraphSetIndex >= 0 && givenGraphSetIndex < graphLists.length) {
            currentGraphSetIndex = givenGraphSetIndex;
        }
    }
    var select = $('#endpoint-list-select');
    graphLists.forEach((item, i) => {
        var option = document.createElement('option');
        $(option).text(item.name);
        $(option).val(i);
        if (i == currentGraphSetIndex) {
            $(option).attr("selected", "true")
            graphList = item.graphs;
        }
        select.append(option);
    });
    changeGraphSetIndex(currentGraphSetIndex);
    select.on('change', function () {
        $("#endpoint-list-select > option:selected").each(function () {
            var selectionIndex = $(this).val();
            changeGraphSetIndex(selectionIndex);
        })
    });
    // set up blacklist
    if (urlParams.has(blackListedEndpointParameter)) {
        var blackistedEndpointIndexListRaw = urlParams.get(blackListedEndpointParameter);
        blackistedEndpointIndexList = JSON.parse(decodeURI(blackistedEndpointIndexListRaw));
    }

    geolocTabButton.trigger('click');
    geolocTabButton.trigger('click');
});