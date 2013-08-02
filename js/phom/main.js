    function clearPingTimeout() {
        if (App.pingTimeout)
            clearTimeout(App.pingTimeout);
    }
    function setPingTimeout() {
        clearPingTimeout();

        App.pingTimeout = setTimeout(function () {
            var timeStart = new Date().getTime();
            try {
                phomHub.server.pong(timeStart).done(function (ping) {
                    if (ping) {
                        var timeEnd = new Date().getTime();
                        //console.log('ping:', (timeEnd - timeStart), 'ms');
                        $('#status').html((timeEnd - timeStart) + 'ms');
                    }

                    setPingTimeout();
                });
            } catch (e) {
                Util.showMessage('Bạn bị mất kết nối. Nhấn F5 hoặc Refresh để tải lại.', {
                    close: false
                });
            }
        }, 10000); //ping 10s
    }
    function clearAjaxPingTimeout() {
        if (App.pingAjaxTimeout)
            clearTimeout(App.pingAjaxTimeout);
    }
    function setAjaxPingTimeout() {
        clearAjaxPingTimeout();

        App.pingAjaxTimeout = setTimeout(function () {
            $.support.cors = true;
            $.ajax({
                cache: false,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                crossDomain: true,
                dataType: "json",
                url: BASE_URL + '/api/Authen/CheckAuthenticated',
                success: function (isAuthen) {
                    if (isAuthen) {
                        setPingTimeout();
                    } else {
                        AccountInfo.showLoginForm(true);
                    }
                }
            });
        }, 60000); //60s
    }

    function preStartHub() {
        //$.connection.hub.logging = true;
        $.connection.hub.stateChanged(function (change) {
            if (change.newState === $.signalR.connectionState.connecting) {
                console.info('connecting');
                $('#connectionButton button#leaveroom').hide();
                $('#joinroom').hide();
                Util.showMessage('Đang kết nối máy chủ...', { close: false, bg: false });
            }
            else if (change.newState === $.signalR.connectionState.reconnecting) {
                console.info('reconnecting');
                $('#connectionButton button#leaveroom').hide();
                $('#joinroom').hide();
                Util.showMessage('Đang kết nối lại máy chủ...', { close: false, bg: false });
            }
            else if (change.newState === $.signalR.connectionState.connected) {
                console.info('connected');
                $('#connectionButton button#leaveroom').hide();
                $('#joinroom').show();

                Util.hideMessage();

                setPingTimeout();
                setAjaxPingTimeout();

                if(App.refreshInterval)
                    clearInterval(App.refreshInterval);

                Util.Cookie.createCookie('retrycount', 0);
            }
            else if (change.newState === $.signalR.connectionState.disconnected) {
                console.info('disconnected');

                clearPingTimeout();
                clearAjaxPingTimeout();

                if (roomModel != null) {
                    App.leaveGame();
                }

                $('#connectionButton button#leaveroom').hide();
                $('#joinroom').hide();

                Util.showMessage('Bạn bị mất kết nối. Nhấn OK để kết nối lại.', {
                    close: true,
                    onClose: function () {
                        roomModel = null;
                    },
                    ok: 'Kết nối',
                    onOK: function () {
                        restartHub();
                    }
                });
            }
        });
        $.connection.hub.connectionSlow(function () {
            console.log('Connection Slow.')
            //App.getCurrentPlayer().updateConnectionStatus('slow');
        });
        $.connection.hub.error(function (error) {
            console.error('SignalR error: ', error);
            
            var retrycount = Util.Cookie.readCookie('retrycount');

            if (!retrycount) {
                retrycount = 0;
            };
            if (retrycount > 5)
                return;

            var refreshTimeout = (retrycount + 1) * 10,
                timeCount = 0;

            App.refreshInterval = window.setInterval(function () {
                timeCount++;

                Util.showMessage('Bạn bị mất kết nối. Tải lại sau ' + (refreshTimeout-timeCount) + 's', {
                    close: false
                });

                if (timeCount == refreshTimeout) {
                    clearInterval(App.refreshInterval);
                    Util.Cookie.createCookie('retrycount', retrycount + 1);
                    window.location.reload(false);
                }
            }, 1000);
        });
    }

    function invokeHubFail(error) {
        console.log(error);
    }

    function restartHub(done) {
        $.connection.hub.start({ transport: transports , jsonp: true}).fail(invokeHubFail);
    }

    function startHub() {
        if(account)
            $.connection.hub.qs = { 'accountId': account.AccountID };
        $.connection.hub.start({ transport: transports ,jsonp: true}).done(afterStartHub).fail(invokeHubFail);
    }

    function afterStartHub() {
        $('#joinroom').click(function () {
            $('#joinroom').hide();
            Util.showMessage('Đang vào phòng chơi...', { close: false, bg: false });

            phomHub.server.playNow().done(function (roomId) {
            }).fail(invokeHubFail);
        });

        $('#leaveroom').click(function () {
            var msg = 'Bạn có thực sự muốn thoát khỏi bàn chơi?';
            if (roomModel && roomModel.IsPlaying && currentPlayer && currentPlayer.Status === Player.PlayerStatus.INGAME_PLAYER)
                msg = 'Bạn đang chơi dở ván, bạn có muốn đăng ký rời phòng và đợi đến cuối ván?';
            Util.showMessage(msg, {
                ok: true,
                onOK: function () {
                    $('#leaveroom').hide();
                    if (!(roomModel && roomModel.IsPlaying && currentPlayer && currentPlayer.Status === Player.PlayerStatus.INGAME_PLAYER))
                        Util.showMessage('Bạn đang rời phòng...', { close: false, bg: false });

                    phomHub.server.leaveGame().done(function (isLeft) {
                        //da roi phong choi
                        if (isLeft) {
                            Util.hideMessage();
                        }
                    }).fail(invokeHubFail);
                },
                cancel: true
            });
        });

        $('#startGame').click(function () {
            $('#startGame').hide();
            Util.showMessage('', { close: false, bg: false });
            phomHub.server.startGame().done(function (isStarted) {
                if (isStarted)
                    Util.hideMessage();
                else {
                    Util.showMessage('Có lỗi khi bắt đầu chơi, mời bạn thử lại.', { timeout: 30 });
                    $('#startGame').show();
                }
            }).fail(invokeHubFail);
        });

        $('#dropCard').click(function () {
            if (Object.keys(selectedCards).length === 0) {
                Util.showMessage('Bạn cần chọn 1 quân bài', {ok: true, timeout: 5});
                return;
            }
            if (Object.keys(selectedCards).length > 1) {
                Util.showMessage('Bạn phải chỉ được chọn 1 quân bài', { ok: true, timeout: 3 });
                return;
            }
            $('#dropCard').hide();
            var cardValue = Object.keys(selectedCards)[0];
            phomHub.server.danhBai(cardValue).done(function (returnCardValue) {
                if (returnCardValue == -3) {
                    Util.showMessage('Không được đánh quân bài mà bạn đã ăn.', { ok: true, timeout: 3 });
                    $('#dropCard').show();
                    return;
                } else if (returnCardValue == -2) {
                    Util.showMessage('Chưa tới lượt bạn đánh bài, bạn hãy chờ tới lượt.', { ok: true, timeout: 3 });
                    $('#dropCard').show();
                    return;
                } else if (returnCardValue < 0) {
                    Util.showMessage('Có lỗi đánh bài, hãy thử lại.', { ok: true, timeout: 3 });
                    $('#dropCard').show();
                    return;
                }

                console.log(account.UserName + ' đánh bài, ' + returnCardValue);
            }).fail(invokeHubFail);
        });

        $('#getCard').click(function () {
            $('#getCard').hide();
            phomHub.server.bocBai().done(function (returnValue) {
                console.log(account.UserName + ' bốc bài, ' + returnValue);
            }).fail(invokeHubFail);
        });

        $('#eatCard').click(function () {
            $('#eatCard').hide();
            phomHub.server.anBai().done(function (returnCardValue) {
                if (returnCardValue == -2) {
                    Util.showMessage('Chưa tới lượt bạn, bạn hãy chờ tới lượt.', { ok: true, timeout: 3 });
                    $('#eatCard').show();
                    return;
                } else if (returnCardValue < 0) {
                    Util.showMessage('Có lỗi ăn bài, hãy thử lại.', { ok: true, timeout: 3 });
                    $('#eatCard').show();
                    return;
                }

                console.log(account.UserName + ' ăn bài');
            }).fail(invokeHubFail);
        });

        $('#downCardsAuto').click(function () {
            $('#downCardsAuto').hide();

            App.getCurrentPlayer().enableDragCard(false);
            phomHub.server.haBai().done(function (PhomSession) {
                if(PhomSession)
                    console.log(account.UserName + ' hạ bài, tự động:', PhomSession);
                else
                    $('#downCardsAuto').show();
            }).fail(invokeHubFail);
        });

        $('#downCards').click(function () {
            $('#downCards').hide();
            //nguoi choi chon quan bai de ha bai thi phai chon it nhat 3 quan
            if (Object.keys(selectedCards).length < 3) {
                Util.showMessage('Bạn phải chọn ít nhất 3 quân bài', { ok: true, timeout: 3 });
                $('#downCards').show();
                return;
            }

            App.getCurrentPlayer().enableDragCard(false);
            phomHub.server.haBaiInHand(Object.keys(selectedCards)).done(function (PhomPlayer) {
                console.log(account.UserName + ' hạ bài, phỏm người chơi chọn:', PhomPlayer);
            }).fail(invokeHubFail);
        });

        $('#u').click(function () {
            $('#u').hide();
            phomHub.server.uThuong().done(function (HandCards) {
                console.log(account.UserName + ' ủ, bài trên tay:', HandCards);

                if (HandCards && HandCards.length == 1)
                    phomHub.server.danhBai(HandCards[0].OrdinalValue);
            }).fail(invokeHubFail);
        });

        $('#sortCards').click(function () {
            $('#sortCards').hide();
            phomHub.server.sortHandCards().done(function (listCard) {
                if (listCard) {
                    console.log(account.UserName + ' xếp bài', listCard);
                    App.getCurrentPlayer().sortHandCards(listCard);
                }

                $('#sortCards').delay(1500).show();
            }).fail(invokeHubFail);
        });

        $('#endGame').click(function () {
            App.endGame();
        });
    }

    function stopHub() {
        $.connection.hub.stop();
    }

    var transports = ["webSockets"];
    var sources = {
        ban: 'bg_ban1.png',
        bg_ac: 'bg_ac1.png',
        bai: 'cards_88x120.png',
        bai_up: 'bai1.png',
        avatar1: 'av11.jpg',
        avatar2: 'av2.jpg',
        avatar3: 'av3.jpg',
        avatar4: 'av4.jpg',
        avatar5: 'av5.jpg',
        avatar6: 'av6.jpg',
        avatar7: 'av7.jpg',
        avatar8: 'av8.jpg',
        avatar9: 'av9.jpg',
        ghe_trong: 'av10.jpg',
        disconnect: 'offline.png',
        leaving_room: 'leave_room.png',
        bg_menu: 'bg_menu2.png',
        bg_popup: 'bg_popup.png',
        ok: 'dongy.png',
        ok_hover: 'dongy_r.png',
        cancel: 'huy.png',
        cancel_hover: 'huy_r.png'
    };

    var account = {},
        roomModel = {},
        currentPlayer = {};

    var images = {};

    var App = new Phom(),
        gameCards = [],
        selectedCards = {};

    images = Util.loadImages(sources, images);

    $(document).ready(function () {
        $(window).resize(onResize);
        $(window).trigger('resize');

        preStartHub();
        AccountInfo.checkAuthen();

        $('#login').click(function () {
            AccountInfo.login();
        });

        $('#logout').click(function () {
            Util.showMessage('Bạn có muốn đăng xuất?', {
                ok: true,
                onOK: function () {
                    AccountInfo.logout();
                },
                cancel: true
            });
        });
    });
