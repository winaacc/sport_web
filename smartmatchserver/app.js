var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoClient = require("./db/mongoClient")
var co = require('co');
var thunkify = require('thunkify');
var winaa = require("./db/winaa");
var localdb = require("./db/winaa").localdb;
var dbvue = require("./db/winaa").dbvue;
var router = require("./src/router")
var comression = require('compression');

app.use(comression());
app.use(express.static('public'));
app.use(bodyParser.json({limit:'50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({ limit:'50mb',extended: true })); // for parsing application/x-www-form-urlencoded

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json");
    next();
});

router.init(app);

function insert(tablename,obj,cb){
	var db = mongoClient.getDb();
	var collection = db.collection(tablename);
	collection.insert(obj,function(err,result){
		cb(err,result);	
	})
}

function find(obj,cb){
	var db = mongoClient.getDb();
	var collection = db.collection("lhmtest");
	 collection.find(obj).toArray(function(err, result) {
		cb(err,result)
	})
}

function updateOne(condition,content,cb){
	var db = mongoClient.getDb();
	var collection = db.collection("lhmtest");
	collection.updateOne(condition,content,function(err,result){
		cb(err,result);
	})
}

function deleteOne(condition,cb){
	var db = mongoClient.getDb();
	var collection = db.collection("lhmtest");
	collection.deleteOne(condition,function(err,result){
		cb(err,result);
	})
}

app.get('/',function(req,res){	
	res.end("hello world");
})

app.get("/winaa-getuseruid",function(req,res){
	co(function *(){
		var result = yield thunkify(winaa.getUserUniqueID)();
		return result;
	}).then(function(value){
		console.log(value);
		co(function *(){
			var yezhi = localdb("maxids");
			var result = yield yezhi.find({})
			res.end(JSON.stringify(result))
		})
	},function(err){
		res.end(err.stack);
	}
	)
})

app.get("/winaa-create",function(req,res){
	co(function *(){
		var yezhi = localdb("yezhi");
		var result = yield yezhi.create({name:"yezhi",location:"sichuan"})
		res.end(JSON.stringify(result))
	})
})

app.get("/winaa-find",function(req,res){
	co(function *(){
		var yezhi = localdb("yezhi");
		var result1 = yield yezhi.find({})
		console.log(JSON.stringify(result1))
		var user = new dbvue({data:result1[0]});
		user.name = "芒果姐姐"
		//user.set("fans","kongxin");
		//user.del("location");
		console.log(user);
		var info = user.getUpdateInfo();
		console.log(info);
		if(Object.keys(info).length != 0){
			var result2 = yield yezhi.update({_id:user._id},info);
			console.log(JSON.stringify(result2));
		}
		var result3 = yield yezhi.find({})
		res.end(JSON.stringify(result3));
	}).then(function (value) {
		//console.log(value);
	}, function (err) {
		console.error(err.stack);
		res.end(err.stack);
	});
})

app.get("/winaa-array-insert",function(req,res){
	co(function*(){
		var arraytest = localdb("arraytest");
		var result = yield arraytest.create({id:1,fans:[]});
		res.end(JSON.stringify(result))
	}).then(function(value){

	},function(err){
		console.error(err.stack);
		res.end(err.stack);
	})
})

app.get("/winaa-array-update",function(req,res){
	co(function*(){
		var arraytest = localdb("arraytest");
		var result = yield arraytest.update({id:1},{"$pull":{"fans":{"name":"kongxin","age":33}}})
		return result;
	}).then(function(value){
		res.end(JSON.stringify(value))
	},function(err){
		console.error(err.stack);
		res.end(err.stack);
	})
})

app.get("/winaa-array-find",function(req,res){
	co(function*(){
		var arraytest = localdb("arraytest");
		var result = yield arraytest.find({id:1});
		res.end(JSON.stringify(result))
	}).then(function(value){

	},function(err){
		console.error(err.stack);
		res.end(err.stack);
	})
})

app.get("/winaa-update",function(req,res){
	co(function *(){
		var yezhi = localdb("yezhi");
		var result = yield yezhi.update({name:"yezhi"},{$set:{count:1}});
		res.end(JSON.stringify(result));
	})
})

app.get("/winaa-delete",function(req,res){
	co(function *(){
		var yezhi = localdb("yezhi");
		var result = yield yezhi.delete({name:"yezhi"});
		res.end(JSON.stringify(result));
	})
})

app.get("/co-delete",function(req,res){
	co(function* () {
  		var result = yield thunkify(deleteOne)({count:1});
  		res.end(JSON.stringify(result))
  		return result;
	}).then(function (value) {
  		console.log(value);
	}, function (err) {
  		console.error(err.stack);
	});
})

app.get("/co-insert",function(req,res){
	co(function* () {
  		var result = yield thunkify(insert)("lhmtest",{grid:345,name:"kongxin"});
  		res.end(JSON.stringify(result))
  		return result;
	}).then(function (value) {
  		console.log(value);
	}, function (err) {
  		console.error(err.stack);
	});
})

function winaa(tablename){
	
	var table = {};
	table.name = tablename;
	table.insert = function(obj,cb){
		insert(this.name,obj,cb);
	}
	Object.defineProperty(table,"create",{
	set:function(obj){
		
	},
	get:function(){
		return thunkify(this.insert);
	},
	enumerable:true,
	configurable:true
	})
	return table;
}

app.get("/vue-test",function(req,res){
	var lhmtest = winaa("lhmtest");
	co(function* () {
  		var result = yield lhmtest.create({content:"i love you",name:"芒果姐姐",fans:"空心入网"});
  		res.end(JSON.stringify(result))
	})
})

app.get("/co-find",function(req,res){
	co(function* () {
  		var result = yield thunkify(find)({});
  		res.end(JSON.stringify(result))
  		return result;
	}).then(function (value) {
  		console.log(value);
	}, function (err) {
  		console.error(err.stack);
	});
})

app.get("/co-updateone",function(req,res){
	co(function* () {
  		var result = yield thunkify(updateOne)({grid:34},{$set:{count:1}});
  		res.end(JSON.stringify(result))
  		return result;
	}).then(function (value) {
  		console.log(value);
	}, function (err) {
  		console.error(err.stack);
	});
})

app.get("/insert",function(req,res){
	var db = mongoClient.getDb();
	var collection = db.collection("lhmtest");
	collection.insert({grid:34,name:"kongxin"},function(err,result){
		if(!err){
			console.log(result);
			res.end(JSON.stringify(result))
		}else{
			console.log(err);
			res.end(JSON.stringify(err))
		}		
	})
})

app.get("/find",function(req,res){
	var db = mongoClient.getDb();
	var collection = db.collection("lhmtest");
	 collection.find({}).toArray(function(err, result) {
		if(!err){
			console.log(result);
			res.end(JSON.stringify(result))
		}else{
			console.log(err);
			res.end(JSON.stringify(err))
		}
	})
})

app.get("/update",function(req,res){
	var db = mongoClient.getDb();
	var collection = db.collection("lhmtest");
	collection.updateOne({grid:34},{$set:{count:1}},function(err,result){
		if(!err){
			console.log(result);
			res.end(JSON.stringify(result))
		}else{
			console.log(err);
			res.end(JSON.stringify(err))
		}
	})
})

app.get("/delete",function(req,res){
	var db = mongoClient.getDb();
	var collection = db.collection("lhmtest");
	collection.deleteOne({count:1},function(err,result){
		if(!err){
			console.log(result);
			res.end(JSON.stringify(result))
		}else{
			console.log(err);
			res.end(JSON.stringify(err))
		}
	})
})

var server = app.listen(80,function(){
	var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
})