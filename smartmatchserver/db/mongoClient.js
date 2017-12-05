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
    Users:'T_Users',      //用户基本信息表
    FaceInfos:'T_FaceInfos', //脸部登录表
    CityFaceSets:'T_CityFaceSets', //城市脸部集合表
    Matches:'T_Matches',           //比赛总表
    StreetMatches:'T_StreetMatches', //野球比赛表
    Games:'T_Games',                 //每局比赛信息存储表
    Rooms:"T_Rooms",                 //每局比赛进行过程信息表
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
            createtime:Date.now()
        }
        return doc;
    }else if(tablename == TABLES.FaceInfos){
        var doc = {
            face_token:"",
            faceset_token:"",
            image_url:"",
            phonenumber:"",
            nickname:"",
            cityname:"",
            face_rectangle:{},
            landmark:{},
            attributes:{},
            createtime:Date.now()
        }
        return doc;
    }else if(tablename == TABLES.CityFaceSets){
        /*
        * var subdoc = {
            faceset_token:"",
            facecount:0,
        }*/
        var doc = {
            cityname:"",
            facesets:[],
        }
        return doc;
    }else if(tablename == TABLES.Matches){
        var doc = {
            match_showid:0, //比赛显示的唯一ID
            match_uid:null,  //比赛内部唯一ID
            create_useruid:null, //创建者
            match_type:null, //比赛类型,野球赛，热身赛，联赛，杯赛，官方比赛
            match_state:null, //比赛状态
            sport_type:null, //哪种体育项目
            city_name:null,  //比赛所在城市
            createtime:Date.now()
        }
        return doc;
    } else if(tablename == TABLES.StreetMatches){
        var doc = {
            match_showid:0, //比赛显示的唯一ID
            match_uid:null,  //比赛内部唯一ID
            create_useruid:null, //创建者
            /*
            * match_rule = {
            *   startup_num 首发人数
            *   howwin  确定输赢的规则，记分还是计时
            *   sectionnum  每局比赛分几节
            *   sectiontime 每节比赛的时间
            *   pointwin    每局比赛，首先达到该分数的球队获胜
            *   courttype   全场还是半场ffffgfdf
            * }
            * */
            match_rule:{},   //比赛规则
            match_players:[], //比赛总人数 //uid或face_token的数组
            match_teams:[],   //根据比赛人数创建的临时球队 {teamid:i,name:"",logo:"",members:[]};
            match_games:[],   //比赛的每局比赛，根据比赛的进行，逐渐增多，初始为空 {schedule_uid:-1,teamID1:-1,teamID2:-1,gameset:[]}
            createtime:Date.now()
        }
        return doc;
    }else if(tablename == TABLES.Games){ //代表一个系列赛的一局比赛，例如3局两胜
        var doc = {
            game_uid:-1,
            match_showid:-1,
            Referee_uid:-1,
            //热身赛
            teamID1:-1,    //参赛球队
            teamID2:-1,    //参赛球队
            //联赛
            season_id:-1,    //赛季ID
            schedule_id:-1,  //赛程ID

            team1Player:[], //参赛球员大名单
            team2Player:[], //参赛球员大名单
            team1Startup:[], //首发
            team2Startup:[],  //首发
            position:null,    //比赛地点
            matchdate: '', //比赛日期
            matchtime : "", //比赛开始时间
            room_uid:null,
            status:0, //0代表初始化，1代表球队大名单确定，2首发确定，3比赛开始，4比赛结束
            createtime : Date.now(), //创建时间
        }
        return doc;
    }else if(tablename == TABLES.Rooms){
        var doc = {
            room_uid:null,  //
            game_uid:null,
            audiencenum:0,  //观赛人次，累计值
            team1currentplayers:[],
            team2currentplayers:[],
            team1currentscore : 0,
            team2currentscore : 0,
            currentsection : 1,
            currentsectiontime : 10*60,
            currentattacktime : 24,
            team1timeout:7,
            team2timeout:7,
            ballowner:0,   //0代表两队都没有球权，1代表队伍1获得球权，2代表队伍2获得球权
            matchrecord : [], //比赛记录，记录比赛的每一步进程，可以生成文字直播，格式{时间，操作}
            chat:[], // 聊天室
            Technician : [], //计分员，负责计分，计时，技术统计,换人，暂停，可多人
            StatisticalData:{}, //参赛球员本场比赛的技术数据
            mvpofgame:0,       //本场MVP
            isVideoLive:false,    //是否有视频直播
            livePushUrl:"",       //直播推送地址
            livePlayRtmpUrl:"",   //直播播放地址
            livePlayHlsUrl:"",    //直播播放地址
            videoRecord:"",       //比赛录像
            videohighlights:[]    //视频集锦
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

//获得用户唯一ID
function getUserUniqueID(cb){
    var db = mongoConnection;
    var collection = db.collection("maxids");
    collection.findOneAndUpdate({userid:1},{'$inc':{'maxuserid':1}},{
        returnOriginal: false,
        upsert: true
    },function(err,result){
        var id = result.value.maxuserid;
        id = 1000+id;
        cb(err,id);
    })
}

exports.getUserUniqueID = thunkify(getUserUniqueID);

//获得比赛显示唯一ID
function getMatchShowUniqueID(cb) {
    var db = mongoConnection;
    var collection = db.collection("maxids");
    collection.findOneAndUpdate({userid:1},{'$inc':{'maxshowmatchid':1}},{
        returnOriginal: false,
        upsert: true
    },function(err,result){
        var id = result.value.maxshowmatchid;
        id = 1000+id;
        cb(err,id);
    })
}

exports.getMatchShowUniqueID = thunkify(getMatchShowUniqueID);

//获得野球比赛内部唯一ID
function getStreetMatchInteralID(cb) {
    var db = mongoConnection;
    var collection = db.collection("maxids");
    collection.findOneAndUpdate({userid:1},{'$inc':{'maxstreetmatchid':1}},{
        returnOriginal: false,
        upsert: true
    },function(err,result){
        var id = result.value.maxstreetmatchid;
        id = 1000+id;
        cb(err,id);
    })
}

exports.getStreetMatchInteralID = thunkify(getStreetMatchInteralID)


//获得game唯一ID
function getGameUniqueID(cb) {
    var db = mongoConnection;
    var collection = db.collection("maxids");
    collection.findOneAndUpdate({userid:1},{'$inc':{'maxgameuid':1}},{
        returnOriginal: false,
        upsert: true
    },function(err,result){
        var id = result.value.maxgameuid;
        id = 1000+id;
        cb(err,id);
    })
}

exports.getGameUniqueID = thunkify(getGameUniqueID)

//获得room唯一ID
function getRoomUniqueID(cb) {
    var db = mongoConnection;
    var collection = db.collection("maxids");
    collection.findOneAndUpdate({userid:1},{'$inc':{'maxroomuid':1}},{
        returnOriginal: false,
        upsert: true
    },function(err,result){
        var id = result.value.maxroomuid;
        id = 1000+id;
        cb(err,id);
    })
}

exports.getRoomUniqueID = thunkify(getRoomUniqueID)









































































