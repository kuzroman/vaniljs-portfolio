import {hp, vent, params} from 'repo/helper';

import {Btn} from './btn.js';
import {LoaderV} from './loader.js';
import {TypingV} from './typing.js';
import {ShooterMouseAreaV, ShooterV} from './shooter.js';
import {CanvasV} from './canvasPartialsFall.js';
import {BoardResultV} from './boardResult.js';
import {BoardLeaderV} from './boardLeader.js';

var Game = Backbone.Model.extend({
    defaults: {
        PERIOD: 1011, // 10 // stop the time if all goal reached
        SPEED_TYPING: 10, // 10
        SPEED_PARTIALS: 15, // 15
        NUMBER_GOALS: 0, // set in typing

        timeSpend: 0,
        destroyed: 0,
        shoots: 0,
        accuracy: 0,
        score: 0,
        bulletsReachedGoal: 0,
        bestScore: 0,
        record: false,
        textLoaded: false,
        gameStarted: false,
        gameFinished: false
    },
    initialize: function () {
        this.listenTo(vent.game, 'textLoaded', function () {
            this.set('textLoaded', true);
        }, this);
        this.listenTo(vent.game, 'changeDestroyed', function () {
            this.counter('destroyed')
        }, this);
        this.listenTo(vent.game, 'changeShoots', function () {
            this.counter('shoots')
        }, this);
        this.listenTo(vent.game, 'changeTimeSpend', function () {
            this.counter('timeSpend')
        }, this);
        this.listenTo(vent.game, 'changeBulletsReachedGoal', function () {
            this.counter('bulletsReachedGoal')
        }, this);
        this.listenTo(vent.game, 'startGame', function () {
            this.set('gameStarted', true);
        }, this);
    },
    isGameFinished: function () {
        var result = !(this.get('NUMBER_GOALS') - this.get('destroyed')) // !(0) -> all goals destroyed
                || this.get('timeSpend') == this.get('PERIOD') // time left) {
            ;
        if (!result) return;

        this.set('gameFinished', result);
        vent.game.trigger('stopGame');
        return result;
    },
    counter: function (param) {
        this.set(param, this.get(param) + 1);
    },
    setDefaults: function () {
        this.set('timeSpend', 0);
        this.set('destroyed', 0);
        this.set('shoots', 0);
        this.set('bulletsReachedGoal', 0);
        this.set('textLoaded', false);
        this.set('gameStarted', false);
        this.set('gameFinished', false);
    }
});

export var GamePageView = Backbone.View.extend({
    className: 'page game',
    initialize: function () {
        this.modules = {};
        this.show();
        this.render();

        this.listenTo(this.model, 'change:gameStarted', this.startGame);
        vent.game.on('stopGame', this.stopGame, this);
        vent.game.on('showBtn', function () {
            this.modules.btn.showEl();
        }, this);

        this.gameNumber = 0;
        this.loadModules();

        this.listenTo(vent, 'removePage', this.remove);
    },
    render: function () {
        var gameModel = new Game(), options;
        this.options = {model: gameModel, pageV: this};
        this.model = gameModel;
        $('body').append(this.$el);
        this.modules.btn = new Btn(this.options);
    },
    loadModules: function () {
        this.modules.typingV = new TypingV(this.options);
        this.modules.canvasV = new CanvasV(this.options);
        this.modules.shooterV = new ShooterV(this.options);
        this.modules.loaderV = new LoaderV(this.options);
        this.modules.boardResultV = new BoardResultV(this.options);
        this.modules.boardLeaderV = new BoardLeaderV(this.options);
        this.shooterMouseAreaV = new ShooterMouseAreaV(this.options);
    },
    startGame: function (model, gameStarted) {
        if (!gameStarted) return;

        if (this.gameNumber++) {
            this.modules.typingV.updateView();
        }

        this.modules.shooterV.show();
        this.modules.loaderV.show();

        vent.audio.trigger('hideBackground');
        vent.audio.trigger('play', 'startGame');
    },
    stopGame: function () {
        this.shooterMouseAreaV.cleanAttr();
        this.modules.shooterV.hide();
        this.modules.loaderV.hide();
        this.modules.boardResultV.show();

        this.model.setDefaults();

        vent.audio.trigger('killGameAudio');
        vent.audio.trigger('showBackground');
    },
    remove: function () {
        vent.audio.trigger('killGameAudio');
        vent.audio.trigger('showBackground');
        vent.off('removePage');

        this.$el.addClass('rotate');
        setTimeout(()=> {
            Backbone.View.prototype.remove.call(this);
            vent.trigger('removeGame');
        }, params.speedChangePage);
    },
    updateView: function () {
        this.remove();
        this.render();
    }
});
