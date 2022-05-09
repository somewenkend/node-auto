var vm = new Vue({
	el: "#app",
	data: {
		// 组件库数据
		dataList: [],
		// 组件库中元素被点击时与鼠标的相对位置
		dragClickPosition: {
			width: 0,
			height: 0,
			top: 0,
			left: 0
		},
		// 是否展示组件边界虚线
		isShowDashed: true
	},
	mounted: function() {
		var _this = this;
		// ajax
		$.getJSON("/js/components.json", function (data){
			vm.dataList = data;
		}).then(function() {
			_this.$nextTick(function() {
				$('[data-toggle="tooltip"]').tooltip();
				// 切换边界虚线显示隐藏
				$('#control').change(function() {
					if ($(this).prop('checked')) {
						$("#dashed").html('.autocoding-el{border: 1px dashed #ddd;}.autocoding-el:not(button){background: #fff; border-radius: 5px; color: #111;}');
					} else {
						$("#dashed").empty();
					}
				});
				
				
				/****************组件文件加载完再绑定****************/
				// 结构组件和ui组件切换
				$(".component-type a").on("click", function() {
					$(".label-component").removeClass("active");
					$(this).addClass("active");
					var id = $(this).attr("data-id");
					$(".component-container").removeClass("active");
					$("#" + id).addClass("active");
				});
				
				// 组件列表切换
				$(".component-container p").on("click", function() {
					// var $li = $(this).closest("li");
					// $li.siblings("li.active").find(".component-box").slideUp();
					// $li.siblings("li.active").removeClass("active");
					// $li.addClass("active");
					// $li.find(".component-box").slideDown();
					
					var $li = $(this).closest("li");
					$li.toggleClass("active");
					$li.find(".component-box").slideToggle();
				});
				
				// 给组件绑定拖拽开始事件
				$(".component-container .component").on("dragstart", function() {
					// 获取组件绑定的数据
					var dataIndex = $(this).data("index").split("-");
					var bindData = vm.dataList[dataIndex[0]].components[dataIndex[1]].data[dataIndex[2]];
					// 将组件数据放入ev.dataTransfer
					event.dataTransfer.setData("data", JSON.stringify(bindData));
				});
				
				// 给组件绑定点击事件，用点击时鼠标与组件的相对位置和来确定
				$(".component-container .component").on("click", function() {
					var rect = getRectPos($(this));
					var pageX = event.pageX;
					var pageY = event.pageY;
					vm.dragClickPosition.top = pageY - rect.top;
					vm.dragClickPosition.left = pageX - rect.left;
					vm.dragClickPosition.width = rect.width;
					vm.dragClickPosition.height = rect.height;
				});
				
				// 绑定页面标题input的keydown事件
				$("#pageTitle").keydown(function(event){
					 if(event.keyCode==13){
						 createCode();     
					 }
			    });
			});
		});
	}
});			

/**
 * 使用说明展开/收起
 * @returns
 */
function toggleUpDown() {
	$("#description").stop(true,true).slideToggle();
}


$(document).ready(function() {
	// 使用说明
	var description = `
		<p>1、从左边组件库中拖出组件到右边主编辑区。</p>
		<p>2、结构组件可通过双击激活，点击主编辑区其他地方可取消激活状态，UI组件无激活状态。</p>
		<p>3、可将UI组件拖拽到激活的结构组件中，即结构组件是容器。</p>
		<p>4、鼠标左单击可选中组件（显示红色虚线框），ctrl+delete可移除选中的组件。</p>
		<p>5、鼠标右单击可呼出固定属性编辑模态框，可编辑组件的基础属性。</p>
		<p>6、输入页面title，回车或点击“生成代码”将下载格式化后的代码txt文件，另外控制台也将打印另一种格式化风格的代码。</p>
	`;
	$("#description").html(description);
	// 两秒后自动收起使用说明
	// setTimeout(function() {
	// 	if (!$("#description").is(":hidden")) {
	// 		toggleUpDown();
	// 	}
	// }, 2000);
	// 禁止拖拽图片
	$("#mainArea").on("dragstart", "img", function(e) {
		e.preventDefault();
	});
	
	
	// 给主编辑区绑定接收被拖拽组件事件
	$("#mainArea").on("drop", function() {
		// 取消主编辑区高亮
		$(this).css("background-color", "rgb(255 249 204)");
		
		// 获取拖拽元素绑定的组件数据
		var data=JSON.parse(event.dataTransfer.getData("data"));
		
		var pageX = event.pageX;
		var pageY = event.pageY;
		var top = pageY - vm.dragClickPosition.top;
		var left = pageX - vm.dragClickPosition.left;
		var bottom = top + vm.dragClickPosition.height;
		var right = left + vm.dragClickPosition.width;
		 
		// var curDrag = new Drag(data);
		// insertComponent($(curDrag.el),top, left, bottom, right, data);
		insertComponent(top, left, bottom, right, data);
	});
	// 阻止默认动作以启用drop
	$("#mainArea").on("dragover", function() {
		event.preventDefault();
	});
	// 拖拽元素进入目标元素高亮目标元素
	$("#mainArea").on("dragenter", function() {
		$(this).css("background-color", "rgb(255 242 148)");
	});
	// 拖拽元素离开目标元素取消高亮
	$("#mainArea").on("dragleave", function() {
		$(this).css("background-color", "rgb(255 249 204)");
	});
});

/**
 * 处理组件插入
 * 参数分别为被拖拽元素和其矩形模型的四条边位置
 * data:若是jquery对象，则说明此组件已经初始化，是在主编辑区内部拖拽；若是js对象则说明此组件还未初始化，是从组件库往主编辑区拖拽
 */
function insertComponent(top, left, bottom, right, data) {
	// 是否是jquery对象
	var isJQObj = data instanceof jQuery;
	var $activeComponent = $("#" + CONST_VARIABLE.MAIN_AREA).find("." + CONST_VARIABLE.STRUT_ACTIVE).eq(0); // 只操作第一个
	// 是否有激活的结构组件
	if ($activeComponent.length > 0) { // 是
	    // 若为jquery对象且插入对象与插入容器为同一个元素或激活元素是孩子而待插元素是祖先，则不往下执行
		if (isJQObj && ($activeComponent[0] == data[0] || $.contains(data[0], $activeComponent[0]))) {
			return false;
		}
		var activePos = getRectPos($activeComponent);
		
		var $insertBox = $activeComponent; // 待插入容器
		// if ($activeComponent.hasClass("isFrame")) {
		// 	$insertBox = $activeComponent.find(".body");
		// }
		
		// 判断拖拽元素与激活组件的相对位置
		if (((0 < (right - activePos.left) && (activePos.right - left) > 0)) || ((0 < (bottom - activePos.top) && (activePos.bottom - top) > 0))) { // 相交或相容
			var insertIndexArr = handleInsert(top, left, bottom, right, $insertBox);
			if (isJQObj) { // 是jquery对象，是在主编辑区内拖动
				// 将移动前操作存储到前进后退动作栈中
				saveMoveBeforeAction(data.closest("." + CONST_VARIABLE.AUTOCODING_EL), data);
				finalInsert(data, $insertBox, insertIndexArr);
				// 将移动后操作存储到前进后退动作栈中
				saveMoveAfterAction($insertBox, data, insertIndexArr);
			} else { // 不是jquery对象，是从组件库往主编辑区拖拽
				new Drag(data, $insertBox, insertIndexArr);
			}
		} else { // 相离则直接插入激活组件最后
			if (isJQObj) {
				// 将移动前操作存储到前进后退动作栈中
				saveMoveBeforeAction(data.closest("." + CONST_VARIABLE.AUTOCODING_EL), data);
				finalInsert(data, $insertBox, []);
				// 将移动后操作存储到前进后退动作栈中
				saveMoveAfterAction($insertBox, data, []);
			} else {
				new Drag(data, $insertBox, []);
			}
		}
	} else { // 直接插入主编辑区
		if (!isJQObj) {
			new Drag(data, $("#mainArea"), []);
		}
	}
	// 插入完成后的动作
	insertFinishedAction($activeComponent);
}

// 保存移动前动作
function saveMoveBeforeAction($insertBox, $el) {
	var insertIndexArr = [];
	if ($el.next()[0]) { // 若有弟元素, 再次插入应插入到弟元素之前
		insertIndexArr = [$el.next().index() - 1, 1];
	}
	actionStack.pushAction({
		action: "move",
		parentId: $insertBox.data("id"),
		selfId: $el.data("id"),
		insertIndexArr: insertIndexArr,
		type: "prev" // 标识走这一步前的状态
	});
}

// 保存移动后动作
function saveMoveAfterAction($insertBox, $el, insertIndexArr) {
	actionStack.pushAction({
		action: "move",
		parentId: $insertBox.data("id"),
		selfId: $el.data("id"),
		insertIndexArr: insertIndexArr,
		type: "cur" // 标识走这一步前的状态
	});
}

/**
 * 判断被拖拽组件插入的位置
 * 参数分别为拖拽元素矩形模型的四条边位置
 * 返回数组[a,b]；a:第几个元素，b代表1，：左还是2：右
 */
function handleInsert(top, left, bottom, right, $activeComponent) {
	var posArr = [];
	// 如果被激活结构组件中有子元素，则计算应插入的位置
	if ($activeComponent.children().length > 0) {
		// 若被拖拽元素的top大于被激活结构组件中最后一个子元素的bottom，则直接插入最后
		var lastChildRect = getRectPos($activeComponent.children().last());
		if (top > (lastChildRect.top+lastChildRect.height)) {
			posArr = [];
		} else {
			// 记录被拖拽元素与每一个子元素之间的左右最小距离，top相对距离以及对应的左右方向
			var result = {
				index: -1,
				minDistance: Number.MAX_VALUE, // 初始化为最大值
				direct: -1,
				top: Number.MAX_VALUE // 初始化为最大值
			};
			$activeComponent.children().each(function(indexC, el) {
				var cur =  {index: indexC};
				var childRect = getRectPos($(el));
				// 拖拽元素的左边框与当前子元素右边框距离
				var dragLWithChildR = Math.abs(left - childRect.right);
				// 拖拽元素的右边框与当前子元素左边框距离
				var dragRWithChildL = Math.abs(right - childRect.left);
				// 拖拽元素的上边框与当前子元素上边框距离（区分选中哪一行的子元素）
				var dragTWithChildT = Math.abs(top - childRect.top);
				cur.top = dragTWithChildT;
				if (dragLWithChildR <= dragRWithChildL) { // 往当前子元素右边插入
					cur.minDistance = dragLWithChildR; // 左、右方向上的最小距离
					cur.direct = 2;
				} else { // 往当前子元素左边插入
					cur.minDistance = dragRWithChildL;
					cur.direct = 1;
				}
				
				// 与上次结果比较
				if (cur.minDistance < result.minDistance) { // 若当前的值更小，则更新
					result = cur;
				} else if (cur.minDistance == result.minDistance) { // 若当前的值相等，则比较top
					if (cur.top <= result.top) {
						result = cur;
					}
				}
			});
			posArr.push(result.index);
			posArr.push(result.direct);
		}
	} else { // 若没有，则直接返回空数组，表示直接插入最后
		posArr = [];
	}
	return posArr;
}

/**
 * 将元素插入到对应位置
 * $el待插元素，$box待插容器，insertIndexArr待插位置
 */
function finalInsert($el, $box, insertIndexArr) {
	// 若insertIndexArr.length为0，则表示插入激活组件最后
	if (insertIndexArr.length == 0) {
		$box.append($el);
	} else {
		if (insertIndexArr[1] == 1) { // 左边
			$box.children().eq(insertIndexArr[0]).before($el);
		} else { // 右边
			$box.children().eq(insertIndexArr[0]).after($el);
		}
	}
}

/**
 * 插入完成之后执行的动作
 */
function insertFinishedAction($activeComponent) {
	// 元素插入完成之后，将插入容器高度设为auto
	// $activeComponent.css("height", "auto");
	// 初始化icheck
	// $(".i-checks").iCheck({checkboxClass:"icheckbox_square-green",radioClass:"iradio_square-green"});
}

/**
 * 获取元素矩形模型的位置信息
 */
function getRectPos($el) {
	var rect = $el[0].getBoundingClientRect();
	var pos = {
		top: rect.top,
		left: rect.left,
		height: rect.height,
		width: rect.width,
		right: rect.left + rect.width,
		bottom: rect.top + rect.height
	};
	return pos;
}

/**
 * 禁止右键菜单
 * @returns {Boolean}
 */
function doNothing(){  
    window.event.returnValue=false;  
    return false;  
}  

/**
 * 根据组件类型(名称)定义编辑模态框中的内容
 */
function editComponent(componentName) {
	$("#componentName").html(componentName);
	$("#extraAttr").html("");
	// 将组件当前的class属性值取出（不含isFrame autocoding-el strut-active）
	var $effectEl = $(waitEdit); // 当前作用的元素
	// if ($(waitEdit).hasClass("img-box")) {
	// 	$effectEl = $(waitEdit).find("img");
	// }
	var classes = $effectEl.attr("class");
	$("#componentClass").val(classes.replace(/autocoding-el|strut-active/g, "").trim());
	// 将组件当前的id属性值取出
	var id = $effectEl.attr("id");
	$("#componentId").val(id);
	switch (componentName) {
	// case "radio(icheck)":
	// case "checkbox(icheck)":
	case "文本input":
	case "月份input":
	case "日期input":
	case "select":
	case "textarea":
	case "radio":
	case "checkbox":
		var nameHtml = 
			`
				<div class="form-group">
			        <label>组件name：</label>
			        <input class="form-control" data-attr="name" placeholder="请输入组件name" />
			    </div>
	        `;
        $("#extraAttr").append(nameHtml);
        
        // 将组件当前的name属性值取出
        var name = $effectEl.attr("name");
        $("#extraAttr").find("[data-attr='name']").val(name);
	    break;
	case "laytable":
		var filterHtml =
			`
			<div class="form-group">
				<label>组件lay-filter：</label>
				<input class="form-control" data-attr="lay-filter" placeholder="请输入组件lay-filter" />
			</div>
		`;
		$("#extraAttr").append(filterHtml);

		// 将组件当前的src属性值取出
		var filter = $effectEl.attr("lay-filter");
		$("#extraAttr").find("[data-attr='lay-filter']").val(filter);
		break;
	};
	// input或者textarea需要编辑placeholder属性
	if (componentName == "文本input" || componentName == "textarea") {
		var placeholderHtml = 
			`
				<div class="form-group">
			        <label>组件placeholder：</label>
			        <input class="form-control" data-attr="placeholder" placeholder="请输入组件placeholder" />
			    </div>
	        `;
	        $("#extraAttr").append(placeholderHtml);
	        
	        // 将组件当前的src属性值取出
	        var placeholder = $effectEl.attr("placeholder");
	        $("#extraAttr").find("[data-attr='placeholder']").val(placeholder);
	}
	$("#editModal").modal("show");
}

/**
 * 确认属性编辑
 * @returns
 */
function ensureAttr() {
	var $effectEl = $(waitEdit); // 当前作用的元素
	if ($(waitEdit).hasClass("img-box")) {
		$effectEl = $(waitEdit).find("img");
	}
	// 确认class
	var curClasses = $("#componentClass").val();
	// // 若有isFrame autocoding-el strut-active，则加上
	// if ($effectEl.hasClass("isFrame")) {
	// 	curClasses += " isFrame";
	// }
	if ($effectEl.hasClass("autocoding-el")) {
		curClasses += " autocoding-el";
	}
	if ($effectEl.hasClass("strut-active")) {
		curClasses += " strut-active";
	}
	if (curClasses.trim() != "") {
		$effectEl.attr("class", curClasses);
	}
	// 若是图片则把图片的class在附加到父容器上
	if ($(waitEdit).hasClass("img-box")) {
		$(waitEdit).addClass(curClasses);
	}
	
	// 确认id
	var curId = $("#componentId").val();
	if (curId.trim() != "") {
		$effectEl.attr("id", curId);
	}
	
	// 确认其他属性
	$("#extraAttr").children().each(function() {
		$effectEl.attr($(this).find("input").data("attr"), $(this).find("input").val());
	});
	// 关闭模态框
	$("#editModal").modal("hide");
}