import {hp, vent, params} from '../../helper';

export var CanvasV = Backbone.View.extend({
    tagName: 'canvas',
    className: 'canvas',
    initialize: function (options) {
        this.parentV = options.pageV;
        this.render();
        //engravingText.events();
        this.listenTo(vent, 'letterShowed', this.animation);
        this.listenTo(vent, 'removeGame', this.remove);
    },
    render: function () {
        engravingText.p = {
            ctx: this.el.getContext("2d"),
            bits: [],
            bitsStatus: 'start', // start, act, stop
            speedPartials: this.model.get('SPEED_PARTIALS')
        };
        this.parentV.$el.append(this.$el);
        this.el.width = 5000;
        this.el.height = 5000;
        return this;
    },
    updateView: function () {
        this.remove();
        this.render();
    },
    remove: function () {
        Backbone.View.prototype.remove.call(this);
    },
    animation: function (positions) {
        engravingText.addBits(positions);
        if (engravingText.p.bitsStatus != 'act') {
            engravingText.p.bitsStatus = 'act';
            engravingText.animationBits();
        }
    }
});

var engravingText = {};
engravingText.p = {};

engravingText.addBits = function (positions) {
    for (let i = 0, bit; i < 3; i++) {
        bit = new this.Bit(positions.x, positions.y);
        this.p.bits.push(bit);
    }
    //console.log(this.p.bits.length);
};
engravingText.animationBits = function () {
    var isInt = setInterval(() => {
        this.clearCanvas();
        this.updateBit();
        if (this.p.bitsStatus == 'stop') {
            clearInterval(isInt);
            this.clearCanvas();
        }
        //this.clearCanvas();
    }, this.p.speedPartials)
};

engravingText.Bit = class {
    constructor(currentX, currentY) {
        this.x = currentX || 0;
        this.y = currentY || 0;
        this.g = -Math.round(Math.random() * 50) / 10; // gravity
    }
    draw() {
        let p = engravingText.p;
        p.ctx.fillStyle = '#fff';
        let size = Math.random() * 3 + 1;
        p.ctx.fillRect(this.x, this.y, size, size);
    }
};

engravingText.clearCanvas = function () {
    this.p.ctx.fillStyle = "#2f2f2f";
    //this.p.ctx.fillRect(0, 0, params.bodyW, params.bodyH);
    this.p.ctx.clearRect(0, 0, 5000, 5000);
};

engravingText.updateBit = function () {
    let bits = this.p.bits;

    for (let j = 0, b; j < bits.length; j++) {
        b = bits[j];
        b.y -= b.g;
        b.g -= 0.1;

        if (params.bodyH < b.y) bits.splice(j, 1);
        b.draw();
    }

    //console.log('bits', bits.length);
    if (!bits.length) {
        this.p.bitsStatus = 'stop';
    }
};