import * as echarts from "./echarts.js";
import $, { get } from 'jquery';
import 'leaflet';
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const duration = require('dayjs/plugin/duration');
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
import { greenIcon, orangeIcon } from "./leaflet-color-markers.js";
import { endpointIpMap, timezoneMap, graphLists } from "./data.js";

class KartoChart {
    constructor(config = { chartObject, option, fillFunction: () => { }, redrawFunction: () => { }, clearFunction: () => { }, hideFunction: () => { }, showFunction: () => { }, divId }) {
        this.chartObject = config.chartObject;
        this.option = config.option;
        this.fill = config.fillFunction;
        this.redraw = config.redrawFunction;
        this.clear = config.clearFunction;
        this.hide = config.hideFunction;
        this.show = config.showFunction;
    }
};

// Setup tab menu
var geolocTabButton = $('#geoloc-tab')
geolocTabButton.on('click', function (event) {
    redrawCharts()
})
var vocabRelatedContentTabButton = $('#vocabRelatedContent-tab')
vocabRelatedContentTabButton.on('click', function (event) {
    redrawCharts()
})
var sparqlTabButton = $('#sparql-tab')
sparqlTabButton.on('click', function (event) {
    redrawCharts()
})
var populationTabButton = $('#population-tab')
populationTabButton.on('click', function (event) {
    redrawCharts()
})
var descriptionTabButton = $('#description-tab')
descriptionTabButton.on('click', function (event) {
    redrawCharts()
})
var runtimeTabButton = $('#runtime-tab')
runtimeTabButton.on('click', function (event) {
    redrawCharts()
})
var qualityTabButton = $('#quality-tab')
qualityTabButton.on('click', function (event) {
    redrawCharts()
})

function sparqlQueryJSON(query, callback, errorCallback) {
    xmlhttpRequestJSON('http://prod-dekalog.inria.fr/sparql?query=' + encodeURIComponent(query) + "&format=json", callback, errorCallback);
};

function xmlhttpRequestJSON(url, callback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var response = JSON.parse(this.responseText);
                callback(response);
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

function refresh() {
    mainContentColWidth = $('#mainContentCol').width();
    graphValuesURIList = generateGraphValuesURI(graphList);
    clear();
    whiteListFill();
    endpointMap.fill();
    sparqlCoverCharts.fill();
    vocabRelatedChart.fill();
    tripleChart.fill();
    classNumberChart.fill();
    propertyNumberChart.fill();
    categoryTestNumberChart.fill();
    testTableFill();
    totalRuntimeChart.fill();
    averageRuntimeChart.fill();
    classAndPropertiesContentFill();
    descriptionElementChart.fill();
    shortUriChart.fill();
    rdfDataStructureChart.fill();
    readableLabelsChart.fill();
    blankNodesChart.fill();
}

function clear() {
    endpointMap.clear();
    sparqlCoverCharts.clear();
    vocabRelatedChart.clear();
    tripleChart.hide();
    classNumberChart.hide();
    propertyNumberChart.hide();
    categoryTestNumberChart.hide();
    totalRuntimeChart.clear();
    shortUriChart.clear();
    rdfDataStructureChart.hide();
    readableLabelsChart.hide();
    blankNodesChart.hide();
    descriptionElementChart.clear();
    $('#endpointKnownVocabsTableBody').empty();
    $('#rulesTableBody').empty();
    $('#endpointKeywordsTableBody').empty();
}

function redrawCharts() {
    mainContentColWidth = $('#mainContentCol').width();
    endpointMap.redraw();
    sparqlCoverCharts.redraw();
    vocabRelatedChart.redraw();
    tripleChart.redraw();
    classNumberChart.redraw();
    propertyNumberChart.redraw();
    categoryTestNumberChart.redraw();
    descriptionElementChart.redraw();
    totalRuntimeChart.redraw();
    averageRuntimeChart.redraw();
    shortUriChart.redraw();
    rdfDataStructureChart.redraw();
    readableLabelsChart.redraw();
    blankNodesChart.redraw();
}

function generateGraphValuesURI(graphs) {
    var result = "";
    graphs.forEach((item, i) => {
        result += " <" + item + "> ";
    });
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
    refresh();
    redrawCharts();
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
    var endpointListQuery = 'SELECT DISTINCT ?endpointUrl WHERE {' +
        ' GRAPH ?g { ' +
        "{ ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
        "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        '?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . ' +
        '} ' +
        'VALUES ?g { ' + graphValuesURIList + ' } ' +
        '} ' +
        'GROUP BY ?endpointUrl';
    sparqlQueryJSON(endpointListQuery, json => {
        tableBody.empty();
        endpointList = [];
        blacklistedEndpointList = [];
        blackistedEndpointIndexList = [];
        json.results.bindings.forEach((item) => {
            endpointList.push(item.endpointUrl.value);
        });
        endpointList.sort((a, b) => a.localeCompare(b))
        endpointList.forEach((item, i) => {
            tableBody.append(generateCheckEndpointLine(item, i));
        });
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


var endpointMap = new KartoChart({
    chartObject: L.map('map').setView([24.5271348225978, 62.22656250000001], 2),
    fillFunction: function () {
        var endpointGeolocTableBody = $('#endpointGeolocTableBody');
        endpointGeolocTableBody.empty();
        var endpointGeolocData = [];

        $('#map').width(mainContentColWidth);
        this.chartObject.invalidateSize();

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
            endpointGeolocData.forEach((item, i) => {
                addLineToEndpointGeolocTable(item);
            });
        }

        setTableHeaderSort('endpointGeolocTableBody', ['endpointGeolocTableEndpointHeader', 'endpointGeolocTableLatHeader', 'endpointGeolocTableLonHeader', 'endpointGeolocTableCountryHeader', 'endpointGeolocTableRegionHeader', 'endpointGeolocTableCityHeader', 'endpointGeolocTableOrgHeader'], [(a, b) => a.endpoint.localeCompare(b.endpoint), (a, b) => a.lat - b.lat, (a, b) => a.lon - b.lon, (a, b) => a.country.localeCompare(b.country), (a, b) => a.region.localeCompare(b.region), (a, b) => a.city.localeCompare(b.city), (a, b) => a.org.localeCompare(b.org)], endpointGeolocTableFill, endpointGeolocData)
        // Marked map with the geoloc of each endpoint
        endpointIpMap.forEach((item, i) => {
            // Add the markers for each endpoints.
            var endpoint = item.key;
            if (!blacklistedEndpointList.includes(endpoint)) {

                // Filter the endpoints according to their graphs
                var endpointInGraphQuery = "ASK { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <" + endpoint + "> . } VALUES ?g { " + graphValuesURIList + " } }";
                sparqlQueryJSON(endpointInGraphQuery, jsonAskResponse => {
                    var booleanResponse = jsonAskResponse.boolean;

                    if (booleanResponse) {
                        // Study of the timezones
                        // http://worldtimeapi.org/pages/examples
                        var markerIcon = greenIcon;
                        var endpointTimezoneSPARQL = new Map();
                        var timezoneSPARQLquery = "SELECT DISTINCT ?timezone { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <" + endpoint + "> . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <https://schema.org/broadcastTimezone> ?timezone } VALUES ?g { " + graphValuesURIList + " } }";
                        sparqlQueryJSON(timezoneSPARQLquery, jsonResponse => {
                            jsonResponse.results.bindings.forEach((itemResponse, i) => {
                                endpointTimezoneSPARQL.set(endpoint, itemResponse.timezone.value);
                            });

                            var ipTimezoneArrayFiltered = timezoneMap.filter(itemtza => itemtza.key == item.value.geoloc.timezone);
                            var ipTimezone;
                            if (ipTimezoneArrayFiltered.length > 0) {
                                ipTimezone = ipTimezoneArrayFiltered[0].value.utc_offset;
                            }
                            var sparqlTimezone = endpointTimezoneSPARQL.get(endpoint);
                            var badTimezone = false;
                            if (sparqlTimezone != undefined
                                && ipTimezone != undefined
                                && (ipTimezone.padStart(6, '-') != sparqlTimezone.padStart(6, '-')) // addding + and - at the beginnig in case they are missing
                                && (ipTimezone.padStart(6, '+') != sparqlTimezone.padStart(6, '+'))) {
                                badTimezone = true;
                                markerIcon = orangeIcon;
                            }

                            var endpointMarker = L.marker([item.value.geoloc.lat, item.value.geoloc.lon], { icon: markerIcon });
                            var endpointItem = { endpoint: endpoint, lat: item.value.geoloc.lat, lon: item.value.geoloc.lon, country: "", region: "", city: "", org: "" };
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
                            endpointGeolocData.push(endpointItem);
                            addLineToEndpointGeolocTable(endpointItem);
                            endpointMarker.on('click', clickEvent => {
                                var labelQuery = "SELECT DISTINCT ?label  { GRAPH ?g { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> <" + endpoint + "> . { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } UNION { ?dataset <http://purl.org/dc/terms/title> ?label } UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } UNION { ?dataset <http://schema.org/name> ?label } . } VALUES ?g { " + graphValuesURIList + " } }";
                                sparqlQueryJSON(labelQuery, responseLabels => {

                                    var popupString = "<table> <thead> <tr> <th colspan='2'> <a href='" + endpoint + "' >" + endpoint + "</a> </th> </tr> </thead>";
                                    popupString += "</body>"
                                    if (item.value.geoloc.country != undefined) {
                                        popupString += "<tr><td>Country: </td><td>" + item.value.geoloc.country + "</td></tr>";
                                    }
                                    if (item.value.geoloc.regionName != undefined) {
                                        popupString += "<tr><td>Region: </td><td>" + item.value.geoloc.regionName + "</td></tr>";
                                    }
                                    if (item.value.geoloc.city != undefined) {
                                        popupString += "<tr><td>City: </td><td>" + item.value.geoloc.city + "</td></tr>";
                                    }
                                    if (item.value.geoloc.org != undefined) {
                                        popupString += "<tr><td>Organization: </td><td>" + item.value.geoloc.org + "</td></tr>";
                                    }
                                    if (badTimezone) {
                                        popupString += "<tr><td>Timezone of endpoint URL: </td><td>" + ipTimezone + "</td></tr>";
                                        popupString += "<tr><td>Timezone declared by endpoint: </td><td>" + sparqlTimezone + "</td></tr>";
                                    }
                                    if (responseLabels.results.bindings.size > 0) {
                                        popupString += "<tr><td colspan='2'>" + responseLabels + "</td></tr>";
                                    }
                                    popupString += "</tbody>"
                                    popupString += "</table>"
                                    endpointMarker.bindPopup(popupString).openPopup();

                                });
                            });
                            endpointMarker.addTo(this.layerGroup);
                        });
                    }
                });
            }
        });
    },
    redrawFunction: function () {
        $('#map').width(mainContentColWidth);
        this.chartObject.invalidateSize();
        this.chartObject.setView([24.5271348225978, 62.22656250000001], 2);
    },
    clearFunction: function () {
        endpointMap.layerGroup.clearLayers();
    }
});
setButtonAsToggleCollapse('endpointGeolocDetails', 'endpointGeolocTable');

var sparqlCoverCharts = new KartoChart({
    chartObject: { 'sparql10Chart': echarts.init(document.getElementById('SPARQL10histo')), 'sparql11Chart': echarts.init(document.getElementById('SPARQL11histo')), 'sparqlChart': echarts.init(document.getElementById('SPARQLCoverageHisto')) },
    option: { sparql10ChartOption: {}, sparql11ChartOption: {}, sparqlChartOption: {} },
    fillFunction: function () {
        // Create an histogram of the SPARQLES rules passed by endpoint.
        var sparqlesFeatureQuery = 'SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) WHERE { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . FILTER(CONTAINS(str(?activity), ?sparqlNorm)) VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } } VALUES ?g { ' + graphValuesURIList + ' } } GROUP BY ?endpoint ?sparqlNorm ORDER BY DESC( ?sparqlNorm)';
        sparqlQueryJSON(sparqlesFeatureQuery, json => {
            var endpointSet = new Set();
            var jsonBaseFeatureSparqles = [];
            var sparql10Map = new Map();
            var sparql11Map = new Map();
            json.results.bindings.forEach((bindingItem, i) => {
                var endpointUrl = bindingItem.endpoint.value;
                if (!blacklistedEndpointList.includes(endpointUrl)) {
                    endpointSet.add(endpointUrl);
                    var feature = bindingItem.sparqlNorm.value;
                    var count = bindingItem.count.value;
                    if (feature.localeCompare("SPARQL10") == 0) {
                        sparql10Map.set(endpointUrl, Number(count));
                    }
                    if (feature.localeCompare("SPARQL11") == 0) {
                        sparql11Map.set(endpointUrl, Number(count));
                    }
                }
            });

            var maxSparql10 = 24;
            var maxSparql11 = 19;
            var maxSparqlTotal = maxSparql10 + maxSparql11;
            endpointSet.forEach((item) => {
                var sparql10 = sparql10Map.get(item);
                var sparql11 = sparql11Map.get(item);
                var sparqlJSONObject = { 'endpoint': item, 'sparql10': sparql10, 'sparql11': sparql11, 'sparqlTotal': (sparql10 + sparql11) };
                jsonBaseFeatureSparqles.push(sparqlJSONObject);
            });

            var chart10ValueMap = new Map();
            var chart11ValueMap = new Map();
            var chartSPARQLValueMap = new Map();

            for (var i = 0; i < 10; i++) {
                chart10ValueMap.set(i, 0);
                chart11ValueMap.set(i, 0);
                chartSPARQLValueMap.set(i, 0);
            }
            var sparql10Step = maxSparql10 / 10;
            var sparql11Step = maxSparql11 / 10;
            var sparqlTotalStep = maxSparqlTotal / 10;
            jsonBaseFeatureSparqles.forEach((item) => {
                var itemBinSparql10 = Math.floor(item.sparql10 / sparql10Step);
                if (itemBinSparql10 == 10) {
                    itemBinSparql10 = 9;
                }
                chart10ValueMap.set(itemBinSparql10, chart10ValueMap.get(itemBinSparql10) + 1);
                var itemBinSparql11 = Math.floor(item.sparql11 / sparql11Step);
                if (itemBinSparql11 == 10) {
                    itemBinSparql11 = 9;
                }
                chart11ValueMap.set(itemBinSparql11, chart11ValueMap.get(itemBinSparql11) + 1);
                var itemBinSparqlTotal = Math.floor(item.sparqlTotal / sparqlTotalStep);
                if (itemBinSparqlTotal == 10) {
                    itemBinSparqlTotal = 9;
                }
                chartSPARQLValueMap.set(itemBinSparqlTotal, chartSPARQLValueMap.get(itemBinSparqlTotal) + 1);
            });

            var chart10DataMap = new Map();
            var chart11DataMap = new Map();
            var chartSPARQLDataMap = new Map();
            var categorySet = new Set();
            chart10ValueMap.forEach((value, key, map) => {
                var categoryName = "[ " + ((key) * 10).toString() + "%, " + ((key + 1) * 10).toString() + " % ]";
                categorySet.add(categoryName);
                chart10DataMap.set(categoryName, value);
            });
            chart11ValueMap.forEach((value, key, map) => {
                var categoryName = "[ " + ((key) * 10).toString() + "%, " + ((key + 1) * 10).toString() + " % ]";
                categorySet.add(categoryName);
                chart11DataMap.set(categoryName, value);
            });
            chartSPARQLValueMap.forEach((value, key, map) => {
                var categoryName = "[ " + ((key) * 10).toString() + "%, " + ((key + 1) * 10).toString() + " % ]";
                categorySet.add(categoryName);
                chartSPARQLDataMap.set(categoryName, value);
            });
            var categories = ([...categorySet]).sort((a, b) => a.localeCompare(b));

            var sparql10Series = [];
            chart10DataMap.forEach((percentage, category, map) => {
                sparql10Series.push({
                    name: category,
                    type: 'bar',
                    data: [percentage],
                    label: {
                        show: true,
                        formatter: "{a}"
                    }
                })
            });
            var sparql11Series = [];
            chart11DataMap.forEach((percentage, category, map) => {
                sparql11Series.push({
                    name: category,
                    type: 'bar',
                    data: [percentage],
                    label: {
                        show: true,
                        formatter: "{a}"
                    }
                })
            });
            var sparqlCategorySeries = [];
            chartSPARQLDataMap.forEach((percentage, category, map) => {
                sparqlCategorySeries.push({
                    name: category,
                    type: 'bar',
                    data: [percentage],
                    label: {
                        show: true,
                        formatter: "{a}"
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
                    data: ["SPARQL 1.0 features"],
                    show: false
                },
                yAxis: {
                    type: 'value',
                    max: 'dataMax',
                },
                color: ["#000000", "#001C02", "#003805", "#005407", "#007009", "#008D0C", "#00A90E", "#00C510", "#00E113", "#00FD15"],
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
                    data: ["SPARQL 1.1 features"],
                    show: false
                },
                yAxis: {
                    type: 'value',
                    max: 'dataMax',
                },
                color: ["#000000", "#001C02", "#003805", "#005407", "#007009", "#008D0C", "#00A90E", "#00C510", "#00E113", "#00FD15"],
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
                    data: ["All SPARQL features"],
                    show: false
                },
                yAxis: {
                    type: 'value',
                    max: 'dataMax',
                },
                color: ["#000000", "#001C02", "#003805", "#005407", "#007009", "#008D0C", "#00A90E", "#00C510", "#00E113", "#00FD15"],
                series: sparqlCategorySeries,
            };

            this.redraw();

            jsonBaseFeatureSparqles.sort((a, b) => {
                return a.endpoint.localeCompare(b.endpoint);
            });

            function fillTestTable() {
                var tableBody = $('#SPARQLFeaturesTableBody');
                tableBody.empty();
                jsonBaseFeatureSparqles.forEach((item, i) => {
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
            }

            setTableHeaderSort("SPARQLFeaturesTableBody", ["SPARQLFeaturesTableEndpointHeader", "SPARQL10FeaturesTableRuleHeader", "SPARQL11FeaturesTableRuleHeader"], [(a, b) => a.endpoint.localeCompare(b.endpoint), (a, b) => a.sparql10 - b.sparql10, (a, b) => a.sparql11 - b.sparql11], fillTestTable, jsonBaseFeatureSparqles);

            fillTestTable();
        });
    },
    redrawFunction: function () {
        $('#SPARQL10histo').width(mainContentColWidth * .48);
        $('#SPARQL11histo').width(mainContentColWidth * .48);
        $('#SPARQL10histo').height(500);
        $('#SPARQL11histo').height(500);
        $('#SPARQLCoverageHisto').width(mainContentColWidth);

        this.chartObject.sparql10Chart.setOption(this.option.sparql10ChartOption, true);
        this.chartObject.sparql10Chart.resize();
        this.chartObject.sparql11Chart.setOption(this.option.sparql11ChartOption, true);
        this.chartObject.sparql11Chart.resize();
        this.chartObject.sparqlChart.setOption(this.option.sparqlChartOption, true);
        this.chartObject.sparqlChart.resize();
    },
    clearFunction: function () {
        this.chartObject.sparql10Chart.setOption({ series: [] }, true);
        this.chartObject.sparql11Chart.setOption({ series: [] }, true);
        this.chartObject.sparqlChart.setOption({ series: [] }, true);
    }
});
setButtonAsToggleCollapse('tableSPARQLFeaturesDetails', 'SPARQLFeaturesTable');

var vocabRelatedChart = new KartoChart({
    chartObject: { vocabChart: echarts.init(document.getElementById('vocabs')), rawVocabChart: echarts.init(document.getElementById('rawVocabs')), keywordChart: echarts.init(document.getElementById('endpointKeywords')) },
    option: { vocabOption: {}, rawVocabOption: {}, keywordOption: {} },
    fillFunction: function () {
        // Create an force graph with the graph linked by co-ocurrence of vocabularies
        sparqlesVocabularies = "SELECT DISTINCT ?endpointUrl ?vocabulary ?g { GRAPH ?g { " +
            "{ ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
            "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?dataset . " +
            "?dataset <http://rdfs.org/ns/void#vocabulary> ?vocabulary " +
            "} " +
            'VALUES ?g { ' + graphValuesURIList + ' } ' +
            " } " +
            "GROUP BY ?endpointUrl ?vocabulary ";

        console.log("Contact IndeGx START");
        sparqlQueryJSON(sparqlesVocabularies, json => {
            console.log("Contact IndeGx Done");

            var endpointSet = new Set();
            var vocabSet = new Set();
            var rawVocabSet = new Set();
            var rawGatherVocab = new Map();
            json.results.bindings.forEach((bindingItem, i) => {
                var vocabulariUri = bindingItem.vocabulary.value;
                var endpointUri = bindingItem.endpointUrl.value;
                var graphUri = bindingItem.g.value;
                if (!blacklistedEndpointList.includes(endpointUri)) {
                    endpointSet.add(endpointUri);
                    if (graphList.some(graphListItem => graphUri.localeCompare(graphListItem) == 0)) {
                        rawVocabSet.add(vocabulariUri);
                        if (!rawGatherVocab.has(endpointUri)) {
                            rawGatherVocab.set(endpointUri, new Set());
                        }
                        rawGatherVocab.get(endpointUri).add(vocabulariUri);
                    }
                }
            });

            function generateRawVocabContent(chart) {
                console.log("generateRawVocabContent");
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
                    chart.showEndpointRawVocabularyContent();

                    chart.option.rawVocabOption = getForceGraphOption('Endpoints and vocabularies without filtering', ["Vocabulary", "Endpoint"], [...jsonRawVocabNodes], [...jsonRawVocabLinks]);
                    chart.chartObject.rawVocabChart.setOption(chart.option.rawVocabOption, true);
                } else {
                    chart.hideEndpointRawVocabularyContent();
                }
            }

            generateRawVocabContent(this);

            // https://obofoundry.org/ // No ontology URL available in ontology description
            // http://prefix.cc/context // done
            // http://data.bioontology.org/resource_index/resources?apikey=b86b12d8-dc46-4528-82e3-13fbdabf5191 // No ontology URL available in ontology description
            // https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list // done

            // Retrieval of the list of LOV vocabularies to filter the ones retrieved in the index
            var knownVocabulariesLOV = new Set();
            console.log("Contact LOV for vocabularies START");
            xmlhttpRequestJSON("https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list", responseLOV => {
                console.log("Contact LOV for vocabularies DONE");
                responseLOV.forEach((item, i) => {
                    knownVocabulariesLOV.add(item.uri)
                });
                this.clear();
                generateVocabContent(this);
            });

            var knownVocabulariesPrefixCC = new Set();
            console.log("Contact PrefixCC START");
            xmlhttpRequestJSON("http://prefix.cc/context", responsePrefixCC => {
                console.log("Contact PrefixCC DONE");
                for (var prefix of Object.keys(responsePrefixCC['@context'])) {
                    knownVocabulariesPrefixCC.add(responsePrefixCC['@context'][prefix])
                };
                this.clear();
                generateVocabContent(this);
            });

            function generateVocabContent(chart) {
                console.log("generateVocabContent ")
                var gatherVocab = new Map();
                // Filtering according to ontology repositories
                rawVocabSet.forEach(vocabulariUri => {
                    if (knownVocabulariesLOV.has(vocabulariUri) || knownVocabulariesPrefixCC.has(vocabulariUri)) {
                        vocabSet.add(vocabulariUri);
                    }
                });
                rawGatherVocab.forEach((vocabulariUriSet, endpointUri, map) => {
                    vocabulariUriSet.forEach(vocabulariUri => {
                        if (knownVocabulariesLOV.has(vocabulariUri) || knownVocabulariesPrefixCC.has(vocabulariUri)) {
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
                    chart.showEndpointKnownVocabularyContent();

                    var endpointKnownVocabulariestableBody = $('#endpointKnownVocabsTableBody');
                    var sumknowVocabMeasure = 0;
                    var knowVocabsData = [];
                    gatherVocab.forEach((endpointVocabs, endpointUrl, map1) => {
                        var measure = (endpointVocabs.size / rawGatherVocab.get(endpointUrl).size);
                        knowVocabsData.push({ 'endpoint': endpointUrl, 'measure': measure })

                        endpointVocabs.forEach((vocab, i) => {
                            jsonVocabLinks.add({ source: endpointUrl, target: vocab });
                        });
                    });
                    

                    chart.option.vocabOption = getForceGraphOption('Endpoints and known vocabularies*', ["Vocabulary", "Endpoint"], [...jsonVocabNodes], [...jsonVocabLinks]);
                    chart.chartObject.vocabChart.setOption(chart.option.vocabOption, true);

                    // Measure Table
                    function endpointKnowVocabsMeasureFill() {
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
                    setTableHeaderSort("endpointKnownVocabsTableBody", ["knownVocabEndpointHeader", "knownVocabMeasureHeader"], [(a, b) => a.endpoint.localeCompare(b.endpoint), (a, b) => a.measure - b.measure], endpointKnowVocabsMeasureFill, knowVocabsData);

                    // computation of the know vocabularies measure
                    var knownVocabulariesMeasureHtml = $('#KnownVocabulariesMeasure');
                    knownVocabulariesMeasureHtml.text(precise((sumknowVocabMeasure / endpointSet.size) * 100, 3) + "%");
                } else {
                    chart.hideEndpointKnownVocabularyContent();
                }

                // Endpoint and vocabulary keywords graph
                var vocabularyQueryValues = "";
                vocabSet.forEach((item, i) => {
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

                xmlhttpRequestJSON("https://lov.linkeddata.es/dataset/lov/sparql?query=" + encodeURIComponent(keywordLOVQuery) + "&format=json", jsonKeywords => {

                    var jsonKeywordLinks = new Set();
                    var jsonKeywordNodes = new Set();

                    var keywordSet = new Set();
                    var vocabKeywordMap = new Map();
                    var endpointKeywordsMap = new Map();
                    jsonKeywords.results.bindings.forEach((keywordItem, i) => {
                        var keyword = keywordItem.keyword.value;
                        var vocab = keywordItem.vocabulary.value;
                        if (vocabKeywordMap.get(vocab) == undefined) {
                            vocabKeywordMap.set(vocab, [])
                        }
                        vocabKeywordMap.get(vocab).push(keyword);

                        keywordSet.add(keyword);
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
                        chart.showEndpointKeywordContent();

                        chart.option.keywordOption = getForceGraphOption('Endpoints and keywords', ["Keyword", "Endpoint"], [...jsonKeywordNodes], [...jsonKeywordLinks]);
                        chart.chartObject.keywordChart.setOption(chart.option.keywordOption, true);

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

                        setTableHeaderSort("endpointKeywordsTableBody", ["endpointKeywordsTableEndpointHeader", "endpointKeywordsTableKeywordHeader"], [(a, b) => a.endpoint.localeCompare(b.endpoint), (a, b) => a.keywords.size - b.keywords.size], endpointKeywordsTableFill, endpointKeywordsData);
                    } else {
                        chart.hideEndpointKeywordContent();
                    }
                }, () => {
                    chart.hideEndpointKeywordContent();
                });
            }
        }, () => {
            this.hide();
        });

        this.hideEndpointVocabularyContent = function () {
            console.log("hideEndpointVocabularyContent")
            this.hideEndpointRawVocabularyContent();
            this.hideEndpointKnownVocabularyContent();
        }
        this.hideEndpointRawVocabularyContent = function () {
            console.log("hideEndpointRawVocabularyContent")
            this.chartObject.rawVocabChart.setOption({ series: [] }, true);
            collapseHtml('rawVocabs');
        }
        this.hideEndpointKnownVocabularyContent = function () {
            console.log("hideEndpointKnownVocabularyContent")
            this.chartObject.vocabChart.setOption({ series: [] }, true);
            collapseHtml('vocabs');
            collapseHtml('knowVocabEndpointMeasureRow');
            collapseHtml('knowVocabEndpointTable');
        }
        this.hideEndpointKeywordContent = function () {
            console.log("hideEndpointKeywordContent")
            this.chartObject.keywordChart.setOption({ series: [] }, true);
            collapseHtml('endpointKeywords');
            collapseHtml('endpointKeywordsDetails');
            $('#endpointKeywordsTableBody').empty();
        }
        this.showEndpointVocabularyContent = function () {
            console.log("showEndpointVocabularyContent")
            this.show();
            this.showEndpointKnownVocabularyContent();
            this.showEndpointRawVocabularyContent();
        }
        this.showEndpointRawVocabularyContent = function () {
            console.log("showEndpointRawVocabularyContent")
            this.show();
            unCollapseHtml('rawVocabs');
        }
        this.showEndpointKnownVocabularyContent = function () {
            console.log("showEndpointKnownVocabularyContent")
            this.show();
            unCollapseHtml('knowVocabEndpointMeasureRow');
            unCollapseHtml('knowVocabEndpointTable');
            unCollapseHtml('vocabs');
        }
        this.showEndpointKeywordContent = function () {
            console.log("showEndpointKeywordContent")
            this.show();
            unCollapseHtml('endpointKeywords');
            unCollapseHtml('endpointKeywordsDetails');
        }
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
        console.log("redraw")
        $('#vocabs').width(mainContentColWidth);
        $('#rawVocabs').width(mainContentColWidth);
        $('#endpointKeywords').width(mainContentColWidth);
        this.chartObject.vocabChart.setOption(this.option.vocabOption, true);
        this.chartObject.vocabChart.resize();
        this.chartObject.rawVocabChart.setOption(this.option.rawVocabOption, true);
        this.chartObject.rawVocabChart.resize();
        this.chartObject.keywordChart.setOption(this.option.keywordOption, true);
        this.chartObject.keywordChart.resize();
        var codeQuery1Div = $(document.createElement('code')).text(sparqlesVocabularies);
        $('#endpointVocabularyQueryCell').empty()
        $('#endpointVocabularyQueryCell').append(codeQuery1Div)
        var codeQuery2Div = $(document.createElement('code')).text('SELECT DISTINCT ?endpointUrl ?vocabulary { SERVICE <http://prod-dekalog.inria.fr/sparql> { GRAPH ?g { { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } ?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?endpoint . ?base <http://rdfs.org/ns/void#vocabulary> ?vocabulary . FILTER(isIri(?vocabulary)) } VALUES ?g { ' + graphValuesURIList + ' } } SERVICE <https://lov.linkeddata.es/dataset/lov/sparql> { GRAPH <https://lov.linkeddata.es/dataset/lov> { ?vocabURI a <http://purl.org/vocommons/voaf#Vocabulary> . } } } GROUP BY ?endpointUrl ?vocabulary');
        $('#endpointKeywordQueryCell').empty();
        $('#endpointKeywordQueryCell').append(codeQuery2Div);
    },
    clearFunction: function () {
        console.log("clear")
        this.chartObject.vocabChart.setOption({ series: [] }, true);
        this.chartObject.rawVocabChart.setOption({ series: [] }, true);
        this.chartObject.keywordChart.setOption({ series: [] }, true);
        $('#endpointVocabularyQueryCell').empty()
        $('#endpointKeywordQueryCell').empty();
    }
});
setButtonAsToggleCollapse('KnownVocabulariesDetails', 'knowVocabEndpointTable');
setButtonAsToggleCollapse('endpointKeywordsDetails', 'endpointKeywordsTable');

var tripleChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('tripleScatter')),
    option: {},
    fillFunction: function () {
        // Scatter plot of the number of triples through time
        var triplesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
            "?base <http://rdfs.org/ns/void#triples> ?rawO ." +
            "}" +
            " VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?g ?endpointUrl ?o ORDER BY DESC(?g) DESC(?endpointUrl)";
        sparqlQueryJSON(triplesSPARQLquery, json => {
            var endpointDataSerieMap = new Map();
            json.results.bindings.forEach((itemResult, i) => {
                var endpointUrl = itemResult.endpointUrl.value;
                if (!blacklistedEndpointList.includes(endpointUrl)) {
                    endpointDataSerieMap.set(endpointUrl, []);
                }

            });
            var graphSet = new Set();
            json.results.bindings.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var endpointUrl = itemResult.endpointUrl.value;
                var triples = Number.parseInt(itemResult.o.value);
                if (!blacklistedEndpointList.includes(endpointUrl)) {
                    graphSet.add(graph);
                    endpointDataSerieMap.get(endpointUrl).push([graph, triples])
                }
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
        $('#tripleScatter').width(mainContentColWidth / 3);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var classNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('classScatter')),
    option: {},
    fillFunction: function () {
        // Scatter plot of the number of classes through time
        var classesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) ?modifDate { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
            "?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
            "?base <http://rdfs.org/ns/void#classes> ?rawO ." +
            "}" +
            "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?g ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
        sparqlQueryJSON(classesSPARQLquery, json => {
            var endpointDataSerieMap = new Map();
            //var xAxisDataSet = new Set();
            json.results.bindings.forEach((itemResult, i) => {
                var endpointUrl = itemResult.endpointUrl.value;
                if (!blacklistedEndpointList.includes(endpointUrl)) {
                    endpointDataSerieMap.set(endpointUrl, []);
                }
                //xAxisDataSet.add(graph);
            });
            var graphSet = new Set();
            json.results.bindings.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var endpointUrl = itemResult.endpointUrl.value;
                var triples = Number.parseInt(itemResult.o.value);
                if (!blacklistedEndpointList.includes(endpointUrl)) {
                    graphSet.add(graph);
                    endpointDataSerieMap.get(endpointUrl).push([graph, triples])
                }
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

        });
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
        $('#classScatter').width(mainContentColWidth / 3);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var propertyNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('propertyScatter')),
    option: {},
    fillFunction: function () {
        // scatter plot of the number of properties through time
        var propertiesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
            "?base <http://rdfs.org/ns/void#properties> ?rawO ." +
            "}" +
            "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?endpointUrl ?g ?o ORDER BY DESC(?g) DESC(?endpointUrl) ";
        sparqlQueryJSON(propertiesSPARQLquery, json => {
            var endpointDataSerieMap = new Map();
            json.results.bindings.forEach((itemResult, i) => {
                var endpointUrl = itemResult.endpointUrl.value;

                if (!blacklistedEndpointList.includes(endpointUrl)) {
                    endpointDataSerieMap.set(endpointUrl, []);
                }
            });
            var endpointGraphPropertiesData = [];
            var graphSet = new Set();
            json.results.bindings.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var endpointUrl = itemResult.endpointUrl.value;
                var properties = Number.parseInt(itemResult.o.value);
                if (!blacklistedEndpointList.includes(endpointUrl)) {
                    graphSet.add(graph);
                    endpointDataSerieMap.get(endpointUrl).push([graph, properties])
                    endpointGraphPropertiesData.push({ endpoint: endpointUrl, graph: graph, properties: properties })
                }
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
        $('#propertyScatter').width(mainContentColWidth / 3);
        this.chartObject.setOption(this.option, true);
        this.chartObject.resize();
    }
});

var categoryTestNumberChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('testCategoryScatter')),
    option: {},
    fillFunction: function () {
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
            "}  VALUES ?g { " + graphValuesURIList + " } " +
            "} GROUP BY ?g ?category ?endpointUrl";
        sparqlQueryJSON(testCategoryQuery, json => {
            var endpointDataSerieMap = new Map();
            json.results.bindings.forEach((itemResult, i) => {
                var category = itemResult.category.value;

                endpointDataSerieMap.set(category, new Map());
            });
            json.results.bindings.forEach((itemResult, i) => {
                var category = itemResult.category.value;
                var count = itemResult.count.value;
                //        var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
                //        var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());
                var endpoint = itemResult.endpointUrl.value;
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');

                if (!blacklistedEndpointList.includes(endpoint)) {
                    if (endpointDataSerieMap.get(category).get(graph) == undefined) {
                        endpointDataSerieMap.get(category).set(graph, new Map());
                    }
                    endpointDataSerieMap.get(category).get(graph).set(endpoint, count);
                }
            });

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

function testTableFill() {

    var appliedTestQuery = "SELECT DISTINCT ?endpointUrl ?rule { " +
        "GRAPH ?g { " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?curated . " +
        "?curated <http://www.w3.org/ns/prov#wasGeneratedBy> ?rule . " +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "} " +
        "VALUES ?g { " + graphValuesURIList + " } " +
        "} GROUP BY ?endpointUrl ?rule ORDER BY DESC(?endpointUrl) ";
    sparqlQueryJSON(appliedTestQuery, json => {
        var appliedTestMap = new Map();
        json.results.bindings.forEach((item, i) => {
            var endpointUrl = item.endpointUrl.value;
            var rule = item.rule.value;

            if (!blacklistedEndpointList.includes(endpointUrl)) {
                if (appliedTestMap.get(endpointUrl) == undefined) {
                    appliedTestMap.set(endpointUrl, []);
                }
                appliedTestMap.get(endpointUrl).push(rule);
            }
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
                endpointCell.attr('rowspan', rules.length);
                endpointCell.text(endpoint);
                endpointRow.append(endpointCell);
                tableBody.append(endpointRow);
                rules.forEach((item, i) => {
                    var ruleCell = $(document.createElement("td"));
                    ruleCell.text(item);
                    if (i == 0) {
                        endpointRow.append(ruleCell);
                    } else {
                        var ruleRow = $(document.createElement("tr"));
                        ruleRow.append(ruleCell);
                        tableBody.append(ruleRow);
                    }
                });
            });
        }

        var tableBody = $('#ruleTableBody');
        $('#rulesTableEndpointHeader').on('click', function () {
            tableBody.empty();
            if (tableBody.hasClass('sortEndpointDesc')) {
                tableBody.removeClass('sortEndpointDesc');
                tableBody.addClass('sortEndpointAsc');
                appliedTestData.sort((a, b) => {
                    return a.endpoint.localeCompare(b.endpoint);
                });
            } else {
                tableBody.addClass('sortEndpointDesc');
                tableBody.removeClass('sortEndpointAsc');
                appliedTestData.sort((a, b) => {
                    return - a.endpoint.localeCompare(b.endpoint);
                });
            }
            fillTestTable();
        });

        fillTestTable();
    });
}
setButtonAsToggleCollapse('tableRuleDetails', 'rulesTable');

var totalRuntimeChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('totalRuntimeScatter')),
    option: {},
    fillFunction: function () {
        var maxMinTimeQuery = "SELECT DISTINCT ?g (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?data . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . }  VALUES ?g { " + graphValuesURIList + " } }";
        var runtimeDataSerie = []
        var runtimeSerie = []
        sparqlQueryJSON(maxMinTimeQuery, jsonResponse => {
            var graphSet = new Set();
            jsonResponse.results.bindings.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                var start = parseDate(itemResult.start.value, 'DD-MM-YYYYTHH:mm:ss');
                var end = parseDate(itemResult.end.value, 'DD-MM-YYYYTHH:mm:ss');
                var runtime = dayjs.duration(end.diff(start));
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
        var maxMinTimeQuery = "SELECT DISTINCT ?g (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?data . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . }  VALUES ?g { " + graphValuesURIList + " } }";
        var runtimeDataSerie = []
        var runtimeSerie = []
        sparqlQueryJSON(maxMinTimeQuery, jsonResponse => {

            var numberOfEndpointQuery = "SELECT DISTINCT ?g (COUNT(?dataset) AS ?count) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . }  VALUES ?g { " + graphValuesURIList + " } }";
            sparqlQueryJSON(numberOfEndpointQuery, numberOfEndpointJson => {
                var numberEndpointMap = new Map();
                numberOfEndpointJson.results.bindings.forEach((numberEndpointItem, i) => {
                    var graph = numberEndpointItem.g.value;
                    if (graphList.includes(graph)) {
                        graph = graph.replace('http://ns.inria.fr/indegx#', '');
                        var count = numberEndpointItem.count.value;

                        numberEndpointMap.set(graph, count);
                    }
                });

                var graphSet = new Set();
                jsonResponse.results.bindings.forEach((itemResult, i) => {
                    var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#', '');
                    var start = parseDate(itemResult.start.value, 'DD-MM-YYYYTHH:mm:ss');
                    var end = parseDate(itemResult.end.value, 'DD-MM-YYYYTHH:mm:ss');
                    var runtime = dayjs.duration(end.diff(start));

                    graphSet.add(graph);
                    runtimeDataSerie.push([graph, runtime])
                });
                var runtimeSerie = {
                    name: "Average runtime in seconds",
                    label: 'show',
                    symbolSize: 5,
                    data: runtimeDataSerie.map(a => [a[0], a[1].asSeconds() / numberEndpointMap.get(a[0])]),
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

function classAndPropertiesContentFill() {
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
        "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co ";
    sparqlQueryJSON(classPartitionQuery, json => {
        var classCountsEndpointsMap = new Map();
        json.results.bindings.forEach((item, i) => {
            var c = item.c.value;
            var endpointUrl = item.endpointUrl.value;
            if (!blacklistedEndpointList.includes(endpointUrl)) {

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
            }
        });

        var classDescriptionData = [];
        classCountsEndpointsMap.forEach((countsItem, classKey, map) => {
            classDescriptionData.push(countsItem);
        });

        setTableHeaderSort("classDescriptionTableBody", ["classDescriptionTableClassHeader", "classDescriptionTableTriplesHeader", "classDescriptionTableClassesHeader", "classDescriptionTablePropertiesHeader", "classDescriptionTableDistinctSubjectsHeader", "classDescriptionTableDistinctObjectsHeader", "classDescriptionTableEndpointsHeader"], [(a, b) => a.class.localeCompare(b.class), (a, b) => b.triples - a.triples, (a, b) => b.classes - a.classes, (a, b) => b.properties - a.properties, (a, b) => b.distinctSubjects - a.distinctSubjects, (a, b) => b.distinctObjects - a.distinctObjects, (a, b) => b.endpoints.size - a.endpoints.size], fillclassDescriptionTable, classDescriptionData);
        classDescriptionData.sort((a, b) => a.class.localeCompare(b.class));

        function fillclassDescriptionTable() {
            var tableBody = $("#classDescriptionTableBody");
            tableBody.empty();
            classDescriptionData.forEach((countsItem, i) => {
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
                endpointsCell.text(countsItem.endpoints.size);

                classRow.append(classCell);
                classRow.append(classTriplesCell);
                classRow.append(classClassesCell);
                classRow.append(classPropertiesCell);
                classRow.append(classDistinctSubjectsCell);
                classRow.append(classDistinctObjectsCell);
                classRow.append(endpointsCell);
                tableBody.append(classRow);
            });
        }
        fillclassDescriptionTable()


    });

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
        "}" +
        "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?endpointUrl ?c ?p ?pt ?po ?ps ";
    sparqlQueryJSON(classPropertyPartitionQuery, json => {

        var classPropertyCountsEndpointsMap = new Map();
        json.results.bindings.forEach((item, i) => {
            var c = item.c.value;
            var p = item.p.value;
            var mapKey = c + p;
            var endpointUrl = item.endpointUrl.value;

            if (!blacklistedEndpointList.includes(endpointUrl)) {
                if (classPropertyCountsEndpointsMap.get(mapKey) == undefined) {
                    classPropertyCountsEndpointsMap.set(mapKey, { class: c, property: p });
                }
                if (item.pt != undefined) {
                    var pt = Number.parseInt(item.pt.value);
                    var currentClassItem = classCountsEndpointsMap.get(mapKey);
                    if (classPropertyCountsEndpointsMap.get(mapKey).triples == undefined) {
                        currentClassItem.triples = 0;
                        classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                    }
                    currentClassItem.triples = currentClassItem.triples + pt;
                    classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                }
                if (item.ps != undefined) {
                    var ps = Number.parseInt(item.ps.value);
                    var currentClassItem = classPropertyCountsEndpointsMap.get(mapKey);
                    if (classPropertyCountsEndpointsMap.get(mapKey).distinctSubjects == undefined) {
                        currentClassItem.distinctSubjects = 0;
                        classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                    }
                    currentClassItem.distinctSubjects = currentClassItem.distinctSubjects + ps;
                    classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                }
                if (item.po != undefined) {
                    var po = Number.parseInt(item.po.value);
                    var currentClassItem = classPropertyCountsEndpointsMap.get(mapKey);
                    if (classPropertyCountsEndpointsMap.get(mapKey).distinctObjects == undefined) {
                        currentClassItem.distinctObjects = 0;
                        classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                    }
                    currentClassItem.distinctObjects = currentClassItem.distinctObjects + po;
                    classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                }
                if (classPropertyCountsEndpointsMap.get(mapKey).endpoints == undefined) {
                    var currentClassItem = classPropertyCountsEndpointsMap.get(mapKey);
                    currentClassItem.endpoints = new Set();
                    classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                }
                classPropertyCountsEndpointsMap.get(mapKey).endpoints.add(endpointUrl);
            }
        });

        var classDescriptionData = [];
        classPropertyCountsEndpointsMap.forEach((countsItem, classKey, map) => {
            classDescriptionData.push(countsItem);
        });
        classDescriptionData.sort((a, b) => a.class.localeCompare(b.class));

        setTableHeaderSort("classPropertiesDescriptionTableBody", ["classPropertiesDescriptionTableClassHeader", "classPropertiesDescriptionTablePropertyHeader", "classPropertiesDescriptionTableTriplesHeader", "classPropertiesDescriptionTableDistinctSubjectsHeader", "classPropertiesDescriptionTableDistinctObjectsHeader", "classPropertiesDescriptionTableEndpointsHeader"], [(a, b) => a.class.localeCompare(b.class), (a, b) => b.property.localeCompare(a.property), (a, b) => b.triples - a.triples, (a, b) => b.distinctSubjects - a.distinctSubjects, (a, b) => b.distinctObjects - a.distinctObjects, (a, b) => b.endpoints.size - a.endpoints.size], fillClassPropertiesDescriptionTable, classDescriptionData);

        function fillClassPropertiesDescriptionTable() {
            var tableBody = $("#classPropertiesDescriptionTableBody");
            tableBody.empty();
            classDescriptionData.forEach((countsItem, i) => {
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
                endpointsCell.text(countsItem.endpoints.size);

                classRow.append(classCell);
                classRow.append(classPropertyCell);
                classRow.append(classTriplesCell);
                classRow.append(classDistinctSubjectsCell);
                classRow.append(classDistinctObjectsCell);
                classRow.append(endpointsCell);
                tableBody.append(classRow);
            });
        }
        fillClassPropertiesDescriptionTable()
    });
}
setButtonAsToggleCollapse('classDescriptionDetails', 'classDescriptionTable');
setButtonAsToggleCollapse('classPropertiesDescriptionDetails', 'classPropertiesDescriptionTable');

var descriptionElementChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('datasetdescriptionRadar')),
    option: {},
    fillFunction: function () {
        var provenanceWhoCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
            "GRAPH ?g { " +
            "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
            "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
            "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
            "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
            "OPTIONAL {" +
            "{ ?dataset <http://purl.org/dc/terms/creator> ?o } " +
            "UNION { ?dataset <http://purl.org/dc/terms/contributor> ?o } " +
            "UNION { ?dataset <http://purl.org/dc/terms/publisher> ?o } " +
            "} " +
            "} " +
            "VALUES ?g { " + graphValuesURIList + " } " +
            "} ";
        var provenanceLicenseCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
            "GRAPH ?g { " +
            "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
            "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
            "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
            "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
            "OPTIONAL {" +
            "{ ?dataset <http://purl.org/dc/terms/license> ?o } " +
            "UNION {?dataset <http://purl.org/dc/terms/conformsTo> ?o } " +
            "} " +
            "} " +
            "VALUES ?g { " + graphValuesURIList + " } " +
            "} ";
        var provenanceDateCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
            "GRAPH ?g { " +
            "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
            "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
            "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
            "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
            "OPTIONAL {" +
            " { ?dataset <http://purl.org/dc/terms/modified> ?o } " +
            "UNION { ?dataset <http://www.w3.org/ns/prov#wasGeneratedAtTime> ?o } " +
            "UNION { ?dataset <http://purl.org/dc/terms/issued> ?o } " +
            "} " +
            "} " +
            "VALUES ?g { " + graphValuesURIList + " } " +
            "} ";
        var provenanceSourceCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { " +
            "GRAPH ?g { " +
            "{ ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . } " +
            "UNION { ?dataset <http://ns.inria.fr/kg/index#curated> ?other . } " +
            "{ ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } " +
            "UNION { ?dataset <http://www.w3.org/ns/dcat#endpointUrl> ?endpointUrl } " +
            "OPTIONAL {" +
            "{ ?dataset <http://purl.org/dc/terms/source> ?o } " +
            "UNION { ?dataset <http://www.w3.org/ns/prov#wasDerivedFrom> ?o } " +
            "UNION { ?dataset <http://purl.org/dc/terms/format> ?o } " +
            "} " +
            "} " +
            "VALUES ?g { " + graphValuesURIList + " } " +
            "} ";
        var endpointDescriptionElementMap = new Map();
        sparqlQueryJSON(provenanceWhoCheckQuery, json => {
            json.results.bindings.forEach((item, i) => {
                var endpointUrl = item.endpointUrl.value;
                if (!blacklistedEndpointList.includes(endpointUrl)) {
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
                }
            });
            sparqlQueryJSON(provenanceLicenseCheckQuery, json => {
                json.results.bindings.forEach((item, i) => {
                    var endpointUrl = item.endpointUrl.value;
                    if (!blacklistedEndpointList.includes(endpointUrl)) {
                        var license = (item.o != undefined);
                        var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                        currentEndpointItem.license = license;
                        if (license) {
                            currentEndpointItem.licenseValue = item.o.value;
                        }
                        endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                    }
                });
                sparqlQueryJSON(provenanceDateCheckQuery, json => {
                    json.results.bindings.forEach((item, i) => {
                        var endpointUrl = item.endpointUrl.value;
                        if (!blacklistedEndpointList.includes(endpointUrl)) {
                            var time = (item.o != undefined);
                            var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                            currentEndpointItem.time = time;
                            if (time) {
                                currentEndpointItem.timeValue = item.o.value;
                            }
                            endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                        }
                    });
                    sparqlQueryJSON(provenanceSourceCheckQuery, json => {
                        json.results.bindings.forEach((item, i) => {
                            var endpointUrl = item.endpointUrl.value;
                            if (!blacklistedEndpointList.includes(endpointUrl)) {
                                var source = (item.o != undefined);
                                var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                                currentEndpointItem.source = source;
                                if (source) {
                                    currentEndpointItem.sourceValue = item.o.value;
                                }
                                endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                            }
                        });

                        var data = [];
                        endpointDescriptionElementMap.forEach((prov, endpoint, map) => {
                            data.push(prov)
                        });

                        data.sort((a, b) => {
                            return a.endpoint.localeCompare(b.endpoint);
                        });

                        // Table
                        function fillTestTable() {
                            var tableBody = $('#datasetDescriptionTableBody');
                            tableBody.empty();
                            data.forEach((item, i) => {
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
                        }

                        setTableHeaderSort("datasetDescriptionTableBody", ["datasetDescriptionTableEndpointHeader", "datasetDescriptionTableWhoHeader", "datasetDescriptionTableLicenseHeader", "datasetDescriptionTableDateHeader", "datasetDescriptionTableSourceHeader"], [(a, b) => a.endpoint.localeCompare(b.endpoint), (a, b) => a.who.toString().localeCompare(b.who.toString()), (a, b) => a.license.toString().localeCompare(b.license.toString()), (a, b) => a.time.toString().localeCompare(b.time.toString()), (a, b) => a.source.toString().localeCompare(b.source.toString())], fillTestTable, data);

                        fillTestTable();

                        // chart
                        var whoDataScore = 0;
                        var licenseDataScore = 0;
                        var timeDataScore = 0;
                        var sourceDataScore = 0;

                        var dataSeries = data.forEach(dataItem => {
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
                                { value: (data.length - whoDataScore), name: 'Absence of the description of creator/owner/contributor' },
                            ]
                        };
                        if ((data.length - whoDataScore) > 0) {
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
                                { value: (data.length - licenseDataScore), name: 'Absence of licensing description' },
                            ]
                        };
                        if ((data.length - licenseDataScore) > 0) {
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
                                { value: (data.length - timeDataScore), name: 'Absence of time-related description' },
                            ]
                        };
                        if ((data.length - timeDataScore) > 0) {
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
                                { value: (data.length - sourceDataScore), name: 'Absence of description of the origin of the dataset' },
                            ]
                        };
                        if ((data.length - sourceDataScore) > 0) {
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
                });
            });
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
setButtonAsToggleCollapse('datasetDescriptionStatDetails', 'datasetDescriptionTable');
setButtonAsToggleCollapse('datasetDescriptionExplain', 'datasetDescriptionExplainText');

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
            "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?g ?endpointUrl ?measure ";
        this.shortUrisMeasureQuery = shortUrisMeasureQuery;
        $('#shortUrisQueryCell').empty();
        $('#shortUrisQueryCell').append($(document.createElement('code')).text(shortUrisMeasureQuery))
        sparqlQueryJSON(shortUrisMeasureQuery, json => {
            var shortUriData = []
            var graphSet = new Set();
            json.results.bindings.forEach((jsonItem, i) => {
                var endpoint = jsonItem.endpointUrl.value;
                if (!blacklistedEndpointList.includes(endpoint)) {
                    var shortUriMeasure = Number.parseFloat(jsonItem.measure.value * 100);
                    var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");

                    graphSet.add(graph);
                    shortUriData.push({ graph: graph, endpoint: endpoint, measure: shortUriMeasure })
                }
            });

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
setButtonAsToggleCollapse('shortUrisDetails', 'shortUrisTable');

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
            "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?g ?endpointUrl ?measure ";
        $('#rdfDataStructuresQueryCell').empty();
        $('#rdfDataStructuresQueryCell').append($(document.createElement('code')).text(this.query));

        sparqlQueryJSON(this.query, json => {
            var rdfDataStructureData = []
            var graphSet = new Set();
            json.results.bindings.forEach((jsonItem, i) => {
                var endpoint = jsonItem.endpointUrl.value;
                if (!blacklistedEndpointList.includes(endpoint)) {
                    var rdfDataStructureMeasure = Number.parseFloat(jsonItem.measure.value * 100);
                    var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");

                    graphSet.add(graph);
                    rdfDataStructureData.push({ graph: graph, endpoint: endpoint, measure: rdfDataStructureMeasure })
                }
            });

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
setButtonAsToggleCollapse('rdfDataStructuresDetails', 'rdfDataStructuresTable');

var readableLabelsChart = new KartoChart({
    chartObject: echarts.init(document.getElementById('readableLabelsScatter')), option: {}, fillFunction: function () {
        this.query = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "}" +
            "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?g ?endpointUrl ?measure ";
        $('#readableLabelsQueryCell').empty();
        $('#readableLabelsQueryCell').append($(document.createElement('code')).text(this.query))

        sparqlQueryJSON(this.query, json => {
            var readableLabelData = []
            var graphSet = new Set();
            json.results.bindings.forEach((jsonItem, i) => {
                var endpoint = jsonItem.endpointUrl.value;
                if (!blacklistedEndpointList.includes(endpoint)) {
                    var readableLabelMeasure = Number.parseFloat(jsonItem.measure.value * 100);
                    var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");

                    graphSet.add(graph);
                    readableLabelData.push({ graph: graph, endpoint: endpoint, measure: readableLabelMeasure })
                }
            });

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
setButtonAsToggleCollapse('readableLabelsDetails', 'readableLabelsTable');

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
            "  VALUES ?g { " + graphValuesURIList + " } } GROUP BY ?g ?endpointUrl ?measure ";
        $('#blankNodesQueryCell').empty();
        $('#blankNodesQueryCell').append($(document.createElement('code')).text(this.query))

        sparqlQueryJSON(this.query, json => {
            var blankNodeData = []
            var graphSet = new Set();
            json.results.bindings.forEach((jsonItem, i) => {
                var endpoint = jsonItem.endpointUrl.value;
                if (!blacklistedEndpointList.includes(endpoint)) {
                    var blankNodeMeasure = Number.parseFloat(jsonItem.measure.value * 100);
                    var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");

                    graphSet.add(graph);
                    blankNodeData.push({ graph: graph, endpoint: endpoint, measure: blankNodeMeasure })
                }
            });

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
setButtonAsToggleCollapse('blankNodesDetails', 'blankNodesTable');





var mainContentColWidth = 0; // Used to initialize graph width;

var graphList = [];
var graphValuesURIList = "";
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

    // Initialization of the map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFpbGxwaWVycmUiLCJhIjoiY2t5OXlxeXhkMDBlZDJwcWxpZTF4ZGkxZiJ9.dCeJEhUs7EF2HI50vdv-7Q', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFpbGxwaWVycmUiLCJhIjoiY2t5OXlxeXhkMDBlZDJwcWxpZTF4ZGkxZiJ9.dCeJEhUs7EF2HI50vdv-7Q'
    }).addTo(endpointMap.chartObject);
    endpointMap.layerGroup = L.layerGroup().addTo(endpointMap.chartObject);

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
        $("select option:selected").each(function () {
            var selectionIndex = $(this).val();
            changeGraphSetIndex(selectionIndex);
        })
    });
    // set up blacklist
    if (urlParams.has(blackListedEndpointParameter)) {
        var blackistedEndpointIndexListRaw = urlParams.get(blackListedEndpointParameter);
        blackistedEndpointIndexList = JSON.parse(decodeURI(blackistedEndpointIndexListRaw));
    }
});