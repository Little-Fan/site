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

            this.oInput.blur(function () {
                val = self.oInput.val().trim();
                if (val && self.checkLength()) {
                    self.values.push({ index: self.index, value: self.oInput.val(), isCorrect: self.validate(self.oInput.val().trim()), width: (20 + val.length * self.fontsize) });
                    self.addTemplate(val);

                    _.each(self.values, function (item) { width += item.width; });
                    if (width >= self.container.width() - self.oInput.width())
                        self.oInput.css('width', '100%');

                    width = self.oInput.width() - (20 + val.length * self.fontsize);
                    self.oInput.css('width', width <= 60 ? 60 : width);
                    self.oInput.val('').focus();
                }
            });

            this.oInput.keydown(function (e) {
                e = e || window.event;
                val = self.oInput.val().trim();
                if (val && e.keyCode == 32 && self.checkLength()) {
                    self.values.push({ index: self.index, value: self.oInput.val(), isCorrect: self.validate(val), width: (20 + val.length * self.fontsize) });
                    self.addTemplate(val);

                    _.each(self.values, function (item) { width += item.width; });
                    if (width >= self.container.width() - self.oInput.width())
                        self.oInput.css('width', '100%');

                    width = self.oInput.width() - (20 + val.length * self.fontsize);
                    self.oInput.css('width', width <= 60 ? 60 : width);
                    self.oInput.val('').focus();
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