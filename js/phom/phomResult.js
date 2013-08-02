(function () {
    Kinetic.PhomResult = function (config) {
        Kinetic.Layer.call(this, config);
    };

    Kinetic.PhomResult.prototype = {
        show: function (sessionResult) {
            var bg = new Kinetic.Rect({ fill: '#000', opacity: 0.7, width: 1024, height: 768, x: 0, y: 0 });

            var rect = new Kinetic.Rect({ cornerRadius: 10, fill: '#000', stroke: '#fff', opacity: 0.6, strokeWidth: 2, width: 600, height: 500, x: 212, y: 134 });
            var title = new Kinetic.Text({ text: 'Kết quả', fontSize: 48, fontStyle: 'bold', align: 'center', fill: '#fff', width: 600, x: 212, y: 140 });

            this.add(bg);
            this.add(rect);
            this.add(title);
            this.add(new Kinetic.Text({ text: '# | Người chơi | Kết quả | Điểm | Số tiền', fontSize: 24, fill: '#fff', width: 600, x: 212 + 30, y: 210 }));

            var that = this,
                results = sessionResult.PhomResultList;
            _.each(results, function (result, idx) {
                var textResult,
                    stt = idx + 1,
                    username = result.Username,
                    ketqua = '',
                    diem = '';

                //van u
                if(sessionResult.ResultFamily == 2) {
                    //player U
                    if (result.ResultFamily == 2) {
                        ketqua = 'Ù    ';
                    }
                } else {
                    //mom
                    if (result.ResultFamily == 0) {
                        ketqua = 'Móm  ';
                        if (stt == 1) {
                            ketqua = 'Nhất';
                            diem = 'Móm';
                        }
                    }
                    else {
                        if (stt == 1)
                            ketqua = 'Nhất';
                        else if (stt == 2)
                            ketqua = 'Nhì ';
                        else if (stt == 3)
                            ketqua = 'Ba  ';
                        else
                            ketqua = 'Bét ';

                        diem = result.Score;
                    }
                }
                textResult = stt + ' | ' + username + ' | ' + ketqua + ' | ' + diem;
                that.add(new Kinetic.Text({ text: textResult, fontSize: 24, fill: '#fff', width: 600, x: 212 + 30, y: 210 + 40 * stt }));

                //hien thi thang/thua cua player hien tai
                if (account && result.AccountId == account.AccountID) {
                    that.add(new Kinetic.Text({ text: ketqua, fontSize: 95, fill: '#fff', align: 'center', width: 600, x: 212, y: 300, opacity: 0.3 }));
                }
            });

            this.draw();
        },

        clear: function () {
            this.destroyChildren();
            this.draw();
        }
    };

    Kinetic.Util.extend(Kinetic.PhomResult, Kinetic.Layer);
})();
