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

var inputMetadata = [
    {
        recommended: true,
        categoryTitle: "Creator",
        legend: "Represents the different actors involved in the creation of the dataset.",
        idPrefix: "creator",
        minArity: 1,
        maxArity: Infinity,
        // store: $rdf.graph(),
        fields: [
            {
                placeHolder: "Creator's name or URI",
                dataValidationFunction: (inputVal, inputId) => {
                    var result = $rdf.isLiteral($rdf.lit(inputVal));
                    if(result) {
                        $(inputId).removeClass("btn-light")
                        $(inputId).removeClass("btn-warning")
                        $(inputId).removeClass("btn-danger")
                        $(inputId).addClass("btn-success")
                    }
                    else {
                        $(inputId).removeClass("btn-light")
                        $(inputId).removeClass("btn-warning")
                        $(inputId).addClass("btn-danger")
                        $(inputId).removeClass("btn-success")
                    }
                    return result;
                },
                dataCreationFunction: (inputVal, inputId) => {
                    if(dataValidationFunction(inputVal, inputId)) {
                        var store = $rdf.graph();
                        store.add($rdf.sym('https://e.g/dataset'), DCT('title'), inputVal);
                        return store.toNT();
                    }
                }
            }
        ],
    },
    {
        recommended: true,
        categoryTitle: "Endpoint URL",
        legend: "URL of the SPARQL endpoint.",
        idPrefix: "endpoint",
        minArity: 1,
        maxArity: Infinity,
        fields: [
            {
                placeHolder: "Endpoint's URL",
                dataCreationFunction: (inputVal, inputId) => {
                    if(this.dataValidationFunction(inputVal, inputId)) {
                        var store = $rdf.graph();
                        store.add($rdf.sym('https://e.g/dataset'), VOID('sparqlEndpoint'), $rdf.sym(inputVal));
                        return store.toNT();
                    }
                    return "";
                },
                dataValidationFunction: (inputVal, inputId) => {
                    var result = false;
                    try {
                        result = $rdf.isNamedNode($rdf.sym(inputVal));
                    } catch(e) {
                        var popover = new bootstrap.Popover($(inputId), { content: e.message, animation:false })
                    }
                    
                    if(result) {
                        $(inputId).removeClass("btn-light")
                        $(inputId).removeClass("btn-warning")
                        $(inputId).removeClass("btn-danger")
                        $(inputId).addClass("btn-success")
                    }
                    else {
                        $(inputId).removeClass("btn-light")
                        $(inputId).removeClass("btn-warning")
                        $(inputId).addClass("btn-danger")
                        $(inputId).removeClass("btn-success")
                    }
                    return result;
                }
            }
        ]
    },
    {
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
    
                },
                dataValidationFunction: (inputVal, inputId) => {

                }
            }
        ]
    },
    {
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

                },
                dataValidationFunction: (inputVal, inputId) => {

                }
            }
        ]
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    }
];

$(() => {
    var dataCol = $('#dataCol');

    function generateFields() {
        inputMetadata.forEach(catMetadata => {

            var metadataInputId = '#' + catMetadata.idPrefix + "Input";
            var metadataContentId = '#' + catMetadata.idPrefix + "Content";
            var metadataContentDisplayId = '#' + catMetadata.idPrefix + "Display";
            var addButtonId = '#' + "add"+ catMetadata.idPrefix + "Button";
            var removeButtonId = '#' + "remove"+ catMetadata.idPrefix + "Button";
            var metadataFieldIdPrefix = '#' + catMetadata.idPrefix + "Field";

            var dataDiv = $(document.createElement('div'));
            dataDiv.addClass("row");
            dataDiv.attr("id", metadataInputId);
            var contentDiv = $(document.createElement('div'));
            contentDiv.addClass("row");
            contentDiv.attr("id", metadataContentId);
            
            var catTitle = $(document.createElement('h3'));
            catTitle.addClass("text-center");
            catTitle.text(catMetadata.categoryTitle);

            var catControlRow = $(document.createElement('div'));
            catControlRow.addClass("row")
            var catLegendCol = $(document.createElement('div'));
            catLegendCol.addClass("col-10")
            var catLegend = $(document.createElement('p'));
            catLegend.text(catMetadata.legend);
            catLegendCol.append(catLegend);
            catControlRow.append(catLegendCol);
            catAddLineCol = $(document.createElement('div'));
            catAddLineCol.addClass("col-1");
            catAddLineButton = $(document.createElement('button'));
            catAddLineButton.addClass("btn");
            catAddLineButton.attr('type', "button");
            catAddLineButton.attr("id", addButtonId);
            catAddLineCol.append(catAddLineButton);
            catAddLineButtonImage = $(document.createElement('i'));
            catAddLineButtonImage.addClass("bi")
            catAddLineButtonImage.addClass("bi-file-plus")
            catAddLineButton.append(catAddLineButtonImage);
            catRemoveLineCol = $(document.createElement('div'));
            catRemoveLineCol.addClass("col-1");
            catRemoveLineButton = $(document.createElement('button'));
            catRemoveLineButton.addClass("btn");
            catRemoveLineButton.attr('type', "button");
            catRemoveLineButton.attr("id", removeButtonId);
            catRemoveLineCol.append(catRemoveLineButton);
            catRemoveLineButtonImage = $(document.createElement('i'));
            catRemoveLineButtonImage.addClass("bi")
            catRemoveLineButtonImage.addClass("bi-file-minus")
            catRemoveLineButton.append(catRemoveLineButtonImage);
            catControlRow.append(catAddLineCol);
            catControlRow.append(catRemoveLineCol);

            var catFieldRow = $(document.createElement('div'));
            catFieldRow.addClass("row")
            var catFieldCol = $(document.createElement('div'));
            catFieldCol.addClass("col")

            var catContentDisplay = $(document.createElement('textarea'));
            catContentDisplay.addClass('form-control');
            catContentDisplay.attr("id", metadataContentDisplayId);
            catContentDisplay.prop("readonly", true);
            contentDiv.append(catContentDisplay);

            dataCol.append(dataDiv);
            dataCol.append(contentDiv);
            dataDiv.append(catTitle);
            dataDiv.append(catControlRow);
            dataDiv.append(catFieldRow);
            catFieldRow.append(catFieldCol);

            function createFieldLine(index, field) {
                var lineDiv = $(document.createElement('div'));
                var textInput = $(document.createElement('input'))
                var lineLabel = $(document.createElement('label'));
                var inputId = metadataFieldIdPrefix + index;
                textInput.attr('type', 'text');
                textInput.addClass('form-control');
                textInput.attr('id', inputId);
                textInput.val('');
                lineLabel.attr('for', inputId)
                lineLabel.text(field.placeHolder);

                var lineFieldCol = $(document.createElement('div'));
                lineFieldCol.addClass('col-11');
                var lineValidButtonCol = $(document.createElement('div'));
                lineValidButtonCol.addClass('col-1');
                var lineValidButton = $(document.createElement('button'));
                lineValidButton.attr("type", "button");
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
                    catContentDisplay.val(field.dataCreationFunction(textInput.val(), inputId ));
                })
                lineValidButton.on("click", () => {
                    field.dataValidationFunction(textInput.val(), lineValidButton);
                });
                return lineDiv;
            }

            var fieldsLines = [];
            catMetadata.fields.forEach(field => {
                if(catMetadata.minArity > 0) {
                    for( var index = 0; index < catMetadata.minArity; index++ ) {
                        var fieldLine = createFieldLine(index, field);
                        fieldsLines.push(fieldLine);
                        catFieldCol.append(fieldLine);
                    }
                }
            
                $(addButtonId).on("click", () => {
                    console.log("add")
                    fieldsLines.push(createFieldLine(fieldsLines.length, field));
                    fillFieldsLines();
                });
                $(removeButtonId).on("click", () => {
                    console.log("remove")
                    fieldsLines.pop();
                    fillFieldsLines();
                });
            });

            function fillFieldsLines() {
                catFieldCol.empty();
                fieldsLines.forEach(fieldLine => {
                    catFieldCol.append(fieldLine);
                });
            }
        })
    }

    generateFields()

});
