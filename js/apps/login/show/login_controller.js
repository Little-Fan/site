define(["app", "apps/common/views", "apps/login/show/login_view", "apps/common/utility", "backbone.validation"], function (CloudMamManager, CommonViews, View, utility) {

    CloudMamManager.module("LoginApp.Login", function (Login, CloudMamManager, Backbone, Marionette, $, _) {

        this.startWithParent = false;

        this.onStart = function () {

        };

        this.onStop = function () {

        };

        var LoginController = Marionette.Controller.extend({});


        _.extend(LoginController.prototype, {
            showLogin: function (options) {

                var self = Login.Controller;
                
                var loginView = new View.LoginView();
                CloudMamManager.bodyRegion.show(loginView);

                require(["entities/login/loginModel"], function() {
                    //跳转注册
                    self.listenTo(loginView, 'user:register', function () {
                        CloudMamManager.trigger('user:register');
                    });

                    //登陆
                    self.listenTo(loginView, 'user:login', function (option) {
                        var logining = CloudMamManager.request("user:login", option);
                        $.when(logining).done(function (res) {
                            if (res.status == 200) {
                                var cookie = document.cookie;
                                //本地存储
                                utility.localStorage.saveUserInfo(res.userInfo);
                                //优先判定是否从其他地方导航到登陆
                                if ($.cookie("source")) {
                                    window.location.href = $.cookie("source");
                                } else {
                                    CloudMamManager.trigger('user:login');
                                }
                            } else {
                                loginView.ui.password.val('').focus();
                                loginView.ui.error.html('用户名或密码错误');
                            }

                        }).fail(function (res) {
                            loginView.ui.password.val('').focus();
                            loginView.ui.error.html('用户名或密码错误');
                        });
                    });

                    //忘记密码
                    self.listenTo(loginView, 'user:forgetPassword', function () {
                        CloudMamManager.trigger('user:forgetPassword');
                    });
                });
            },

            showRegister: function (options) {
                var self = Login.Controller;

                //实例化layout
                var registerLayout = new View.RegisterLayout();
                //渲染到body中，给他指定了el为body
                registerLayout.render();

                //ToDo 注意，请到login_view.js中查看这个视图构造函数
                //ToDo 当registerLayout.render()以后才能实例化这个实例，因为我在这个实图中指定了一个el为registerLayout的一个element
                var registerHeaderView = new View.RegisterHeaderView({title: ""});    //layout
                //渲染到元素节点上
                registerHeaderView.render();

                require(["entities/login/loginModel"], function () {
                    //获取用户注册页面的MODEL
                    var newRegister = CloudMamManager.request("register:entity:new");

                    //视图绑定数据，双向绑定
                    var registerContentView = new View.RegisterContentView({
                        model: newRegister
                    });

                    //把视图渲染到节点上
                    registerLayout.mainRegion.show(registerContentView);


                    //手机验证
                    self.listenTo(registerContentView, 'user:validateing', function (option) {
                        var validateing = CloudMamManager.request("user:validateing", option);
                        $.when(validateing).done(function (res) {
                        }).fail(function (res) {
                            //var resdata = JSON.parse(res.responseText);
                            //alert(resdata.message);
                        });
                    });

                    //注册
                    self.listenTo(registerContentView, 'user:registing', function (option) {
                        var registering = CloudMamManager.request("user:registing", option);
                        $.when(registering).done(function (res) {
                            //ToDo跳转显示成功
                            if (res.status != "0")
                                CloudMamManager.trigger('login:init');
                            else
                                alert(res.msg);
                        }).fail(function (res) {
                            //var resdata = JSON.parse(res.responseText);
                            //alert(resdata.message);
                        });
                    });
                });
            },

            showForgotPsw: function (options) {
                var self = Login.Controller;

                var forgetPswLayout = new View.ForgetPswLayout();
                //请查看上面showRegister方法
                forgetPswLayout.render();

                //不显示头部
                //var registerHeaderView = new View.RegisterHeaderView({ title: '找回密码' });  
                ////渲染到元素节点上
                //registerHeaderView.render();

                var forgetFirstStep = new View.ForgetFirstStep();

                forgetPswLayout.mainRegion.show(forgetFirstStep);

                var forgetSecondStep,forgetThirdStep,forgetLastStep;

                self.listenTo(View, "first:nextstep", function (options) {
                    forgetSecondStep = new View.ForgetSecondStep(options);
                    forgetPswLayout.mainRegion.show(forgetSecondStep);
                });

                self.listenTo(View, "second:nextstep", function () {
                    forgetThirdStep = new View.ForgetThirdStep();
                    forgetPswLayout.mainRegion.show(forgetThirdStep);
                });

                self.listenTo(View, "third:nextstep", function () {
                    forgetLastStep = new View.ForgetLastStep();
                    forgetPswLayout.mainRegion.show(forgetLastStep);
                });
            },

            //联系我们
            showContactUs: function(options) {
                var self = Login.Controller;
                //复用注册页面的布局
                var registerLayout = new View.RegisterLayout();
                registerLayout.render();

                var contactusHeaderView = new View.ContactUsHeaderView();
                contactusHeaderView.render();

                var contactUsContent = new View.ContactUsContentView();

                registerLayout.mainRegion.show(contactUsContent);



            }
        });
        Login.Controller = new LoginController();
        Login.Controller.listenTo(CloudMamManager.LoginApp, 'stop', function () {
            Login.Controller.close();
        });
    });
    return CloudMamManager.LoginApp.Login.Controller;
});

