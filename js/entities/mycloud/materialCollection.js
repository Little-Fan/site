define(["app", "entities/mycloud/materialModel", "config", "jquery", "request", "backbone.paginator"],
	function (CloudMamManager, MaterialModel, config, $, request) {

	    var MaterialCollection = Backbone.PageableCollection.extend({
	        url: "/sc/search",
	        model: MaterialModel,
	        mode: "server",
	        //本地客户端设置初始状态
	        state: {
	            firstPage: 1,//1-based，（分页从1开始符合阅读习惯)
	            lastPage: null,//这是基于firstPage 算出来的 不可修改
	            pageSize: 15,//默认
	            totalPages: null,
	            totalRecords: null,//  server-mode 可填此参数
	            sortKey: "createtime",//默认
	            order: -1,//desc  默认-1    为0则不会发送服务端
	            currentPage: 1//初始页索引,默认和firstPage相同,若不同则指定
                
	        },


	        //默认服务端 "键"映射: {currentPage: "page", pageSize: "per_page", totalPages: "total_pages", totalRecords: "total_entries", sortKey: "sort_by", order: "order", directions: {"-1": "asc", "1": "desc"}}

	        queryParams: {
	            totalPages: null,//默认"键" "total_pages" 设置为null 则会从querystring中移除
	            totalRecords: null,//默认"键""total_entries" 设置为null 则会从querystring中移除
	            sortKey: "sort", // 默认"键" "sort_by"
	            order: "order", //默认"键" "order"
	            currentPage: "page",//默认"键" "page"
	            pageSize: "size", //默认"键" "per_page"
	            //directions:"" 默认"键" { "-1": "asc", "1": "desc" }
	            directions: {
	                "1": "asc",//"asc",
	                "-1": "desc"
	            },
	            q: "", //关键帧
	            folderCode: "",//文件夹code
	            type: "",//素材类型 
	            webType: "pc"
	        },

	        //修改本地数据状态：如：总个数/当前页索引/
	        parseState: function (response, queryParams, state, options) {
	            if (response.page === 0) { response.page = 1; }
	            return {
	                totalRecords: response.totalCount,
	                totalPages: response.totalPage,
	                currentPage: response.page
	            };
	        },

	        //返回数据记录
	        parseRecords: function (response, options) {
	            if (this.url === "/emc/recycle")
	                return response.entityInRecycle;
	            else
	                return response.entities;//后台返回的格式                
	        },


	        //这是"无限分页" 模式才会使用
	        parseLinks: function () {

	        },

	        initialize: function () {
                //value为初始化参数
	            var params = { q:"", page: 1, type: "All", folderCode: "", pagesize: 15, order: -1, sort: "createtime" };
	            this.parameters = new Backbone.Model(params);
	            var self = this;

	            //修复多次请求问题
	            this.listenTo(this.parameters,'change', function() {
	                var page = parseInt(self.parameters.get("page"), 10);
	                var q = self.parameters.get("q");
	                var pagesize = self.parameters.get("pagesize");
	                var sort = self.parameters.get("sort");
	                var order = self.parameters.get("order");
	                var type = self.parameters.get("type");
	                var folderCode = self.parameters.get("folderCode");
	                

	                self.state.totalPages = page;
	                self.state.pageSize = pagesize;
	                self.state.sortKey = sort;
	                self.state.order = order;
	                //q,folderCode,type需要设置queryParams
	                self.queryParams.q = q;
	                self.queryParams.folderCode = folderCode;
	                self.queryParams.type = type === "All" ? "" : type;

                    //切换接口
	                switch (type) {
	                    case "Favorite":
	                        self.url = "/emc/favorite/";
	                        self.queryParams.usercode = "admin";//ToDo admin用户为模拟用户
	                        break;
	                    case "Recycle":
	                        self.url = "/emc/recycle";
	                        self.queryParams.userCode = "admin";
	                        break;
	                    default:
	                        self.url = "/sc/search";
	                        self.queryParams.userCode = "";
	                        break;
	                }

	                self.getPage(page, { reset: true });
	            });
	        }
	    });


	    var API = {
	        getMaterialsEntities: function(options) {

	            var materials = new MaterialCollection();
	            //路由分布
	            if (options.page) {
	                materials.parameters.set("page", parseInt(options.page));
	            }

	            if (options.type) {
	                materials.parameters.set("type", options.type);
	            }

	            if (options.folderCode) {
	                materials.parameters.set("folderCode", options.folderCode);
	            }

	            var defer = $.Deferred();
	            var options = {};
	            defer.then(options.success, options.error);

	            var response =
	                materials.fetch(_.omit(options, "success", "error"));

	            response.done(function() {

	                defer.resolveWith(response, [materials]);
	            }).fail(function() {
	                defer.rejectWith(response, arguments);
	            });

	            return defer.promise();


	        },
	        recoverMaterialsEntities: function (contentIds) { //恢复删除

	            return request.put("/emc/recycle/" + contentIds.join(","));
	        },
	        completelyremoveMaterialsEntities: function(contentIds) { //彻底删除

	            return request.remove("/emc/recycle", contentIds.join(","));
	        },
	        completelyremoveAllMaterialsEntities: function (userCode) { //彻底删除全部文件

	            return request.remove("/emc/recycle?" + "userCode=" + userCode);

	        },
	        pullFolderLevel: function (folderCode) {

	            return request.get("/emc/folder/path/" + folderCode);
	        },
	        moveEntityToFolder: function(contentId, folderCode) { //移动素材到文件夹
	           
	            return request.put("/emc/entity/" + contentId, { name: '', publicfolder: folderCode });
	        },
	        moveFolderToFolder: function(moveFolder, movetoFolder) { //移动文件夹到文件夹
	           
	            return request.put("/emc/folder/" + moveFolder, { code: moveFolder, parentfoldercode: movetoFolder });

	        },
	        uploadCheck: function(filesize) {
	            
	            return request.postForm("/ec/importCheck", { fileSize: filesize });
	        },
	        shareLink: function(data) {
	           
	            return request.syncPost("/emc/share", data);
	        },
	        deleteSharedItem: function (contentId) {

	            return request.remove("/ac/transcode/" + contentId);
	        },
	        shareToEmail: function(data) {
	           
	            return request.post("/emc/share", data);
	        },
	        createTranscode: function(data) {
	            return request.post("/ac/transcode", data);
	        },
	        transcodeDownload: function(id) {
	            return request.get("/ac/transcode/" + id);
	        },
	        getType: function() {
	            return request.download("/api/cliptype");
	        },
	        getEntity: function(id) {
	            return request.get("/emc/entity/" + id);
	        }
	    };

	    CloudMamManager.reqres.setHandler("material:entities", function (type) {
	        return API.getMaterialsEntities(type);
	    });

	    CloudMamManager.reqres.setHandler("material:entities:recover", function (contentIds) {
	        return API.recoverMaterialsEntities(contentIds);
	    });

	    CloudMamManager.reqres.setHandler("material:entities:remove", function (contentIds) {
	        return API.completelyremoveMaterialsEntities(contentIds);
	    });

	    CloudMamManager.reqres.setHandler("material:moveto:folder", function (contentID, folderCode) {
	        return API.moveEntityToFolder(contentID,folderCode);
	    });

        CloudMamManager.reqres.setHandler("material:pull:FolderLevel", function (folderCode) {
            return API.pullFolderLevel(folderCode);
        });

	    CloudMamManager.reqres.setHandler("folder:moveto:folder", function (moveFolder, movetoFolder) {
	        return API.moveFolderToFolder(moveFolder, movetoFolder);
	    });

	    CloudMamManager.reqres.setHandler("material:entities:removeall", function (userCode) {
	        return API.completelyremoveAllMaterialsEntities(userCode);
	    });

	    CloudMamManager.reqres.setHandler("upload:importcheck", function (filesize) {
	        return API.uploadCheck(filesize);
	    });

	    CloudMamManager.reqres.setHandler("create:sharelink", function (data) {
	        return API.shareLink(data);
	    });

	    CloudMamManager.reqres.setHandler("delete:shared:item", function (contentId) {
	        return API.deleteSharedItem(contentId);
	    });

	    CloudMamManager.reqres.setHandler("shareTo:email", function (data) {
	        return API.shareToEmail(data);
	    });

	    CloudMamManager.reqres.setHandler("create:transcode", function (data) {
	        return API.createTranscode(data);
	    });

	    CloudMamManager.reqres.setHandler("transcode:download", function (id) {
	        return API.transcodeDownload(id);
	    });

	    CloudMamManager.reqres.setHandler("get:type", function () {
	        return API.getType();
	    });
	    CloudMamManager.reqres.setHandler("get:entity", function (id) {
	        return API.getEntity(id);
	    });
	    return MaterialCollection;
	});
