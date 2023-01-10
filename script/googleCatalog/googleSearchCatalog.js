const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch("37e3bc7d60ad03cc9edbd4da75d5a5c0e24fdac83271fbca7424d5421537de0b");
const fs = require('fs')

var params = {
    engine: "google",
    q: "allinurl:sparql",
    google_domain: "google.com",
    start: "0",
    num: "25"
};

var finalData = [];
var maxNumberPages = 20;
const callback = function (data) {
    try {
        var currentPage = data.serpapi_pagination.current;
        console.log(currentPage)
        if(data.organic_results != undefined) {
            data.organic_results.forEach(searchResult => {
                if (searchResult.link.endsWith("/sparql")
                    || searchResult.link.endsWith("/sparql/")) {
                    finalData.push(searchResult);
                }
            });
            if (currentPage <= maxNumberPages) {
                params.start = params.start + params.num;
                search.json(params, callback);
            } else {
                fs.writeFile('result.json', JSON.stringify(finalData), err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                })
            }
        } else {
            fs.writeFile('result.json', JSON.stringify(finalData), err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
        }
    } catch (error) {
        console.log(data)
        console.log(error)
        fs.writeFile('result.json', JSON.stringify(finalData), err => {
            if (err) {
                console.error(err)
                return
            }
        })
    }
};

// Show result as JSON
search.json(params, callback);