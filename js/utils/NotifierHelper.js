define(["backbone.notifier"], function () {
    var notifierHelper = {};
    this.notifier = window.notifier = new Backbone.Notifier({});
    // 显示loading
    notifierHelper.showLoading = function () {
        notifier.notify({
            message  : "数据加载中...",
            position : 'center',
            fadeInMs : 0,
            fadeOutMs: 0,
            ms       : false,
            modal    : false
        });
    };
    notifierHelper.info = function (msg, title) {
        notifier.notify({
            title  : title,
            message: msg,
            buttons: [
                {'data-role': 'Ok', text: '重新打开'},
                {'data-role': 'cancel', text: '取消'}
            ],
            ms     : null,
            modal  : false,
            destroy: true
        })
            .on('click:Ok', function () {
                location.reload();
            })
            .on('click:cancel', 'destroy');
    }

    notifierHelper.closeLoading = function () {
        notifier.destroyAll();
    };

    return notifierHelper;
})