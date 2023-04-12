const data = require('./endpointListFromServer.json');
const oldData = require('../endpointIpGeoloc.json');
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const fs = require('fs')

var oldDataMap = new Map();
oldData.forEach(item => {
    oldDataMap.set(item.key, item.value);
})

const dataEndpoints = data.results.bindings.map(item => item.endpointUrl.value)
var endpointIpMap = new Map();
var endpointGeolocMap = new Map();

var dataEndpointsIterator = 0;

function asyncIterationEndpointIp(iterator) {
    console.log(iterator)
    if (iterator < dataEndpoints.length) {
        let endpointUrl = dataEndpoints[iterator];
        if (oldDataMap.has(endpointUrl)) {
            endpointGeolocMap.set(endpointUrl, oldDataMap.get(endpointUrl).geoloc);
            endpointIpMap.set(endpointUrl, oldDataMap.get(endpointUrl).ip);
        }
            let endpointDomain = (new URL(endpointUrl)).hostname;
            return $.get("https://dns.google/resolve?name=" + endpointDomain)
                .done(json => {
                    const status = json.Status;
                    if (status == 0) {
                        if (json.Answer != undefined) {
                            const ip = json.Answer[0].data;
                            endpointIpMap.set(endpointUrl, ip);
                        }
                    } else {
                        console.log(endpointUrl)
                        console.log(json.Comment)
                    }
                }).done(() => {
                    var endpointIp = endpointIpMap.get(endpointUrl);
                    if (endpointIp != undefined) {
                        return $.get("http://ip-api.com/json/" + endpointIp)
                            .done(geolocJSON => {
                                if (geolocJSON.status.localeCompare("success") == 0) {
                                    endpointGeolocMap.set(endpointUrl, geolocJSON);
                                } else {
                                    console.log(endpointUrl)
                                    console.log(geolocJSON)
                                }
                            });
                    } else {
                        return $.Deferred();
                    }
                })
                .done(() => {
                    return asyncIterationEndpointIp(iterator + 1);
                }).done(() => {
                    var fileContent = [];
                    endpointGeolocMap.forEach((endpointGeoloc, endpointUrl, map) => {
                        var endpointIp = endpointIpMap.get(endpointUrl);
                        fileContent.push({
                            'key': endpointUrl,
                            'value': {
                                'ip': endpointIp,
                                'geoloc': endpointGeoloc
                            }
                        });
                    });

                    fs.writeFile('data.json', JSON.stringify(fileContent), err => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        //file written successfully
                    })
                });
    } else {
        return $.Deferred();
    }
};
asyncIterationEndpointIp(dataEndpointsIterator);
