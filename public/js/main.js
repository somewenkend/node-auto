//重写toFixed方法，使之符合大家认知的四舍五入
if (!Number.prototype._toFixed) {
  Number.prototype._toFixed = Number.prototype.toFixed;
}
Number.prototype.toFixed = function(n) {
  return (this + 1e-14)._toFixed(n);
};

// 提示框
var Modals_AlertMess =    "<!-- Modals_AlertMess-->"+
    "<div class=\"modal fade bs-example-modal-sm\" id=\"alertModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"error\" aria-hidden=\"true\">"+
"<div class=\"modal-dialog modal-sm\" id=\"alertMessBox\">"+
"<div class=\"modal-content\">"+
"<div class=\"modal-body tc\">"+
"<button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">×</span><span class=\"sr-only\">Close</span></button>"+
"<p id=\"alertMess\"></p></div></div></div></div>";
$("body").append(Modals_AlertMess);

var alertTimer;
$("#alertModal").on('hide.bs.modal', function (e) {
   clearTimeout(alertTimer);
});
function alertCountDown(time,alertMess){
    clearTimeout(alertTimer);
    $("#alertMess").html(alertMess+"<p class=\"f12 tc pt15 c999 alertTimerLast \">"+time+"秒后关闭</p>");        
    $("#alertModal").modal("show");
    --time;
    alertTimer=setTimeout(function(){
        alertTimerLast(time);
    }, 1000);
}
function alertTimerLast(time){
    clearTimeout(alertTimer);
    $(".alertTimerLast").html(time+"秒后关闭");
    if(time ==0){
        $("#alertModal").modal("hide");
    }else{
        --time;
        alertTimer=setTimeout(function(){
            alertTimerLast(time);
        }, 1000);
    }
}

Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;

}

// checkbox的全选功能
if ($('.checkboxGroup').length > 0) {
    //全选/全不选事件
    $('.checkboxGroup').on('ifClicked', 'input[type="checkbox"][data-role="allSelect"]', function() {
        var $brotherCheckboxs = $(this).closest('.checkboxGroup').find('input[type="checkbox"]');
        if($(this).is(':checked')) {
            $brotherCheckboxs.iCheck('uncheck');
        } else {
            $brotherCheckboxs.iCheck('check');
        }
    });
    // 反向全选/全不选事件
    $('.checkboxGroup').on('ifChanged', '.childCheckbox input[type="checkbox"]', function() {
        var $allSelect = $(this).closest('.checkboxGroup').find('input[type="checkbox"][data-role="allSelect"]');
        if($(this).is(':checked')) {
            var $parentDiv = $(this).closest('.childCheckbox');
            if($parentDiv.find('input[type="checkbox"]:checked').length == $parentDiv.find('input[type="checkbox"]').length) {
                $allSelect.iCheck('check');
            } else {
                $allSelect.iCheck('uncheck');
            }
        } else {
            $allSelect.iCheck('uncheck');
        }
    });
}

//input框输入验证
$('body').on('blur', 'input[inputcheck]', function() {
    inputCheck($(this));
});

// input框check方法
// 在input框中添加inputCheck属性
// 0：整数；1：正整数；2：负整数；3-2：小数（-后面是最多保留位数）；4-2：正小数；5-2：负小数
// mail：邮箱；phone：手机号码

function inputCheck($el) {
    var val = $el.val(); // input框的值
    var pattern = ""; // check模式
    if (typeof($el.attr('inputcheck')) != 'undefined') { // 有值
        pattern = $el.attr('inputcheck').split("-")[0];
    }
    var regular; // 正则表达式
    var remindText = ""; // check未通过提示文本
    var digits = $el.attr('inputcheck').split("-")[1]; // 小数点保留位数
    if (typeof(digits) != 'undefined' && digits != "" && !isNaN(Number(digits))) {
        digits = Number(digits);
    } else {
        digits = 5; // 默认最多保留5位小数
    }
    // check的类型，0：数字类型；1：非数字类型
    // 数字类型输入0是不check的，而非数字如电话号码，邮箱的输入0是被check的
    var checkType = 0;
    switch (pattern) {
        case "0": // 整数(输入后再删成空会check不过)
            regular = /^-?[1-9]+\d*$/g;
            remindText = "请输入规范格式的整数！";
            break;
        case "1": // 正整数
            regular = /^[1-9]+\d*$/;
            remindText = "请输入规范格式的正整数！";
            break;
        case "2": // 负整数
            regular = /^-[1-9]+\d*$/;
            remindText = "请输入规范格式的负整数！";
            break;    
        case "3": // 小数（整数/0.xx/12.xx）
            regular = eval('/^-?[1-9]+\\d*$|^-?0\\.\\d{1,' + digits + '}$|^-?[1-9]+\\d*\\.\\d{1,' + digits + '}$/');
            remindText = "请输入规范格式的小数！（最多保留" + digits + "位）";
            break;
        case "4": // 正小数
            regular = eval('/^[1-9]+\\d*$|^0\\.\\d{1,' + digits + '}$|^[1-9]+\\d*\\.\\d{1,' + digits + '}$/');
            remindText = "请输入规范格式的正小数！（最多保留" + digits + "位）";
            break;
        case "5": // 负小数
            regular = eval('/^-[1-9]+\\d*$|^-0\\.\\d{1,' + digits + '}$|^-[1-9]+\\d*\\.\\d{1,' + digits + '}$/');
            remindText = "请输入规范格式的负小数！（最多保留" + digits + "位）";
            break;
        case "mail": // 邮箱
            checkType = 1;
            regular = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            remindText = "请输入规范格式的邮箱！";
            break;
        case "phone": // 手机号码
            checkType = 1;
            regular = /^1[0-9]{10}$/;
            remindText = "请输入规范格式的手机号码！";
            break;
        default: // 不做任何check
            regular = /^/;
            break;
    }
    // input为空或者为0不做check
    if (!regular.test(val) && val != '' && (checkType == 1 || val != '0')) {
        $el.removeClass('custom-shake');
        $el.addClass('check-error animated custom-shake');
        if ($el.next('p').length == 0) {
            $el.after('<p>' + remindText + '</p>');
        } else {
            $el.next('p').html(remindText);
        }
        // 添加一个check输入格式属性，标明未通过输入格式验证
        $el.attr('inputerror','1');
    } else {
        $el.removeAttr('inputerror');
        if (typeof($el.attr('inputerror')) == 'undefined'
            && typeof($el.attr('necessaryerror')) == 'undefined'
            && typeof($el.attr('maxsizeerror')) == 'undefined') { // 若全部check通过则移除样式
            $el.removeClass('check-error animated custom-shake');
            $el.next('p').remove();
        }
    }
}

// 验证必输input
$('body').on('blur', 'input[necessary]', function() {
    necessaryCheck($(this));
});

//验证必输input check方法
function necessaryCheck($el) {
    if ($el.val().trim() == '') {
        $el.removeClass('custom-shake');
        $el.addClass('check-error animated custom-shake');
        if ($el.next('p').length == 0) {
            $el.after('<p>此项为必填项！</p>');
        } else {
            $el.next('p').html('此项为必填项！');
        }
        // 添加一个check必输属性，标明未通过必输项验证
        $el.attr('necessaryerror','1');
    } else {
        $el.removeAttr('necessaryerror');
        if (typeof($el.attr('inputerror')) == 'undefined'
            && typeof($el.attr('necessaryerror')) == 'undefined'
            && typeof($el.attr('maxsizeerror')) == 'undefined') { // 若全部check通过则移除样式
            $el.removeClass('check-error animated custom-shake');
            $el.next('p').remove();
        }
    }
}

//验证输入长度input
$('body').on('input', 'input[maxsize]', function() {
    maxsizeCheck($(this));
});

//验证输入长度input check方法
function maxsizeCheck($el) {
    var curLength = $el.val().length;
    var maxLength = $el.attr('maxsize'); // 小数点保留位数
    if (typeof(maxLength) != 'undefined' && maxLength != "" && !isNaN(Number(maxLength))) {
        maxLength = Number(maxLength);
    } else {
        maxLength = 100; // 默认最多输入100
    }
    if (curLength > maxLength) {
        $el.removeClass('custom-shake');
        $el.addClass('check-error animated custom-shake');
        if ($el.next('p').length == 0) {
            $el.after('<p>输入长度不得超过' + maxLength + '！</p>');
        } else {
            $el.next('p').html('输入长度不得超过' + maxLength + '！');
        }
        // 添加一个check输入长度属性，标明未通过输入长度验证
        $el.attr('maxsizeerror','1');
    } else {
        $el.removeAttr('maxsizeerror');
        if (typeof($el.attr('inputerror')) == 'undefined'
            && typeof($el.attr('necessaryerror')) == 'undefined'
            && typeof($el.attr('maxsizeerror')) == 'undefined') { // 若全部check通过则移除样式
            $el.removeClass('check-error animated custom-shake');
            $el.next('p').remove();
        }
    }
}

/**
 * 判断是否有非法输入，若有则滚动到第一个非法输入位置并返回false。$el：欲提交表单元素的外围容器jquery对象
 */
function validCheck($el) {
    $el.find('input[necessary]').each(function() {
        $(this).trigger('blur');
    });
    if ($el.find('.check-error').length > 0) {
        // 页面滚动到第一个非法输入位置
        $("html,body").animate({
            scrollTop: $($el.find('.check-error')[0]).offset().top - 30
        },500);
        return false;
    } else {
        return true;
    }
}

//加法
Number.prototype.add = function(arg){
    var r1,r2,m;
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2))
//    return (this*m+arg*m)/m
    return (this.mul(m) + arg.mul(m)) / m;
}

//减法
Number.prototype.sub = function (arg){
    return this.add(-arg);
}

//乘法
Number.prototype.mul = function (arg)
{
    var m=0,s1=this.toString(),s2=arg.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}

//除法
Number.prototype.div = function (arg){
    var t1=0,t2=0,r1,r2;
    try{t1=this.toString().split(".")[1].length}catch(e){}
    try{t2=arg.toString().split(".")[1].length}catch(e){}
    with(Math){
        r1=Number(this.toString().replace(".",""))
        r2=Number(arg.toString().replace(".",""))
        return (r1/r2)*pow(10,t2-t1);
    }
}

/**
 * 启动页面定时器（总遮罩）
 * @param duration: 倒计时的秒数（默认60）
 */
var pageLoadingTimer;
var pageLoadingDuration;
var waitLabel = "";
function startPageLoadingTimer(duration) {
    var $loadBox = $('#searchLoadData').find('.searchLoadDataBox');
    waitLabel = "，请等待";
    pageLoadingDuration = duration||60;
    timerCountdown(pageLoadingDuration, $loadBox);
}

/**
 * 倒计时（总遮罩）
 * @param duration: 当前数到的秒数
 */
function timerCountdown(duration, $el) {
    var nowTime = duration;
    if (duration < 0) {
        nowTime = pageLoadingDuration;
        waitLabel = "，还需等待";
    }
    $el.find('.loadingTime').html(waitLabel + "...<br>[" + nowTime-- + "s]");
    clearTimeout(pageLoadingTimer);
    pageLoadingTimer = setTimeout(function() {timerCountdown(nowTime, $el);}, 1000);
}

/**
 * 倒计时结束，清除定时器（总遮罩）
 */
function endPageLoadingTimer() {
    clearTimeout(pageLoadingTimer);
}

// 倒计时数组
var countDownArry = [];
/**
 * 创建一个遮罩倒计时器
 * @param el: 当前遮罩
 * @param duration: 倒计时时长（默认60）
 * @returns
 */
function createCountDown(el, duration) {
    var countDown = {};
    var waitDuration = duration||60;
    var isExist = false; // 默认当前遮罩不含倒计时器
    for (var curCountDown of countDownArry) {
        if (el == curCountDown.element) {
            countDown = curCountDown;
            isExist = true;
            break;
        }
    }
    
    // 先判断是否已经有此倒计时对象，若有，不再创建，执行当前倒计时器；没有则创建后再执行
    if (!isExist) {
        countDown.duration = waitDuration;
        countDown.timer = setTimeout(function() {}, 1000);
        countDown.element = el;
        countDownArry.push(countDown);
    }
    countDown.waitStr = "，请等待";
    // 执行倒计时
    executeCountDown($(el).find('.loadingTime'), countDown, waitDuration);
}

/**
 * 执行一个遮罩倒计时
 */
function executeCountDown($el, curCountDown, duration) {
    var nowTime = duration;
    if (duration < 0) {
        curCountDown.waitStr = "，还需等待";
        nowTime = curCountDown.duration;
    }
    $el.html(curCountDown.waitStr + "...<br>[" + nowTime-- + "s]");
    clearTimeout(curCountDown.timer);
    curCountDown.timer = setTimeout(function() {
        executeCountDown($el, curCountDown, nowTime);
    }, 1000);
}

/**
 * 清除当前定时器
 */
function resetCurCountDown(el) {
    for (var curCountDown of countDownArry) {
        if (el == curCountDown.element) {
            clearTimeout(curCountDown.timer);
            break;
        }
    }
}

$(document).ready(function() {
    /**********************一般表格固定表头*************************/
    var MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver;

    var fixedHeadObserver = new MutationObserver(function (mutations) {
      var $container = $(mutations[0].target).closest('.fixed-table-box'); // 总外围容器
      
      fixedHandle($container);
    });

    // 将页面上现有需要固定表头的表格绑定固定表头监听
    $('div[fixedhead]').each(function() {
        bindFixed(this);
    });

    /**
     * 绑定固定表头监听
     * @param el：需固定dom对象
     * @returns
     */
    function bindFixed(el) {
        if($(el).closest('.fixed-table-box').length > 0) { // 说明已经添加过监听，不再添加
            return false;
        }
        // 组装必要的html
        buildHtml(el);
        // 执行fixedHandle
        fixedHandle($(el).closest('.fixed-table-box'));
        // 绑定监听
        fixedHeadObserver.observe($(el).find('table')[0], {
            childList: true, // 子节点的变动（新增、删除或者更改）
            attributes: true, // 属性的变动
            characterData: true, // 节点内容或节点文本的变动
            subtree: true // 是否将观察器应用于该节点的所有后代节点
        });
    }
    
    /**
     * 组装必要的html
     * fixedEl: 固定表头表格的父级dom对象
     */
    function buildHtml(fixedEl) {
        // fixed外围部分html模板
        var fixedModelHtml = `
            <div class="pr fixed-table-box">
            </div>
        `;
        
        // clone表头html模板
        var cloneModelHtml = `
            <div class="pa clone-table-box" style="z-index: 1000;">
                <b class="scroll-cover" style="position: absolute; right: -6px; width: 7px; background: #828ca8; border-left: 1px solid #757e97; display: none"></b>
            </div>
        `;
        $(fixedEl).wrap(fixedModelHtml);
        var $container = $(fixedEl).closest('.fixed-table-box');
        $container.prepend(cloneModelHtml);
        var $exceptTbody = $(fixedEl).find('table').clone(); // 克隆table节点
        $exceptTbody.find('tbody').remove(); // 移除tbody
        $container.find('.clone-table-box').append($exceptTbody); // 将剩余节点添加至.clone-table-box
        // 设置.table-responsive的超出高阈值
        var fixedAttr = $(fixedEl).attr('fixedhead');
        // 默认最高为500px
        var maxHeight = (typeof(fixedAttr) != 'undefined' && Number(fixedAttr) > 0) ? Number(fixedAttr) : 500;
        $(fixedEl).css('max-height', maxHeight);
    }

    /**
     * 协调固定的表头和滚动条
     * @param $container: 总外围容器
     * @param height: 当前高度
     * @param maxHeight: 超出高度阈值
     * @returns
     */
    function fixedHandle($container) {
        // 设置滚动条样式
        var height = parseInt($container.find('div.table-responsive').find('table').height());
        var fixedAttr = $container.find('div.table-responsive').attr('fixedhead');
        // 默认最高为500px
        var maxHeight = (typeof(fixedAttr) != 'undefined' && Number(fixedAttr) > 0) ? Number(fixedAttr) : 500;
        if (height > maxHeight) { // 高度超出，需要滚动条
              $container.find('.clone-table-box').css('width', 'calc(100% - 6px)');
              $container.find('.scroll-cover').show();
          } else {
              $container.find('.clone-table-box').css('width', '100%');
              $container.find('.scroll-cover').hide();
          }
        // 设置滚动条覆盖符的高
        $container.find('.scroll-cover').css('height', $container.find('.clone-table-box table').outerHeight());
        
        // 设置表头每个单元格的宽度
        var firstHead = $container.find('thead')[0];
        var secondHead = $container.find('thead')[1];
        $(firstHead).find('th').each(function(index, el) {
            var curWidth = $($(secondHead).find('th')[index]).css("width");
            $(el).css("width", curWidth);
        });
    }

    window.bindFixed = bindFixed; // 暴露bindFixed方法，以便任何时候都可调用
    /**********************一般表格固定表头*************************/
});