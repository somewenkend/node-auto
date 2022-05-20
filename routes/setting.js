var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var common = require('../common');
// 本地mongo数据库Autocoding
var url = common.mongoUrl;

// 组件类型插入mongo
router.post('/saveCompType', async function(req, res, next) {
    var conn = null;
    try {
        var myobj = {
            id:req.body.id,
            name: req.body.name,
            icon: req.body.icon,
            createTime: common.formatTime(new Date()),
            updateTime: common.formatTime(new Date()),
            del: 0,
            sort: -1
        };
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_type");
        await temp.insertOne(myobj);
        res.send({success: true});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 组件类型编辑
router.post('/editCompType', async function(req, res, next) {
    var conn = null;
    try {
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_type");
        await temp.updateOne({id: req.body.id}, {$set: {"name": req.body.name, "icon": req.body.icon, "updateTime": common.formatTime(new Date())}});
        res.send({success: true});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 组件类型排序
router.post('/sortCompType', async function(req, res, next) {
    var conn = null;
    try {
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_type");
        var ids = req.body.ids;
        for (var index in ids) {
            await temp.updateOne({id: ids[index]}, {$set: {"sort": (Number(index)+1)}});
        }
        res.send({success: true});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 查询全部组件类型
router.get('/searchCompType', async function(req, res, next) {
    var conn = null;
    try {
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_type");
        var arr = await temp.find({del: 0}).sort({"sort": 1}).toArray();
        res.send(arr);
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 通过id分页查询组件类型下的组件
router.get('/searchCompById', async function(req, res, next) {
    var conn = null;
    try {
        var page = Number(req.query.page);
        var limit = Number(req.query.limit);
        var categoryId = req.query.categoryId;
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_detail");
        var arr = await temp.find({"categoryId": categoryId, "del": 0}).sort({"createTime": 1}).skip((page-1)*limit).limit(limit).toArray();
        res.send(arr);
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 通过id查询组件类型下的组件数量
router.get('/searchCount', async function(req, res, next) {
    var conn = null;
    try {
        var categoryId = req.query.categoryId;
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_detail");
        var arr = await temp.find({"categoryId": categoryId, "del": 0}).toArray();
        res.send({success: true, count: arr.length});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 删除组件类型
router.post('/deleteCompType', async function(req, res, next) {
    var conn = null;
    try {
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_type");
        await temp.updateOne({id: req.body.id}, {$set: {del: 1}});
        res.send({success: true});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 基础组件插入mongo
router.post('/saveCompDetail', async function(req, res, next) {
    var conn = null;
    try {
        var myobj = {
            id:req.body.id,
            categoryId: req.body.categoryId,
            editSelector: req.body.editSelector,
            type: req.body.type,
            canChangeSize: req.body.canChangeSize,
            componentIcon: req.body.componentIcon,
            componentName: req.body.componentName,
            height: req.body.height,
            minWidth: req.body.minWidth,
            dragDirect: req.body.dragDirect,
            html: req.body.html,
            createTime: common.formatTime(new Date()),
            updateTime: common.formatTime(new Date()),
            del: 0
        };
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_detail");
        await temp.insertOne(myobj);
        res.send({success: true});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 组件编辑
router.post('/editCompDetail', async function(req, res, next) {
    var conn = null;
    try {
        var updateObj = {
            categoryId: req.body.categoryId,
            editSelector: req.body.editSelector,
            type: req.body.type,
            canChangeSize: req.body.canChangeSize,
            componentIcon: req.body.componentIcon,
            componentName: req.body.componentName,
            height: req.body.height,
            minWidth: req.body.minWidth,
            dragDirect: req.body.dragDirect,
            html: req.body.html,
            updateTime: common.formatTime(new Date())
        };
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_detail");
        await temp.updateOne({id: req.body.id}, {$set: updateObj});
        res.send({success: true});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});

// 删除组件
router.post('/deleteCompDetail', async function(req, res, next) {
    var conn = null;
    try {
        var conn = await MongoClient.connect(url);
        var temp = conn.db("Autocoding").collection("comp_detail");
        await temp.updateOne({id: req.body.id}, {$set: {del: 1}});
        res.send({success: true});
    } catch(err) {
        console.log("错误：" + err.message);
    } finally {
        conn?conn.close():'';
    }
});
module.exports = router;
