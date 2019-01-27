var express = require("express");
var STS = require("ali-oss").STS;
var co = require("co");
var fs = require("fs");
var app = express();

app.get("/", function(req, res) {
 res.set("Access-Control-Allow-Origin", "*");
 var conf = JSON.parse(fs.readFileSync("./config.json"));
 var policy;
 if (conf.PolicyFile) {
  policy = fs.readFileSync(conf.PolicyFile).toString("utf-8");
 }

 var client = new STS({
  accessKeyId: conf.AccessKeyId,
  accessKeySecret: conf.AccessKeySecret
 });

 co(function*() {
  var result = yield client.assumeRole(conf.RoleArn, policy, conf.TokenExpireTime);
  console.log(result);

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-METHOD", "GET");
  res.json({
   AccessKeyId: result.credentials.AccessKeyId,
   AccessKeySecret: result.credentials.AccessKeySecret,
   SecurityToken: result.credentials.SecurityToken,
   Expiration: result.credentials.Expiration
  });
 })
  .then(function() {
   // pass
  })
  .catch(function(err) {
   console.log(err);
   res.status(400).json(err.message);
  });
});

app.listen(3001, function() {
 console.log("App started.");
});
