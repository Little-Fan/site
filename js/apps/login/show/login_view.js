define(["app", "apps/common/views", "apps/mycloud/dialog/dialog_view", "apps/common/utility", "utils/templates",
        "config", "dropzone", "request", "jquery-ui", "tooltipster"],
    function (CloudMamManager, CommonViews, Dialog, utility, templates, config, Dropzone, request) {
        CloudMamManager.module("LoginApp.Login.View", function (View, CloudMamManager, Backbone, Marionette, $, _) {

            // https://github.com/hongymagic/jQuery.serializeObject
            $.fn.serializeObject = function () {
                "use strict";
                var a = {}, b = function (b, c) {
                    var d = a[c.name];
                    "undefined" != typeof d && d !== null ? $.isArray(d) ? d.push(c.value) : a[c.name] = [d, c.value] : a[c.name] = c.value
                };
                return $.each(this.serializeArray(), b), a
            };

            View.LoginView = Marionette.ItemView.extend({
                template  : "login/login-content",
                className : "login-box",
                ui        : {
                    "register": ".register",
                    "login"   : ".login",
                    "username": "#js_user",
                    "password": "#js_password",
                    "forget"  : ".login-forget",
                    "error"   : ".js-error"
                },
                events    : {
                    "click @ui.register"  : "register",
                    "click @ui.login"     : "login",
                    "click @ui.forget"    : "forget",
                    "keydown @ui.password": "enterLogin"
                },
                register  : function (e) {
                    this.trigger('user:register');
                },
                login     : function (e) {
                    this.ui.error.html('');
                    var data = {username: this.ui.username.val(), password: this.ui.password.val()};
                    var validate = this.validate(data);
                    //后台登陆
                    validate ? this.trigger('user:login', data) : null;
                },
                enterLogin: function (e) {
                    if (e.which === 13) {
                        this.login();
                    }
                },
                forget    : function () {
                    this.trigger('user:forgetPassword');
                },
                //本地验证
                validate  : function (data) {
                    //为空验证
                    var regUserCode = /^\w{4,16}$/; // /^(?![0-9]+$)|^[a-zA-Z_]{5,17}$/;  // /^[a-zA-Z]\w{5,17}$/;
                    var regPsw = /^\w{4,20}$/;
                    if (!(data.username && data.password)) {
                        this.ui.error.html('请输入用户名和密码');
                        if (!this.ui.username.val()) this.ui.username.focus();
                        if (this.ui.username.val() && !this.ui.password.val()) this.ui.password.focus();
                        return false;
                    }
                    if (!regUserCode.test(data.username) || !regPsw.test(data.password)) {
                        this.ui.error.html('用户名或密码错误');
                        this.ui.password.val('').focus();
                        return false;
                    }
                    return true;
                },
                onRender  : function () {
                    $('body').addClass('login-bg');
                    if (utility.localStorage.getUserInfo()) {
                        this.ui.username.val(utility.localStorage.getUserInfo().info.userCode);
                    }
                }
            });

            View.ForgetFirstStep = Marionette.ItemView.extend({
                initialize: function (options) {
                    this.isSubmit = false;
                },
                template  : "login/forget-firststep",
                className : "fg-wrapper",
                ui        : {
                    "firstnext" : ".js-first-next",
                    "userName"  : "#userName",
                    "verity"    : "#verify",
                    "verityCode": "#verifyImg"
                },
                events    : {
                    "click @ui.firstnext" : "firstNextStep",
                    "click @ui.verityCode": "changeVerity",
                    "blur  @ui.verity"    : "captcha"
                },
                captcha   : function (e) {
                    var self = this;
                    var captcha = this.ui.verity.val();
                    $.ajax({
                        url    : config.dcmpRESTfulIp + "/uic/verifyCodeImg",
                        type   : "POST",
                        data   : {verifyCode : captcha},
                        success: function (data) {
                            if(data == "true"){
                                self.ui.verity.removeClass().addClass("success");
                                self.isSubmit = true;
                            } else {
                                self.ui.verity.removeClass().addClass("error");
                                self.isSubmit = false;
                            }
                        }
                    })
                },
                changeVerity : function () {
                    var src = this.getVerity();
                    this.ui.verityCode.prop("src", src);
                },
                getVerity    : function () {
                    return config.dcmpRESTfulIp + "/uic/verifyCodeImg?" + Math.random();
                },
                firstNextStep: function () {
                    var self = this;
                    var userName = $.trim(this.ui.userName.val());
                    var verity = $.trim(this.ui.verity.val());
                    if(this.isSubmit) {
                        if (!userName) {
                            alert("用户名不能为空");
                            this.ui.userName.focus();
                        } else if (!verity) {
                            alert("验证码不能为空");
                            this.ui.verity.focus();
                        } else {
                            var dotting = this.$(".btn").find("b");
                            dotting.addClass("dotting");
                            $.ajax({
                                url     : config.dcmpRESTfulIp + "/uic/userInfoDetail/" + userName,
                                dataType: "json",
                                success : function (data) {
                                    var status = parseInt(data.status);
                                    if (parseInt(data.status) === 0) {
                                        alert("用户名不存在")
                                        dotting.removeClass("dotting");
                                    } else {
                                        var mobileNum = data.userInfo.mobileNum;
                                        var userId = data["user_id"];
                                        View.options = {
                                            userName : userName,
                                            mobileNum: mobileNum,
                                            userId   : userId
                                        }
                                        View.trigger('first:nextstep', {
                                            userName : userName,
                                            mobileNum: mobileNum
                                        });
                                    }
                                }
                            })
                        }
                    } else {
                        alert("验证码错误");
                    }
                },
                onShow       : function () {
                    this.changeVerity();
                }
            });
            View.ForgetSecondStep = Marionette.ItemView.extend({
                initialize    : function (options) {
                    console.log(options);
                },
                template      : "login/forget-secondstep",
                className     : "fg-wrapper",
                ui            : {
                    "secondtnext": ".js-second-next",
                    "username"   : "#username",
                    "phone"      : "#phone",
                    "verifyCodeSend"    : "#verifyCodeSend",
                    "verityCode" : "#verityCode"
                },
                events        : {
                    "click @ui.secondtnext": "secondNextStep",
                    "click @ui.verifyCodeSend" : "verityCodeSent"
                },
                verityCodeSent : function (e) {
                    var self = this;
                    var ele = this.ui.verifyCodeSend;
                    console.log(ele);
                    var telephoneVal = this.ui.phone.text();
                    var wait = 60;
                    //短息验证倒计时
                    function time() {
                        if (wait == 0) {
                            ele.removeClass("disabled").val("获取短信验证码").prop("disabled", false);
                            wait = 60;
                        } else {
                            // 按钮不可用，增加不可用样式，并且开始倒计时;
                            ele.addClass("disabled").val("重新发送(" + wait + ")").prop("disabled", true);
                            wait--;
                            setTimeout(function () {time();}, 1000);
                        }
                    }
                    if (telephoneVal) {
                        $.ajax({
                            url     : config.dcmpRESTfulIp + "/uic/verificationCode?mobileNum=" + telephoneVal,
                            type    : "GET",
                            dataType: "json",
                            success : function (data) {
                                console.log(data);
                            }
                        })
                        time();
                    }
                },
                secondNextStep: function () {
                    var self = this;
                    var verityCode = this.ui.verityCode.val();
                    if(!verityCode){
                        alert("验证码不能为空");
                    } else {
                        $.ajax({
                            url     : config.dcmpRESTfulIp + "/uic/verificationCode",
                            type    : "POST",
                            data    : {
                                mobileNum : this.ui.phone.text(),
                                verificationCode :  verityCode
                            },
                            success : function (data) {
                                if(data){
                                    View.trigger('second:nextstep');
                                } else {
                                    alert("验证码不正确");
                                }
                            }
                        })
                    }
                },
                onShow        : function () {
                    this.ui.username.text(this.options.userName);
                    this.ui.phone.text(this.options.mobileNum);
                }
            });
            View.ForgetThirdStep = Marionette.ItemView.extend({
                template : "login/forget-thirdstep",
                className: "fg-wrapper",
                ui       : {
                    "password"      : "#password",
                    "passwordRepeat": "#passwordRepeat",
                    "thirdtnext"    : ".js-third-next"
                },
                events   : {
                    "click @ui.thirdtnext": "thirdNextStep"
                },
                thirdNextStep: function () {
                    var password = this.ui.password.val();
                    var passwordRepeat = this.ui.passwordRepeat.val();
                    if(!password){
                        alert("密码不能为空")
                    } else if (password !== passwordRepeat){
                        alert("密码不一致")
                    } else {
                        var self = this;
                        console.log(View.options);
                        $.ajax({
                            url     : config.dcmpRESTfulIp + "/uic/changePasswordAfterVerification",
                            type    : "POST",
                            dataType: 'JSON',
                            data    : {
                                userId     : View.options.userId,
                                userCode   : View.options.userName,
                                newPassword: self.ui.passwordRepeat.val()
                            },
                            success : function (data) {
                                var status =  parseInt(data.status);
                                if (status == 1) {
                                    View.trigger('third:nextstep');
                                } else {
                                    alert("密码修改不成功");
                                }
                            }
                        })
                    }
                }
            });
            View.ForgetLastStep = Marionette.ItemView.extend({
                template : "login/forget-laststep",
                className: "fg-wrapper",
                ui       : {}
            });


            View.ForgetPswLayout = Marionette.Layout.extend({
                el      : "body",
                template: "login/forgetpsw-layout",
                regions : {
                    mainRegion  : ".regs-main",
                    dialogRegion: {
                        selector  : "#dialog-region",
                        regionType: Backbone.Marionette.Modals
                    }
                }
            });


            View.ContactUsHeaderView = Marionette.ItemView.extend({
                el      : ".regs-header",
                template: "login/contactus-header",
                ui      : {}
            });

            View.ContactUsContentView = Marionette.ItemView.extend({
                template  : "login/contactus-content",
                className : "contact fix",
                initialize: function () {


                },
                ui        : {
                    feedback: "#feedback",
                    email   : "#email"
                },
                events    : {},
                onShow    : function () {
                    var self = this;
                    var feedbackTxt, email;
                    var previewTemplate =
                        '<li>' +
                        '<img  data-dz-thumbnail />' +
                        '<p data-dz-name></p>' +
                        '</li>'
                    var drop = $(".-ct-browse ul").dropzone({
                        url             : config.dcmpRESTfulIp + "/uic/contactus/email",
                        paramName       : "screenshot",
                        clickable       : "#dropzoneForm",
                        method          : "post",
                        thumbnailWidth  : 70,
                        thumbnailHeight : 50,
                        parallelUploads : 5,
                        maxFiles        : 5,
                        uploadMultiple  : true,  //多文件同时上传,
                        autoProcessQueue: false, //不自动上传
                        dictRemoveFile  : "×",
                        previewTemplate : previewTemplate,
                        addRemoveLinks  : true,
                        init            : function () {
                            var dropzoneForm = this; // closure
                            this.on("addedfile", function (file) {
                                //console.log(file);
                            });
                            this.on("maxfilesexceeded", function (file) {
                                dropzoneForm.removeFile(file);
                                alert("文件超出限制,最多5个文件！")
                            });
                            this.on("maxfilesreached", function (file) {
                                // alert("已达到文件限制大小")
                            });
                            this.on("success", function (file, xhr) {
                                console.log(xhr);
                            });
                            this.on("error", function (file, errorMessage, xhr) {
                                console.log(errorMessage);
                                console.log(xhr);
                            });
                            this.on('sendingmultiple', function (file, xhr, formData) {
                                //多文件发送中附加的字段名
                                formData.append('emailContent', feedbackTxt);
                                formData.append('contactEmail', email);
                            });
                            var submitButton = $(".-ct-set");
                            submitButton.on("click", function () {
                                var reg = new RegExp("^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$");
                                feedbackTxt = self.ui.feedback.val();
                                email = self.ui.email.val();
                                var files = dropzoneForm.files.length;  //用户上传的图片数
                                if (!feedbackTxt) {
                                    alert("反馈信息不能为空");
                                } else if (!email) {
                                    alert("邮箱不能为空");
                                } else if (!reg.test(email)) {
                                    alert("邮箱格式不正确")
                                } else if (files === 0) {
                                    request.post("/uic/contactus/email", {
                                        'emailContent': feedbackTxt,
                                        'contactEmail': email,
                                        'screenshot'  : ''
                                    }, function (data) {
                                        if (data) {
                                            alert("上传成功");
                                        } else {
                                            alert("上传失败，请重试")
                                        }
                                    })
                                } else {  //所有字段不为空，并且用户有上传图片
                                    dropzoneForm.processQueue();  // Tell Dropzone to process all queued files.
                                }
                            });
                        }
                    });
                }
            });

            View.RegisterLayout = Marionette.Layout.extend({
                el      : "body",
                template: "login/register-layout",
                regions : {
                    headerRegion: ".regs-header",
                    mainRegion  : ".regs-main",
                    dialogRegion: {
                        selector  : "#dialog-region",
                        regionType: Backbone.Marionette.Modals
                    }
                }
            });


            View.RegisterHeaderView = Marionette.ItemView.extend({
                el        : ".regs-header",
                template  : "login/register-header",
                ui        : {
                    "title": ".title-font"
                },
                initialize: function (options) {
                    this.title = options.title;
                },
                onRender  : function () {
                    this.title ? this.ui.title.html(this.title) : null;
                }
            });

            //用户注册内容视图，匹配的导航路由为 #user/register
            View.RegisterContentView = Marionette.ItemView.extend({
                template    : "login/register-content",
                className   : "region fix",
                initialize  : function () {
                    // This hooks up the validation
                    // See: http://thedersen.com/projects/backbone-validation/#using-form-model-validation/validation-binding
                    //绑定验证
                    Backbone.Validation.bind(this);
                },
                events      : {
                    //短息验证码
                    "click #verifyCodeSend": "CodeSend",

                    //注册提交按钮的单击事件，执行验证规则
                    "click #register"      : function (e) {
                        e.preventDefault() //取消a标签的默认事件
                        this.register()
                    }
                },

                //发起短信验证
                CodeSend    : function (e) {
                    var self = this;
                    var ele = $(e.currentTarget);
                    var telephoneVal = self.$el.find("#mobileNum").val();
                    var wait = 60;

                    //短息验证倒计时
                    function time() {
                        if (wait == 0) {
                            ele.prop("disabled", false);
                            ele.removeClass("disabled");
                            ele.val("免费获取验证码");
                            wait = 60;
                        } else {
                            // 按钮不可用，增加不可用样式，并且开始倒计时;
                            ele.prop("disabled", true);
                            ele.addClass("disabled");
                            ele.val("重新发送(" + wait + ")");
                            wait--;
                            setTimeout(function () {
                                    time();
                                },
                                1000
                            );
                        }
                    }

                    if (telephoneVal) {
                        var data = {mobileNum: telephoneVal};
                        this.trigger('user:validateing', data);
                        time();
                    }

                },
                //注册
                register    : function () {
                    //序列化数据表单
                    var data = this.$el.find("form").serializeObject();
                    //重新设置属性
                    this.model.set(data);
                    // Check if the model is valid before saving
                    // See: http://thedersen.com/projects/backbone-validation/#methods/isvalid
                    //如果全部通过验证规则
                    if (this.model.isValid(true)) {
                        this.trigger('user:registing', data);
                    }
                },
                //移除验证事件
                remove      : function () {
                    // Remove the validation binding
                    // See: http://thedersen.com/projects/backbone-validation/#using-form-model-validation/unbinding
                    Backbone.Validation.unbind(this);
                    return Backbone.View.prototype.remove.apply(this, arguments);
                },
                onDomRefresh: function () {
                    var self = this;
                    //注册文本输入及时验证
                    this.$('input').keyup(function (e) {
                        var type = $(e.currentTarget).attr('name').toLowerCase();
                        var value = $(e.currentTarget).val();
                        switch (type) {
                            case 'usercode':
                                self.model.set({'userCode': value}, {validate: true});
                                break;
                            case 'password':
                                self.model.set({'password': value}, {validate: true});
                                break;
                            case 'repeatpassword':
                                self.model.set({'repeatPassword': value}, {validate: true});
                                break;
                            case 'mobilenum':
                                self.model.set({'mobileNum': value}, {validate: true});
                                break;
                            case 'verificationcode':
                                self.model.set({'verificationCode': value}, {validate: true});
                                break;
                            case 'email':
                                self.model.set({'email': value}, {validate: true});
                                break;
                            default:
                                break;
                        }
                    });
                }
            });
        });
        return CloudMamManager.LoginApp.Login.View;
    });