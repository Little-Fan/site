define(["app", "apps/common/views", "apps/mycloud/dialog/dialog_view","apps/common/utility", "utils/templates", "jquery-ui", "tooltipster"], function (CloudMamManager, CommonViews, Dialog, utility, templates) {
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
            template: "login/login-content",
            className: "login-box",
            ui: {
                "register": ".register",
                "login": ".login",
                "username": "#js_user",
                "password": "#js_password",
                "forget": ".login-forget",
                "error": ".js-error"
            },
            events: {
                "click @ui.register": "register",
                "click @ui.login": "login",
                "click @ui.forget": "forget",
                "keydown @ui.password": "enterLogin"
            },
            register: function(e) {
                this.trigger('user:register');
            },
            login: function (e) {
                this.ui.error.html('');
                var data = { username: this.ui.username.val(), password: this.ui.password.val() };
                var validate = this.validate(data);
                //后台登陆
                validate ? this.trigger('user:login', data) : null;
            },
            enterLogin: function(e) {
                if( e.which === 13 ) {
                  this.login();
                }
            },
            forget: function() {
                this.trigger('user:forgetPassword');
            },
            //本地验证
            validate: function (data) {
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
            onRender: function () {
                $('body').addClass('login-bg');
                if (utility.localStorage.getUserInfo())
                    this.ui.username.val(utility.localStorage.getUserInfo().info.userCode);
            }
        });

        View.ForgetFirstStep = Marionette.ItemView.extend({
            template: "login/forget-firststep",
            className: "fg-wrapper",
            ui: {
                "firstnext": ".js-first-next"
            },
            events: {
                "click @ui.firstnext": "firstNextStep"
            },
            firstNextStep: function() {
                this.trigger('first:nextstep');
            }
        });
        View.ForgetSecondStep = Marionette.ItemView.extend({
            template: "login/forget-secondstep",
            className: "fg-wrapper",
            ui: {
                "secondtnext": ".js-second-next"
            },
            events: {
                "click @ui.secondtnext": "secondNextStep"
            },
            secondNextStep: function () {
                this.trigger('second:nextstep');
            }
        });
        View.ForgetThirdStep = Marionette.ItemView.extend({
            template: "login/forget-thirdstep",
            className: "fg-wrapper",
            ui: {
                "thirdtnext": ".js-third-next"
            },
            events: {
                "click @ui.thirdtnext": "thirdNextStep"
            },
            thirdNextStep: function () {
                this.trigger('third:nextstep');
            }
        });
        View.ForgetLastStep = Marionette.ItemView.extend({
            template: "login/forget-laststep",
            className: "fg-wrapper",
            ui: {

            }
        });

        
        View.ForgetPswLayout = Marionette.Layout.extend({
            el: "body",
            template: "login/forgetpsw-layout",
            regions: {
                mainRegion: ".regs-main",
                dialogRegion: {
                    selector: "#dialog-region",
                    regionType: Backbone.Marionette.Modals
                }
            }
        });


        View.ContactUsHeaderView = Marionette.ItemView.extend({
            el: ".regs-header",
            template: "login/contactus-header",
            ui: {

            }
        });

        View.ContactUsContentView = Marionette.ItemView.extend({
            template: "login/contactus-content",
            className: "contact fix",
            initialize: function() {
                
            },
            events: {
                
            },
        });

        View.RegisterLayout = Marionette.Layout.extend({
            el: "body",
            template: "login/register-layout",
            regions: {
                headerRegion: ".regs-header",
                mainRegion: ".regs-main",
                dialogRegion: {
                    selector: "#dialog-region",
                    regionType: Backbone.Marionette.Modals
                }
            }
        });

        
        View.RegisterHeaderView = Marionette.ItemView.extend({
            el: ".regs-header",
            template: "login/register-header",
            ui: {
                "title": ".title-font"
            },
            initialize: function(options) {
                this.title = options.title;
            },
            onRender: function() {
                this.title ? this.ui.title.html(this.title) : null;
            }
        });

        //用户注册内容视图，匹配的导航路由为 #user/register
        View.RegisterContentView = Marionette.ItemView.extend({
            template: "login/register-content",
            className: "region fix",
            initialize: function() {
                // This hooks up the validation
                // See: http://thedersen.com/projects/backbone-validation/#using-form-model-validation/validation-binding
                //绑定验证
                Backbone.Validation.bind(this);
            },
            events: {
                //短息验证码
                "click #verifyCodeSend": "CodeSend",

                //注册提交按钮的单击事件，执行验证规则
                "click #register": function(e) {
                    e.preventDefault() //取消a标签的默认事件
                    this.register()
                }
            },

            //发起短信验证
            CodeSend: function(e) {
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
                        setTimeout(function() {
                                time();
                            },
                            1000
                        );
                    }
                }

                if (telephoneVal) {
                    var data = { mobileNum: telephoneVal };
                    this.trigger('user:validateing', data);
                    time();
                }

            },
            //注册
            register: function() {
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
            remove: function() {
                // Remove the validation binding
                // See: http://thedersen.com/projects/backbone-validation/#using-form-model-validation/unbinding
                Backbone.Validation.unbind(this);
                return Backbone.View.prototype.remove.apply(this, arguments);
            },
            onDomRefresh: function () {
                var self = this;
                //注册文本输入及时验证
                this.$('input').keyup(function(e) {
                    var type = $(e.currentTarget).attr('name').toLowerCase();
                    var value = $(e.currentTarget).val();
                    switch (type) {
                        case 'usercode':
                            self.model.set({ 'userCode': value }, { validate: true });
                            break;
                        case 'password':
                            self.model.set({ 'password': value }, {validate:true});
                            break;
                        case 'repeatpassword':
                            self.model.set({ 'repeatPassword': value }, { validate: true });
                            break;
                        case 'mobilenum':
                            self.model.set({ 'mobileNum': value }, { validate: true });
                            break;
                        case 'verificationcode':
                            self.model.set({ 'verificationCode': value }, { validate: true });
                            break;
                        case 'email':
                            self.model.set({ 'email': value }, { validate: true });
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