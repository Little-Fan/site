define(["app", "config", "jquery", "backbone.validation", "request"], function (CloudMamManager, config, $, validation, request) {

    _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

    // See: http://thedersen.com/projects/backbone-validation/#configuration/callbacks
    //覆盖默认的验证，这样可以做到个性化自定义验证，用自己写的方法来做提消息提醒
    _.extend(Backbone.Validation.callbacks, {
        valid  : function (view, attr, selector) {
            var $el = view.$('[name=' + attr + ']'),
                $group = $el.closest('.form-group');
            $group.removeClass('has-error');
            $group.find('span').html('').removeClass().addClass('success');
        },
        invalid: function (view, attr, error, selector) {
            var $el = view.$('[name=' + attr + ']'),
                $group = $el.closest('.form-group');
            $group.addClass('has-error');
            $group.find('span').html(error).removeClass().addClass("error");
        }
    });

    var Login = Backbone.Model.extend({
        urlRoot: '/uic/login'
    });

    var RegisterModel = Backbone.Model.extend({
        url: "/uic/register",
        default: {
            captcha: ""
        },
        //定义这个模块的验证规则
        validation: {
            userCode: [
                {
                    required: true,
                    msg: '用户名不能为空'
                }, {
                    pattern: /^\w{4,20}$/,
                    msg: "用户名为4到20字母或数字"
                }
            ],
            password: {
                pattern: /^[0-9A-Za-z_]{6,15}$/,
                msg: "密码错误"
            },
            repeatPassword: {
                required: true,
                equalTo: 'password',
                msg    : '密码不一致'
            },
            mobileNum           : {
                required: true,
                length  : 11,
                msg: "电话错误"
            },
            verificationCode       : {
                required: true,
                length  : 5,
                msg: "验证码错误"
            },
            email         : [{
                required: true,
                msg     : '请输入一个邮箱地址'
            }, {
                pattern: 'email',
                msg    : '邮箱是无效的'
            }]
        }
    });


    var api = {

        userLogin   : function (options) {
            var data = _.extend(options, {rememberMe: false, logintype: "web"});
            return request.postForm('/uic/login', data);
        },
        userRegister: function (options) {
            return request.post('/uic/register', options);
        },
        userValidate: function (options) {
            return request.get('/uic/verificationCode', options);
        }
    };


    CloudMamManager.reqres.setHandler("user:login", function (options) {
        return api.userLogin(options);
    });
    CloudMamManager.reqres.setHandler("user:registing", function (options) {
        return api.userRegister(options);
    });
    CloudMamManager.reqres.setHandler("user:validateing", function (options) {
        return api.userValidate(options);
    });
    //取得注册模块的实例
    CloudMamManager.reqres.setHandler("register:entity:new", function () {
        return new RegisterModel();
    });
    return Login;
});