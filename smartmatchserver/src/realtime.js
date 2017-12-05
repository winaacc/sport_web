var mongoClient = require("../db/mongoClient")
var co = require('co');
var thunkify = require('thunkify');

var rooms = {}; //room_uid:{database:{},permission:{},audiences:{}}

//推送给客户端的事件
const clientEvent = {
    otherEnterRoom:1,
    otherLeaveRoom:2,
    initRoomInfo:3,
    updatePermission:4,
    updateChat:5,
    updateTime:6,
    updateScore:7,
    updateTimeout:8,
    updateBallControl:9,
    updateFoul:10,
    updateShoot:11,
    updateFreethrow:12,
    updateRebound:13,
    updateAssist:14,
    updateSteal:15,
    updateFault:16,
    updateBlock:17,
    updateSubstitution:18,
    updateMVPofGame:19,
}

//服务器收到的事件
const serverEvent = {
    login:1,
    logout:2,
    enterRoom:3,
    leaveRoom:4,
    setPermission:5,
    chat:6,
    picture:7,
    shortVideo:8,
    updateTime:9,
    updateScore:10,
    updateTimeout:11,
    updateBallControl:12,
    updateFoul:13,
    updateShoot:14,
    updateFreethrow:15,
    updateRebound:16,
    updateAssist:17,
    updateSteal:18,
    updateFault:19,
    updateBlock:20,
    updateSubstitution:21,
    updateMVPofGame:22,
    unsetPermission:23
}

const permissionType = {
    updateTime:9,
    updateScore:10,
    updateTimeout:11,
    updateBallControl:12,
    updateFoul:13,
    updateShoot:14,
    updateFreethrow:15,
    updateRebound:16,
    updateAssist:17,
    updateSteal:18,
    updateFault:19,
    updateBlock:20,
    updateSubstitution:21,
    updateMVPofGame:22,
}

function logout(socket,io) {
    if(socket.sport){
        if(socket.sport.room_uid){
            //退出房间
            var room_uid = socket.sport.room_uid;
            var uuid = socket.sport.uuid;
            var clientID = socket.sport.clientID;
            //console.log(rooms[room_uid]);
            //从观众类别中删除
            delete rooms[room_uid].audiences[clientID]
            socket.leave(room_uid)
            io.to(room_uid).emit(clientEvent.otherLeaveRoom,{clientID:clientID,uuid:uuid})
            //查看是否有权限，有则删除
            for(var p in rooms[room_uid].permission){
                if(rooms[room_uid].permission[p] == clientID){
                    rooms[room_uid].permission[p] = null;
                    io.to(room_uid).emit(clientEvent.updatePermission,{permission:rooms[room_uid].permission})
                }
            }
            //console.log(rooms[room_uid])
        }
    }
    delete socket.sport;
}

module.exports = {
    init:function(io){
        io.on('connection', function(socket){
            console.log('a user connected');

            socket.on('disconnect',function(){
                console.log('user disconnected');
                logout(socket,io);
            })

            socket.on('reconnect',function(){
                console.log("user reconnect")
            })

            socket.on(serverEvent.login,function (msg,cb) {
                var uuid = msg.uuid;
                var clientID = msg.clientID;
                if(socket.sport){
                    console.log("already login")
                    cb({error:1,errorinfo:"already login"})
                    return;
                }
                socket.sport = {};
                socket.sport.uuid = uuid;
                socket.sport.clientID = clientID;
                socket.sport.room_uid = null;
                 cb({error:0});
            })

            socket.on(serverEvent.logout,function (msg) {
                logout(socket,io);
                socket.disconnect(); //断开连接
            })

            socket.on(serverEvent.enterRoom,function (msg,cb) {
                var room_uid = msg.room_uid;
                var uuid = socket.sport?socket.sport.uuid:null;
                var clientID = socket.sport?socket.sport.clientID:null;
                //判断用户是否已经登录
                if(!uuid){
                    console.log("must login before enterRoom!!!")
                    cb({error:1,errorinfo:"must login before enterRoom!!!"})
                    return;
                }
                //判断用户是否已经在一个房间中，同一个终端只能在一个房间中
                var isAlreadyInRoom = socket.sport?socket.sport.room_uid:null
                if(isAlreadyInRoom){
                    console.log("already in a room cant enter another room")
                    cb({error:2,errorinfo:"already in a room cant enter another room"})
                    return;
                }

                if(rooms[room_uid]){
                    if(rooms[room_uid].audiences[clientID]){
                        console.log("already in this room cant enter same room twice")
                        cb({error:3,errorinfo:"already in this room cant enter same room twice"})
                        return;
                    }
                    rooms[room_uid].audiences[clientID] = {uuid:uuid};
                    socket.join(room_uid);
                    socket.sport.room_uid = room_uid;
                    //通知房间中的其他用户，有人进入
                    io.to(room_uid).emit(clientEvent.otherEnterRoom,{clientID:clientID,uuid:uuid});
                    //发送房间完整信息
                    socket.emit(clientEvent.initRoomInfo,{info:rooms[room_uid].database})
                    cb({error:0})
                }else{
                    co(function* () {
                        //console.log(typeof room_uid);
                        var room_docs = yield mongoClient.find(mongoClient.TABLES.Rooms,{room_uid:room_uid});
                        if(room_docs.length == 0){
                            console.log("roomID not exist")
                            cb({error:4,errorinfo:"roomID not exist"})
                            return;
                        }
                        var game_docs = yield mongoClient.find(mongoClient.TABLES.Games,{game_uid:room_docs[0].game_uid})
                        rooms[room_uid] = {database:{room:room_docs[0],game:game_docs[0]},permission:{},audiences:{}}
                        rooms[room_uid].audiences[clientID] = {uuid:uuid};
                        socket.sport.room_uid = room_uid;
                        socket.join(room_uid);
                        //通知房间中的其他用户，有人进入
                        io.to(room_uid).emit(clientEvent.otherEnterRoom,{clientID:clientID,uuid:uuid});
                        socket.emit(clientEvent.initRoomInfo,{info:rooms[room_uid].database})
                        cb({error:0})
                    })
                }
            })

            socket.on(serverEvent.leaveRoom,function (msg) {
                var room_uid = socket.sport?socket.sport.room_uid:null;
                var uuid = socket.sport?socket.sport.uuid:null;
                var clientID = socket.sport?socket.sport.clientID:null;
                if(!room_uid){
                    console.log("not in a room so cant leave room")
                    return;
                }
                if(!uuid){
                    console.log("not login so cant leave room")
                    return;
                }
                if(rooms[room_uid]){
                    if(rooms[room_uid].audiences[clientID]){
                        //通知房间中的其他用户，有人出去了
                        io.to(room_uid).emit(clientEvent.otherLeaveRoom,{clientID:clientID,uuid:uuid})
                        socket.leave(room_uid)
                        delete rooms[room_uid].audiences[clientID];
                    }
                }
            })

            socket.on(serverEvent.setPermission,function (msg,cb) {
                var permissions = msg.permissions; //权限类型
                if(!socket.sport){
                    console.log("not login cant setPermission")
                    cb({error:1,errorinfo:"not login cant setPermission"})
                    return;
                }
                if(!socket.sport.room_uid){
                    console.log("not enter room cant setPermission")
                    cb({error:2,errorinfo:"not enter room cant setPermission"})
                    return;
                }
                var clientID = socket.sport.clientID;
                var room_uid = socket.sport.room_uid;
                for(var i=0;i<permissions.length;i++){
                    if(!rooms[room_uid].permission[permissions[i]]){
                        rooms[room_uid].permission[permissions[i]] = clientID;
                    }
                }
                console.log(rooms[room_uid].permission);
                io.to(room_uid).emit(clientEvent.updatePermission,{permission:rooms[room_uid].permission})
                cb({error:0})
            })

            socket.on(serverEvent.unsetPermission,function (msg) {
                var permissions = msg.permissions; //权限类型
                if(!socket.sport){
                    console.log("not login cant setPermission")
                    return;
                }
                if(!socket.sport.room_uid){
                    console.log("not enter room cant setPermission")
                    return;
                }
                var clientID = socket.sport.clientID;
                var room_uid = socket.sport.room_uid;

                for(var i=0;i<permissions.length;i++){
                    if(rooms[room_uid].permission[permissions[i]]){
                        if(rooms[room_uid].permission[permissions[i]] == clientID){
                            rooms[room_uid].permission[permissions[i]] = null;
                        }
                    }
                }
                console.log(rooms[room_uid].permission)
                io.to(room_uid).emit(clientEvent.updatePermission,{permission:rooms[room_uid].permission})
            })

            socket.on(serverEvent.chat,function (msg) {
                var text = msg.content;
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var record = {uuid:uuid,type:"text",text:text,createtime:Date.now()};
                rooms[room_uid].database.chat.push(record)
                io.to(room_uid).emit(clientEvent.updateChat,record)
            })

            socket.on(serverEvent.picture,function (msg) {
                var url = msg.url;
                var text = msg.text;
                var filesize = msg.filesize;
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var record = {uuid:uuid,type:"picture",url:url,text:text,filesize:filesize,createtime:Date.now()};
                rooms[room_uid].database.chat.push(record)
                io.to(room_uid).emit(clientEvent.updateChat,record)
            })

            socket.on(serverEvent.shortVideo,function (msg) {
                var url = msg.url;
                var text = msg.text;
                var filesize = msg.filesize;
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var record = {uuid:uuid,type:"video",url:url,text:text,filesize:filesize,createtime:Date.now()};
                rooms[room_uid].database.chat.push(record)
                io.to(room_uid).emit(clientEvent.updateChat,record)
            })
            
            socket.on(serverEvent.updateTime,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateTime] != clientID){
                    console.log("not have permission to updateTime")
                    return;
                }
                var currentsection = msg.currentsection;
                var currentsectiontime = msg.currentsectiontime;

                rooms[room_uid].database.currentsection = currentsection;
                rooms[room_uid].database.currentsectiontime = currentsectiontime;

                var obj = {
                    currentsection,
                    currentsectiontime,
                }
                io.to(room_uid).emit(clientEvent.updateTime,obj)
            })
            
            socket.on(serverEvent.updateScore,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateScore] != clientID){
                    console.log("not have permission to updateScore")
                    return;
                }
                var team1currentscore = msg.team1currentscore;
                var team2currentscore = msg.team2currentscore;
                rooms[room_uid].database.team1currentscore = team1currentscore;
                rooms[room_uid].database.team2currentscore = team2currentscore;
                var obj = {
                    team1currentscore,
                    team2currentscore
                }
                io.to(room_uid).emit(clientEvent.updateScore,obj);
            })
            
            socket.on(serverEvent.updateTimeout,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateTimeout] != clientID){
                    console.log("not have permission to updateTimeout")
                    return;
                }
                var team1timeout = msg.team1timeout;
                var team2timeout = msg.team2timeout;
                rooms[room_uid].database.team1timeout = team1timeout;
                rooms[room_uid].database.team2timeout = team2timeout;
                var obj = {
                    team1timeout,
                    team2timeout
                }
                io.to(room_uid).emit(clientEvent.updateTimeout,obj);
            })
            
            socket.on(serverEvent.updateBallControl,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateBallControl] != clientID){
                    console.log("not have permission to updateBallControl")
                    return;
                }
                var ballowner = msg.ballowner;
                var currentattacktime = msg.currentattacktime;
                rooms[room_uid].database.ballowner = ballowner;
                rooms[room_uid].database.currentattacktime = currentattacktime;
                io.to(room_uid).emit(clientEvent.updateBallControl,{ballowner,currentattacktime})
            })
            
            socket.on(serverEvent.updateFoul,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateFoul] != clientID){
                    console.log("not have permission to updateFoul")
                    return;
                }
                var foul = msg.foul;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['foul'] = foul;
                io.to(room_uid).emit(clientEvent.updateFoul,msg);
            })
            
            socket.on(serverEvent.updateShoot,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateShoot] != clientID){
                    console.log("not have permission to updateShoot")
                    return;
                }

                var shoot = msg.shoot;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['shoot'] = shoot;
                io.to(room_uid).emit(clientEvent.updateShoot,msg);
            })
            
            socket.on(serverEvent.updateFreethrow,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateFreethrow] != clientID){
                    console.log("not have permission to updateFreethrow")
                    return;
                }

                var freethrow = msg.freethrow;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['freethrow'] = freethrow;
                io.to(room_uid).emit(clientEvent.updateFreethrow,msg);
            })
            
            socket.on(serverEvent.updateRebound,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateRebound] != clientID){
                    console.log("not have permission to updateRebound")
                    return;
                }

                var rebound = msg.rebound;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['rebound'] = rebound;
                io.to(room_uid).emit(clientEvent.updateRebound,msg);
            })
            
            socket.on(serverEvent.updateAssist,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateAssist] != clientID){
                    console.log("not have permission to updateAssist")
                    return;
                }

                var assists = msg.assists;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['assists'] = assists;
                io.to(room_uid).emit(clientEvent.updateAssist,msg);

            })
            
            socket.on(serverEvent.updateSteal,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateSteal] != clientID){
                    console.log("not have permission to updateSteal")
                    return;
                }

                var steals = msg.steals;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['steals'] = steals;
                io.to(room_uid).emit(clientEvent.updateSteal,msg);

            })
            
            socket.on(serverEvent.updateFault,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateFault] != clientID){
                    console.log("not have permission to updateFault")
                    return;
                }

                var fault = msg.fault;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['fault'] = fault;
                io.to(room_uid).emit(clientEvent.updateFault,msg);
            })
            
            socket.on(serverEvent.updateBlock,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateBlock] != clientID){
                    console.log("not have permission to updateBlock")
                    return;
                }

                var block = msg.block;
                var player_uid = msg.player_uid;
                if(!rooms[room_uid].database[player_uid]){
                    rooms[room_uid].database[player_uid] = {};
                }
                rooms[room_uid].database[player_uid]['block'] = block;
                io.to(room_uid).emit(clientEvent.updateBlock,msg);

            })
            
            socket.on(serverEvent.updateSubstitution,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateSubstitution] != clientID){
                    console.log("not have permission to updateSubstitution")
                    return;
                }

                var team1currentplayers = msg.team1currentplayers;
                var team2currentplayers = msg.team2currentplayers;
                var player_up_uid = msg.player_up_uid;
                var player_down_uid = msg.player_down_uid;
                var team_index = msg.team_index;
                rooms[room_uid].database.team1currentplayers = team1currentplayers;
                rooms[room_uid].database.team2currentplayers = team2currentplayers;
                io.to(room_uid).emit(clientEvent.updateSubstitution,msg);
            })
            
            socket.on(serverEvent.updateMVPofGame,function (msg) {
                var room_uid = socket.sport.room_uid;
                var uuid = socket.sport.uuid;
                var clientID = socket.sport.clientID;
                //检测是否有权限
                if(rooms[room_uid].permission[permissionType.updateMVPofGame] != clientID){
                    console.log("not have permission to updateMVPofGame")
                    return;
                }

                var player_uid = msg.player_uid;
                rooms[room_uid].database.mvpofgame = player_uid;
                io.to(room_uid).emit(clientEvent.updateMVPofGame,msg);
            })
        });
    }
}