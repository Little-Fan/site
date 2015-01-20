define(["app", "config", "apps/common/utility", 'apps/common/emailadd', "notifierHelper", "jquery.spin", "localstorage", "zClip", "mCustomScrollbar"], function (CloudMamManager, config, utility, emailComponent, notifierHelper) {
    CloudMamManager.module("MyCloudApp.Dialog", function(Dialog, CloudMamManager, Backbone, Marionette, $, _) {
        //移动到对话框
        Dialog.MoveToForm = Backbone.Modal.extend({
            template: Marionette.TemplateCache.get("share/share-dialog-movetoform"),
            submitEl: ".js-submit",
            cancelEl: ".close",
            initialize: function (options) {
                options || {};
                this.list = options.list;//获取移动列表
                this.treeView = null;
            },
            events: {
                "click .js-newfolder": "addNewFolder",
                "click .js-sumbit": "moveToFolder"
            },
            addNewFolder: function () {//新增文件夹
                var treeView = this.treeView;                
                if (treeView) {//执行新增文件夹方法
                    treeView.addNewFolder();
                }
            },
            moveToFolder: function () {//移动到文件夹
                console.log("moveToFolder");
                var self = this;
                var treeView = this.treeView;
                if (treeView) {//执行新增文件夹方法
                    if (treeView.moveToFolder(this.list)) {
                        this.close();
                    } else {
                        this.$el.find(".js-tooltip").show();                        
                        setTimeout(function () {
                            self.$el.find(".js-tooltip").hide();
                        }, 5000);
                    }
                }
            },
            onShow: function () {
                //初始化隐藏提示
                this.$el.find(".js-tooltip").hide();
                // Render view
                var self = this;
                require(["apps/share/dialog/tree_view"], function (Tree) {//请求目录树形结构
                    var collection = new Tree.NodeCollection(
                        [{
                                id      : 0,
                                name    : '根文件夹',
                                children: [],
                                parentId: -1,
                                code    : -1
                        }]
                    );

                    console.log(collection.get(0));

                    // Instantiate a TreeView on the root
                    var treeView = new Tree.View({
                        el: '.bbm-modal__section',
                        model: collection.get(0),
                        collection: collection
                    });

                    treeView.render();                    
                    treeView.loadChildrenNode(treeView.model);//默认加载根文件下的目录
                    collection.toggleSelected(treeView.model);//默认选中根节点
                    treeView.toggleCollapse();

                    self.treeView = treeView;//赋值当前树形图
                    //self.collection = collection;//赋值当前树形图数据
                });
            }
        });



    });

    return CloudMamManager.MyCloudApp.Dialog;
});
