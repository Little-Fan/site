define(["app", "apps/common/views", "config", "apps/common/utility", "jquery-ui", "mCustomScrollbar", "backbone.notifier", "jquery.cookie", "notifierHelper"], function (CloudMamManager, CommonViews, config, utility) {

    CloudMamManager.module("ShareApp.Share.View", function (View, CloudMamManager, Backbone, Marionette, $, _) {
        View.ShareLayout = Marionette.Layout.extend({
            template: "share/share-layout",
            regions : {
                headerContentRegion: ".header",
                shareDataRegion    : ".share-data",
                controlPanelRegion : ".control-panel",
                contentListRegion  : ".share-content",
                dialogRegion       : {
                    selector  : "#dialog-region",
                    regionType: Backbone.Marionette.Modals
                }
            },
            onShow  : function () {
                this.$el.find(".content-list").mCustomScrollbar();
            }
        });

        View.PickUpView = View.HeaderContenView = Marionette.ItemView.extend({
            template: "share/share-pick-up",
            initialize: function (options) {
                var self = this;
                this.shortUrl =  options.shortUrl;
                this.dialog = function (msg){
                    notifier.notify({
                        theme: 'clean',
                        message: msg,
                        'type': "warning",
                        closeBtn: true,
                        modal: true,
                        ms: null,
                        destroy: false
                    })
                }
                $(".content-list").css("borderWidth", 0);
            },
            events: {
                "click #pick-btn": "pick"
            },
            pick: function (e,code) {
                var self = this;
                var code = this.$("#pick-code").val() || code;
                if(!code) {
                    self.dialog("提取码不能为空！");
                } else {
                    $.ajax({
                        type: "GET",
                        url: config.dcmpRESTfulIp+ "/emc/share/shortUrl/"+self.shortUrl+"/"+code,
                        success: function(data) {
                            var data = $.parseJSON(data);   //转换成JSON格式
                            switch (data.status) {
                                case 0:
                                    var share = {
                                        shortUrl  : self.shortUrl,
                                        accessCode: code
                                    }
                                    View.trigger('share:continue', share);
                                    $.cookie.json = true;
                                    var dictionary = typeof $.cookie("dictionary") === "object" ? $.cookie("dictionary") : {};
                                    dictionary[self.shortUrl] = code;
                                    $.cookie("dictionary",dictionary,{ expires: 1, path: '/'});   //下次再次打开，不需要重新输入。
                                    $(".content-list").css("borderWidth", 2);
                                    break;
                                case 1:
                                    self.dialog("分享不存在或已删除！");
                                    break;
                                case 2:
                                    self.dialog("已取消分享！");
                                    break;
                                case 3:
                                    self.dialog("分享已过期！");
                                    break;
                                case 4:
                                    self.dialog("素材已被删除！");
                                    break;
                                case 5:
                                    self.dialog("提取码输入错误！");
                                    break;
                                default :
                                    self.dialog("未知错误，请重试！");
                            }
                        }
                    })
                }
            }
        })

        View.HeaderContenView = Marionette.ItemView.extend({
            template: "share/share-header-content"
        })

        View.ShareDataView = Marionette.ItemView.extend({
            template: "share/share-data",
            initialize: function (optinos) {
                this.shortUrl = optinos.shortUrl;
            },
            ui: {
                "file": ".file-name"
            },
            events  : {
                "click .cancel": "cancelShare",
                "click .save"  : "save",
                "click .down" : "download"
            },
            getContentIds : function(){
                var selectLength = 0, contentIds = [];
                $(".share-list li").each(function (index) {
                    if ($(this).hasClass('select')) {
                        selectLength++;
                        var contentid = $(this).find(".thumb").data("contentid");
                        contentIds.push(contentid);
                    }
                })
                return {
                    len: selectLength,
                    arr: contentIds
                }
            },
            dialog : function (msg) {
                notifier.notify({
                    theme   : 'clean',
                    message : msg,
                    'type'  : "warning",
                    closeBtn: true,
                    modal   : true,
                    ms      : null,
                    destroy : false
                })
            },
            download:function(e){
                var contentInfo = this.getContentIds();
                var id = this.ui.file.data("id");
                var url = config.upLoadRESTfulIp + "/api/getfile/" + id + "/" + contentInfo.arr.join(",");
                window.open(url);
                return false;
            },
            save    : function (e) {
                var userInfo = utility.localStorage.getUserInfo();
                var contentInfo = this.getContentIds();
                if(userInfo) {
                    e.preventDefault();
                    //如果选择了素材
                    if (contentInfo.len > 0){
                        View.trigger('share:dialog', {
                            list: {
                                userShareId: $(".file-name").data("id"),
                                contentIds : contentIds.join(","),
                                creatorCode: $(".file-name").data("creatorcode")
                            }
                        });   //弹出转存的对话框
                    } else {
                        this.dialog("没有选中要转存的素材！");
                    }
                } else {
                    $.cookie("source",location.href);
                }
            },
            cancelShare: function(e){
                console.log(notifier);
                var id = $(e.currentTarget).data("id");
                var confirmMsg = notifier.notify({
                    title: "确认取消分享",
                    message: "取消分享后，该条分享记录将被删除，好友将无法再访问此分享链接。<br />你确认要取消分享吗？",
                    buttons: [
                        {'data-role': 'ok', text: '确定'},
                        {'data-role': 'cancel', text: '取消'}
                    ],
                    modal: true,
                    ms: null,
                    destroy: false
                })
                    .on('click:ok', function(){
                        var self = this;
                        $.ajax({
                            url: config.dcmpRESTfulIp + "/emc/share/" + id,
                            type: "PUT",
                            success: function(data){
                                if (data) {
                                    self.destroy();
                                } else {
                                    alert("取消分享失败");
                                }
                            }
                        })

                    })
                    .on('click:cancel', 'destroy');
                return false;
            }
        })

        View.ControlPanelView = Marionette.ItemView.extend({
            template: "share/share-control-panel",
            events: {
                "click a": "navFolder"
            },
            navFolder : function(e){
                var target = $(e.currentTarget);
                var option = {};
                if(target.text() === "全部文件"){
                    this.trigger('share:nav:all');
                    $(".crumbs").eq(0).children("a:gt(1)").remove();
                    $(".crumbs").hide().eq(1).show();
                } else if ( target.text() === "返回上一级"){
                    var prev = $(".crumbs").eq(0).children().last().prev();
                    var data = prev.data();
                    if (data.id && data.contentid ) {
                        data.userShareId = data.id;
                        data.folderCode = data.contentid;
                        CloudMamManager.trigger('share:nav', data);
                        $(".crumbs").eq(0).children().last().remove();
                    } else {
                        this.trigger('share:nav:all');
                        $(".crumbs").eq(0).children("a:gt(1)").remove();
                        $(".crumbs").hide().eq(1).show();
                    }
                } else {
                    var crumbs = $(".crumbs");
                    var index = target.index();
                    var data = target.data();
                    data.userShareId = data.id;
                    data.folderCode = data.contentid;
                    CloudMamManager.trigger('share:nav', data);
                    $(".crumbs").eq(0).children("a:gt("+index+")").remove();
                }
            }
        })

        View.ContentListView = Marionette.ItemView.extend({
            template: "share/share-content-list",
            initialize: function () {
                this.listenTo(CloudMamManager, 'share:nav', function (option) {
                    this.getList(option);
                });
            },
            events: {
                "dblclick .thumb-folder": "enterFolder",
                "click li": "multiSelect"
            },
            multiSelect: function(event){
                var self = $(event.currentTarget);
                if(event.ctrlKey == true){
                    self.toggleClass("select");
                } else {
                    self.siblings().removeClass("select");
                    self.toggleClass("select");
                }
            },
            enterFolder : function(e) {
                var data = $(e.currentTarget).data();
                data.userShareId = data.id;
                data.folderCode  = data.contentid;
                this.getList(data);
                var fileName =  $(e.currentTarget).next().text();
                var element = [
                    '<a class="item" href="javascript:void(0);" data-contentid="',
                    data.folderCode,
                    '" data-id="',
                    data.userShareId,
                    '"><b>&gt;</b>',
                    fileName,
                    '</a>'
                ].join('')
                $(".crumbs").hide().eq(0).show().append(element);
            },
            getList : function(options) {
                var self = this;
                require(['entities/share/fileTreeModel'], function (fileTreeModel) {
                    var fileTreeing = CloudMamManager.request("fileTree:entities",options);
                    $.when(fileTreeing).done(function (response) {
                        var arr = response.changedAttributes();
                        response.set("entitys",arr);  //为了每一次的MODEL属性保持一致
                        self.model = response;
                        self.render();
                    })
                })
            }
        })


    });
    return CloudMamManager.ShareApp.Share.View;
});