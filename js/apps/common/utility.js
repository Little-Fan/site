define(['jquery', 'config', 'localstorage', 'jquery.cookie'], function ($, config) {

    //本地存储
    var localStorage = {
        saveUserInfo: function (options) {
            (new Store('_user')).create({ id: '_userinfo', info: options });
        },
        getUserInfo: function() {
            return new Store('_user').find({ id: '_userinfo' });
        },
        SaveCutId: function (options) {
            (new Store('_cut')).create({ id: '_cutid', name: options.name, desc: options.desc, data: options.data });
        },
        GetCutId: function() {
            return new Store('_cut').find({ id: '_cutid' });
        },
        SaveReviewInfo: function (options) {
            (new Store('_review')).create({ id: '_reviewid', data: { name: options.name, description: options.desc, contentId: options.contentId, user: options.user } });
        },
        GetReviewInfo: function() {
            return new Store('_review').find({ id: '_reviewid' });
        },
        GetHeaderImg: function() {
            return localStorage.getUserInfo().info.headUrl;
        },
        SetGuideViewFlag: function (bool) {
            $.cookie('_guideview', bool);
        },
        GetGuideViewFlag: function () {
            return $.cookie('_guideview');
        },
        GetSidCookie: function() {
            return $.cookie('sid');
        },
        clearSidCookie: function() {
            $.cookie('sid', '', { path: "/" });
        }
    };

    var tools = {

        /**
        * 过期时间戳
        * @return <int>        天  
        */
        expiration: function(timeSamp) {
            var expirationTime = (timeSamp / 1000) - this.curTime();

            if (expirationTime <= 0)
                return null;
            else
                return Math.round((timeSamp / 1000 - this.curTime()) / (60 * 60 * 24));
        },

        /**
        * 当前时间戳
        * @return <int>        unix时间戳(秒)  
        */
        curTime: function() {
            return Date.parse(new Date()) / 1000;
        },
        /**              
        * 日期 转换为 Unix时间戳
        * @param <string> 2014-01-01 20:20:20  日期格式              
        * @return <int>        unix时间戳(秒)              
        */
        dateToUnix: function(string) {
            var f = string.split(' ', 2);
            var d = (f[0] ? f[0] : '').split('-', 3);
            var t = (f[1] ? f[1] : '').split(':', 3);
            return (new Date(
                parseInt(d[0], 10) || null,
                (parseInt(d[1], 10) || 1) - 1,
                parseInt(d[2], 10) || null,
                parseInt(t[0], 10) || null,
                parseInt(t[1], 10) || null,
                parseInt(t[2], 10) || null
            )).getTime() / 1000;
        },
        /**              
        * 时间戳转换日期              
        * @param <int> unixTime    待时间戳(秒)              
        * @param <bool> isFull    返回完整时间(Y-m-d 或者 Y-m-d H:i:s)              
        * @param <int>  timeZone   时区              
        */
        unixToDate: function(unixTime, isFull, timeZone) {
            if (typeof (timeZone) == 'number') {
                unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
            }
            var time = new Date(unixTime * 1000);
            var ymdhis = "";
            ymdhis += time.getUTCFullYear() + "-";
            ymdhis += (time.getUTCMonth() + 1) + "-";
            ymdhis += time.getUTCDate();
            if (isFull === true) {
                ymdhis += " " + time.getUTCHours() + ":";
                ymdhis += time.getUTCMinutes() + ":";
                ymdhis += time.getUTCSeconds();
            }
            return ymdhis;
        },

        textSelect: function(o, a, b) {
            //o是当前对象，例如文本域对象
            //a是起始位置，b是终点位置
            var a = parseInt(a, 10), b = parseInt(b, 10);
            var l = o.value.length;
            if (l) {
                //如果非数值，则表示从起始位置选择到结束位置
                if (!a) {
                    a = 0;
                }
                if (!b) {
                    b = l;
                }
                //如果值超过长度，则就是当前对象值的长度
                if (a > l) {
                    a = l;
                }
                if (b > l) {
                    b = l;
                }
                //如果为负值，则与长度值相加
                if (a < 0) {
                    a = l + a;
                }
                if (b < 0) {
                    b = l + b;
                }
                if (o.createTextRange) { //IE浏览器
                    var range = o.createTextRange();
                    range.moveStart("character", -l);
                    range.moveEnd("character", -l);
                    range.moveStart("character", a);
                    range.moveEnd("character", b);
                    range.select();
                } else {
                    o.setSelectionRange(a, b);
                    o.focus();
                }
            }
        },
        setImagePreview: function() {
            var docObj = document.getElementById("doc");

            var imgObjPreview = document.getElementById("preview");
            if (docObj.files && docObj.files[0]) {
                //火狐下，直接设img属性
                imgObjPreview.style.display = 'block';
                imgObjPreview.style.width = '300px';
                imgObjPreview.style.height = '120px';
                //imgObjPreview.src = docObj.files[0].getAsDataURL();

                //火狐7以上版本不能用上面的getAsDataURL()方式获取，需要一下方式
                imgObjPreview.src = window.URL.createObjectURL(docObj.files[0]);

            } else {
                //IE下，使用滤镜
                docObj.select();
                var imgSrc = document.selection.createRange().text;
                var localImagId = document.getElementById("localImag");
                //必须设置初始大小
                localImagId.style.width = "300px";
                localImagId.style.height = "120px";
                //图片异常的捕捉，防止用户修改后缀来伪造图片
                try {
                    localImagId.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
                    localImagId.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = imgSrc;
                } catch (e) {
                    alert("您上传的图片格式不正确，请重新选择!");
                    return false;
                }
                imgObjPreview.style.display = 'none';
                document.selection.empty();
            }
            return true;
        },
        //遮罩复用modal
        setMask: function (options) {
            options = options || { type: "loading" };
            var temp = '';
            var el = '<div class="bbm-wrapper js-wrapper"><div class="bbm-modal bbm-modal--open" style="opacity: 1;">$template</div></div>';
            var templates = {
                loading: '<img src="./images/load/loading.gif" style="width:60px; height:60px;" alt />',
                synthesis: '<div class="-xh-synthesize"><p>新素材合成发起成功，请去 <a href="#task/manage/cut">任务管理</a> 中查看合成进度.</p><span class="-xh-closed">x</span></div>',
                timeout: '<div class="-xh-synthesize"><p>登陆超时啦，请 <a style="color:#047281" href="#user/login">重新登陆！</a></p><span class="-xh-closed">x</span></div>'
            }
            
            if (options.type) {
                switch (options.type) {
                    case 'loading':
                        temp = el.replace('$template', templates.loading); break;
                    case 'synthesis':
                        temp = el.replace('$template', templates.synthesis); break;
                    case 'timeout':
                        temp = el.replace('$template', templates.timeout); break;
                    default:
                }
            }
            $('#spinner').remove();
            $('.js-wrapper').remove();
            $('body').append(temp);

            //注册事件
            $('.-xh-closed').bind('click', function(e) {
                $('.js-wrapper').remove();
            });
        },
        removeMask: function() {
            $('body .js-wrapper').remove();
        }
    };

    var validate = function() {
        $.ajax({
            url: config.dcmpRESTfulIp + '/uic/login',
            type: 'GET',
            success: function(res) {
                return res;
            },
            error: function (res) {
                alert('访问失败');
                return false;
            }
        });
    }


    return {
        localStorage: localStorage,
        tools: tools,
        validate: validate
    }
});