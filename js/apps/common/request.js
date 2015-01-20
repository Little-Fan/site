define(['backbone', 'underscore', 'config', "apps/common/utility"], function (Backbone, _, config, utility) {
    /* model必须为JSON格式 */
    function request(options) {
        this.baseUrl = config.dcmpRESTfulIp;
        this.upLoadRESTfulIp = config.upLoadRESTfulIp;
        this.options = {
            type: 'GET',
            data: null,
            dataType: 'JSON',
            url: this.baseUrl ,
            contentType: 'application/json; charset=utf-8',
            success: null,
            error: function (req, status, ex) {  },
            timeout: 60000
        }
    }

    request.prototype = {
        constructor: this,
        commonConstructor: function(type) {
            
        },
        error: function (status) {
            if (status == 500) {
                return;
            }
            if (status == 401) {
                utility.localStorage.clearSidCookie();//清除验证cookie
                utility.localStorage.SetGuideViewFlag(false);
                utility.tools.setMask({ type: 'timeout' });
                return;
            }
        },
        postForm: function (restUrl, model, callback) {
            var self = this;
            var response = Backbone.ajax(
                {
                type: 'POST',
                url: this.baseUrl + restUrl,
                data: model ? $.param(model) : null,
                dataType: 'JSON',
                processData: false,
                contentType: 'application/x-www-form-urlencoded',
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
                }
            );
            return response.promise();
        },
        post: function (restUrl, model, callback) {
            var self = this;
            var response = Backbone.ajax({
                type: 'POST',
                url: this.baseUrl + restUrl,
                data: model ? JSON.stringify(model) : null,
                dataType: 'JSON',
                processData: false,
                contentType: 'application/json; charset=utf-8',
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        },
        syncPost: function (restUrl, model, callback) {
            var self = this;
            var response = Backbone.ajax({
                type: 'POST',
                url: this.baseUrl + restUrl,
                data: model ? JSON.stringify(model) : null,
                dataType: 'JSON',
                processData: false,
                contentType: 'application/json; charset=utf-8',
                async: false,
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        },
        put: function (restUrl, model, callback) {
            var self = this;
            var response = Backbone.ajax({
                type: 'PUT',
                url: this.baseUrl + restUrl,
                data: model ? JSON.stringify(model) : null,
                dataType: 'JSON',
                processData: false,
                contentType: 'application/json; charset=utf-8',
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        },
        get: function (restUrl, model, callback, noloading) {
            var self = this;
            noloading ? null : utility.tools.setMask({ type: 'loading' });
            var response = Backbone.ajax({
                type: 'GET',
                data: model ? $.param(model) : null,
                dataType: 'JSON',
                url: this.baseUrl + restUrl,
                contentType: 'application/json; charset=utf-8',
                success: function (data, textStatus) {
                    utility.tools.removeMask();
                    callback && callback(data, textStatus);
                },
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        },
        remove: function (restUrl, id, callback) {
            var self = this;
            var response = Backbone.ajax({
                type: 'DELETE',
                dataType: 'JSON',
                url: id ? this.baseUrl + restUrl + '/' + id : this.baseUrl + restUrl,
                contentType: 'application/json; charset=utf-8',
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        },
        find: function (restUrl, id, callback) {
            var self = this;
            var response = Backbone.ajax({
                type: 'GET',
                url: id ? (this.baseUrl + restUrl + '/' + id) : (this.baseUrl + restUrl),
                contentType: 'application/json; charset=utf-8',
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        },
        findAll: function (restUrl, callback) {
            var self = this;
            var response = Backbone.ajax({
                type: 'GET',
                url: this.baseUrl + restUrl,
                contentType: 'application/json; charset=utf-8',
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        },
        download: function (restUrl, model, callback) {
            var self = this;
            var response = Backbone.ajax({
                type: 'GET',
                data: model ? $.param(model) : null,
                dataType: 'JSON',
                url: this.upLoadRESTfulIp + restUrl,
                contentType: 'application/json; charset=utf-8',
                success: callback,
                error: function (req, status, ex) { self.error(req.status); },
                timeout: 60000
            });
            return response.promise();
        }
    }

    return  new request();
});