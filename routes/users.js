var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 插入mongo
router.post('/saveTemp', function(req, res, next) {
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

// 通过id查询mongo模板
router.get('/searchTemp', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Autocoding");
    var cursor = dbo.collection("temp").find({"_id": "6278ed581bf286d41882106a"});
    var result = [];
    while (cursor.hasNext()){
      var doc = cursor.next();
      result.push(doc);
    }
    res.send(result);
  });
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
