define(["app", "config", "request", "backbone.picky"], function (CloudMamManager, config, request) {
    CloudMamManager.module("Cut.Fragment", function (Fragment, CloudMamManager, Backbone, Marionette, $, _) {
        
        //声明model
        Fragment.Model = Backbone.Model.extend({
            urlRoot: "/ac/sequence",
            initialize: function () {//初始化
                var selectable = new Backbone.Picky.Selectable(this);
                _.extend(this, selectable);
            }
        });
        //声明Collection
        Fragment.Collection = Backbone.Collection.extend({
            model: Fragment.Model,
            initialize: function () {//初始化
                var singleSelect = new Backbone.Picky.SingleSelect(this);
                _.extend(this, singleSelect);
            }
        });
        //接口
        var api = {

            //Unit test
            getFragments: function () {//获取所有剪切片段
                //var fragments = new Fragment.Collection();

                ////异步请求
                //var defer = Backbone.$.Defered();
                ////请求片段
                //var response = fragments.fetch();//可以定制请求url

                //response.done(function () {
                //    defer.resolveWith(response, [fragments]);
                //}).fail(function () {
                //    defer.rejectWith(response, arguments);
                //});

                //return defer.promise();

                var fragments = new Fragment.Collection([
                    {
                        keyFramePath: "http://172.16.135.124:80/keyframe/Clip/2014/08/04/a523Cq3Rf1W327r3ddJo2rh76Z0U5Ulu/e7a3fafa-2842-4e44-a0e2-96ea6c8da660.jpg",
                        title: "剪切片段1",
                        duration: "00:00:06.37"
                    },
                    {
                        keyFramePath: "http://172.16.135.124:80/keyframe/Clip/2014/08/04/a523Cq3Rf1W327r3ddJo2rh76Z0U5Ulu/e7a3fafa-2842-4e44-a0e2-96ea6c8da660.jpg",
                        title: "剪切片段2",
                        duration: "00:00:06.37"
                    },
                    {
                        keyFramePath: "http://172.16.135.124:80/keyframe/Clip/2014/08/04/a523Cq3Rf1W327r3ddJo2rh76Z0U5Ulu/e7a3fafa-2842-4e44-a0e2-96ea6c8da660.jpg",
                        title: "剪切片段3",
                        duration: "00:00:06.37"
                    }
                ]);

                return fragments;
            },
            createFragement: function (data) {
                return request.post("/ac/sequence", data);
            },
            renameFragement: function (data) {
                return request.put("/ac/sequence/" + data.id, data);
            },
            sortFragments: function (ids) {
                return request.post("/ac/sequence/" + ids);
            },
            synthesisNewClip: function(id) {
                return request.postForm("/ac/mixture/" + id, { name: "" });
            },
            createCut: function (data) {
                return request.post("/ac/activity", data);
            }
        };

        CloudMamManager.reqres.setHandler("cut:fragments", function () {//返回剪切片段
            return api.getFragments();
        });

        CloudMamManager.reqres.setHandler("create:fragement", function (data) {//新增片段
            return api.createFragement(data);
        });

        CloudMamManager.reqres.setHandler("rename:fragement", function (data) {//重命名片段
            return api.renameFragement(data);
        });

        CloudMamManager.reqres.setHandler("sort:fragment", function (ids) {//片段排序
            return api.sortFragments(ids);
        });

        CloudMamManager.reqres.setHandler("synthesis:newclip", function (id) {//合成新素材
            return api.synthesisNewClip(id);
        });

        CloudMamManager.reqres.setHandler("create:cut", function (data) {//创建cut
            return api.createCut(data);
        });
    });
    return CloudMamManager.Cut.Fragment;
});