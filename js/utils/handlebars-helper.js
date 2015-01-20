define(["handlebars", "underscore", "apps/common/utility"], function (Handlebars, _, utility) {
	Handlebars.registerHelper("debug", function (optionalValue) {
		console.log("Current Context");
		console.log("====================");
		console.log(this);
		if (optionalValue) {
			console.log("Value");
			console.log("====================");
			console.log(optionalValue);
		}
	});

	Handlebars.registerHelper("compare",function(v1,v2,options){
		if(v1 > v2 ){
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper("equal", function (v1, v2, options) {
	    if (v1 == v2) {
	        return options.fn(this);
	    } else {
	        return options.inverse(this);
	    }
	});

	//判断数组的长度是否等于给定的长度
	Handlebars.registerHelper("gt", function (arr, len, options) {

		var arrLength = arr.length;

		if (arrLength > len) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper("transformMore", function (obj, type, num, options) {
		var count = 0, arr = _.toArray(obj);
		$.each(arr, function (key, obj) {
			if (obj["transcodeType"] === type) {
				count++
			}
		})

		if (count > num) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper("isLogin", function (options) {
		var userInfo = utility.localStorage.getUserInfo();

		if (options.data) {
			data = Handlebars.createFrame(options.data || {});
			data.userInfo = userInfo;
		}

		if (userInfo){
			return options.fn(this, {data: data});
		} else {
			return options.inverse(this);
		}
	})


	Handlebars.registerHelper('list', function(context, options) {
		context = _.toArray(context);   //类数组转换成数组
		var attrs = '';
		$.each( options.hash, function(key) {
			attrs+= key + '="' + options.hash[key] + '" ';
		});

		return "<ul " + attrs + ">" + context.map(function(item) {
				return "<li>" + options.fn(item) + "</li>";
			}).join("\n") + "</ul>";
	});

});