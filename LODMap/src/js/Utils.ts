import dayjs from 'dayjs';
import $ from 'jquery';

export function intersection(setA, setB) {
    let intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}

export function haveIntersection(setA, setB) {
    return intersection(setA, setB).size > 0;
}

// Set the precision of a float
export function precise(x: number, n = 3) {
    return x.toPrecision(n);
}

// Parse the date in any format
export function parseDate(input, format?) {
    return dayjs(input, format);
}