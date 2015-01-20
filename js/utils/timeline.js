/**
 * @class
 * @classdesc Main TimeLine Implementation.
 * @param {Object} options - Configuration object for initialization.
 */
var TimeLine = function (options) {
    if (this === window) {
        return new TimeLine(options);
    }
    this.obj = options || {};
    this.mediaInfo = this.obj.mediaInfo || null;
    this.viewObj = this.obj.viewObj;
    this.frameRate = this.obj.frameRate || 25;//帧率
    this.duration = this.obj.duration || 100;//总时长,单位帧
    this.showduration = this.obj.duration || 100;//显示总时长,单位帧 配合缩放使用
    this.zoom = this.obj.zoom || 1;//放大倍数
    this.timelineoffset = this.obj.timelineoffset || 0;//时间线偏移量 单位帧,初始为0,配合放大倍数使用
    this.canvaswidth = 0; //宽
    this.linewidth = 0;   //线长
    this.inpointResize;
    this.outpointResize;
    this.lineInfo;
    this.currentframe = 0;
    this.oncurrentframechange = this.obj.oncurrentframechange;//当前时间线改变事件
    this.oninoutpointchange = this.obj.oninoutpointchange;//打点更改事件
    this.playRangeInpoint = 0;//区间锁定入点
    this.playRangeOutpoint = 0;//区间锁定出点
    this.lockRange = false;//是否区间锁定
    this.sbvideoPlayer;
    this.combineKeyFrame = this.obj.combineKeyFrame || null;
};

TimeLine.prototype = {
    fps: this.frameRate,

    init: function (duration, combineKeyFrame) {
        var self = this;
        this.combineKeyFrame = combineKeyFrame;
        this.duration = duration || this.duration;//frame
        this.showduration = this.duration;//帧数

        this.container = this.obj.container;
        this.drawcanvas();
        window.onresize = function () {
            self.drawcanvas();
        };
    },

    /**
     * 设置时长
     * @return {Number} - Frame number in timeline
     */
    setDuration: function (duration) {
        this.init(duration);
    },
    drawcanvas: function () {
        this.offset = 0;
        //canvas高度： 90px  宽度：1900 (父级宽度(1900px) margin:20px)
        this.canvaswidth = this.container.offsetWidth;
        this.container.innerHTML =
            '<div id="timeLine_bg"></div>'+
            //'<img src="" id="timeLine_bg" alt="" style="width:100%"></img>';
            '<canvas id="timeline" width="' + this.canvaswidth + '" height="90">您的浏览器不支持html5！</canvas>' +
            //当前进度线
            '<div id="currentProgressSpan">' +
            //上面移动显示当前时间或帧数
            '<div class="progressShower"></div>' +
            '<div class="progressCover"></div>' +
            '</div>' +
            '<div id="currentInPointSpan" style="display:none;"><div class="left_btn js_timelinebtn_l"></div><!--<div class="left_line"></div>--></div>' +
            '<div id="currentOutPointSpan" style=" display:none;"><div class="right_btn js_timelinebtn_r"></div><!--<div class="left_line"></div>--></div>';
            
        //绑定进度线移动事件
        this.__bindMove(document.getElementById('currentProgressSpan'));
        //canvas点击进度线移动
        this.__bindCanvasClick(document.getElementById('timeline'), document.getElementById('currentProgressSpan'));

        //打点：入点对象
        this.inpointResize = new InOutPointResize({
                elid: '#currentInPointSpan',
                el: document.getElementById('currentInPointSpan'),
                elDrag: document.getElementsByClassName('js_timelinebtn_l'),
                isright: false,
                canvaswidth: this.canvaswidth,
                offset: this.offset,
                timeline: this
            }
        );

        //打点：出点对象
        this.outpointResize = InOutPointResize({
                elid: '#currentOutPointSpan',
                el: document.getElementById('currentOutPointSpan'),
                elDrag: document.getElementsByClassName('js_timelinebtn_r'),
                isright: true,
                canvaswidth: this.canvaswidth,
                offset: this.offset,
                timeline: this
            }
        );

        //2D绘制时间线刻度
        this.canvas = document.getElementById('timeline');
        this.cont = this.canvas.getContext("2d");
        this.__drawLine();

        //初始化默认合成帧
        //document.getElementById('timeLine_bg').style.background = 'url(' + this.combineKeyFrame + ') repeat-x scroll left center';
        this.setKeyframe(this.combineKeyFrame);
    },
    /**
     * Returns the current frame number
     *
     * @return {Number} - current Frame number
     */
    //获取当前帧数
    getCurrentframe: function () {
        return this.currentframe;
    },
    /**
     * Returns the current frame number TimeCode
     *
     * @return {String} - current Frame number TimeCode
     */
    //获取当前时码
    getTimeCode: function () {
        var tc = new TimeCode({
            duration: this.currentframe,
            frameRate: this.frameRate
        });
        return tc;
    },
    /**
     * Event listener for handling callback execution at double the current frame rate interval
     *
     * @param  {String} format - Accepted formats are: SMPTE, time, frame
     * @param  {Number} tick - Number to set the interval by.
     * @return {Number} Returns a value at a set interval
     */
    listen: function (format, tick) {
        var _timeline = this;
        if (!format) {
            console.log('TimeLine: Error - The listen method requires the format parameter.');
            return;
        }
        this.interval = setInterval(function () {
            if (_timeline.video.paused || _timeline.video.ended) {
                return;
            }
            var frame = ((format === 'SMPTE') ? _timeline.toSMPTE() : ((format === 'time') ? _timeline.toTime() : _timeline.get()));
            if (_timeline.obj.callback) {
                _timeline.obj.callback(frame, format);
            }
            return frame;
        }, (tick ? tick : 1000 / _timeline.frameRate / 2));
    },
    /** Clears the current interval */
    stopListen: function () {
        var _timeline = this;
        clearInterval(_timeline.interval);
    }
};

//设置合成帧
TimeLine.prototype.setKeyframe = function (src) {
    var el = document.getElementById('timeLine_bg');
    el.style.background = 'url(' + src + ') repeat-x scroll';
    el.style.backgroundSize = '100% 45px';
};

//设置缩放比例
TimeLine.prototype.zoomScale = function (zoom) {
    zoom = zoom > 1 ? zoom : 1;
    var linewidth = this.canvas.width - 2 * this.offset-10;//- 60;
    var maxzoom = this.duration * 10 / linewidth;
    zoom = zoom >= maxzoom ? maxzoom : zoom;
    this.zoom = zoom;
    console.log('zoomScale maxzoom:' + maxzoom + ' this.zoom:' + this.zoom);
    this.showduration = this.duration / this.zoom;
    console.log('zoomScale this.showduration:' + this.showduration);
    this.__drawLine();

    return this.zoom;
};

TimeLine.prototype.setOffset = function (offset) {

    this.lineInfo = this.lineInfo || {};
    offset = parseInt(offset);
    offset = offset > 0 ? offset : 0;
    var maxoffset = this.duration - this.showduration;
    offset = offset >= maxoffset ? maxoffset : offset;

    this.timelineoffset = offset;
    console.log("setOffset timelineoffset:" + this.timelineoffset);
    //this.showduration = this.duration - this.offset;
    this.__drawLine();
};

/**
 * Set Cut inpoint outpoint
 * @param {Number} inpoint  - Unit frame.
 * @param {Number} outpoint - Unit frame.
 * @param {Boolean} lockRange - 是否锁定区间.
 */
TimeLine.prototype.setInOutPoint = function (inpoint, outpoint, lockRange) {
    if (inpoint > outpoint) return;
    inpoint = inpoint || 0;
    outpoint = outpoint || this.showduration;

    this.inpointResize.setPointWidth(inpoint);
    this.outpointResize.setPointWidth(outpoint);

    $('#currentInPointSpan').show();
    $('#currentOutPointSpan').show();

    this.playRangeInpoint = inpoint;
    this.playRangeOutpoint = outpoint;
    this.lockRange = lockRange;
    if (this.sbvideoPlayer) {
        this.sbvideoPlayer.seek(inpoint);
    }
};

//清除打点
TimeLine.prototype.cleaInOutPoint = function () {
    $("#currentInPointSpan").hide();
    $('#currentOutPointSpan').hide();
    //this.setInOutPoint(0, 0);
};

//获取打点区间(出入点)
TimeLine.prototype.getInOutPoint = function () {
    var points = {
        inpoint: this.inpointResize.getPoint(),//帧
        outpoint: this.outpointResize.getPoint()
    };
    return points;
};

/**
 * seekTo
 * @param {Number} frame - frame.
 */
//时间线seek
TimeLine.prototype.seekTo = function (frame) {
    this.lineInfo = this.lineInfo || {};
    //超长处理
    frame = frame >= this.duration ? this.duration : frame;

    var offset = this.timelineoffset;
    //超过显示区域处理
    if (frame > this.showduration + this.timelineoffset) {
        offset = frame; //- 5;//最小5帧
    }
    else if (frame < this.timelineoffset) {
        offset = frame; //- 5;
    }

    if (this.lockRange) {

        if (frame < this.playRangeInpoint) {

            frame = this.playRangeInpoint;
            this.sbvideoPlayer.pause();
            this.sbvideoPlayer.seek(frame);
            //播放完毕重置UI
            if (this.sbvideoPlayer.onplayended)
                this.sbvideoPlayer.onplayended.call(this.sbvideoPlayer.viewObj);

            //当前片段播放结束
            if (this.sbvideoPlayer.isstory) {
                this.sbvideoPlayer._storyPlayEnded();
            }
        }
        if (frame > this.playRangeOutpoint) {

            frame = this.playRangeOutpoint;
            this.sbvideoPlayer.pause();
            this.sbvideoPlayer.seek(frame);
            if (this.sbvideoPlayer.onplayended)
                this.sbvideoPlayer.onplayended.call(this.sbvideoPlayer.viewObj);

            if (this.sbvideoPlayer.isstory) {
                this.sbvideoPlayer._storyPlayEnded();
            }
        }
    }

    if (offset != this.timelineoffset) {
        console.log('seekTo timelineoffset:' + this.timelineoffset);
        console.log('seekTo offset:' + offset);
        this.setOffset(offset);
    }
    this.currentframe = frame;
    var el = document.getElementById('currentProgressSpan');
    var left = (frame - this.timelineoffset) / ( this.showduration / this.lineInfo.linewidth);
    left = left > this.lineInfo.linewidth ? this.lineInfo.linewidth : left;
    if (left != 0) {
        left = left + this.offset + Math.ceil(this.lineInfo.parmargin / 2);
    }
    el.style.left = left + 'px';
};

//画时间线
TimeLine.prototype.__drawLine = function () {
    var width = this.canvas.width;
    var height = this.canvas.height;
    var offset = this.offset;           //边距
    var linewidth = width - 2 * offset; //线宽 
    var linemarginleft = width - offset;
    var lineheight = 40;                //线高
    var linemarginbottom = height - offset;

    //计算最佳刻度数字 保证每个个度间距>8像素(parmargin>8)
    var parmargin = this.showduration / linewidth; //帧数/线长(每帧对应像素)
    parmargin = parmargin >= 8 ? parmargin : 10;   //间距
    var totalScale = linewidth / parmargin;        //1900/10=190段

    var lineInfo = {
        linewidth: linewidth,
        linemarginleft: linemarginleft,
        parmargin: parmargin,
        totalScale: totalScale,
        framewidth: linewidth / this.showduration //每帧宽度
    };

    this.inpointResize.setTimelineInfo(lineInfo);
    this.outpointResize.setTimelineInfo(lineInfo);
    this.lineInfo = lineInfo;

    var context = this.cont;
    context.clearRect(0, 0, width, height);
    context.beginPath(); 
    context.moveTo(offset, linemarginbottom); 
    context.lineTo(linemarginleft, linemarginbottom); //底线(1900,90)
    context.lineWidth = 0.3; 
    context.strokeStyle = "#FFF";
    context.lineCap = "square"; //butt：默认，round：圆角，square：直角
    context.font = '10px 微软雅黑';
    context.fillStyle = "#FFF";

    context.stroke();

    for (var i = 0; i <= totalScale; i++) {
        context.moveTo(i * parmargin + offset, linemarginbottom); //(0, 90)
        if (i % 10 == 0) {
            context.lineTo(i * parmargin + offset, height - (lineheight * 3 / 4 + offset)); //(0, 60)

            var showframes = i * (this.showduration / totalScale) + this.timelineoffset;
            var tc = new TimeCode({
                frames: showframes,//当前帧
                frameRate: this.frameRate
            });
            var showtext = Math.round(tc.frames);//tc.toSMPTE();

            context.fillText(showtext, i * parmargin + offset, height - (lineheight * 3 / 4 + offset));
        } else if (i % 5 == 0) {
            context.lineTo(i * parmargin + offset, height - (lineheight * 2 / 4 + offset)); 
        } else {
            context.lineTo(i * parmargin + offset, height - (lineheight * 1 / 4 + offset)); 
        }
    }
    context.stroke(); 

    if (this.lockRange) {
        this.setInOutPoint(this.playRangeInpoint, this.playRangeOutpoint, this.lockRange);
    }
};

//canvas点击进度线跳转当前
TimeLine.prototype.__bindCanvasClick = function (el1, el2) {//canvas/进度线
    var self = this;
    el1.onclick = function(e) {
        e = e || event;
        self._move(el2, e); //进度线 / canvas点击事件对象
    };
};

//common move func
TimeLine.prototype._move = function (el ,e) {
    var self = this;
    el.style.left = e.clientX - el.offsetParent.offsetLeft + 'px';
    console.log('进度线左偏移：' + (e.clientX - el.offsetParent.offsetLeft));
    var currentframe = (e.clientX - self.offset - el.offsetParent.offsetLeft) / self.lineInfo.framewidth + self.timelineoffset;

    if (self.lockRange) {
        if (currentframe <= self.playRangeInpoint) {

            currentframe = self.playRangeInpoint;
            self.sbvideoPlayer.pause();
            self.sbvideoPlayer.seek(currentframe);
        }
        if (currentframe >= self.playRangeOutpoint) {

            currentframe = self.playRangeOutpoint;
            self.sbvideoPlayer.pause();
            self.sbvideoPlayer.seek(currentframe);
        }
    }
    self.currentframe = currentframe;
    if (self.oncurrentframechange) {
        self.sbvideoPlayer.lastcurrentframe = self.currentframe;
        console.log('last current frame: ' + self.sbvideoPlayer.lastcurrentframe);
        self.oncurrentframechange.apply(self.viewObj, [self.currentframe, false]);
    }
}

//进度线拖拽
TimeLine.prototype.__bindMove = function (el) {
    var els = el.style,
        x = y = 0;
    var self = this;
    $(el).mousedown(function (e) {
        x = e.clientX - el.offsetWidth;
        y = e.clientY - el.offsetHeight;
        el.setCapture ? (
            el.setCapture(),
                //el
                document.onmousemove = function (ev) {
                    //self._move(el, ev || event); //进度线 / move事件
                    mouseMove(ev || event);
                },
                document.onmouseup = mouseUp
            ) : (
            $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
            );
        e.preventDefault();
    });
    //移动事件
    function mouseMove(e) {
        els.left = e.clientX - el.offsetParent.offsetLeft + 'px';
        var currentframe = (e.clientX - self.offset - el.offsetParent.offsetLeft) / self.lineInfo.framewidth + self.timelineoffset;

        if (self.lockRange) {
            if (currentframe <= self.playRangeInpoint) {

                currentframe = self.playRangeInpoint;
                self.sbvideoPlayer.pause();
                self.sbvideoPlayer.seek(currentframe);
            }
            if (currentframe >= self.playRangeOutpoint) {

                currentframe = self.playRangeOutpoint;
                self.sbvideoPlayer.pause();
                self.sbvideoPlayer.seek(currentframe);
            }
        }
        self.currentframe = currentframe;
        if (self.oncurrentframechange) {
            self.sbvideoPlayer.lastcurrentframe = self.currentframe;
            console.log('last current frame: ' + self.sbvideoPlayer.lastcurrentframe);
            self.oncurrentframechange.apply(self.viewObj, [self.currentframe, false]);
        }
    }

    function mouseUp() {
        el.releaseCapture ? (
            el.releaseCapture(),
                document.onmousemove = document.onmouseup = null
            ) : (
            $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
            );
    }
};

var InOutPointResize = function (options) {
    //初始化参数
    if (this === window) {
        return new InOutPointResize(options);
    }
    this.options = options || {};
    this.el = this.options.el || document.getElementsByTagName('canvas');
    this.elDrag = this.options.elDrag;
    this.isright = this.options.isright || false;
    this.canvaswidth = this.options.canvaswidth || 0;
    this.offset = this.options.offset || 0;
    this.timeline = this.options.timeline;

    //鼠标的 X 和 Y 轴坐标
    this.x = this.y = 0;
    this.width = 0;
    this.point = 0;
    this.lineInfo = {};
    this.init();
    //获取当前打点位置
    this.getPoint = function () {
        return this.point;
    }
};

InOutPointResize.prototype = {
    init: function () {
        var self = this;
        var el = self.el;
        var elDrag = self.elDrag;
        var els = el.style;
        //$(self.timeline.container).delegate(self.elid, 'click', function (e) {
        //    e = e || event;
        //    self.timeline._move(document.getElementById('timeline'), e); //进度线 / canvas点击事件对象
        //});

        $(el).click(function(e) {
            e = e || event;
            self.timeline._move(document.getElementById('currentProgressSpan'), e);
            e.stopPropagation();
            e.preventDefault();
        });

        $(elDrag).mousedown(function (e) {
            //拖拽时视频应当暂停
            var player = self.timeline.sbvideoPlayer;
            player.pause();
            if (player.onplayended)
                player.onplayended.call(player.viewObj);

            //按下元素后，计算当前鼠标与对象计算后的坐标
            self.x = e.clientX - el.offsetWidth;
            self.y = e.clientY - el.offsetHeight;
            //在支持 setCapture 做些东东
            elDrag.setCapture ? (
                //捕捉焦点
                elDrag.setCapture(),
                //设置事件 elDrag
                    document.onmousemove = function (ev) {
                        ev = ev || event;
                        mouseMove(ev);
                        ev.cancelBubble = true;
                        ev.stopPropagation();
                        return false;
                    },
                    document.onmouseup = mouseUp
                ) : (
                //绑定事件
                $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                );
            //防止冒泡/默认事件发生
            e.cancelBubble = true;
            e.stopPropagation();
            return false;
        });

        //移动事件
        function mouseMove(e) {
            if (!self.timeline.lockRange) {
                var inoutpoint = self.timeline.getInOutPoint();
                var marginleft = 0;//整个右边距
                var minCutRange = 25;//最小cut区间
                //右侧
                if (self.isright) {
                    var inpointwidth = (inoutpoint.inpoint + 1) * self.lineInfo.framewidth + self.offset;
                    if (e.clientX < self.canvaswidth - marginleft && inpointwidth < e.clientX) {
                        var x = e.clientX;
                        x = self.canvaswidth - marginleft - x >= 0 ? x : self.canvaswidth - marginleft;
                        x = (x >= self.offset + minCutRange) ? x : self.offset + minCutRange;
                        els.left = x + 'px';
                        self.width = self.canvaswidth - marginleft - x;
                        els.width = self.width + 'px';
                    }
                }
                //左侧
                else {
                    var outpointwidth = (inoutpoint.outpoint - 1) * self.lineInfo.framewidth + self.offset;
                    if (e.clientX <= self.canvaswidth - marginleft  && outpointwidth > e.clientX) {
                        self.width = e.clientX - self.offset;
                        self.width = self.width >= 0 ? self.width : 0;
                        els.width = self.width + 'px';
                    }
                }

                if (self.isright) {
                    self.point = Math.floor((el.offsetLeft - self.offset) / self.lineInfo.framewidth);
                } else {
                    self.point = Math.floor(el.offsetWidth / self.lineInfo.framewidth);
                }

                
                if (self.timeline.oninoutpointchange) {
                    //用于显示出入点
                    self.timeline.oninoutpointchange.apply(self.timeline.viewObj, [inoutpoint]);
                }
                if (self.timeline.oncurrentframechange) {
                    //第二参数boolean代表是出入点拖拽移动
                    console.log('last current frame: ' + self.timeline.sbvideoPlayer.lastcurrentframe);
                    self.timeline.oncurrentframechange.apply(self.timeline.viewObj, [self.point, true]);
                }
            }
        };

        //停止事件
        function mouseUp() {
           
            elDrag.releaseCapture ? (
                //释放焦点
                elDrag.releaseCapture(),
                //移除事件elDrag
                document.onmousemove = document.onmouseup = null
                ) : (
                //卸载事件
                $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
                );

            document.onmousemove = document.onmouseup = null;

            if (elDrag.releaseCapture) {
                elDrag.releaseCapture();
            }
            return false;
        }
    },
    setTimelineInfo: function (lineInfo) {
        var self = this;
        var el = self.el;
        this.lineInfo = lineInfo;
        if (self.isright) {
            self.point = Math.floor((el.offsetLeft - self.offset) / self.lineInfo.framewidth);
        } else {
            self.point = Math.floor(el.offsetWidth / self.lineInfo.framewidth);
        }
    },
    setPointWidth: function (point) {
        var self = this;
        var el = self.el;
        var els = el.style;

        self.lineInfo = self.timeline.lineInfo;
        var inoutpoint = self.timeline.getInOutPoint();

        var pointWidth = Math.floor(point * self.lineInfo.framewidth) + self.offset;

        var templeft = 0;//10;
        var minCutRange = 25;//最小打点区间
        if (self.isright) {
            pointWidth = Math.floor((point + 1) * self.lineInfo.framewidth) + self.offset;
            var inpointwidth = (inoutpoint.inpoint + 1) * self.lineInfo.framewidth + self.offset;
            if (pointWidth < self.canvaswidth - templeft && inpointwidth < pointWidth) {
                var x = pointWidth;
                x = self.canvaswidth - templeft - x >= 0 ? x : self.canvaswidth - templeft - 0;
                x = x >= self.offset + minCutRange ? x : self.offset + minCutRange;
                els.left = x + 'px';
                self.width = self.canvaswidth - templeft - x;
                els.width = self.width + 'px';
            }
        }
        else {
            var outpointwidth = (inoutpoint.outpoint - 1) * self.lineInfo.framewidth + self.offset;
            outpointwidth = outpointwidth > 0 ? outpointwidth : self.lineInfo.linewidth;
            if (pointWidth <= self.canvaswidth - templeft  && outpointwidth > pointWidth) {
                self.width = pointWidth - self.offset;
                self.width = self.width >= 0 ? self.width : 0;//5px
                els.width = self.width + 'px';
            }
        }

        if (self.isright) {
            self.point = point || Math.floor((el.offsetLeft - self.offset) / self.lineInfo.framewidth);
        } else {
            self.point = point || Math.floor(el.offsetWidth / self.lineInfo.framewidth);
        }
    }
};