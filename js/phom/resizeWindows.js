(function (exports) {
    var tt = {};
    bt = { width: 1024, height: 768, margin: .1, minScale: .2, maxScale: 1};
    tt.wrapper = $('.container');
    tt.wrap = $('.container #wrap');
    tt.content = $('.container #content')[0];
    tt.div_thongbao = $('.div_thongbao')[0];

    exports.onResize = function () {
        var e = document.documentElement.clientWidth || window.innerWidth || document.body.clientWidth,
            t = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
        var n = bt.width,
            r = bt.height;

        xt = Math.min(e / n, t / r),
        xt = Math.max(xt, bt.minScale),
        xt = Math.min(xt, bt.maxScale);

        tt.wrapper.attr('style', 'background-size:auto ' + (xt * bt.height) + 'px');
        tt.wrap.attr('style', 'width:' + (xt * n) + 'px; height: ' + (xt * r) + 'px;');

        if (void 0 === tt.content.style.zoom || navigator.userAgent.match(/(msie|opera|iphone|ipod|ipad|android)/gi)) {
            var o = "translate(-50%, -50%) scale(" + xt + ") translate(50%, 50%)";

            tt.content.style.WebkitTransform = o,
                tt.content.style.MozTransform = o,
                tt.content.style.msTransform = o,
                tt.content.style.OTransform = o,
                tt.content.style.transform = o;

            tt.div_thongbao.style.WebkitTransform = o,
                tt.div_thongbao.style.MozTransform = o,
                tt.div_thongbao.style.msTransform = o,
                tt.div_thongbao.style.OTransform = o,
                tt.div_thongbao.style.transform = o;
            tt.div_thongbao.style.width = (xt * bt.width) + 'px';
        }
        else {
            tt.content.style.zoom = xt;
            tt.div_thongbao.style.zoom = xt;
        }

        try {
            App.stage.setWidth(xt * bt.width);
            App.stage.setHeight(xt * bt.height);
            App.stage.setScale(xt, xt);
            App.stage.draw();
        } catch (e) { }
    }
})(this);
