/**
 * 生成代码
 */
function createCode(){
	// 生成代码时，取消主编辑区的编辑状态
	cancelActive();
	var $htmlStr = $("#mainArea").clone();
	$htmlStr.find(".autocoding-el").each(function(index, el) {
		// 移除tabindex=0属性
		if ($(el).attr("tabindex") == 0) {
			$(el).removeAttr("tabindex");
		}
		// 移除autocoding-el class
		$(el).removeClass("autocoding-el");
		if (!$(el).attr("class").trim()) {
			$(el).removeAttr("class");
		}
		// 移除style属性
		$(el).removeAttr("style");
		// 移除contentEditable属性
		$(el).removeAttr("contentEditable");
		// 移除title属性
		$(el).removeAttr("title");
		// 移除drag-box
		$(el).find(".drag-box").remove();
		// 移除data-id
		$(el).removeAttr("data-id");
		// 移除data-size
		$(el).removeAttr("data-size");
		// 移除data-type
		$(el).removeAttr("data-type");
		// 移除data-changesize
		$(el).removeAttr("data-changesize");
		// 移除data-editselector
		$(el).removeAttr("data-editselector");
	});
	
	if ($htmlStr.html().trim() != "") {


var frame = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <title><%=init_title %></title>
<meta name="description" content="overview &amp; stats" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<%- include("../../inc/inc_add.html") %>
</head>
<body>
<!-- 主容器start -->
<div class="main-container ace-save-state" id="main-container">
    <script type="text/javascript">
        try { 
            ace.settings.loadState('main-container') 
        } catch (e) { }
    </script>
    <!-- 侧边栏 start-->
    <%- include("../../inc/sidebar.html") %>
    <!-- 侧边栏end -->
    <!-- 主体start-->
    <div class="main-content">
        <!-- 导航栏start -->
        <%- include("../../inc/navbar.html") %>
        <!-- 导航栏end -->
        <div class="main-content-inner">
            <!--页面内容start-->
            <div class="page-content">
                <div class="page-cont-body pdt25">${$htmlStr.html().replace("\n", '')}</div>
            </div>
        </div>
    </div>
    <!--返回顶部 start-->
    <a href="#" id="btn-scroll-up" class="btn-scroll-up btn btn-sm btn-inverse">
        <i class="fa fa-angle-double-up icon-only bigger-110"></i>
    </a>
    <!--返回顶部 end-->
</div>
<script>
</script>
</body>
</html>
`;

		var beautyHtmlStr = html_beautify(frame, {
			inline: ["i"]
		}); // 美化后的代码
		// 将美化后的代码移入代码模态框中，并高亮之
		$("#codesBox").text(beautyHtmlStr);
		hljs.highlightElement($("#codesBox")[0]);
		// 打开模态框
		$("#codesModal").modal("show");

		copyCodes = function() {
			var clipboardObj = navigator.clipboard;
			if(clipboardObj) {
				clipboardObj.writeText(beautyHtmlStr).then(function() {
					alert("复制成功！");
				})
			}
		}
		console.log(beautyHtmlStr);
	} else {
		alert("无代码可生成！");
	}
}

/**
 * 美化并下载代码
 */
function beautyCode(souceCode) {
	var souceCode = souceCode.replace(/%/g, "%25");
	var title = $("#pageTitle").val();
	var a = document.createElement('a');
    var url = '/beautyCode?title=' + title + '&code=' + souceCode;
    a.href=url;
    a.download = 'autoCoding.txt';
    a.click();
}

/**
 * 保存模板
 */
function saveTemp() {
	var html = $("#mainArea").html(); // 主体代码
	var name = $("#tempName").val();
	var topDomIds = []; // 存储一级dom的data-id
	$("#mainArea").children().each(function() {
		topDomIds.push($(this).data("id"));
	});
	if (name.trim() == "") {
		alert("模板名称不能为空！");
		return;
	}
	$.ajax({
		url: "/users/saveTemp",
		method: "post",
		data: {id: guid(), self: html, name: name, topDomIds: topDomIds.join()},
		success: function (data) {
			if (data.success) {
				alert("保存成功！");
			}
		},
		error() {
		}
	})
}

/**
 * 一键复制
 */
function copyCodes() {}
