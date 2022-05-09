/**
 * 此js适用于使用jqgrid表格的页面
 */
document.write("<script language=javascript src='/plugIn/jqGrid-5.3.1/js/i18n/grid.locale-cn.js'></script>");
document.write("<script language=javascript src='/plugIn/jqGrid-5.3.1/js/jquery.jqGrid.js?v=20190626'></script>");
//document.write("<script language=javascript src='/plugIn/jqGrid-5.3.1/plugins/grid.addons.js'></script>");
//document.write("<script language=javascript src='/plugIn/jqGrid-5.3.1/plugins/jquery.searchFilter.js'></script>");
$(window).on('resize', function() {
	 var $gboxList = $('div[id*="gbox"]');
	 if ($gboxList.length > 0) {
		 $gboxList.each(function() {
			 // 宽度自适应
			 var tableId = $(this).attr('id').split('_')[1];
			 var tableHeight = parseInt($('#' + tableId).getGridParam('height'));
			 jqgAdapt.adjustSize(tableId, tableHeight); // 调整尺寸
			 jqgAdapt.setFrozenCol(tableId); // 调整冻结列
		 })
	 }
});
var jqgAdapt = (function() {
	// 锁定列图标
	this.freezeHtml = "<i class='mr5 fa fa-unlock' onclick='freezeCol(this, event)' data-lock='0'></i>";
	this.noFreezeHtml = "<i class='mr5 fa fa-unlock' onclick='freezeCol(this, event)' data-lock='1'></i>";
	this.hScrollHeight = 17; // 横向滚动条的高度
	
	/**
	 * 调整表格尺寸
	 */
	this.adjustSize = function (elId, height) {
		var $el = $('#' + elId);
		var $container = $('#gbox_' + elId);
		// 调整宽度
		adjustWidth(elId, height);
		// 是否有横向滚动条
		this.isHScroll = isHScrollFc($el);
		// 调整高度，以自适应
		if($el.outerHeight() < height) { // 若表体高度小于height，则让外围容器跟着变矮
			if (this.isHScroll) { // 若有横向滚动条，则需要将外围容器高度加上滚动条高度
            	 $el.parents('.ui-jqgrid-bdiv').outerHeight($el.outerHeight() + this.hScrollHeight);
        	 } else {
        		 $el.parents('.ui-jqgrid-bdiv').outerHeight($el.outerHeight());
        	 }
			$container.find('.ui-jqgrid-hbox').css('padding-right', '0');
        } else { // 若表体高度不小于height，则让外围容器等于设置的高度
        	 $el.parents('.ui-jqgrid-bdiv').outerHeight(height);
        	 $container.find('.ui-jqgrid-hbox').css('padding-right', '6px');
        }
		// 修复当没有数据时表格不会滚动的问题
		if ($el.height() == 0) {
			$el.height(1);
		}
		// 加合计名称
		if ($el.getGridParam('footerrow')) { // footrow
			if ($el.getGridParam('calculationType') != undefined) { // 若有footer，默认显示是合计
				$container.find('.footrow > td:eq(0)').text($el.getGridParam('calculationType'));
			} else {
				$container.find('.footrow > td:eq(0)').text('合计');
			}
		}
	} 
	
	/**
	 * 修复手动设置列为冻结后，滚动条再次出现后的bug
	 */
	this.repairJqg = function (elId, height) {
		// 调整表格尺寸
		adjustSize(elId, height);
		this.setFrozenCol(elId);
		// 自动调整冻结列
//		
		
	}
	
	/**
	 * 自动调整冻结列
	 */
	this.setFrozenCol = function (elId) {
		var $table = $('#' + elId);
		var $container = $('#gbox_' + elId);
		// 若列宽改变后无横向滚动条，则自动解锁冻结列和checkBox列
		var colArr = $table.jqGrid('getGridParam', 'colModel');
		if (!isHScrollFc($table)) {
			if (colArr.length > 0 && colArr[0].name == "cb") { // 若第一列时checkBox
				$table.jqGrid('setColProp', 'cb', {frozen:false});
			}
			$container.find('i.fa-unlock').each(function() {
				$(this).hide();
			});	
			$container.find('i.fa-lock').each(function() {
				$(this).hide();
			});	
			$table.jqGrid('destroyFrozenColumns');
		} else { // 若有横向滚动条，则自动冻结列
			if (colArr.length > 0 && colArr[0].name == "cb") { // 若第一列是checkBox
				$table.jqGrid('setColProp', 'cb', {frozen:true});
			}
			$container.find('i.fa-lock').each(function() {
				$(this).show();
			});	
			$container.find('i.fa-unlock').each(function() {
				$(this).show();
				if($(this).attr("data-lock") == "0"){
					$(this).click();
				}
			});	
			commonFreezeFc(elId);
		}
	}
	
	/**
	 * 调整宽度
	 */
	var adjustWidth = function(elId, height) {
		var $el = $('#' + elId);
		var $container = $('#gbox_' + elId);
		if ($container.length > 0) {
			// 让表格宽度与父元素宽度一致
			$el.setGridWidth($container.parent().width());
//			// 表格内容横向铺满
			$container.find('.ui-jqgrid-bdiv > div > table').outerWidth('100%');
			$container.find('.ui-jqgrid-hbox > table').outerWidth('100%');
			if($el.outerHeight() < height) { // 是否有纵向滚动条的padding-right
				$container.find('.ui-jqgrid-hbox').css('padding-right', '0');
				$container.find('.ui-jqgrid-htable').css('border-right', '1px solid #fff'); // 右边框为白色
			} else { 
				$container.find('.ui-jqgrid-hbox').css('padding-right', '6px');
				$container.find('.ui-jqgrid-htable').css('border-right', '1px solid #ddd'); // 右边框为正常边框颜色
			}
		}
	}
	
	// 计算列合计值
    this.totalSumColumn = function(el) {
   	 var $el = $('#' + el);
        var rowNum = parseInt($el.getGridParam('records'), 10); // 数据条数
        var colModelArray = $el.getGridParam('colModel'); // 表头数据
        var currentRows = window.filterResult; // 过滤后的当前表体数据
        var needSumColumn = []; // 需要合计的列
        var sumResultArray = []; // 最后的合计结果数组
        for (var colModel of colModelArray) { // 列出需要合计的列
        	if (colModel["totalSum"]) { // 若是需要合计的列
        		needSumColumn.push(colModel);
        	}
        }
        if (rowNum > 0) { // 计算
        	for (var colModel of needSumColumn) {
        		var fixed = Number(colModel.fixed)|0; // 保留的位数，默认不保留
        		var objSum = {};
        		var currentColSum = 0;
        		for (var data of currentRows) { // 计算合计值
        			if (!isNaN(parseFloat(data[colModel.name]))) {
//        				currentColSum += parseFloat(data[colModel.name]);
        				currentColSum = currentColSum.add(parseFloat(data[colModel.name]));
        			} else {
//        				alertCountDown(5, '"' + colModel.label + '"列数据格式错误！');
//        				return false;
        				continue;
        			}
	        	}
	        	objSum[colModel.name] = currentColSum.toFixed(fixed);
	        	$el.footerData("set", objSum);
        	}
        } else { // 没有数据时，合计值为0
        	for (var colModel of needSumColumn) {
        		var objSum = {};
        		objSum[colModel.name] = 0;
        		$el.footerData("set", objSum);
        	}
        } 
    }
    
    // 计算列平均值
    // justValid: true,只讲有效的数据计入分母；false,无效数据也计入分母
    this.totalAveColumn = function(el, justValid) {
    	var count = 0; // 分母
   	 	var $el = $('#' + el);
        var rowNum = parseInt($el.getGridParam('records'), 10); // 数据条数
        var colModelArray = $el.getGridParam('colModel'); // 表头数据
        var currentRows = window.filterResult; // 过滤后的当前表体数据
        var needSumColumn = []; // 需要平均值的列
        var sumResultArray = []; // 最后的平均值结果数组
        for (var colModel of colModelArray) { // 列出需要平均值的列
        	if (colModel["totalAve"]) { // 若是需要求平均值的列
        		needSumColumn.push(colModel);
        	}
        }
        if (rowNum > 0) { // 计算
        	for (var colModel of needSumColumn) {
        		var fixed = Number(colModel.fixed)|0; // 保留的位数，默认不保留
        		var objSum = {};
        		var currentColSum = 0;
        		var isPercent = false; // 是否是百分数
        		for (var data of currentRows) { // 计算合计值
        			if (!isNaN(parseFloat(data[colModel.name]))) {
        				if ((data[colModel.name] + '').indexOf('%') > -1) { // 若是百分数
        					isPercent = true;
        				}
//        				currentColSum += parseFloat(data[colModel.name]);
        				currentColSum = currentColSum.add(parseFloat(data[colModel.name]));
        				count++;
        			} else {
        				continue;
        			}
	        	}
        		if (typeof(justValid) == 'undefined' || !justValid) { // 默认将无效数据计入分母，则分母直接为数据条数
        			count = rowNum;
        		}
        		// 若count为0，平均值为-
        		if (count != 0) {
        			if (isPercent) { // 若是百分数
        				objSum[colModel.name] = (currentColSum.div(count)).toFixed(fixed) + "%";
        			} else {
        				objSum[colModel.name] = (currentColSum.div(count)).toFixed(fixed);
        			}
        		} else {
        			objSum[colModel.name] = '-';
        		}
        		$el.footerData("set", objSum);
	        	count = 0; // 一列计算完将分母归0
        	}
        } else { // 没有数据时，平均值为-
        	for (var colModel of needSumColumn) {
        		var objSum = {};
        		objSum[colModel.name] = '-';
        		$el.footerData("set", objSum);
        	}
        } 
    }
    
    /**
     * 数据行颜色区分
     */
    this.colorDistinguish = function(el) {
    	var $el = $('#' + el);
    	var rowIds = $el.getDataIDs(); // 获取数据行的id list
        for(var id of rowIds){
            var rowData = $el.getRowData(id, true); // 第二个参数true时，返回全体数据，false时，返回驯染过的表格数据
            switch (rowData.dateDist) {
	        case "year": // 年数据的背景颜色
	        	$el.find('tr[id="' + id + '"]').addClass('report-year');
	            break;
	        case "month": // 月数据的背景颜色
	        	$el.find('tr[id="' + id + '"]').addClass('report-month');
	            break;
	        case "week": // 周数据的背景颜色
	        	$el.find('tr[id="' + id + '"]').addClass('report-week');
	            break;
	        case "day": // 日数据的背景颜色
	        	$el.find('tr[id="' + id + '"]').addClass('report-day');
	            break;
	        default:
	            break;
            }
        }
    }
    
    /**
     * 创建多级表头
     */
    this.addMulTableHeader = function(el, mulTheadList) {
        var $el = $('#' + el);
    	for(var head of mulTheadList){
    		if (head.length > 0) {
    			$el.jqGrid('setGroupHeaders', {
    				useColSpanStyle: true, 
    				groupHeaders: head
    			});
    		}
    	}
    }
    
    /**
     * 判断是否有横向滚动条
     */
    this.isHScrollFc = function($el) {
    	return $el.outerWidth() > $el.parents('.ui-jqgrid-bdiv').outerWidth();
    };
    
    /**
     * 选中行样式
     */
    this.selectTrStyle = function(trId, status, $table) {
    	var $tableView = $table.closest('.ui-jqgrid-view');
    	if($tableView.find("tr[id=" + trId + "]").hasClass('success')) {
	   		if (!status) {
	   			$tableView.find("tr[id=" + trId + "]").removeClass('success');
	   		}
	   	} else{
	   		$tableView.find("tr[id=" + trId + "]").addClass('success');
	   	}
    }
    
    /**
     * 序列化表单元素为json对象
     */
    this.formToObj = function($form) {
    	var formArray = $form.serializeArray();
    	var formObj={};
    	for (var elem of formArray) {
    		if (Object.keys(formObj).indexOf(elem.name) > 0) {
				formObj[elem.name] += "," + elem.value || "";
    		} else {
    			formObj[elem.name] = elem.value || "";
    		}
    	}
    	return formObj;
    }
    
    /**
     * 冻结列公共调用方法
     */
    this.commonFreezeFc = function(tableId) {
    	// 销毁冻结列
        $('#' + tableId).jqGrid('destroyFrozenColumns');
        // 设置冻结列
        $('#' + tableId).jqGrid('setFrozenColumns');
    }
    
    /**
     * 数组去重并拼接search select中的值
     * 因jqgrid暂时没有重新加载表头的方法，故加载表格前手动修改colModel，再回传回去
     */
    this.addSearchSelect = function(colModelArray, dataList) {
    	var basicStr = ":[All];";
    	for (var colObj of colModelArray) {
    		var obj = {}; // 当前列所有数据
    		if (colObj["stype"] == "select") { // 当前列含select匹配
    			if (typeof(colObj["formatter"]) == 'undefined') { // 当前列数据未经jqgrid format处理
    				if (dataList.length > 0) {
    					for (var dataObj of dataList) {
    						var keys = colObj["name"].split('.');
    						var data = $.extend(true, data, dataObj); // 字段对应数据
    						for (var key of keys) { // 兼容深层数据
    							data = data[key];
    						}
    						obj[data + ":" + data] = data;
    					}
    					colObj["searchoptions"] = {"sopt": ["eq"], "value": basicStr + Object.keys(obj).join(";")};
    				} else {
    					colObj["searchoptions"] = {"sopt": ["eq"], "value": ""};
    				}
    			} else { // 当前列数据已经过jqgrid format处理
    				
    			}
    		}
    	}
    	return colModelArray;
    }
    
    /**
     * 表格编辑单元格后先check是否有未保存数据，再进行后续操作
     */
    this.checkCellEditor = function(tableId) {
    	var $editorCell = $('#' + tableId).find('td.edit-cell');
    	if($editorCell.find('input[role=textbox]').length > 0) {
    		alertCountDown(5, "表格中含未保存数据，请先保存！<br><span class='cc0392b'>保存方法：输入后按回车键或者点击表格其他地方。</span>");
    		return false;
    	}
    	return true;
    }
    
    /**
     * 只check所选行是否有未保存单元格数据
     */
    this.checkSelectTrCellEditor = function(tableId, ids) {
    	var $editorCell = $('#' + tableId).find('td.edit-cell');
    	var invaildTrId;
    	if($editorCell.find('input[role=textbox]').length > 0) {
    		invaildTrId = $editorCell.closest('tr').attr('id');
    		if (ids.indexOf(invaildTrId) != -1) {
    			alertCountDown(5, "所选行中含未保存数据，请先保存！<br><span class='cc0392b'>保存方法：输入后按回车键或者点击表格其他地方。</span>");
    			return false;
    		}
    	}
    	return true;
    }
	return this;
})();

/**
 * 动态冻结列方法
 */
function freezeCol(el, event) {
	event.stopPropagation();
	var tableId = $(el).parents('table').attr('aria-labelledby').split('_')[1];
	var $table = $('#' + tableId); // 数据表格jquery对象
	var $tableContainer = $('#gbox_' + tableId); // 表格外围总容器jquery对象
	// 若无横向滚动条，则禁止冻结列
	var isHscroll = jqgAdapt.isHScrollFc($table);
    var colKey = $(el).parent('div').attr('id').split('_').splice(2).join('_');
    var isFrozen = $table.jqGrid('getColProp', colKey).frozen ? true : false;
    if (!isHscroll && !isFrozen) {
    	alertCountDown(5,"当前表格无需冻结列！");
		return false;
	}
    
    // 判断是否是多级表头
    var isMulTHeade = $('#toolBar_' + tableId).is('.mulThead');
    if (isMulTHeade) { // 多级表头冻结列时，冻结前面所有列，解锁列时，解锁后面所有列
    	if (isFrozen) { // 解锁列
    		var lockList = $tableContainer.find('.ui-jqgrid-hdiv:eq(1)').find('i.fa-lock') // 冻结列头中找冻结图标
    		for(var i = lockList.length - 1; i > -1; i--) {
    			var curColKey = $(lockList[i]).parent('div').attr('id').split('_').splice(2).join('_');
    			$table.jqGrid('setColProp', curColKey, {frozen:false});
    			// 解锁的时候需要改变冻结列覆盖的列图标，因为冻结的列已经被移除了
    			$('#' + $(lockList[i]).parent('div').attr('id') + ' > i').removeClass('fa-lock').addClass('fa-unlock');
    			if (curColKey == colKey) { // 将列一直解锁至最后冻结列
    				break;
    			}
    		}
    	} else { // 冻结列
    		$tableContainer.find('.ui-jqgrid-hdiv:eq(0)').find('i.fa-unlock').each(function(index, ele) { // 非冻结列头中找未冻结图标
    			var curColKey = $(ele).parent('div').attr('id').split('_').splice(2).join('_');
    			$table.jqGrid('setColProp', curColKey, {frozen:true});
    			$(ele).removeClass('fa-unlock').addClass('fa-lock'); // 锁的时候直接锁当前列就行，生成的冻结列会复制当前列
    			if (curColKey == colKey) { // 将列一直冻结至当前点击列
    				return false;
    			}
    		});
    	}
    } else{ // 单级表头冻结列时，此列自动跳到第一行
//    	var index = $(el).closest("th")[0].cellIndex;
	    var $currentTh = $(el).parents('th');
	    var index = 0;
	    var $currentTable = $(el).parents('tr:eq(0)');
		$currentTable.find('th[id]').each(function(position, th) {
			if ($currentTh.attr('id') == $(th).attr('id')) {
				return false;
			} else if ($(th).width() > 0) {
				index += 1;
			}
		});
		
	    var cols = [], i, len = $table.getGridParam('colModel').length, lastfrozen = -1, cm = $table.getGridParam('colModel');
	    for(i=0; i < len; i++) {
	    	if(cm[i].frozen) {
	    		lastfrozen = i;
	    	}
	    	cols.push(i);
	    }
	    cols.splice(index, 1);
	    cols.splice(lastfrozen + (!isFrozen ? 1 : 0), 0, index);
	    
	    cm[index].frozen = !isFrozen;
	    $table.jqGrid("remapColumns", cols, true);
	    if (isFrozen) {
	//        $table.jqGrid('setColProp', colKey, {frozen:false});
	    	// 解锁的时候需要改变冻结列覆盖的列图标，因为冻结的列已经被移除了
	    	$('div[id="' + $(el).parent('div').attr('id') + '"]:eq(0)').find('i').removeClass('fa-lock').addClass('fa-unlock');
	    } else {
	//        $table.jqGrid('setColProp', colKey, {frozen:true});
	    	$(el).removeClass('fa-unlock').addClass('fa-lock'); // 锁的时候直接锁当前列就行，生成的冻结列会复制当前列
	    }
    }
    jqgAdapt.commonFreezeFc(tableId);
}
