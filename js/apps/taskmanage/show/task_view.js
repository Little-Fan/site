define(["app", "apps/common/views", "apps/mycloud/dialog/dialog_view", "utils/templates", "apps/common/utility", "notifierHelper", "jquery-ui", "tooltipster", "zClip"],
    function (CloudMamManager, CommonViews, Dialog, templates, utility, notifierHelper) {
    CloudMamManager.module("TaskManageApp.Task.View", function (View, CloudMamManager, Backbone, Marionette, $, _) {

        View.Review = Marionette.ItemView.extend({
            tagName: "li",
            template: templates.getTemplate("taskmanage/task-review-item"),
            ui: {
              
            },
            events: {
                
            }
        });
        View.Cut = Marionette.ItemView.extend({
            tagName: "tr",
            template: templates.getTemplate("taskmanage/task-cut-item"),
            initialize: function() {
                this.listenTo(this.model, 'change:name', function() {
                    this.render();
                });
                //监听model的done属性改变事件
                this.listenTo(this.model, 'change:done', function() {

                    if (this.model.get("done")){
                        this.ui.checkbox.addClass('selected');
                        this.trigger('item:selected', this);
                    } else {
                        this.ui.checkbox.removeClass('selected');
                        this.trigger('item:inversselected', this);
                    }
                });
            },
            ui: {
                "entercut": ".js-entercut",
                "editcut": ".js-editcut",
                "checkbox": ".ico",
            },
            triggers: {
                "click @ui.entercut": "cut:entercut",
                "click @ui.editcut": "cut:editcut",
                "click @ui.checkbox": "single:selected"
            },
            removeDOM: function () {
                var self = this;
                this.$el.fadeOut(function () {
                    self.trigger('item:inversselected', self);
                    self.model.collection.remove(self.model);
                    //Marionette.ItemView.prototype.remove.call(self);
                });
            }
        });

        // status  -1：失败; 0:执行中; 1：完成
        View.Synthesis = Marionette.ItemView.extend({
            tagName: "tr",
            template: templates.getTemplate("taskmanage/task-synthesis-item"),
            initialize: function () {
                this.listenTo(this.model, 'change:status', function () {
                    this.render();
                });
                //监听model的done属性改变事件
                this.listenTo(this.model, 'change:done', function() {

                    if (this.model.get("done")){
                        this.ui.checkbox.addClass('selected');
                        this.trigger('item:selected', this);
                    } else {
                        this.ui.checkbox.removeClass('selected');
                        this.trigger('item:inversselected', this);
                    }

                });
            },
            ui: {
                "review": ".js-review",
                "delete": ".js-delete",
                "error": ".js-error",
                "redo": ".js-redo",
                "checkbox": ".ico"
            },
            triggers: {
                "click @ui.review": "synthesis:review",
                "click @ui.delete": "synthesis:delete",
                "click @ui.error": "synthesis:error",
                "click @ui.redo": "synthesis:redo",
                "click @ui.checkbox": "single:selected"
            },
            removeDOM: function () {
                var self = this;
                this.$el.fadeOut(function () {
                    self.trigger('item:inversselected', self);
                    self.model.collection.remove(self.model);
                    //Marionette.ItemView.prototype.remove.call(self);
                });
            }
        });
        View.Transcode = Marionette.ItemView.extend({
            tagName: "tr",
            template: templates.getTemplate("taskmanage/task-transcode-item"),
            initialize: function() {
                this.listenTo(this.model, 'change:status', function() {
                    this.render();
                });

                //监听model的done属性改变事件
                this.listenTo(this.model, 'change:done', function() {

                    if (this.model.get("done")){
                        this.ui.checkbox.addClass('selected');
                        this.trigger('item:selected', this);
                    } else {
                        this.ui.checkbox.removeClass('selected');
                        this.trigger('item:inversselected', this);
                    }

                });

            },
            ui: {
                "download": ".js-download",
                "delete": ".js-delete",
                "error": ".js-error",
                "retranscode": ".js-renewal",
                "checkbox": ".ico"
            },
            triggers: {
                "click @ui.download": "transcode:download",
                "click @ui.delete": "transcode:delete",
                "click @ui.error": "transcode:error",
                "click @ui.checkbox": "single:selected",
                "click @ui.retranscode": "transcode:retranscode"
            },
            events: {
                //"click @ui.retranscode": "retranscode"
            },
            retranscode: function () {
                //this.ui.retranscode.addClass('rotate');
                //this.trigger('transcode:retranscode');
            },
            removeDOM: function() {
                var self = this;
                this.$el.fadeOut(function () {
                    self.trigger('item:inversselected', self);
                    self.model.collection.remove(self.model);
                    //Marionette.ItemView.prototype.remove.call(self);
                });
            }
        });

        View.Share = Marionette.ItemView.extend({
            tagName: "tr",
            template: templates.getTemplate("taskmanage/task-share-item"),
            initialize: function () {

                //转换过期字段
                var expirationTime = utility.tools.expiration(this.model.get('expirationTime'));
                this.model.set('expirationTime', expirationTime);

                this.listenTo(this.model, 'change:status', function () {
                    this.render();
                });

                //监听model的done属性改变事件
                this.listenTo(this.model, 'change:done', function () {

                    if (this.model.get("done")) {
                        this.ui.checkbox.addClass('selected');
                        this.trigger('item:selected', this);
                    } else {
                        this.ui.checkbox.removeClass('selected');
                        this.trigger('item:inversselected', this);
                    }

                });

            },
            ui: {
                "cancelShare": ".js-cancelShare",
                "deleteShare": ".js-delete",
                "copy": ".js-accessCodeCopy",
                "copyUrl": ".js-shortUrlCopy",
                "checkbox": ".ico"
            },
            triggers: {
                "click @ui.checkbox": "single:selected",
                "click @ui.deleteShare": "share:delete",
                "click @ui.cancelShare": "share:cancle"
            },
            removeDOM: function () {
                var self = this;
                this.$el.fadeOut(function () {
                    self.trigger('item:inversselected', self);
                    self.model.collection.remove(self.model);
                });
            },
           
            onShow: function() {
                if (!this.hasRegisted) {
                    this.ui.copy.zclip({
                        path: 'js/libs/ZeroClipboard.swf',
                        copy: function () {
                            if ($(this).data('shorturl'))
                                return [$(this).data('shorturl'), "  (提取码：", $(this).data('accesscode'), ")"].join('');
                            else 
                                return $(this).data('accesscode');
                        },
                        beforeCopy: function () {
                        },
                        afterCopy: function (e1) {
                            alert('短地址和提取码已经复制到剪贴板');
                        }
                    });
                    this.hasRegisted = !this.hasRegisted;
                }
            }
        });

        View.Tasks = Marionette.CollectionView.extend({
            tagName: "tbody",
            itemViewOptions: {

            },
            getEmptyView: function () {
                return CommonViews.NullView;
            },
            //itemView: View.Task,
            getItemView: function (item) {

                if (this.type == 'review') return View.Review;
                if (this.type == 'Cut') return View.Cut;
                if (this.type == 'Mixture' || this.type == 'synthesis') return View.Synthesis;
                if (this.type == 'Transcode') return View.Transcode;
                if (this.type == 'share') return View.Share;

            },
            initialize: function () {
                //请求接口类型
                this.type = this.collection.state.type;
                this.selectedItemView = [];
               
                this.listenTo(this.collection, "reset", function () {
                    //如果刷新数据 需要触发反选（请在PanelView中查看接收事件）
                    this.selectedItemView = [];
                    CloudMamManager.trigger('reset:selectedData');
                });

            },
            itemEvents: {
                "transcode:download": "transDownload",
                "transcode:delete": "transDelete",
                "transcode:error": "transError",
                "transcode:retranscode": "transRetranscode",

                "cut:entercut": "cutEntercut",
                "cut:editcut": "cutEditcut",

                "synthesis:review": "syReview",
                "synthesis:delete": "syDelete",
                "synthesis:error": "syError",
                "synthesis:redo": "syRedo",

                "share:delete": "sdDelete",
                "share:cancle": "sdCancel",

                "item:selected": "itemSelected",//全选
                "item:inversselected": "itemInversSelected",//反选
                "single:selected": "singleSelected"

            },
            transDownload: function (event, itemView) {
                CloudMamManager.trigger('transcode:download', itemView);
            },
            transDelete: function (event, itemView) {
                CloudMamManager.trigger('transcode:delete', itemView);
            },
            transError: function (event, itemView) {
                CloudMamManager.trigger('transcode:error', itemView);
            },
            transRetranscode: function (event, itemView) {
                CloudMamManager.trigger('transcode:retranscode', itemView);
            },

            cutEntercut: function (event, itemView) {
                CloudMamManager.trigger('cut:entercut', itemView);
            },
            cutEditcut: function (event, itemView) {
                CloudMamManager.trigger('cut:editcut', itemView);
            },

            syReview: function (event, itemView) {
                CloudMamManager.trigger('synthesis:review', itemView);
            },
            syDelete: function (event, itemView) {
                CloudMamManager.trigger('synthesis:delete', itemView);
            },
            syError: function (event, itemView) {
                CloudMamManager.trigger('synthesis:error', itemView);
            },
            syRedo: function (event, itemView) {
                CloudMamManager.trigger('synthesis:redo', itemView);
            },
            sdDelete: function (event, itemView) {
                CloudMamManager.trigger('share:delete', itemView);
            },
            sdCancel: function (event, itemView) {
                CloudMamManager.trigger('share:cancle', itemView);
            },

            itemSelected: function (event, itemView) {
                this.selectedItemView.push(itemView);
                this.triggerState();
            },
            //清空/反选选中的itemView
            itemInversSelected: function(event, itemView) {
                this.selectedItemView = _.reject(this.selectedItemView, function (currentItemView) {
                    return itemView == currentItemView;
                });
                this.triggerState();
            },
            triggerState: function() {
                var count = this.selectedItemView.length;
                if (count >= 0) {
                    //此事件接收者:PanelView
                    CloudMamManager.trigger('selected:all', this.selectedItemView);
                }
            },
            //单击checkbox事件
            singleSelected: function(event, itemView) {
                var done = itemView.model.get('done');
                itemView.model.set('done', !done);
            }
        });

        View.PanelView = Marionette.ItemView.extend({
            tagName: "div",
            template: "taskmanage/task-panel-item",
            initialize: function(option) {
                this.type = option.type;
                this.selectedView = [];

                var self = this;
                this.listenTo(CloudMamManager, 'selected:all', function (params) {
                    var oSpan = this.ui.toggleSelectAll.find('#toggle-all');
                    if (params && $.isArray(params) && params.length > 0) {
                        this.ui.alldelete.show();
                        oSpan.html('已选中' + params.length + '条记录');
                    } else {
                        this.ui.alldelete.hide();
                        oSpan.html('全选');
                    }
                    self.selectedView = params;
                });

                //重置多选状态
                this.listenTo(CloudMamManager, 'reset:selectedData', function() {
                    
                    self.selectedView = [];
                    this.ui.alldelete.hide();
                    this.ui.toggleSelectAll.find('#toggle-all').html('全选');

                    this.ui.toggleSelectAll.checked = false;
                    this.ui.toggleSelectAll.find('.ico').removeClass('selected');

                });
            },
            
            ui: {
                "changeSortState": ".create-time-display ul li",
                "toggleSelectAll": ".js-selectall",
                "alldelete": ".js-delete"
               // "allcancel": ".js-cancel"
            },
            events: {
                "click @ui.changeSortState": "changeSortState",
                "click @ui.toggleSelectAll": "toggleSelectAll",
                "click @ui.alldelete": "multiDelete"
                //"click @ui.allcancel":"multiCancel"
               
            },

            //全选/多选删除
            multiDelete: function (e) {
                var self = this;
                CloudMamManager.trigger('multi:delete', self.selectedView);
            },
            toggleSelectAll: function (e) {
                //全选事件
                var done = this.ui.toggleSelectAll.checked = !this.ui.toggleSelectAll.checked;
                done ? this.ui.toggleSelectAll.find('.ico').addClass('selected') : this.ui.toggleSelectAll.find('.ico').removeClass('selected');

                this.collection.each( function (task) {
                    task.set({ 'done': done });
                });

            },
            triggerSort: function(params) {
                CloudMamManager.trigger('change:sort', params);
                params.dom.html( params.text);
            },
            changeSortState: function(e) {
                e && e.stopPropagation() && e.preventDefault();
                var self = this;
                var state = this.$(e.target).data('state');
                var text = this.$(e.target).html();
                var dom = self.$(e.target).closest('.create-time').find('a');
                switch (state) {
                    case 'up':
                        self.triggerSort({ key: 'order', value: 1, dom: dom, text: text });
                        break;
                    case 'down':
                        self.triggerSort({ key: 'order', value: -1, dom: dom, text: text });
                        break;
                    case 'allstate':
                        self.triggerSort({ key: 'status', value: '', dom: dom, text: text });
                        break;
                    case 'sucess':
                        self.triggerSort({ key: 'status', value: 1, dom: dom, text: text });
                        break;
                    case 'excute':
                        self.triggerSort({ key: 'status', value: 0, dom: dom, text: text });
                        break;
                    case 'fail':
                        self.triggerSort({ key: 'status', value: -1, dom: dom, text: text });
                        break;
                    default:
                        break;
                    }
            },
            onRender: function () {
                if (this.type == 'review' || this.type == 'cut' || this.type == 'share')
                    this.$('.js-allstate').hide();
            }
        });

        View.PaginatedView = Marionette.Layout.extend({
            className: "clearFix",

            template: "taskmanage/task-pager-layout",
            regions: {
                paginationPanelRegion: ".-tm-panel",
                paginationMainRegion: ".-tm-aoreview",
                paginationControlsRegion: ".page"
            },

            initialize: function (options) {
                this.collection = options.collection;
                this.panelView = options.panelView;
                this.listView = options.listView;  
                this.controls = new CommonViews.PaginationControls({
                    paginatedCollection: this.collection
                });
                var eventsToPropagate = options.propagatedEvents || [];

                var self = this;

                this.listenTo(this.controls, "page:change", function (page) {
                    self.trigger("page:change", page);
                });


                _.each(eventsToPropagate, function (event) {
                    self.listenTo(self.listView, event, function (view, model) {
                        self.trigger(event, view, model);
                    });
                });

                this.on("show", function () {
                    this.paginationPanelRegion.show(self.panelView);
                    this.paginationMainRegion.show(self.listView);
                    this.paginationControlsRegion.show(self.controls);
                });


            },
            onRender: function( ){
                var done = this.collection.done().length;
                var remaining = this.collection.remaining().length;
                //this.allCheckbox.checked = !remaining;
            }
        });


    });
    return CloudMamManager.TaskManageApp.Task.View;
});