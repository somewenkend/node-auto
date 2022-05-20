var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var common = require('../common');
// 本地mongo数据库Autocoding
var url = common.mongoUrl;

// 查询所有基础组件
router.get('/searchComponents', async function(req, res, next) {
  var conn = null;
  try {
    var conn = await MongoClient.connect(url);
    var dbType = conn.db("Autocoding").collection("comp_type");
    var dbDetail = conn.db("Autocoding").collection("comp_detail");
    var arr = []; // 总数组
    // 以sort字段升序查询所有组件类型
    var arrType = await dbType.find({del: 0}).sort({"sort": 1}).toArray();
    for (var type of arrType) {
      // 以createTime字段升序查询当前类型的组件
      var arrComp = await dbDetail.find({categoryId: type.id, del: 0}).sort({"createTime": 1}).toArray();
      arr.push({
        ...type,
        data: arrComp
      });
    }
    res.send(arr);
  } catch(err) {
    console.log("错误：" + err.message);
  } finally {
    conn?conn.close():'';
  }
});

// 模板插入mongo
router.post('/saveTemp', async function(req, res, next) {
  var conn = null;
  try {
    var myobj = {
      id:req.body.id,
      name: req.body.name,
      topDomIds: req.body.topDomIds,
      self: req.body.self,
      createTime: common.formatTime(new Date()),
      updateTime: common.formatTime(new Date()),
      del: 0
    };
    var conn = await MongoClient.connect(url);
    var temp = conn.db("Autocoding").collection("temp");
    await temp.insertOne(myobj);
    res.send({success: true});
  } catch(err) {
    console.log("错误：" + err.message);
  } finally {
    conn?conn.close():'';
  }
});

// 查询全部模板
router.get('/searchTemp', async function(req, res, next) {
  var conn = null;
  try {
    var conn = await MongoClient.connect(url);
    var temp = conn.db("Autocoding").collection("temp");
    var arr = await temp.find({del: 0}).toArray();
    res.send(arr);
  } catch(err) {
    console.log("错误：" + err.message);
  } finally {
    conn?conn.close():'';
  }
});

// 通过id查询mongo模板
router.get('/searchTempById', async function(req, res, next) {
  var conn = null;
  try {
    var conn = await MongoClient.connect(url);
    var temp = conn.db("Autocoding").collection("temp");
    var arr = await temp.find({"id": req.query.id}).toArray();
    res.send(arr);
  } catch(err) {
    console.log("错误：" + err.message);
  } finally {
    conn?conn.close():'';
  }
});

// 删除mongo
router.post('/deleteTemp', async function(req, res, next) {
  var conn = null;
  try {
    var conn = await MongoClient.connect(url);
    var temp = conn.db("Autocoding").collection("temp");
    await temp.updateOne({id: req.body.id}, {$set: {del: 1}});
    res.send({success: true});
  } catch(err) {
    console.log("错误：" + err.message);
  } finally {
    conn?conn.close():'';
  }
});

module.exports = router;
