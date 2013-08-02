(function (window) {
    Card.image = { width: 88, height: 120 };
    Card.bai = { width: 88, height: 120, seperator: 66, baiDraggable: true, selectedHeight: 30 };
    Card.baiOther = { width: 66, height: 90, seperator: 21, baiDraggable: false };
    Card.baiLoc = { width: 66, height: 90, seperator: 0.3, baiDraggable: false, defaultValue: 52 };
    Card.baiDraft = { width: 66, height: 90, seperator: 21, baiDraggable: false };

    function Card(position) {
        if (typeof position == 'undefined' || position < 0)
            position = 0;

        this._init(position);
    }

    Card.Suite = {
        3: 0, //co = 39/13
        2: 1, // ro = 26/13
        1: 3, //nhep = 13/13
        0: 2, //bich = 0/13
        4: 4
    }

    Card.NumberCardOfDeck = 52;
    Card.NumberCardOfSuite = 13;
    Card.NumberCardInHand = 10;

    Card.cropImage = function (cardValue) {
        return cropImage = {
            x: ((cardValue % Card.NumberCardOfSuite) * Card.image.width),
            y: Card.Suite[Math.floor(cardValue / Card.NumberCardOfSuite)] * Card.image.height,
            width: Card.image.width,
            height: Card.image.height
        };
    };

    Card.prototype._init = function (position) {
        var attrs = {
            name: position,
            image: images['bai'],
            x: 0 + position * Card.baiLoc.seperator,
            y: 0 + position * Card.baiLoc.seperator,
            crop: Card.cropImage(Card.baiLoc.defaultValue),
            width: Card.baiLoc.width,
            height: Card.baiLoc.height
        };
        Kinetic.Image.call(this, attrs);
    }


    Card.prototype.reRender = function (handCards, isCurrent) {
        if (!handCards)
            return;

        var position = handCards.get('Image').length;

        if (isCurrent) {
            this.pos = position;
            this.setAttrs({
                name: position,
                x: 0 + position * Card.bai.seperator,
                y: 0
            });

            this.setSelected(false);
        }
        else {
            this.pos = position;
            this.setAttrs({
                name: position,
                x: 0 + position * Card.baiOther.seperator,
                y: 0
            });
        }
        handCards.add(this);
    }

    Card.prototype.danhBai = function (cardValue, draftCards, isCurrent) {
        if (!draftCards)
            return;

        if (typeof cardValue == 'undefined' || cardValue < 0)
            cardValue = Card.baiLoc.defaultValue;

        var dropCards = draftCards.get('Image'),
            count = dropCards.length;

        for (var ii = 0; ii < dropCards.length; ii++) {
            dropCards[ii].setOpacity(0.8);
        }

        this.off('.card');
        this.setAttrs({
            id: cardValue,
            name: count,
            crop: Card.cropImage(cardValue),
            x: count * Card.baiDraft.width / 2,
            y: 0,
            width: Card.baiDraft.width,
            height: Card.baiDraft.height,
            draggable: false,
            shadowEnabled: false
        });

        draftCards.add(this);
    }

    Card.prototype.baiTrenTay = function (card, handCards, isCurrent) {
        if (!handCards)
            return;

        var cardValue = card.OrdinalValue,
            position = handCards.get('Image').length;

        if (typeof cardValue == 'undefined' || cardValue < 0)
            cardValue = Card.baiLoc.defaultValue;

        if (isCurrent) {
            var maxCard = 10,
                minX = (handCards.getX() - Card.bai.seperator + 1) * handCards.getStage().getScale().x,
                maxX = (handCards.getX() + Card.bai.seperator * maxCard - 1) * handCards.getStage().getScale().x;

            this.pos = position;
            this.card = card;
            this.setAttrs({
                id: cardValue,
                name: position,
                crop: Card.cropImage(cardValue),
                x: 0 + position * Card.bai.seperator,
                y: 0,
                width: Card.bai.width,
                height: Card.bai.height,
                draggable: Card.bai.baiDraggable,
                dragBoundFunc: function (pos) {
                    var newY = this.getAbsolutePosition().y,
                        newX = (pos.x < minX) ? minX : (pos.x > maxX) ? maxX : pos.x;
                    return {
                        x: newX,
                        y: newY
                    };
                }
            });

            if (card.IsInPhom || card.IsBaiAn) {
                this.setShadowEnabled(true);
                this.setShadowColor('orange');
                this.setShadowBlur(5);
                this.setShadowOffset(-2);
                this.setShadowOpacity(0.5);
                if (card.IsBaiAn) {
                    this.setShadowBlur(10);
                    this.setShadowOffset(-5);
                }
            }
            this.addEventListener();
        }
        else {
            if (!card.Flip)
                cardValue = Card.baiLoc.defaultValue;

            this.pos = position;
            this.setAttrs({
                name: position,
                crop: Card.cropImage(cardValue),
                x: 0 + position * Card.baiOther.seperator,
                y: 0,
                width: Card.baiOther.width,
                height: Card.baiOther.height,
                draggable: Card.baiOther.baiDraggable
            });
        }
        handCards.add(this);
    }

    Card.prototype.anBai = function (position, cardValue, handCards, isCurrent, card) {
        if (!handCards)
            return;

        if (typeof cardValue == 'undefined' || cardValue < 0)
            cardValue = Card.baiLoc.defaultValue;

        var maxCard = 10,
            minX = (handCards.getX() - Card.bai.seperator + 1) * handCards.getStage().getScale().x,
            maxX = (handCards.getX() + Card.bai.seperator * maxCard - 1) * handCards.getStage().getScale().x;

        this.off('.card');

        if (isCurrent) {
            this.setAttrs({
                id: cardValue,
                name: position,
                crop: Card.cropImage(cardValue),
                x: 0 + position * Card.bai.seperator,
                y: 0,
                width: Card.bai.width,
                height: Card.bai.height,
                draggable: Card.bai.baiDraggable,
                dragBoundFunc: function (pos) {
                    var newY = this.getAbsolutePosition().y,
                        newX = (pos.x < minX) ? minX : (pos.x > maxX) ? maxX : pos.x;
                    return {
                        x: newX,
                        y: newY
                    };
                }
            });
            this.card = card;
            this.pos = position;

            if (card.IsInPhom || card.IsBaiAn) {
                this.setShadowEnabled(true);
                this.setShadowColor('orange');
                this.setShadowBlur(5);
                this.setShadowOffset(-2);
                this.setShadowOpacity(0.5);
                if (card.IsBaiAn) {
                    this.setShadowBlur(10);
                    this.setShadowOffset(-5);
                }
            }
            this.addEventListener();
        }
        else {
            this.pos = position;
            this.setAttrs({
                id: cardValue,
                name: position,
                crop: Card.cropImage(cardValue),
                x: 0 + position * Card.baiOther.seperator,
                y: 0,
                width: Card.baiOther.width,
                height: Card.baiOther.height
            });
        }

        handCards.add(this);
    }

    Card.prototype.haBai = function (vtPhom, vtQuan, cardValue, downCards, isCurrent) {
        if (!downCards)
            return;

        if (typeof cardValue == 'undefined' || cardValue < 0)
            cardValue = Card.baiLoc.defaultValue;

        this.off('.card');

        this.setAttrs({
            id: cardValue,
            name: '',
            crop: Card.cropImage(cardValue),
            x: vtQuan * Card.baiDraft.width / 2,
            y: vtPhom * Card.baiDraft.height / 2,
            width: Card.baiDraft.width,
            height: Card.baiDraft.height,
            draggable: false,
            shadowEnabled: false
        });

        downCards.add(this);
    }

    Card.prototype.movePosition = function (newPosition) {
        var oldPos = this.pos;
        this.pos = newPosition;

        //Xep lai vi tri quan bai trong array
        //vi tri moi > vi tri cu
        if (newPosition > oldPos) {
            gameCards.splice(newPosition, 0, gameCards[oldPos]); //them ban sao cua quan bai di chuyen vao vi tri moi
            gameCards.splice(oldPos, 1); //xoa quan bai cu khoi array
        }
            //vi tri moi < vi tri cu
        else if (newPosition < oldPos) {
            gameCards.splice(newPosition, 0, gameCards[oldPos]); //them ban sao cua quan bai di chuyen vao vi tri moi
            gameCards.splice(oldPos + 1, 1); //xoa quan bai cu khoi array (vi tri bi tang them +1 do da them quan bai o tren)
        }

        var parent = this.getParent();
        parent.removeChildren();
        for (var i in gameCards) {
            var cardImage = gameCards[i];
            cardImage.reRender(parent, true);
        }
        this.getLayer().draw();
    }

    Card.prototype.setSelected = function (isSelect) {
        if (isSelect) {
            this.selected = true;
            this.setShadowEnabled(false);
            this.off('mouseover.card mouseout.card');


            if (!this.multiSelect) {
                for (var i in selectedCards) {
                    if(selectedCards[i])
                        selectedCards[i].setSelected(false);
                }
            }

            selectedCards[this.card.OrdinalValue] = this;
        } else {
            this.selected = false;
            this.setY(0);
            this.setShadowEnabled(true);
            this.addMouseMoveEvent();

            delete selectedCards[this.card.OrdinalValue];
        }
    }

    Card.prototype.addEventListener = function () {

        this.on('dragstart.card', function () {
            if (this.checkCard()) {
                var cardCount = gameCards.length;

                this.setOpacity(.5);
                this.moveToTop();
            }
        });

        this.on('dragend.card', function () {
            if (this.checkCard()) {
                var cardCount = gameCards.length;
                var newPos = Math.floor((this.getX() + Card.bai.seperator) / Card.bai.seperator);

                newPos = newPos < 0 ? 0 : (newPos > cardCount - 1) ? cardCount - 1 : newPos;

                this.setOpacity(1);
                this.movePosition(newPos);
            }
        });

        this.on('tap.card click.card', function (e) {
            if (this.checkCard() && this.card.IsDraggable) {
                if (!this.selected || typeof this.selected == 'undefined') {
                    this.move(0, -Card.bai.selectedHeight);
                    this.setSelected(true);
                } else {
                    this.setSelected(false);
                }

                this.getLayer().draw();
            }
        });

        this.addMouseMoveEvent();
    }

    Card.prototype.addMouseMoveEvent = function () {
        if (this.card.IsDraggable && !this.card.IsInPhom) {
            this.on('mouseover.card', function () {
                if (this.checkCard()) {
                    this.setShadowEnabled(true);
                    this.setShadowColor('orange');
                    this.setShadowBlur(5);
                    this.setShadowOffset(-2);
                    this.setShadowOpacity(0.4);

                    this.getLayer().draw();
                }
            });

            this.on('mouseout.card', function () {
                if (this.checkCard()) {
                    this.setShadowEnabled(false);
                    this.getLayer().draw();
                }
            });
        }
    }

    Card.prototype.checkCard = function () {
        if (!this.getParent()) {
            this.off('.card');
            this.destroy();

            return false;
        }

        return true;
    }

    Kinetic.Util.extend(Card, Kinetic.Image);

    window.Card = Card;
})(window);