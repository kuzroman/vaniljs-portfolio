// import Twig from 'twig';

let $body = $('body');

function init() {
    // route.update();
    bindEvents();



}

function bindEvents() {
    $body.on('updatePage.index', function (ev, page) {
        console.log(page);
    });
}

init();