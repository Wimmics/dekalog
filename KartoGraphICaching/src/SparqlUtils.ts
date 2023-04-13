import { fetchGETPromise, fetchJSONPromise, fetchPOSTPromise } from "./GlobalUtils";
import * as RDFUtils from "./RDFUtils";
import sparqljs from "sparqljs";
import * as Logger from "./LogUtils"

export let defaultQueryTimeout = 60000;

export const queryPaginationSize = 500;

export function setDefaultQueryTimeout(timeout: number) {
    if(timeout != undefined && timeout != null && timeout >= 0) {
        defaultQueryTimeout = timeout;
    } else {
        throw new Error("Timeout must be a positive number")
    }
}

export function sparqlQueryPromise(endpoint, query, timeout: number = defaultQueryTimeout): Promise<any> {
    let jsonHeaders = new Map();
    jsonHeaders.set("Accept", "application/sparql-results+json")
    if (isSparqlSelect(query)) {
        return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=' + timeout, jsonHeaders).catch(error => { Logger.error(endpoint, query, error); throw error })
    } else if (isSparqlAsk(query)) {
        return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=' + timeout, jsonHeaders).catch(() => { return { boolean: false } })
    } else if (isSparqlConstruct(query)) {
        return fetchGETPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=turtle&timeout=' + timeout).then(result => {
            let resultStore = RDFUtils.createStore();
            result = result.replaceAll("nodeID://", "_:") // Dirty hack to fix nodeID:// from Virtuoso servers for turtle
            return RDFUtils.parseTurtleToStore(result, resultStore).catch(error => {
                Logger.error(endpoint, query, error, result);
                return;
            });
        }).catch(error => { Logger.error(endpoint, query, error); throw error })
    } else if (isSparqlUpdate(query)) {
        return sendUpdateQuery(endpoint, query).catch(error => { Logger.error(endpoint, query, error); throw error });
    } else {
        Logger.error(new Error("Unexpected query type"))
    }
}

export function sendUpdateQuery(endpoint, updateQuery) {
    let updateHeader = new Map();
    updateHeader.set('Content-Type', 'application/sparql-update');
    return fetchPOSTPromise(endpoint, updateQuery, updateHeader).then(response => {
        return response;
    }).catch(error => {
        Logger.error("Error send update query",  error);
    })
}

export function checkSparqlType(queryString: string, queryType: "CONSTRUCT" | "SELECT" | "ASK" | "DESCRIBE" | "update") {
    let parser = new sparqljs.Parser();
    try {
        const parsedQuery = parser.parse(queryString);
        if (parsedQuery.queryType != undefined) {
            return (parsedQuery.queryType.localeCompare(queryType) == 0);
        } else if (parsedQuery.type != undefined) {
            return (parsedQuery.type.localeCompare(queryType) == 0);
        } else {
            throw new Error("No expected query type property : " + JSON.stringify(parsedQuery));
        }
    } catch (error) {
        Logger.error(queryString, error)
    }
}

export function isSparqlConstruct(queryString: string): boolean {
    return checkSparqlType(queryString, "CONSTRUCT");
}

export function isSparqlSelect(queryString: string): boolean {
    return checkSparqlType(queryString, "SELECT");
}

export function isSparqlAsk(queryString: string): boolean {
    return checkSparqlType(queryString, "ASK");
}

export function isSparqlDescribe(queryString: string): boolean {
    return checkSparqlType(queryString, "DESCRIBE");
}

export function isSparqlUpdate(queryString: string): boolean {
    return checkSparqlType(queryString, "update");
}

export function sparqlQueryToIndeGxPromise(query: string, timeout: number = defaultQueryTimeout): Promise<any> {
    return sparqlQueryPromise("http://prod-dekalog.inria.fr/sparql", query, timeout);
}

export function paginatedSparqlQueryPromise(endpoint, query, limit = queryPaginationSize, offset = 0, finalResult = []) {
    let paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
    return sparqlQueryPromise(endpoint, paginatedQuery)
        .then(queryResult => {
            queryResult.results.bindings.forEach(resultItem => {
                let finaResultItem = {};
                queryResult.head.vars.forEach(variable => {
                    finaResultItem[variable] = resultItem[variable];
                })
                finalResult.push(finaResultItem);
            })
            if (queryResult.results.bindings.length > 0) {
                return paginatedSparqlQueryPromise(endpoint, query, limit + queryPaginationSize, offset + queryPaginationSize, finalResult)
            }
        })
        .then(() => {
            return finalResult;
        })
        .catch(error => {
            Logger.log(error)
            return finalResult;
        })
        .finally(() => {
            return finalResult;
        })
}

export function paginatedSparqlQueryToIndeGxPromise(query, limit = queryPaginationSize, offset = 0, finalResult = []) {
    return paginatedSparqlQueryPromise("http://prod-dekalog.inria.fr/sparql", query, limit, offset, finalResult);
}