import { Dayjs } from "dayjs"

export type TextElement = {
    key: string,
    value: string
}

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

export type SPARQLJSONResult = {
    head: {
        vars: string[]
    },
    results: {
        bindings: {
            [x: string]: {
                type: string,
                value: string
            }
        }[]
    }
}

export type RunsetObject = {
    id: string,
    name: string,
    graphs: string[]
}

export type EndpointIpGeolocObject = {
    key: string,
    value: {
        ip: string,
        geoloc: {
            status: string,
            country: string,
            countryCode: string,
            region: string,
            regionName: string,
            city: string,
            zip: string,
            lat: number,
            lon: number,
            timezone: string,
            isp: string,
            org: string,
            as: string,
            query: string
        }
    }
}

export type TimezoneMapObject = {
    key: string,
    value: {
        abbreviation: string,
        client_ip: string,
        datetime: string,
        day_of_week: number,
        day_of_year: number,
        dst: boolean,
        dst_from: string,
        dst_offset: number,
        dst_until: string,
        raw_offset: number,
        timezone: string,
        unixtime: number,
        utc_datetime: string,
        utc_offset: string,
        week_number: number
    }
}

export type EndpointTestObject = { 
    endpoint: string, 
    activity: string, 
    graph: string, 
    date: Dayjs 
}

export type GeolocDataObject = {
    sparqlTimezone: string;
    endpoint: string,
    lat: number,
    lon: number,
    country: string,
    region: string,
    city: string,
    org: string,
    timezone: string,
    popupHTML: string
}

export type SPARQLCoverageDataObject = {
    endpoint: string,
    sparql10: number,
    sparql11: number,
    sparqlTotal: number
}

export type SPARQLFeatureDataObject = {
    endpoint: string,
    features: Array<string>
}

export type VocabEndpointDataObject = {
    endpoint: string,
    vocabularies: Array<string>
}

export type VocabKeywordsDataObject = {
    vocabulary: string,
    keywords: Array<string>
}

export type ClassCountDataObject = {
    endpoint: string,
    graph: string,
    date: Dayjs,
    classes: number
}

export type PropertyCountDataObject = {
    endpoint: string,
    graph: string,
    date: Dayjs,
    properties: number
}

export type TripleCountDataObject = {
    endpoint: string,
    graph: string,
    date: Dayjs,
    triples: number
}

export type EndpointTestDataObject = {
    endpoint: string,
    graph: string,
    date: Dayjs,
    activity: string
}

export type TotalRuntimeDataObject = {
    graph: string,
    endpoint: string,
    date: Dayjs,
    start: Dayjs,
    end: Dayjs,
    runtime: any
}

export type AverageRuntimeDataObject = {
    count: number,
    start: Dayjs,
    end: Dayjs,
    runtime: any,
    graph: string,
    date: Dayjs
}

export type ClassPropertyDataObject = {
}

export type DatasetDescriptionDataObject = {
    endpoint: string,
    license: boolean,
    time: boolean,
    source: boolean,
    who: boolean
}

export type ShortUriDataObject = {
    graph: string,
    date: Dayjs,
    endpoint: string,
    measure: number
}

export type QualityMeasureDataObject = {
    graph: string,
    date: Dayjs,
    endpoint: string,
    measure: number
}

export type SPARQLFeatureDescriptionDataObject = {
    feature: string,
    description: string,
    query: string
}