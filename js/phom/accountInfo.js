(function (window) {
    var AccountInfo = function () {
    }

    AccountInfo.showMessage = function (msg, options) {
        if (!options)
            options = {};

        options.onClose = function () {
            $('#loginForm input#username').focus();
        }

        Util.showMessage(msg, options);
    }

    AccountInfo.hideMessage = function () {
        Util.hideMessage();
    }

    AccountInfo.showLoginForm = function (show) {
        AccountInfo.hideMessage();

        if (show) {
            $('#loginForm').show();
            $('#loginForm input#username').focus();
            $('#loginForm input').keydown(function (event) {
                if (event.which == 13) {
                    AccountInfo.login();
                    event.preventDefault();
                }
            });
        } else {
            $('#loginForm').hide();
            $('#loginForm input').off('keydown')
        }
    }

    AccountInfo.checkAuthen = function () {
        AccountInfo.showMessage('Đang kết nối...', { close: false, bg: false });

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
                    AccountInfo.loggedIn();
                    AccountInfo.getAccountInfo();
                } else {
                    AccountInfo.showLoginForm(true);
                }
            },
            error: function () {
                AccountInfo.showLoginForm(true);
            }
        });
    }

    AccountInfo.login = function () {
        account.UserName = $('#username').val();
        account.Password = $('#password').val();

        if (account.UserName == null || account.UserName == '') {
            AccountInfo.showMessage('Bạn phải nhập vào tên tài khoản.');
            return;
        }
        if (account.UserName.length < 3) {
            AccountInfo.showMessage('Tên tài khoản phải dài ít nhất 3 ký tự. Mời bạn nhập lại.');
            return;
        }

        if (account.Password == null || account.Password == '') {
            AccountInfo.showMessage('Bạn phải nhập vào mật khẩu.');
            return;
        }
        if (account.Password.length < 6) {
            AccountInfo.showMessage('Mật khẩu phải dài ít nhất 6 ký tự. Mời bạn nhập lại.');
            return;
        }

        AccountInfo.showMessage('Đang đăng nhập...', {close: false, bg: false});

        $.support.cors = true;
        $.ajax({
            cache: false,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ username: account.UserName, password: account.Password }),
            crossDomain: true,
            dataType: "json",
            url: BASE_URL + '/api/Authen/login',
            success: function (userData) {
                if (userData && userData != 'null') {
                    AccountInfo.loggedIn();
                    AccountInfo.bindAccountInfo(userData);
                } else {
                    AccountInfo.showMessage('Đăng nhập không thành công. Mời bạn thử lại');
                }
            },
            error: function (err) {
                if (typeof err == 'undefined' || !err.responseText)
                    err.responseText = 'Đăng nhập không thành công. Mời bạn thử lại';
                AccountInfo.showMessage(err.responseText);
            }
        });
    }

    AccountInfo.logout = function logout() {
        AccountInfo.showMessage('Đang đăng xuất...', { close: false, bg: false });

        $.support.cors = true;
        $.ajax({
            cache: false,
            type: "GET",
            crossDomain: true,
            dataType: "json",
            url: BASE_URL + '/api/Authen/logout',
            success: function () {
                AccountInfo.loggedOut();
            },
            error: function (err) {
                AccountInfo.showMessage('Đăng xuất không thành công. Mời bạn thử lại');
            }
        });
    }

    AccountInfo.loggedIn = function () {
        AccountInfo.showLoginForm(false);

        $('#username').val('');
        $('#password').val('');

        $('#connectionButton').show();
        $('#lobby').show();
        $('#canvas').show();
        $('#logout').show();
    }

    AccountInfo.loggedOut = function () {
        stopHub();

        account = {};
        currentPlayer = {};
        roomModel = {};

        $('#connectionButton').hide();
        $('#lobby').hide();
        $('#gameButton button').hide();
        $('#canvas').hide();
        $('#logout').hide();

        var logoutReason = 'Đăng xuất thành công.',
            timeouts = 2;
        if (AccountInfo.logoutReason) {
            logoutReason = AccountInfo.logoutReason;
            timeouts = 0;
            AccountInfo.logoutReason = null;
        }

        AccountInfo.showLoginForm(true);
        AccountInfo.showMessage(logoutReason, { timeout: timeouts });
    }

    AccountInfo.getAccountInfo = function () {
        AccountInfo.showMessage('Kết nối...', { close: false, bg: false });

        $.support.cors = true;
        $.ajax({
            cache: false,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            dataType: "json",
            url: BASE_URL + '/api/Authen/GetAccountInfo',
            success: function (userData) {
                if (userData && userData != 'null') {
                    AccountInfo.bindAccountInfo(userData);
                }
            }
        });
    }

    AccountInfo.bindAccountInfo = function (userData) {
        account = JSON.parse(userData);

        startHub();

        AccountInfo.hideMessage();

        $('#accountLabel').html(account.UserName);
        $('#goldLabel').html(account.Gold);
        $('#starLabel').html(account.Star);
    }

    window.AccountInfo = AccountInfo;
})(window);