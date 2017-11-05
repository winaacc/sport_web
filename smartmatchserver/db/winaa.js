var mongoClient = require("./mongoClient");
var co = require('co');
var thunkify = require('thunkify');

function getUserUniqueID(cb){
	var db = mongoClient.getDb();
	var collection = db.collection("maxids");
	collection.findOneAndUpdate({userid:1},{'$inc':{'maxuserid':1}},{
		returnOriginal: false,
        upsert: true
	},function(err,result){
		cb(err,result);
	})
}

exports.getUserUniqueID = getUserUniqueID;

function insert(tablename,obj,cb){
	var db = mongoClient.getDb();
	var collection = db.collection(tablename);
	collection.insert(obj,function(err,result){
		cb(err,result);	
	})
}

function find(tablename,obj,cb){
	var db = mongoClient.getDb();
	var collection = db.collection(tablename);
	 collection.find(obj).toArray(function(err, result) {
		cb(err,result)
	})
}

function updateOne(tablename,condition,content,cb){
	var db = mongoClient.getDb();
	var collection = db.collection(tablename);
	collection.updateOne(condition,content,function(err,result){
		cb(err,result);
	})
}

function deleteOne(tablename,condition,cb){
	var db = mongoClient.getDb();
	var collection = db.collection(tablename);
	collection.deleteOne(condition,function(err,result){
		cb(err,result);
	})
}

exports.localdb = function(tablename){
	
	var table = {};
	table.name = tablename;
	table._create = function(obj,cb){
		insert(this.name,obj,cb);
	}
	table._delete = function(obj,cb){
		deleteOne(this.name,obj,cb);
	}
	table._find = function(obj,cb){
		find(this.name,obj,cb);
	}
	table._update = function(condition,obj,cb){
		updateOne(this.name,condition,obj,cb)
	}
	//增
	Object.defineProperty(table,"create",{
	set:function(obj){
		
	},
	get:function(){
		return thunkify(this._create);
	},
	enumerable:true,
	configurable:true
	})
	//删
	Object.defineProperty(table,"delete",{
	set:function(obj){
		
	},
	get:function(){
		return thunkify(this._delete);
	},
	enumerable:true,
	configurable:true
	})
	//查
	Object.defineProperty(table,"find",{
	set:function(obj){
		
	},
	get:function(){
		return thunkify(this._find);
	},
	enumerable:true,
	configurable:true
	})
	//改
	Object.defineProperty(table,"update",{
	set:function(obj){
		
	},
	get:function(){
		return thunkify(this._update);
	},
	enumerable:true,
	configurable:true
	})
	return table;
}

function defineReactive(obj,key,val){
	Object.defineProperty(obj,key,{
		enumerable: true,
    	configurable: true,
    	get:function(){
    		return val;
    	},
    	set:function(newVal){
    		this.change.push({action:"set",key:key,oldVal:val,newVal:newVal})
    		val = newVal;
    	}
	})
}

function walkObject(obj){

}

function walkArray(arr){

}

var dbvue = function(config){
	var data = config.data;
	var keys = Object.keys(data);
	for(var i=0;i<keys.length;i++){
		var value = data[keys[i]]
		defineReactive(this,keys[i],value);
		/*if(typeof value === "object"){
			if(Array.isArray(value)){
				walkArray(value);
			}else{
				walkObject(value);
			}	
		}*/
	}

	this.change = [];
	this.set = function(key,val){
		if(this.hasOwnProperty(key)){
			this[key] = val;
		}else{
			defineReactive(this,key,val)
			this.change.push({action:"new",key:key,val:val})			
		}
	};
	this.del = function(key){
		if(this.hasOwnProperty(key)){
			this.change.push({action:"delete",key:key})
			delete this[key];
		}
	};
	this.getUpdateInfo = function(){
		var info = {};
		info["$set"] = {};
		info["$unset"] = {};
		for(var i in this.change){
			if(this.change[i].action == "set"){
				var key = this.change[i].key;
				var val = this.change[i].newVal;
				info["$set"][key] = val;
			}else if(this.change[i].action == "new"){
				var key = this.change[i].key;
				var val = this.change[i].val;
				info["$set"][key] = val;
			}else if(this.change[i].action == "delete"){
				var key = this.change[i].key;
				info["$unset"][key] = 1;
			}
		}

		if(Object.keys(info["$unset"]).length == 0){
			delete info["$unset"]
		}

		if(Object.keys(info["$set"]).length == 0){
			delete info["$set"]
		}

		return info;
	};
}

exports.dbvue = dbvue;

var dbNestVue = function(data){

	return data;
}

exports.dbNestVue = dbNestVue;































