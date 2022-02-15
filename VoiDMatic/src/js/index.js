import $ from 'jquery';
const N3 = require('n3');

$(document).ready(() => {
    // Who
    var creatorFields = [];
    function createCreatorFieldLine(index) {
        var lineDiv = $(document.createElement('div'));
        var textInput = $(document.createElement('input'))
        var lineLabel = $(document.createElement('label'));
        var inputId = 'creatorField' + index;
        textInput.attr('type', 'text');
        textInput.addClass('form-control');
        textInput.attr('id', inputId);
        textInput.val('');
        textInput.attr('placeholder', "Creator's name or URI");
        lineLabel.attr('for', inputId)
        lineLabel.text('Creator');
        lineDiv.addClass('col');
        lineDiv.addClass('form-floating');
        lineDiv.append(textInput);
        lineDiv.append(lineLabel);
        textInput.change(() => {
            console.log($(inputId).val())
            $('#whoDataDisplay').val($(inputId).val())
        })
        return lineDiv;
    }

    var creatorFieldsDiv = $('#creatorFieldsCol');
    creatorFields.push(createCreatorFieldLine(0));
    creatorFieldsFill();
    $('#addCreatorButtton').click(() => {
        console.log(creatorFields)
        creatorFields.push(createCreatorFieldLine(creatorFields.length));
        creatorFieldsFill();
    });
    $('#removeCreatorButtton').click(() => {
        creatorFields.pop();
        creatorFieldsFill();
    });
    function creatorFieldsFill() {
        creatorFieldsDiv.empty();
        creatorFields.forEach((item, i) => {
            creatorFieldsDiv.append(item);

        });
    }



});
