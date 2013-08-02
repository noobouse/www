var phomHub = (function (hubConnection) {
    var hub = hubConnection.phomHub;

    if (typeof hub == 'undefined')
        return hub;

    $.extend(hub.client, {
        playerJoin: function (player) {
            App.playerJoin(player);
        },
        playerLeave: function (accountId) {
            App.playerLeave(accountId);
        },
        playerRegisterLeave: function (accountId) {
            App.playerRegisterLeave(accountId);
        },
        playerReconnected: function (accountId) {
            App.playerReconnected(accountId);
        },
        playerDisconnected: function (accountId) {
            App.playerDisconnected(accountId);
        },

        joinGame: function (phomSession, totalTime, elapseTime, accountId, allowActions) {
            App.joinGame(phomSession);

            if (typeof accountId != 'undefined' && accountId > 0)
                App.synchronizeTimer(totalTime, elapseTime, accountId, allowActions);
        },
        leaveGame: function (reason) {
            console.log('leave game reason: ', reason);
            App.leaveGame();
        },
        registerLeaveGame: function () {
            App.registerLeaveGame();
        },

        startGame: function (gameSession) {
            App.startGame(gameSession);
        },

        danhBai: function (handCards, cardValue, accountId) {
            if(typeof accountId == 'undefined' || accountId == account.AccountID)
                App.danhBai(handCards, cardValue);
            else
                App.danhBaiOther(accountId, cardValue);
        },

        bocBai: function (handCards, accountId) {
            if (typeof accountId == 'undefined' || accountId == account.AccountID)
                App.bocBai(handCards);
            else
                App.bocBaiOther(accountId);
        },

        anBai: function (handCards, cardValue, accountId) {
            if (typeof accountId == 'undefined' || accountId == account.AccountID)
                App.anBai(handCards, cardValue);
            else
                App.anBaiOther(accountId, cardValue);
        },

        haBai: function (PhomSession, accountId) {
            if (typeof accountId == 'undefined')
                accountId = account.AccountID;

            if (PhomSession) {
                var playerHaBai;

                if (PhomSession.Players) {
                    for(var i in PhomSession.Players) {
                        var player = PhomSession.Players[i];
                        if (player.AccountID == accountId) {
                            playerHaBai = player;
                            break;
                        }
                    }
                }
                else
                    playerHaBai = PhomSession;


                if (typeof accountId == 'undefined' || accountId == account.AccountID) {
                    App.getCurrentPlayer().haBai(playerHaBai);
                    console.info('Bạn hạ bài: ', playerHaBai);
                }
                else {
                    App.getPlayerByAccountId(accountId).haBai(playerHaBai);
                    console.info(playerHaBai.AccountID + ' hạ bài: ', playerHaBai);
                }
            }
        },

        showResult: function (resultTable) {
            App.showResult(resultTable);
        },

        updateAccount: function (account, money) {
            if (account != null)
            {
                accountId = account.AccountID;
                App.getPlayerByAccountId(accountId).updateAccount(account, money);
            }
        },

        message: function (msg) {
            Util.showMessage(msg, { close: true, ok: true, timeout: 3 });
        },

        startActionTimer: function (accountId, time, allowActions) {
            App.startTimer(accountId, time, allowActions);
        },

        stopActionTimer: function () {
            App.stopTimer();
        },

        synchronizeTimer: function (totalTime, elapseTime, accountId, allowActions) {
            App.synchronizeTimer(totalTime, elapseTime, accountId, allowActions);
        },

        stopHub: function (reason) {
            stopHub();
            if (reason)
                Util.showMessage(reason, { close: false});
        },

        requestSignout: function (reason) {
            AccountInfo.logoutReason = reason;
            AccountInfo.logout();
        },

        forceLogout: function (reason) {
            AccountInfo.logoutReason = reason;
            AccountInfo.loggedOut();
        }
    });

    return hub;
}) ($.connection);