import {vent, params} from '../../helper';
import {letters} from './typing.js';

var Shooter = Backbone.Model.extend({
    defaults: {
        x: 0,
        firstShot: true
    }
});
var shooter = new Shooter();

/**
 * change shooter position and do shoot here
 */
export var ShooterMouseAreaV = Backbone.View.extend({
    id: 'shooterMouseArea',
    events: {
        'click': 'bulletShot', // bulletShot // testBit
        'mousemove': 'shooterMove'
    },
    initialize: function (options) {
        this.parentV = options.pageV;
        this.parentM = options.model;
        this.model = shooter;
        this.render();
        this.canvasForBulletV = new Canvas(options);
        this.listenTo(vent, 'removeGame', this.remove);
    },
    render: function () {
        this.parentV.$el.append(this.$el);
    },
    shooterMove: function (event) {
        this.model.set('x', event.offsetX);
    },
    bulletShot: function () {
        //console.log(this.parentM);
        if (!this.parentM.get('textLoaded') || !this.parentM.get('gameStarted') ||
            this.parentM.get('gameFinished'))
            return;

        if (this.model.get('firstShot')) {
            vent.trigger('startTimer');
            this.model.set('firstShot', false);
        }

        vent.audio.trigger('play', 'shoot');
        vent.game.trigger('changeShoots');

        this.canvasForBulletV.addBulletInCanvas(this.model.get('x'));
    },
    cleanAttr: function () {
        this.model.clear().set(this.model.defaults);
    },
    //testBit: function (e) {
    //    this.canvasForBulletV.addBitInCanvas({x: e.clientX, y: e.clientY});
    //}
});

export var ShooterV = Backbone.View.extend({
    id: 'shooter',
    className: 'shooter',
    initialize: function (options) {
        this.parentV = options.pageV;
        this.model = shooter;
        this.listenTo(this.model, 'change:x', this.move);
        this.render();
        this.listenTo(vent, 'removeGame', this.remove);
    },
    render: function () {
        this.parentV.$el.append(this.$el);
    },
    move: function (model, x) {
        this.$el.css('left', x);
    },
    show: function () {
        this.$el.addClass('show');
    },
    hide: function () {
        this.$el.removeClass('show');
    },
    remove: function () {
        this.hide();
        Backbone.View.prototype.remove.call(this);
    }
});

////////////////////////////////////////////////

var Canvas = Backbone.View.extend({
    tagName: 'canvas',
    className: 'canvas',
    initialize: function (options) {
        this.bullets = [];
        this.bits = [];
        this.ctx = this.el.getContext('2d');
        this.intervalStatus = 'act';
        this.parentV = options.pageV;

        this.render();
        this.animations();
        this.listenTo(vent, 'removeGame', this.remove);
        this.listenTo(vent.game, 'changeDestroyed', this.addBitInCanvas);
    },
    render: function () {
        this.parentV.$el.append(this.$el);
        this.el.width = 5000;
        this.el.height = 5000;
        return this;
    },
    addBulletInCanvas: function (x) {
        this.bullets.push(new Bullet({x: x, ctx: this.ctx}));
    },
    addBitInCanvas: function (positions) {
        for (var i = 0; i < 3; i++) {
            this.bits.push(new Bit({x: positions.x, y: positions.y, ctx: this.ctx}));
        }
        //console.log(positions, this.bits, this);
    },

    animations: function () {
        var isInt = setInterval(() => {
            //console.log(this.intervalStatus);
            this.clearCanvas();
            this.calcBurstPosition();
            this.calcBitPositions();
            if (this.intervalStatus == 'stop') {
                clearInterval(isInt);
                this.clearCanvas();
            }
        }, 0)
    },
    clearCanvas: function () {
        this.ctx.fillStyle = "#2f2f2f";
        this.ctx.clearRect(0, 0, 5000, 5000);
    },
    calcBitPositions: function () {
        for (let j = 0, b, lenBits = this.bits.length; j < lenBits; j++) {
            b = this.bits[j];
            b.move();
            b.draw();

            if (2000 < b.y) {
                this.bits.splice(j, 1);
                lenBits = this.bits.length;
            }
        }
    },
    calcBurstPosition: function () {
        //console.log('update', this.bullets.length);
        for (let j = 0, b, lenBullets = this.bullets.length; j < lenBullets; j++) {
            b = this.bullets[j];
            b.move();
            b.draw();

            let aims = letters.models,
                bX1 = b.x - b.radius,
                bX2 = b.x + b.radius
                ;

            for (let i = 0, len = aims.length; i < len; i++) {
                if (aims[i].get('killed') || !aims[i].get('isGoal')) continue;
                var y2 = aims[i].get('y2');

                // they on the one axis y
                if (b.y == y2 || b.y == y2 - 1 || b.y == y2 + 1) {
                    if ((bX1 <= aims[i].get('x1') && aims[i].get('x1') <= bX2) || // bullet at left
                        (bX1 <= aims[i].get('x2') && aims[i].get('x2') <= bX2 )) { // bullet at right
                        // they on the one axis x - Goal!
                        aims[i].set('killed', true);
                        vent.game.trigger('changeDestroyed', {x: b.x, y: b.y});

                        if (!b.isReachedGoal) {
                            b.isReachedGoal = true;
                            vent.game.trigger('changeBulletsReachedGoal');
                            vent.audio.trigger('play', 'destroyed');
                        }
                    }
                }
            }

            if (b.y < -20) {
                this.bullets.splice(j, 1);
                lenBullets = this.bullets.length;
            }
        }
    },
    remove: function () {
        //console.log('remove canvas');
        this.intervalStatus = 'stop';
        Backbone.View.prototype.remove.call(this);
    }
});
var Bullet = class {
    constructor(data) {
        this.x = data.x || 0;
        this.y = data.y || $('body').height() - 138;
        this.ctx = data.ctx;
        this.isReachedGoal = false;
        this.radius = 6;
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        this.ctx.fillStyle = "#f1ff00";
        this.ctx.fill();
    }
    move() {
        this.y -= 2; // speed
    }
};
var Bit = class {
    constructor(data) {
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.g = Math.random() * 5 + 1; // gravity
        this.size = Math.random() * 3 + 1;
        this.vectorX = Math.random() < 0.5 ? 1 : -1;
        this.ctx = data.ctx;
    }
    draw() {
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    move() {
        this.g -= 0.1;
        this.y -= this.g;
        this.x = this.x + this.vectorX * 2;
    }
};