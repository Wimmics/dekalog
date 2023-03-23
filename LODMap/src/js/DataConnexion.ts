

export function xhrGetPromise(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject({
                    url: decodeURIComponent(url),
                    encodedUrl: url,
                    response: xhr.responseText,
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                url: decodeURIComponent(url),
                encodedUrl: url,
                response: xhr.responseText,
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

export function xhrJSONPromise(url) {
    return xhrGetPromise(url).then(response => {
        return JSON.parse(response);
    });
}

export function sparqlQueryPromise(query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return xhrJSONPromise('https://prod-dekalog.inria.fr/sparql?query=' + encodeURIComponent(query) + '&format=json');
    }
    else {
        throw "ERROR " + query;
    }
}

export function paginatedSparqlQueryPromise(query, limit = queryPaginationSize, offset = 0, finalResult = []) {
    var paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
    return sparqlQueryPromise(paginatedQuery)
        .then(queryResult => {
            queryResult.results.bindings.forEach(resultItem => {
                var finaResultItem = {};
                queryResult.head.vars.forEach(variable => {
                    finaResultItem[variable] = resultItem[variable];
                })
                finalResult.push(finaResultItem);
            })
            if (queryResult.results.bindings.length > 0) {
                return paginatedSparqlQueryPromise(query, limit + queryPaginationSize, offset + queryPaginationSize, finalResult)
            }
        })
        .then(() => {
            return finalResult;
        })
        .catch(error => {
            console.log(error)
            return finalResult;
        })
}

export function cachePromise(cacheFile) {
    return xhrJSONPromise("https://prod-dekalog.inria.fr/cache/" + cacheFile);
}