define(["app", "config", "request", "backbone.validation"], function (CloudMamManager, config, request) {

	    var api = {

	        DosageImport: function (options) {
	            return request.get("/emc/usedStatistics/import");
	        },
	        DosageActivity: function (options) {
	            return request.get("/emc/usedStatistics/activity");
	        },
	        UpdateUserInfo: function (options) {
	            return request.put("/uic/userInfoDetail", options);
	        },
	        UpdatePassWord: function (options) {
	            return request.put("/uic/changePassword", options);
	        }
	    };

	   
	    CloudMamManager.reqres.setHandler("usercenter:dosage:import", function (options) {
	        return api.DosageImport(options);
	    });

	    CloudMamManager.reqres.setHandler("usercenter:dosage:activity", function (options) {
	        return api.DosageActivity(options);
	    });
    
	    CloudMamManager.reqres.setHandler("update:personal:info", function (options) {
	        return api.UpdateUserInfo(options);
	    });
    
	    CloudMamManager.reqres.setHandler("update:password", function (options) {
	        return api.UpdatePassWord(options);
	    });
	});