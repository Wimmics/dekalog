import * as d3 from 'd3';
import * as echarts from "./echarts.js";
import $ from 'jquery';
import 'leaflet';
import {greenIcon, orangeIcon} from "./leaflet-color-markers.js";
import {endpointIpMap, timezoneMap} from "./data.js";
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

// Marked map with the geoloc of each endpoint
endpointIpMap.forEach((item, i) => {
    // Add the markers for each endpoints.
    var endpoint = item.key;

// Study of the timezones
// http://worldtimeapi.org/pages/examples
var markerIcon = greenIcon;
var endpointTimezoneSPARQL = new Map();
var timezoneSPARQLquery = "SELECT DISTINCT ?timezone { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <"+endpoint+"> . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <https://schema.org/broadcastTimezone> ?timezone }";
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
        && (ipTimezone.padStart(6, '-') != sparqlTimezone.padStart(6, '-') )
        && (ipTimezone.padStart(6, '+') != sparqlTimezone.padStart(6, '+') ) ) {
            badTimezone = true;
            markerIcon = orangeIcon;
        }

        var endpointMarker = L.marker([item.value.geoloc.lat, item.value.geoloc.lon], { icon:markerIcon });
        endpointMarker.on('click', clickEvent => {
            var labelQuery = "SELECT DISTINCT ?label  { GRAPH ?g { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> <" + item.key + "> . { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } UNION { ?dataset <http://purl.org/dc/terms/title> ?label } UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } UNION { ?dataset <http://schema.org/name> ?label } . } }";
                sparqlQueryJSON(labelQuery, responseLabels => {
                    var popupString = item.key + "<br/>" + item.value.geoloc.country + "<br/>" + item.value.geoloc.regionName + "<br/>" + item.value.geoloc.city + "<br/>" + item.value.geoloc.org;
                    if(badTimezone) {
                        popupString += "<br/>Timezone of endpoint URL: " + ipTimezone;
                        popupString += "<br/>Timezone declared by endpoint: " + sparqlTimezone;
                    }
                    if(responseLabels.results.bindings.size > 0) {
                        popupString += responseLabels ;
                    }
                    endpointMarker.bindPopup(popupString).openPopup();
                });
            });
            endpointMarker.addTo(map);
        });

    });

// Create an histogram of the SPARQLES rules passed by endpoint.
var sparqlesFeatureQuery = 'SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) WHERE { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . FILTER(CONTAINS(str(?activity), ?sparqlNorm)) VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } } } GROUP BY ?endpoint ?sparqlNorm ORDER BY DESC( ?endpoint)';
sparqlQueryJSON(sparqlesFeatureQuery, json => {
    var sparql10Chart = echarts.init(document.getElementById('histo1'));
    var sparql11Chart = echarts.init(document.getElementById('histo2'));
    var sparqlTotalChart = echarts.init(document.getElementById('histo3'));
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

// Create an force graph with the graph linked by co-ocurrence of vocabularies
var sparqlesVocabularies = "SELECT DISTINCT ?endpoint ?vocabulary  WHERE { GRAPH ?g { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpoint . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <http://rdfs.org/ns/void#vocabulary> ?vocabulary } } GROUP BY ?endpoint";
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
            jsonVocabNodes.add({'id':item, 'group':'Knowledge base', 'radius':'1'})
        });
        vocabSet.forEach((item, i) => {
            jsonVocabNodes.add({'id':item, 'group':'Vocabulary', 'radius':'1'})
        });
        var endpointKnownVocabulariestableBody = $('#endpointKnownVocabsTableBody');
        var sumknowVocabMeasure = 0;
        var knowVocabsData = [];
        gatherVocab.forEach(( endpointVocabs, endpointUrl, map1) => {
            var measure = (endpointVocabs.size/rawGatherVocab.get(endpointUrl).size);
            knowVocabsData.push({ 'endpoint':endpointUrl, 'measure':measure })

            endpointVocabs.forEach((vocab, i) => {
                jsonVocabLinks.add({'source':endpointUrl, 'target':vocab, 'value':1})
            });
        });

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

        $('#KnownVocabulariesDetails').click(function() {
            if($('#knowVocabEndpointTable').hasClass("show")) {
                $('#knowVocabEndpointTable').removeClass("show");
                $('#knowVocabEndpointTable').addClass("collapse");
            } else {
                $('#knowVocabEndpointTable').addClass("show");
                $('#knowVocabEndpointTable').removeClass("collapse");
            }
        })

        var chart = ForceGraph({'links':[...jsonVocabLinks], 'nodes':[...jsonVocabNodes]} , {
            nodeId: d => d.id,
            nodeGroup: d => d.group,
            nodeTitle: d => `${d.id}\n${d.group}`,
            linkStrokeWidth: l => Math.sqrt(l.value),
            width:1200,
            height: 600
        });

        var vocabsHtml = $('#vocabs');
        vocabsHtml.append(chart);

        // compputation of the know vocabularies measure
        var knownVocabulariesMeasureHtml = $('#KnownVocabulariesMeasure');
        knownVocabulariesMeasureHtml.append( document.createTextNode(precise(sumknowVocabMeasure / endpointSet.size)));
    });
});

// Scatter plot of the number of triples through time
var triplesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl ?o ?modifDate { " +
    "GRAPH ?g {" +
    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
    "?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
    "?base <http://rdfs.org/ns/void#triples> ?o ." +
    "}" +
    "} GROUP BY ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
sparqlQueryJSON(triplesSPARQLquery, json => {
    var endpointDataSerieMap = new Map();
    var xAxisDataSet = new Set();
    json.results.bindings.forEach((itemResult, i) => {
        var endpointUrl = itemResult.endpointUrl.value;
        var graphModifiedDate = itemResult.modifDate.value;
        var graph = itemResult.g.value;

        endpointDataSerieMap.set(endpointUrl, []);
        xAxisDataSet.add(graph);
    });
    json.results.bindings.forEach((itemResult, i) => {
        var graph = itemResult.g;
        var endpointUrl = itemResult.endpointUrl.value;
        var triples = Number.parseInt(itemResult.o.value);
        var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
        var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());
        if(graph != "http://ns.inria.fr/indegx") {
            endpointDataSerieMap.get(endpointUrl).push([date,triples])
        }
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

    var tripleScatterChart = echarts.init(document.getElementById('tripleScatter'));
    var optionTriples = {
        title: {
            left: 'center',
            text:"Size of the datasets",
        },
        xAxis: {
            type:'time'
        },
        yAxis: {},
        series: triplesSeries,
        tooltip:{
            show:'true'
        }
    };
    tripleScatterChart.setOption(optionTriples);

});

// Scatter plot of the number of classes through time
var classesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl ?o ?modifDate { " +
    "GRAPH ?g {" +
    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
    "?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
    "?base <http://rdfs.org/ns/void#classes> ?o ." +
    "}" +
    "} GROUP BY ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
sparqlQueryJSON(classesSPARQLquery, json => {
    var endpointDataSerieMap = new Map();
    var xAxisDataSet = new Set();
    json.results.bindings.forEach((itemResult, i) => {
        var endpointUrl = itemResult.endpointUrl.value;
        var graphModifiedDate = itemResult.modifDate.value;
        var graph = itemResult.g.value;

        endpointDataSerieMap.set(endpointUrl, []);
        xAxisDataSet.add(graph);
    });
    json.results.bindings.forEach((itemResult, i) => {
        var graph = itemResult.g;
        var endpointUrl = itemResult.endpointUrl.value;
        var triples = Number.parseInt(itemResult.o.value);
        var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
        var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());

        if(graph != "http://ns.inria.fr/indegx") {
            endpointDataSerieMap.get(endpointUrl).push([ date, triples ])
        }
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

    var classScatterChart = echarts.init(document.getElementById('classScatter'));
    var optionTriples = {
        title: {
            left: 'center',
            text:"Number of classes in the datasets",
        },
        xAxis: {
            type:'time'
        },
        yAxis: {},
        series: triplesSeries,
        tooltip:{
            show:'true'
        }
    };
    classScatterChart.setOption(optionTriples);

});

// scatter plot of the number of properties through time
var propertiesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl ?o ?modifDate { " +
    "GRAPH ?g {" +
    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
    "?metadata <http://purl.org/dc/terms/modified> ?modifDate . " +
    "?base <http://rdfs.org/ns/void#properties> ?o ." +
    "}" +
    "} GROUP BY ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
sparqlQueryJSON(propertiesSPARQLquery, json => {
    var endpointDataSerieMap = new Map();
    var xAxisDataSet = new Set();
    json.results.bindings.forEach((itemResult, i) => {
        var endpointUrl = itemResult.endpointUrl.value;
        var graphModifiedDate = itemResult.modifDate.value;
        var graph = itemResult.g.value;

        endpointDataSerieMap.set(endpointUrl, []);
        xAxisDataSet.add(graph);
    });
    json.results.bindings.forEach((itemResult, i) => {
        var graph = itemResult.g;
        if(graph != "http://ns.inria.fr/indegx") {
            var graph = itemResult.g;
            var endpointUrl = itemResult.endpointUrl.value;
            var triples = Number.parseInt(itemResult.o.value);
            var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
            var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());

            endpointDataSerieMap.get(endpointUrl).push([ date, triples ])
        }
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

    var propertyScatterChart = echarts.init(document.getElementById('propertyScatter'));
    var optionTriples = {
        title: {
            left: 'center',
            text:"Number of properties in the datasets",
        },
        xAxis: {
            type:'time'
        },
        yAxis: {},
        series: triplesSeries,
        tooltip:{
            show:'true'
        }
    };
    propertyScatterChart.setOption(optionTriples);

});

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
        "}  " +
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
        var graph = itemResult.g.value;

        if(endpointDataSerieMap.get(category).get(graph) == undefined) {
            endpointDataSerieMap.get(category).set(graph, new Map());
        }
        endpointDataSerieMap.get(category).get( graph).set(endpoint, count);
    });

    var triplesSeries = [];
    endpointDataSerieMap.forEach((gemap, category, map1) => {
        var dataCategory = [];
        gemap.forEach((endpointMap, graph, map2) => {
            if(graph != "http://ns.inria.fr/indegx") {
                var totalEndpointGraph = 0;
                endpointMap.forEach((count, endpoint, map3) => {
                    totalEndpointGraph = totalEndpointGraph + Number.parseInt(count);
                });
                var numberOfEndpoint = endpointMap.size;
                var avgEndpointGraph = precise(totalEndpointGraph / numberOfEndpoint);
                var percentageAvrEndpointCategory = avgEndpointGraph;
                if(category.startsWith("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/")) {
                    percentageAvrEndpointCategory = precise(percentageAvrEndpointCategory / 3);
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
            }
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

    var categoryScatterChart = echarts.init(document.getElementById('testCategoryScatter'));
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

// Number of triples in the description of each endpoint
var testDescSizeQuery = "SELECT DISTINCT ?endpointUrl (count(*) AS ?count) ?modifDate { SELECT DISTINCT ?modifDate ?endpointUrl ?p ?o { GRAPH ?graph { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . ?metadata <http://ns.inria.fr/kg/index#curated> ?curated , ?endpoint . ?metadata <http://purl.org/dc/terms/modified> ?modifDate . ?curated ?p ?o . } } } GROUP BY ?endpointUrl ?modifDate ORDER BY ASC(?modifDate)";
sparqlQueryJSON(testDescSizeQuery, json => {
    var endpointDataSerieMap = new Map();
    var endpointDescSizeCountMap = new Map();
    json.results.bindings.forEach((itemResult, i) => {
        var category = itemResult.endpointUrl.value;

        endpointDataSerieMap.set(category, []);
        endpointDescSizeCountMap.set(category, new Map());
    });

    json.results.bindings.forEach((itemResult, i) => {
        var category = itemResult.endpointUrl.value;
        var count = itemResult.count.value;
        var rawDate = parseDate(itemResult.modifDate.value, 'dd-mm-yyyy');
        var date = new Date(rawDate.getYear(), rawDate.getMonth(), rawDate.getDay());

        endpointDescSizeCountMap.get(category).forEach((value, key, map) => {
            if(endpointDescSizeCountMap.get(category).get(date) == undefined) {
                endpointDescSizeCountMap.get(category).set(date, 0);
            }
        });
        endpointDescSizeCountMap.get(category).set(date, count);
    });

    function displayDescriptionSizeChart() {
        var triplesSeries = [];
        endpointDescSizeCountMap.forEach((value1, endpointUrl, map1) => {
            var serieData = [];
            value1.forEach((value2, date, map2) => {
                serieData.push([date, value2]);
            });

            var chartSerie = {
                name:endpointUrl,
                label:'show',
                symbolSize: 5,
                data:serieData,
                type: 'line'
            };
            triplesSeries.push(chartSerie);
        });

        var categoryScatterChart = echarts.init(document.getElementById('descriptionSizeScatter'));
        var optionTriples = {
            title: {
                left: 'center',
                text:"Size of the descriptions",
            },
            xAxis: {
                type:'time'
            },
            yAxis: {
                type:'log'
            },
            series: triplesSeries,
            tooltip:{
                show:'true'
            }
        };
        categoryScatterChart.setOption(optionTriples);
    }

    var testDescSizeRank2Query = "SELECT DISTINCT ?graph ?endpointUrl (count(*) AS ?count) { SELECT DISTINCT ?graph ?endpointUrl ?pp ?oo { GRAPH ?graph { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated , ?endpoint . ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . ?curated <http://rdfs.org/ns/void#classPartition> ?o . ?o ?pp ?oo . VALUES ?pp { <http://www.w3.org/ns/dcat#distribution> <http://www.w3.org/ns/sparql-service-description#namedGraph> <http://rdfs.org/ns/void#classPartition> <http://rdfs.org/ns/void#propertyPartition> } } } } GROUP BY ?endpointUrl ?graph";
    sparqlQueryJSON(testDescSizeRank2Query, json => {
        json.results.bindings.forEach((itemResult, i) => {
            var category = itemResult.endpointUrl.value;
            var count = itemResult.count.value;
            var graph = itemResult.graph.value;

            endpointDescSizeCountMap.get(category).forEach((value, key, map) => {
                if(endpointDescSizeCountMap.get(category).get(graph) == undefined) {
                    endpointDescSizeCountMap.get(category).set(graph, 0);
                }
            });
            var currentCount = endpointDescSizeCountMap.get(category).get(graph);
            endpointDescSizeCountMap.get(category).set(graph, currentCount + count);
        });

        var testDescSizeRank3Query = "SELECT DISTINCT ?endpointUrl ?graph (count(*) AS ?count) { SELECT DISTINCT ?graph ?endpointUrl ?ppp ?ooo { GRAPH ?graph { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated , ?endpoint . ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . ?metadata ?p ?o . ?o <http://rdfs.org/ns/void#propertyPartition> ?oo . ?oo ?ppp ?ooo . } } } GROUP BY ?endpointUrl ?graph";
        sparqlQueryJSON(testDescSizeRank3Query, json => {
            json.results.bindings.forEach((itemResult, i) => {
                var category = itemResult.endpointUrl.value;
                var count = itemResult.count.value;
                var graph = itemResult.graph.value;

                endpointDescSizeCountMap.get(category).forEach((value, key, map) => {
                    if(endpointDescSizeCountMap.get(category).get(graph) == undefined) {
                        endpointDescSizeCountMap.get(category).set(graph, 0);
                    }
                });
                var currentCount = endpointDescSizeCountMap.get(category).get(graph);
                endpointDescSizeCountMap.get(category).set(graph, currentCount + count);
            });

            var testDescSizeMetadataQuery = "SELECT DISTINCT ?graph ?endpointUrl (count(*) AS ?count) { SELECT DISTINCT ?graph ?dataset ?p ?o ?pp ?oo { GRAPH ?graph { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated , ?endpoint . ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . ?metadata ?p ?o . OPTIONAL { ?o ?pp ?oo . VALUES ?p { <http://www.w3.org/ns/dqv#hasQualityMeasurement> } } FILTER(?p != <http://ns.inria.fr/kg/index#trace>) } } } GROUP BY ?endpointUrl ?graph";
            sparqlQueryJSON(testDescSizeMetadataQuery, json => {
                json.results.bindings.forEach((itemResult, i) => {
                    var category = itemResult.endpointUrl.value;
                    var count = itemResult.count.value;
                    var graph = itemResult.graph.value;

                    endpointDescSizeCountMap.get(category).forEach((value, key, map) => {
                        if(endpointDescSizeCountMap.get(category).get(graph) == undefined) {
                            endpointDescSizeCountMap.get(category).set(graph, 0);
                        }
                    });
                    var currentCount = endpointDescSizeCountMap.get(category).get(graph);
                    endpointDescSizeCountMap.get(category).set(graph, currentCount + count);
                });

                var testDescSizeMetadataRankNQuery = "SELECT DISTINCT ?graph ?endpointUrl (count(*) AS ?count) { SELECT DISTINCT ?graph ?dataset ?p ?o ?pp ?oo { GRAPH ?graph { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated , ?endpoint . ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . ?metadata ?p ?o . OPTIONAL { ?o ?pp ?oo . OPTIONAL { ?oo ?ppp ?ooo OPTIONAL { ?ooo ?pppp ?oooo } } } FILTER(?p != <http://ns.inria.fr/kg/index#curated>) FILTER(?p != <http://ns.inria.fr/kg/index#original>) FILTER(?p != <http://www.w3.org/ns/dcat#servesDataset>) FILTER(?p != <http://www.w3.org/ns/dcat#service>) FILTER(?p != <http://www.w3.org/ns/earl#subject>) FILTER(?pp != <http://ns.inria.fr/kg/index#curated>) FILTER(?pp != <http://ns.inria.fr/kg/index#original>) FILTER(?pp != <http://www.w3.org/ns/dcat#servesDataset>) FILTER(?pp != <http://www.w3.org/ns/dcat#service>) FILTER(?pp != <http://www.w3.org/ns/earl#subject>) FILTER(?ppp != <http://ns.inria.fr/kg/index#curated>) FILTER(?ppp != <http://ns.inria.fr/kg/index#original>) FILTER(?ppp != <http://www.w3.org/ns/dcat#servesDataset>) FILTER(?ppp != <http://www.w3.org/ns/dcat#service>) FILTER(?ppp != <http://www.w3.org/ns/earl#subject>) FILTER(?pppp != <http://ns.inria.fr/kg/index#curated>) FILTER(?pppp != <http://ns.inria.fr/kg/index#original>) FILTER(?pppp != <http://www.w3.org/ns/dcat#servesDataset>) FILTER(?pppp != <http://www.w3.org/ns/dcat#service>) FILTER(?pppp != <http://www.w3.org/ns/earl#subject>) } } FILTER(?p != <http://ns.inria.fr/kg/index#trace>) } } } GROUP BY ?endpointUrl ?graph";
                sparqlQueryJSON(testDescSizeMetadataRankNQuery, json => {
                    json.results.bindings.forEach((itemResult, i) => {
                        var category = itemResult.endpointUrl.value;
                        var count = itemResult.count.value;
                        var graph = itemResult.graph.value;

                        endpointDescSizeCountMap.get(category).forEach((value, key, map) => {
                            if(endpointDescSizeCountMap.get(category).get(graph) == undefined) {
                                endpointDescSizeCountMap.get(category).set(graph, 0);
                            }
                        });
                        var currentCount = endpointDescSizeCountMap.get(category).get(graph);
                        endpointDescSizeCountMap.get(category).set(graph, currentCount + count);
                    });
                    displayDescriptionSizeChart();
                }, () => {
                    displayDescriptionSizeChart();
                });


            }, () => {
                displayDescriptionSizeChart();
            });

        }, () => {
            displayDescriptionSizeChart();
        });

    }, () => {
        displayDescriptionSizeChart();
    });

});
