import dayjs from "dayjs"
import * as util from "node:util"
import { appendToFile, writeFile } from "./GlobalUtils";

let logFileName = "kartographicaching.log"

export function setLogFileName(fileName: string) {
    if(fileName == null || fileName == undefined || fileName == "") {
        logFileName = "kartographicaching.log";
    } else {
        logFileName = fileName;
    }
}

export function log(logObject: any, ...o: any[]) : void {
    logging("LOG", logObject, ...o);
}

export function error(logObject: any, ...o: any[]) : void {
    logging("ERROR", logObject, ...o);
}

export function info(logObject: any, ...o: any[]) : void {
    logging("INFO", logObject, ...o);
}

function logging(level, logObject: any, ...o: any[]): void {
    const now = dayjs();
    const message = util.format("[%s][%s]: %s", level, now.toISOString(), logObject, ...o);
    console.error(message);
    appendToFile(logFileName, message + "\n");
}