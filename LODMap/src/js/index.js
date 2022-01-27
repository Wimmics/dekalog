import * as d3 from 'd3';
import * as echarts from "./echarts.js";
import $ from 'jquery';
import 'leaflet';
import {greenIcon, orangeIcon} from "./leaflet-color-markers.js";
import {endpointIpMap, timezoneMap, graphLists} from "./data.js";
import {ForceGraph} from './graphics.js'


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

// Initialization of the ECharts components
var sparql10Chart = echarts.init(document.getElementById('histo1'));
var sparql11Chart = echarts.init(document.getElementById('histo2'));
var sparqlTotalChart = echarts.init(document.getElementById('histo3'));
var tripleScatterChart = echarts.init(document.getElementById('tripleScatter'));
var classScatterChart = echarts.init(document.getElementById('classScatter'));
var propertyScatterChart = echarts.init(document.getElementById('propertyScatter'));
var categoryScatterChart = echarts.init(document.getElementById('testCategoryScatter'));
var totalRuntimeChart = echarts.init(document.getElementById('totalRuntimeScatter'));
var averageRuntimeChart = echarts.init(document.getElementById('averageRuntimeScatter'));
var vocabForceGraph = echarts.init(document.getElementById('vocabs'));

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
function precise(x) {
    return Number.parseFloat(x).toPrecision(2);
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

function refresh() {
    graphValuesURIList = generateGraphValuesURI(graphList);
    clear();
    mapFill();
    sparqlesHistoFill();
    vocabEndpointGraphFill();
    tripleNumberScatter();
    classNumberFill();
    propertyNumberFill();
    categoryTestNumberFill();
    testTableFill();
    runtimeStatsFill();
    averageRuntimeStatsFill()
}

function clear() {
    layerGroup.clearLayers();
    sparql10Chart.setOption({series:[]}, true);
    sparql11Chart.setOption({series:[]}, true);
    sparqlTotalChart.setOption({series:[]}, true);
    tripleScatterChart.setOption({series:[]}, true);
    classScatterChart.setOption({series:[]}, true);
    propertyScatterChart.setOption({series:[]}, true);
    categoryScatterChart.setOption({series:[]}, true);
    totalRuntimeChart.setOption({series:[]}, true);
    vocabForceGraph.setOption({series:[]}, true);
    $('#shortUrisMeasure').empty();
    $('#RDFdataStructuresMeasure').empty();
    $('#KnownVocabulariesMeasure').empty();
    $('#endpointKnownVocabsTableBody').empty();
    $('#rulesTableBody').empty();
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

function mapFill() {
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

        var chart10Data = [];
        var chart11Data = [];
        var chartSPARQLData = [];
        chart10ValueMap.forEach((value, key, map) => {
            chart10Data.push({'value':value, 'name':"[ " + ((key-1)*10).toString() + "%, "+ (key*10).toString() + " % ]" })
        });
        chart11ValueMap.forEach((value, key, map) => {
            chart11Data.push({'value':value, 'name':"[ " + ((key-1)*10).toString() + "%, "+ (key*10).toString() + " % ]" })
        });
        chartSPARQLValueMap.forEach((value, key, map) => {
            chartSPARQLData.push({'value':value, 'name':"[ " + ((key-1)*10).toString() + "%, "+ (key*10).toString() + " % ]" })
        });

        var option10 = {
            title: {
                left: 'center',
                text:"Coverage of the SPARQL 1.0 features",
            },
            legend: {
                show: true,
                top: 'bottom'
            },
            toolbox: {
                show: false
            },
            color: ["#001219","#005f73","#0a9396","#94d2bd","#e9d8a6","#ee9b00","#ca6702","#bb3e03","#ae2012","#9b2226"],
            tooltip: {
                show:true
            },
            series: [
                {
                    name: 'SPARQL 1.0 coverage',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    //roseType: 'area',
                    itemStyle: {
                        borderRadius: 5
                    },
                    data: chart10Data,
                    label: {
                        show:false
                    }
                }
            ]
        };
        var option11 = {
            title: {
                align: 'center',
                textalign: 'center',
                left: 'center',
                text:"Coverage of the SPARQL 1.1 features",
            },
            legend: {
                top: 'bottom'
            },
            toolbox: {
                show: false
            },
            tooltip: {
                show:true
            },
            color: ["#001219","#005f73","#0a9396","#94d2bd","#e9d8a6","#ee9b00","#ca6702","#bb3e03","#ae2012","#9b2226"],
            series: [
                {
                    name: 'SPARQL 1.1 coverage',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    //roseType: 'area',
                    itemStyle: {
                        borderRadius: 8
                    },
                    data: chart11Data,
                    label: {
                        show:false
                    }
                }
            ],
        };
        var optionTotal = {
            title: {
                align: 'center',
                textalign: 'center',
                left: 'center',
                text:"Coverage of SPARQL features",
            },
            legend: {
                top: 'bottom'
            },
            toolbox: {
                show: false
            },
            tooltip: {
                show:true
            },
            color: ["#001219","#005f73","#0a9396","#94d2bd","#e9d8a6","#ee9b00","#ca6702","#bb3e03","#ae2012","#9b2226"],
            series: [
                {
                    name: 'Total SPARQL coverage',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    //roseType: 'area',
                    itemStyle: {
                        borderRadius: 8
                    },
                    data: chartSPARQLData,
                    label: {
                        show:false
                    }
                }
            ],
        };
        sparql10Chart.setOption(option10);
        sparql11Chart.setOption(option11);
        sparqlTotalChart.setOption(optionTotal);
    });
}


$('#KnownVocabulariesDetails').click(function() {
    if($('#knowVocabEndpointTable').hasClass("show")) {
        $('#knowVocabEndpointTable').removeClass("show");
        $('#knowVocabEndpointTable').addClass("collapse");
    } else {
        $('#knowVocabEndpointTable').removeClass("collapse");
        $('#knowVocabEndpointTable').addClass("show");
    }
})
function vocabEndpointGraphFill() {
// Create an force graph with the graph linked by co-ocurrence of vocabularies
    var sparqlesVocabularies = "SELECT DISTINCT ?endpoint ?vocabulary  WHERE { GRAPH ?g { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpoint . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <http://rdfs.org/ns/void#vocabulary> ?vocabulary }  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?endpoint";
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
                var endpointUri = bindingItem.endpoint.value;
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
            });

            var jsonVocabLinks = new Set();
            var jsonVocabNodes = new Set();

            endpointSet.forEach((item, i) => {
                jsonVocabNodes.add({name:item, category:'Knowledge base', x:i*100, y:100, symbolSize:5})
            });
            vocabSet.forEach((item, i) => {
                jsonVocabNodes.add({name:item,  category:'Vocabulary', x:100, y:i*100, symbolSize:5})
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

            var vocabGraphOptions = {
                title: {
                  text: 'Endpoints and knowledge bases',
                  top: 'bottom',
                  left: 'center'
                },
                tooltip: {},
                legend: [
                  {
                    data: ["Vocabulary", "Knowledge base"]
                }
            ],
                series: [
                  {
                    //name: 'Vocabulary',
                    type: 'graph',
                    layout: 'force',
                    data: [...jsonVocabNodes],
                    links: [...jsonVocabLinks],
                    categories: [{name:"Vocabulary"}, {name:"Knowledge base"}],
                    roam: true,
                    draggable:true,
                    label: {
                      position: 'right'
                    },
                    force: {
                      repulsion: 100
                    }
                }
                ]
            };
            vocabForceGraph.setOption(vocabGraphOptions);

            function endpointKnowVocabsMeasureFill() {
                knowVocabsData.forEach((item, i) => {
                    var endpointUrl = item.endpoint;
                    var measure = item.measure;
                    sumknowVocabMeasure += measure;
                    var endpointRow = document.createElement("tr");
                    var endpointCell = document.createElement('td');
                    endpointCell.appendChild( document.createTextNode(endpointUrl));
                    endpointRow.appendChild(endpointCell);
                    var knownVocabMeasureCell = document.createElement('td');
                    knownVocabMeasureCell.appendChild( document.createTextNode(precise(measure)));
                    endpointRow.appendChild(knownVocabMeasureCell);
                    endpointKnownVocabulariestableBody.append(endpointRow);
                });
            };
            var tableBody = $('#endpointKnownVocabsTableBody');
            $('#knownVocabEndpointHeader').click(function() {
                tableBody.empty();
                if(tableBody.hasClass('sortByKnownVocabEndpointDesc')) {
                    tableBody.removeClass('sortByKnownVocabEndpointDesc');
                    tableBody.addClass('sortByKnownVocabEndpointAsc');
                    knowVocabsData.sort((a,b) => {
                        return a.endpoint.localeCompare(b.endpoint);
                    });
                } else {
                    tableBody.addClass('sortByKnownVocabEndpointDesc');
                    tableBody.removeClass('sortByKnownVocabEndpointAsc');
                    knowVocabsData.sort((a,b) => {
                        return - a.endpoint.localeCompare(b.endpoint);
                    });
                }
                endpointKnowVocabsMeasureFill();
            });

            endpointKnowVocabsMeasureFill();
            $('#knownVocabMeasureHeader').click(function() {
                $('#endpointKnownVocabsTableBody').empty();
                if(tableBody.hasClass('sortByKnownVocabMeasureDesc')) {
                    tableBody.removeClass('sortByKnownVocabMeasureDesc');
                    tableBody.addClass('sortByKnownVocabMeasureAsc');
                    knowVocabsData.sort((a,b) => {
                        return a.measure - b.measure;
                    });
                } else {
                    tableBody.addClass('sortByKnownVocabMeasureDesc');
                    tableBody.removeClass('sortByKnownVocabMeasureAsc');
                    knowVocabsData.sort((a,b) => {
                        return b.measure - a.measure;
                    });
                }
                endpointKnowVocabsMeasureFill();
            });

            // compputation of the know vocabularies measure
            var knownVocabulariesMeasureHtml = $('#KnownVocabulariesMeasure');
            knownVocabulariesMeasureHtml.append( document.createTextNode(precise(sumknowVocabMeasure / endpointSet.size)));
        });
    });
}

function tripleNumberScatter() {
    // Scatter plot of the number of triples through time
    var triplesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl ?o { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        //"?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
        "?base <http://rdfs.org/ns/void#triples> ?o ." +
        "}" +
        " VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl)"; //+" DESC(?modifDate)";
    sparqlQueryJSON(triplesSPARQLquery, json => {
        var endpointDataSerieMap = new Map();
        json.results.bindings.forEach((itemResult, i) => {
            var endpointUrl = itemResult.endpointUrl.value;
            //var graphModifiedDate = itemResult.modifDate.value;

            endpointDataSerieMap.set(endpointUrl, []);
        });
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var endpointUrl = itemResult.endpointUrl.value;
            var triples = Number.parseInt(itemResult.o.value);
            //var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
            //var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());
            endpointDataSerieMap.get(endpointUrl).push([graph,triples])
        });

        var triplesSeries = [];
        endpointDataSerieMap.forEach((value, key, map) => {
            var chartSerie = {
                name:key,
                label:'show',
                symbolSize: 5,
                data:value,
                type: 'line'
            };

            triplesSeries.push(chartSerie);
        });

        var optionTriples = {
            title: {
                left: 'center',
                text:"Size of the datasets",
            },
            xAxis: {
                type:'category'
            },
            yAxis: {},
            series: triplesSeries,
            tooltip:{
                show:'true'
            }
        };
        tripleScatterChart.setOption(optionTriples);

    });
}

function classNumberFill() {
// Scatter plot of the number of classes through time
    var classesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl ?o ?modifDate { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        "?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
        "?base <http://rdfs.org/ns/void#classes> ?o ." +
        "}" +
        "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
    sparqlQueryJSON(classesSPARQLquery, json => {
        var endpointDataSerieMap = new Map();
        //var xAxisDataSet = new Set();
        json.results.bindings.forEach((itemResult, i) => {
            var endpointUrl = itemResult.endpointUrl.value;

            endpointDataSerieMap.set(endpointUrl, []);
            //xAxisDataSet.add(graph);
        });
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var endpointUrl = itemResult.endpointUrl.value;
            var triples = Number.parseInt(itemResult.o.value);
            //var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
            //var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());

            endpointDataSerieMap.get(endpointUrl).push([ graph, triples ])
        });

        var triplesSeries = [];
        endpointDataSerieMap.forEach((value, key, map) => {
            var chartSerie = {
                name:key,
                label:'show',
                symbolSize: 5,
                data:value,
                type: 'line'
            };

            triplesSeries.push(chartSerie);
        });


        var optionTriples = {
            title: {
                left: 'center',
                text:"Number of classes in the datasets",
            },
            xAxis: {
                type:'category'
            },
            yAxis: {},
            series: triplesSeries,
            tooltip:{
                show:'true'
            }
        };
        classScatterChart.setOption(optionTriples);

    });
}

function propertyNumberFill() {
// scatter plot of the number of properties through time
    var propertiesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl ?o { " +
        "GRAPH ?g {" +
        "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
        "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
        //"?metadata <http://purl.org/dc/terms/modified> ?modifDate . " +
        "?base <http://rdfs.org/ns/void#properties> ?o ." +
        "}" +
        "  VALUES ?g { "+ graphValuesURIList +" } } GROUP BY ?endpointUrl ?o ORDER BY DESC(?g) DESC(?endpointUrl) ";// +
        //"DESC(?modifDate)";
    sparqlQueryJSON(propertiesSPARQLquery, json => {
        var endpointDataSerieMap = new Map();
        json.results.bindings.forEach((itemResult, i) => {
            var endpointUrl = itemResult.endpointUrl.value;

            endpointDataSerieMap.set(endpointUrl, []);
        });
        json.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var endpointUrl = itemResult.endpointUrl.value;
            var triples = Number.parseInt(itemResult.o.value);
            //var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
            //var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());

            endpointDataSerieMap.get(endpointUrl).push([ graph, triples ])
        });

        var triplesSeries = [];
        endpointDataSerieMap.forEach((value, key, map) => {
            var chartSerie = {
                name:key,
                label:'show',
                symbolSize: 5,
                data:value,
                type: 'line'
            };

            triplesSeries.push(chartSerie);
        });

        var optionTriples = {
            title: {
                left: 'center',
                text:"Number of properties in the datasets",
            },
            xAxis: {
                type:'category'
            },
            yAxis: {},
            series: triplesSeries,
            tooltip:{
                show:'true'
            }
        };
        propertyScatterChart.setOption(optionTriples);

    });
}

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
        json.results.bindings.forEach((itemResult, i) => {
            var category = itemResult.category.value;

            endpointDataSerieMap.set(category, new Map());
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
                    percentageAvrEndpointCategory = precise(percentageAvrEndpointCategory / 8);
                } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/")) {
                    percentageAvrEndpointCategory = precise(percentageAvrEndpointCategory / 4);
                } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/")) {
                    percentageAvrEndpointCategory = precise(percentageAvrEndpointCategory / 10);
                } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/")) {
                    percentageAvrEndpointCategory = precise(percentageAvrEndpointCategory / 23);
                } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/")) {
                    percentageAvrEndpointCategory = precise(percentageAvrEndpointCategory / 25);
                } else if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/")) {
                    percentageAvrEndpointCategory = precise(percentageAvrEndpointCategory / 20);
                }

                dataCategory.push([graph, percentageAvrEndpointCategory]);
            });

            dataCategory.sort((a, b) => a[0].localeCompare(b[0]));
            var chartSerie = {
                name:category.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/", "").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/", "").replace("/", ""),
                label:'show',
                symbolSize: 5,
                data:dataCategory,
                type: 'line'
            };

            triplesSeries.push(chartSerie);
        });


        var optionTriples = {
            title: {
                left: 'center',
                text:"Number of tests passed by category",
            },
            xAxis: {
                type:'category'
            },
            yAxis: {},
            series: triplesSeries,
            tooltip:{
                show:'true'
            }
        };
        categoryScatterChart.setOption(optionTriples);
    });
}


$('#tableRuleDetails').click(function() {
    var table = $('#rulesTable');
    if(table.hasClass("show")) {
        table.removeClass("show");
        table.addClass("collapse");
    } else {
        table.removeClass("collapse");
        table.addClass("show");
    }
});
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

function runtimeStatsFill() {
    var maxMinTimeQuery = "SELECT DISTINCT ?g (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?data . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . }  VALUES ?g { "+ graphValuesURIList +" } }";
    var runtimeDataSerie = []
    var runtimeSerie = []
    sparqlQueryJSON(maxMinTimeQuery, jsonResponse => {
        jsonResponse.results.bindings.forEach((itemResult, i) => {
            var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
            var start = parseDate(itemResult.start.value, 'dd-mm-yyyyTHH:mm:ss');
            var end = parseDate(itemResult.end.value, 'dd-mm-yyyyTHH:mm:ss');
            var runtime = Math.abs((end - start)/1000);
            //var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
            //var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());

            runtimeDataSerie.push([ graph, runtime ])
        });
        var runtimeSerie = {
            name:"Runtime in seconds",
            label:'show',
            symbolSize: 5,
            data:runtimeDataSerie,
            type: 'scatter'
        };
        var optionRuntime = {
            title: {
                left: 'center',
                text:"Runtime of the framework for each run (in seconds)",
            },
            xAxis: {
                type:'category'
            },
            yAxis: {},
            series: [runtimeSerie],
            tooltip:{
                show:'true'
            }
        };
        totalRuntimeChart.setOption(optionRuntime);
    });
}

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

            jsonResponse.results.bindings.forEach((itemResult, i) => {
                var graph = itemResult.g.value.replace('http://ns.inria.fr/indegx#','');
                var start = parseDate(itemResult.start.value, 'dd-mm-yyyyTHH:mm:ss');
                var end = parseDate(itemResult.end.value, 'dd-mm-yyyyTHH:mm:ss');
                var numberOfEndpoint = numberEndpointMap.get(graph);
                var runtime = Math.floor(Math.abs((end - start)/1000)/numberOfEndpoint);

                runtimeDataSerie.push([ graph, runtime ])
            });
            var runtimeSerie = {
                name:"Average runtime in seconds",
                label:'show',
                symbolSize: 5,
                data:runtimeDataSerie,
                type: 'scatter'
            };
            var optionRuntime = {
                title: {
                    left: 'center',
                    text:"Average runtime of the framework for each run (in seconds)",
                },
                xAxis: {
                    type:'category'
                },
                yAxis: {},
                series: [runtimeSerie],
                tooltip:{
                    show:'true'
                }
            };
            averageRuntimeChart.setOption(optionRuntime);

        });
    });
}
