(function() {
	// class变量
	window.CONST_VARIABLE = {
		// 主编辑区ID
		MAIN_AREA: "mainArea",
		// 拖拽组件标识
		AUTOCODING_EL: "autocoding-el",
		// 结构组件激活状态
		STRUT_ACTIVE: "strut-active",
		// 组件hover状态
		COMPONENT_HOVER: "component-hover"
	};
	window.waitEdit = null; // 待编辑的组件
    // 绑定点击主编辑区内其他地方且点击事件不发生在激活元素中，取消所有结构组件的激活状态
    $("#" + CONST_VARIABLE.MAIN_AREA).on("click", function(e) {
        if (!$(e.target).closest("." + CONST_VARIABLE.STRUT_ACTIVE).length > 0 && !$(e.target).hasClass(CONST_VARIABLE.STRUT_ACTIVE)) {
            cancelActive();
        }
    });
	
	// 绑定主编辑区下的所有tabindex=0元素的ctrl+delete键盘事件(为了防止其与delete删除编辑中的文字冲突)
	$("#" + CONST_VARIABLE.MAIN_AREA).on("keyup", ".autocoding-el:focus", function(e) {
		if (e.keyCode == 46 && e.ctrlKey) {
			e.stopPropagation();
			removeEl(this);
		}
	});

	// 移除元素
	window.removeEl = function(el) {
		// 通过style设置元素的尺寸，以保证前进后退时，能得到最新的元素尺寸
		var curEl = $(el).closest("." + CONST_VARIABLE.AUTOCODING_EL);
		curEl.css({"height": curEl.height(), "width": curEl.width()});
		curEl.find("." + CONST_VARIABLE.AUTOCODING_EL).each(function() {
			$(this).css({"height": curEl.height(), "width": curEl.width()});
		});
		// 设置尺寸后移除元素
		curEl.remove();
		// 移除后创建操作对象并将移除操作对象添加进操作栈[添加元素操作、移除元素操作]
		// 添加元素操作
		var operateAddObj = {};
		var insertIndexArr = [];
		operateAddObj.action = "add"; // 操作类型
		operateAddObj.parentId = curEl.closest("." + CONST_VARIABLE.AUTOCODING_EL).data("id");
		operateAddObj.self = curEl.clone();
		operateAddObj.selfId = curEl.data("id");
		operateAddObj.type = "prev"; // 标识走这一步前的状态
		if (curEl.next()[0]) { // 若有弟元素, 再次插入应插入到弟元素之前
			insertIndexArr = [curEl.next().index() - 1, 1];
		}
		operateAddObj.insertIndexArr = insertIndexArr;
		actionStack.pushAction(operateAddObj);

		// 移除元素操作
		var operateRemoveObj = {
			action: "remove",
			selfId: curEl.data("id"),
			type: "cur" // 标识走完这一步的当前状态
		};
		actionStack.pushAction(operateRemoveObj);
	}
    
    /**
     * 取消所有结构件激活状态
     */
    window.cancelActive = function() {
		// 移除激活组件中的删除按钮
		$(".del-el").remove();
		// 取消激活组件的激活状态
        $("." + CONST_VARIABLE.STRUT_ACTIVE).removeClass(CONST_VARIABLE.STRUT_ACTIVE);
    }
    
    // 声明构造函数
    function Drag(option, $box, insertIndexArr) {
		var $el;
    	// 若option是jquery对象，则是前进后退操作
		if (option instanceof jQuery) {
			$el = option;
		} else {
			var defaultOption = {
				// isFrame: false, // 是否是框架组件
				editSelector: "", // 右键编辑的元素选择器，空字符串即为编辑当前组件
				type: 0, // 结构组件或者UI组件0：UI组件，1：结构组件，默认UI组件
				canChangeSize: 0, // 是否可拖拽大小
				componentIcon: "fa fa-question",
				componentName: "未知",
				height: 100,
				minWidth: "0",
				dragDirect: [],
				html: ""
			};
			var option = $.extend(true, defaultOption, option);

			$el = $(option.html);
			$el.height(option.height);
			if ( Object.prototype.toString.call(option.minWidth) == "[object String]") {
				$el.css("min-width", option.minWidth);
			} else {
				$el.css("min-width", option.minWidth + "px");
			}

			var elId = guid();
			$el.attr("data-id", elId); // 用来确定元素的唯一性

			$el.attr("data-type", option.type); // 保存type
			$el.attr("data-changesize", option.canChangeSize); // 保存canChangeSize

			// 保存添加动作[移除元素操作、添加元素操作]
			// 移除元素操作
			actionStack.pushAction({
				action: "remove",
				selfId: elId,
				type: "prev" // 标识走这一步前的状态
			});
			// 添加元素操作
			actionStack.pushAction({
				action: "add",
				parentId: $box.data("id"),
				self: $el.clone(),
				selfId: elId,
				insertIndexArr: insertIndexArr,
				type: "cur" // 走完这一步的当前状态
			});
		}

		// 为了迁就大容器中的子元素初始化而做的判断
		if ($box && insertIndexArr) {
			finalInsert($el, $box, insertIndexArr);
		}
        // $('#' + CONST_VARIABLE.MAIN_AREA).append($el);
		
        this.el = $el[0];
        // 开始拖动时,鼠标的位置
        this.startX = 0;
        this.startY = 0;
        // 开始拖动时,拖动元素的tanslate
        this.sourceX = 0;
        this.sourceY = 0;
        // 开始拖拽时,元素的宽和高以及drager
        this.width = 0;
        this.height = 0;
        this.drager = "";
        // 拖拽过程中上一次鼠标的位置
        this.dragX = 0;
        this.dragY = 0;
        // 最小的边长
        this.minSide = 60;
		// 配置项附加在实例上
		this.option = option;
        this.init(option.type, option.canChangeSize);
    }
    
    // 添加原型方法
    Drag.prototype = {
        constructor: Drag,
        init: function(type, changeSize) {
        	if (type) { // 若type存在则为新拖拽生成元素
				// 构建必要的html结构
				this.buildHtml(changeSize);
			}
            // 绑定操作（激活、右键等）相关事件
            this.setOperate(type ? type : $(this.el).data("type"));
            // 绑定拖拽相关事件
            this.setDrag(changeSize ? changeSize : $(this.el).data("changesize"));
        },
        buildHtml: function(changeSize) {
            $(this.el).addClass(CONST_VARIABLE.AUTOCODING_EL);
            // 附加拖拽大小功能
            if (changeSize == 1) {
				var html = "<div class='drag-box'>";
				if (this.option.dragDirect.indexOf("tl") > -1) { // 上左
					html += '<span class="drager top-left angle" data-direct="topLeft"></span>';
				} else {
					html += '<span class="drager top-left angle ban"></span>';
				}
				if (this.option.dragDirect.indexOf("tr") > -1) { // 上右
					html += '<span class="drager top-right angle" data-direct="topRight"></span>';
				} else {
					html += '<span class="drager top-right angle ban"></span>';
				}
				if (this.option.dragDirect.indexOf("bl") > -1) { // 下左
					html += '<span class="drager bottom-left angle" data-direct="bottomLeft"></span>';
				} else {
					html += '<span class="drager bottom-left angle ban"></span>';
				}
				if (this.option.dragDirect.indexOf("br") > -1) { // 下右
					html += '<span class="drager bottom-right angle" data-direct="bottomRight"></span>';
				} else {
					html += '<span class="drager bottom-right angle ban"></span>';
				}
				if (this.option.dragDirect.indexOf("t") > -1) { // 上
					html += '<span class="drager top border" data-direct="top"></span>';
				} else {
					html += '<span class="drager top border ban"></span>';
				}
				if (this.option.dragDirect.indexOf("r") > -1) { // 右
					html += '<span class="drager right border" data-direct="right"></span>';
				} else {
					html += '<span class="drager right border ban"></span>';
				}
				if (this.option.dragDirect.indexOf("b") > -1) { // 下
					html += '<span class="drager bottom border" data-direct="bottom"></span>';
				} else {
					html += '<span class="drager bottom border ban"></span>';
				}
				if (this.option.dragDirect.indexOf("l") > -1) { // 左
					html += '<span class="drager left border" data-direct="left"></span>';
				} else {
					html += '<span class="drager left border ban"></span>';
				}
				html += "</div>";
                $(this.el).append(html);
            }
        },
        setOperate: function(type) {
			// 绑定hover事件
			// $(this.el).hover(function(e) {
			// 	// e.stopPropagation();
			// 	$('.autocoding-el').css("box-shadow", "none");
			// 	$(this).css("box-shadow", "0 0 2px #00b6ff");
			// }, function(e) {
			// 	// e.stopPropagation();
			// 	$(this).css("box-shadow", "none");
			// });

			// 绑定单击添加删除按钮且激活（结构组件激活加删除按钮，UI组件只加删除按钮）
			this.el.addEventListener('click', componentActive(type), false);
            // if (type == 1) {
            //     if (this.option.isFrame) { // 是结构组件且是框架元素则可编辑span、small
            //     	$(this.el).find("span").attr("contentEditable", true);
            //     	$(this.el).find("small").attr("contentEditable", true);
            //     }
            // } else { // UI组件全部可编辑
            // 	$(this.el).attr("contentEditable", true);
            // }
			$(this.el).attr("contentEditable", true);
            $(this.el).attr("title", this.option.componentName);
            function componentActive(type) {
				return function() {
					event.stopPropagation();
					if (type == 1) { // 结构组件才处理激活
						cancelActive();
						$(this).addClass(CONST_VARIABLE.STRUT_ACTIVE);
					}

					// 不管是结构组件还是UI组件都添加删除按钮
					if ($(this).find(".del-el").length == 0) {
						$(this).append(`<span class="del-el" onclick="removeEl(this)"><i class="fa fa-times"></i></span>`);
					}		
				}
			}
        },
        setDrag: function(changeSize) {
            var self = this;
            // 给组件绑定拖拽位置监听
            self.el.addEventListener('mousedown', start, false);
            function start(event) {
				event.stopPropagation();
				if (event.which == 1) { // 鼠标左键点击
					// // 鼠标按下时position:absolute; transform:none; top:offsetTop; left:offsetLeft
					// setMousedownCss();
					// 禁止选取
//					$(self.el).attr('onselectstart', "return false;");
					$(self.el).css("z-index", "10000"); // 当前拖动的元素置于最上层
					
					self.startX = event.pageX;
					self.startY = event.pageY;
					
					var pos = self.getPosition();
					
					self.sourceX = pos.x;
					self.sourceY = pos.y;
					
					document.addEventListener('mousemove', move, false);
					document.addEventListener('mouseup', end, false);
				} else if (event.which == 3) { // 鼠标右键点击
					if (self.option.editSelector != "") {
						window.waitEdit = $(self.el).find(self.option.editSelector);
					} else {
						window.waitEdit = self.el;
					}
					// 根据组件类型定义编辑模态框中的内容
					editComponent(self.option.componentName);
				}
            }

            function move(event) {
                var currentX = event.pageX;
                var currentY = event.pageY;

                var distanceX = currentX - self.startX;
                var distanceY = currentY - self.startY;

                self.setPosition({
                    x: (self.sourceX + distanceX).toFixed(),
                    y: (self.sourceY + distanceY).toFixed()
                })
            }

            function end(event) {
				// // 鼠标松开时position:static或relative; transform:none; width:auto
				// setMouseupCss();
				// 移除禁止选取
                $(self.el).removeAttr('onselectstart');
				$(self.el).css("z-index", "10"); // 当前拖动的元素层级还原
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', end);
				
				// 拖动了一定距离
				if (event.pageX != self.startX || event.pageY != self.startY) {
					// 插入拖拽元素
					self.insertElement();
				}
            }
			
			// function setMousedownCss() {
				// var offSetTop = self.el.offsetTop;
				// var offSetLeft = self.el.offsetLeft;
				// $(self.el).css({
				// 	"position": "absolute",
				// 	// "transform": "none",
				// 	// "top": offSetTop + "px",
				// 	// "left": offSetLeft + "px",
				// 	"width": $(self.el).width()
				// });
			// }
			
			// function setMouseupCss() {
				// $(self.el).css({
				// 	// "position": "relative",
				// 	// "transform": "none",
				// 	// "top":0,
				// 	// "left": 0,
				// 	// "width": "auto"
				// });
			// }
			
            // 添加拖拽大小绑定
            if (changeSize == 1) {
                // 给八个拖拽点绑定拖拽尺寸监听
                $(self.el).find('.drager').on('mousedown', resizeStart);
            }
            function resizeStart() {
                event.stopPropagation();
                $(self.el).attr('onselectstart', "return false;");
                self.startX = event.pageX;
                self.startY = event.pageY;
                
                self.dragX = event.pageX;
                self.dragY = event.pageY;    
                
                var pos = self.getPosition();
                    
                self.sourceX = pos.x;
                self.sourceY = pos.y;
                
                self.width = self.getSize().w;
                self.height = self.getSize().h;
                
                document.addEventListener('mousemove', resizeMove, false);
                document.addEventListener('mouseup', resizeEnd, false);
            }
            
            function resizeMove(event) {
				event.stopPropagation();
                var distanceX = event.pageX - self.dragX;
                var distanceY = event.pageY - self.dragY;
                
                self.drager = $(event.target).data("direct") ? $(event.target).data("direct") : self.drager;
                self.setSize({
                    x: distanceX.toFixed(),
                    y: distanceY.toFixed()
                });
                // 更新上一次拖拽鼠标的位置
                self.dragX = event.pageX;
                self.dragY = event.pageY;
            }
            
            function resizeEnd() {
				event.stopPropagation();
                $(self.el).removeAttr('onselectstart');
                document.removeEventListener('mousemove', resizeMove);
                document.removeEventListener('mouseup', resizeEnd);
            }
        },
        getPosition: function() {
            var transformValue = document.defaultView.getComputedStyle(this.el, false)["transform"];
            if(transformValue == 'none') {
                return {x: 0, y: 0};
            } else {
                var temp = transformValue.match(/-?\d+/g);
                return {
                    x: parseInt(temp[4].trim()),
                    y: parseInt(temp[5].trim())
                }
            }
        },
        getSize: function() {
            var widthValue = document.defaultView.getComputedStyle(this.el, false)["width"];
            var heightValue = document.defaultView.getComputedStyle(this.el, false)["height"];
            return {w: parseInt(widthValue), h: parseInt(heightValue)};
        },
        setPosition: function(pos) {
            this.el.style["transform"] = 'translate('+ pos.x +'px, '+ pos.y +'px)';
        },
        setSize: function(pos) { // className: 拖拽类型(四边拖拽或者四角拖拽)
            var self = this;
            var pos = {x: parseInt(pos.x), y: parseInt(pos.y)};
            // 当前的拖拽位置
            var translateX = self.getPosition().x;
            var translateY = self.getPosition().y;
            switch (self.drager) {
                case "top":
					if (this.option.dragDirect.indexOf("t") > -1) {
						if ((self.height - pos.y) >= self.minSide) {
							self.height -= pos.y;
							this.el.style["height"] = self.height + 'px';
							this.el.style["transform"] = 'translate('+ translateX + 'px, ' + (translateY + pos.y) +'px)';
						}
					}
                    break;
                case "right":
					if (this.option.dragDirect.indexOf("r") > -1) {
						if ((self.width + pos.x) >= self.minSide) {
							self.width += pos.x;
							this.el.style["width"] = self.width + 'px';
						}
					}
                    break;
                case "bottom":
					if (this.option.dragDirect.indexOf("b") > -1) {
						if ((self.height + pos.y) >= self.minSide) {
							self.height += pos.y;
							this.el.style["height"] = self.height + 'px';
						}
					}
                    break;
                case "left":
					if (this.option.dragDirect.indexOf("l") > -1) {
						if ((self.width - pos.x) >= self.minSide) {
							self.width -= pos.x;
							this.el.style["width"] = self.width + 'px';
							this.el.style["transform"] = 'translate('+ (translateX + pos.x) +'px, '+ translateY +'px)';
						}
					}
                    break;
                case "topLeft":
					if (this.option.dragDirect.indexOf("tl") > -1) {
						if ((self.width - pos.x) >= self.minSide) {
							self.width -= pos.x;
							this.el.style["width"] = self.width + 'px';
							this.el.style["transform"] = 'translate('+ (translateX + pos.x) +'px, '+ translateY +'px)';
						}
						if ((self.height - pos.y) >= self.minSide) {
							self.height -= pos.y;
							this.el.style["height"] = self.height + 'px';
							this.el.style["transform"] = 'translate('+ translateX + 'px, ' + (translateY + pos.y) +'px)';
						}
						if ((self.height - pos.y) >= self.minSide && (self.width - pos.x) >= self.minSide) {
							this.el.style["transform"] = 'translate('+ (translateX + pos.x) + 'px, ' + (translateY + pos.y) +'px)';
						}
					}
                    break;
                case "topRight":
					if (this.option.dragDirect.indexOf("tr") > -1) {
						if ((self.height - pos.y) >= self.minSide) {
							self.height -= pos.y;
							this.el.style["height"] = self.height + 'px';
						}
						if ((self.width + pos.x) >= self.minSide) {
							self.width += pos.x;
							this.el.style["width"] = self.width + 'px';
							this.el.style["transform"] = 'translate('+ (translateX + pos.x) +'px, '+ translateY +'px)';
						}
					}
                    break;
                case "bottomLeft":
					if (this.option.dragDirect.indexOf("bl") > -1) {
						if ((self.width - pos.x) >= self.minSide) {
							self.width -= pos.x;
							this.el.style["width"] = self.width + 'px';
							this.el.style["transform"] = 'translate('+ (translateX + pos.x) + 'px, ' + translateY +'px)';
						}
						if ((self.height + pos.y) >= self.minSide) {
							self.height += pos.y;
							this.el.style["height"] = self.height + 'px';
						}
					}
                    break;
                case "bottomRight":
					if (this.option.dragDirect.indexOf("br") > -1) {
						if ((self.width + pos.x) >= self.minSide) {
							self.width += pos.x;
							this.el.style["width"] = self.width + 'px';
						}
						if ((self.height + pos.y) >= self.minSide) {
							self.height += pos.y;
							this.el.style["height"] = self.height + 'px';
						}
					}
                    break;
                default:
                    break;
            }
        },
        insertElement: function() {
            var dragElPos = getRectPos($(this.el));
			insertComponent(dragElPos.top, dragElPos.left, dragElPos.bottom, dragElPos.right, $(this.el));
			// 若不是页面框架组件则移除元素平移量
//			if (!this.option.isFrame) {
				$(this.el).css("transform", "none");
//			}
        }
    }
    // 暴露Drag类
    window.Drag = Drag;
})();

// 生成uuid
function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}