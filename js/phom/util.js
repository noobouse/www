(function (window) {
    var Util = function () {
    };

    Util.showMessage = function (msg, options) {
        var cover = $('.cover'),
            thongbao = $('.div_thongbao');

        if (!options)
            options = {};

        cover.show();
        thongbao.html('');

        if (typeof options.bg == 'undefined' || options.bg)
            thongbao.append($('<div class="p_thongbao"/>').append($('<p/>').text(msg)));
        else
            thongbao.append($('<div class="p_thongbao no_bg"/>').append($('<p/>').text(msg)));

        if (typeof options.close == 'undefined' || options.close) {
            thongbao.append('<div class="nut_close"><button class="button1 n_close"></button></div>');

            var nutClose = $('.n_close');
            nutClose.focus();

            $(document).keydown(function (event) {
                if (event.which == 27) {
                    nutClose.click();
                    event.preventDefault();
                }
            });

            nutClose.click(function () {
                Util.hideMessage();

                if (typeof options.onClose == 'function')
                    options.onClose();
            });
        }

        if (options.ok) {
            if (options.ok == true)
                options.ok = 'OK';

            thongbao.append('<div class="nut_ok"><button class="button1 n_ok">' + options.ok + '</button></div>');

            var nutOk = $('.n_ok');
            nutOk.focus();

            nutOk.click(function () {
                Util.hideMessage();

                if (typeof options.onOK == 'function')
                    options.onOK();
            });
        }

        if (options.cancel) {
            if (options.cancel == true)
                options.cancel = 'Cancel';

            thongbao.append('<div class="nut_cancel"><button class="button1 n_cancel">' + options.cancel + '</button></div>');

            var nutCancel = $('.n_cancel');

            nutCancel.click(function () {
                Util.hideMessage();

                if (typeof options.onCancel == 'function')
                    options.onCancel();
            });
        }

        if (options.timeout && options.timeout > 0) {
            Util.timeout = setTimeout(function () {
                Util.hideMessage();

                if (typeof options.onClose == 'function')
                    options.onClose();
            }, options.timeout * 1000);
        }
    }

    Util.hideMessage = function () {
        var cover = $('.cover'),
            thongbao = $('.div_thongbao');

        cover.hide();
        thongbao.html('');
        $(document).off('keydown');

        if (Util.timeout) {
            clearTimeout(Util.timeout);
            delete Util.timeout;
        }
    }

    Util.Cookie = function(){};

    Util.Cookie.createCookie = function(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
    }

    Util.Cookie.readCookie =  function (name) {
        var nameEQ = escape(name) + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
        }
        return null;
    }

    Util.Cookie.eraseCookie =  function (name) {
        createCookie(name, "", -1);
    }

    Util.loadImages = function (sources, images) {
        var assetDir = 'img/';

        if (!images)
            images = {};

        for (var src in sources) {
            images[src] = new Image();
            images[src].src = assetDir + sources[src];
        }
        return images;
    }

    window.Util = Util;
})(window);