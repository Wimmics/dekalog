const fs = require('fs');
var md5 = require('md5');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const graphLists = require('./src/data/runSets.json');
const dataFilePrefix = "./src/data/cache/";
const timezoneMap = require('./src/data/timezoneMap.json');
const whiteListFilename = dataFilePrefix + "whiteLists.json";
const geolocFilename = dataFilePrefix + "geolocData.json";
const whiteListFile = require(whiteListFilename);
const geolocFile = require(geolocFilename);
var whiteListMap = new Map(new Map(Object.entries(whiteListFile)));
const endpointIpMap = require('./src/data/endpointIpGeoloc.json');


function generateGraphValueFilterClause(graphList) {
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

function xmlHTTPRequestGetPromise(url) {
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
                response: xhr.responseText,
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function xmlhttpRequestJSONPromise(url) {
    return xmlHTTPRequestGetPromise(url).then(response => {
        console.log(url)
        return JSON.parse(response);
    });
}

function sparqlQueryPromise(query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return xmlhttpRequestJSONPromise('http://prod-dekalog.inria.fr/sparql?query=' + encodeURIComponent(query) + '&format=json');
    }
    else {
        throw "ERROR " + query;
    }
}

function whiteListFill() {
    return Promise.all(
        graphLists.map(graphListItem => {
            var graphList = graphListItem.graphs
            var endpointListQuery = 'SELECT DISTINCT ?endpointUrl WHERE {' +
                ' GRAPH ?g { ' +
                "{ ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }" +
                "UNION { ?base <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } " +
                '?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint . ' +
                '} ' +
                generateGraphValueFilterClause(graphList) +
                '} ' +
                'GROUP BY ?endpointUrl';
            var graphListKey = md5(''.concat(graphList));
            return sparqlQueryPromise(endpointListQuery)
                .then(json => {
                    var endpointList = [];
                    json.results.bindings.forEach((item) => {
                        endpointList.push(item.endpointUrl.value);
                    });
                    return { graphListKey: graphListKey, endpoints: endpointList };
                });
        })).then(graphListItemArray => {
            var tmpWhiteListMap = {};
            graphListItemArray.forEach(graphListItem => {
                tmpWhiteListMap[graphListItem.graphListKey] = graphListItem.endpoints;
            });
            try {
                var content = JSON.stringify(tmpWhiteListMap);
                fs.writeFileSync(whiteListFilename, content)
            } catch (err) {
                console.error(err)
            }
        }).catch(error => {
            console.log(error)
        });
}


function endpointMapfill() {
    var endpointGeolocData = [];

    // Marked map with the geoloc of each endpoint
    return Promise.all(endpointIpMap.map((item) => {
        // Add the markers for each endpoints.
        var endpoint = item.key;
        var endpointItem = {};

        var timezoneSPARQLquery = "SELECT DISTINCT ?timezone { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <" + endpoint + "> . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <https://schema.org/broadcastTimezone> ?timezone } }";
        return sparqlQueryPromise(timezoneSPARQLquery)
            .then(jsonResponse => {
                var endpointTimezoneSPARQL = new Map();
                jsonResponse.results.bindings.forEach((itemResponse, i) => {
                    endpointTimezoneSPARQL.set(endpoint, itemResponse.timezone.value);
                });

                var ipTimezoneArrayFiltered = timezoneMap.filter(itemtza => itemtza.key == item.value.geoloc.timezone);
                var ipTimezone;
                if (ipTimezoneArrayFiltered.length > 0) {
                    ipTimezone = ipTimezoneArrayFiltered[0].value.utc_offset.padStart(6, '-').padStart(6, '+');
                }
                var sparqlTimezone;
                if (endpointTimezoneSPARQL.get(endpoint) != undefined) {
                    sparqlTimezone = endpointTimezoneSPARQL.get(endpoint).padStart(6, '-').padStart(6, '+');
                }
                var badTimezone = false;
                if (sparqlTimezone != undefined
                    && ipTimezone != undefined
                    && sparqlTimezone.localeCompare(ipTimezone) != 0) {
                    badTimezone = true;
                }

                endpointItem = { endpoint: endpoint, lat: item.value.geoloc.lat, lon: item.value.geoloc.lon, country: "", region: "", city: "", org: "", timezone: ipTimezone, sparqlTimezone: sparqlTimezone };
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
                var labelQuery = "SELECT DISTINCT ?label  { GRAPH ?g { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> <" + endpoint + "> . { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } UNION { ?dataset <http://purl.org/dc/terms/title> ?label } UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } UNION { ?dataset <http://schema.org/name> ?label } . }  }";
                return labelQuery;
            })
            .then(labelQuery => sparqlQueryPromise(labelQuery)
                .then(responseLabels => {
                    var popupString = "<table> <thead> <tr> <th colspan='2'> <a href='" + endpointItem.endpoint + "' >" + endpointItem.endpoint + "</a> </th> </tr> </thead>";
                    popupString += "</body>"
                    if (endpointItem.country != undefined) {
                        popupString += "<tr><td>Country: </td><td>" + endpointItem.country + "</td></tr>";
                    }
                    if (endpointItem.region != undefined) {
                        popupString += "<tr><td>Region: </td><td>" + endpointItem.region + "</td></tr>";
                    }
                    if (endpointItem.city != undefined) {
                        popupString += "<tr><td>City: </td><td>" + endpointItem.city + "</td></tr>";
                    }
                    if (endpointItem.org != undefined) {
                        popupString += "<tr><td>Organization: </td><td>" + endpointItem.org + "</td></tr>";
                    }
                    var badTimezone = endpointItem.timezone.localeCompare(endpointItem.sparqlTimezone) != 0;
                    if (badTimezone) {
                        popupString += "<tr><td>Timezone of endpoint URL: </td><td>" + endpointItem.timezone + "</td></tr>";
                        popupString += "<tr><td>Timezone declared by endpoint: </td><td>" + endpointItem.sparqlTimezone + "</td></tr>";
                    }
                    if (responseLabels.results.bindings.size > 0) {
                        popupString += "<tr><td colspan='2'>" + responseLabels + "</td></tr>";
                    }
                    popupString += "</tbody>"
                    popupString += "</table>"
                    endpointItem.popupHTML = popupString;
                    console.log(endpointItem)
                })
            ).then(() => {
                endpointGeolocData.push(endpointItem);
            })
            .catch(error => {
                console.log(error);
            })
    }))
        .then(() => {
            try {
                var content = JSON.stringify(endpointGeolocData);
                fs.writeFileSync(geolocFilename, content)
            } catch (err) {
                console.error(err)
            }
        })
        .catch(error => {
            console.log(error);
        })

}

whiteListFill()
.then(endpointMapfill());