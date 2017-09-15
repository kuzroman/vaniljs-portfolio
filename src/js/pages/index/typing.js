import {hp, vent, params} from '../../helper';

/**
 * draw the letters and fill model their position
 */
export var TypingV = Backbone.View.extend({
    id: 'typingCenter',
    className: 'typingCenter',
    initialize: function (options) {
        this.parentV = options.pageV;
        this.render();
        this.resize();
        this.listenTo(vent.game, 'textLoaded', this.updateLettersPosition);
        this.listenTo(vent, 'pageLoaded', this.updateLettersPosition);
        this.listenTo(vent, 'removeGame', this.remove);
    },
    render: function () {
        this.lettersV = []; // list of View
        this.parentV.$el.append(this.$el.html('<div>'));
        letters.each(function (letterM) {
            var letterV = new LetterV({model: letterM});
            this.$el.find('div').append(letterV.$el);
            this.lettersV.push(letterV);
        }, this);

        this.updateLettersPosition();
        this.showLetter();
        this.setNumberGoal();
    },
    showLetter: function () {
        var i = 0, len = this.lettersV.length;

        this.interval = setInterval(() => {
            let letter = this.lettersV[i];
            letter.updateModelData();
            letter.$el.css('opacity', 1);

            if (letter.model.get('isGoal')) {
                vent.trigger('letterShowed', { // pass to canvass
                    x: letter.model.get('x2'),
                    y: letter.model.get('y2')
                });
            }
            if (len <= ++i) {
                vent.game.trigger('textLoaded');
                clearInterval(this.interval)
            }
        }, this.model.get('SPEED_TYPING'));
    },
    updateLettersPosition: function () {
        _.each(this.lettersV, function (letterV) {
            letterV.updateModelData();
        }, this);
    },
    setNumberGoal: function () {
        this.model.set('NUMBER_GOALS', letters.where({'isGoal': true}).length);
        //console.log( letters.where({'isGoal': true}).length, this.model.get('NUMBER_GOALS') );
    },
    remove: function () {
        clearInterval(this.interval);
        $(window).off("resize", this.resize);
        Backbone.View.prototype.remove.call(this);
    },
    updateView: function () {
        this.remove();
        this.render();
    },
    resize: function () {
        var self = this, resizeTimeoutId;
        $(window).on('resize', function () {
            clearTimeout(resizeTimeoutId);
            resizeTimeoutId = setTimeout(function () {
                self.updateLettersPosition();
            }, 200);
        });
    }
});

var Letter = Backbone.Model.extend({
    defaults: {
        symbol: '',
        killed: false,
        isGoal: true,
        x1: 0, x2: 0, y1: 0, y2: 0 // -10 for i.display:block
    }
});

var Letters = Backbone.Collection.extend({
    model: Letter
});

var LetterV = Backbone.View.extend({
    tagName: 'i',
    initialize: function () {
        this.render();
        this.listenTo(vent, 'removeGame', this.remove);
        this.listenTo(this.model, 'change:killed', this.hideLetter);
    },
    render: function () {
        var symbol = this.model.get('symbol');
        if (symbol == '|') {
            symbol = '';
            this.$el.css('display', 'block');
            this.model.set('isGoal', false); // it isn't necessary kill them
        }
        else {
            if (symbol == ' ')
                this.model.set('isGoal', false);
            this.$el.text(symbol);
        }
        return this;
    },
    hideLetter: function (model, killed) {
        if (killed) this.$el.css('opacity', 0);
    },
    updateModelData: function () {
        this.model.set({
            killed: false,
            x1: ~~this.$el.offset().left,
            x2: ~~( this.$el.offset().left + this.$el.width() ),
            y1: ~~this.$el.offset().top,
            y2: ~~( this.$el.offset().top + this.$el.height() )
        });
    }
});

/////////////////////////////////////////////////////////////////////////////

var myText = `Hello, my name is Roman Kuznetsov.
|I am a web Front-End Developer and UX enthusiast.
|Single page applications, animation, parallax are my passion
|Feel free to take a look at my most recent projects on my work page.
|Also you can stop and say hello at kuzroman@list.ru`;
//var myText = `Hello`;

myText = $.trim(myText.replace(/\s{2,}/g, ''));
let arrLetter = [], len = myText.length;
for (let i = 0; i < len; i++) {
    arrLetter.push(new Letter({symbol: myText[i]}));
}
export var letters = new Letters(arrLetter); // collection
//console.log(letters.models);
