import $ from 'jquery';
import url from 'url';
import { blankNodesChart, blankNodesEchartsOptionFilename, classAndPropertiesContent, classNumberChart, classesEchartsOptionFilename, datasetDescriptionEchartsOptionFilename, descriptionElementChart, geolocChart, propertiesEchartsOptionFilename, propertyNumberChart, endpointVocabsChart, rdfDataStructureChart, rdfDataStructuresEchartsOptionFilename, readableLabelsChart, readableLabelsEchartsOptionFilename, shortUriChart, shortUrisEchartsOptionFilename, sparql10Chart, sparql10CoverageEchartsOptionFilename, sparql11Chart, sparql11CoverageEchartsOptionFilename, sparqlCoverCharts, sparqlCoverageEchartsOptionFilename, sparqlFeaturesContent, standardVocabCharts, tripleChart, triplesEchartsOptionFilename, vocabEndpointEchartsOptionFilename, vocabKeywordChart, keywordEndpointEchartsOptionFilename, standardVocabulariesEndpointGraphEchartsOptionFilename } from "./Charts";
import { ClassCountDataObject, DatasetDescriptionDataObject, GeolocDataObject, PropertyCountDataObject, QualityMeasureDataObject, ShortUriDataObject, SPARQLCoverageDataObject, SPARQLFeatureDataObject, SPARQLFeatureDescriptionDataObject, TextElement, TripleCountDataObject, VocabEndpointDataObject, JSONValue, RunsetObject } from "./Datatypes";
import { setButtonAsToggleCollapse } from "./ViewUtils";
import { cachePromise, xhrJSONPromise } from "./DataConnexion";
import { KartoChart } from './ViewClasses';

// Cached files
// const whiteListFilename = 'whiteLists';
const geolocDataFilename = 'geolocData';
const sparqlCoverCountFilename = 'sparqlCoverageData'
const sparqlFeaturesDataFilename = 'sparqlFeaturesData'
// const knownVocabDataFilename = 'knownVocabsData'
const vocabEndpointDataFilename = 'vocabEndpointData'
const endpointKeywordDataFilename = 'endpointKeywordsData'
const classCountDataFilename = 'classCountData'
const propertyCountDataFilename = 'propertyCountData'
const tripleCountDataFilename = 'tripleCountData'
const classPropertyDataFilename = "classPropertyData";
const datasetDescriptionDataFilename = "datasetDescriptionData";
const shortUriDataFilename = "shortUriData";
const rdfDataStructureDataFilename = "rdfDataStructureData";
const readableLabelDataFilename = "readableLabelData";
const blankNodesDataFilename = "blankNodesData";

const runsetsFile = cachePromise('runSets.json') as Promise<Array<RunsetObject>>;
const textElementsFile = xhrJSONPromise("https://raw.githubusercontent.com/Wimmics/dekalog/master/LODMap/src/data/cache/textElements.json");
const sparqlFeatureDescFile = cachePromise("SPARQLFeatureDescriptions.json");

export class Control {

    static ControlInstance: Control;

    geolocData(): Array<GeolocDataObject> {
        return this.retrieveFileFromVault(geolocDataFilename, this.currentRunset) as Array<GeolocDataObject>;
    };
    sparqlCoverCountData(): Array<SPARQLCoverageDataObject> {
        return this.retrieveFileFromVault(sparqlCoverCountFilename, this.currentRunset) as Array<SPARQLCoverageDataObject>;
    };
    sparqlFeaturesData(): Array<SPARQLFeatureDataObject> {
        return this.retrieveFileFromVault(sparqlFeaturesDataFilename, this.currentRunset) as Array<SPARQLFeatureDataObject>;
    };
    // knownVocabData(): Array<string> {
    //     return this.retrieveFileFromVault(knownVocabDataFilename, this.currentRunset) as Array<string>;
    // };
    vocabEndpointData(): Array<VocabEndpointDataObject> {
        return this.retrieveFileFromVault(vocabEndpointDataFilename, this.currentRunset) as Array<VocabEndpointDataObject>;
    };
    endpointKeywordData(): Array<VocabKeywordsDataObject> {
        return this.retrieveFileFromVault(endpointKeywordDataFilename, this.currentRunset) as Array<VocabKeywordsDataObject>;
    };
    classCountData(): Array<ClassCountDataObject> {
        return this.retrieveFileFromVault(classCountDataFilename, this.currentRunset) as Array<ClassCountDataObject>;
    };
    propertyCountData(): Array<PropertyCountDataObject> {
        return this.retrieveFileFromVault(propertyCountDataFilename, this.currentRunset) as Array<PropertyCountDataObject>;
    };
    tripleCountData(): Array<TripleCountDataObject> {
        return this.retrieveFileFromVault(tripleCountDataFilename, this.currentRunset) as Array<TripleCountDataObject>;
    };
    classPropertyData(): any {
        return this.retrieveFileFromVault(classPropertyDataFilename, this.currentRunset);
    };
    datasetDescriptionData(): Array<DatasetDescriptionDataObject> {
        return this.retrieveFileFromVault(datasetDescriptionDataFilename, this.currentRunset) as Array<DatasetDescriptionDataObject>;
    };
    shortUriData(): Array<ShortUriDataObject> {
        return this.retrieveFileFromVault(shortUriDataFilename, this.currentRunset) as Array<ShortUriDataObject>;
    };
    rdfDataStructureData(): Array<QualityMeasureDataObject> {
        return this.retrieveFileFromVault(rdfDataStructureDataFilename, this.currentRunset) as Array<QualityMeasureDataObject>;
    };
    readableLabelData(): Array<QualityMeasureDataObject> {
        return this.retrieveFileFromVault(readableLabelDataFilename, this.currentRunset) as Array<QualityMeasureDataObject>;
    };
    blankNodesData(): Array<QualityMeasureDataObject> {
        return this.retrieveFileFromVault(blankNodesDataFilename, this.currentRunset) as Array<QualityMeasureDataObject>;
    };
    textElements: Array<TextElement>;
    runsets: Array<RunsetObject>;
    sparqlFeatureDesc: Array<SPARQLFeatureDescriptionDataObject>;

    graphList: string[] = [];
    currentRunsetId = "all";
    runsetIndexParameter = "graphSetIndex";
    endpointList: string[] = [];

    tabContentMap = new Map();


    geolocContent = [
        geolocChart
    ];
    sparqlCoverContent: KartoChart[] = [sparqlCoverCharts, sparql10Chart, sparql11Chart, sparqlFeaturesContent]
    vocabRelatedContent: KartoChart[] = [vocabKeywordChart, /*filteredVocabChart,*/ endpointVocabsChart, standardVocabCharts];
    datasetDescriptionContent: KartoChart[] = [descriptionElementChart];
    dataQualityContent: KartoChart[] = [blankNodesChart, readableLabelsChart, rdfDataStructureChart, shortUriChart];
    datasetPopulationsContent: KartoChart[] = [tripleChart, classNumberChart, propertyNumberChart, classAndPropertiesContent];
    allContent: KartoChart[] = this.geolocContent.concat(this.sparqlCoverContent)
        .concat(this.datasetDescriptionContent)
        .concat(this.dataQualityContent)
        .concat(this.datasetPopulationsContent);

    // Contains the files for each runset (key: runset id, value: Map<filename, fileContent>)
    fileBank: Map<string, Map<string, JSONValue>> = new Map();

    currentRunset: RunsetObject;



    // Setup tab menu
    vocabRelatedContentTabButton: JQuery<HTMLElement>;
    sparqlTabButton: JQuery<HTMLElement>;
    populationTabButton: JQuery<HTMLElement>;
    descriptionTabButton: JQuery<HTMLElement>;
    runtimeTabButton: JQuery<HTMLElement>;
    qualityTabButton: JQuery<HTMLElement>;
    tabButtonArray: JQuery<HTMLElement>[];

    constructor() {
        if (Control.ControlInstance !== undefined) {
            throw new Error("Control already instantiated");
        }
        console.log("Control constructor");

        // Setup tab menu
        this.vocabRelatedContentTabButton = $('#vocabRelatedContent-tab')
        this.sparqlTabButton = $('#sparql-tab')
        this.populationTabButton = $('#population-tab')
        this.descriptionTabButton = $('#description-tab')
        this.runtimeTabButton = $('#runtime-tab')
        this.qualityTabButton = $('#quality-tab')
        this.tabButtonArray = [this.vocabRelatedContentTabButton, this.sparqlTabButton, this.populationTabButton, this.descriptionTabButton, this.runtimeTabButton, this.qualityTabButton];

        setButtonAsToggleCollapse('endpointGeolocDetails', 'endpointGeolocDatatable');
        setButtonAsToggleCollapse('tableSPARQLFeaturesDetails', 'SPARQLFeaturesDatatable');
        setButtonAsToggleCollapse('tableSPARQLFeaturesStatsDetails', 'SPARQLFeaturesCountDatatable');
        setButtonAsToggleCollapse('KnownVocabulariesDetails', 'knowVocabEndpointDatatable');
        setButtonAsToggleCollapse('endpointKeywordsDetails', 'endpointKeywordsDatatable');
        setButtonAsToggleCollapse('tableRuleDetails', 'rulesDatatable');
        setButtonAsToggleCollapse('classDescriptionDetails', 'classDescriptionDatatable');
        setButtonAsToggleCollapse('classPropertiesDescriptionDetails', 'classPropertiesDescriptionDatatable');
        setButtonAsToggleCollapse('datasetDescriptionStatDetails', 'datasetDescriptionDatatable');
        setButtonAsToggleCollapse('shortUrisDetails', 'shortUrisDatatable');
        setButtonAsToggleCollapse('rdfDataStructuresDetails', 'rdfDataStructuresDatatable');
        setButtonAsToggleCollapse('readableLabelsDetails', 'readableLabelsDatatable');
        setButtonAsToggleCollapse('blankNodesDetails', 'blankNodesDatatable');

        this.tabContentMap.set('vocabRelatedContent', this.vocabRelatedContent);
        this.tabContentMap.set('sparql', this.sparqlCoverContent);
        this.tabContentMap.set('population', this.datasetPopulationsContent);
        this.tabContentMap.set('description', this.datasetDescriptionContent);
        this.tabContentMap.set('quality', this.dataQualityContent);

        this.vocabRelatedContentTabButton.on('click', function (event) {
            Control.getInstance().changeActiveTab("vocabRelatedContent");
        })
        this.sparqlTabButton.on('click', function (event) {
            Control.getInstance().changeActiveTab("sparql");
        })
        this.populationTabButton.on('click', function (event) {
            Control.getInstance().changeActiveTab("population");
        })
        this.descriptionTabButton.on('click', function (event) {
            Control.getInstance().changeActiveTab("description");
        })
        this.qualityTabButton.on('click', function (event) {
            Control.getInstance().changeActiveTab("quality");
        })

        $(window).on('resize', () => {
            this.redrawCharts();
        })

        Control.ControlInstance = this;
    }

    init() {
        console.log("Initialization START");
        console.log("File loading started");
        return this.loadDataFiles().then(() => {
            console.log("File loading finished");

            console.log("setting up the runset ID in the URL")
            let urlParams = new URLSearchParams(url.search);
            // Set up graphs sets
            if (urlParams.has(this.runsetIndexParameter)) {
                const currentRunsetIndex = urlParams.get(this.runsetIndexParameter);
                if (currentRunsetIndex !== null) {
                    const givenRunsetIndex = currentRunsetIndex;
                    if (this.runsets.some((item, i) => { return item.id === givenRunsetIndex })) {   // Check if the given index is valid
                        this.currentRunsetId = givenRunsetIndex;
                    }
                }
            }

            console.log("Changing the current runsetId to the one found in the URL or default")
            this.changeGraphSetIndex(this.currentRunsetId)

            console.log("Setting up the runset list selection")
            let select = $('#endpoint-list-select');
            this.runsets.forEach((item) => {
                let option = document.createElement('option');
                $(option).text(item.name);
                $(option).val(item.id);
                if (item.id === this.currentRunsetId) {
                    $(option).attr("selected", "true")
                    this.graphList = item.graphs;
                }
                select.append(option);
            });
            select.on('change', function () {
                $("#endpoint-list-select > option:selected").each(function () {
                    console.log("runset selection changed for " + $(this).val())
                    let selectionIndex = $(this).val();
                    Control.getInstance().changeGraphSetIndex(selectionIndex);
                })
            });

            console.log("Initialization END");
            return Promise.resolve();

        })
    }

    static getInstance() {
        if (Control.ControlInstance == null) {
            Control.ControlInstance = new Control();
        }
        return Control.ControlInstance;
    }

    static getCacheFileForRunset(filename, runsetObject: RunsetObject) {
        return cachePromise(filename + "." + runsetObject.id + '.json');
    }

    retrieveFileFromVault(filename: string, runset: RunsetObject = this.currentRunset) {
        console.log("Retrieving file " + filename + " from the vault for runset " + runset.id + "")
        const runsetBank = this.fileBank.get(runset.id);
        if (runsetBank !== undefined) {
            const fileFromVault = runsetBank.get(filename);
            if (fileFromVault !== undefined) {
                return fileFromVault;
            } else {
                throw new Error("File " + filename + " not found in the bank for runset " + runset.id);
            }
        } else {
            throw new Error("Runset " + runset.id + " not found in the bank");
        }
    }

    insertTextElements() {
        // adding the HTML text where it belong
        this.textElements.forEach(item => {
            $('#' + item.key).html(item.value.replace('\"', '"'));
        });
    }

    loadDataFiles() {
        this.showLoadingSpinner()

        let filenameList = [
            geolocDataFilename,
            sparqlCoverCountFilename,
            sparqlFeaturesDataFilename,
            // knownVocabDataFilename,
            vocabEndpointDataFilename,
            endpointKeywordDataFilename,
            classCountDataFilename,
            propertyCountDataFilename,
            tripleCountDataFilename,
            // categoryTestCountDataFilename,
            // totalCategoryTestCountFilename,
            // endpointTestsDataFilename,
            // totalRuntimeDataFilename,
            // averageRuntimeDataFilename,
            classPropertyDataFilename,
            datasetDescriptionDataFilename,
            shortUriDataFilename,
            rdfDataStructureDataFilename,
            readableLabelDataFilename,
            blankNodesDataFilename,

            // Echarts options
            sparqlCoverageEchartsOptionFilename,
            sparql10CoverageEchartsOptionFilename,
            sparql11CoverageEchartsOptionFilename,
            vocabEndpointEchartsOptionFilename,
            triplesEchartsOptionFilename,
            classesEchartsOptionFilename,
            propertiesEchartsOptionFilename,
            shortUrisEchartsOptionFilename,
            rdfDataStructuresEchartsOptionFilename,
            readableLabelsEchartsOptionFilename,
            blankNodesEchartsOptionFilename,
            datasetDescriptionEchartsOptionFilename,
            keywordEndpointEchartsOptionFilename,
            standardVocabulariesEndpointGraphEchartsOptionFilename
        ];

        // Loading all the data files into the bank
        return textElementsFile.then((data) => {
            this.textElements = (data as Array<TextElement>);
            this.insertTextElements();
            return Promise.resolve();
        }).then(() => {
            return sparqlFeatureDescFile.then((data) => {
                this.sparqlFeatureDesc = (data as Array<SPARQLFeatureDescriptionDataObject>);
                return Promise.resolve();
            })
        })
        .then(() => {
            return runsetsFile.then((data) => {
                this.runsets = data;

                let allRunsetObject = this.runsets.find((runset) => {
                    return runset.id === "all";
                });
                if (allRunsetObject !== undefined) {
                    this.currentRunset = allRunsetObject;
                } else {
                    throw new Error("Runset with id 'all' not found");
                }

                this.runsets.forEach((runset) => {
                    this.fileBank.set(runset.id, new Map());
                })
                return Promise.allSettled(this.runsets.map((runsetItem) => {
                    return Promise.allSettled(filenameList.map((filename) => {
                        return Control.getCacheFileForRunset(filename, runsetItem).then((data) => {
                            this.fileBank.get(runsetItem.id)?.set(filename, data);
                        })
                    })
                    )
                }))
            }).then(() => {
                this.hideLoadingSpinner();
                return;
            })
        })
    }

    changeActiveTab(tabName) {
        $("div .tab-pane").each((i, element) => {
            $(element).addClass('collapse')
            $(element).removeClass('show')
            $(element).removeClass('active')
        });
        $('.nav-link').each((i, element) => {
            $(element).removeClass('active')
        });
        this.showLoadingSpinner();
        let content = this.tabContentMap.get(tabName);
        return Promise.all(content.map(item => item.fill()))
            .then(() => {
                content.forEach(contentChart => contentChart.redraw());
                content.forEach(contentChart => contentChart.show());
            })
            .then(() => {
                this.hideLoadingSpinner()
            }).then(() => {
                $('#' + tabName).addClass("active");
                $('#' + tabName).addClass("show");
                $('#' + tabName).removeClass("collapse");
                $('#' + tabName + "-tab").addClass("active");
            })
    }

    refresh() {
        this.showLoadingSpinner();
        this.clear();
        this.allContent.forEach(contentChart => { contentChart.filled = false; })
        return Promise.allSettled(this.allContent.map(content => content.fill())).then(() => { this.hideLoadingSpinner() });
    }

    clear() {
        this.allContent.forEach((content, i) => { if (content.clear !== undefined) { content.clear() } });
    }

    redrawGeolocContent() {
        this.geolocContent.forEach(content => content.redraw());
    }

    redrawSparqlCoverContent() {
        this.sparqlCoverContent.forEach(content => content.redraw());
    }

    redrawVocabRelatedContent() {
        this.vocabRelatedContent.forEach(content => content.redraw());
    }

    redrawDatasetDescriptionContent() {
        this.datasetDescriptionContent.forEach(content => content.redraw());
    }

    redrawDataQualityContent() {
        this.dataQualityContent.forEach(content => content.redraw());
    }

    redrawDatasetPopulationsContent() {
        this.datasetPopulationsContent.forEach(content => content.redraw());
    }

    // redrawFrameworkInformationContent() {
    //     this.frameworkInformationContent.forEach(content => content.redraw());
    // }

    redrawCharts() {
        return Promise.all(this.allContent.map(content => { content.redraw() }));
    }

    generateGraphValueFilterClause(runset: RunsetObject) {
        let result = "FILTER( ";
        runset.graphs.forEach((item, i) => {
            if (i > 0) {
                result += " || REGEX( str(?g) , '" + item + "' )";
            } else {
                result += "REGEX( str(?g) , '" + item + "' )";
            }
        });
        result += " )";
        return result;
    }

    changeGraphSetIndex(index) {
        console.log("changeGraphSetIndex", index)
        this.showLoadingSpinner();
        this.allContent.forEach(contentChart => {
            if (contentChart != undefined && contentChart.clear !== undefined) {
                contentChart.clear()
                contentChart.filled = false;
            }
        });

        let urlParams = new URLSearchParams(window.location.search);
        urlParams.delete(this.runsetIndexParameter);
        urlParams.append(this.runsetIndexParameter, index);
        history.pushState(null, "", '?' + urlParams.toString());
        let indexRunset = this.runsets.find(runsetObject => runsetObject.id === index);
        if (indexRunset !== undefined) {
            let historyGraphList = indexRunset?.graphs;
            this.graphList = historyGraphList;
            this.currentRunsetId = index;
            this.currentRunset = indexRunset;
        } else {
            throw new Error("Graph set with id '" + index + "' not found");
        }
        return this.refresh()
            .then(() => {
                this.hideLoadingSpinner();
            });
    }



    hideLoadingSpinner() {
        this.tabButtonArray.forEach(item => {
            item.prop('disabled', false);
        })

        $('#loadingSpinner').addClass('collapse');
        $('#loadingSpinner').removeClass('show');
        $('#tabContent').addClass('visible');
        $('#tabContent').removeClass('invisible');
    }

    showLoadingSpinner() {
        this.tabButtonArray.forEach(item => {
            item.prop('disabled', true);
        })
        $('#loadingSpinner').addClass('show');
        $('#loadingSpinner').removeClass('collapse');
        $('#tabContent').addClass('invisible');
        $('#tabContent').removeClass('visible');
    }
}