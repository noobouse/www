(function (window) {
    var Player = function (position, App) {
        this.App = App;

        this._init(position);
    };

    Player.PlayerStatus = {
        VIEWER: 0,
        INGAME_PLAYER: 1
    };
    Player.ConnectionStatus = {
        DISCONNECTED: 0,
        CONNECTED: 1
    };

    Player.prototype = {
        defaults: {
            AccountID: '',
            UserName: 'Ghế Trống', //username
            NickName: '',
            Level: 0, //level
            Position: -1,
            OrderInGame: -1,
            RoleInGame: -1,
            Avatar: 'avatar9', //avatar url
            Experiences: 0,
            Gold: 0, //so vang hien tai
            Star: 0, //so bac hien tai
            Status: 0 //0: viewer, 1: waiting player, 2: player, 3: game owner
        },

        _init: function (position) {
            var playerPosition = Deck.playerPosition[position];

            //render player position
            var config = {
                name: 'player' + position,
                x: playerPosition.x,
                y: playerPosition.y
            };

            Kinetic.Group.call(this, config);

            var bg = new Kinetic.Image({
                image: images['bg_ac'],
                x: 0,
                y: 0
            });
            this.username = new Kinetic.Text({
                text: this.defaults.UserName,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 18,
                fill: '#fff',
                width: 119,
                height: 30,
                align: 'center',
                x: 0,
                y: 6
            });
            this.avatar = new Kinetic.Image({
                name: 'avatar',
                image: images[this.defaults.Avatar],
                x: 3,
                y: 30
            });
            this.star = new Kinetic.Text({
                text: '',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 16,
                fill: '#fff',
                width: 119,
                height: 24,
                align: 'center',
                x: 0,
                y: 154
            });
            this.add(bg);
            this.add(this.username);
            this.add(this.avatar);
            this.add(this.star);

            //render handCard Position
            var handPosition = Deck.handPosition[position],
                draftPosition = Deck.draftPosition[position],
                downPosition = Deck.downPosition[position];

            this.handCards = new Kinetic.Group({
                name: 'handCards' + position,
                x: handPosition.x,
                y: handPosition.y,
                rotationDeg: handPosition.rotateDeg
            });
            this.draftCards = new Kinetic.Group({
                name: 'draftCards' + position,
                x: draftPosition.x,
                y: draftPosition.y,
                rotationDeg: draftPosition.rotateDeg
            });
            this.downCards = new Kinetic.Group({
                name: 'downCards' + position,
                x: downPosition.x,
                y: downPosition.y,
                rotationDeg: downPosition.rotateDeg
            });

            this.App.playerLayer.add(this);
            this.App.cardLayer.add(this.handCards);
            this.App.cardLayer.add(this.draftCards);
            this.App.cardLayer.add(this.downCards);

            this.draftCards.moveToBottom();
            this.downCards.moveToTop();
        },

        render: function (player) {
            this.Player = player;
            this.isCurrent = (player.AccountID == account.AccountID);

            if (player.AccountID) {
                this.setId('player' + player.AccountID);

                if (!player.Account.UserName)
                    player.Account.UserName = 'Noname';
                this.username.setText(player.Account.UserName);
                if (player.Account.Star)
                    this.star.setText(player.Account.Star);
                //if (player.get('Avatar'))
                //that.avatar.setImage(images[(player.get('Position') + 1)]);
                //else
                this.avatar.setImage(images['avatar' + (player.Position + 1)]);

                //that.player.moveToTop();
                this.handCards.setId('handCards' + player.AccountID);
                this.draftCards.setId('draftCards' + player.AccountID);
                this.downCards.setId('downCards' + player.AccountID);
            }
            else {
                this.username.setText(this.defaults.UserName);
                this.avatar.setImage(images[this.defaults.Avatar]);
                this.star.setText('');
            }

            this.App.playerLayer.draw();
        },

        updateAccount: function (account, money) {
            var that = this;

            if (money != 0) {
                this.textMoney = new Kinetic.Text({
                    text: money > 0 ? '+' + money : money,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 32,
                    fill: '#ff0',
                    height: 24,
                    x: 129,
                    y: 134
                });
                this.add(this.textMoney);

                var tween = new Kinetic.Tween({
                    node: that.textMoney,
                    y: 104,
                    opacity: 0,
                    duration: 5,
                    easing: Kinetic.Easings.StrongEaseOut
                });
                // play tween
                tween.play();
            }

            setTimeout(function () {
                if(that.textMoney)
                    that.textMoney.destroy();

                if (that.Player && account) {
                    that.Player.Account.Star = account.Star;
                    that.Player.Account.Gold = account.Gold;
                    that.Player.Account.Experiences = account.Experiences;

                    if(that.star)
                        that.star.setText(that.Player.Account.Star);
                }

                that.App.playerLayer.draw();
            }, 500);
        },

        leaveGame: function () {
            this.setId('');
            this.username.setText(this.defaults.UserName);
            this.avatar.setImage(images[this.defaults.Avatar]);
            this.star.setText('');

            delete this.Player;

            this.App.playerLayer.draw();
        },

        renderCards: function (player) {
            if (!player)
                return;

            this.Player = player;
            this.handCards.baiAnNumber = player.BaiAn ? player.BaiAn.length : 0;

            this._renderHandCards(player.HandCards);

            this._renderBaiRac(player.BaiRac);

            this._renderBaiHa(player.BaiHa);

            this.App.cardLayer.draw();
        },

        _renderHandCards: function (listCard) {
            if (!listCard)
                return;

            this.multiSelectCard = false;

            for (var i in listCard) {
                var card = listCard[i];
                var cardImage = this.App.deckCards.getCard();

                if (typeof cardImage == 'undefined')
                    continue;

                cardImage.baiTrenTay(card, this.handCards, this.isCurrent);

                if (this.isCurrent)
                    gameCards.push(cardImage);
            }
        },

        _renderBaiRac: function (baiRacs) {
            if (!baiRacs)
                return;

            for (var i in baiRacs) {
                var card = baiRacs[i];
                var cardImage = this.App.deckCards.getCard();

                if (typeof cardImage == 'undefined')
                    continue;

                cardImage.danhBai(card.OrdinalValue, this.draftCards, this.isCurrent);
            }
        },

        _renderBaiHa: function (baiHas) {
            if (!baiHas)
                return;

            for (var i in baiHas) {
                var phom = baiHas[i];
                for (var j in phom) {
                    var cardValue = phom[j];
                    var cardImage = this.App.deckCards.getCard();

                    if (typeof cardImage == 'undefined')
                        continue;

                    cardImage.haBai(i, j, cardValue, this.downCards, this.isCurrent);
                }
            }
        },

        _reRenderHandCards: function (listCard) {
            if (!listCard)
                return;

            //xoa cac quan bai cu
            this.handCards.destroyChildren();

            if (this.isCurrent) {
                gameCards = [];
                selectedCards = {};
            }

            for (var position = 0; position < listCard.length; position++) {
                var card = listCard[position];
                var cardImage = new Card(position);

                cardImage.baiTrenTay(card, this.handCards, this.isCurrent);

                if (this.isCurrent) {
                    if (this.multiSelectCard) {
                        cardImage.card.IsDraggable = true;
                        cardImage.multiSelect = true;
                    }

                    gameCards.push(cardImage);
                }
            }
        },

        _reRenderBaiHa: function (baiHas) {
            if (!baiHas)
                return;

            //xoa cac quan bai cu
            this.downCards.destroyChildren();

            for (var vtPhom = 0; vtPhom < baiHas.length; vtPhom++) {
                var phom = baiHas[vtPhom];
                for (var vtQuan = 0; vtQuan < phom.length; vtQuan++) {
                    var cardValue = phom[vtQuan];
                    var cardImage = new Card();

                    cardImage.haBai(vtPhom, vtQuan, cardValue, this.downCards, this.isCurrent);
                }
            }
        },

        sortHandCards: function (listCard) {
            if (!listCard)
                return;

            this.Player.HandCards = listCard;

            //render quan bai moi
            this._reRenderHandCards(listCard);

            try {
                this.App.cardLayer.draw();
            } catch (e) {
            }
        },

        haBai: function (playerHaBai) {
            if (!playerHaBai && !playerHaBai.BaiHa)
                return;

            this.Player = playerHaBai;
            //render cac quan bai ha
            this._reRenderBaiHa(playerHaBai.BaiHa);
            //render quan bai tren tay
            this._reRenderHandCards(playerHaBai.HandCards);

            try {
                this.App.cardLayer.draw();
            } catch (e) {
            }
        },

        enableDragCard: function (enable) {
            if (!enable)
                enable = false;
            this.multiSelectCard = enable;
            for (var i in gameCards) {
                if (gameCards[i] && gameCards[i].card) {
                    gameCards[i].card.IsDraggable = enable;
                    gameCards[i].multiSelect = enable;
                }
            }
        },

        updateStatus: function () {
        },

        updateConnectionStatus: function () {
        },

        clear: function () {
            this.destroyChildren();
            this.App.cardLayer.draw();
        }
    };

    Kinetic.Util.extend(Player, Kinetic.Group);

    window.Player = Player;
})(window);
