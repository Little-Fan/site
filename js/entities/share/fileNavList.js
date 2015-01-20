define(["app"], function (CloudMamManager) {
    CloudMamManager.module("Entities", function (Entities, CloudMamManager, Backbone, Marionette, $, _) {
        Entities.Subnav = Backbone.Model.extend({
            default: {
                folderName: "未知文件夹",
                index : 0
            }
        });

        Entities.SubnavCollection = Backbone.Collection.extend({
            model: Entities.Subnav
        });

        var initializeSubnavs = function () {
            Entities.subnavs = new Entities.SubnavCollection(
                    [
                        { folderName: '全部文件0', index:0},
                        { folderName: '全部文件1', index:1},
                        { folderName: '全部文件2', index:2},
                        { folderName: '全部文件3', index:3}
                    ]
				
            );

            Entities.subnavs.comparator = function(Entities) {
                return Entities.Subnav.get("index");
            };
        };

        var api = {
            getSubnavs: function () {
                if (Entities.subnavs === undefined) {
                    initializeSubnavs();
                }
                return Entities.subnavs;
            }
        };

        CloudMamManager.reqres.setHandler("subnav:entities", function () {
            return api.getSubnavs();
        });

    });

    return;
});
