define(["app"], function (CloudMamManager) {
    CloudMamManager.module("Entities", function (Entities, CloudMamManager, Backbone, Marionette, $, _) {

        Entities.fileTreeModel = Backbone.Model.extend({});


        var API = {

            getFileTree: function (options) {

                var fileTree = new Entities.fileTreeModel({});

                fileTree.url =  "/emc/share/entity/"+options.userShareId+"/"+options.folderCode;

                var defer = $.Deferred();
                var response = fileTree.fetch(_.omit(options, "success", "error"));

                response.done(function () {
                    defer.resolveWith(response, [fileTree]);
                }).fail(function () {
                    defer.rejectWith(response, arguments);
                });

                return defer.promise();

            }
        };

        CloudMamManager.reqres.setHandler("fileTree:entities", function (options) {
            return API.getFileTree(options);
        });

    });

});