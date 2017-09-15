import {hp, vent, params} from '../helper';

export var BackPageV = Backbone.View.extend({
    tagName: 'a',
    className: 'back-to-work',
    events: {
        'click': 'comeBack'
    },
    //template: hp.tmpl('tmplBackPage'),
    initialize: function (options) {
        this.pageV = options.pageV;
        //this.$el.attr('href',options.pageName);
        this.render();
        this.listenTo(vent, 'removePage', this.remove);
    },
    render: function () {
        var arr = new Array(9);
        $.each(arr, (n) => {
            this.$el.append($('<i>'));
        });
        this.pageV.$el.append(this.$el);
    },
    comeBack: function () {
        history.back();
    }
});

