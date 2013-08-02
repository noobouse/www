(function (window) {

    function Deck(layer) {
        this._init(layer);
    }

    Deck.prototype = new Kinetic.Group({
        name: 'deck'
    });

    Deck.prototype._init = function (layer) {
        this.layer = layer;

        this.numberCard = 0;
        this.cards = [];

        this.text = new Kinetic.Text({
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: Card.baiLoc.width / 2 + 10,
            fontStyle: 'bold',
            fill: '#000',
            width: Card.baiLoc.width + 4,
            height: Card.baiLoc.height + 4,
            align: 'center',
            x: 0,
            y: (Card.baiLoc.height - Card.baiLoc.width) + 4,
            opacity: 0.7
        });

        Kinetic.Group.call(this, {
            x: Deck.position.x,
            y: Deck.position.y
        });

        this.layer.add(this);
    }

    Deck.prototype.generateCards = function (numberPlayer) {
        if (typeof numberPlayer == 'undefined')
            numberPlayer = 4;

        this.numberCard = 13 * numberPlayer;
        this.cards = [];

        for (var i = 0; i < this.numberCard; i++) {
            var cardImage = new Card(i);

            this.add(cardImage);
            this.cards.push(cardImage);
        }

        this.text.setText(this.numberCard);
        this.add(this.text);

        if (!this.getParent())
            this.layer.add(this);

        this.layer.draw();
    }

    Deck.prototype.getCard = function () {
        if (this.numberCard == 0 || !this.cards)
            return;

        var card = this.cards.pop();
        this.numberCard--;
        if (this.numberCard == 0)
            this.text.setText('');
        else
            this.text.setText(this.numberCard);

        card.remove();
        this.layer.draw();

        return card;
    };

    Deck.prototype.clear = function () {
        this.cards = [];
        this.numberCard = 0;
        this.destroyChildren();

        this.layer.draw();
    }

    Deck.position = {
        x: (1024 - Card.baiLoc.width) / 2,
        y: (768 - Card.baiLoc.height) / 2 + 20
    }

    Deck.playerPosition = {
        0: { x: 10, y: 578 },
        1: { x: 805, y: 295 },
        2: { x: 450, y: 10 },
        3: { x: 100, y: 295 }
    };

    Deck.handPosition = {
        0: { x: 130, y: Deck.playerPosition[0].y + 30, rotateDeg: 0 },
        1: { x: Deck.playerPosition[1].x - 44, y: Deck.playerPosition[1].y + 9.7 * Card.baiOther.seperator, rotateDeg: 270 },
        2: { x: Deck.playerPosition[2].x + 16 * Card.baiOther.seperator / 2, y: Deck.playerPosition[2].y + 224, rotateDeg: 180 },
        3: { x: Deck.playerPosition[3].x + 164, y: Deck.playerPosition[3].y - 1.7 * Card.baiOther.seperator, rotateDeg: 90 }
    };

    Deck.draftPosition = {
        0: { x: 586, y: 488, rotateDeg: 0 },
        1: { x: 586, y: 239, rotateDeg: 0 },
        2: { x: 311, y: 239, rotateDeg: 0 },
        3: { x: 311, y: 488, rotateDeg: 0 }
    };

    Deck.downPosition = {
        0: { x: 450, y: 408, rotateDeg: 0 },
        1: { x: 586, y: 305, rotateDeg: 0 },
        2: { x: 450, y: 259, rotateDeg: 0 },
        3: { x: 331, y: 305, rotateDeg: 0 }
    };


    window.Deck = Deck;
})(window);