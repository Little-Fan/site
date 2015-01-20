define(['backbone', 'config', "apps/common/utility"], function (Backbone, config, utility) {
    //定制自己的请求方式

    var originalSync = Backbone.sync;
    //重新Backbone.sync
    Backbone.sync = function (method, model, options) {
        var deferred = $.Deferred();
        options || (options = {});
        //新建操作
        if (method.toUpperCase() === 'CREATE') {
            //options.data = model ? JSON.stringify(model) : null; //$.param(JSON.parse(JSON.stringify(model))) : '';
        }
        //修改操作
        if (method.toUpperCase() === 'UPDATE') {
            //console.log(method + " request");
            //options.url += "?" + $.param(JSON.parse(JSON.stringify(model)));            
        }

        if (method.toUpperCase() === 'DELETE') {
            console.log("Http " + method + " request!");
        }

        if (method.toUpperCase() === "READ") {
            utility.tools.setMask({ type: 'loading' });
        }
        if (!options.url) {
            options.url = _.result(model, 'url');
        }
        options.url =  config.dcmpRESTfulIp + options.url;

        deferred.then(options.success, options.error);

        var response = originalSync(method, model, _.omit(options, "success", "error"));
        //notify.showLoading();
        response.done(deferred.resolve).done(function () {
            utility.tools.removeMask();
            //notify.closeLoading();
        }).fail(function () {
            var returnurl = encodeURIComponent(window.location.href);
            if (response.status == 401) {
                utility.localStorage.clearSidCookie();//清除验证cookie
                utility.localStorage.SetGuideViewFlag(false);
                utility.tools.setMask({ type: 'timeout' });
                return;
                //notify.info("认证失败，请重新登录<br />错误代码"+response.status,"失败消息");
            } else if (response.status == 403) {
                //notify.info("未处理错误<br />错误代码" + response.status, "失败消息");
                return;
            } else if (response.status == 500) {
                //notify.info("未处理错误<br />错误代码"+response.status);
                return;
            } else {
                deferred.rejectWith(response, arguments);
            }
            deferred.rejectWith(response, arguments);
        });
        return deferred.promise();
    };
});