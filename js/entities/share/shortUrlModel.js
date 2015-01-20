define(["app"], function (CloudMamManager) {
    CloudMamManager.module("Entities", function (Entities, CloudMamManager, Backbone, Marionette, $, _) {
        Entities.shortUrlModel = Backbone.Model.extend({});

        var API = {
            getShortUrl: function (shortUrl) {
                var urlModel = new Entities.shortUrlModel({});
                urlModel.url =  "/emc/share/shortUrl/"+shortUrl;
                var defer = $.Deferred();
                var response = urlModel.fetch();
                response.done(function () {
                    defer.resolveWith(response, [urlModel]);
                }).fail(function () {
                    defer.rejectWith(response, arguments);
                });
                return defer.promise();
            }
        };

        CloudMamManager.reqres.setHandler("shortUrl:entities", function (shortUrl) {
            return API.getShortUrl(shortUrl);
        });
    });

});