define(['jquery', 'underscore'], function ($, _) {

    var emailAdded = function () {
        this.values = [];
        this.container = '';
        this.oInput = null;
        this.index = 0;
        this.fontsize =14;
        this.template = '<a href="javascript:;" class="share-name-item $warming" data-index="$index">$email<span class="name"></span><span class="remove-name" title="删除">×</span></a>';
        this.init = function (options) {
            this.container = options.container || '';
            this.oInput = options.oInput || null;
            this.registEvents();
        }
    }
    emailAdded.prototype= {
        addTemplate: function (email) {
            if (this.container) {
                if (this.validate(email))
                    this.container.append(this.template.replace('$email', email).replace('$index', this.index).replace('$warming', ''));
                else
                    this.container.append(this.template.replace('$email', email).replace('$index', this.index).replace('$warming', 'warming'));
                this.index++;
            }

        },
        registEvents: function () {

            var self = this, val, width = 0;

            this.container.delegate('.remove-name', 'click', function (e) {
                var oA = $(e.currentTarget).parent('a');
                oA.remove();
                self.values = _.reject(self.values, function (item) {
                    if (item.index == oA.data('index'))
                        self.oInput.css('width', self.oInput.width() + item.width);
                    return item.index == oA.data('index');
                });
            });


            var doNext = function() {
                width = 0;//重置
                var containerWidth = self.container.width();
                var count = self.container.find('a').length;

                if (self.oInput.width() != containerWidth) {
                    console.log('邮件地址个数： ' + self.container.find('a').length);
                    _.each(self.container.find('a'), function(oA) {
                        width = (width + $(oA).outerWidth(true)) % containerWidth;
                    });
                    if (containerWidth - width >= 50) //50为最小宽度
                        self.oInput.css('width', containerWidth - width);
                    else
                        self.oInput.css('width', containerWidth);
                } else {

                }
                self.oInput.val('').focus();
            }

            this.oInput.keyup(function (e) {
                e = e || window.event;
                var keycode = e.keyCode || e.which;
                if (keycode == 59 || keycode == 186) {
                    self.values.push({ index: self.index, value: self.oInput.val(), isCorrect: self.validate(self.oInput.val().trim())});
                    self.addTemplate(val);
                    doNext(e);
                }

            });

            this.oInput.blur(function (e) {
                val = self.oInput.val().trim();
                if (val && self.checkLength()) {
                    self.values.push({ index: self.index, value: self.oInput.val(), isCorrect: self.validate(self.oInput.val().trim())});
                    self.addTemplate(val);
                    doNext(e);
                }
            });

            this.oInput.keydown(function (e) {
                e = e || window.event;
                val = self.oInput.val().trim();
                var keycode = e.keyCode || e.which ;
                if (val && (keycode == 32 || keycode == 13) && self.checkLength()) {
                    self.values.push({ index: self.index, value: self.oInput.val(), isCorrect: self.validate(val)});
                    self.addTemplate(val);
                    doNext(e);
                }
            });

            
        },
        validate: function(adress) {
            var regex = /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;
            if (regex.test(adress)) 
                return true;
            return false;
        },
        checkLength: function() {
            var temp = _.filter(this.values, function (item) {
                return item.isCorrect == true;
            });
            if (temp.length >= 5) {
                alert('最多只能发送5个好友!');
                return false;
            }
            return true;
        },
        format: function () {
            var args = arguments;
            return this.replace(/{(\d{1})}/g, function () {
                return args[arguments[1]];
            });
        }
    }

    emailAdded.prototype.constructor = emailAdded;

    return emailAdded;
});