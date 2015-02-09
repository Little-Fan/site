define(["app", "request" ,"apps/common/utility", "config", "dropzone", "artDialog"], function (CloudMamManager, request, utility, config) {
    CloudMamManager.module("UserCenterApp.UserCenter.View", function(View, CloudMamManager, Backbone, Marionette, $, _) {

        View.Detail = Marionette.ItemView.extend({
            tagName: "div",
            className: "-uc-details fix",
            template: 'usercenter/usercenter-detail-item',
            ui: {
                "realname": ".js-realname",
                "telphone": ".js-telphone",
                "email"   : ".js-email",
                "sex"     : ".check"
            },
            initialize: function() {
                this.userInfo = utility.localStorage.getUserInfo();
                //默认为'男'性
                this.sex = "1";
            },
            events: {
                "click @ui.sex"    : "selectSex",
                "blur @ui.realname": "verifyName",
                "blur @ui.telphone": "verifyPhone",
                "blur @ui.email"   : "verifyEmail",
                "click #submit-btn": "submit"
            },
            submit : function(e){
                //三者都通过验证
                var vn = this.verifyName(), vp = this.verifyPhone(), ve = this.verifyEmail();
                if (vn && vp && ve){
                    var data = {
                        userName: this.ui.realname.val(),
                        userCode: this.userInfo.info.userCode, //取本地存储
                        career: '',
                        email: this.ui.email.val(),
                        mobileNum: this.ui.telphone.val(),
                        sex: self.sex ? self.sex : "1"
                    };
                    CloudMamManager.trigger('update:personal:info',data);
                }
            },
            reminder : function (element,reg,msg) {
                var val = element.val();
                if (reg.test(val)){
                    element.next().removeClass("success error").addClass("success").text("");
                    return true;
                } else {
                    if(val.length === 0 ){
                        element.next().removeClass("success error").addClass("error").text("不能为空值");
                    } else {
                        element.next().removeClass("success error").addClass("error").text(msg);
                    }
                    return false;
                }
            },
            verifyName : function(e){
                // [\u4E00-\uFA29]|[\uE7C7-\uE7F3]汉字编码范围
                var reg = new RegExp("^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9]){3,12}$");
                return this.reminder(this.ui.realname,reg,"用户名格式错误！");
            },
            verifyPhone : function(e){
                var reg = new RegExp("1[3|4|5|7|8|][0-9]{9}");
                return this.reminder(this.ui.telphone,reg,"手机格式错误！");
            },
            verifyEmail : function(e){
                var reg = new RegExp("^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$");
                return this.reminder(this.ui.email,reg,"邮箱格式错误！");
            },
            selectSex: function (e) {
                var $sex = this.$(e.target);
                this.sex = $sex.data('sex');
                this.ui.sex.removeClass('active') && $sex.addClass('active');
            },
            onDomRefresh: function () {
                var self = this;
                request.get('/uic/userInfoDetail/' + this.userInfo.info.userCode, null, function(res) {
                    if (res.userInfo) {
                        this.ui.realname.val();
                        this.ui.telphone.val(res.userInfo.mobileNum);
                        this.ui.email.val(res.userInfo.email);
                    }
                }, true);
                
                //注册文本输入及时验证
                this.$('input').keyup(function(e) {
                    var type = $(e.currentTarget).attr('name').toLowerCase();
                    var value = $(e.currentTarget).val();
                    switch (type) {
                    case 'name':
                        self.verifyName();
                        break;
                    case 'telphone':
                        self.verifyPhone();
                        break;
                    case 'email':
                        self.verifyEmail();
                        break;
                    default:
                    }
                });

            }
        });

        View.ChangePsw = Marionette.ItemView.extend({
            tagName: "div",
            className: "-uc-details fix",
            template: 'usercenter/usercenter-changepsw-item',
            initialize: function() {
                this.userInfo = utility.localStorage.getUserInfo();
            },
            ui: {
                "oldpsw"   : ".js-oldpsw",
                "newpsw"   : ".js-newpsw",
                "repeatpsw": ".js-repeatpsw",
                "submit"   : "#submit-btn"
            },
            events: {
                "blur @ui.oldpsw"   : "verifyOldPassword",
                "blur @ui.newpsw"   : "verifyNewPassword",
                "click @ui.submit"  : "verifySubmit"
            },
            verifySubmit: function () {
                var vo = this.verifyOldPassword(), vn = this.verifyNewPassword(), vr = this.verifyRepeatPassword();
                if (vo && vn && vr) {
                    var data = {
                        oldPassword: this.ui.oldpsw.val(),
                        newPassword: this.ui.newpsw.val()
                    };
                    CloudMamManager.trigger('update:password', data);
                }
            },
            verifyOldPassword : function(){
                return this.reminder(this.ui.oldpsw,"密码格式错误");
            },
            verifyNewPassword : function(){
                return this.reminder(this.ui.newpsw,"密码格式错误");
            },
            verifyRepeatPassword: function() {
                if(this.ui.newpsw.val() !== this.ui.repeatpsw.val())
                    return this.reminder(this.ui.repeatpsw, "密码不一致");
                else
                    return this.reminder(this.ui.repeatpsw, "密码格式错误");
            },

            reminder : function (element,msg) {
                var reg = new RegExp("^[0-9A-Za-z_]{6,15}$");
                var val = element.val();
                if (reg.test(val)){
                    element.next().removeClass("success error").addClass("success").text("");
                    return true;
                } else {
                    if(val.length === 0 ){
                        element.next().removeClass("success error").addClass("error").text("不能为空值");
                    } else {
                        element.next().removeClass("success error").addClass("error").text(msg);
                    }
                    return false;
                }
            },
            onDomRefresh: function () {
                var self = this;
                //注册文本输入及时验证
                this.$('input').keyup(function (e) {
                    var type = $(e.currentTarget).attr('name').toLowerCase();
                    var value = $(e.currentTarget).val();
                    switch (type) {
                        case 'oldpsw':
                            self.verifyOldPassword();
                            break;
                        case 'newpsw':
                            self.verifyNewPassword();
                            break;
                        case 'repeatpsw':
                            self.verifyRepeatPassword();
                            break;
                        default:
                    }
                });

            }
        });

        View.ChangeHead = Marionette.ItemView.extend({
            tagName: "div",
            className: "-uc-details fix",
            template: 'usercenter/usercenter-changehead-item',
            initialize: function () {

            },
            onRender: function() {
                require(["config", "fullAvatarEditor", "swfobject", "jquery.cookie"],
                    function(config){
                    swfobject.addDomLoadEvent(function () {
                        var webcamAvailable = false;
                        var currentTab = 'upload';
                        var sourcePic1Url = $.cookie('swf1');
                        var callback = function (json) {
                            var id = this.id;
                            switch (json.code) {
                                case 2:
                                    //如果加载原图成功，说明进入了编辑面板，显示保存和取消按钮，隐藏拍照按钮
                                    if (json.type == 0) {
                                        if(id == "swf1")
                                        {
                                            $('#webcamPanelButton').hide();
                                            $('#editorPanelButtons').show();
                                        }
                                    }
                                    //否则会转到上传面板
                                    else {
                                        //隐藏所有按钮
                                        if(id == "swf1")$('#editorPanelButtons,#webcamPanelButton').hide();
                                    }
                                    break;
                                case 3:
                                    //如果摄像头已准备就绪且用户已允许使用，显示拍照按钮。
                                    if (json.type == 0) {
                                        if(id == "swf1")
                                        {
                                            $('.button_shutter').removeClass('Disabled');
                                            $('#webcamPanelButton').show();
                                            webcamAvailable = true;
                                        }
                                    }
                                    else {
                                        if(id == "swf1")
                                        {
                                            webcamAvailable = false;
                                            $('#webcamPanelButton').hide();
                                        }
                                        //如果摄像头已准备就绪但用户已拒绝使用。
                                        if (json.type == 1) {
                                            alert('您已拒绝使用摄像头!');
                                        }
                                        //如果摄像头已准备就绪但摄像头被占用。
                                        else {
                                            alert('摄像头被占用!');
                                        }
                                    }
                                    break;
                                case 4:
                                    alert("您选择的原图片文件大小（" + json.content + "）超出了指定的值(2MB)。");
                                    break;
                                case 5:
                                    //如果上传成功
                                    if (json.type == 0) {
                                        var xhr = json.content;
                                        var avatarUrls = xhr.avatarUrls[0] + "?" + Math.random();
                                        var dialog = art.dialog({
                                            id     : "Avatar",
                                            padding: 0,
                                            title  : '图片已成功保存至服务器',
                                            content: '<img src="' + avatarUrls + '" width="200" height="200" />',
                                            lock   : true,
                                            fixed  : true,
                                            drag   : false,
                                            resize : false
                                        });

                                        //修改本地存储 头像信息
                                        utility.localStorage.SetHeaderImg(avatarUrls);
                                        //触发更换本地头像
                                        CloudMamManager.trigger("update:header", avatarUrls);
                                    }
                                    else {
                                        alert("表示图片上传失败，发生了安全性错误！");
                                    }
                                    break;
                            }
                        };
                        var swf1 = new fullAvatarEditor('swf1', 335, {
                            id : 'swf1',
                            upload_url: config.dcmpRESTfulIp + '/uic/headImg',
                            avatar_field_names: 'file',
                            avatar_intro: "最终会生成以下尺寸的头像，请注意是否清晰",
                            src_url : sourcePic1Url,			//默认加载的原图片的url
                            tab_visible : false,				//不显示选项卡，外部自定义
                            button_visible : false,				//不显示按钮，外部自定义
                            src_upload : 0,						//是否上传原图片的选项：2-显示复选框由用户选择，0-不上传，1-上传
                            checkbox_visible : false,			//不显示复选框，外部自定义
                            browse_box_align : 38,				//图片选择框的水平对齐方式。left：左对齐；center：居中对齐；right：右对齐；数值：相对于舞台的x坐标
                            webcam_box_align : 38,				//摄像头拍照框的水平对齐方式，如上。
                            avatar_tools_visible:true			//是否显示颜色调整工具
                        }, callback);
                        //选项卡点击事件
                        $('dt').click(function () {
                            if (currentTab != this.id) {
                                currentTab = this.id;
                                $(this).addClass('current');
                                $(this).siblings().removeClass('current');
                                //如果是点击“相册选取”
                                if (this.id === 'albums') {
                                    //隐藏flash
                                    hideSWF();
                                    showAlbums();
                                }
                                else {
                                    hideAlbums();
                                    showSWF();
                                    if (this.id === 'webcam') {
                                        $('#editorPanelButtons').hide();
                                        if (webcamAvailable) {
                                            $('.button_shutter').removeClass('Disabled');
                                            $('#webcamPanelButton').show();
                                        }
                                    }
                                    else {
                                        //隐藏所有按钮
                                        $('#editorPanelButtons,#webcamPanelButton').hide();
                                    }
                                }
                                swf1.call('changepanel', this.id);
                            }
                        });
                        //复选框事件
                        $('#src_upload').change(function () {
                            swf1.call('srcUpload', this.checked);
                        });
                        //点击上传按钮的事件
                        $('.button_upload').click(function () {
                            swf1.call('upload');
                        });
                        //点击取消按钮的事件
                        $('.button_cancel').click(function () {
                            var activedTab = $('dt.current')[0].id;
                            if (activedTab === 'albums') {
                                hideSWF();
                                showAlbums();
                            }
                            else {
                                swf1.call('changepanel', activedTab);
                                if (activedTab === 'webcam') {
                                    $('#editorPanelButtons').hide();
                                    if (webcamAvailable) {
                                        $('.button_shutter').removeClass('Disabled');
                                        $('#webcamPanelButton').show();
                                    }
                                }
                                else {
                                    //隐藏所有按钮
                                    $('#editorPanelButtons,#webcamPanelButton').hide();
                                }
                            }
                        });
                        //点击拍照按钮的事件
                        $('.button_shutter').click(function () {
                            if (!$(this).hasClass('Disabled')) {
                                $(this).addClass('Disabled');
                                swf1.call('pressShutter');
                            }
                        });
                        //从相册中选取
                        $('#userAlbums a').click(function () {
                            var sourcePic = this.href;
                            swf1.call('loadPic', sourcePic);
                            //隐藏相册
                            hideAlbums();
                            //显示flash
                            showSWF();
                            return false;
                        });
                        //隐藏flash的函数
                        function hideSWF() {
                            //将宽高设置为0的方式来隐藏flash，而不能使用将其display样式设置为none的方式来隐藏，否则flash将不会被加载，隐藏时储存其宽高，以便后期恢复
                            $('#flash1').data({
                                w: $('#flash1').width(),
                                h: $('#flash1').height()
                            })
                                .css({
                                    width: '0px',
                                    height: '0px',
                                    overflow: 'hidden'
                                });
                            //隐藏所有按钮
                            $('#editorPanelButtons,#webcamPanelButton').hide();
                        }
                        function showSWF() {
                            $('#flash1').css({
                                width: $('#flash1').data('w'),
                                height: $('#flash1').data('h')
                            });
                        }
                        //显示相册的函数
                        function showAlbums() {
                            $('#userAlbums').show();
                        }
                        //隐藏相册的函数
                        function hideAlbums() {
                            $('#userAlbums').hide();
                        }
                    });
                })
            }

        });

        View.CurrentRate = Marionette.ItemView.extend({
            tagName: "div",
            className: "-uc-details fix",
            template: 'usercenter/usercenter-currentrate-item',
            initialize: function() {

            },
            ui: {
                "selectRate": ".js-selectrate"
            },
            events: {
                "click @ui.selectRate": "selectRate"
            },
            selectRate: function (e) {
                e && e.stopPropagation() && e.preventDefault();
                CloudMamManager.trigger('goto:selectrate', { type: this.$(e.target).data('uri') });
            },
            onShow: function() {
                //this.$el.find('.js-selectrate').bind('click',function(e) {
                //    e && e.stopPropagation() && e.preventDefault();
                //});
            }
        });

        View.SelectRate = Marionette.ItemView.extend({
            tagName: "div",
            className: "-uc-details fix",
            template: 'usercenter/usercenter-selectrate-item',
            initialize: function() {
                //this.listenTo('', function() {});
            },
            ui: {

            },
            events: {

            }
        });

        View.Watermark = Marionette.ItemView.extend({
            tagName   : "div",
            className : "-uc-details fix",
            template  : 'usercenter/usercenter-watermark-item',
            initialize: function () {
            },
            ui        : {
                upload : "#upload-image",
                preview: "#img-preview"
            },
            getFileExt: function (fileName) {
                if (fileName != "") {
                    var pos = fileName.replace(/.+\./, "");
                    return pos;
                }
            },
            onShow    : function () {
                var self = this;
                var element = this.ui.preview;
                var drop = element.dropzone({
                    url             : config.dcmpRESTfulIp + "/uic/waterMark",
                    paramName       : "waterMark",
                    maxFilesize     : 0.5,  // MB
                    clickable       : "#upload-image",
                    method          : "post",
                    thumbnailWidth  : 70,
                    thumbnailHeight : 50,
                    addRemoveLinks  : true,
                    dictFileTooBig : "允许上传的最大文件为 {{maxFilesize}} MB,你当前的文件大小实为 {{filesize}} MB",
                    accept: function(file, done) {
                        var fileExt = self.getFileExt(file.name).toUpperCase();
                        if (fileExt !== "TGA") {
                            done("文件格式不正确");
                        } else {
                            done();
                        }
                    },
                    init            : function () {
                        var myDialog, dropzoneForm = this;
                        this.on("addedfile", function (file) {
                            //增加文件
                        });
                        this.on('sending', function (file, xhr, formData) {
                            //发送中附加的字段名
                            formData.append('location',5);
                        });
                        this.on("error", function (file, errorMessage, xhr) {
                            self.$(".message").removeClass("btn-success").addClass("btn-error").text(errorMessage);
                        });
                        this.on("success", function (file, xhr) {
                            if(xhr.status == 1){
                                // 填充对话框内容(xhr);
                                self.$(".message").removeClass("btn-error").addClass("btn-success").text(xhr.watermarkPath);
                            } else {
                                // 填充对话框内容(xhr);
                                self.$(".message").removeClass("btn-error").addClass("btn-success").text(xhr.errorMessage);
                            }
                        });
                    }
                });
            }
        });

        //用量Layout
        View.DosageLayout = Marionette.Layout.extend({
            tagName: "div",
            className: "-uc-details fix",
            template: "usercenter/usercenter-dosage-layout",
            regions: {
                TopRegion: ".js-top",
                BottomRegion: ".js-bottom"
            }
        });


        View.DosageTopView = Marionette.ItemView.extend({
            tagName: "div",
            template: 'usercenter/usercenter-dosage-topitem',
            initialize: function(options) {
                this.params = options.params;
            },
            ui: {
                "usedPercent": ".js-space",
                "clipCount": ".js-clip-count", "audioCount": ".js-audio-count", "picCount": ".js-pic-count", "docCount": ".js-doc-count", "otherCount": ".js-other-count","fileCount":".js-file-count", "recycleCount": ".js-recycle-count",
                "clipSize": ".js-clip-size", "audioSize": ".js-audio-size", "picSize": ".js-pic-size", "docSize": ".js-doc-size", "otherSize": ".js-other-size", "fileSize": ".js-file-size", "recycleSize": ".js-recycle-size"
            },
            onRender: function () {
                var self = this;
                if (this.params) {
                    _.each(self.params.usedStatisticsImportVOs, function (item) {
                        if (item.entityType == 'Clip') self.ui.clipCount.html(item.entityCount) && self.ui.clipSize.html(item.fileSize);
                        if (item.entityType == 'Audio') self.ui.audioCount.html(item.entityCount) && self.ui.audioSize.html(item.fileSize);
                        if (item.entityType == 'Picture') self.ui.picCount.html(item.entityCount) && self.ui.picSize.html(item.fileSize);
                        if (item.entityType == 'Document') self.ui.docCount.html(item.entityCount) && self.ui.docSize.html(item.fileSize);
                        if (item.entityType == 'Other') self.ui.otherCount.html(item.entityCount) && self.ui.otherSize.html(item.fileSize);
                        if (item.entityType == 'File') self.ui.fileCount.html(item.entityCount) && self.ui.fileSize.html(item.fileSize);
                        if (item.entityType == 'Recycle') self.ui.recycleCount.html(item.entityCount) && self.ui.recycleSize.html(item.fileSize);
                    });
                    self.ui.usedPercent.html(self.params.total.totalFileSize + '/' + self.params.total.userPermissionSpace);
                }
            }
        });

        View.DosageBottomView = Marionette.ItemView.extend({
            tagName: "div",
            template: 'usercenter/usercenter-dosage-bottomitem',
            initialize: function (options) {
                this.params = options.params;
            },
            ui: {
                "netSize": ".js-net-size", "professionSize": ".js-profession-size",
                "cutCount": ".js-cut-count", "mixtureCount": ".js-mixture-count", "reviewCount": ".js-review-count"
            },
            onRender: function() {
                var self = this;
                if (this.params) {
                    _.each(self.params, function (item) {
                        if (item.activityType == 'Transcode_1') self.ui.netSize.html(item.duration);
                        if (item.activityType == 'Transcode_2') self.ui.professionSize.html(item.duration);
                        if (item.activityType == 'Mixture') self.ui.mixtureCount.html(item.activityCount);
                        if (item.activityType == 'Cut') self.ui.cutCount.html(item.activityCount);
                        if (item.activityType == '审阅') self.ui.reviewCount.html(item.activityCount);
                    });
                }
            }
        });

        View.Invitation  = Marionette.ItemView.extend({
            tagName: "div",
            className: "-uc-details fix",
            template: 'usercenter/usercenter-invitation-item',
            initialize: function() {
                //this.listenTo('', function() {});
            },
            ui: {

            },
            events: {

            }
        });

    });
    return CloudMamManager.UserCenterApp.UserCenter.View;
});