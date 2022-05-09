/**实现类钉钉的人员搜索选择组件**/
var isElement = Element && Element.version ? true : false;
var style = `<style>
	.search-box{position: relative; min-height: ` + (isElement ? 40 : 34) + `px; ` + (isElement ? 'border-radius: 5px;' : '') + `}
	.search-box > .readonly{
		position: absolute;
		left: -1px;
		top: -1px;
		z-index: 1;
		border: 1px solid transparent;
		height: ` + (isElement ? 40 : 34) + `px;
		width: 100%;
		background-color: rgba(100,100,100,0.1);
		box-sizing: content-box;
	    ` + (isElement ? 'border-radius: 5px;' : '') + `
	}
	.search-box > .readonly:hover + i.fa-times-circle-o{display: none;}
	.search-input{
		display: flex;
	    flex-wrap: wrap;
		height:  ` + (isElement ? 40 : 34) + `px;
		overflow: hidden;
    }
	.select-unit{
		padding: ` + (isElement ? 6 : 2) + `px 8px;
		border-radius: 5px;
		background-color: #eaae6a;
		white-space: nowrap;
		margin-right: 5px;
		margin-bottom: 3px;
		display: inline-block;
		color: #fff;
		border: 1px solid #f9a240;
		margin-top: ` + (isElement ? 2 : 3) + `px;
	}
	.select-unit .remove{padding: 2px 0 2px 5px; cursor: pointer; color: #ce9554;}
	.select-unit .remove:hover{color: #c00;}
	.form-control.search{min-width: 50px; width: auto; flex: 1 0 auto; height: 100%; ` + (isElement ? 'border-radius: 5px;' : '') + `}
	/*单选*/
	div[single] .search-input{padding-right: 30px; flex-wrap: nowrap;}
	.search-box:hover i.fa-times-circle-o{display: block;}
	.search-box i.fa-times-circle-o{
		position: absolute;
		right: 12px;
		top: ` + (isElement ? 11 : 8) + `px;
		z-index: 1;
	}
	div[single] .select-unit{
		background-color: #fff;
		color: #1D2939;
		padding: ` + (isElement ? 6 : 3) + `px;
		border: none;
	    ` + (isElement ? 'line-height: 22px;' : '') + `
	}
	div[single] .select-unit .remove{display: none;}

	.search-result-cus{
	    position: absolute;
		top: 100%;
		left: -1px;
	    width: 100%;
	    border: 1px solid #ddd;
	    z-index: 100;
	    background-color: #f8f8f8;
	    box-shadow: 0px 1px 5px #d4d4d4;
	    max-height: 500px;
		overflow-y: auto;
		box-sizing: content-box;
	}
	.search-result-cus li{
		padding: 10px 15px;
	    cursor: pointer;
		line-height: initial;
	}
	.no-result{padding: 10px 15px; text-align: center;}
	.search-result-cus li:not(.selected):hover{background-color: #f9d786; color: #fff;}
	.search-result-cus li.active:not(.selected){background-color: #eaae6a; color: #fff;}
	.search-result-cus li.active.selected{background-color: #ccc;}
	.search-result-cus li.selected{pointer-events: none; opacity: 0.4;}
	.animated {
	    -webkit-animation-duration: 0.2s;
	    animation-duration: 0.2s;
	    -webkit-animation-fill-mode: both;
	    animation-fill-mode: both;
	}
	@keyframes bounceInUp{
		60%, 75%, 90%, 0%, 100% {
		    -webkit-animation-timing-function: cubic-bezier(0.215,.61,.355,1);
		    animation-timing-function: cubic-bezier(0.215,.61,.355,1);
		}
		0% {
		    opacity: 0;
		    -webkit-transform: translate3d(0,20px,0);
		    transform: translate3d(0,20px,0);
		}
		60% {
		    opacity: 1;
		    -webkit-transform: translate3d(0,-20px,0);
		    transform: translate3d(0,0px,0);
		}
		75% {
		    -webkit-transform: translate3d(0,10px,0);
		    transform: translate3d(0,0px,0);
		}
		90% {
		    -webkit-transform: translate3d(0,-5px,0);
		    transform: translate3d(0,0px,0);
		}
		100% {
		    -webkit-transform: translate3d(0,0,0);
		    transform: translate3d(0,0,0);
		}
	}
	@-webkit-keyframes bounceInUp{
		60%, 75%, 90%, 0%, 100% {
		    -webkit-animation-timing-function: cubic-bezier(0.215,.61,.355,1);
		    animation-timing-function: cubic-bezier(0.215,.61,.355,1);
		}
		0% {
		    opacity: 0;
		    -webkit-transform: translate3d(0,20px,0);
		    transform: translate3d(0,20px,0);
		}
		60% {
		    opacity: 1;
		    -webkit-transform: translate3d(0,-20px,0);
		    transform: translate3d(0,0px,0);
		}
		75% {
		    -webkit-transform: translate3d(0,10px,0);
		    transform: translate3d(0,0px,0);
		}
		90% {
		    -webkit-transform: translate3d(0,-5px,0);
		    transform: translate3d(0,0px,0);
		}
		100% {
		    -webkit-transform: translate3d(0,0,0);
		    transform: translate3d(0,0,0);
		}
	}
	.search-box.chosen {
		border: 1px solid #ddd;
		padding: 0 7px;
		border-radius: ` + (isElement ? 5 : 1) + `px;
		background-color: #fff;
		transition: all 0.2s;
	}
	.search-box.chosen.focus{border-color: #1ab394;}
	.search-box.chosen .form-control.search {border: none; height:  ` + (isElement ? 40 : 34) + `px; padding: 6px 5px;}
	</style>
`;
$("body").append(style);

/**
 *单例实现只初始化一次
 */
function getSingle(func) {
	var insObj = {};
	return function() {
		return insObj.this ? "" : insObj.this = func.apply(this, arguments);
	}
}

/**
 *初始化实例
 *el:初始化的dom；func:后台搜索方法
 *返回值为获取选中个数据的方法
 *func：搜索方法或参数
 *callback：点击搜索结果的回调方法
 */
function initSearch(el, func, callback) {
	if (!el) {
		return ;
	}
	var searchFunc = null;
	if (func instanceof Function) { // 若func为函数，即早期使用场景，则不做改变
		searchFunc = func;
	} else {
		// 默认参数
		var requestParams = {
			searchType: 0, // 0：人员；1：组织架构；2：人员+组织架构；3：仅仅是离职人员
			isContainsResign: 0 // 查询的人员中是否包含离职人员0：不包含，1：包含
		};
		if (Object.prototype.toString.call(func) == "[object Object]") { // 若func为对象则将其与默认参数合并
			// UC浏览器不支持es6对象拓展运算符，故先注掉使用jquery合并对象
			// requestParams = {...requestParams, ...func};
			requestParams = $.extend(true, requestParams, func);
		}
		searchFunc = function(val, spellCallBack) {
			$.ajax({
				type: "POST",
				data: {"operate":"fuzzySearchByNameCommon","keySearch":val,"searchType":requestParams.searchType,"isContainsResign":requestParams.isContainsResign},
				url: originPath+"/humanUsersWholeOperate",
				xhrFields: {withCredentials: true},
				dataType: "json",
				success: function(msg){
					if (msg.errcode == "0" || msg.errcode == "1"){  
						// msg.jsonList：List<Map>，其中Map有三个key：id(数据id)，name(数据名称)，type(数据类型，即人（0）还是组织架构（1）)
						spellCallBack(msg.jsonList);
					} else {
						alertCountDown(5,msg.errmess);
					}
				},
				error: function(xml, mess){
					alertCountDown(5,"网络异常，请重试！");
				}
			});
		}
	}


	return getSingle(function(func) {
		var self = this; // 初始化的dom对象
		var placeholder = $(self).data("placeholder")?$(self).data("placeholder"):"模糊搜索";
		var isSingle = typeof ($(self).attr("single")) != "undefined"; // 判断是否是单选

		var html = '';
		// 拼结构
		html += `<div class="search-input dilb">
    				<input type="text" class="form-control search" placeholder="`+placeholder+`">
    				<div class="search-result-cus animated none">
    					<ul class="search-ul">
    					</ul>
    				</div>
				</div>
				<div class='readonly hide'></div>
				`;
		// 若是单选，则添加清除按钮
		if(isSingle) {
			html += `<i class="fa fa-times-circle-o none cp cccc f16"></i>`;
		}
    $(this).append(html);
	
	/**
	 * 移除选中结果，重置placeholder
	 */
	$(this).find(".fa-times-circle-o").on("click", function(e) {
		removeUnit();
		$(self).find(".form-control.search").attr("placeholder", placeholder);
		// 当实例拥有onClosed方法时，点击搜索结果触发onClosed方法，参数为当前的li Dom对象
		if (returnFunc.onClosed instanceof Function) {
			returnFunc.onClosed($(this).closest(".select-unit")[0]);
		}
	});

	// 移除选中结果
	function removeUnit() {
		$(self).find(".select-unit").remove();
	}

	var timer; // 搜索节流定时器
    // 绑定事件
    $(this).find(".form-control.search").on("input", function() {
		if ($(this).val().trim() !== "") { // 不搜索空字符串
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				func($(this).val(), spell);
			}, 300);
    	} else {
    		searchResultBoxState(0);
    	}
	});
	
	// 监听事件添加绑定样式
	$(this).find(".form-control.search").on("focus", function() {
		$(self).addClass('focus');
		if (isSingle) { // 若是单选
			var result = returnFunc();
			if (result.length > 0) { // 已有选择,将input置空，placehoder置为已选择的name，将已选择的元素隐藏
				$(self).find(".form-control.search").val("");
				$(self).find(".form-control.search").attr("placeholder", result[0].name);
				$(self).find(".select-unit").hide();
			}
		}
	});
	$(this).find(".form-control.search").on("blur", function() {
		$(self).removeClass('focus');
	});

	// 若是单选，给document绑定点击事件
	if (isSingle) {
		$(document).on("click", function(e) {
			// 点击出结果面板的其他地方都将清除input值和隐藏结果面板
			if ((e.target.tagName == "LI" && typeof $(e.target).attr("data-id") != "undefined" && $(e.target).closest("ul.search-ul").length > 0) || $(e.target).hasClass("form-control search")){
				return;
			} else {
				var result = returnFunc();
				if (result.length > 0) { // 已有选择,将input置空，placehoder置为空，将已选择的元素展示
					$(self).find(".form-control.search").attr("placeholder", "");
				}
				$(self).find(".form-control.search").val("");
				$(self).find(".select-unit").show();
				searchResultBoxState(0);
			}
		});
	}
    
    // 拼搜索结果，要求搜索结果必须有id标识，展示的文本为name或text属性
    // (name或text属性默认为展示的文本，其他属性存入标签)
    function spell() {
    	var searchData = [].shift.call(arguments);
    	if (searchData.length == 0) { // 未搜到结果
    		$(self).find(".search-ul").html('<li class="no-result"><i class="fa fa-exclamation-circle mr5"></i>无搜索结果！</li>');
		} else { // 搜索到结果
			let selectedArray = returnFunc();
			let index = 0; // 搜索到的结果计数
    		var lisHtml = "";
	    	for (var item of searchData) {
				let isSelected = ""; // 是否已被选中
				for (let selectedItem of selectedArray) {
					if (selectedItem.id == item.id) { // 已被选中
						isSelected = "selected";
						break;
					}
				}
				var liHtml = '';
				if (index == 0) { // 第一个搜索结果自动标记
					liHtml = '<li class="active ' + isSelected +'"';
				} else {
					liHtml = '<li class="' + isSelected + '"';
				}
	    		for(var key of Object.keys(item)) {
	    			if (key != "text" && key != "name") {
		    			liHtml += ' data-' + key + '="' + item[key] + '"';
	    			}
	    		}
	    		liHtml += '>' + (item.name || item.text) + '</li>';
	    		
				lisHtml += liHtml;
				
				index++;
	    	}
			$(self).find(".search-ul").html(lisHtml);

			// 搜索结果容器滚动到顶部
			$(self).find(".search-result-cus").scrollTop(0);
			// 绑定事件前先解绑
			$(self).unbind('click');
			$(self).unbind('keydown');
			// 为搜索结果绑定点击事件
			$(self).find(".search-ul li").on('click', function() {
				selectHandle(this);
			});
			
			// 为搜索框绑定键盘事件（上、下、回车）
			$(self).on('keydown', function(e) {
				var $activeLi = $(self).find(".search-ul li.active");
				if ($activeLi.length == 0) {
					return;
				}
				switch(e.keyCode) {
					case 13: // 回车
						e.preventDefault();
						selectHandle($activeLi[0]);
						break;
					case 38: // 上键
						let $prev = $activeLi.prev("li");
						if ($prev.length > 0) {
							$(self).find(".search-ul li").removeClass("active");
							$prev.addClass("active");
						} else {
							break;
						}
						// 若$prev被滚动条隐藏则滚动
						var $resultBox = $(self).find(".search-result-cus");
						var hiddenHight = $prev[0].offsetTop - $resultBox[0].scrollTop; // 隐藏高度
						if (hiddenHight < 0) {
							$resultBox.scrollTop($resultBox[0].scrollTop + hiddenHight);
						}
						break;
					case 40: // 下键
						let $next = $activeLi.next("li");
						if ($next.length > 0) {
							$(self).find(".search-ul li").removeClass("active");
							$next.addClass("active");
						}
						// 若$prev被滚动条隐藏则滚动
						var $resultBox = $(self).find(".search-result-cus");
						var hiddenHight = $next[0].offsetTop - $resultBox[0].scrollTop - 500; // 隐藏高度
						if (hiddenHight >= 0) {
							$resultBox.scrollTop($resultBox[0].scrollTop + hiddenHight + 40);
						} else {
							break;
						}
						break;
					default: 
						break;
				}
			});
    	}
    	
    	// 搜索结果面板出来与否
    	var val = $(self).find(".form-control.search").val();
    	if (val.trim() != "") {
    		searchResultBoxState(1);
    	} else {
    		searchResultBoxState(0);
    	}
	}
	
	/**
	 * 选中搜索结果
	 * that：选择的li
	 */
	function selectHandle(that) {
		// 若有回调函数，则在点击搜索结果的时候执行回调函数
		if (callback instanceof Function) {
			callback.call(that);
			// 给搜索框赋值
			$(that).closest(".search-result-cus").prev("input").val($(that).text());
			searchResultBoxState(0);
		} else {
			var $li = $(that);
			var isSelected = $(self).find(".select-unit[data-id=" + $li.data("id") + "]").length > 0;
			if (!isSelected) { // 未被选中过的搜索结果才可以被选中
				var data = that.dataset; // li上存储的数据map
				data.name = $li.html();
				addSelect.call(self, data);
				
				// 选择完毕后清空搜索框并隐藏搜索结果容器
				$(self).find(".form-control.search").val("");
				searchResultBoxState(0);
		//    			var spanHtml = '<span class="select-unit"';
		//    			for (var key in datas) {
		//    				spanHtml += ' data-' + key + '="' + datas[key] + '"';
		//    			}
		//    			spanHtml += '>' + $li.html() + '<span class="remove">x</span></span>';
		//	    		// 添加到选中结果中
		//	    		$(self).find(".form-control.search").before(spanHtml);
		//	    		// 绑定移除事件
		//	    		$(self).find(".form-control.search").prev(".select-unit").find(".remove").on("click", function() {
		//	    			$(that).closest(".select-unit").remove();
		//	    		});
				
				// 当实例拥有onSelect方法时，点击搜索结果触发onSelect方法，参数为当前的li Dom对象
				if (returnFunc.onSelect instanceof Function) {
					returnFunc.onSelect(that);
				}
			}
		}
	}
    
    // 控制搜索结果容器展示情况
    // state，0：隐藏；1：展示
    function searchResultBoxState(state) {
    	if (state == 1) {
    		$(self).find(".search-result-cus").addClass("bounceInUp").removeClass("none");
    	} else {
			// 先清空搜索结果容器，再隐藏
			$(self).find(".search-result-cus > .search-ul").html("");
    		$(self).find(".search-result-cus").removeClass("bounceInUp").addClass("none");
    	}
    }
    
    // 添加搜索结果(data:一个待选数据)
	function addSelect (data) {
		if (isSingle) { // 若是单选，则先移除选中的结果
			removeUnit();
		}
		var spanHtml = '<span class="select-unit"';
		for (var key in data) {
			spanHtml += ' data-' + key + '="' + data[key] + '"';
		}
		spanHtml += '>' + (data.name || data.text) + '<span class="remove">x</span></span>';
		// 添加到选中结果中
		$(this).find(".form-control.search").before(spanHtml);
		// 绑定移除事件
		$(this).find(".form-control.search").prev(".select-unit").find(".remove").on("click", function() {
			$(this).closest(".select-unit").remove();

			// 当实例拥有onClosed方法时，点击搜索结果触发onClosed方法，参数为当前的li Dom对象
			if (returnFunc.onClosed instanceof Function) {
				returnFunc.onClosed($(this).closest(".select-unit")[0]);
			}
		});
		// 若是单选，则焦点不必重回搜索框
		if (isSingle) {
			$(self).find(".select-unit").on("click", function(e) {
				$(self).find(".form-control.search").trigger('focus');
				e.stopPropagation();
			});
			$(self).find(".form-control.search").attr("placeholder", "");
			return;
		}
		// 焦点重回搜索框
		$(this).find(".form-control.search").focus();
	}
    
	var returnFunc = function (type) {
    	var selectData = []; // 最终获取的结果
    	$(self).find(".select-unit").each(function() {
    		selectData.push(this.dataset);
		});
		// type:undefined 返回完整数组；type:0 返回人员id串；type:1 返回架构id串
		if (typeof type == "undefined") {
			return selectData;
		} else {
			return selectData.filter(item => {return item.type == type;})
				.map(item => {return item.id;}).join();
		}
    }.bind(self);
    returnFunc.setData = function(dataList) {
		$(self).find(".select-unit").remove();
		if (dataList.length == 0) { // 没有值将placeholder还原
			$(self).find(".form-control.search").attr("placeholder", placeholder);
		}
    	for (var data of dataList) {
    		addSelect.call(self, data);
    	}
	};
	// 通过id串来赋值
	returnFunc.setDataById = function(usersIds, structsIds, structNameType) {
		var nameType = 2; // 组织架构名称展现形式（1：只展示当前架构名称；2：带父级名称；3：带人数）
		if (structNameType && [1,2,3].indexOf(structNameType) != -1) {
			nameType = structNameType;
		}
		$.ajax({
			type: "POST",
			data: {"operate":"fuzzySearchByIds","userIds":usersIds,"structureIds":structsIds,"nameType": nameType},
			url: originPath+"/humanUsersWholeOperate",
			xhrFields: {withCredentials: true},
			dataType: "json",
			success: (msg) => {
				if (msg.errcode == "0"){   
					this.setData(msg.jsonList);
				} else {
					alertCountDown(5,msg.errmess);
				}
			},
			error: function(xml, mess){
				alertCountDown(5,"网络异常，请重试！");
			}
		});
	}.bind(returnFunc);
	// 设置组件是否只读
	returnFunc.setReadonly = function(isReadonly) {
		if (isReadonly) {
			$(self).find(".readonly").removeClass("hide");
		} else {
			$(self).find(".readonly").addClass("hide");
		}
	};
    return returnFunc;
	}).bind(el, searchFunc)();
}