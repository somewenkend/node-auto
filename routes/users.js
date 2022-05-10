var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
// 本地mongo数据库Autocoding
var url = "mongodb://localhost:27017/";

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 插入mongo
router.post('/saveTemp', async function(req, res, next) {
  var conn = null;
  try {
    var myobj = {id:req.body.id, name: req.body.name, topDomIds: req.body.topDomIds, self: req.body.self};
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
    var myobj = { name: req.body.name, topDomIds: req.body.topDomIds, self: req.body.self};
    var conn = await MongoClient.connect(url);
    var temp = conn.db("Autocoding").collection("temp");
    var arr = await temp.find().toArray();
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
    var myobj = { name: req.body.name, topDomIds: req.body.topDomIds, self: req.body.self};
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
router.post('/deleteTemp', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Autocoding");
    var myobj = { name: req.body.name, topDomIds: req.body.topDomIds, self: req.body.self};
    dbo.collection("temp").insertOne(myobj, function(err, result) {
      if (err) throw err;
      res.send({success: true});
      db.close();
    });
  });
});

module.exports = router;
