var thunkify = require('thunkify');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/myproject';

var mongoConnection = null;
MongoClient.connect(url, function(err, db) {
	if(!err){
		mongoConnection = db;
		console.log("Connected correctly to mongodb");	
	}else{
		console.log(err);
	}
	
})

exports.getDb = function(){
	return mongoConnection;
}

var TABLES = {
    SmsCode:'T_SmsCode', //短信验证码表
    Users:'T_Users'      //用户基本信息表
}

exports.TABLES = TABLES;

exports.TableDocument = function(tablename){
    if(tablename == TABLES.SmsCode){
        var doc = {
            phonenumber:0,
            code:0,
            timestamp:Date.now()
        }
        return doc;
    }else if(tablename == TABLES.Users){
        var doc = {
            uid:-1,
            phonenumber:"",
            password:"",
            nickname:"",
            sex:"",
            headerimage:null,
            birthday:null,
            weight:null,
            height:null,
        }
        return doc;
    }
}

function insert(tablename,obj,cb){
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.insert(obj,function(err,result){
        cb(err,result);
    })
}

exports.insert = thunkify(insert);

function find(tablename,obj,cb){
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.find(obj).toArray(function(err, result) {
        cb(err,result)
    })
}

exports.find = thunkify(find);

function updateOne(tablename,condition,content,cb){
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.updateOne(condition,content,function(err,result){
        cb(err,result);
    })
}

exports.updateOne = thunkify(updateOne)

function deleteOne(tablename,condition,cb){
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.deleteOne(condition,function(err,result){
        cb(err,result);
    })
}

exports.deleteOne = thunkify(deleteOne)

function deleteMany(tablename,filter,cb){
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.deleteMany(filter,function(err,result){
        cb(err,result);
    })
}

exports.deleteMany = thunkify(deleteMany);

function findOneAndReplace(tablename,filter,replacement,cb){
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.findOneAndReplace(filter,replacement,{upsert:true,returnOriginal:false},function(err,result){
        cb(err,result);
    })
}

exports.findOneAndReplace = thunkify(findOneAndReplace);

function createIndex(tablename,fieldOrSpec,cb) {
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.createIndex(fieldOrSpec,function (err,result) {
        cb(err,result);
    })
}

exports.createIndex = thunkify(createIndex);

function indexes(tablename,cb){
    var db = mongoConnection;
    var collection = db.collection(tablename);
    collection.indexes(function(err,result){
        cb(err,result);
    })
}

exports.indexes = thunkify(indexes);

function getUserUniqueID(cb){
    var db = mongoConnection;
    var collection = db.collection("maxids");
    collection.findOneAndUpdate({userid:1},{'$inc':{'maxuserid':1}},{
        returnOriginal: false,
        upsert: true
    },function(err,result){
        var id = result.value.maxuserid;
        id = 100000+id;
        cb(err,id);
    })
}

exports.getUserUniqueID = thunkify(getUserUniqueID);



























