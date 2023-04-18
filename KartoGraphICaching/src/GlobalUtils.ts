import fetch, { FetchError, RequestInit, Headers } from 'node-fetch';
import * as fs from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import dayjs from "dayjs";
import * as Logger from "./LogUtils"

export let nbFetchRetries = 10;
export let millisecondsBetweenRetries = 5000;
let countConcurrentQueries = 0;
export let maxConccurentQueries = 300;
export let delayMillisecondsTimeForConccurentQuery = 1000

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> { }


// Parse the date in any format
export function parseDate(input: string, format: string = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") {
    let result = dayjs(input, format);
    if((format.localeCompare("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") == 0) && ! result.isValid()) {
        result = parseDate(input, "dd-MM-yyyy'T'HH:mm:ss.SSS'Z'");
    } else if(format.localeCompare("dd-MM-yyyy'T'HH:mm:ss.SSS'Z'") && ! result.isValid()) {
        result = parseDate(input, "yyyy-MM-dd'T'HH:mm:ss");
    } else if(format.localeCompare("yyyy-MM-dd'T'HH:mm:ss") && ! result.isValid()) {
        result = parseDate(input, "dd-MM-yyyy'T'HH:mm:ss");
    } else if(format.localeCompare("dd-MM-yyyy'T'HH:mm:ss") && ! result.isValid()) { 
        result = parseDate(input, "dd-MM-yyyy'T'HH:mm:ss.SSSXXX");
    } else if(format.localeCompare("dd-MM-yyyy'T'HH:mm:ss.SSSXXX") && ! result.isValid()) {
        result = parseDate(input, "dd-MM-yyyy'T'HH:mm:ssXXX");
    }
    return result;
}

export function getCountConccurentQueries() {
    return countConcurrentQueries;
}

export function setNbFetchRetries(nb: number) {
    if (nb !== undefined && nb !== null && nb >= 0) {
        nbFetchRetries = nb;
    } else {
        throw new Error("The number of retries must be a positive integer");
    }
}

export function setMillisecondsBetweenRetries(milliseconds: number) {
    if (milliseconds !== undefined && milliseconds !== null && milliseconds >= 0) {
        millisecondsBetweenRetries = milliseconds;
    } else {
        throw new Error("The number of milliseconds between retries must be a positive integer");
    }
}

export function setMaxConccurentQueries(max: number) {
    if (max !== undefined && max !== null && max >= 0) {
        maxConccurentQueries = max;
    } else {
        throw new Error("The number of maximum concurrent queries must be a positive integer");
    }
}

export function setDelayMillisecondsTimeForConccurentQuery(milliseconds: number) {
    if (milliseconds !== undefined && milliseconds !== null && milliseconds >= 0) {
        delayMillisecondsTimeForConccurentQuery = milliseconds;
    } else {
        throw new Error("The number of milliseconds between queries must be a positive integer");
    }
}

export function appendToFile(filename, content) {
    fs.writeFile(filename, content, { flag: 'a+' }).catch(error => {
        Logger.error("Error appending to file", error)
    });
}

export function writeFile(filename, content) {
    fs.writeFile(filename, content).catch(error => {
        Logger.error("Error writing to file", filename, error)
    });
}

export function readFile(filename: string): Promise<string> {
    let readFilePromise: Promise<string>;
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
        readFilePromise = fetchGETPromise(filename)
    } else if (filename.startsWith("file://")) {
        readFilePromise = fs.readFile(filename.replace("file://", "")).then(buffer => buffer.toString())
    } else {
        readFilePromise = fs.readFile(filename).then(buffer => buffer.toString())
    }
    return readFilePromise;
}

export function readJSONFile(filename: string): Promise<JSONValue> {
    return readFile(filename).then(content => JSON.parse(content));
}

export function extractSettledPromiseValues(settledPromisesResult: PromiseSettledResult<any>[]) {
    return settledPromisesResult.map(promiseResult => {
        if (promiseResult.status === "fulfilled") {
            return promiseResult.value;
        } else {
            return undefined;
        }
    });
}

type promiseCreationFunction = {
    (...args: any[]): Promise<any>;
}

/**
 * Execute promises iteratively, on the opposite to Promise.all, which execute promises in parallel.
 * @param args Array of the arguments to pass to the promiseCreationFunction. Each element of the array is an array of arguments to pass to the promiseCreationFunction.
 * @param promiseCreationFunction A function generating a promise from the elements in the args arrays.
 * @returns a promise resolved when all the promises created by the promiseCreationFunction are resolved.
 */
export function iterativePromises(args: Array<Array<any>>, promiseCreationFunction: promiseCreationFunction): Promise<any> {
    let argsCopy = args.map(arg => arg);
    if (argsCopy.length > 0) {
        return promiseCreationFunction.apply(this, argsCopy[0]).then(() => {
            argsCopy.shift();
            return iterativePromises(argsCopy, promiseCreationFunction);
        })
    }
    return new Promise<void>((resolve, reject) => resolve());
}

export function fetchPromise(url, header = new Map(), method = "GET", query = "", numTry = 0) {
    let myHeaders = new Headers();
    myHeaders.set('pragma', 'no-cache');
    myHeaders.set('cache-control', 'no-cache');
    header.forEach((value, key) => {
        myHeaders.set(key, value);
    });
    let myInit: RequestInit = {
        method: method,
        headers: myHeaders,
        redirect: 'follow',
    };
    if (method.localeCompare("POST") == 0) {
        myInit.body = query;
    }
    if (countConcurrentQueries >= maxConccurentQueries) {
        return setTimeout(delayMillisecondsTimeForConccurentQuery).then(() => fetchPromise(url, header, method, query, numTry))
    } else {
        countConcurrentQueries++;
        return fetch(url, myInit)
            .then(response => {
                if (response.ok) {
                    return response.blob().then(blob => blob.text())
                } else {
                    throw response;
                }
            }).catch(error => {
                if (error instanceof FetchError) {
                    Logger.error(error.type, error.message)
                    Logger.info("Try:", numTry, "Fetch ", method, url, query);
                    if (numTry < nbFetchRetries) {
                        return setTimeout(millisecondsBetweenRetries).then(fetchPromise(url, header, method, query, numTry + 1));
                    } else {
                        Logger.error("Too many retries", error);
                    }
                } else {
                    Logger.error("FetchError, try n°", numTry, error);
                }
            }).finally(() => {
                countConcurrentQueries--;
                return;
            });

    }
}

export function fetchGETPromise(url: string, header = new Map()): Promise<string> {
    return fetchPromise(url, header);
}

export function fetchPOSTPromise(url: string, query = "", header = new Map()): Promise<string> {
    return fetchPromise(url, header, "POST", query);
}

export function fetchJSONPromise(url: string, otherHeaders = new Map()): Promise<JSONValue> {
    let header = new Map();
    header.set('Content-Type', 'application/json');
    otherHeaders.forEach((value, key) => {
        header.set(key, value)
    })
    return fetchPromise(url, header).then(response => {
        if(response == null || response == undefined || response == "") {
            return {};
        } else {
            try {
                return JSON.parse(response);
            } catch (error) {
                Logger.error(url, error, response)
                throw error
            }
        }
    });
}

/**
 * Taken from https://stackoverflow.com/questions/17267329/converting-unicode-character-to-string-format
 * @param text 
 * @returns a string with unicode codes replaced by characters
 */
export function unicodeToUrlendcode(text: string): string {
    return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
            let unicodeMatch = String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
            let urlEncodedMatch = encodeURIComponent(unicodeMatch);
            return urlEncodedMatch;
        });
}