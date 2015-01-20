define(["app", "apps/common/views", "apps/share/list/share_view", "config", "apps/common/utility", "jquery.cookie"], function (CloudMamManager, CommonViews, View, config, utility) {
    CloudMamManager.module("ShareApp.Share", function (Share, CloudMamManager, Backbone, Marionette, $, _) {

        this.startWithParent = false;

        this.onStart = function () {

        };

        this.onStop = function () {

        };

        var shareController = Marionette.Controller.extend({});


        _.extend(shareController.prototype, {
            
            showShare: function (shortUrl) {

                /*初始化动画*/
                var loadingView = new CommonViews.Loading({
                    title: "loading",
                    message: "loading data from server, pls wait a moment."
                });
                CloudMamManager.bodyRegion.show(loadingView);

                var shareLayout = new View.ShareLayout();
                CloudMamManager.bodyRegion.show(shareLayout);

                //头部视图
                var headerView = new View.HeaderContenView();
                shareLayout.headerContentRegion.show(headerView);

                CloudMamManager.listenTo(View, 'share:continue', function (options) {
                    require(['entities/share/shareModel'], function (shareModel) {
                        var shareFetching = CloudMamManager.request("shareList:entities", options);
                        $.when(shareFetching).done(function (response) {
                            //分享信息显示
                            var shareView = new View.ShareDataView({
                                model: response
                            });
                            //列表内容
                            var contentView = new View.ContentListView({
                                model: response
                            });
                            //文件夹导航视图
                            var controlView = new View.ControlPanelView({});

                            CloudMamManager.listenTo(controlView, 'share:nav:all', function (option) {
                                var contentView = new View.ContentListView({
                                    model: response
                                });
                                shareLayout.contentListRegion.show(contentView);
                            });
                            shareLayout.controlPanelRegion.show(controlView);
                            shareLayout.shareDataRegion.show(shareView);
                            shareLayout.contentListRegion.show(contentView);
                        })
                    })
                })

                CloudMamManager.listenTo(View, 'share:dialog', function (options) {
                    require(["apps/share/dialog/dialog_view",], function (Dialog) {
                        var moveToForm = new Dialog.MoveToForm(options);
                            shareLayout.dialogRegion.show(moveToForm);
                    })
                })

                var isOpen = false;
                $.cookie.json = true;
                var cookieDictionary =  $.cookie("dictionary");
                if (cookieDictionary) {
                    $.each(cookieDictionary,function(key,value){
                        if ( key === shortUrl) {
                            isOpen = true;
                            View.trigger('share:continue',{shortUrl:key,accessCode:value});
                            return false;
                        }
                    })
                }

                if (!isOpen) {
                    require(['entities/share/shortUrlModel'], function (shortUrlModel) {
                        var shareFetching = CloudMamManager.request("shortUrl:entities", shortUrl);
                        $.when(shareFetching).done(function (response) {
                            var pickUpView = new View.PickUpView({
                                shortUrl: shortUrl,
                                model   : response
                            });
                            shareLayout.contentListRegion.show(pickUpView);
                        })
                    })
                }
            }
        });
        Share.Controller = new shareController();

        Share.Controller.listenTo(CloudMamManager.MyCloudApp, 'stop', function () {
            Share.Controller.close();
        });

    });
    return CloudMamManager.ShareApp.Share.Controller;
});

