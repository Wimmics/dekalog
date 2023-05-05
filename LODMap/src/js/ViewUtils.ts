import $ from 'jquery';

export function getMainContentColWidth(): number {
    let result = $('#mainContentCol').width();
    if(result == undefined) {
        return 0;
    } else {
        return result;
    }
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