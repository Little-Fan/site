define(["app"], function (CloudMamManager) {
    CloudMamManager.module("Entities", function (Entities, CloudMamManager, Backbone, Marionette, $, _) {

        Entities.shareModel = Backbone.Model.extend({});


        var API = {

            getShareList: function (options) {



                var shareList = new Entities.shareModel({});

                shareList.url =  "/emc/share/shortUrl/"+options.shortUrl+"/"+options.accessCode;

                var defer = $.Deferred();
                var response = shareList.fetch(_.omit(options, "success", "error"));

                response.done(function () {
                    defer.resolveWith(response, [shareList]);
                }).fail(function () {
                    defer.rejectWith(response, arguments);
                });
                return defer.promise();

            }
        };


        CloudMamManager.reqres.setHandler("shareList:entities", function (options) {
            return API.getShareList(options);
        });

    });

});