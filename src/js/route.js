let $body = $('body');
let pages = ['index', 'work', 'game'];

function init() {
    bindEvents();
    initPage();
}

function initPage() {
    let hash = location.hash;
    let isFound = false;
    for (let i in pages) {
        let page = pages[i];
        if (!hash.indexOf(page)) {
            update(page);
            isFound = true;
        }
    }
    if (!isFound) {
        update('404');
    }
}

function bindEvents() {

    $('.js-route-a').on('click', function (ev) {
        ev.preventDefault();
        window.history.pushState('', '', $(this).attr('href'));
    });

    window.onpopstate = function () {
        initPage();
    }
}

function update(page) {
    // console.log(page);
    $body.trigger('updatePage.' + page, page);
}

export let route = {
    init: init
};