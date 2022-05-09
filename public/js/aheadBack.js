// 前进后退类
class aheadBack {
    // 构造方法
    constructor(actionStack, handleIndex) {
        this.actionStack = actionStack;
        this.handleIndex = handleIndex;
    }

    // 动作进栈
    pushAction(action) {
        // 从当前位置之后的操作出栈【即舍弃】，出栈的步骤必是成组的，即开头步骤一定是type为“prev”
        if (this.handleIndex < this.actionStack.length-1) {
            if (this.actionStack[this.handleIndex+1].type == "prev") {
                this.actionStack.splice(this.handleIndex+1, this.actionStack.length-this.handleIndex-1);
            } else {
                this.actionStack.splice(this.handleIndex, this.actionStack.length-this.handleIndex);
            }
        }
        this.actionStack.push(action);
        // 当前操作位置设为最新步骤对应位置
        this.handleIndex = this.actionStack.length-1;
    }
    // 前进、后退type:0前进；type:1后退
    go(type) {
        // 前进操作但已经是最后一步，则提示
        if (type == 0 && this.handleIndex == this.actionStack.length-1) {
            alert("已是最后一步！");
            return
        }

        // 后退操作但已经是第一步，则提示
        if (type == 1 && this.handleIndex <= 0) {
            alert("已是第一步！");
            return
        }

        var curAction; // 当前操作
        if (type == 0) { // 前进只走“标识走完这一步的当前状态”的步骤，即type为“cur”的步骤
            if (this.actionStack[++this.handleIndex].type == "cur") {
                curAction = this.actionStack[this.handleIndex];
            } else {
                curAction = this.actionStack[++this.handleIndex];
            }
        } else { // 后退只走“标识走这一步前的状态”的步骤，即type为“prev”的步骤
            if (this.actionStack[--this.handleIndex].type == "prev") {
                curAction = this.actionStack[this.handleIndex];
            } else {
                curAction = this.actionStack[--this.handleIndex];
            }
        }
        // 根据动作类型执行对应的动作
        switch(curAction.action) {
            case "add": // 添加
                new Drag(curAction.self.prevObject, $(`[data-id=${curAction.parentId}]`), curAction.insertIndexArr);
                // 子元素初始化
                $(`[data-id=${curAction.selfId}]`).find(".autocoding-el").each(function() {
                    new Drag($(this));
                });
                break;
            case "remove": // 移除
                $(`[data-id=${curAction.selfId}]`).remove();
                break;
            case "move": // 移动
                finalInsert($(`[data-id=${curAction.selfId}]`), $(`[data-id=${curAction.parentId}]`), curAction.insertIndexArr);
                break;
            default:
                break;
        }
    }
}

// 实例化前进后退类
var actionStack = new aheadBack([], -1);

// 后退
function goBack() {
    actionStack.go(1);
}

// 前进
function goAhead() {
    actionStack.go(0);
}