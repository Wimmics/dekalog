import $ from 'jquery';
const $rdf = require('rdflib');

var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
var XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
var DCAT = $rdf.Namespace("http://www.w3.org/ns/dcat#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var PROV = $rdf.Namespace("http://www.w3.org/ns/prov#");
var SCHEMA = $rdf.Namespace("http://schema.org/");
var VOID = $rdf.Namespace("http://rdfs.org/ns/void#");
var SD = $rdf.Namespace("http://www.w3.org/ns/sparql-service-description#");
var DCE = $rdf.Namespace("http://purl.org/dc/elements/1.1/");
var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
var SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
var PAV = $rdf.Namespace("http://purl.org/pav/");
var MOD = $rdf.Namespace("https://w3id.org/mod#");

const exampleDataset = $rdf.sym('https://e.g/dataset');

class CategoryCore {
    constructor(config = { recommended: false, categoryTitle:"", legend:"", idPrefix:"id", minArity:0, maxArity:Infinity, store: $rdf.graph(), fields:[] }) {
        this.recommended = config.recommended;
        this.categoryTitle = config.categoryTitle;
        this.legend = config.legend;
        this.idPrefix = config.idPrefix;
        this.minArity = config.minArity;
        this.maxArity = config.maxArity;
        this.store = config.store;
        this.fields = [];
        config.fields.forEach(fieldConfig => {
            this.addNewField(fieldConfig);
        })
    }

    addNewField(fieldConfig) {
        fieldConfig.parentCategory = this;
        this.fields.push(new FieldCore(fieldConfig));
    }
}

class CategoryView {

    constructor(config = { category: null }) {
        this.core = config.category;
        this.fields = [];
        
        this.core.fields.forEach(field => {
            if(this.core.minArity > 0) {
                for( var index = 0; index < this.core.minArity; index++ ) {
                    var fieldLine = new FieldInput({ core: field, index:index });
                    this.fields.push(fieldLine);
                }
            }
        });

        this.jQueryContent = this.generateCategoryFields();
    }

    refresh() {
        jQueryContent.empty();
        generateCategoryFields();

    }

    generateCategoryFields() {
        var metadataInputId = this.core.idPrefix + "Input";
        var addButtonId = "add"+ this.core.idPrefix + "Button";
        var removeButtonId = "remove"+ this.core.idPrefix + "Button";

        var dataDiv = $(document.createElement('div'));
        dataDiv.addClass("row");
        dataDiv.attr("id", metadataInputId);
        
        var catTitle = $(document.createElement('h3'));
        catTitle.addClass("text-center");
        catTitle.text(this.core.categoryTitle);

        var catControlRow = $(document.createElement('div'));
        catControlRow.addClass("row")
        var catLegendCol = $(document.createElement('div'));
        catLegendCol.addClass("col-10")
        var catLegend = $(document.createElement('p'));
        catLegend.text(this.core.legend);
        catLegendCol.append(catLegend);
        catControlRow.append(catLegendCol);
        var catAddLineCol = $(document.createElement('div'));
        catAddLineCol.addClass("col-1");
        var catAddLineButton = $(document.createElement('button'));
        catAddLineButton.addClass("btn");
        catAddLineButton.attr('type', "button");
        catAddLineButton.attr("id", addButtonId);
        catAddLineCol.append(catAddLineButton);
        var catAddLineButtonImage = $(document.createElement('i'));
        catAddLineButtonImage.addClass("bi")
        catAddLineButtonImage.addClass("bi-file-plus")
        catAddLineButton.append(catAddLineButtonImage);
        var catRemoveLineCol = $(document.createElement('div'));
        catRemoveLineCol.addClass("col-1");
        var catRemoveLineButton = $(document.createElement('button'));
        catRemoveLineButton.addClass("btn");
        catRemoveLineButton.attr('type', "button");
        catRemoveLineButton.attr("id", removeButtonId);
        catRemoveLineCol.append(catRemoveLineButton);
        var catRemoveLineButtonImage = $(document.createElement('i'));
        catRemoveLineButtonImage.addClass("bi")
        catRemoveLineButtonImage.addClass("bi-file-minus")
        catRemoveLineButton.append(catRemoveLineButtonImage);
        catControlRow.append(catAddLineCol);
        catControlRow.append(catRemoveLineCol);

        var catFieldRow = $(document.createElement('div'));
        catFieldRow.addClass("row")
        var catFieldCol = $(document.createElement('div'));
        catFieldCol.addClass("col")

        dataDiv.append(catTitle);
        dataDiv.append(catControlRow);
        dataDiv.append(catFieldRow);
        catFieldRow.append(catFieldCol);

        this.fields.forEach(field => {
            catFieldCol.append(field.jQueryContent);
        });
        
        $('#' + addButtonId).on("click", () => {
            console.log("add")
            if(this.maxArity >= this.fields.length) {
                this.fields.push((new FieldInput({ core: field, index:fields.length })).jQueryContent);
                this.refresh();
            }
        });
        $('#' + removeButtonId).on("click", () => {
            console.log("remove")
            if(this.minArity < this.fields.length) {
                this.fields.pop();
                this.refresh();
            }
        });

        return dataDiv;
    }
}

class FieldCore {
    constructor(config = { placeholder: "", dataValidationFunction: (inputVal, buttonId) => {}, dataCreationFunction: (inputVal, buttonId) => {}, parentCategory: null }) {
        this.placeHolder = config.placeholder;
        this.dataValidationFunction = (inputVal, inputId) => { 
            var result = config.dataValidationFunction(inputVal, inputId);
            setButtonValidatedState(inputId, result);
            return result;
        }
        this.dataCreationFunction = (inputVal, inputId) => { 
            if(this.dataValidationFunction(inputVal, inputId)) {
                config.dataCreationFunction(inputVal, inputId);
            } 
            return "";
        };
        this.parentCategory = config.parentCategory;
        this.value = config.value;
    }
}

class FieldInput {
    constructor(config = { core:null, index:0 }) {
        this.core = config.core;
        this.index = config.index;
        this.metadataFieldIdPrefix = config.core.parentCategory.idPrefix + "Field";
        this.jQueryContent = null;
        this.generateJQueryContent();
    }

    generateJQueryContent() {
        var lineDiv = $(document.createElement('div'));
        var textInput = $(document.createElement('input'))
        var lineLabel = $(document.createElement('label'));
        var inputId = this.metadataFieldIdPrefix + this.index;
        var inputIdField = inputId + "Textfield";
        var inputIdButton = inputId + "Button";
        textInput.attr('type', 'text');
        textInput.addClass('form-control');
        textInput.attr('id', inputIdField);
        lineLabel.attr('for', inputIdField)
        lineLabel.text(this.core.placeHolder);

        var lineFieldCol = $(document.createElement('div'));
        lineFieldCol.addClass('col-11');
        var lineValidButtonCol = $(document.createElement('div'));
        lineValidButtonCol.addClass('col-1');
        var lineValidButton = $(document.createElement('button'));
        lineValidButton.attr("type", "button");
        lineValidButton.attr("id", inputIdButton)
        lineValidButton.addClass("btn");
        lineValidButton.addClass("btn-light");
        lineValidButton.text("Validate");
        lineValidButtonCol.append(lineValidButton);

        lineDiv.addClass('row');
        lineDiv.append(lineFieldCol);
        lineDiv.append(lineValidButtonCol);
        lineFieldCol.addClass('form-floating');
        lineFieldCol.append(textInput);
        lineFieldCol.append(lineLabel);
        textInput.on("change", () => {
            this.core.dataCreationFunction(textInput.val(), inputIdButton);
        })
        lineValidButton.on("click", () => {
            catContentDisplay.val(this.core.dataCreationFunction(textInput.val(), inputIdButton ));
        });
        this.jQueryContent = lineDiv;
    }
}

function setButtonValidatedState(inputId, validated, message) {
    if(validated) {
        $('#' + inputId).removeClass("btn-light")
        $('#' + inputId).removeClass("btn-warning")
        $('#' + inputId).removeClass("btn-danger")
        $('#' + inputId).addClass("btn-success")
    }
    else {
        $('#' + inputId).removeClass("btn-light")
        $('#' + inputId).removeClass("btn-warning")
        $('#' + inputId).addClass("btn-danger")
        $('#' + inputId).removeClass("btn-success")
    }
    if(message != undefined) {
        console.log("Popover " + inputId)
        console.log(inputId)
        var popover = new bootstrap.Popover($('#' + inputId), { content: message, trigger:"click" })
        
    }
}

var inputMetadata = [
    new CategoryCore({
        recommended: true,
        categoryTitle: "Creator",
        legend: "Represents the different actors involved in the creation of the dataset.",
        idPrefix: "creator",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            new FieldCore({
                placeHolder: "Creator's name or URI",
                dataValidationFunction: (inputVal, inputId) => {
                    console.log('Validation ' + inputVal + " " + inputId)
                    var result = inputVal != undefined && inputVal.length > 0 && $rdf.isLiteral($rdf.lit(inputVal));
                    return result;
                },
                dataCreationFunction: (inputVal, inputId) => {
                    var store = $rdf.graph();
                    store.add(exampleDataset, DCT('title'), inputVal);
                    return store.toNT();
                }
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Endpoint URL",
        legend: "URL of the SPARQL endpoint.",
        idPrefix: "endpoint",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            new FieldCore({
                placeHolder: "Endpoint's URL",
                dataValidationFunction: (inputVal, inputId) => {
                    var result = false;
                    try {
                        result = inputVal != undefined && inputVal.length > 0 && $rdf.isNamedNode($rdf.sym(inputVal));
                    } catch(e) {
                        return result;
                    }
                    return result;
                },
                dataCreationFunction: (inputVal, inputId) => {
                    var store = $rdf.graph();
                    store.add(exampleDataset, VOID('sparqlEndpoint'), $rdf.sym(inputVal));
                    return store.toNT();
                }
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Title",
        legend: "Short title for the knowledge base and its content.",
        idPrefix: "title",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            {
                placeHolder: "Short title for the knowledge base",
                dataCreationFunction: (inputVal, inputId) => {
                    var store = $rdf.graph();
                    store.add(exampleDataset, DCT('title'), $rdf.sym(inputVal));
                    return store.toNT();
                },
                dataValidationFunction: (inputVal, inputId) => {
                    var result = false;
                    try {
                        result = inputVal != undefined && inputVal.length > 0 && $rdf.isLiteral($rdf.lit(inputVal));
                    } catch(e) {
                        return result;
                    }
                    return result;
                }
            }
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Description",
        legend: "Long description of the knowledge base and its content.",
        idPrefix: "description",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            {
                placeHolder: "Long description of the knowledge base",
                dataCreationFunction: (inputVal, inputId) => {
                    var store = $rdf.graph();
                    store.add(exampleDataset, DCT('description'), $rdf.sym(inputVal));
                    return store.toNT();
                },
                dataValidationFunction: (inputVal, inputId) => {
                    var result = false;
                    try {
                        result = inputVal != undefined && inputVal.length > 0 && $rdf.isLiteral($rdf.lit(inputVal));
                    } catch(e) {
                        return result;
                    }
                    return result;
                }
            }
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Publication date",
        legend: "Publication date of the knowledge base.",
        idPrefix: "publication",
        minArity: 1,
        maxArity: 1,
        fields: [
            {
                placeHolder: "Publication date of the knowledge base",
                dataCreationFunction: (inputVal, inputId) => {

                },
                dataValidationFunction: (inputVal, inputId) => {

                }
            }
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Vocabularies",
        legend: "URIs of the vocabularies used in the knowledge base.",
        idPrefix: "vocabulary",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            {
                placeHolder: "Vocabularies used in the knowledge base",
                dataCreationFunction: (inputVal, inputId) => {
    
                },
                dataValidationFunction: (inputVal, inputId) => {

                }
            }
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Languages",
        legend: "Language tags used in the literals of the knowledge base.",
        idPrefix: "language",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            {
                placeHolder: "Language tags used in the literals of the knowledge base",
                dataCreationFunction: (inputVal, inputId) => {
    
                },
                dataValidationFunction: (inputVal, inputId) => {

                }
            }
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Keywords",
        legend: "Keywords describing the content of the knowledge base.",
        idPrefix: "keyword",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            {
                placeHolder: "Keyworks used to describe the knowledge base",
                dataCreationFunction: (inputVal, inputId) => {
    
                },
                dataValidationFunction: (inputVal, inputId) => {

                }
            }
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Version",
        legend: "Current version number of the knowledge base.",
        idPrefix: "version",
        minArity: 1,
        maxArity: 1,
        fields: [
            {
                placeHolder: "Current version of the knowledge base",
                dataCreationFunction: (inputVal, inputId) => {
    
                },
                dataValidationFunction: (inputVal, inputId) => {

                }
            }
        ]
    })
];

$(() => {
    var dataCol = $('#dataCol');

    function generateFields() {
        inputMetadata.forEach(catMetadata => {
            var catMetadataView = new CategoryView({category:catMetadata})
            dataCol.append(catMetadataView.jQueryContent)
        })
    }

    generateFields()

});
