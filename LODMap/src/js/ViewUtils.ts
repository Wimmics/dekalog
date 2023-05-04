import $ from 'jquery';

// Setup tab menu
export let vocabRelatedContentTabButton = $('#vocabRelatedContent-tab')
export let sparqlTabButton = $('#sparql-tab')
export let populationTabButton = $('#population-tab')
export let descriptionTabButton = $('#description-tab')
export let runtimeTabButton = $('#runtime-tab')
export let qualityTabButton = $('#quality-tab')
export let tabButtonArray = [vocabRelatedContentTabButton, sparqlTabButton, populationTabButton, descriptionTabButton, runtimeTabButton, qualityTabButton];

export function getMainContentColWidth(): number {
    let result = $('#mainContentCol').width();
    if(result == undefined) {
        return 0;
    } else {
        return result;
    }
}

export function hideLoadingSpinner() {
    tabButtonArray.forEach(item => {
        item.prop('disabled', false);
    })

    $('#loadingSpinner').addClass('collapse');
    $('#loadingSpinner').removeClass('show');
    $('#tabContent').addClass('visible');
    $('#tabContent').removeClass('invisible');
}

export function showLoadingSpinner() {
    tabButtonArray.forEach(item => {
        item.prop('disabled', true);
    })
    $('#loadingSpinner').addClass('show');
    $('#loadingSpinner').removeClass('collapse');
    $('#tabContent').addClass('invisible');
    $('#tabContent').removeClass('visible');
}

export function setButtonAsToggleCollapse(buttonId, tableId) {
    $('#' + buttonId).on('click', function () {
        if ($('#' + tableId).hasClass("show")) {
            collapseHtml(tableId);
        } else {
            unCollapseHtml(tableId);
        }
    });
}

export function collapseHtml(htmlId) {
    let jQuerySelect = $('#' + htmlId);
    jQuerySelect.removeClass('show');
    jQuerySelect.addClass('collapse');
}

export function unCollapseHtml(htmlId) {
    let jQuerySelect = $('#' + htmlId);
    jQuerySelect.removeClass('collapse');
    jQuerySelect.addClass('show');
}