(function (window) {
    var lineWidth = 5,
        width = 119 + lineWidth,
        height = 179 + lineWidth,
        cornerRadius = 12,
        horizLineLength = width - cornerRadius * 2,
        vertLineLength = height - cornerRadius * 2;

    var Timer = function (layer) {
        this._init(layer);
    };

    Timer.prototype = {
        layer: null,
        canvas: null,
        ctx: null,

        scale: { x: 1, y: 1 },
        position: { x: 0, y: 0 },
        lineWidth: 0,
        horizLineLength: 0,
        vertLineLength: 0,
        cornerRadius: 0,

        callback: null,
        totalTime: 0,
        currentTimer: 0,

        fps: 20, //frame per second
        delayTime: 50, // 1000ms/fps

        _init: function (layer) {
            this.layer = layer;

            this.canvas = this.layer.getCanvas();
            this.ctx = this.layer.getContext();
        },

        clearCanvas: function () {
            if (!this.ctx)
                return;
            // clear the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        drawPercentRect: function (percent) {
            if(this.layer.getStage())
                this.scale = this.layer.getStage().getScale();

            this.lineWidth = lineWidth * this.scale.x;
            this.horizLineLength = horizLineLength * this.scale.x,
            this.vertLineLength = vertLineLength * this.scale.y,
            this.cornerRadius = cornerRadius * this.scale.x;

            // calc some lengths for use in percent complete
            var offsetX = this.position.x * this.scale.x - this.lineWidth / 2,
                offsetY = this.position.y * this.scale.y - this.lineWidth / 2,
                cornerLength = 2 * this.cornerRadius * Math.PI / 4,
                totalLength = cornerLength * 4 + this.horizLineLength * 2 + this.vertLineLength * 2,

            // calc at what accumulated length each part of the rect starts
                startT = 0,
                startTR = startT + this.horizLineLength,
                startR = startTR + cornerLength,
                startBR = startR + this.vertLineLength,
                startB = startBR + cornerLength,
                startBL = startB + this.horizLineLength,
                startL = startBL + cornerLength,
                startTL = startL + this.vertLineLength,

            // percent expressed as a length-traveled-along-rect
                accumLength = percent / 1000 * totalLength,
                x1, y1, x2, y2, x, y, start, end;

            if (!this.ctx)
                return;

            this.clearCanvas();
            if (percent <= 0 || percent > 1000) {
                return;
            }

            this.ctx.lineWidth = this.lineWidth;

            if (percent / 10 < 25)
                this.ctx.strokeStyle = '#00EE00';
            else if (percent / 10 < 50)
                this.ctx.strokeStyle = '#66EE00';
            else if (percent / 10 < 65)
                this.ctx.strokeStyle = '#CC9900';
            else if (percent / 10 < 75)
                this.ctx.strokeStyle = '#EE6600';
            else if (percent / 10 < 85)
                this.ctx.strokeStyle = '#EE3300';
            else
                this.ctx.strokeStyle = '#FE0000';

            // top line
            var d = accumLength - startT;
            d = Math.min(d, this.horizLineLength);
            if (d > 0) {
                x1 = offsetX + this.cornerRadius;
                y1 = offsetY;
                x2 = offsetX + this.cornerRadius + d;
                y2 = offsetY;
                this.drawLine(x1, y1, x2, y2);
            }

            // top-right corner
            d = accumLength - startTR;
            d = Math.min(d, cornerLength);
            if (d > 0) {
                x = offsetX + this.cornerRadius + this.horizLineLength;
                y = offsetY + this.cornerRadius;
                start = -Math.PI / 2;
                end = -Math.PI / 2 + (d / cornerLength * Math.PI / 2);
                this.drawCorner(x, y, this.cornerRadius, start, end);
            }

            // right line
            d = accumLength - startR;
            d = Math.min(d, this.vertLineLength);
            if (d > 0) {
                x1 = offsetX + this.cornerRadius + this.horizLineLength + this.cornerRadius;
                y1 = offsetY + this.cornerRadius;
                x2 = offsetX + this.cornerRadius + this.horizLineLength + this.cornerRadius;
                y2 = offsetY + this.cornerRadius + d;
                this.drawLine(x1, y1, x2, y2);
            }

            // bottom-right corner
            d = accumLength - startBR;
            d = Math.min(d, cornerLength);
            if (d > 0) {
                x = offsetX + this.cornerRadius + this.horizLineLength;
                y = offsetY + this.cornerRadius + this.vertLineLength;
                start = 0;
                end = (d / cornerLength) * Math.PI / 2;
                this.drawCorner(x, y, this.cornerRadius, start, end);
            }

            // bottom line
            d = accumLength - startB;
            d = Math.min(d, this.horizLineLength);
            if (d > 0) {
                x1 = offsetX + this.cornerRadius + this.horizLineLength;
                y1 = offsetY + this.cornerRadius + this.vertLineLength + this.cornerRadius;
                x2 = offsetX + this.cornerRadius + this.horizLineLength - d;
                y2 = offsetY + this.cornerRadius + this.vertLineLength + this.cornerRadius;
                this.drawLine(x1, y1, x2, y2);
            }

            // bottom-left corner
            d = accumLength - startBL;
            d = Math.min(d, cornerLength);
            if (d > 0) {
                x = offsetX + this.cornerRadius;
                y = offsetY + this.cornerRadius + this.vertLineLength;
                start = Math.PI / 2;
                end = Math.PI / 2 + (d / cornerLength) * Math.PI / 2;
                this.drawCorner(x, y, this.cornerRadius, start, end);
            }

            // left line
            d = accumLength - startL;
            d = Math.min(d, this.vertLineLength);
            if (d > 0) {
                x1 = offsetX;
                y1 = offsetY + this.cornerRadius + this.vertLineLength;
                x2 = offsetX;
                y2 = offsetY + this.cornerRadius + this.vertLineLength - d;
                this.drawLine(x1, y1, x2, y2);
            }

            // top-left corner
            d = accumLength - startTL;
            d = Math.min(d, cornerLength);
            if (d > 0) {
                x = offsetX + this.cornerRadius;
                y = offsetY + this.cornerRadius;
                start = Math.PI;
                end = Math.PI + (d / cornerLength) * Math.PI / 2;
                this.drawCorner(x, y, this.cornerRadius, start, end);
            }
        },

        drawLine: function (x1, y1, x2, y2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        },

        drawCorner: function (x, y, cornerRadius, start, end) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cornerRadius, start, end, false);
            this.ctx.stroke();
        },

        setCounter: function (totalTime, elapseTime) {
            this.totalTime = totalTime;
            this.startTime = (new Date()).getTime() - (totalTime - elapseTime) * 1000; //lay thoi gian moc bat dau timer = thoi gian hien tai theo ms - (tong so giay - so giay con lai) * 1000ms
        },

        startTimer: function (totalTime, elapseTime, callback) {
            var that = this;

            if (typeof totalTime == 'undefined' || totalTime <= 0)
                return;

            if (typeof elapseTime == 'undefined' || elapseTime < 0 || elapseTime > totalTime)
                elapseTime = totalTime;

            that.delayTime = (1000 / that.fps);
            that.totalTime = totalTime;
            that.currentTimer = (totalTime - elapseTime) * 1000 / that.totalTime;

            that.startTime = (new Date()).getTime() - (totalTime - elapseTime) * 1000; //lay thoi gian moc bat dau timer = thoi gian hien tai theo ms - (tong so giay - so giay con lai) * 1000ms

            if (!this.canvas)
                return;

            if (!this.ctx)
                return;

            if (callback)
                this.callback = callback;

            this.timerInterval = setInterval(function () {

                if (that.currentTimer > 1000 + that.delayTime) {
                    if (that.callback) {
                        that.callback();
                    }

                    that.clearTimer();
                    return;
                }

                that.currentTimer = ((new Date()).getTime() - that.startTime) / that.totalTime;
                that.drawPercentRect(that.currentTimer);
            }, that.delayTime);
        },

        clearTimer: function () {
            try {
                this.clearCanvas();
                clearInterval(this.timerInterval);

                this.totalTime = 0;
                this.currentTimer = 0;

                delete this.timerInterval;
                delete this.callback;
            } catch (e) {
                console.warn('Timer canvas error');
            }

        },

        setPosition: function (position) {
            this.position = position;
        },

        destroy: function () {
            this.clearTimer();
        }
    };

    //Kinetic.Util.extend(Timer, Kinetic.Layer);

    window.Timer = Timer;
})(window);
