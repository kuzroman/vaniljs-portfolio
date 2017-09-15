export var vent = _.extend({
    page: _.extend({}, Backbone.Events),
    game: _.extend({}, Backbone.Events),
    audio: _.extend({}, Backbone.Events)
}, Backbone.Events);


export var hp = {};

hp.tmpl = function (id) {
    return _.template($('#' + id).html());
};

// 'page-one' => 'pageOne'
hp.styleHyphenFormat = function (propertyName) {
    function upperToHyphenLower(match) {
        var result = match.replace('-', '');
        return result.toUpperCase();
    }
    return propertyName.replace(/-[a-z]/g, upperToHyphenLower);
};

export var params = {};
params.body = $('body');
params.bodyW = params.body.width();
params.bodyH = params.body.height();

var resizeTimeoutId;
window.onresize = function () {
    clearTimeout(resizeTimeoutId);
    resizeTimeoutId = setTimeout(function () {
        params.bodyW = params.body.width();
        params.bodyH = params.body.height();
    }, 200);
};

params.speedChangePage = 600;

// extend View
Backbone.View.prototype.show = function () {
    setTimeout(()=> {
        this.$el.animate({left: 0}, params.speedChangePage)
            .queue(function (next) {
                vent.trigger('pageLoaded');
                next();
            });
    }, 10);
};
