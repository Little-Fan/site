/**
 * @class
 * @classdesc Main SbVideo Implementation.
 * @param {Object} options - Configuration object for initialization.
 */
var SbVideo = function (options) {
    if (this === window) {
        return new SbVideo(options);
    }
    this.obj = options || {};
    this.viewObj = this.obj.viewObj;//播放视图
    this.width = this.obj.width || 320;
    this.height = this.obj.height || 240;
    this.controlsenable = this.obj.controlsenable || false;
    this.intervalId;//定时器的标识
    this.video = {};
    this.video.currentframe = 0;
    this.video.isPlaying = false;
    this.timeline = this.obj.timeline;
    this.onplayended = this.obj.onplayended;//播放完成事件
    this.onloadCompleted = this.obj.onloadCompleted;//加载完事件
    this.loadCompleted = false;
    this.onresize = this.obj.onresize;
    this.frameRate = this.obj.frameRate || 25;
    this.inoutdrag = false;

    this.isstory = this.obj.isstory || false;//是否Story播放
    this.playList = this.obj.playList || [];
    this.playIndex = 0;//story播放索引
    this.storyplayed = this.obj.storyplayed;//story播放设置
    this.src = this.obj.src;
    this.combineKeyFrame = this.obj.combineKeyFrame || null;
    this.onseekchange = this.obj.onseekchange || null;//时码change事件
    this.lastcurrentframe = 0;//记录进度线最后播放帧位置

    var self = this;
    window.addEventListener('keydown', function(e) {
        self._keyDown(e);
    }, true);
};


SbVideo.prototype = {
    fps: this.frameRate,

    init: function (src, combineKeyFrame) {
        if (!this.loadCompleted || this.src != src) {
            this.loadCompleted = false;
            this.src = src || this.src;
            this.combineKeyFrame = combineKeyFrame;
            this.container = this.obj.container;
            this.width = this.container.offsetWidth;
            this.height = this.container.offsetHeight;
            this.container.innerHTML =  '<video controls preload="auto"  id="video" width="100%" height="100%">Your browser does not support the video tag.</video>';
            this.video = document.getElementById('video') || document.getElementsByTagName('video');
            this.video.controls = this.controlsenable;
            this.video.src = this.src;
            this.video.oncontextmenu = function () {
                event.returnValue = false;
            };
            this.src ? this.initPlay() : null;
        }
        else{
            this.video.onloadeddata();
        }
    },
    
    initPlay: function () {
        var self = this;
        var num = 0;
        var timeFunName = null;
        console.log("initPlay");
        if (this.timeline) {
            //播放器对象回传
            this.timeline.sbvideoPlayer = this;
        }

        //story Play 
        if (this.playList && this.playList.length > 0 && this.isstory) {
            if (this.playList.length >= (this.playIndex + 1) && this.storyplayed) {
                self.storyplayed.apply(self.viewObj, [self.playIndex, self.playList[self.playIndex]]);
                //return;
            } else {
                //story状态重置
                this.playList = [];
                this.isstory = false;
                this.playIndex = 0;
            }
        } 
        
        this.video.onclick = function () {
            clearTimeout(timeFunName);
            timeFunName = setTimeout(function () {
                num++;
                if (self.video.isPlaying) {
                    self.pause();
                }
                else {
                    self.play();
                }
            }, 300);
        };
        this.video.ondblclick = function () {
            clearTimeout(timeFunName);
            num++;
            self.launchFullScreen(self.video);
        };

        this.video.onloadeddata = function () {
            self.loadCompleted = true;
            if (TimeCode) {
                var tc = new TimeCode({ seconds: self.video.duration, frameRate: self.frameRate });
                if (self.timeline) {
                    self.timeline.init(tc.getFrames(), self.combineKeyFrame);
                }
                if (self.onloadCompleted) {
                    self.onloadCompleted.call(self.viewObj, tc.toString(), tc.getFrames());
                }
            }
        };

        this.video.ontimeupdate = function () {
            if (TimeCode) {
                var tc = new TimeCode({ seconds: self.video.currentTime, frameRate: self.frameRate });
                self.video.currentframe = tc.frames;

                //若不是区间拖拽 记录最后当播放前帧
                if (!self.inoutdrag) self.lastcurrentframe = tc.frames;

                if (self.timeline && !self.inoutdrag) {
                    self.timeline.seekTo(self.video.currentframe);
                }

                if (self.video.ended) {
                    self.pause();
                    if (self.onplayended) {
                        self.seek(0);
                        self.onplayended.call(self.viewObj);
                    }
                }

                if (self.onseekchange)
                    self.onseekchange.apply(self.viewObj, [tc.toString(), tc.getFrames()]);
            }
        };

        //播放器resize事件
        /*
        this.video.onresize = function () {
            if (this.video.onresize && self.onresize)
                self.onresize.apply(self.viewObj);
        }*/
    },


    _keyDown: function (e) {
        //清掉cut拖拽状态
        this.inoutdrag = false;
        var code = e.keyCode;
        var duration = TimeCodeConvert.Second2Frame(this.video.duration, this.frameRate);

        //避免算法四舍五入造成死循环
        var currentframe = this.getcurrentframe();
        //(Math.abs(this.lastcurrentframe - this.getcurrentframe()) == 1) ? this.lastcurrentframe + 1 : this.lastcurrentframe;

        if (code == 37) {
            currentframe - 1 < 0 ? null : this.seek(currentframe - 1);
        }
        if (code == 39) {
            currentframe + 1 > duration ? null : this.seek(currentframe + 1);
        }
    },

    /**
     *story播放时间线回调(仅供内部调用)
     */
    _storyPlayEnded: function () {
        if (this.playList && this.playList.length > 0 && this.isstory) {
            ++this.playIndex;
            this.initPlay();
        }
    },

    /**
     * 设置播放列表
     * @param {Object} 播放信息地址
     */
    setstoryList: function (playList) {
        this.playList = playList;
        if (this.playList && this.playList.length > 0 && this.isstory) {
            this.initPlay();
        }
    },
    /**
     * 设置播放地址
     * @param {String} src 播放地址
     */
    setSrc: function (src,combineKeyFrame) {
        this.init(src, combineKeyFrame);
    }
};

/**
 * 静音设置
 * @param {Boolean} boolean 是否静音
 */
SbVideo.prototype.setMuted = function (boolean) {
    this.video.muted = boolean;
}

/**
 * 音量设置
 * @param {int} volume 音量
 */
SbVideo.prototype.setVolume = function (volume) {
    if (volume >= 0)
        this.video.volume = volume;
}
/**
 * 预览图
 * @param {String} src 预览图
 */
SbVideo.prototype.setPoster = function (src) {
    src ? this.video.poster : null;
};


//获取本地流媒体地址
SbVideo.prototype.createObjectURL = function (object) {
    return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
};

//播放本地文件
SbVideo.prototype.playLocalFile = function (file) {
    var files = file.files;
    if (files && files.length) {
        this.video.currentframe = 0;
        this.video.src = (window.URL) ? window.URL.createObjectURL(files[0]) : window.webkitURL.createObjectURL(files[0]);
        this.initPlay();
    }
};

//播放路径设置
SbVideo.prototype.setResources = function (options) {
    if (typeof (options) == "object") {
        this.video.src = options.src;
        this.initPlay();
    }
};

//获取当前播放帧
SbVideo.prototype.getcurrentframe = function () {
    return this.video.currentframe;
};


//区间播放
SbVideo.prototype._start = function () {
    if (this.intervalId) {
        this.pause();
    }
    var self = this;
    var timerInterval = function () {
        //var tc = new TimeCode({seconds: video.currentTime, frameRate: frameRate});
        //video.currentframe = tc.frames;
        self.video.ontimeupdate();
    }
    this.intervalId = window.setInterval(timerInterval, Math.floor(1000 / (2 * this.frameRate)));
    this.video.isPlaying = true;
    //
    if (this.lastcurrentframe) {
        console.log('last current frame: ' + self.lastcurrentframe);
        this.seek(self.lastcurrentframe);
    }
    this.video.play();
};

//开始播放
SbVideo.prototype.play = function () {
    this._start();
};

//暂停
SbVideo.prototype.pause = function () {
    window.clearInterval(this.intervalId);
    this.video.pause();
    this.video.isPlaying = false;
};

//seek到指定帧
//注意：只有视频/story播放的时候需要seek : timeline.seekTo(frame)
SbVideo.prototype.seek = function (frame, options) {
    if (TimeCode) {
        var self = this;
        var tc = new TimeCode({ frames: frame, frameRate: this.frameRate });
        var time = tc.seconds;
        console.log('seek to frame:' + frame + ' Second:' + time);
        this.video.currentTime = time;//当前播放位置(可读写)
        this.video.currentframe = frame;
        console.log('video.currentTime:' + this.video.currentTime);
        if (this.timeline && !this.inoutdrag) {
            //阻止循环设置
            if  (!(options && options.noloop))
                this.timeline.seekTo(frame);

            //options && options.noloop ? null : this.timeline.seekTo(frame);
        }

        //用于显示
        if (self.onseekchange)
            self.onseekchange.apply(self.viewObj, [tc.toString(), tc.getFrames()]);
    }
};
// 进入全屏：launchFullScreen(document.getElementById("videoElement"));  
SbVideo.prototype.launchFullScreen = function (element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
};
//退出全屏 : exitFullscreen(); 
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozExitFullScreen) {
        document.mozExitFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}
