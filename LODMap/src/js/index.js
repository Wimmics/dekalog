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


function sparqlQueryJSON(query, callback) {
    xmlhttpRequestJSON('http://prod-dekalog.inria.fr/sparql?query='+encodeURIComponent(query)+"&format=json", callback);
};

function xmlhttpRequestJSON(url, callback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            callback(response);
        } else if(errorCallback != undefined) {
            errorCallback(this);
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

function precise(x) {
    return Number.parseFloat(x).toPrecision(2);
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
            align: 'center',
            textalign: 'center',
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


var triplesSPARQLquery = "SELECT DISTINCT ?g ?endpointUrl ?o ?modifDate { " +
    "GRAPH ?g {" +
    "?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . " +
    "?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . " +
    "?metadata <http://purl.org/dc/terms/modified> ?modifDate ." +
    "?base <http://rdfs.org/ns/void#triples> ?o ." +
    "}" +
    "} GROUP BY ?endpointUrl ?modifDate ?o ORDER BY DESC(?g) DESC(?endpointUrl) DESC(?modifDate)";
sparqlQueryJSON(triplesSPARQLquery, json => {
    json.results.bindings.forEach((itemResult, i) => {
        var graph = itemResult.g;
        var endpointUrl = itemResult.endpointtUrl;
        var triples = itemResult.o;
        var date = itemResult.modifDate;
    });

    var tripleScatterChart = echarts.init(document.getElementById('tripleScatter'));
    var optionTriples = {
      xAxis: {},
      yAxis: {},
      series: [
        {
          symbolSize: 20,
          data: [
            [10.0, 8.04],
            [8.07, 6.95],
            [13.0, 7.58],
            [9.05, 8.81],
            [11.0, 8.33],
            [14.0, 7.66],
            [13.4, 6.81],
            [10.0, 6.33],
            [14.0, 8.96],
            [12.5, 6.82],
            [9.15, 7.2],
            [11.5, 7.2],
            [3.03, 4.23],
            [12.2, 7.83],
            [2.02, 4.47],
            [1.05, 3.33],
            [4.05, 4.96],
            [6.03, 7.24],
            [12.0, 6.26],
            [12.0, 8.84],
            [7.08, 5.82],
            [5.02, 5.68]
          ],
          type: 'scatter'
        }
      ]
    };
    tripleScatterChart.setOption(optionTriples);

});
