define(["app"], function (CloudMamManager) {
    CloudMamManager.module("ShareApp", function (ShareApp, CloudMamManager, Backbone, Marionette, $, _) {
        this.startWithParent = false;
        this.onBeforeStart = function () {
            //require('utils/validateUser', function (ValidateUser) {
            //    //ToDo 加载验证模块并进行验证,否则路由到登陆页面 (若后台REST接口调用DB已做过Session判断则不需要)
            //    //ValidateUser.validate();
            //});
        };

        this.onBeforeStop = function () {
            //ToDo 释放父级module ,避免僵尸
        };

        this.onStart = function () {
            //ToDo 启动父Module
            console.log("ShareApp has started");
        };

        this.onStop = function () {
            //ToDo 停止父级Module
            console.log("ShareApp has stopped");
        };
    });

    CloudMamManager.module("Routers.ShareApp", function (ShareAppRouter, CloudMamManager, Backbone, Marionette, $, _) {

        ShareAppRouter.Router = Marionette.AppRouter.extend({
            appRoutes: {
                "share/:shortUrl": "showShare"
            }

        });

        var excuteAction = function (action, options) {
            CloudMamManager.startSubApp("ShareApp");
            action(options);
        };


        var api = {

            showShare: function (shortUrl) {
                require(["apps/share/list/share_controller"], function (ShareController) {
                    excuteAction(ShareController.showShare, shortUrl);
                });
            }
        };

        CloudMamManager.addInitializer(function () {
            new ShareAppRouter.Router({
                controller: api
            });
        });
    });

    return CloudMamManager.ShareAppRouter;
});