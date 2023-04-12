import {writeFileSync as $fzfjp$writeFileSync} from "node:fs";
import $fzfjp$dayjsplugindurationjs from "dayjs/plugin/duration.js";
import $fzfjp$dayjs from "dayjs";
import $fzfjp$md5 from "md5";
import $fzfjp$dayjsplugincustomParseFormatjs from "dayjs/plugin/customParseFormat.js";
import $fzfjp$dayjspluginrelativeTimejs from "dayjs/plugin/relativeTime.js";
import $fzfjp$nodefetch, {Headers as $fzfjp$Headers, FetchError as $fzfjp$FetchError} from "node-fetch";
import {writeFile as $fzfjp$writeFile, readFile as $fzfjp$readFile} from "node:fs/promises";
import {setTimeout as $fzfjp$setTimeout} from "node:timers/promises";
import {format as $fzfjp$format} from "node:util";














let $8a991e7a11d82128$var$logFileName = "kartographicaching.log";
function $8a991e7a11d82128$export$1a41b952b1d6d091(fileName) {
    if (fileName == null || fileName == undefined || fileName == "") $8a991e7a11d82128$var$logFileName = "kartographicaching.log";
    else $8a991e7a11d82128$var$logFileName = fileName;
}
function $8a991e7a11d82128$export$bef1f36f5486a6a3(logObject, ...o) {
    $8a991e7a11d82128$var$logging("LOG", logObject, ...o);
}
function $8a991e7a11d82128$export$a3bc9b8ed74fc(logObject, ...o) {
    $8a991e7a11d82128$var$logging("ERROR", logObject, ...o);
}
function $8a991e7a11d82128$export$a80b3bd66acc52ff(logObject, ...o) {
    $8a991e7a11d82128$var$logging("INFO", logObject, ...o);
}
function $8a991e7a11d82128$var$logging(level, logObject, ...o) {
    const now = (0, $fzfjp$dayjs)();
    const message = $fzfjp$format("[%s][%s]: %s", level, now.toISOString(), logObject, ...o);
    console.error(message);
    (0, $ffc2274b02472392$export$4f58cbbefe506af9)($8a991e7a11d82128$var$logFileName, message + "\n");
}


let $ffc2274b02472392$export$ff9145aa8f5d08d8 = 10;
let $ffc2274b02472392$export$606d8b965266a4fd = 5000;
let $ffc2274b02472392$var$countConcurrentQueries = 0;
let $ffc2274b02472392$export$e69c944f813dd417 = 300;
let $ffc2274b02472392$export$ae866de19353582e = 1000;
function $ffc2274b02472392$export$6b862160d295c8e(input, format = "yyyy-MM-dd'T'HH:mm:ss.SSSZ") {
    return (0, $fzfjp$dayjs)(input, format);
}
function $ffc2274b02472392$export$6cc6e25203630304() {
    return $ffc2274b02472392$var$countConcurrentQueries;
}
function $ffc2274b02472392$export$66826636ef5e1530(nb) {
    if (nb !== undefined && nb !== null && nb >= 0) $ffc2274b02472392$export$ff9145aa8f5d08d8 = nb;
    else throw new Error("The number of retries must be a positive integer");
}
function $ffc2274b02472392$export$f60a4bbf81e656d4(milliseconds) {
    if (milliseconds !== undefined && milliseconds !== null && milliseconds >= 0) $ffc2274b02472392$export$606d8b965266a4fd = milliseconds;
    else throw new Error("The number of milliseconds between retries must be a positive integer");
}
function $ffc2274b02472392$export$652c9b10c84c8691(max) {
    if (max !== undefined && max !== null && max >= 0) $ffc2274b02472392$export$e69c944f813dd417 = max;
    else throw new Error("The number of maximum concurrent queries must be a positive integer");
}
function $ffc2274b02472392$export$4ddac1eae8e1a9ec(milliseconds) {
    if (milliseconds !== undefined && milliseconds !== null && milliseconds >= 0) $ffc2274b02472392$export$ae866de19353582e = milliseconds;
    else throw new Error("The number of milliseconds between queries must be a positive integer");
}
function $ffc2274b02472392$export$4f58cbbefe506af9(filename, content) {
    $fzfjp$writeFile(filename, content, {
        flag: "a+"
    }).catch((error)=>{
        $8a991e7a11d82128$export$a3bc9b8ed74fc("Error appending to file", error);
    });
}
function $ffc2274b02472392$export$552bfb764b5cd2b4(filename, content) {
    $fzfjp$writeFile(filename, content).catch((error)=>{
        $8a991e7a11d82128$export$a3bc9b8ed74fc("Error writing to file", filename, error);
    });
}
function $ffc2274b02472392$export$72c04af63de9061a(filename) {
    let readFilePromise;
    if (filename.startsWith("http://") || filename.startsWith("https://")) readFilePromise = $ffc2274b02472392$export$a6e59c03a779ef88(filename);
    else if (filename.startsWith("file://")) readFilePromise = $fzfjp$readFile(filename.replace("file://", "")).then((buffer)=>buffer.toString());
    else readFilePromise = $fzfjp$readFile(filename).then((buffer)=>buffer.toString());
    return readFilePromise;
}
function $ffc2274b02472392$export$43afd36b730bac7c(args, promiseCreationFunction) {
    let argsCopy = args.map((arg)=>arg);
    if (argsCopy.length > 0) return promiseCreationFunction.apply(this, argsCopy[0]).then(()=>{
        argsCopy.shift();
        return $ffc2274b02472392$export$43afd36b730bac7c(argsCopy, promiseCreationFunction);
    });
    return new Promise((resolve, reject)=>resolve());
}
function $ffc2274b02472392$export$7fc4ea9a72a632dc(url, header = new Map(), method = "GET", query = "", numTry = 0) {
    let myHeaders = new (0, $fzfjp$Headers)();
    myHeaders.set("pragma", "no-cache");
    myHeaders.set("cache-control", "no-cache");
    header.forEach((value, key)=>{
        myHeaders.set(key, value);
    });
    let myInit = {
        method: method,
        headers: myHeaders,
        redirect: "follow"
    };
    if (method.localeCompare("POST") == 0) myInit.body = query;
    if ($ffc2274b02472392$var$countConcurrentQueries >= $ffc2274b02472392$export$e69c944f813dd417) return (0, $fzfjp$setTimeout)($ffc2274b02472392$export$ae866de19353582e).then(()=>$ffc2274b02472392$export$7fc4ea9a72a632dc(url, header, method, query, numTry));
    else {
        $ffc2274b02472392$var$countConcurrentQueries++;
        return (0, $fzfjp$nodefetch)(url, myInit).then((response)=>{
            if (response.ok) return response.blob().then((blob)=>blob.text());
            else throw response;
        }).catch((error)=>{
            if (error instanceof (0, $fzfjp$FetchError)) {
                $8a991e7a11d82128$export$a3bc9b8ed74fc(error.type, error.message);
                $8a991e7a11d82128$export$a80b3bd66acc52ff("Try:", numTry, "Fetch ", method, url, query);
                if (numTry < $ffc2274b02472392$export$ff9145aa8f5d08d8) return (0, $fzfjp$setTimeout)($ffc2274b02472392$export$606d8b965266a4fd).then($ffc2274b02472392$export$7fc4ea9a72a632dc(url, header, method, query, numTry + 1));
                else $8a991e7a11d82128$export$a3bc9b8ed74fc("Too many retries", error);
            } else $8a991e7a11d82128$export$a3bc9b8ed74fc("Too many retries", error);
        }).finally(()=>{
            $ffc2274b02472392$var$countConcurrentQueries--;
            return;
        });
    }
}
function $ffc2274b02472392$export$a6e59c03a779ef88(url, header = new Map()) {
    return $ffc2274b02472392$export$7fc4ea9a72a632dc(url, header);
}
function $ffc2274b02472392$export$3233bfa38a51357e(url, query = "", header = new Map()) {
    return $ffc2274b02472392$export$7fc4ea9a72a632dc(url, header, "POST", query);
}
function $ffc2274b02472392$export$230442c21b56ff1e(url, otherHeaders = new Map()) {
    let header = new Map();
    header.set("Content-Type", "application/json");
    otherHeaders.forEach((value, key)=>{
        header.set(key, value);
    });
    return $ffc2274b02472392$export$7fc4ea9a72a632dc(url, header).then((response)=>{
        if (response == null || response == undefined || response == "") return {};
        else try {
            return JSON.parse(response);
        } catch (error) {
            $8a991e7a11d82128$export$a3bc9b8ed74fc(url, error, response);
            throw error;
        }
    });
}
function $ffc2274b02472392$export$a699a8b2615a99e(text) {
    return text.replace(/\\u[\dA-F]{4}/gi, function(match) {
        let unicodeMatch = String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
        let urlEncodedMatch = encodeURIComponent(unicodeMatch);
        return urlEncodedMatch;
    });
}


(0, $fzfjp$dayjs).extend((0, $fzfjp$dayjsplugindurationjs));
(0, $fzfjp$dayjs).extend((0, $fzfjp$dayjspluginrelativeTimejs));
(0, $fzfjp$dayjs).extend((0, $fzfjp$dayjsplugincustomParseFormatjs));
(0, $fzfjp$dayjs).extend((0, $fzfjp$dayjsplugindurationjs));
const $f89f46b083ca6896$var$queryPaginationSize = 500;
const $f89f46b083ca6896$var$dataFilePrefix = "./data/cache/";
const $f89f46b083ca6896$var$graphLists = $f89f46b083ca6896$import$f4386467bee0ce7c$2176871b05e4a30b($f89f46b083ca6896$var$dataFilePrefix + "runSets.json");
const $f89f46b083ca6896$var$timezoneMap = $f89f46b083ca6896$import$f4386467bee0ce7c$2176871b05e4a30b($f89f46b083ca6896$var$dataFilePrefix + "timezoneMap.json");
const $f89f46b083ca6896$var$endpointIpMap = $f89f46b083ca6896$import$f4386467bee0ce7c$2176871b05e4a30b($f89f46b083ca6896$var$dataFilePrefix + "endpointIpGeoloc.json");
const $f89f46b083ca6896$var$whiteListFilename = $f89f46b083ca6896$var$dataFilePrefix + "whiteLists.json";
const $f89f46b083ca6896$var$geolocFilename = $f89f46b083ca6896$var$dataFilePrefix + "geolocData.json";
const $f89f46b083ca6896$var$sparqlCoverageFilename = $f89f46b083ca6896$var$dataFilePrefix + "sparqlCoverageData.json";
const $f89f46b083ca6896$var$sparqlFeaturesFilename = $f89f46b083ca6896$var$dataFilePrefix + "sparqlFeaturesData.json";
const $f89f46b083ca6896$var$vocabEndpointFilename = $f89f46b083ca6896$var$dataFilePrefix + "vocabEndpointData.json";
const $f89f46b083ca6896$var$knownVocabsFilename = $f89f46b083ca6896$var$dataFilePrefix + "knownVocabsData.json";
const $f89f46b083ca6896$var$vocabKeywordsFilename = $f89f46b083ca6896$var$dataFilePrefix + "vocabKeywordsData.json";
const $f89f46b083ca6896$var$tripleCountFilename = $f89f46b083ca6896$var$dataFilePrefix + "tripleCountData.json";
const $f89f46b083ca6896$var$classCountFilename = $f89f46b083ca6896$var$dataFilePrefix + "classCountData.json";
const $f89f46b083ca6896$var$propertyCountFilename = $f89f46b083ca6896$var$dataFilePrefix + "propertyCountData.json";
const $f89f46b083ca6896$var$categoryTestCountFilename = $f89f46b083ca6896$var$dataFilePrefix + "categoryTestCountData.json";
const $f89f46b083ca6896$var$totalCategoryTestCountFilename = $f89f46b083ca6896$var$dataFilePrefix + "totalCategoryTestCountData.json";
const $f89f46b083ca6896$var$endpointTestsDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "endpointTestsData.json";
const $f89f46b083ca6896$var$totalRuntimeDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "totalRuntimeData.json";
const $f89f46b083ca6896$var$averageRuntimeDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "averageRuntimeData.json";
const $f89f46b083ca6896$var$classPropertyDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "classPropertyData.json";
const $f89f46b083ca6896$var$datasetDescriptionDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "datasetDescriptionData.json";
const $f89f46b083ca6896$var$shortUriDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "shortUriData.json";
const $f89f46b083ca6896$var$rdfDataStructureDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "rdfDataStructureData.json";
const $f89f46b083ca6896$var$readableLabelDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "readableLabelData.json";
const $f89f46b083ca6896$var$blankNodesDataFilename = $f89f46b083ca6896$var$dataFilePrefix + "blankNodesData.json";
const $f89f46b083ca6896$var$LOVFilename = $f89f46b083ca6896$var$dataFilePrefix + "knownVocabulariesLOV.json";
function $f89f46b083ca6896$var$generateGraphValueFilterClause(graphList) {
    let result = "FILTER( ";
    graphList.forEach((item, i)=>{
        if (i > 0) result += " || REGEX( str(?g) , '" + item + "' )";
        else result += "REGEX( str(?g) , '" + item + "' )";
    });
    result += " )";
    return result;
}
function $f89f46b083ca6896$var$sparqlQueryPromise(query) {
    if (query.includes("SELECT") || query.includes("ASK")) return $ffc2274b02472392$export$230442c21b56ff1e("http://prod-dekalog.inria.fr/sparql?query=" + encodeURIComponent(query) + "&format=json");
    else throw "ERROR " + query;
}
function $f89f46b083ca6896$var$paginatedSparqlQueryPromise(query, limit = $f89f46b083ca6896$var$queryPaginationSize, offset = 0, finalResult = []) {
    let paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
    return $f89f46b083ca6896$var$sparqlQueryPromise(paginatedQuery).then((queryResult)=>{
        queryResult.results.bindings.forEach((resultItem)=>{
            let finaResultItem = {};
            queryResult.head.vars.forEach((variable)=>{
                finaResultItem[variable] = resultItem[variable];
            });
            finalResult.push(finaResultItem);
        });
        if (queryResult.results.bindings.length > 0) return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(query, limit + $f89f46b083ca6896$var$queryPaginationSize, offset + $f89f46b083ca6896$var$queryPaginationSize, finalResult);
    }).then(()=>{
        return finalResult;
    }).catch((error)=>{
        console.log(error);
        return finalResult;
    }).finally(()=>{
        return finalResult;
    });
}
function $f89f46b083ca6896$var$whiteListFill() {
    console.log("whiteListFill START");
    return Promise.all($f89f46b083ca6896$var$graphLists.map((graphListItem)=>{
        let graphList = graphListItem.graphs;
        let endpointListQuery = "SELECT DISTINCT ?endpointUrl WHERE { GRAPH ?g { { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://ns.inria.fr/kg/index#curated> ?curated . } " + $f89f46b083ca6896$var$generateGraphValueFilterClause(graphList) + "} " + "GROUP BY ?endpointUrl";
        let graphListKey = (0, $fzfjp$md5)("".concat(graphList));
        return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(endpointListQuery).then((json)=>{
            let endpointList = [];
            json.forEach((item)=>{
                endpointList.push(item.endpointUrl.value);
            });
            return {
                graphKey: graphListKey,
                endpoints: endpointList
            };
        });
    })).then((graphListItemArray)=>{
        let tmpWhiteListMap = {};
        graphListItemArray.forEach((graphListItem)=>{
            tmpWhiteListMap[graphListItem.graphKey] = graphListItem.endpoints;
        });
        try {
            let content = JSON.stringify(tmpWhiteListMap);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$whiteListFilename, content);
            console.log("whiteListFill END");
        } catch (err) {
            console.error(err);
        }
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$whiteListFilename, content);
            console.log("whiteListFill END");
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$endpointMapfill() {
    console.log("endpointMapfill START");
    let endpointGeolocData = [];
    // Marked map with the geoloc of each endpoint
    return Promise.all($f89f46b083ca6896$var$endpointIpMap.map((item)=>{
        // Add the markers for each endpoints.
        let endpoint = item.key;
        let endpointItem;
        let timezoneSPARQLquery = "SELECT DISTINCT ?timezone { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> <" + endpoint + "> . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . ?base <https://schema.org/broadcastTimezone> ?timezone } }";
        return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(timezoneSPARQLquery).then((jsonResponse)=>{
            let endpointTimezoneSPARQL = new Map();
            jsonResponse.forEach((itemResponse, i)=>{
                endpointTimezoneSPARQL.set(endpoint, itemResponse.timezone.value);
            });
            let ipTimezoneArrayFiltered = $f89f46b083ca6896$var$timezoneMap.filter((itemtza)=>itemtza.key == item.value.geoloc.timezone);
            let ipTimezone;
            if (ipTimezoneArrayFiltered.length > 0) ipTimezone = ipTimezoneArrayFiltered[0].value.utc_offset.padStart(6, "-").padStart(6, "+");
            let sparqlTimezone;
            if (endpointTimezoneSPARQL.get(endpoint) != undefined) sparqlTimezone = endpointTimezoneSPARQL.get(endpoint).padStart(6, "-").padStart(6, "+");
            endpointItem = {
                endpoint: endpoint,
                lat: item.value.geoloc.lat,
                lon: item.value.geoloc.lon,
                country: "",
                region: "",
                city: "",
                org: "",
                timezone: ipTimezone,
                sparqlTimezone: sparqlTimezone,
                popupHTML: ""
            };
            if (item.value.geoloc.country != undefined) endpointItem.country = item.value.geoloc.country;
            if (item.value.geoloc.regionName != undefined) endpointItem.region = item.value.geoloc.regionName;
            if (item.value.geoloc.city != undefined) endpointItem.city = item.value.geoloc.city;
            if (item.value.geoloc.org != undefined) endpointItem.org = item.value.geoloc.org;
            let labelQuery = "SELECT DISTINCT ?label  { GRAPH ?g { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> <" + endpoint + "> . { ?dataset <http://www.w3.org/2000/01/rdf-schema#label> ?label } UNION { ?dataset <http://www.w3.org/2004/02/skos/core#prefLabel> ?label } UNION { ?dataset <http://purl.org/dc/terms/title> ?label } UNION { ?dataset <http://xmlns.com/foaf/0.1/name> ?label } UNION { ?dataset <http://schema.org/name> ?label } . }  }";
            return labelQuery;
        }).then((labelQuery)=>$f89f46b083ca6896$var$sparqlQueryPromise(labelQuery).then((responseLabels)=>{
                let popupString = "<table> <thead> <tr> <th colspan='2'> <a href='" + endpointItem.endpoint + "' >" + endpointItem.endpoint + "</a> </th> </tr> </thead>";
                popupString += "</body>";
                if (endpointItem.country != undefined) popupString += "<tr><td>Country: </td><td>" + endpointItem.country + "</td></tr>";
                if (endpointItem.region != undefined) popupString += "<tr><td>Region: </td><td>" + endpointItem.region + "</td></tr>";
                if (endpointItem.city != undefined) popupString += "<tr><td>City: </td><td>" + endpointItem.city + "</td></tr>";
                if (endpointItem.org != undefined) popupString += "<tr><td>Organization: </td><td>" + endpointItem.org + "</td></tr>";
                if (endpointItem.timezone != undefined) {
                    popupString += "<tr><td>Timezone of endpoint URL: </td><td>" + endpointItem.timezone + "</td></tr>";
                    if (endpointItem.sparqlTimezone != undefined) {
                        let badTimezone = endpointItem.timezone.localeCompare(endpointItem.sparqlTimezone) != 0;
                        if (badTimezone) popupString += "<tr><td>Timezone declared by endpoint: </td><td>" + endpointItem.sparqlTimezone + "</td></tr>";
                    }
                }
                if (responseLabels.results.bindings.size > 0) popupString += "<tr><td colspan='2'>" + responseLabels + "</td></tr>";
                popupString += "</tbody>";
                popupString += "</table>";
                endpointItem.popupHTML = popupString;
            }).catch((error)=>{
                console.log(error);
            })).then(()=>{
            endpointGeolocData.push(endpointItem);
        }).catch((error)=>{
            console.log(error);
        });
    })).finally(()=>{
        try {
            let content = JSON.stringify(endpointGeolocData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$geolocFilename, content);
            console.log("endpointMapfill END");
        } catch (err) {
            console.error(err);
        }
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$geolocFilename, content);
            console.log("endpointMapfill END");
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$SPARQLCoverageFill() {
    console.log("SPARQLCoverageFill START");
    // Create an histogram of the SPARQLES rules passed by endpoint.
    let sparqlesFeatureQuery = 'SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . OPTIONAL { ?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . FILTER(CONTAINS(str(?activity), ?sparqlNorm)) VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } } } } GROUP BY ?endpoint ?sparqlNorm ';
    let jsonBaseFeatureSparqles = [];
    let sparqlFeaturesDataArray = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(sparqlesFeatureQuery).then((json)=>{
        let endpointSet = new Set();
        let sparql10Map = new Map();
        let sparql11Map = new Map();
        json.forEach((bindingItem, i)=>{
            let endpointUrl = bindingItem.endpoint.value;
            endpointSet.add(endpointUrl);
            let feature = undefined;
            if (bindingItem.sparqlNorm != undefined) feature = bindingItem.sparqlNorm.value;
            let count = bindingItem.count.value;
            if (feature == undefined || feature.localeCompare("SPARQL10") == 0) sparql10Map.set(endpointUrl, Number(count));
            if (feature == undefined || feature.localeCompare("SPARQL11") == 0) sparql11Map.set(endpointUrl, Number(count));
        });
        endpointSet.forEach((item)=>{
            let sparql10 = sparql10Map.get(item);
            let sparql11 = sparql11Map.get(item);
            if (sparql10 == undefined) sparql10 = 0;
            if (sparql11 == undefined) sparql11 = 0;
            let sparqlJSONObject = {
                "endpoint": item,
                "sparql10": sparql10,
                "sparql11": sparql11,
                "sparqlTotal": sparql10 + sparql11
            };
            jsonBaseFeatureSparqles.push(sparqlJSONObject);
        });
    }).then(()=>{
        const sparqlFeatureQuery = 'SELECT DISTINCT ?endpoint ?activity { GRAPH ?g { ?base <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . ?metadata <http://ns.inria.fr/kg/index#curated> ?base . OPTIONAL { ?base <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . FILTER(CONTAINS(str(?activity), ?sparqlNorm)) VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" } } } } GROUP BY ?endpoint ?activity ';
        let endpointFeatureMap = new Map();
        let featuresShortName = new Map();
        return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(sparqlFeatureQuery).then((json)=>{
            endpointFeatureMap = new Map();
            let featuresSet = new Set();
            json.forEach((bindingItem)=>{
                const endpointUrl = bindingItem.endpoint.value;
                if (!endpointFeatureMap.has(endpointUrl)) endpointFeatureMap.set(endpointUrl, new Set());
                if (bindingItem.activity != undefined) {
                    const activity = bindingItem.activity.value;
                    if (!endpointFeatureMap.has(endpointUrl)) endpointFeatureMap.set(endpointUrl, new Set());
                    featuresSet.add(activity);
                    if (featuresShortName.get(activity) == undefined) featuresShortName.set(activity, activity.replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/SPARQLES_", "sparql10:").replace("https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/SPARQLES_", "sparql11:").replace(".ttl#activity", ""));
                    endpointFeatureMap.get(endpointUrl).add(featuresShortName.get(activity));
                }
            });
            endpointFeatureMap.forEach((featureSet, endpointUrl, map)=>{
                let sortedFeatureArray = [
                    ...featureSet
                ].sort((a, b)=>a.localeCompare(b));
                sparqlFeaturesDataArray.push({
                    endpoint: endpointUrl,
                    features: sortedFeatureArray
                });
            });
            sparqlFeaturesDataArray.sort((a, b)=>{
                return a.endpoint.localeCompare(b.endpoint);
            });
        });
    }).finally(()=>{
        try {
            let content = JSON.stringify(jsonBaseFeatureSparqles);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$sparqlCoverageFilename, content);
        } catch (err) {
            console.error(err);
        }
        try {
            let content = JSON.stringify(sparqlFeaturesDataArray);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$sparqlFeaturesFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("SPARQLCoverageFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$sparqlCoverageFilename, content);
        } catch (err) {
            console.error(err);
        }
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$sparqlFeaturesFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$vocabFill() {
    console.log("vocabFill START");
    // Create an force graph with the graph linked by co-ocurrence of vocabularies
    let sparqlesVocabulariesQuery = "SELECT DISTINCT ?endpointUrl ?vocabulary { GRAPH ?g { { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . ?dataset <http://rdfs.org/ns/void#vocabulary> ?vocabulary }  } GROUP BY ?endpointUrl ?vocabulary ";
    let knownVocabularies = new Set();
    let rawGatherVocab = new Map();
    let gatherVocabData = [];
    let rawVocabSet = new Set();
    let vocabSet = new Set();
    let keywordSet = new Set();
    let vocabKeywordData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(sparqlesVocabulariesQuery).then((json)=>{
        let endpointSet = new Set();
        json.forEach((bindingItem, i)=>{
            let vocabulariUri = bindingItem.vocabulary.value;
            let endpointUri = bindingItem.endpointUrl.value;
            endpointSet.add(endpointUri);
            rawVocabSet.add(vocabulariUri);
            if (!rawGatherVocab.has(endpointUri)) rawGatherVocab.set(endpointUri, new Set());
            rawGatherVocab.get(endpointUri).add(vocabulariUri);
        });
    // https://obofoundry.org/ // No ontology URL available in ontology description
    // http://prefix.cc/context // done
    // http://data.bioontology.org/resource_index/resources?apikey=b86b12d8-dc46-4528-82e3-13fbdabf5191 // No ontology URL available in ontology description
    // https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list // done
    // Retrieval of the list of LOV vocabularies to filter the ones retrieved in the index
    }).then($ffc2274b02472392$export$230442c21b56ff1e("https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list").then((responseLOV)=>{
        responseLOV.forEach((item, i)=>{
            knownVocabularies.add(item.uri);
        });
        try {
            let content = JSON.stringify(responseLOV);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$LOVFilename, content);
        } catch (err) {
            console.error(err);
        }
    })).then($ffc2274b02472392$export$230442c21b56ff1e("http://prefix.cc/context").then((responsePrefixCC)=>{
        for (let prefix of Object.keys(responsePrefixCC["@context"]))knownVocabularies.add(responsePrefixCC["@context"][prefix]);
    })).then($ffc2274b02472392$export$230442c21b56ff1e("https://www.ebi.ac.uk/ols/api/ontologies?page=0&size=1000").then((responseOLS)=>{
        responseOLS._embedded.ontologies.forEach((ontologyItem)=>{
            if (ontologyItem.config.baseUris.length > 0) {
                let ontology = ontologyItem.config.baseUris[0];
                knownVocabularies.add(ontology);
            }
        });
    })).then(()=>{
        // Filtering according to ontology repositories
        rawVocabSet.forEach((vocabulariUri)=>{
            if (knownVocabularies.has(vocabulariUri)) vocabSet.add(vocabulariUri);
        });
        rawGatherVocab.forEach((vocabulariUriSet, endpointUri, map)=>{
            gatherVocabData.push({
                endpoint: endpointUri,
                vocabularies: [
                    ...vocabulariUriSet
                ]
            });
        });
        let queryArray = [];
        let vocabArray = [
            ...vocabSet
        ];
        for(let i = 20; i < vocabArray.length + 20; i += 20){
            let vocabSetSlice = vocabArray.slice(i - 20, i); // Slice the array into arrays of 20 elements
            // Endpoint and vocabulary keywords graph
            let vocabularyQueryValues = "";
            vocabSetSlice.forEach((item, i)=>{
                vocabularyQueryValues += "<" + item + ">";
                vocabularyQueryValues += " ";
            });
            let keywordLOVQuery = "SELECT DISTINCT ?vocabulary ?keyword { GRAPH <https://lov.linkeddata.es/dataset/lov> {    ?vocabulary a <http://purl.org/vocommons/voaf#Vocabulary> .    ?vocabulary <http://www.w3.org/ns/dcat#keyword> ?keyword . } VALUES ?vocabulary { " + vocabularyQueryValues + " } " + "}";
            queryArray.push($ffc2274b02472392$export$230442c21b56ff1e("https://lov.linkeddata.es/dataset/lov/sparql?query=" + encodeURIComponent(keywordLOVQuery) + "&format=json"));
        }
        return Promise.all(queryArray).then((jsonKeywordsArray)=>{
            let vocabKeywordMap = new Map();
            jsonKeywordsArray.forEach((jsonKeywords)=>{
                jsonKeywords.results.bindings.forEach((keywordItem, i)=>{
                    let keyword = keywordItem.keyword.value;
                    let vocab = keywordItem.vocabulary.value;
                    if (vocabKeywordMap.get(vocab) == undefined) vocabKeywordMap.set(vocab, []);
                    vocabKeywordMap.get(vocab).push(keyword);
                    keywordSet.add(keyword);
                });
            });
            vocabKeywordMap.forEach((keywordList, vocab)=>{
                vocabKeywordData.push({
                    vocabulary: vocab,
                    keywords: keywordList
                });
            });
        });
    }).finally(()=>{
        try {
            let content = JSON.stringify(gatherVocabData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$vocabEndpointFilename, content);
        } catch (err) {
            console.error(err);
        }
    }).finally(()=>{
        try {
            let content = JSON.stringify([
                ...knownVocabularies
            ]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$knownVocabsFilename, content);
        } catch (err) {
            console.error(err);
        }
    }).finally(()=>{
        try {
            let content = JSON.stringify(vocabKeywordData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$vocabKeywordsFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("vocabFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$vocabEndpointFilename, content);
        } catch (err) {
            console.error(err);
        }
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$knownVocabsFilename, content);
        } catch (err) {
            console.error(err);
        }
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$vocabKeywordsFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$tripleDataFill() {
    console.log("tripleDataFill START");
    // Scatter plot of the number of triples through time
    let triplesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) { GRAPH ?g {{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://purl.org/dc/terms/modified> ?date . ?curated <http://rdfs.org/ns/void#triples> ?rawO .}} GROUP BY ?g ?date ?endpointUrl ?o";
    let endpointTripleData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(triplesSPARQLquery).then((json)=>{
        json.forEach((itemResult, i)=>{
            let graph = itemResult.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(itemResult.date.value, "YYYY-MM-DDTHH:mm:ss");
            let endpointUrl = itemResult.endpointUrl.value;
            let triples = Number.parseInt(itemResult.o.value);
            endpointTripleData.push({
                endpoint: endpointUrl,
                graph: graph,
                date: date,
                triples: triples
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(endpointTripleData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$tripleCountFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("tripleDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$tripleCountFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$classDataFill() {
    console.log("classDataFill START");
    // Scatter plot of the number of classes through time
    let classesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) ?modifDate { GRAPH ?g {{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://purl.org/dc/terms/modified> ?date . ?base <http://rdfs.org/ns/void#classes> ?rawO .}} GROUP BY ?g ?date ?endpointUrl ?modifDate ?o";
    let endpointClassCountData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(classesSPARQLquery).then((json)=>{
        json.forEach((itemResult, i)=>{
            let graph = itemResult.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(itemResult.date.value, "YYYY-MM-DDTHH:mm:ss");
            let endpointUrl = itemResult.endpointUrl.value;
            let triples = Number.parseInt(itemResult.o.value);
            endpointClassCountData.push({
                endpoint: endpointUrl,
                graph: graph,
                date: date,
                classes: triples
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(endpointClassCountData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$classCountFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("classDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$classCountFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$propertyDataFill() {
    console.log("propertyDataFill START");
    // scatter plot of the number of properties through time
    let propertiesSPARQLquery = "SELECT DISTINCT ?g ?date ?endpointUrl (MAX(?rawO) AS ?o) { GRAPH ?g {{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://purl.org/dc/terms/modified> ?date . ?base <http://rdfs.org/ns/void#properties> ?rawO .}} GROUP BY ?endpointUrl ?g ?date ?o";
    let endpointPropertyCountData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(propertiesSPARQLquery).then((json)=>{
        json.forEach((itemResult, i)=>{
            let graph = itemResult.g.value.replace("http://ns.inria.fr/indegx#", "");
            let endpointUrl = itemResult.endpointUrl.value;
            let properties = Number.parseInt(itemResult.o.value);
            let date = $ffc2274b02472392$export$6b862160d295c8e(itemResult.date.value, "YYYY-MM-DDTHH:mm:ss");
            endpointPropertyCountData.push({
                endpoint: endpointUrl,
                graph: graph,
                date: date,
                properties: properties
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(endpointPropertyCountData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$propertyCountFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("propertyDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$propertyCountFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$categoryTestCountFill() {
    console.log("categoryTestCountFill START");
    let testCategoryData = [];
    // Number of tests passed by test categories
    let testCategoryQuery = "SELECT DISTINCT ?g ?date ?category (count(DISTINCT ?test) AS ?count) ?endpointUrl { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://purl.org/dc/terms/modified> ?date . ?trace <http://www.w3.org/ns/earl#test> ?test . ?trace <http://www.w3.org/ns/earl#result> ?result . ?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#passed> . FILTER(STRSTARTS(str(?test), ?category)) VALUES ?category { 'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/' 'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/' 'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/' 'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/' 'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/' 'https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/' }}  } GROUP BY ?g ?date ?category ?endpointUrl";
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(testCategoryQuery).then((json)=>{
        json.forEach((itemResult, i)=>{
            let category = itemResult.category.value;
            let count = itemResult.count.value;
            let endpoint = itemResult.endpointUrl.value;
            let graph = itemResult.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(itemResult.date.value, "YYYY-MM-DDTHH:mm:ss");
            testCategoryData.push({
                category: category,
                graph: graph,
                date: date,
                endpoint: endpoint,
                count: count
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(testCategoryData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$categoryTestCountFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("categoryTestCountFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$categoryTestCountFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$totalCategoryTestCountFill() {
    console.log("totalCategoryTestCountFill START");
    // Number of tests passed by test categories
    let testCategoryQuery = "SELECT DISTINCT ?category ?g ?date (count(DISTINCT ?test) AS ?count) ?endpointUrl { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://purl.org/dc/terms/modified> ?date . ?trace <http://www.w3.org/ns/earl#test> ?test . ?trace <http://www.w3.org/ns/earl#result> ?result . ?result <http://www.w3.org/ns/earl#outcome> <http://www.w3.org/ns/earl#passed> . FILTER(STRSTARTS(str(?test), str(?category))) VALUES ?category { <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/asserted/> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/extraction/computed/> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sportal/> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL10/> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/sparqles/SPARQL11/> } } } GROUP BY ?g ?date ?category ?endpointUrl ORDER BY ?category ";
    let totalTestCategoryData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(testCategoryQuery).then((json)=>{
        json.forEach((itemResult, i)=>{
            let category = itemResult.category.value;
            let count = itemResult.count.value;
            let endpoint = itemResult.endpointUrl.value;
            let graph = itemResult.g.value;
            let date = $ffc2274b02472392$export$6b862160d295c8e(itemResult.date.value, "YYYY-MM-DDTHH:mm:ss");
            totalTestCategoryData.push({
                category: category,
                endpoint: endpoint,
                graph: graph,
                date: date,
                count: count
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(totalTestCategoryData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$totalCategoryTestCountFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("totalCategoryTestCountFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$totalCategoryTestCountFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$endpointTestsDataFill() {
    console.log("endpointTestsDataFill START");
    let appliedTestQuery = "SELECT DISTINCT ?endpointUrl ?g ?date ?rule { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://purl.org/dc/terms/modified> ?date . ?curated <http://www.w3.org/ns/prov#wasGeneratedBy> ?rule . { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }} }";
    let endpointTestsData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(appliedTestQuery).then((json)=>{
        json.forEach((item, i)=>{
            let endpointUrl = item.endpointUrl.value;
            let rule = item.rule.value;
            let graph = item.g.value;
            let date = $ffc2274b02472392$export$6b862160d295c8e(item.date.value, "YYYY-MM-DDTHH:mm:ss");
            endpointTestsData.push({
                endpoint: endpointUrl,
                activity: rule,
                graph: graph,
                date: date
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(endpointTestsData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$endpointTestsDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("endpointTestsDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$endpointTestsDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$totalRuntimeDataFill() {
    console.log("totalRuntimeDataFill START");
    let maxMinTimeQuery = "SELECT DISTINCT ?g ?endpointUrl ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) {  GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . ?metadata <http://purl.org/dc/terms/modified> ?date . ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } } } ";
    let totalRuntimeData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(maxMinTimeQuery).then((jsonResponse)=>{
        jsonResponse.forEach((itemResult, i)=>{
            let graph = itemResult.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(itemResult.date.value);
            let start = $ffc2274b02472392$export$6b862160d295c8e(itemResult.start.value);
            let end = $ffc2274b02472392$export$6b862160d295c8e(itemResult.end.value);
            let endpointUrl = itemResult.endpointUrl.value;
            let runtimeData = (0, $fzfjp$dayjs).duration(end.diff(start));
            totalRuntimeData.push({
                graph: graph,
                endpoint: endpointUrl,
                date: date,
                start: start,
                end: end,
                runtime: runtimeData
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(totalRuntimeData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$totalRuntimeDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("totalRuntimeDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$totalRuntimeDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$averageRuntimeDataFill() {
    console.log("averageRuntimeDataFill START");
    let maxMinTimeQuery = "SELECT DISTINCT ?g ?date (MIN(?startTime) AS ?start) (MAX(?endTime) AS ?end) { GRAPH ?g {?metadata <http://ns.inria.fr/kg/index#curated> ?data , ?endpoint . ?metadata <http://ns.inria.fr/kg/index#trace> ?trace . ?metadata <http://purl.org/dc/terms/modified> ?date . ?trace <http://www.w3.org/ns/prov#startedAtTime> ?startTime . ?trace <http://www.w3.org/ns/prov#endedAtTime> ?endTime . } }";
    let numberOfEndpointQuery = "SELECT DISTINCT ?g (COUNT(?endpointUrl) AS ?count) { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?dataset . { ?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } } }";
    let averageRuntimeData = [];
    let graphStartEndMap = new Map();
    return Promise.all([
        $f89f46b083ca6896$var$paginatedSparqlQueryPromise(maxMinTimeQuery).then((jsonResponse)=>{
            jsonResponse.forEach((itemResult, i)=>{
                let graph = itemResult.g.value.replace("http://ns.inria.fr/indegx#", "");
                let date = $ffc2274b02472392$export$6b862160d295c8e(itemResult.date.value, "YYYY-MM-DDTHH:mm:ss");
                let start = $ffc2274b02472392$export$6b862160d295c8e(itemResult.start.value, "YYYY-MM-DDTHH:mm:ss");
                let end = $ffc2274b02472392$export$6b862160d295c8e(itemResult.end.value, "YYYY-MM-DDTHH:mm:ss");
                let runtime = (0, $fzfjp$dayjs).duration(end.diff(start));
                if (graphStartEndMap.get(graph) == undefined) graphStartEndMap.set(graph, {});
                graphStartEndMap.get(graph).start = start;
                graphStartEndMap.get(graph).end = end;
                graphStartEndMap.get(graph).runtime = runtime;
                graphStartEndMap.get(graph).graph = graph;
                graphStartEndMap.get(graph).date = date;
            });
        }),
        $f89f46b083ca6896$var$paginatedSparqlQueryPromise(numberOfEndpointQuery).then((numberOfEndpointJson)=>{
            numberOfEndpointJson.forEach((numberEndpointItem, i)=>{
                let graph = numberEndpointItem.g.value;
                graph = graph.replace("http://ns.inria.fr/indegx#", "");
                let count = numberEndpointItem.count.value;
                if (graphStartEndMap.get(graph) == undefined) graphStartEndMap.set(graph, {});
                graphStartEndMap.get(graph).count = count;
                averageRuntimeData.push(graphStartEndMap.get(graph));
            });
        })
    ]).then(()=>{
        try {
            let content = JSON.stringify(averageRuntimeData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$averageRuntimeDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("averageRuntimeDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$averageRuntimeDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$classAndPropertiesDataFill() {
    console.log("classAndPropertiesDataFill START");
    let classPartitionQuery = "SELECT DISTINCT ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co { GRAPH ?g {{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?base <http://rdfs.org/ns/void#classPartition> ?classPartition . ?classPartition <http://rdfs.org/ns/void#class> ?c . OPTIONAL { ?classPartition <http://rdfs.org/ns/void#triples> ?ct . } OPTIONAL { ?classPartition <http://rdfs.org/ns/void#classes> ?cc . } OPTIONAL { ?classPartition <http://rdfs.org/ns/void#properties> ?cp . } OPTIONAL { ?classPartition <http://rdfs.org/ns/void#distinctSubjects> ?cs . } OPTIONAL { ?classPartition <http://rdfs.org/ns/void#distinctObjects> ?co . } FILTER(! isBlank(?c)) }} GROUP BY ?endpointUrl ?c ?ct ?cc ?cp ?cs ?co ";
    let classSet = new Set();
    let classCountsEndpointsMap = new Map();
    let classPropertyCountsEndpointsMap = new Map();
    let classContentData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(classPartitionQuery).then((json)=>{
        json.forEach((item, i)=>{
            let c = item.c.value;
            classSet.add(c);
            let endpointUrl = item.endpointUrl.value;
            if (classCountsEndpointsMap.get(c) == undefined) classCountsEndpointsMap.set(c, {
                class: c
            });
            if (item.ct != undefined) {
                let ct = Number.parseInt(item.ct.value);
                let currentClassItem = classCountsEndpointsMap.get(c);
                if (classCountsEndpointsMap.get(c).triples == undefined) {
                    currentClassItem.triples = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.triples = currentClassItem.triples + ct;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if (item.cc != undefined) {
                let cc = Number.parseInt(item.cc.value);
                let currentClassItem = classCountsEndpointsMap.get(c);
                if (classCountsEndpointsMap.get(c).classes == undefined) {
                    currentClassItem.classes = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.classes = currentClassItem.classes + cc;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if (item.cp != undefined) {
                let cp = Number.parseInt(item.cp.value);
                let currentClassItem = classCountsEndpointsMap.get(c);
                if (classCountsEndpointsMap.get(c).properties == undefined) {
                    currentClassItem.properties = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.properties = currentClassItem.properties + cp;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if (item.cs != undefined) {
                let cs = Number.parseInt(item.cs.value);
                let currentClassItem = classCountsEndpointsMap.get(c);
                if (classCountsEndpointsMap.get(c).distinctSubjects == undefined) {
                    currentClassItem.distinctSubjects = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.distinctSubjects = currentClassItem.distinctSubjects + cs;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if (item.co != undefined) {
                let co = Number.parseInt(item.co.value);
                let currentClassItem = classCountsEndpointsMap.get(c);
                if (classCountsEndpointsMap.get(c).distinctObjects == undefined) {
                    currentClassItem.distinctObjects = 0;
                    classCountsEndpointsMap.set(c, currentClassItem);
                }
                currentClassItem.distinctObjects = currentClassItem.distinctObjects + co;
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            if (classCountsEndpointsMap.get(c).endpoints == undefined) {
                let currentClassItem = classCountsEndpointsMap.get(c);
                currentClassItem.endpoints = new Set();
                classCountsEndpointsMap.set(c, currentClassItem);
            }
            classCountsEndpointsMap.get(c).endpoints.add(endpointUrl);
        });
    }).then(()=>{
        let classPropertyPartitionQuery = "SELECT DISTINCT ?endpointUrl ?c ?p ?pt ?po ?ps { GRAPH ?g {?endpoint <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . ?metadata <http://ns.inria.fr/kg/index#curated> ?endpoint , ?base . ?base <http://rdfs.org/ns/void#classPartition> ?classPartition . ?classPartition <http://rdfs.org/ns/void#class> ?c . ?classPartition <http://rdfs.org/ns/void#propertyPartition> ?classPropertyPartition . ?classPropertyPartition <http://rdfs.org/ns/void#property> ?p . OPTIONAL { ?classPropertyPartition <http://rdfs.org/ns/void#triples> ?pt . } OPTIONAL { ?classPropertyPartition <http://rdfs.org/ns/void#distinctSubjects> ?ps . } OPTIONAL { ?classPropertyPartition <http://rdfs.org/ns/void#distinctObjects> ?po . } FILTER(! isBlank(?c)) }} GROUP BY ?endpointUrl ?c ?p ?pt ?po ?ps ";
        return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(classPropertyPartitionQuery).then((json)=>{
            json.forEach((item, i)=>{
                let c = item.c.value;
                let p = item.p.value;
                let endpointUrl = item.endpointUrl.value;
                classSet.add(c);
                if (classPropertyCountsEndpointsMap.get(c) == undefined) classPropertyCountsEndpointsMap.set(c, new Map());
                if (classPropertyCountsEndpointsMap.get(c).get(p) == undefined) classPropertyCountsEndpointsMap.get(c).set(p, {
                    property: p
                });
                if (item.pt != undefined) {
                    let pt = Number.parseInt(item.pt.value);
                    if (classPropertyCountsEndpointsMap.get(c).get(p).triples == undefined) classPropertyCountsEndpointsMap.get(c).get(p).triples = 0;
                    classPropertyCountsEndpointsMap.get(c).get(p).triples = classPropertyCountsEndpointsMap.get(c).get(p).triples + pt;
                }
                if (item.ps != undefined) {
                    let ps = Number.parseInt(item.ps.value);
                    if (classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects == undefined) classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = 0;
                    classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects = classPropertyCountsEndpointsMap.get(c).get(p).distinctSubjects + ps;
                }
                if (item.po != undefined) {
                    let po = Number.parseInt(item.po.value);
                    if (classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects == undefined) classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects = 0;
                    classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects = classPropertyCountsEndpointsMap.get(c).get(p).distinctObjects + po;
                }
                if (classPropertyCountsEndpointsMap.get(c).get(p).endpoints == undefined) classPropertyCountsEndpointsMap.get(c).get(p).endpoints = new Set();
                classPropertyCountsEndpointsMap.get(c).get(p).endpoints.add(endpointUrl);
            });
        });
    }).then(()=>{
        classSet.forEach((className)=>{
            let classCountItem = classCountsEndpointsMap.get(className);
            let classItem = classCountItem;
            if (classCountItem == undefined) classItem = {
                class: className
            };
            if (classItem.endpoints != undefined) classItem.endpoints = [
                ...classItem.endpoints
            ];
            let classPropertyItem = classPropertyCountsEndpointsMap.get(className);
            if (classPropertyItem != undefined) {
                classItem.propertyPartitions = [];
                classPropertyItem.forEach((propertyPartitionItem, propertyName, map1)=>{
                    propertyPartitionItem.endpoints = [
                        ...propertyPartitionItem.endpoints
                    ];
                    classItem.propertyPartitions.push(propertyPartitionItem);
                });
            }
            classContentData.push(classItem);
        });
        try {
            let content = JSON.stringify(classContentData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$classPropertyDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("classAndPropertiesDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$classPropertyDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$datasetDescriptionDataFill() {
    console.log("datasetDescriptionDataDataFill START");
    let provenanceWhoCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }OPTIONAL {{ ?dataset <http://purl.org/dc/terms/creator> ?o } UNION { ?dataset <http://purl.org/dc/terms/contributor> ?o } UNION { ?dataset <http://purl.org/dc/terms/publisher> ?o } } } } ";
    let provenanceLicenseCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }OPTIONAL {{ ?dataset <http://purl.org/dc/terms/license> ?o } UNION {?dataset <http://purl.org/dc/terms/conformsTo> ?o } } } } ";
    let provenanceDateCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }OPTIONAL { { ?dataset <http://purl.org/dc/terms/modified> ?o } UNION { ?dataset <http://www.w3.org/ns/prov#wasGeneratedAtTime> ?o } UNION { ?dataset <http://purl.org/dc/terms/issued> ?o } } } } ";
    let provenanceSourceCheckQuery = "SELECT DISTINCT ?endpointUrl ?o { GRAPH ?g { ?metadata <http://ns.inria.fr/kg/index#curated> ?dataset . { ?dataset <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?dataset <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl } UNION { ?dataset <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl }OPTIONAL {{ ?dataset <http://purl.org/dc/terms/source> ?o } UNION { ?dataset <http://www.w3.org/ns/prov#wasDerivedFrom> ?o } UNION { ?dataset <http://purl.org/dc/terms/format> ?o } } } } ";
    let endpointDescriptionElementMap = new Map();
    let datasetDescriptionData = [];
    return Promise.all([
        $f89f46b083ca6896$var$paginatedSparqlQueryPromise(provenanceWhoCheckQuery).then((json)=>{
            json.forEach((item, i)=>{
                let endpointUrl = item.endpointUrl.value;
                let who = item.o != undefined;
                let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                if (currentEndpointItem == undefined) {
                    endpointDescriptionElementMap.set(endpointUrl, {
                        endpoint: endpointUrl
                    });
                    currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                }
                currentEndpointItem.who = who;
                if (who) currentEndpointItem.whoValue = item.o.value;
                endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
            });
        }),
        $f89f46b083ca6896$var$paginatedSparqlQueryPromise(provenanceLicenseCheckQuery).then((json)=>{
            json.forEach((item, i)=>{
                let endpointUrl = item.endpointUrl.value;
                let license = item.o != undefined;
                let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                if (currentEndpointItem == undefined) {
                    endpointDescriptionElementMap.set(endpointUrl, {
                        endpoint: endpointUrl
                    });
                    currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                }
                currentEndpointItem.license = license;
                if (license) currentEndpointItem.licenseValue = item.o.value;
                endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
            });
        }).catch((error)=>{
            console.log(error);
        }),
        $f89f46b083ca6896$var$paginatedSparqlQueryPromise(provenanceDateCheckQuery).then((json)=>{
            json.forEach((item, i)=>{
                let endpointUrl = item.endpointUrl.value;
                let time = item.o != undefined;
                let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                if (currentEndpointItem == undefined) {
                    endpointDescriptionElementMap.set(endpointUrl, {
                        endpoint: endpointUrl
                    });
                    currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                }
                currentEndpointItem.time = time;
                if (time) currentEndpointItem.timeValue = item.o.value;
                endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
            });
        }).catch((error)=>{
            console.log(error);
        }),
        $f89f46b083ca6896$var$paginatedSparqlQueryPromise(provenanceSourceCheckQuery).then((json)=>{
            json.forEach((item, i)=>{
                let endpointUrl = item.endpointUrl.value;
                let source = item.o != undefined;
                let currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                if (currentEndpointItem == undefined) {
                    endpointDescriptionElementMap.set(endpointUrl, {
                        endpoint: endpointUrl
                    });
                    currentEndpointItem = endpointDescriptionElementMap.get(endpointUrl);
                }
                currentEndpointItem.source = source;
                if (source) currentEndpointItem.sourceValue = item.o.value;
                endpointDescriptionElementMap.set(endpointUrl, currentEndpointItem);
            });
            endpointDescriptionElementMap.forEach((prov, endpoint, map)=>{
                datasetDescriptionData.push(prov);
            });
        }).catch((error)=>{
            console.log(error);
        })
    ]).finally(()=>{
        try {
            let content = JSON.stringify(datasetDescriptionData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$datasetDescriptionDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("datasetDescriptionDataDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$datasetDescriptionDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$shortUrisDataFill() {
    console.log("shortUrisDataFill START");
    let shortUrisMeasureQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { GRAPH ?g {{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } ?metadata <http://purl.org/dc/terms/modified> ?date . ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/shortUris.ttl> . ?measureNode <http://www.w3.org/ns/dqv#value> ?measure . } } GROUP BY ?g ?date ?endpointUrl ?measure ";
    let shortUriData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(shortUrisMeasureQuery).then((json)=>{
        let graphSet = new Set();
        json.forEach((jsonItem, i)=>{
            let endpoint = jsonItem.endpointUrl.value;
            let shortUriMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
            let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(jsonItem.date.value, "YYYY-MM-DDTHH:mm:ss");
            graphSet.add(graph);
            shortUriData.push({
                graph: graph,
                date: date,
                endpoint: endpoint,
                measure: shortUriMeasure
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(shortUriData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$shortUriDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("shortUrisDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$shortUriDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$readableLabelsDataFill() {
    console.log("readableLabelsDataFill START");
    let readableLabelsQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { GRAPH ?g {{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } ?metadata <http://purl.org/dc/terms/modified> ?date . ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/readableLabels.ttl> . ?measureNode <http://www.w3.org/ns/dqv#value> ?measure . }  } GROUP BY ?g ?date ?endpointUrl ?measure ";
    let readableLabelData = [];
    return $f89f46b083ca6896$var$paginatedSparqlQueryPromise(readableLabelsQuery).then((json)=>{
        json.forEach((jsonItem, i)=>{
            let endpoint = jsonItem.endpointUrl.value;
            let readableLabelMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
            let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(jsonItem.date.value, "YYYY-MM-DDTHH:mm:ss");
            readableLabelData.push({
                graph: graph,
                date: date,
                endpoint: endpoint,
                measure: readableLabelMeasure
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(readableLabelData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$readableLabelDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("readableLabelsDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$readableLabelDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$rdfDataStructureDataFill() {
    console.log("rdfDataStructureDataFill START");
    let rdfDataStructureQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { GRAPH ?g {{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } ?metadata <http://purl.org/dc/terms/modified> ?date . ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/RDFDataStructures.ttl> . ?measureNode <http://www.w3.org/ns/dqv#value> ?measure . } } GROUP BY ?g ?date ?endpointUrl ?measure ";
    let rdfDataStructureData = [];
    $f89f46b083ca6896$var$paginatedSparqlQueryPromise(rdfDataStructureQuery).then((json)=>{
        json.forEach((jsonItem, i)=>{
            let endpoint = jsonItem.endpointUrl.value;
            let rdfDataStructureMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
            let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(jsonItem.date.value, "YYYY-MM-DDTHH:mm:ss");
            rdfDataStructureData.push({
                graph: graph,
                date: date,
                endpoint: endpoint,
                measure: rdfDataStructureMeasure
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(rdfDataStructureData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$rdfDataStructureDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("rdfDataStructureDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$rdfDataStructureDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
function $f89f46b083ca6896$var$blankNodeDataFill() {
    console.log("blankNodeDataFill START");
    let blankNodeQuery = "SELECT DISTINCT ?g ?date ?endpointUrl ?measure { GRAPH ?g {?metadata <http://purl.org/dc/terms/modified> ?date . { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . } UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . } ?metadata <http://ns.inria.fr/kg/index#curated> ?curated . ?metadata <http://www.w3.org/ns/dqv#hasQualityMeasurement> ?measureNode . ?measureNode <http://www.w3.org/ns/dqv#isMeasurementOf> <https://raw.githubusercontent.com/Wimmics/dekalog/master/rules/check/blankNodeUsage.ttl> . ?measureNode <http://www.w3.org/ns/dqv#value> ?measure . } } GROUP BY ?g ?date ?endpointUrl ?measure ";
    let blankNodeData = [];
    return $f89f46b083ca6896$var$sparqlQueryPromise(blankNodeQuery).then((json)=>{
        let graphSet = new Set();
        json.results.bindings.forEach((jsonItem, i)=>{
            let endpoint = jsonItem.endpointUrl.value;
            let blankNodeMeasure = Number.parseFloat(jsonItem.measure.value) * 100;
            let graph = jsonItem.g.value.replace("http://ns.inria.fr/indegx#", "");
            let date = $ffc2274b02472392$export$6b862160d295c8e(jsonItem.date.value, "YYYY-MM-DDTHH:mm:ss");
            graphSet.add(graph);
            blankNodeData.push({
                graph: graph,
                date: date,
                endpoint: endpoint,
                measure: blankNodeMeasure
            });
        });
    }).then(()=>{
        try {
            let content = JSON.stringify(blankNodeData);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$blankNodesDataFilename, content);
        } catch (err) {
            console.error(err);
        }
        console.log("blankNodeDataFill END");
    }).catch((error)=>{
        console.log(error);
        try {
            let content = JSON.stringify([]);
            $fzfjp$writeFileSync($f89f46b083ca6896$var$blankNodesDataFilename, content);
        } catch (err) {
            console.error(err);
        }
    });
}
Promise.allSettled([
    $f89f46b083ca6896$var$whiteListFill(),
    $f89f46b083ca6896$var$endpointMapfill(),
    $f89f46b083ca6896$var$SPARQLCoverageFill(),
    $f89f46b083ca6896$var$vocabFill(),
    $f89f46b083ca6896$var$tripleDataFill(),
    $f89f46b083ca6896$var$classDataFill(),
    $f89f46b083ca6896$var$propertyDataFill(),
    $f89f46b083ca6896$var$categoryTestCountFill(),
    $f89f46b083ca6896$var$totalCategoryTestCountFill(),
    $f89f46b083ca6896$var$endpointTestsDataFill(),
    $f89f46b083ca6896$var$totalRuntimeDataFill(),
    $f89f46b083ca6896$var$averageRuntimeDataFill(),
    $f89f46b083ca6896$var$classAndPropertiesDataFill(),
    $f89f46b083ca6896$var$datasetDescriptionDataFill(),
    $f89f46b083ca6896$var$shortUrisDataFill(),
    $f89f46b083ca6896$var$rdfDataStructureDataFill(),
    $f89f46b083ca6896$var$readableLabelsDataFill(),
    $f89f46b083ca6896$var$blankNodeDataFill()
]).catch((error)=>{
    console.log(error);
});


//# sourceMappingURL=dataCaching.js.map
