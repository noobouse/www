(function (window) {
    var that;

    var Phom = function () {
        that = this;

        this.background = new Kinetic.Layer();
        this.playerLayer = new Kinetic.Layer();
        this.cardLayer = new Kinetic.Layer();
        this.deckLayer = new Kinetic.Layer();
        this.phomResultLayer = new Kinetic.PhomResult();
        this.timerLayer = new Kinetic.Layer();
        this.stage = new Kinetic.Stage({
            container: 'canvas',
            width: 1024,
            height: 768
        });

        this.players = {};
        this.timer = new Timer(this.timerLayer);
        this.deckCards = new Deck(this.deckLayer);
    }

    Phom.prototype.drawBackground = function (image) {
        var bg = new Kinetic.Image({
            image: image,
            x: 0,
            y: 20
        });
        this.background.add(bg);
    }

    Phom.prototype.initCanvas = function () {
        for (var pos in Deck.playerPosition) {
            this.players[pos] = new Player(pos, this);
        }

        this.drawBackground(images.ban);

        this.stage.add(this.background);
        this.stage.add(this.deckLayer);
        this.stage.add(this.cardLayer);
        this.stage.add(this.playerLayer);
        this.stage.add(this.phomResultLayer);
        this.stage.add(this.timerLayer);
    }

    Phom.prototype.clearCanvas = function () {
        $('#message').html('');
        selectedCards = {};
        gameCards = [];

        this.players = {};

        this.deckLayer.destroy();
        this.background.destroy();
        this.playerLayer.destroy();
        this.cardLayer.destroy();
        this.phomResultLayer.destroy();
        this.timerLayer.destroy();
    }

    Phom.prototype.joinGame = function (PhomSession) {
        console.info('Room', PhomSession);

        if (!PhomSession)
            return;

        roomModel = PhomSession;
        $('#leaveroom').show();
        $('#logout').hide();
        $('#lobby').hide();

        if (PhomSession && PhomSession.Players) {
            for (var i in PhomSession.Players) {
                var player = PhomSession.Players[i];
                if (player.AccountID == account.AccountID) {
                    account = player.Account;
                    currentPlayer = player;
                    break;
                }
            }
        }

        that.initCanvas();

        if (PhomSession.IsPlaying) {
            that.startGame(PhomSession);
            Util.hideMessage();
        } else {
            that.renderPlayers(PhomSession.Players);
            Util.hideMessage();
        }
    }
    Phom.prototype.registerLeaveGame = function () {
        $('#leaveroom').hide();

        $('#message').html('Bạn đăng ký rời phòng');
        console.log('Bạn đã đăng ký rời phòng chơi.');
    }
    Phom.prototype.leaveGame = function () {
        if (roomModel) {
            $('#joinroom').show();
            $('#logout').show();
            $('#lobby').show();
            $('#gameButton button').hide();
            $('#message').html('');

            that.clearCanvas();
            roomModel = null;

            console.log('Bạn đã rời phòng chơi');
        }
    }

    Phom.prototype.playerJoin = function (player) {
        console.log('User: ' + player.Account.UserName + ' đã vào phòng chơi');

        var position = (player.Position - currentPlayer.Position);
        if (position < 0)
            position += roomModel.MaxPlayer;

        //Neu chua khoi tao danh sach players thi goi timeout
        if (!this.players)
            this.players = {};
        if (!this.players[position])
            this.players[position] = new Player(position, this);

        try {
            this.players[position].render(player);
        } catch (e) { }
    }
    Phom.prototype.playerLeave = function (accountId) {
        if (accountId == account.AccountID) {
            this.leaveGame();
            return;
        }

        try {
            this.getPlayerByAccountId(accountId).leaveGame();
        } catch (e) { }

        console.log('User: ' + accountId + ' đã rời phòng chơi');
    }
    Phom.prototype.playerRegisterLeave = function (accountId) {
        if (accountId == account.AccountID) {
            this.registerLeaveGame();
            return;
        }

        console.log(accountId, 'đăng ký rời phòng');
    }
    Phom.prototype.playerReconnected = function (accountId) {
        console.log(accountId, 'đã kết nối lại');
    }
    Phom.prototype.playerDisconnected = function (accountId) {
        console.log(accountId, 'bị mất kết nối');
    }

    Phom.prototype.startGame = function (gameSession) {
        console.log('Start game, PhomSession', gameSession);

        if (!gameSession)
            return;

        ////clear previous session
        this.endGame();

        $('#gameButton button#sortCards').show();
        $('#message').html('');

        roomModel = gameSession;
        roomModel.IsPlaying = true;

        var players = gameSession.Players;

        if (players) {
            for (var i in players) {
                var player = players[i];
                if (player.AccountID == account.AccountID) {
                    account = player.Account;
                    currentPlayer = player;

                    if (currentPlayer.Status !== Player.PlayerStatus.INGAME_PLAYER) {
                        $('#message').html('Đợi ván sau');
                    }
                    break;
                }
            }
        }

        if (gameSession.CountActivePlayer > 1) {
            this.deckCards.generateCards(gameSession.CountActivePlayer);
        }

        this.renderPlayers(players);
    }

    Phom.prototype.renderPlayers = function (players) {
        for (var i in players) {
            try {
                var player = players[i];

                var position = (player.Position - currentPlayer.Position);
                if (position < 0)
                    position += roomModel.MaxPlayer;

                this.players[position].render(player);

                if (player.Status == Player.PlayerStatus.INGAME_PLAYER)
                    this.players[position].renderCards(player);
            } catch (e) { }
        }
    };

    Phom.prototype.danhBai = function (listCard, cardValue) {
        console.log('Bạn đánh bài, value=', cardValue);

        try {
            //get by position
            var player = this.getCurrentPlayer();

            //render quan bai danh
            var cardImage = new Card();
            cardImage.danhBai(cardValue, player.draftCards, true);

            player.sortHandCards(listCard); //xep lai bai tren tay

            cardImage.setId(cardValue);
        } catch (e) { }
    }
    Phom.prototype.danhBaiOther = function (accountId, cardValue) {
        console.log(accountId + ' đánh bài, value=', cardValue);

        var isCurrent = (accountId == account.AccountID) || false;
        if (isCurrent) {
            this.danhBai(cardValue);
            return;
        }

        try {
            //get by accountId
            var player = this.getPlayerByAccountId(accountId);

            var i = player.handCards.get('Image').length - 1; //lay vi tri quan bai cuoi cung = length - 1
            var cardImage = player.handCards.get('.' + i)[0]; //lay quan bai cuoi cung tren tay

            if (typeof cardImage == 'undefined')
                cardImage = new Card();

            cardImage.remove();
            cardImage.danhBai(cardValue, player.draftCards, isCurrent);
            this.cardLayer.draw();
        } catch (e) {}
    }

    Phom.prototype.bocBai = function (listCard) {
        console.log('Bạn bốc bài');

        try {
            var cardImage = this.deckCards.getCard();//lay quan bai tu bo loc

            //render lai quan bai
            this.getCurrentPlayer().sortHandCards(listCard);
        } catch (e) { }
    }
    Phom.prototype.bocBaiOther = function (accountId) {
        console.log(accountId + ' bốc bài');

        try {
            var isCurrent = (accountId == account.AccountID) || false;
            if (isCurrent) {
                this.bocBai(52);
                return;
            }

            var handCards = this.cardLayer.get('#handCards' + accountId)[0];
            var cardImage = this.deckCards.getCard(); //lay quan bai tu bo loc

            if (typeof cardImage == 'undefined')
                cardImage = new Card();

            cardImage.baiTrenTay({ OrdinalValue: 52 }, handCards, isCurrent);

            this.cardLayer.draw();
        } catch (e) { }
    }

    Phom.prototype.anBai = function (listCard, eatCardValue) {
        console.log('Bạn ăn bài');

        try {
            //xoa card khoi khu vuc BaiRac
            var cardImage = this.cardLayer.get('#' + eatCardValue)[0];
            if (typeof cardImage != 'undefined')
                cardImage.remove();

            //render lai quan bai
            this.getCurrentPlayer().sortHandCards(listCard);
        }
        catch (e) {
        }
    }
    Phom.prototype.anBaiOther = function (accountId, eatCardValue) {
        console.log(accountId + ' ăn bài, value=' + eatCardValue);
        try {
            var isCurrent = (accountId == account.AccountID) || false;
            if (isCurrent) {
                this.getCurrentPlayer().Player.HandCards.push({ OrdinalValue: eatCardValue, IsInPhom: true, IsBaiAn: true, IsDraggable: false });
                this.anBai(this.getCurrentPlayer().Player.HandCards, eatCardValue);
                return;
            }

            //get by accountId
            var handCards = this.cardLayer.get('#handCards' + accountId)[0];
            var cardImage = this.cardLayer.get('#' + eatCardValue)[0];

            if (typeof cardImage == 'undefined')
                cardImage = new Card();

            var i = handCards.get('Image').length;//lay vi tri quan bai cuoi cung = length
            var j = handCards.baiAnNumber || 0;//lay so quan bai da an (mac dinh =0)

            //Di chuyen card o vi tri =j ra cuoi
            var oldCard = handCards.get('.' + j)[0];
            if (typeof oldCard != 'undefined') {
                oldCard.pos = i;
                oldCard.setAttrs({
                    name: i,
                    x: i * Card.baiOther.seperator,
                    y: 0
                });
                oldCard.moveToTop();//di chuyen len top layer
            }

            //dat quan bai an vao vi tri = so quan bai da an truoc do
            cardImage.remove();
            cardImage.anBai(j, eatCardValue, handCards, isCurrent);

            handCards.baiAnNumber = j + 1; //tang so quan bai da an +1 sau khi an bai
            for (var ii = i; ii > j; ii--)
                cardImage.moveDown();//di chuyen xuong lop sau

            this.cardLayer.draw();
        } catch (e) { }
    }

    Phom.prototype.getCurrentPlayer = function () {
        if(account)
            return this.getPlayerByAccountId(account.AccountID);

        return {};
    }

    Phom.prototype.getPlayerByAccountId = function (accountId) {
        return this.playerLayer.get('#player' + accountId)[0];
    }

    Phom.prototype.showResult = function (sessionResult) {
        console.info('Kết quả: ', sessionResult);

        this.phomResultLayer.show(sessionResult);

        $('#gameButton button').hide();
        $('#gameButton button#endGame').show();

        //sau 5s tu dong dong cua so hien thi ket qua
        this.closeResultTimeout = setTimeout(function () {
            that.endGame();
        }, 5000);
    }

    Phom.prototype.endGame = function () {
        if (!roomModel || !roomModel.IsPlaying)
            return;

        if (this.closeResultTimeout) {
            clearTimeout(this.closeResultTimeout);
            delete this.closeResultTimeout;
        }

        roomModel.IsPlaying = false;

        selectedCards = {};
        gameCards = [];

        this.phomResultLayer.clear();
        this.deckCards.clear();

        this.cardLayer.get('Group').each(function (shape, i) {
            shape.destroyChildren();
        });
        this.cardLayer.draw();

        $('#gameButton button#endGame').hide();
    }

    Phom.prototype.startTimer = function (accountId, time, allowActions) {
        console.log('Người chơi tiếp theo Id=' + accountId + ', thời gian đếm ngược: ' + time + 's, Actions=' + allowActions);

        $('#gameButton button').hide();
        if (currentPlayer && currentPlayer.Status === Player.PlayerStatus.INGAME_PLAYER)
            $('#gameButton button#sortCards').show();

        var player = this.getPlayerByAccountId(accountId),
            timerPosition = Deck.playerPosition[0];
        if (player) {
            timerPosition = { x: player.getX(), y: player.getY() };
        }
        this.timer.clearTimer();
        this.timer.setPosition(timerPosition);

        if (accountId != account.AccountID) {
            this.timer.startTimer(time, time, function () { });

            if (allowActions && allowActions[0] == Phom.PhomActionName.START_GAME) {
                $('#message').html('Đang chờ bắt đầu');
                $('#gameButton button#sortCards').hide();
            }
        }
        else {
            function showButton(allowActions, show) {
                for (var ii = 0; ii < allowActions.length; ii++) {
                    var action = allowActions[ii];
                    if (show) {
                        //start game
                        if (action == Phom.PhomActionName.START_GAME) {
                            $('#startGame').show();
                            $('#gameButton button#sortCards').hide();
                        }
                            //boc bai
                        else if (action == Phom.PhomActionName.BOC_BAI) {
                            $('#gameButton button#getCard').show();
                        }
                            //an bai
                        else if (action == Phom.PhomActionName.AN_BAI) {
                            $('#gameButton button#eatCard').show();
                        }
                            //danh bai
                        else if (action == Phom.PhomActionName.DANH_BAI) {
                            $('#gameButton button#dropCard').show();
                        }
                            //ha bai
                        else if (action == Phom.PhomActionName.HA_BAI) {
                            that.getCurrentPlayer().enableDragCard(true);
                            $('#gameButton button#downCards').show();
                            $('#gameButton button#downCardsAuto').show();
                        }
                            //ky gui
                        else if (action == Phom.PhomActionName.KY_GUI) {
                            $('#gameButton button#sendCards').show();
                        }
                            //u
                        else if (action == Phom.PhomActionName.U_THUONG || action == Phom.PhomActionName.U_KHAN) {
                            if (action == Phom.PhomActionName.U_KHAN)
                                $('#gameButton button#u').html('Ù KHAN');
                            else
                                $('#gameButton button#u').html('Ù');
                            $('#gameButton button#u').show();
                        }
                    }
                    else {
                        //start game
                        if (action == Phom.PhomActionName.START_GAME) {
                            $('#startGame').hide();
                        }
                            //boc bai
                        else if (action == Phom.PhomActionName.BOC_BAI) {
                            $('#gameButton button#getCard').hide();
                        }
                            //an bai
                        else if (action == Phom.PhomActionName.AN_BAI) {
                            $('#gameButton button#eatCard').hide();
                        }
                            //danh bai
                        else if (action == Phom.PhomActionName.DANH_BAI) {
                            $('#gameButton button#dropCard').hide();
                        }
                            //ha bai
                        else if (action == Phom.PhomActionName.HA_BAI) {
                            $('#gameButton button#downCards').hide();
                            $('#gameButton button#downCardsAuto').hide();
                        }
                            //ky gui
                        else if (action == Phom.PhomActionName.KY_GUI) {
                            $('#gameButton button#sendCards').hide();
                        }
                            //u
                        else if (action == Phom.PhomActionName.U_THUONG || action == Phom.PhomActionName.U_KHAN) {
                            $('#gameButton button#u').hide();
                        }
                    }
                }
            }

            this.timer.startTimer(time, time, function () {
                console.log('Timeout client');
                if (phomHub.connection.state != $.signalR.connectionState.connected)
                    return;

                showButton(allowActions, false);

                phomHub.server.autoPlay().done(function (result) {
                    console.log('Kết quả timeout client: ', result);
                }).fail(invokeHubFail);
            });

            showButton(allowActions, true);
        }
    }

    Phom.prototype.synchronizeTimer = function (totalTime, elapseTime, accountId, allowActions) {
        if (typeof this.timer.timerInterval == 'undefined')
            this.startTimer(accountId, totalTime, allowActions);

        this.timer.setCounter(totalTime, elapseTime);
    }

    Phom.prototype.stopTimer = function () {
        $('#gameButton button').hide();
        this.timer.clearTimer();
    }

    Phom.PhomActionName = {
        START_GAME: 1000,
        BOC_BAI: 0,
        AN_BAI: 1,
        DANH_BAI: 2,
        HA_BAI: 3,
        KY_GUI: 4,
        U_THUONG: 5,
        U_KHAN: 6
    }

    window.Phom = Phom;
})(window);