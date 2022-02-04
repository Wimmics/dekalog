import * as d3 from 'd3';
import * as echarts from "./echarts.js";
import $ from 'jquery';
import 'leaflet';
import {greenIcon, orangeIcon} from "./leaflet-color-markers.js";
import {endpointIpMap, timezoneMap, graphLists} from "./data.js";


// Initialization of the map
var map = L.map('map').setView([24.5271348225978, 62.22656250000001], 2);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFpbGxwaWVycmUiLCJhIjoiY2t5OXlxeXhkMDBlZDJwcWxpZTF4ZGkxZiJ9.dCeJEhUs7EF2HI50vdv-7Q', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFpbGxwaWVycmUiLCJhIjoiY2t5OXlxeXhkMDBlZDJwcWxpZTF4ZGkxZiJ9.dCeJEhUs7EF2HI50vdv-7Q'
    }).addTo(map);
var layerGroup = L.layerGroup().addTo(map);

$(window).resize(() => {
    redrawCharts();
})

// Initialization of the ECharts components
var sparql10Chart = echarts.init(document.getElementById('histo1'));
var sparql11Chart = echarts.init(document.getElementById('histo2'));
var tripleScatterChart = echarts.init(document.getElementById('tripleScatter'));
var classScatterChart = echarts.init(document.getElementById('classScatter'));
var propertyScatterChart = echarts.init(document.getElementById('propertyScatter'));
var categoryScatterChart = echarts.init(document.getElementById('testCategoryScatter'));
var totalRuntimeChart = echarts.init(document.getElementById('totalRuntimeScatter'));
var averageRuntimeChart = echarts.init(document.getElementById('averageRuntimeScatter'));
var vocabForceGraph = echarts.init(document.getElementById('vocabs'));
var endpointKeywordsForceGraph = echarts.init(document.getElementById('endpointKeywords'));
var shortUriChart = echarts.init(document.getElementById('shortUrisScatter'));
var rdfDataStructureChart = echarts.init(document.getElementById('rdfDataStructuresScatter'));
var readableLabelChart = echarts.init(document.getElementById('readableLabelsScatter'));
var datasetdescriptionChart = echarts.init(document.getElementById('datasetdescriptionRadar'));

function sparqlQueryJSON(query, callback, errorCallback) {
    xmlhttpRequestJSON('http://prod-dekalog.inria.fr/sparql?query='+encodeURIComponent(query)+"&format=json", callback, errorCallback);
};

function xmlhttpRequestJSON(url, callback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if(this.status == 200) {
                var response = JSON.parse(this.responseText);
                callback(response);
            } else if(errorCallback != undefined) {
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
    if(n != undefined) {
        return Number.parseFloat(x).toPrecision(n);
    }
    return Number.parseFloat(x).toPrecision(2);
}

function collapseHtml(htmlId) {
    var jQuerySelect = $('#'+htmlId);
    jQuerySelect.removeClass('show');
    jQuerySelect.addClass('collapse');
}

function unCollapseHtml(htmlId) {
    var jQuerySelect = $('#'+htmlId);
    jQuerySelect.removeClass('collapse');
    jQuerySelect.addClass('show');
}

// Parse the date in any format
function parseDate(input, format) {
  format = format || 'yyyy-mm-dd'; // default format
  var parts = input.match(/(\d+)/g),
      i = 0, fmt = {};
  // extract date-part indexes from the format
  format.replace(/(yyyy|dd|mm)/g, function(part) { fmt[part] = i++; });

  return new Date(parts[fmt['yyyy']], parts[fmt['mm']]-1, parts[fmt['dd']]);
}

function getForceGraphOption(title, legendData, dataNodes, dataLinks) {
    var categories = [];
    legendData.forEach((item, i) => {
        categories.push({ name:item });
    });
    return {
        title: {
          text: title,
          top: 'bottom',
          left: 'center'
        },
        //tooltip: { show:true },
        legend: [
            { data: legendData }
        ],
        series: [
          {
            type: 'graph',
            layout: 'force',
            data: dataNodes,
            links: dataLinks,
            categories: categories,
            roam: true,
            draggable:true,
            label: {
                show:false
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
            text:title,
        },
        xAxis: {
            type:'category',
            data:categories,
            axisLabel:{
                show:true,
                interval:0
            }
        },
        yAxis: {
        },
        series: series,
        tooltip:{
            show:'true'
        }
    };
}
function getCategoryScatterDataSeriesFromMap(dataMap) {
    var series = [];
    dataMap.forEach((value, key, map) => {
        var chartSerie = {
            name:key,
            label:'show',
            symbolSize: 5,
            data:[...new Set(value)].sort((a,b) => a[0].localeCompare(b[0])),
            type: 'line'
        };

        series.push(chartSerie);
    });
    return series;
}
function setTableHeaderSort(tableBodyId, tableHeadersIds, tableColsSortFunction, tableFillFunction, dataArray) {
    var tableBody = $('#'+tableBodyId);
    tableHeadersIds.forEach((tableheaderId, i) => {
        $('#'+tableheaderId).click(function() {
            tableBody.empty();
            var ascSortColClass = "sortCol"+ i +"Asc";
            var descSortColClass = "sortCol"+ i +"Desc";
            var colSortFunction = tableColsSortFunction[i];
            if(! tableBody.hasClass(ascSortColClass)) {
                tableBody.removeClass(descSortColClass);
                tableBody.addClass(ascSortColClass);
                dataArray.sort((a,b) => colSortFunction(a,b));
            } else {
                tableBody.addClass(descSortColClass);
                tableBody.removeClass(ascSortColClass);
                dataArray.sort((a,b) => - colSortFunction(a,b));
            }
            tableFillFunction();
        });
    });
}

function refresh() {
    graphValuesURIList = generateGraphValuesURI(graphList);
    clear();
    mapFill();
    sparqlesHistoFill();
    vocabRelatedContentFill();
    tripleNumberScatter();
    classNumberFill();
    propertyNumberFill();
    categoryTestNumberFill();
    testTableFill();
    runtimeStatsFill();
//    availabilityFill();
    averageRuntimeStatsFill();
    classAndPropertiesContentFill();
    descriptionElementFill();
    shortUrisFill();
    rdfDataStructuresFill();
    readableLabelsFill();
}

function clear() {
    layerGroup.clearLayers();
    sparql10Chart.setOption({series:[]}, true);
    sparql11Chart.setOption({series:[]}, true);
    totalRuntimeChart.setOption({series:[]}, true);
    averageRuntimeChart.setOption({series:[]}, true);
    hideVocabularyContent();
    hideTriplesNumberContent();
    hideClassNumberContent();
    hidePropertyNumberContent();
    hideCategoryTestNumberContent();
    hideShortUrisContent();
    hideRDFDataStructuresContent();
    hideReadableLabelsContent();
//    hideAvailabilityContent();
    datasetdescriptionChart.setOption({series:[]}, true);
    $('#endpointKnownVocabsTableBody').empty();
    $('#rulesTableBody').empty();
    $('#datasetDescriptionTableBody').empty();
    $('#endpointKeywordsTableBody').empty();
}

function redrawCharts() {
    redrawVocabRelatedContentCharts();
    redrawSPARQLFeaturesChart();
    redrawTriplesNumberContentChart();
    redrawClassesNumberContentChart();
    redrawPropertyNumberContentChart();
    redrawCategoryTestNumberChart();
    redrawDescriptionElementChart();
    redrawTotalRuntimeScatterChart();
    redrawAverageRuntimeChart();
    redrawShortUrisChart();
    redrawRDFDataStructuresChart();
    redrawReadableLabelsChart();
}

function generateGraphValuesURI( graphs) {
    var result = "";
    graphs.forEach((item, i) => {
        result += " <"+ item +"> ";
    });
    return result;
}

var graphList = [];
var graphValuesURIList = "";
var currentGraphSetIndex = 0;
const graphSetIndexParameter = "graphSetIndex";
var url = new URL(window.location);
var urlParams = new URLSearchParams(url.search);
$( document ).ready(function() {
    var url = new URL(window.location);
    urlParams = new URLSearchParams(url.search);
    if(urlParams.has(graphSetIndexParameter) ) {
        const givenGraphSetIndex = urlParams.get(graphSetIndexParameter);
        if(givenGraphSetIndex >= 0 && givenGraphSetIndex < graphLists.length) {
            currentGraphSetIndex = givenGraphSetIndex;
        }
    }
    var select = $('#endpoint-list-select');
    graphLists.forEach((item, i) => {
        var option = document.createElement('option');
        $(option).text(item.name);
        $(option).val(i);
        if(i == currentGraphSetIndex) {
            $(option).attr("selected","true")
            graphList = item.graphs;
        }
        select.append(option);
    });
    changeGraphSetIndex(currentGraphSetIndex);
    select.change(function() {
        $( "select option:selected" ).each(function() {
            var selectionIndex = $( this ).val();
            changeGraphSetIndex(selectionIndex);
        })
    });
});

function changeGraphSetIndex(index) {
    urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(graphSetIndexParameter);
    urlParams.append(graphSetIndexParameter, index);
    history.pushState(null, null, '?'+urlParams.toString());
    graphList = graphLists[index].graphs;
    refresh();
}

function setButtonAsTableCollapse(buttonId, tableId) {
    $('#'+buttonId).click(function() {
        if($('#'+tableId).hasClass("show")) {
            collapseHtml(tableId);
        } else {
            unCollapseHtml(tableId);
        }
    });
}

function mapFill() {
    var endpointGeolocTableBody = $('#endpointGeolocTableBody');
    endpointGeolocTableBody.empty();
    var endpointGeolocData = [];

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

    setTableHeaderSort('endpointGeolocTableBody', ['endpointGeolocTableEndpointHeader', 'endpointGeolocTableLatHeader', 'endpointGeolocTableLonHeader', 'endpointGeolocTableCountryHeader', 'endpointGeolocTableRegionHeader', 'endpointGeolocTableCityHeader', 'endpointGeolocTableOrgHeader'], [(a,b) => a.endpoint.localeCompare(b.endpoint), (a,b) => a.lat - b.lat, (a,b) => a.lon - b.lon, (a,b) => a.country.localeCompare(b.country), (a,b) => a.region.localeCompare(b.region), (a,b) => a.city.localeCompare(b.city), (a,b) => a.org.localeCompare(b.org)], endpointGeolocTableFill, endpointGeolocData)
    // Marked map with the geoloc of each endpoint
    endpointIpMap.forEach((item, i) => {
        // Add the markers for each endpoints.
        var endpoint = item.key;


        // Filter the endpoints according to their graphs
        var endpointInGraphQuery = "ASK { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <"+ endpoint +"> . } VALUES ?g { "+ graphValuesURIList +" } }";
        sparqlQueryJSON(endpointInGraphQuery, jsonAskResponse => {
            var booleanResponse = jsonAskResponse.boolean;

            if(booleanResponse) {
                // Study of the timezones
                // http://worldtimeapi.org/pages/examples
                var markerIcon = greenIcon;
                var endpointTimezoneSPARQL = new Map();
                var timezoneSPARQLquery = "SELECT DISTINCT ?timezone { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <"+ endpoint +"> . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <https://schema.org/broadcastTimezone> ?timezone } VALUES ?g { "+ graphValuesURIList +" } }";
                sparqlQueryJSON(timezoneSPARQLquery, jsonResponse => {
                    jsonResponse.results.bindings.forEach((itemResponse, i) => {
                        endpointTimezoneSPARQL.set(endpoint, itemResponse.timezone.value);
                    });

                    var ipTimezoneArrayFiltered = timezoneMap.filter(itemtza => itemtza.key == item.value.geoloc.timezone);
                    var ipTimezone;
                    if(ipTimezoneArrayFiltered.length > 0) {
                        ipTimezone = ipTimezoneArrayFiltered[0].value.utc_offset;
                    }
                    var sparqlTimezone = endpointTimezoneSPARQL.get(endpoint);
                    var badTimezone = false;
                    if(sparqlTimezone != undefined
                        && ipTimezone != undefined
                        && (ipTimezone.padStart(6, '-') != sparqlTimezone.padStart(6, '-') ) // addding + and - at the beginnig in case they are missing
                        && (ipTimezone.padStart(6, '+') != sparqlTimezone.padStart(6, '+') ) ) {
                        badTimezone = true;
                        markerIcon = orangeIcon;
                    }

                    var endpointMarker = L.marker([item.value.geoloc.lat, item.value.geoloc.lon], { icon:markerIcon });
                    var endpointItem = {endpoint:endpoint, lat:item.value.geoloc.lat, lon:item.value.geoloc.lon, country:"", region:"", city:"", org:""};
                    if(item.value.geoloc.country != undefined) {
                        endpointItem.country = item.value.geoloc.country;
                    }
                    if(item.value.geoloc.regionName != undefined) {
                        endpointItem.region = item.value.geoloc.regionName;
                    }
                    if(item.value.geoloc.city != undefined) {
                        endpointItem.city =item.value.geoloc.city;
                    }
                    if(item.value.geoloc.org != undefined) {
                        endpointItem.org = item.value.geoloc.org;
                    }
                    endpointGeolocData.push(endpointItem);
                    addLineToEndpointGeolocTable(endpointItem);
                    endpointMarker.on('click', clickEvent => {
                        var labelQuery = "SELECT DISTINCT ?label  { GRAPH ?g { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> <" + endpoint + "> . { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } UNION { ?dataset <http://purl.org/dc/terms/title> ?label } UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } UNION { ?dataset <http://schema.org/name> ?label } . } VALUES ?g { "+ graphValuesURIList +" } }";
                            sparqlQueryJSON(labelQuery, responseLabels => {

                                var popupString = "<table> <thead> <tr> <th colspan='2'> <a href='" + endpoint + "' >" + endpoint + "</a> </th> </tr> </thead>" ;
                                popupString += "</body>"
                                if(item.value.geoloc.country != undefined) {
                                    popupString += "<tr><td>Country: </td><td>" + item.value.geoloc.country + "</td></tr>" ;
                                }
                                if(item.value.geoloc.regionName != undefined) {
                                    popupString += "<tr><td>Region: </td><td>" + item.value.geoloc.regionName  + "</td></tr>";
                                }
                                if(item.value.geoloc.city != undefined) {
                                    popupString += "<tr><td>City: </td><td>" + item.value.geoloc.city  + "</td></tr>";
                                }
                                if(item.value.geoloc.org != undefined) {
                                    popupString += "<tr><td>Organization: </td><td>" + item.value.geoloc.org + "</td></tr>";
                                }
                                if(badTimezone) {
                                    popupString += "<tr><td>Timezone of endpoint URL: </td><td>" + ipTimezone + "</td></tr>";
                                    popupString += "<tr><td>Timezone declared by endpoint: </td><td>" + sparqlTimezone + "</td></tr>";
                                }
                                if(responseLabels.results.bindings.size > 0) {
                                    popupString += "<tr><td colspan='2'>" + responseLabels  + "</td></tr>" ;
                                }
                                popupString += "</tbody>"
                                popupString += "</table>"
                                endpointMarker.bindPopup(popupString).openPopup();

                            });
                        });
                        endpointMarker.addTo(layerGroup);
                    });
                }
            });
        });
}
setButtonAsTableCollapse('endpointGeolocDetails', 'endpointGeolocTable');

var sparql10ChartOption = {};
var sparql11ChartOption = {};
function sparqlesHistoFill() {
// Create an histogram of the SPARQLES rules passed by endpoint.
    var sparqlesFeatureQuery = 'SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) WHERE { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . FILTER(CONTAINS(str(?activity), ?sparqlNorm)) VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } } VALUES ?g { '+ graphValuesURIList +' } } GROUP BY ?endpoint ?sparqlNorm ORDER BY DESC( ?endpoint)';
    sparqlQueryJSON(sparqlesFeatureQuery, json => {
        var jsonBaseFeatureSparqles = [];
        var sparql10Map = new Map();
        var sparql11Map = new Map();
        json.results.bindings.forEach((bindingItem, i) => {
            var endpointUrl = bindingItem.endpoint.value;
            var feature = bindingItem.sparqlNorm.value;
            var count = bindingItem.count.value;
            if(feature == "SPARQL10") {
                sparql10Map.set(endpointUrl, Number(count));
            } else if (feature == "SPARQL11") {
                sparql11Map.set(endpointUrl, Number(count));
            }
        });
        sparql10Map.forEach((value, key, map) => {
            var sparql10 = value;
            var sparql11 = sparql11Map.get(key);
            jsonBaseFeatureSparqles.push({'endpoint':key, 'sparql10':sparql10/24, 'sparql11':sparql11/19, 'sparqlTotal':(sparql10 + sparql11)/43});
        });

        var chart10ValueMap = new Map();
        var chart11ValueMap = new Map();
        var chartSPARQLValueMap = new Map();

        for(var i = 1; i <= 10 ; i++) {
            chart10ValueMap.set(i, 0);
            chart11ValueMap.set(i, 0);
            chartSPARQLValueMap.set(i, 0);
        }
        jsonBaseFeatureSparqles.forEach((item, i) => {
            for(var i = 1; i <= 10 ; i++) {
                if(item.sparql10 >= (i/10) && item.sparql10 < ((i+1)/10)) {
                    chart10ValueMap.set(i, chart10ValueMap.get(i)+1);
                }
                if(item.sparql11 >= (i/10) && item.sparql11 < ((i+1)/10)) {
                    chart11ValueMap.set(i, chart11ValueMap.get(i)+1);
                }
                if(item.sparqlTotal >= (i/10) && item.sparqlTotal < ((i+1)/10)) {
                    chartSPARQLValueMap.set(i, chartSPARQLValueMap.get(i)+1);
                }
            }
        });

        var chart10DataMap = new Map();
        var chart11DataMap = new Map();
        var chartSPARQLDataMap = new Map();
        var categorySet = new Set();
        chart10ValueMap.forEach((value, key, map) => {
            var categoryName = "[ " + ((key-1)*10).toString() + "%, "+ (key*10).toString() + " % ]";
            categorySet.add(categoryName);
            chart10DataMap.set(categoryName, value);
        });
        chart11ValueMap.forEach((value, key, map) => {
            var categoryName = "[ " + ((key-1)*10).toString() + "%, "+ (key*10).toString() + " % ]";
            categorySet.add(categoryName);
            chart11DataMap.set(categoryName, value);
        });
        chartSPARQLValueMap.forEach((value, key, map) => {
            var categoryName = "[ " + ((key-1)*10).toString() + "%, "+ (key*10).toString() + " % ]";
            categorySet.add(categoryName);
            chartSPARQLDataMap.set(categoryName, value);
        });
        var categories = ([...categorySet]).sort((a,b) => a.localeCompare(b));
        var sparql10seriesMap = new Map();
        var sparql11seriesMap = new Map();
        categories.forEach((category, i) => {
           if(sparql10seriesMap.get(category) == undefined) {
               sparql10seriesMap.set(category, []);
           }
           sparql10seriesMap.get(category).push(chart10DataMap.get(category));

          if(sparql11seriesMap.get(category) == undefined) {
              sparql11seriesMap.set(category, []);
          }
          sparql11seriesMap.get(category).push(chart11DataMap.get(category));
        });

        var sparql10Series = [];
        var sparql11Series = [];
        sparql10seriesMap.forEach((serie, category, map) => {
            sparql10Series.push({
                name: category,
                type: 'bar',
                data: serie,
                label: {
                    show:false
                }
            },)
        });
        sparql11seriesMap.forEach((serie, category, map) => {
            sparql11Series.push({
                name: category,
                type: 'bar',
                data: serie,
                label: {
                    show:false
                }
            },)
        });


        sparql10ChartOption = {
            title: {
                align: 'center',
                textalign: 'center',
                left: 'center',
                text:"Number of endpoints according to\n their coverage of SPARQL 1.0 features",
                textStyle: {
        		    overflow: 'break',
                    width:"80%"
                }
            },
            legend: {
                data:[...categories],
                show: true,
                top: 'bottom'
            },
            toolbox: {
                show: false
            },
            tooltip: {
                show:true
            },
            xAxis: {
                type:'category'
            },
            yAxis: {
            },
            color: ["#000000", "#001C02", "#003805", "#005407", "#007009", "#008D0C", "#00A90E", "#00C510", "#00E113", "#00FD15"],
            series:sparql10Series ,
        };
        sparql11ChartOption = {
            title: {
                left: 'center',
                text:"Number of endpoints according to\n their coverage of SPARQL 1.1 features",
                textStyle: {
        		    overflow: 'breakAll',
                    width:"80%"
                }
            },
            legend: {
                data:[...categories],
                show: true,
                top: 'bottom'
            },
            toolbox: {
                show: false
            },
            tooltip: {
                show:true
            },
            xAxis: {
                type:'category'
            },
            yAxis: {
            },
            color: ["#000000", "#001C02", "#003805", "#005407", "#007009", "#008D0C", "#00A90E", "#00C510", "#00E113", "#00FD15"],
            series:sparql11Series ,
        };
        sparql10Chart.setOption(sparql10ChartOption, true);
        sparql11Chart.setOption(sparql11ChartOption, true);

        jsonBaseFeatureSparqles.sort((a,b) => {
            return a.endpoint.localeCompare(b.endpoint);
        });

        function fillTestTable() {
            var tableBody = $('#SPARQLFeaturesTableBody');
            tableBody.empty();
            jsonBaseFeatureSparqles.forEach((item, i) => {
                var endpoint = item.endpoint;
                var sparql10 = precise(item.sparql10*100, 3);
                var sparql11 = precise(item.sparql11*100, 3);
                var endpointRow = $(document.createElement("tr"));
                var endpointCell = $(document.createElement("td"));
                var sparql10Cell = $(document.createElement("td"));
                var sparql11Cell = $(document.createElement("td"));
                endpointCell.text(endpoint);
                sparql10Cell.text(sparql10+"%");
                sparql11Cell.text(sparql11+"%");
                endpointRow.append(endpointCell);
                endpointRow.append(sparql10Cell);
                endpointRow.append(sparql11Cell);
                tableBody.append(endpointRow);
            });
        }

        setTableHeaderSort("SPARQLFeaturesTableBody", ["SPARQLFeaturesTableEndpointHeader", "SPARQL10FeaturesTableRuleHeader", "SPARQL11FeaturesTableRuleHeader"],  [(a,b) => a.endpoint.localeCompare(b.endpoint), (a,b) => a.sparql10 - b.sparql10, (a,b) => a.sparql11 - b.sparql11], fillTestTable, jsonBaseFeatureSparqles);

        fillTestTable();
    });
}
function redrawSPARQLFeaturesChart() {
    sparql10Chart.setOption(sparql10ChartOption, true);
    sparql10Chart.resize();
    sparql11Chart.setOption(sparql11ChartOption, true);
    sparql11Chart.resize();
}
setButtonAsTableCollapse('tableSPARQLFeaturesDetails', 'SPARQLFeaturesTable');

var vocabForceGraphOption = {};
var endpointKeywordsForceGraphOption = {};
function vocabRelatedContentFill() {
// Create an force graph with the graph linked by co-ocurrence of vocabularies
    var sparqlesVocabularies = "SELECT DISTINCT ?endpointUrl ?vocabulary ?g { GRAPH ?g { " +
        "{ ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
        "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?base , ?endpoint . " +
        "?base <http://rdfs.org/ns/void#vocabulary> ?vocabulary " +
        "} } " +
        "GROUP BY ?endpointUrl ?vocabulary ";

    sparqlQueryJSON(sparqlesVocabularies, json => {

        // Retrieval of the list of LOV vocabularies to filter the ones retrieved in the index
        var LOVVocabularies = new Set();
        var sumVocabSetSize = 0;
        var sumRawVocabSetSize = 0;
        xmlhttpRequestJSON("https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list", response => {
            response.forEach((item, i) => {
                LOVVocabularies.add(item.uri)
            });

            var gatherVocab = new Map(); // List of vocab per endpoint
            var endpointSet = new Set();
            var vocabSet = new Set();
            var rawVocabSet = new Set();
            var rawGatherVocab = new Map();
            json.results.bindings.forEach((bindingItem, i) => {
                var vocabulariUri = bindingItem.vocabulary.value;
                var endpointUri = bindingItem.endpointUrl.value;
                var graphUri = bindingItem.g.value;
                if(graphList.some(graphListItem => graphUri.localeCompare(graphListItem) == 0)) {
                    rawVocabSet.add(vocabulariUri);
                    if(! rawGatherVocab.has(endpointUri)) {
                        rawGatherVocab.set(endpointUri, new Set());
                    }
                    rawGatherVocab.get(endpointUri).add(vocabulariUri);
                    if(LOVVocabularies.has(vocabulariUri)) {
                        endpointSet.add(endpointUri);
                        vocabSet.add(vocabulariUri);
                        if(! gatherVocab.has(endpointUri)) {
                            gatherVocab.set(endpointUri, new Set());
                        }
                        gatherVocab.get(endpointUri).add(vocabulariUri);
                    }
                }
            });

            // Endpoint and vocabularies graph
            var jsonVocabLinks = new Set();
            var jsonVocabNodes = new Set();

            endpointSet.forEach(item => {
                jsonVocabNodes.add({name:item, category:'Endpoint', symbolSize:5});
            });
            vocabSet.forEach(item => {
                jsonVocabNodes.add({name:item,  category:'Vocabulary', symbolSize:5})
            });
                var endpointKnownVocabulariestableBody = $('#endpointKnownVocabsTableBody');
                var sumknowVocabMeasure = 0;
                var knowVocabsData = [];
                gatherVocab.forEach(( endpointVocabs, endpointUrl, map1) => {
                    var measure = (endpointVocabs.size/rawGatherVocab.get(endpointUrl).size);
                    knowVocabsData.push({ 'endpoint':endpointUrl, 'measure':measure })

                    endpointVocabs.forEach((vocab, i) => {
                        jsonVocabLinks.add({source:endpointUrl, target:vocab})
                    });
                });

                if(jsonVocabNodes.size > 0 && jsonVocabLinks.size > 0) {
                showEndpointVocabularyContent();

                vocabForceGraphOption = getForceGraphOption('Endpoints and knowledge bases', ["Vocabulary", "Endpoint"], [...jsonVocabNodes], [...jsonVocabLinks]);
                vocabForceGraph.setOption(vocabForceGraphOption, true);

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
                        knownVocabMeasureCell.text(precise(measure*100, 3)+"%");
                        endpointRow.append(knownVocabMeasureCell);
                        endpointKnownVocabulariestableBody.append(endpointRow);
                    });
                };
                endpointKnowVocabsMeasureFill();
                setTableHeaderSort("endpointKnownVocabsTableBody", ["knownVocabEndpointHeader", "knownVocabMeasureHeader"], [(a,b) => a.endpoint.localeCompare(b.endpoint), (a,b) => a.measure - b.measure ], endpointKnowVocabsMeasureFill, knowVocabsData);

                // compputation of the know vocabularies measure
                var knownVocabulariesMeasureHtml = $('#KnownVocabulariesMeasure');
                knownVocabulariesMeasureHtml.text( precise((sumknowVocabMeasure / endpointSet.size)*100, 3)+"%");
            } else {
                hideEndpointVocabularyContent();
            }

            // Endpoint and vocabulary keywords graph
            var vocabularyQueryValues = "";
            vocabSet.forEach((item, i) => {
                vocabularyQueryValues += "<"+item+">";
                vocabularyQueryValues += " " ;
            });

            var keywordLOVQuery = "SELECT DISTINCT ?vocabulary ?keyword { " +
            "GRAPH <https://lov.linkeddata.es/dataset/lov> { " +
            "   ?vocabulary a <http://purl.org/vocommons/voaf#Vocabulary> . " +
            "   ?vocabulary <http://www.w3.org/ns/dcat#keyword> ?keyword . " +
            "} " +
            "VALUES ?vocabulary { "+ vocabularyQueryValues +" } " +
            "}"

            xmlhttpRequestJSON("https://lov.linkeddata.es/dataset/lov/sparql?query="+encodeURIComponent(keywordLOVQuery)+"&format=json", jsonKeywords => {

                var jsonKeywordLinks = new Set();
                var jsonKeywordNodes = new Set();

                var keywordSet = new Set();
                var keywordHitsMap = new Map();
                var vocabKeywordMap = new Map();
                var endpointKeywordsMap = new Map();
                jsonKeywords.results.bindings.forEach((keywordItem, i) => {
                    var keyword = keywordItem.keyword.value;
                    var vocab = keywordItem.vocabulary.value;
                    if(vocabKeywordMap.get(vocab) == undefined) {
                        vocabKeywordMap.set(vocab, [])
                    }
                    vocabKeywordMap.get(vocab).push(keyword);

                    keywordSet.add(keyword);
                });

                gatherVocab.forEach(( endpointVocabs, endpointUrl, map1) => {
                    endpointVocabs.forEach((endpointVocab, i) => {
                        var vocabKeywords = vocabKeywordMap.get(endpointVocab);
                        vocabKeywords.forEach((endpointKeyword, i) => {
                            jsonKeywordLinks.add({source:endpointUrl, target:endpointKeyword})

                            if(endpointKeywordsMap.get(endpointUrl) == undefined) {
                                endpointKeywordsMap.set(endpointUrl, new Set());
                            }
                            endpointKeywordsMap.get(endpointUrl).add(endpointKeyword);
                        });
                    });
                });

                keywordSet.forEach(item => {
                    jsonKeywordNodes.add({name:item, category:'Keyword', symbolSize:5})
                });
                endpointSet.forEach(item => {
                    jsonKeywordNodes.add({name:item, category:'Endpoint', symbolSize:5})
                });

                if(jsonKeywordNodes.size > 0 && jsonKeywordLinks.size > 0) {
                    showEndpointKeywordContent();

                    endpointKeywordsForceGraphOption = getForceGraphOption('Endpoints and keywords', ["Keyword", "Endpoint"], [...jsonKeywordNodes], [...jsonKeywordLinks]);
                    endpointKeywordsForceGraph.setOption(endpointKeywordsForceGraphOption, true);

                    var endpointKeywordsData = [];
                    endpointKeywordsMap.forEach((keywords, endpoint, map) => {
                        endpointKeywordsData.push({endpoint:endpoint, keywords:keywords})
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
                                if(keywordCount > 0) {
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

                    setTableHeaderSort("endpointKeywordsTableBody", ["endpointKeywordsTableEndpointHeader", "endpointKeywordsTableKeywordHeader"], [(a,b) => a.endpoint.localeCompare(b.endpoint), (a,b) => a.keywords.size - b.keywords.size ], endpointKeywordsTableFill, endpointKeywordsData);
                } else {
                    hideEndpointKeywordContent();
                }
            }, () => {
                hideEndpointKeywordContent();
            });
        }, () => {
            hideVocabularyContent();
        });
    }, () => {
        hideEndpointVocabularyContent();
    });
}
setButtonAsTableCollapse('KnownVocabulariesDetails', 'knowVocabEndpointTable');
setButtonAsTableCollapse('endpointKeywordsDetails', 'endpointKeywordsTable');
function hideVocabularyContent() {
    collapseHtml('vocabRelatedContent');
    hideEndpointVocabularyContent();
    hideEndpointKeywordContent();
}
function showVocabularyContent() {
    unCollapseHtml('vocabRelatedContent')
}
function hideEndpointVocabularyContent() {
    vocabForceGraph.setOption({series:[]}, true);
    collapseHtml('vocabs');
    collapseHtml('knowVocabEndpointMeasureRow');
    collapseHtml('knowVocabEndpointTable');
}
function hideEndpointKeywordContent() {
    endpointKeywordsForceGraph.setOption({series:[]}, true);
    collapseHtml('endpointKeywords');
    collapseHtml('endpointKeywordsDetails');
    $('#endpointKeywordsTableBody').empty();
}
function showEndpointVocabularyContent() {
    showVocabularyContent();
    unCollapseHtml('knowVocabEndpointMeasureRow');
    unCollapseHtml('vocabs');
}
function showEndpointKeywordContent() {
    showVocabularyContent();
    unCollapseHtml('endpointKeywords');
    unCollapseHtml('endpointKeywordsDetails');
}
function redrawVocabRelatedContentCharts() {
    vocabForceGraph.setOption(vocabForceGraphOption, true);
    vocabForceGraph.resize();
    endpointKeywordsForceGraph.setOption(endpointKeywordsForceGraphOption, true);
    endpointKeywordsForceGraph.resize();
}

var tripleScatterOption = {};
function tripleNumberScatter() {
    // Scatter plot of the number of triples through time
    var triplesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        //"?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
        "?base <http://rdfs.org/ns/void#triples> ?rawO ." +
        "}" +
        " VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?g ?endpointUrl ?o ORDER BY DESC(?g) DESC(?endpointUrl)"; //+" DESC(?modifDate)";
    sparqlQueryJSON(triplesSPARQLquery, json => {
        var endpointDataSerieMap = new Map();
        json.results.bindings.forEach((itemResult, i) => {
            var endpointUrl = itemResult.endpointUrl.value;

            endpointDataSerieMap.set(endpointUrl, []);
        });
        var graphSet = new Set();
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var endpointUrl = itemResult.endpointUrl.value;
            var triples = Number.parseInt(itemResult.o.value);
            graphSet.add(graph);
            endpointDataSerieMap.get(endpointUrl).push([graph,triples])
        });

        if(endpointDataSerieMap.size > 0) {
            showTriplesNumberContent()

            var triplesSeries = getCategoryScatterDataSeriesFromMap(endpointDataSerieMap);
            tripleScatterOption = getCategoryScatterOption("Size of the datasets", [...graphSet].sort((a,b)=>a.localeCompare(b)), triplesSeries);
            tripleScatterChart.setOption(tripleScatterOption, true);
            tripleScatterChart.setOption({xAxis:{axisLabel:{rotate:27}}});
            tripleScatterOption = tripleScatterChart.getOption();
        } else {
            hideTriplesNumberContent();
        }
    });
}
function hideTriplesNumberContent() {
    tripleScatterChart.setOption({series:[]}, true);
    collapseHtml('tripleScatter');
    //collapseHtml('triplesContentCol');
}
function showTriplesNumberContent() {
    unCollapseHtml('tripleScatter');
    //unCollapseHtml('triplesContentCol');
}
function redrawTriplesNumberContentChart() {
    tripleScatterChart.setOption(tripleScatterOption, true);
    tripleScatterChart.resize();
}

var classesScatterOption = {};
function classNumberFill() {
// Scatter plot of the number of classes through time
    var classesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) ?modifDate { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
        "?base <http://rdfs.org/ns/void#classes> ?rawO ." +
        "}" +
        "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?g ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
    sparqlQueryJSON(classesSPARQLquery, json => {
        var endpointDataSerieMap = new Map();
        //var xAxisDataSet = new Set();
        json.results.bindings.forEach((itemResult, i) => {
            var endpointUrl = itemResult.endpointUrl.value;

            endpointDataSerieMap.set(endpointUrl, []);
            //xAxisDataSet.add(graph);
        });
        var graphSet = new Set();
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var endpointUrl = itemResult.endpointUrl.value;
            var triples = Number.parseInt(itemResult.o.value);
            graphSet.add(graph);
            endpointDataSerieMap.get(endpointUrl).push([ graph, triples ])
        });

        if(endpointDataSerieMap.size > 0) {
            showClassesNumberContent();

            var classesSeries = getCategoryScatterDataSeriesFromMap(endpointDataSerieMap);
            classesScatterOption = getCategoryScatterOption("Number of classes in the datasets", [...graphSet].sort((a,b)=>a.localeCompare(b)), classesSeries);
            classScatterChart.setOption(classesScatterOption, true);
            classScatterChart.setOption({xAxis:{axisLabel:{rotate:27}}});
            classesScatterOption = classScatterChart.getOption();
        } else {
            hideClassNumberContent();
        }

    });
}
function hideClassNumberContent() {
    classScatterChart.setOption({series:[]}, true);
    collapseHtml('classScatter');
    //collapseHtml('tableClassesDetails');
}
function showClassesNumberContent() {
    unCollapseHtml('classScatter');
    //unCollapseHtml('tableClassesDetails');
}
function redrawClassesNumberContentChart() {
    classScatterChart.setOption(classesScatterOption, true);
    classScatterChart.resize();
}

var propertyNumberScatterOption = {};
function propertyNumberFill() {
// scatter plot of the number of properties through time
    var propertiesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl (MAX(?rawO) AS ?o) { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?base <http://rdfs.org/ns/void#properties> ?rawO ." +
        "}" +
        "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?endpointUrl ?g ?o ORDER BY DESC(?g) DESC(?endpointUrl) ";
    sparqlQueryJSON(propertiesSPARQLquery, json => {
        var endpointDataSerieMap = new Map();
        json.results.bindings.forEach((itemResult, i) => {
            var endpointUrl = itemResult.endpointUrl.value;

            endpointDataSerieMap.set(endpointUrl, []);
        });
        var endpointGraphPropertiesData = [];
        var graphSet = new Set();
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var endpointUrl = itemResult.endpointUrl.value;
            var properties = Number.parseInt(itemResult.o.value);
            graphSet.add(graph);
            endpointDataSerieMap.get(endpointUrl).push([ graph, properties ])
            endpointGraphPropertiesData.push({endpoint:endpointUrl, graph:graph, properties:properties})
        });

        if(endpointDataSerieMap.size > 0) {
            showPropertyNumberContent();
            var propertiesSeries = getCategoryScatterDataSeriesFromMap(endpointDataSerieMap);

            propertyNumberScatterOption = getCategoryScatterOption("Number of properties in the datasets", [...graphSet].sort((a,b)=>a.localeCompare(b)), propertiesSeries);
            propertyScatterChart.setOption(propertyNumberScatterOption, true);
            propertyScatterChart.setOption({xAxis:{axisLabel:{rotate:27}}});
            propertyNumberScatterOption = propertyScatterChart.getOption();
        } else {
            hidePropertyNumberContent();
        }

    });
}
function hidePropertyNumberContent() {
    propertyScatterChart.setOption({series:[]}, true);
    collapseHtml('propertyScatter');
    //collapseHtml('tablePropertiesDetails');
}
function showPropertyNumberContent() {
    unCollapseHtml('propertyScatter');
    //unCollapseHtml('tablePropertiesDetails');
}
function redrawPropertyNumberContentChart() {
    propertyScatterChart.setOption(propertyNumberScatterOption, true);
    propertyScatterChart.resize();
}

var categoryTestNumberScatterOption = {};
function categoryTestNumberFill() {
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
            "}  VALUES ?g { "+ graphValuesURIList +" } " +
        "} GROUP BY ?g ?category ?endpointUrl";
    sparqlQueryJSON(testCategoryQuery, json => {
        var endpointDataSerieMap = new Map();
        var categorySet = new Set();
        json.results.bindings.forEach((itemResult, i) => {
            var category = itemResult.category.value;

            endpointDataSerieMap.set(category, new Map());
            categorySet.add(category.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/", "").replace("/", ""));
        });
        json.results.bindings.forEach((itemResult, i) => {
            var category = itemResult.category.value;
            var count = itemResult.count.value;
    //        var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
    //        var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());
            var endpoint = itemResult.endpointUrl.value:
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');

            if(endpointDataSerieMap.get(category).get(graph) == undefined) {
                endpointDataSerieMap.get(category).set(graph, new Map());
            }
            endpointDataSerieMap.get(category).get( graph).set(endpoint, count);
        });

        if(endpointDataSerieMap.size > 0) {
            showCategoryTestNumberContent();

            var triplesSeries = [];
            endpointDataSerieMap.forEach((gemap, category, map1) => {
                var dataCategory = [];
                gemap.forEach((endpointMap, graph, map2) => {
                    var totalEndpointGraph = 0;
                    endpointMap.forEach((count, endpoint, map3) => {
                        totalEndpointGraph = totalEndpointGraph + Number.parseInt(count);
                    });
                    var numberOfEndpoint = endpointMap.size;
                    var avgEndpointGraph = precise(totalEndpointGraph / numberOfEndpoint);
                    var percentageAvrEndpointCategory = avgEndpointGraph;
                    if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 8)*100);
                    } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 4)*100);
                    } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 10)*100);
                    } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/")) {
                        percentageAvrEndpointCategory = (precise(percentageAvrEndpointCategory / 23)*100);
                    } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 25)*100);
                    } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/")) {
                        percentageAvrEndpointCategory = precise((percentageAvrEndpointCategory / 20)*100);
                    }

                    dataCategory.push([graph, percentageAvrEndpointCategory]);
                });

                dataCategory.sort((a, b) => a[0].localeCompare(b[0]));
                var chartSerie = {
                    name:category.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/", "").replace("/", ""),
                    label:'show',
                    symbolSize: 5,
                    data:dataCategory,
                    type: 'bar'
                };
                triplesSeries.push(chartSerie);
            });

            var categoriesArray = [...categorySet].sort((a, b) => a.localeCompare(b));
            triplesSeries.sort((a, b) => a.name.localeCompare(b.name))

            categoryTestNumberScatterOption = {
                title: {
                    left: 'center',
                    text:"Proportion of tests passed by category",
                },
                xAxis: {
                    type:'category'
                },
                legend: {
                    data:categoriesArray,
                    bottom:'bottom'
                },
                yAxis: {
                    max:100
                },
                series: triplesSeries,
                tooltip:{
                    show:'true'
                }
            };

            categoryScatterChart.setOption(categoryTestNumberScatterOption, true);
        } else {
            hideCategoryTestNumberContent();
        }
    });
}
function hideCategoryTestNumberContent() {
    categoryScatterChart.setOption({series:[]}, true);
    collapseHtml('testCategoryScatter');
}
function showCategoryTestNumberContent() {
    unCollapseHtml('testCategoryScatter');
}
function redrawCategoryTestNumberChart() {
    categoryScatterChart.setOption(categoryTestNumberScatterOption, true);
    categoryScatterChart.resize();
}

function testTableFill() {

    var appliedTestQuery = "SELECT DISTINCT ?endpointUrl ?rule { " +
            "GRAPH ?g { "+
                "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?curated . " +
                "?curated <http://www.w3.org/ns/prov#wasGeneratedBy> ?rule . " +
                "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "} " +
        "VALUES ?g { "+ graphValuesURIList +" } " +
        "} GROUP BY ?endpointUrl ?rule ORDER BY DESC(?endpointUrl) ";
    sparqlQueryJSON(appliedTestQuery, json => {
        var appliedTestMap = new Map();
        json.results.bindings.forEach((item, i) => {
            var endpointUrl = item.endpointUrl.value;
            var rule = item.rule.value;

            if(appliedTestMap.get(endpointUrl) == undefined) {
                appliedTestMap.set(endpointUrl, []);
            }
            appliedTestMap.get(endpointUrl).push(rule);
        });

        var appliedTestData = [];
        appliedTestMap.forEach((rules, endpoint, map) => {
            rules.sort((a,b) => a.localeCompare(b))
            appliedTestData.push({'endpoint':endpoint, 'rules':rules})
        });

        appliedTestData.sort((a,b) => {
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
                    if(i == 0) {
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
        $('#rulesTableEndpointHeader').click(function() {
            tableBody.empty();
            if(tableBody.hasClass('sortEndpointDesc')) {
                tableBody.removeClass('sortEndpointDesc');
                tableBody.addClass('sortEndpointAsc');
                appliedTestData.sort((a,b) => {
                    return a.endpoint.localeCompare(b.endpoint);
                });
            } else {
                tableBody.addClass('sortEndpointDesc');
                tableBody.removeClass('sortEndpointAsc');
                appliedTestData.sort((a,b) => {
                    return - a.endpoint.localeCompare(b.endpoint);
                });
            }
            fillTestTable();
        });

        fillTestTable();
    });
}
setButtonAsTableCollapse('tableRuleDetails', 'rulesTable');

var totalRuntimeScatterOption = {};
function runtimeStatsFill() {
    var maxMinTimeQuery = "SELECT DISTINCT ?g (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?data . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . }  VALUES ?g { "+ graphValuesURIList +" } }";
    var runtimeDataSerie = []
    var runtimeSerie = []
    sparqlQueryJSON(maxMinTimeQuery, jsonResponse => {
        var graphSet = new Set();
        jsonResponse.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var start = parseDate(itemResult.start.value, 'dd-mm-yyyyTHH:mm:ss');
            var end = parseDate(itemResult.end.value, 'dd-mm-yyyyTHH:mm:ss');
            var runtime = Math.abs((end - start)/1000);
            graphSet.add(graph);
            runtimeDataSerie.push([ graph, runtime ])
        });
        var runtimeSerie = {
            name:"Runtime in seconds",
            label:'show',
            symbolSize: 5,
            data:runtimeDataSerie,
            type: 'scatter'
        };
        totalRuntimeScatterOption = getCategoryScatterOption("Runtime of the framework for each run (in seconds)", [...graphSet].sort((a,b)=>a.localeCompare(b)), [runtimeSerie]);
        totalRuntimeChart.setOption(totalRuntimeScatterOption, true);
    });
}
function redrawTotalRuntimeScatterChart() {
    totalRuntimeChart.setOption(totalRuntimeScatterOption, true);
    totalRuntimeChart.resize();
}

var averageRuntimeChartOption = {};
function averageRuntimeStatsFill() {
    var maxMinTimeQuery = "SELECT DISTINCT ?g (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?data . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . }  VALUES ?g { "+ graphValuesURIList +" } }";
    var runtimeDataSerie = []
    var runtimeSerie = []
    sparqlQueryJSON(maxMinTimeQuery, jsonResponse => {

        var numberOfEndpointQuery = "SELECT DISTINCT ?g (COUNT(?dataset) AS ?count) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . }  VALUES ?g { "+ graphValuesURIList +" } }";
        sparqlQueryJSON(numberOfEndpointQuery, numberOfEndpointJson => {
            var numberEndpointMap = new Map();
            numberOfEndpointJson.results.bindings.forEach((numberEndpointItem, i) => {
                var graph = numberEndpointItem.g.value.replace('http://ns.inria.fr/indegx#','');
                var count = numberEndpointItem.count.value;

                numberEndpointMap.set(graph, count);
            });

            var graphSet = new Set();
            jsonResponse.results.bindings.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
                var start = parseDate(itemResult.start.value, 'dd-mm-yyyyTHH:mm:ss');
                var end = parseDate(itemResult.end.value, 'dd-mm-yyyyTHH:mm:ss');
                var numberOfEndpoint = numberEndpointMap.get(graph);
                var runtime = Math.floor(Math.abs((end - start)/1000)/numberOfEndpoint);

                graphSet.add(graph);
                runtimeDataSerie.push([ graph, runtime ])
            });
            var runtimeSerie = {
                name:"Average runtime in seconds",
                label:'show',
                symbolSize: 5,
                data:runtimeDataSerie,
                type: 'scatter'
            };
            averageRuntimeChartOption = getCategoryScatterOption("Average runtime of the framework for each run (in seconds)", [...graphSet].sort((a,b)=>a.localeCompare(b)), [runtimeSerie]);
            averageRuntimeChart.setOption(averageRuntimeChartOption, true);

        });
    });
}
function redrawAverageRuntimeChart() {
    averageRuntimeChart.setOption(averageRuntimeChartOption, true);
    averageRuntimeChart.resize();
}

/*
function availabilityFill() {
    var availabilityPassedQuery = "SELECT DISTINCT ?g (COUNT(?endpoint) AS ?count) { "+
    "GRAPH ?g { "+
    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . "+
    "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . "+
    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
    "?trace <http://www.w3.org/ns/earl#result> ?result . "+
    "?trace <http://www.w3.org/ns/earl#test> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/reachability.ttl> . "+
    "?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#passed> . "+
    "}  "+
    "VALUES ?g { "+ graphValuesURIList +" } "+
    "}";
    var availabilityFailedQuery = "SELECT DISTINCT ?g (COUNT(?data) AS ?count) { "+
    "GRAPH ?g { "+
    "?metadata <http://ns.inria.fr/kg/index#curated> ?data . "+
    "?metadata <http://ns.inria.fr/kg/index#trace> ?trace . "+
    "?trace <http://www.w3.org/ns/earl#result> ?result . "+
    "?trace <http://www.w3.org/ns/earl#test> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/reachability.ttl> . "+
    "?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#failed> . "+
    "} "+
    "VALUES ?g { "+ graphValuesURIList +" } }";

    sparqlQueryJSON(availabilityPassedQuery, jsonPassed => {
        console.log(jsonPassed)
            sparqlQueryJSON(availabilityFailedQuery, jsonFailed => {
                console.log(jsonFailed)


            });
    });
}

function hideAvailabilityContent() {
    availabilityScatterChart.setOption({series:[]}, true);
    collapseHtml('availabilityScatter');
}*/



function classAndPropertiesContentFill() {
    var classPartitionQuery = "SELECT DISTINCT ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
            "?base <http://rdfs.org/ns/void#classPartition> ?classPartition . " +
            "?classPartition <http://rdfs.org/ns/void#class> ?c . " +
            "OPTIONAL { "+
            "?classPartition <http://rdfs.org/ns/void#triples> ?ct . "+
            "} " +
            "OPTIONAL { "+
            "?classPartition <http://rdfs.org/ns/void#classes> ?cc . "+
            "} " +
            "OPTIONAL { "+
            "?classPartition <http://rdfs.org/ns/void#properties> ?cp . "+
            "} " +
            "OPTIONAL { "+
            "?classPartition <http://rdfs.org/ns/void#distinctSubjects> ?cs . "+
            "} " +
            "OPTIONAL { "+
            "?classPartition <http://rdfs.org/ns/void#distinctObjects> ?co . "+
            "} " +
            "FILTER(! isBlank(?c)) " +
            "}" +
            "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co ";
    sparqlQueryJSON(classPartitionQuery, json => {
        var classCountsEndpointsMap = new Map();
        json.results.bindings.forEach((item, i) => {
            var c = item.c.value;
            var endpointUrl = item.endpointUrl.value;

            if(classCountsEndpointsMap.get(c) == undefined) {
                classCountsEndpointsMap.set(c, {class:c});
            }
            if(item.ct != undefined) {
                var ct = Number.parseInt(item.ct.value);
                var currentClassItem = classCountsEndpointsMap.get(c);
                if(classCountsEndpointsMap.get(c).triples == undefined) {
                    currentClassItem.triples = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.triples = currentClassItem.triples + ct;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if(item.cc != undefined) {
                var cc = Number.parseInt(item.cc.value);
                var currentClassItem = classCountsEndpointsMap.get(c);
                if(classCountsEndpointsMap.get(c).classes == undefined) {
                    currentClassItem.classes = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.classes = currentClassItem.classes + cc;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if(item.cp != undefined) {
                var cp = Number.parseInt(item.cp.value);
                var currentClassItem = classCountsEndpointsMap.get(c);
                if(classCountsEndpointsMap.get(c).properties == undefined) {
                    currentClassItem.properties = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.properties = currentClassItem.properties + cp;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if(item.cs != undefined) {
                var cs = Number.parseInt(item.cs.value);
                var currentClassItem = classCountsEndpointsMap.get(c);
                if(classCountsEndpointsMap.get(c).distinctSubjects == undefined) {
                    currentClassItem.distinctSubjects = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.distinctSubjects = currentClassItem.distinctSubjects + cs;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if(item.co != undefined) {
                var co = Number.parseInt(item.co.value);
                var currentClassItem = classCountsEndpointsMap.get(c);
                if(classCountsEndpointsMap.get(c).distinctObjects == undefined) {
                    currentClassItem.distinctObjects = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.distinctObjects = currentClassItem.distinctObjects + co;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if(classCountsEndpointsMap.get(c).endpoints == undefined) {
                var currentClassItem = classCountsEndpointsMap.get(c);
                currentClassItem.endpoints = new Set();
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            classCountsEndpointsMap.get(c).endpoints.add(endpointUrl);
        });

        var classDescriptionData = [];
        classCountsEndpointsMap.forEach((countsItem, classKey, map) => {
            classDescriptionData.push(countsItem);
        });

        setTableHeaderSort("classDescriptionTableBody", ["classDescriptionTableClassHeader", "classDescriptionTableTriplesHeader", "classDescriptionTableClassesHeader", "classDescriptionTablePropertiesHeader", "classDescriptionTableDistinctSubjectsHeader", "classDescriptionTableDistinctObjectsHeader", "classDescriptionTableEndpointsHeader"], [(a,b) => a.class.localeCompare(b.class), (a,b) => b.triples - a.triples, (a,b) => b.classes - a.classes, (a,b) => b.properties - a.properties, (a,b) => b.distinctSubjects - a.distinctSubjects, (a,b) => b.distinctObjects - a.distinctObjects, (a,b) => b.endpoints.size - a.endpoints.size ], fillclassDescriptionTable, classDescriptionData);
        classDescriptionData.sort((a,b) => a.class.localeCompare(b.class));

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
            "OPTIONAL { "+
            "?classPropertyPartition <http://rdfs.org/ns/void#triples> ?pt . "+
            "} " +
            "OPTIONAL { "+
            "?classPropertyPartition <http://rdfs.org/ns/void#distinctSubjects> ?ps . "+
            "} " +
            "OPTIONAL { "+
            "?classPropertyPartition <http://rdfs.org/ns/void#distinctObjects> ?po . "+
            "} " +
            "}" +
            "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?endpointUrl ?c ?p ?pt ?po ?ps ";
    sparqlQueryJSON(classPropertyPartitionQuery, json => {

        var classPropertyCountsEndpointsMap = new Map();
        json.results.bindings.forEach((item, i) => {
            var c = item.c.value;
            var p = item.p.value;
            var mapKey = c+p;
            var endpointUrl = item.endpointUrl.value;

            if(classPropertyCountsEndpointsMap.get(mapKey) == undefined) {
                classPropertyCountsEndpointsMap.set(mapKey, {class:c, property:p});
            }
            if(item.pt != undefined) {
                var pt = Number.parseInt(item.pt.value);
                var currentClassItem = classCountsEndpointsMap.get(mapKey);
                if(classPropertyCountsEndpointsMap.get(mapKey).triples == undefined) {
                    currentClassItem.triples = 0;
                    classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                }
                currentClassItem.triples = currentClassItem.triples + pt;
                classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
            }
            if(item.ps != undefined) {
                var ps = Number.parseInt(item.ps.value);
                var currentClassItem = classPropertyCountsEndpointsMap.get(mapKey);
                if(classPropertyCountsEndpointsMap.get(mapKey).distinctSubjects == undefined) {
                    currentClassItem.distinctSubjects = 0;
                    classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                }
                currentClassItem.distinctSubjects = currentClassItem.distinctSubjects + ps;
                classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
            }
            if(item.po != undefined) {
                var po = Number.parseInt(item.po.value);
                var currentClassItem = classPropertyCountsEndpointsMap.get(mapKey);
                if(classPropertyCountsEndpointsMap.get(mapKey).distinctObjects == undefined) {
                    currentClassItem.distinctObjects = 0;
                    classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
                }
                currentClassItem.distinctObjects = currentClassItem.distinctObjects + po;
                classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
            }
            if(classPropertyCountsEndpointsMap.get(mapKey).endpoints == undefined) {
                var currentClassItem = classPropertyCountsEndpointsMap.get(mapKey);
                currentClassItem.endpoints = new Set();
                classPropertyCountsEndpointsMap.set(mapKey, currentClassItem);
            }
            classPropertyCountsEndpointsMap.get(mapKey).endpoints.add(endpointUrl);
        });

        var classDescriptionData = [];
        classPropertyCountsEndpointsMap.forEach((countsItem, classKey, map) => {
            classDescriptionData.push(countsItem);
        });
        classDescriptionData.sort((a,b) => a.class.localeCompare(b.class));

        setTableHeaderSort("classPropertiesDescriptionTableBody", ["classPropertiesDescriptionTableClassHeader", "classPropertiesDescriptionTablePropertyHeader", "classPropertiesDescriptionTableTriplesHeader", "classPropertiesDescriptionTableDistinctSubjectsHeader", "classPropertiesDescriptionTableDistinctObjectsHeader", "classPropertiesDescriptionTableEndpointsHeader"], [(a,b) => a.class.localeCompare(b.class), (a,b) => b.property.localeCompare(a.property), (a,b) => b.triples - a.triples, (a,b) => b.distinctSubjects - a.distinctSubjects, (a,b) => b.distinctObjects - a.distinctObjects, (a,b) => b.endpoints.size - a.endpoints.size ], fillClassPropertiesDescriptionTable, classDescriptionData);

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
setButtonAsTableCollapse('classDescriptionDetails', 'classDescriptionTable');
setButtonAsTableCollapse('classPropertiesDescriptionDetails', 'classPropertiesDescriptionTable');

var descriptionElementChartOption = {};
function descriptionElementFill() {
    var provenanceWhoCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { "+
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
        "VALUES ?g { "+ graphValuesURIList +" } " +
        "} ";
    var provenanceLicenseCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { "+
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
        "VALUES ?g { "+ graphValuesURIList +" } " +
        "} ";
    var provenanceDateCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { "+
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
        "VALUES ?g { "+ graphValuesURIList +" } " +
        "} ";
    var provenanceSourceCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { "+
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
        "VALUES ?g { "+ graphValuesURIList +" } " +
        "} ";
    var endpointDescriptionElementMap = new Map();
    sparqlQueryJSON(provenanceWhoCheckQuery, json => {
        json.results.bindings.forEach((item, i) => {
            var endpointUrl = item.endpointUrl.value;
            var who = (item.o != undefined);
            var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
            if(currentEndpointItem == undefined) {
                endpointDescriptionElementMap.set(endpointUrl, {endpoint:endpointUrl})
                currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
            }
            currentEndpointItem.who = who;
            if(who) {
                currentEndpointItem.whoValue = item.o.value;
            }
            endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
        });
        sparqlQueryJSON(provenanceLicenseCheckQuery, json => {
            json.results.bindings.forEach((item, i) => {
                var endpointUrl = item.endpointUrl.value;
                var license = (item.o != undefined);
                var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                currentEndpointItem.license = license;
                if(license) {
                    currentEndpointItem.licenseValue = item.o.value;
                }
                endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
            });
            sparqlQueryJSON(provenanceDateCheckQuery, json => {
                json.results.bindings.forEach((item, i) => {
                    var endpointUrl = item.endpointUrl.value;
                    var time = (item.o != undefined);
                    var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                    currentEndpointItem.time = time;
                    if(time) {
                        currentEndpointItem.timeValue = item.o.value;
                    }
                    endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                });
                sparqlQueryJSON(provenanceSourceCheckQuery, json => {
                    json.results.bindings.forEach((item, i) => {
                        var endpointUrl = item.endpointUrl.value;
                        var source = (item.o != undefined);
                        var currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl)
                        currentEndpointItem.source = source;
                        if(source) {
                            currentEndpointItem.sourceValue = item.o.value;
                        }
                        endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
                    });

                    var data = [];
                    endpointDescriptionElementMap.forEach((prov, endpoint, map) => {
                        data.push(prov)
                    });

                    data.sort((a,b) => {
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

                    setTableHeaderSort("datasetDescriptionTableBody", ["datasetDescriptionTableEndpointHeader", "datasetDescriptionTableWhoHeader", "datasetDescriptionTableLicenseHeader", "datasetDescriptionTableDateHeader", "datasetDescriptionTableSourceHeader"], [(a,b) => a.endpoint.localeCompare(b.endpoint), (a,b) => a.who.toString().localeCompare(b.who.toString()), (a,b) => a.license.toString().localeCompare(b.license.toString()), (a,b) => a.time.toString().localeCompare(b.time.toString()), (a,b) => a.source.toString().localeCompare(b.source.toString())], fillTestTable, data);

                    fillTestTable();

                    // chart
                    var whoDataScore = 0;
                    var licenseDataScore = 0;
                    var timeDataScore = 0;
                    var sourceDataScore = 0;

                    var dataSeries = data.forEach(dataItem => {
                        var who = dataItem.who;
                        if(who) {
                            whoDataScore++;
                        }
                        var license = dataItem.license;
                        if(license) {
                            licenseDataScore++;
                        }
                        var time = dataItem.time;
                        if(time) {
                            timeDataScore++;
                        }
                        var source = dataItem.source;
                        if(source) {
                            sourceDataScore++;
                        }
                    });


                     var whoDataSerie = {
                            name: 'Description of creator/owner/contributor',
                            type: 'pie',
                            radius: '25%',
                            center: ['25%', '25%'],
                            data: [
                                { value: whoDataScore, name: 'Presence of the description of creator/owner/contributor' },
                                { value: (data.length - whoDataScore), name: 'Absence of the description of creator/owner/contributor' },
                            ]
                        };
                     var licenseDataSerie = {
                            name: 'Licensing information',
                            type: 'pie',
                            radius: '25%',
                            center: ['25%', '75%'],
                            data: [
                                { value: licenseDataScore, name: 'Presence of licensing information' },
                                { value: (data.length - licenseDataScore), name: 'Absence of licensing information' },
                            ]
                        };
                     var timeDataSerie = {
                            name: 'Time related information about the creation of the dataset',
                            type: 'pie',
                            radius: '25%',
                            center: ['75%', '25%'],
                            data: [
                                { value: timeDataScore, name: 'Presence of time-related information' },
                                { value: (data.length - timeDataScore), name: 'Absence of time-related information' },
                            ]
                        };
                     var sourceDataSerie = {
                            name: 'Description of the source or the process at the origin of the dataset',
                            type: 'pie',
                            radius: '25%',
                            center: ['75%', '75%'],
                            data: [
                                { value: sourceDataScore, name: 'Presence of information about the origin of the dataset' },
                                { value: (data.length - sourceDataScore), name: 'Absence of information about the origin of the dataset' },
                            ]
                        };
                    descriptionElementChartOption = {
                          title: {
                            text: 'Dataset description features in all endpoints',
                            left: 'center'
                          },
                          tooltip: {
                              confine:true
                          },
                          legend: {
                            left: 'left',
                            show:false
                          },
                          series: [ whoDataSerie, licenseDataSerie, timeDataSerie, sourceDataSerie ]
                        };
                    datasetdescriptionChart.setOption(descriptionElementChartOption, true);
                });
            });
        });
    });
}
function redrawDescriptionElementChart() {
    datasetdescriptionChart.setOption(descriptionElementChartOption, true);
    datasetdescriptionChart.resize();
}
setButtonAsTableCollapse('datasetDescriptionStatDetails', 'datasetDescriptionTable');
setButtonAsTableCollapse('datasetDescriptionExplain', 'datasetDescriptionExplainText');

var shortUrisScatterOption = {};
function shortUrisFill() {
    var shortUrisMeasureQuery = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/shortUris.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "}" +
            "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?g ?endpointUrl ?measure ";

    sparqlQueryJSON(shortUrisMeasureQuery, json => {
        var shortUriData = []
        var graphSet = new Set();
        json.results.bindings.forEach((jsonItem, i) => {
            var endpoint = jsonItem.endpointUrl.value;
            var shortUriMeasure = Number.parseFloat(jsonItem.measure.value*100);
            var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");

            graphSet.add(graph);
            shortUriData.push({graph:graph, endpoint:endpoint, measure:shortUriMeasure})
        });

        var endpointDataSerieMap = new Map();
        shortUriData.forEach((shortUriItem, i) => {
            if(endpointDataSerieMap.get(shortUriItem.endpoint) == undefined) {
                endpointDataSerieMap.set(shortUriItem.endpoint, []);
            }
            endpointDataSerieMap.get(shortUriItem.endpoint).push([shortUriItem.graph, precise(shortUriItem.measure)]);
        });

        if(endpointDataSerieMap.size > 0) {
            showShortUrisContent()

            // Chart
            var shortUrisSeries = [];
            endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                var chartSerie = {
                    name:endpoint,
                    label:'show',
                    symbolSize: 5,
                    data:serieData,
                    type: 'line'
                };

                shortUrisSeries.push(chartSerie);
            });

            shortUrisScatterOption = getCategoryScatterOption("Short URIs (< 80 characters) quality measure through time", [...graphSet].sort((a,b)=>a.localeCompare(b)), shortUrisSeries);
            shortUriChart.setOption(shortUrisScatterOption, true);

            // Average measure
            var shortUriMeasureSum = shortUriData.map(a => a.measure).reduce((previous, current) => current + previous);
            var shortUrisAverageMeasure = shortUriMeasureSum / shortUriData.length;
            $('#shortUrisMeasure').text(precise(shortUrisAverageMeasure)+"%");

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
            hideShortUrisContent();
        }
    });
}
function hideShortUrisContent() {
    rdfDataStructureChart.setOption({series:[]}, true);
    $('#shortUrisMeasure').empty();
    collapseHtml('shortUrisScatter');
    collapseHtml('shortUriMeasureRow');
}
function showShortUrisContent() {
    unCollapseHtml('shortUrisScatter');
    unCollapseHtml('shortUriMeasureRow');
}
function redrawShortUrisChart() {
    shortUriChart.setOption(shortUrisScatterOption, true);
    shortUriChart.resize();
}
setButtonAsTableCollapse('shortUrisDetails', 'shortUrisTable');

var rdfDataStructureChartOption = {};
function rdfDataStructuresFill() {
    var rdfDataStructuresMeasureQuery = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/RDFDataStructures.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "}" +
            "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?g ?endpointUrl ?measure ";

    sparqlQueryJSON(rdfDataStructuresMeasureQuery, json => {
        var rdfDataStructureData = []
        var graphSet = new Set();
        json.results.bindings.forEach((jsonItem, i) => {
            var endpoint = jsonItem.endpointUrl.value;
            var rdfDataStructureMeasure = Number.parseFloat(jsonItem.measure.value*100);
            var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");

            graphSet.add(graph);
            rdfDataStructureData.push({graph:graph, endpoint:endpoint, measure:rdfDataStructureMeasure})
        });

        var endpointDataSerieMap = new Map();
        rdfDataStructureData.forEach((rdfDataStructureItem, i) => {
            if(endpointDataSerieMap.get(rdfDataStructureItem.endpoint) == undefined) {
                endpointDataSerieMap.set(rdfDataStructureItem.endpoint, []);
            }
            endpointDataSerieMap.get(rdfDataStructureItem.endpoint).push([rdfDataStructureItem.graph, precise(rdfDataStructureItem.measure)]);
        });

        if(endpointDataSerieMap.size > 0) {
            showRDFDataStructuresContent()

            // Chart
            var rdfDataStructuresSeries = [];
            endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                var chartSerie = {
                    name:endpoint,
                    label:'show',
                    symbolSize: 5,
                    data:serieData,
                    type: 'line'
                };

                rdfDataStructuresSeries.push(chartSerie);
            });

            rdfDataStructureChartOption = getCategoryScatterOption("Minimal usage of RDF data structures measure through time", [...graphSet].sort((a,b)=>a.localeCompare(b)), rdfDataStructuresSeries);
            rdfDataStructureChart.setOption(rdfDataStructureChartOption, true);

            // Average measure
            var rdfDataStructureMeasureSum = rdfDataStructureData.map(a => a.measure).reduce((previous, current) => current + previous);
            var rdfDataStructuresAverageMeasure = rdfDataStructureMeasureSum / rdfDataStructureData.length;
            $('#rdfDataStructuresMeasure').text(precise(rdfDataStructuresAverageMeasure, 3)+"%");

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
            hideRDFDataStructuresContent();
        }

    });
}
function hideRDFDataStructuresContent() {
    rdfDataStructureChart.setOption({series:[]}, true);
    $('#rdfDataStructuresMeasure').empty();
    collapseHtml('rdfDataStructuresScatter');
    collapseHtml("rdfDataStructureMeasureRow");
}
function showRDFDataStructuresContent() {
    unCollapseHtml('rdfDataStructuresScatter');
    unCollapseHtml("rdfDataStructureMeasureRow");
}
function redrawRDFDataStructuresChart() {
    rdfDataStructureChart.setOption(rdfDataStructureChartOption, true);
    rdfDataStructureChart.resize();
}
setButtonAsTableCollapse('rdfDataStructuresDetails', 'rdfDataStructuresTable');

var readableLabelChartOption = {};
function readableLabelsFill() {
    var readableLabelsMeasureQuery = "SELECT DISTINCT ?g ?endpointUrl ?measure { " +
            "GRAPH ?g {" +
            "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
            "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . " +
            "?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . " +
            "?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . " +
            "?measureNode <http://www.w3.org/ns/dqv#value> ?measure . " +
            "}" +
            "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?g ?endpointUrl ?measure ";

    sparqlQueryJSON(readableLabelsMeasureQuery, json => {
        var readableLabelData = []
        var graphSet = new Set();
        json.results.bindings.forEach((jsonItem, i) => {
            var endpoint = jsonItem.endpointUrl.value;
            var readableLabelMeasure = Number.parseFloat(jsonItem.measure.value*100);
            var graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");

            graphSet.add(graph);
            readableLabelData.push({graph:graph, endpoint:endpoint, measure:readableLabelMeasure})
        });

        var endpointDataSerieMap = new Map();
        readableLabelData.forEach((readableLabelItem, i) => {
            if(endpointDataSerieMap.get(readableLabelItem.endpoint) == undefined) {
                endpointDataSerieMap.set(readableLabelItem.endpoint, []);
            }
            endpointDataSerieMap.get(readableLabelItem.endpoint).push([readableLabelItem.graph, precise(readableLabelItem.measure)]);
        });

        if(endpointDataSerieMap.size > 0) {
            showReadableLabelsContent();

            // Chart
            var readableLabelsSeries = [];
            endpointDataSerieMap.forEach((serieData, endpoint, map) => {
                var chartSerie = {
                    name:endpoint,
                    label:'show',
                    symbolSize: 5,
                    data:serieData,
                    type: 'line'
                };

                readableLabelsSeries.push(chartSerie);
            });

            readableLabelChartOption = getCategoryScatterOption("Usage of readable label for every resource", [...graphSet].sort((a,b)=>a.localeCompare(b)), readableLabelsSeries);
            readableLabelChart.setOption(readableLabelChartOption, true);

            // Average measure
            var readableLabelMeasureSum = readableLabelData.map(a => a.measure).reduce((previous, current) => current + previous);
            var readableLabelsAverageMeasure = readableLabelMeasureSum / readableLabelData.length;
            $('#readableLabelsMeasure').text(precise(readableLabelsAverageMeasure, 3)+"%");

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
            hideReadableLabelsContent();
        }

    });
}
function hideReadableLabelsContent() {
    readableLabelChart.setOption({series:[]}, true);
    $('#readableLabelMeasure').empty();
    collapseHtml('readableLabelsMeasureRow');
    collapseHtml('readableLabelsScatter');
}
function showReadableLabelsContent() {
    unCollapseHtml('readableLabelsScatter');
    unCollapseHtml('readableLabelsMeasureRow');
}
function redrawReadableLabelsChart() {
    readableLabelChart.setOption(readableLabelChartOption, true);
    readableLabelChart.resize();
}
setButtonAsTableCollapse('readableLabelsDetails', 'readableLabelsTable');
