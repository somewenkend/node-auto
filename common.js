var common = {
    mongoUrl: "mongodb://localhost:27017/",
    // 格式化当前时间到分
    formatTime: function(date) {
        var Y = date.getFullYear();
        var M = ("0"+(date.getMonth() + 1)).slice(-2);
        var d = ("0"+date.getDate()).slice(-2);
        var h = ("0"+date.getHours()).slice(-2);
        var m = ("0"+date.getMinutes()).slice(-2);
        return Y+"-"+M+"-"+d+" "+h+":"+m;
    }
}

module.exports = common;