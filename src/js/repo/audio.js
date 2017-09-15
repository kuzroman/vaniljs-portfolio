import {vent} from '../helper';

export var Audio = Backbone.View.extend({
    initialize: function () {
        vent.audio.on('play', this.createSound); // Внимание! зависит от положения. должен быть выше чем sound

        new SoundCheck();
        //vent.on('removePage', this.remove, this);
    },
    createSound: function (dataEvent) {
        new FactorySounds(dataEvent);
    }
});

var audioEvents = {
    startGame: {group: 'game', file: 'start2.mp3', loop: true, volume: 0.3},
    shoot: {group: 'game', file: 'shoot.mp3', volume: 0.2},
    destroyed: {group: 'game', file: 'explode.mp3', volume: 0.2},
    sound1: {group: 'bg', file: 'sound_1.mp3', loop: true}
};

var FactorySounds = Backbone.View.extend({
    tagName: 'audio',
    initialize: function (nameSound) {
        var sound = audioEvents[nameSound];
        this.group = sound['group'];
        this.file = sound['file'];
        this.loop = sound['loop'] || false;
        this.volume = sound.hasOwnProperty('volume') ? sound['volume'] : 0.8;
        this.play();
        //vent.on('audio:killGameAudio', this.removeGameAudio, this);
        vent.audio.on('killGameAudio', this.removeGameAudio, this);
        vent.audio.on('killBgAudio', this.removeBgAudio, this);
        //vent.on('removePage', this.remove, this); // постоянный на странице!
    },
    play: function () {
        this.$el.attr('src', '/assets/media/' + this.file);
        this.el.loop = this.loop;
        this.el.volume = this.volume;
        this.el.play();
    },
    removeGameAudio: function () {
        if (this.group == 'game') {
            vent.audio.off('killGameAudio');
            this.remove();
        }
    },
    removeBgAudio: function () {
        if (this.group == 'bg') {
            vent.audio.off('killBgAudio');
            this.remove();
        }
    },
    remove: function () {
        this.el.pause();
        Backbone.View.prototype.remove.call(this);
    }
});

var SoundCheck = Backbone.View.extend({
    className: 'sound',
    events: {
        'click': 'toggle',
        'mouseenter': 'hoverOn',
        'mouseleave': 'hoverOff'
    },
    initialize: function () {
        this.sound = false;
        this.render();
        vent.audio.on('showBackground', this.show, this);
        vent.audio.on('hideBackground', this.hide, this);
        //vent.on('removePage', this.remove, this);
    },
    render: function () {
        var arr = new Array(7);
        $.each(arr, (n) => {
            this.$el.append($('<i>'));
        });
        $('body').append(this.$el);
    },
    toggle: function () {
        if (!this.sound) this.play();
        else this.stop();
    },
    play: function () {
        this.$el.addClass('play');
        vent.audio.trigger('play', 'sound1');
        this.sound = true;
    },
    stop: function () {
        this.$el.removeClass('play');
        vent.audio.trigger('killBgAudio');
        this.sound = false;
    },
    show: function () {
        this.$el.css('opacity', 1);
        this.hide = false;
        //this.play();
    },
    hide: function () {
        this.$el.css('opacity', 0);
        this.hide = true;
        this.stop();
    },
    // действия по наведению
    hoverOn: function () {
        if (!this.sound) this.$el.addClass('play');
    },
    hoverOff: function () {
        if (!this.sound) this.$el.removeClass('play');
    }
});