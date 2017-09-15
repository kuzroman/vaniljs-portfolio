import {hp, vent, params} from '../helper';

export var ContactPageView = Backbone.View.extend({
    className: 'page contact',
    initialize: function () {
        this.render();
        new ContactDescView({pageV:this});
        this.listenTo(vent, 'removePage', this.remove);
    },
    render: function () {
        $('body').append(this.el);
        this.show();
    },
    remove: function () {
        vent.off('removePage');
        this.$el.addClass('rotate');
        setTimeout(()=> {
            Backbone.View.prototype.remove.call(this);
            vent.trigger('removeContact');
        }, params.speedChangePage);
    }
});

var ContactDescView = Backbone.View.extend({
    template: hp.tmpl('tmplContact'),
    initialize: function (options) {
        this.parentV = options.pageV;
        this.render();
        this.listenTo(vent, 'removeContact', this.remove);
    },
    render: function () {
        this.parentV.$el.append(this.el);
        this.$el.append(this.template());
    }
});

