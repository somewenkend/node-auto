var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var common = require('../common');
// 本地mongo数据库Autocoding
var url = common.mongoUrl;

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
