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
		// 若是i-check，把input元素拎出来，同时移除中间渲染出来的代码
		// if ($(el).hasClass("i-checks")) {
		// 	var $input = $(el).find("input");
		// 	$input.removeAttr("style");
		// 	$(el).prepend($input);
		// 	$(el).find(".iradio_square-green").remove();
		// 	$(el).find(".icheckbox_square-green").remove();
		// }
		// 若是img标签的话，将img的width和height属性设为.img-box的width和height，并将img从.img-box中剥离出来，最后移除.img-box
		// if ($(el).hasClass("img-box")) {
		// 	var width = getRectPos($(el)).width;
		// 	var height = getRectPos($(el)).height;
		// 	var $img = $(el).find("img");
		// 	$img.eq(0).removeAttr("style");
		// 	$img.eq(0).attr("width", width);
		// 	$img.eq(0).attr("height", height);
		// 	$(el).after($img);
		// 	$(el).remove();
		// } else { // 若不是，则移除autocoding-el类
			$(el).removeClass("autocoding-el strut-active");
		// }
	});
	
	if ($htmlStr.html() != "") {
		var title = $("#pageTitle").val();
		// 美化并下载代码
		// beautyCode($htmlStr.html());
		// 将另一种美化方式打印代码到控制台
		// var frame = "";
		// frame +='<#include "/pub/commonInclude.ftl">\n';
		// frame +='<!doctype html>\n';
		// frame +='<html>\n';
		// frame +='<head>\n';
		// frame +='<meta charset="utf-8">\n';
		// frame +='<meta name="renderer" content="webkit">\n';
		// frame +='<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
		// frame +='<meta name="apple-mobile-web-app-capable" content="yes" />\n';
		// frame +='<meta name="apple-mobile-web-app-title" content="HISP">\n';
		// frame +='<title>'+title+'</title>\n';
		// frame +='<link rel="stylesheet" type="text/css" href="${Env.global_static_url}/css/min/min.css?v=${Env.global_css_version!}">\n';
		// frame +='<link rel="stylesheet" type="text/css" href="${Env.global_static_url}/css/page/page.css?v=${Env.global_css_version!}">\n';
		// frame +='<style></style>\n';
		// frame +='</head>\n';
		// frame +='<body>\n';
		// frame += '<script type="text/javascript" src="${Env.global_static_url}/js/loading.page/loading.page.js?v=${Env.global_js_version!}"></script>\n';
		// frame += style_html($htmlStr.html(), 4, ' ', 100);
		// frame += '\n<script type="text/javascript" src="${Env.global_static_url}/js/min/min.js?v=${Env.global_js_version!}"></script>\n';
		// frame += '<script type="text/javascript" src="${Env.global_static_url}/js/main/main.js?v=${Env.global_js_version!}"></script>\n';
		// frame += '<script>\n';
		// frame += '$(document).ready(function(){\n';
		// frame += '});\n';
		// frame += '</script>\n';
		// frame += '</body>\n';
		// frame += '</html>\n';



var frame = `
<!DOCTYPE html>
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
				<div class="page-cont-body pdt25">${$htmlStr.html()}</div>
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
		console.log(html_beautify(frame));
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
