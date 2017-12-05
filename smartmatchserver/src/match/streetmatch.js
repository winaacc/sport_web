var mongoClient = require("../../db/mongoClient")
var co = require('co');
var thunkify = require('thunkify');
var verifyToken = require("../../utils/token").verifyToken;
var matchconst = require('../../consts/MatchConst')

module.exports = {
    joinmatch:function(req,res){
        var {face_token,token,showid} = req.body;
            co(function* () {
                var Matches_docs = yield mongoClient.find(mongoClient.TABLES.Matches,{match_showid:showid});
                if(Matches_docs.length > 0){
                    var internal_id = Matches_docs[0].match_uid;
                    var match_type = Matches_docs[0].match_type;
                    var detail_matches = null;
                    if(match_type == matchconst.matchtype.streetmatch){
                        detail_matches = yield mongoClient.find(mongoClient.TABLES.StreetMatches,{match_uid:internal_id});
                    }else{
                        res.json({error:5,errorinfo:"目前只支持加入野球赛"})
                        return;
                    }

                    if(face_token){
                        var face_docs = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{face_token:face_token});
                        if(face_docs.length > 0){
                            var match_players = detail_matches[0].match_players;
                            //判断是否已经加入
                            if(match_players.indexOf(face_token) != -1){
                                res.json({error:6,errorinfo:"已经加入比赛，不能重复加入"});
                                return;
                            }
                            match_players.push(face_token);
                            yield mongoClient.updateOne(mongoClient.TABLES.StreetMatches,{match_uid:internal_id},{'$set':{match_players:match_players}})
                            res.json({error:0})
                        }else{
                            //face_token无效
                            res.json({error:3,errorinfo:"face_token无效"})
                        }
                    }else if(token){
                        var decoded = verifyToken(token);
                        if(decoded.error){
                            //token过期
                            res.json({error:1,errorinfo:"token过期或无效"})
                            return;
                        }else{
                            var uid = decoded.uid;
                            var Users_docs = yield mongoClient.find(mongoClient.TABLES.Users,{uid:uid});
                            if(Users_docs.length > 0){
                                var match_players = detail_matches[0].match_players;
                                //判断是否已经加入
                                if(match_players.indexOf(uid) != -1){
                                    res.json({error:6,errorinfo:"已经加入比赛，不能重复加入"});
                                    return;
                                }
                                match_players.push(uid);
                                yield mongoClient.updateOne(mongoClient.TABLES.StreetMatches,{match_uid:internal_id},{'$set':{match_players:match_players}})
                                res.json({error:0})
                            }else{
                                res.json({error:7,errorinfo:"uid无效"})
                                return;
                            }

                        }
                    }else{
                        //face_token和token都为空
                        res.json({error:4,errorinfo:"face_token和token都为空"})
                    }
                }else{
                    //比赛ID无效
                    res.json({error:2,errorinfo:"比赛ID无效"})
                }
            })
    },

    getPlayersOfStreetMatch:function (req,res) {
        var {showid} = req.body;
        console.log(showid);
        co(function* () {
            var streetmatch_docs = yield mongoClient.find(mongoClient.TABLES.StreetMatches,{match_showid:showid});
            if(streetmatch_docs.length > 0){
                var players = [];
                var match_players = streetmatch_docs[0].match_players;
                for(var i=0;i<match_players.length;i++){
                    var docs = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{face_token:match_players[i]})
                    if(docs.length == 0){
                        docs = yield mongoClient.find(mongoClient.TABLES.Users,{uid:match_players[i]});
                        //App用户
                        players.push({id:match_players[i],image:docs[0].headerimage,nickname:docs[0].nickname})
                    }else{
                        //Web用户
                        players.push({id:match_players[i],image:docs[0].image_url,nickname:docs[0].nickname})
                    }

                }

                res.json({error:0,players:players})

            }else{
                res.json({error:1,errorinfo:"比赛ID无效"})
                console.log({error:1,errorinfo:"比赛ID无效"})
            }
        })
    },

    getPlayerInfosOfUids:function(req,res){
        var {uids} = req.body;
        console.log(uids);
        co(function* () {
            var players = [];
            for(var i=0;i<uids.length;i++){
                var docs = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{face_token:uids[i]})
                if(docs.length == 0){
                    docs = yield mongoClient.find(mongoClient.TABLES.Users,{uid:uids[i]});
                    //App用户
                    players.push({id:uids[i],image:docs[0].headerimage,nickname:docs[0].nickname})
                }else{
                    //Web用户
                    players.push({id:uids[i],image:docs[0].image_url,nickname:docs[0].nickname})
                }
            }
            res.json({error:0,players:players})
        })
    },

    updateNickNameOfFaceInfo:function (req,res) {
        var {nickname,face_token} = req.body;
        co(function* () {
            yield mongoClient.updateOne(mongoClient.TABLES.FaceInfos,{face_token:face_token},{"$set":{nickname:nickname}})
            var faceinfo_docs = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{face_token:face_token});
            if(faceinfo_docs.length > 0){
                res.json({error:0,nickname:faceinfo_docs[0].nickname})
            }else{
                res.json({error:1,errorinfo:"face_token无效"})
            }
        })
    },

    createTempTeams:function(req,res){
        var {token,showid} = req.body;
        co(function* () {
            var matches = yield mongoClient.find(mongoClient.TABLES.StreetMatches,{match_showid:showid});
            if(matches.length>0){
                //判断是否是比赛创建者
                var creater = matches[0].create_useruid;
                var decoded = verifyToken(token);
                if(decoded.error){
                    //token过期
                    return res.json({error:1,errorinfo:"token过期或无效"});
                }else {
                    var uid = decoded.uid;
                    if(creater != uid){
                        return res.json({error:3,errorinfo:"不是比赛创建者"})
                    }
                }

                //判断人数是否满足邀请
                var startup = matches[0].match_rule.startup_num;
                var players = matches[0].match_players;
                if(players.length < startup*2){
                    return res.json({error:3,errorinfo:"球员人数太少，不足以组成两队"})
                }

                //开始创建临时比赛
                var team_num = Math.floor(players.length/startup)
                //初始化球队
                var temp_teams = [];
                for(var i=0;i<team_num;i++){
                    var team = {teamid:i,name:"",logo:"",members:[]};
                    temp_teams.push(team);
                }

                var player_arr = [];
                for(var i=0;i<players.length;i++){
                    player_arr[i] = players[i];
                }
                player_arr.sort(function (a,b) {
                    return Math.random()>0.5?-1:1;
                })
                for(var i=0;i<player_arr.length;i++){
                    var tindex = i%team_num;
                    temp_teams[tindex].members.push(player_arr[i]);
                }

                yield mongoClient.updateOne(mongoClient.TABLES.StreetMatches,{match_showid:showid},{'$set':{match_teams:temp_teams}})

                return res.json({error:0})

            }else{
                return res.json({error:2,errorinfo:"比赛ID无效"})
            }
        })
    },

    uploadTeamNameLogo:function (req,res) {
        var {token,name,logo,showid,teamid} = req.body;
        co(function* () {
            var matches = yield mongoClient.find(mongoClient.TABLES.StreetMatches,{match_showid:showid});
            if(matches.length > 0){
                //判断是否是比赛创建者
                var creater = matches[0].create_useruid;
                var decoded = verifyToken(token);
                if(decoded.error){
                    //token过期
                    return res.json({error:1,errorinfo:"token过期或无效"});
                }else {
                    var uid = decoded.uid;
                    if(creater != uid){
                        return res.json({error:3,errorinfo:"不是比赛创建者"})
                    }
                }

                //检测teamid是否存在
                var team = matches[0].match_teams[teamid];
                if(!team){
                    return res.json({error:4,errorinfo:"teamid不存在"})
                }
                //检测name和logo是否为空
                if(!name || !logo){
                    return res.json({error:5,errorinfo:"name或logo为空"})
                }

                team.name = name;
                team.logo = logo;

                yield mongoClient.updateOne(mongoClient.TABLES.StreetMatches,{match_showid:showid},{"$set":{match_teams:matches[0].match_teams}})
                return res.json({error:0})

            }else{
                return res.json({error:2,errorinfo:"比赛ID无效"})
            }
        })
    },

    //根据赛制创建赛程，有的赛制无法确定全部赛程，需要根据比赛的进行，逐步确定
    createInitSchedule:function (req,res) {
        console.log("createInitSchedule")
        var {token,showid,league_type,customschedule} = req.body;
        co(function* () {
            var matches = yield mongoClient.find(mongoClient.TABLES.StreetMatches,{match_showid:showid});
            if(matches.length == 0){
                return res.json({error:2,errorinfo:"比赛ID无效"})
            }

            //判断是否是比赛创建者
            var creater = matches[0].create_useruid;
            var decoded = verifyToken(token);
            if(decoded.error){
                //token过期
                return res.json({error:1,errorinfo:"token过期或无效"});
            }else {
                var uid = decoded.uid;
                if(creater != uid){
                    return res.json({error:3,errorinfo:"不是比赛创建者"})
                }
            }

            //判断球队是否已经生成
            if(matches[0].match_teams.length<2){
                return res.json({error:4,errorinfo:"没有球队"})
            }

            //判断是否已经生成球队名称和logo
            for(var i=0;i<matches[0].match_teams.length;i++){
                if(!matches[0].match_teams[i].name || !matches[0].match_teams[i].logo){
                    return res.json({error:5,errorinfo:"请设置球队名称和logo"})
                }
            }

            //判断赛程是否已经生成
            var match_games = matches[0].match_games;
            if(match_games.length>0){
                //return res.json({error:6,errorinfo:"赛程已经生成"})
                //赛程存在，重置赛程
                match_games = [];
            }

            //根据赛制生成赛程
            if(matchconst.league_type.win_on_court == league_type){
               var schedule = {teamID1:-1,teamID2:-1,waitTeams:[]};
               schedule.teamID1 = matches[0].match_teams[0].teamid;
               schedule.teamID2 = matches[0].match_teams[1].teamid;
                for(var i=2;i<matches[0].match_teams.length;i++){
                    schedule.waitTeams.push(matches[0].match_teams[i].teamid);
                }
                match_games.push(schedule);
            }else if(matchconst.league_type.cup == league_type){
                //杯赛的队伍数量必须是4，8，16，32，64，128等
                //判断队伍数量是否满足要求
                var teamcount = matches[0].match_teams.length;
                if(teamcount%4 != 0){
                    return res.json({error:7,errorinfo:"队伍数量必须是4，8，16，32，64，128等"})
                }

                if(teamcount>4){
                    var bei4 = teamcount/4;
                    var bei2 = bei4%2;
                    if(bei2 != 0){
                        return res.json({error:7,errorinfo:"队伍数量必须是4，8，16，32，64，128等"})
                    }
                }

                for(var i=0;i<teamcount;i=i+2){
                    var schedule = {teamID1:matches[0].match_teams[i].teamid,teamID2:matches[0].match_teams[i+1].teamid}
                    match_games.push(schedule);
                }

            }else if(matchconst.league_type.loop == league_type){
                var teamcount = matches[0].match_teams.length;
                for(var i=0;i<teamcount;i++){
                    for(var j=0;j<teamcount;j++){
                        if(i != j){
                            var schedule = {teamID1:matches[0].match_teams[i].teamid,teamID2:matches[0].match_teams[j].teamid}
                            match_games.push(schedule);
                        }
                    }
                }
            }else if(matchconst.league_type.nba == league_type){
                //队伍数量必须大于4
                var teamcount = matches[0].match_teams.length;
                if(teamcount<=4){
                    return res.json({error:8,errorinfo:"队伍数量必须大于4"})
                }
                for(var i=0;i<teamcount;i++){
                    for(var j=0;j<teamcount;j++){
                        if(i != j){
                            var schedule = {teamID1:matches[0].match_teams[i].teamid,teamID2:matches[0].match_teams[j].teamid}
                            match_games.push(schedule);
                        }
                    }
                }
            }else if(matchconst.league_type.world_cup == league_type){
                //队伍数量必须是8，16，32，64，128
                //判断队伍数量是否满足要求
                var teamcount = matches[0].match_teams.length;
                if(teamcount<8){
                    return res.json({error:7,errorinfo:"队伍数量必须是8，16，32，64，128等"})
                }
                if(teamcount%4 != 0){
                    return res.json({error:7,errorinfo:"队伍数量必须是8，16，32，64，128等"})
                }

                var bei4 = teamcount/4;
                var bei2 = bei4%2;
                if(bei2 != 0){
                    return res.json({error:7,errorinfo:"队伍数量必须是8，16，32，64，128等"})
                }


                //生成赛程，小组循环+淘汰赛
                for(var a=0;a<teamcount;a=a+4){
                    var start = a;
                    var end = a+4;
                    for(var i=start;i<end;i++){
                        for(var j=start;j<end;j++){
                            if(i != j){
                                var schedule = {teamID1:matches[0].match_teams[i].teamid,teamID2:matches[0].match_teams[j].teamid}
                                match_games.push(schedule);
                            }
                        }
                    }
                }


            }else if(matchconst.league_type.custom == league_type){
                //检查客户端参数是否正确
                for(var i=0;i<customschedule.length;i++){
                    var teamID1 = customschedule[i].teamID1;
                    var teamID2 = customschedule[i].teamID2;
                    //判断ID是否有效
                    var teamID1_Exist = false;
                    var teamID2_Exist = false;
                    var teamcount = matches[0].match_teams.length;
                    for(var t=0;t<teamcount;t++){
                        if(matches[0].match_teams[t].teamid == teamID1){
                            teamID1_Exist = true;
                        }
                        if(matches[0].match_teams[t].teamid == teamID2){
                            teamID2_Exist = true;
                        }
                    }
                    if(!teamID1_Exist || !teamID2_Exist){
                        return res.json({error:9,errorinfo:"自定义赛程比赛ID无效"})
                    }
                    match_games.push({teamID1:teamID1,teamID2:teamID2})
                }
            }else{
                return res.json({error:10,errorinfo:"赛制类型无效"})
            }

            //设置赛程唯一ID,生成game列表和对应的room
            for(var i=0;i<match_games.length;i++){
                var schedule = match_games[i];
                schedule.schedule_uid = i;
                schedule.gameset = [];
                //默认3局两胜
                for(var g=0;g<3;g++){
                    //在数据库中插入一条game和room数据
                    var room_uid = yield mongoClient.getRoomUniqueID();
                    var game_uid = yield mongoClient.getGameUniqueID();
                    var room_doc = mongoClient.TableDocument(mongoClient.TABLES.Rooms);
                    room_doc.room_uid = room_uid;
                    room_doc.game_uid = game_uid;
                    yield mongoClient.insert(mongoClient.TABLES.Rooms,room_doc);
                    var game_doc = mongoClient.TableDocument(mongoClient.TABLES.Games);
                    game_doc.game_uid = game_uid;
                    game_doc.match_showid = showid;
                    game_doc.Referee_uid = creater;
                    game_doc.room_uid = room_uid;
                    game_doc.schedule_id = schedule.schedule_uid;
                    game_doc.matchdate = Date.now();
                    yield mongoClient.insert(mongoClient.TABLES.Games,game_doc);
                    schedule.gameset.push(game_uid);
                }
            }
            yield mongoClient.updateOne(mongoClient.TABLES.StreetMatches,{match_showid:showid},{"$set":{match_games:match_games}})
            return res.json({error:0})
        })
    },

    getGameListOfScheduleId:function (req,res) {
        var {matchid,scheduleid} = req.body;
        co(function* () {
            var matches = yield mongoClient.find(mongoClient.TABLES.StreetMatches,{match_showid:matchid});
            if(matches.length == 0){
                return res.json({error:2,errorinfo:"比赛ID无效"})
            }
            var match_games = matches[0].match_games;
            var schedule = null;
            for(var i=0;i<match_games.length;i++){
                if(match_games[i].schedule_uid == scheduleid){
                    schedule = match_games[i];
                }
            }
            if(schedule == null){
                return res.json({error:3,errorinfo:"赛程ID无效"})
            }

            //首先获得队伍信息
             var team1 = matches[0].match_teams[schedule.teamID1];
             var team2 = matches[0].match_teams[schedule.teamID2];
             var games = [];
             for(var i=0;i<schedule.gameset.length;i++){
                 var result = yield mongoClient.find(mongoClient.TABLES.Games,{game_uid:schedule.gameset[i]})
                 games.push(result[0]);
             }
             return res.json({error:0,team1:team1,team2:team2,games:games})

        })

    },

    adminGame:function (req,res) {
        const admin_op = {
            insquad:1, //进入大名单
            startup:2, //确定首发
            update_time:3,//更新时间，例如每节剩余时间，24秒等
            update_score:4,//更新分数
            update_timeout:5,//更新暂停数
            update_ballcontrol:6, //更新球权
            update_Foul:7, //更新犯规
            update_shoot:8, //更新投篮
            update_freethrow:9, //更新罚球
            update_rebound:10, //更新篮板
            update_assists:11, //更新助攻
            update_steals:12,  //更新抢断
            update_fault:13,  //更新失误
            update_block:14,  //更新盖帽
            substitution:15,        //换人
            mvpofgame:16,     //本场MVP
            update_point:17,  //更新球员得分，数据类型：[{point,section,time}]
        }

        co(function* () {
            var {optype,meta,game_uid} = req.body;
            var game_docs = yield mongoClient.find(mongoClient.TABLES.Games,{game_uid:game_uid})
            if(game_docs.length == 0){
                return res.json({error:2,errorinfo:"game唯一ID无效"})
            }
            var room_uid = game_docs[0].room_uid;
            if(optype == admin_op.insquad){
                //meta格式：用户唯一ID的数组
                var players = meta.players;
                var index = meta.teamindex;
                var obj_exist = {};
                if(index == 0){
                    for(var i=0;i<game_docs[0].team1Player.length;i++){
                        obj_exist[game_docs[0].team1Player[i]] = true;
                    }
                }else if(index == 1){
                    for(var i=0;i<game_docs[0].team2Player.length;i++){
                        obj_exist[game_docs[0].team2Player[i]] = true;
                    }
                }
                for(var i=0;i<players.length;i++){
                    if(index == 0){
                        if(!obj_exist[players[i]])
                            game_docs[0].team1Player.push(players[i])
                    }else if(index == 1){
                        if(!obj_exist[players[i]])
                            game_docs[0].team2Player.push(players[i])
                    }

                }
                yield mongoClient.updateOne(mongoClient.TABLES.Games,{game_uid:game_uid},{"$set":{
                    team1Player:game_docs[0].team1Player,
                    team2Player:game_docs[0].team2Player
                }})
                return res.json({error:0,team1Player:game_docs[0].team1Player,team2Player:game_docs[0].team2Player})
            }else if(optype == admin_op.startup){
                var players = meta.players;
                var index = meta.teamindex;
                var obj_exist = {};
                if(index == 0){
                    for(var i=0;i<game_docs[0].team1Startup.length;i++){
                        obj_exist[game_docs[0].team1Startup[i]] = true;
                    }
                }else if(index == 1){
                    for(var i=0;i<game_docs[0].team2Startup.length;i++){
                        obj_exist[game_docs[0].team2Startup[i]] = true;
                    }
                }
                for(var i=0;i<players.length;i++){
                    if(index == 0){
                        if(!obj_exist[players[i]])
                            game_docs[0].team1Startup.push(players[i])
                    }else if(index == 1){
                        if(!obj_exist[players[i]])
                            game_docs[0].team2Startup.push(players[i])
                    }

                }

                yield mongoClient.updateOne(mongoClient.TABLES.Games,{game_uid:game_uid},{"$set":{
                    team1Startup:game_docs[0].team1Startup,
                    team2Startup:game_docs[0].team2Startup
                }})

                //设置当前上场
                var team1currentplayers = [];
                var team2currentplayers = [];
                for(var i=0;i<game_docs[0].team1Startup.length;i++){
                    team1currentplayers.push({uid:game_docs[0].team1Startup[i],playingtime:0});
                }
                for(var i=0;i<game_docs[0].team2Startup.length;i++){
                    team2currentplayers.push({uid:game_docs[0].team2Startup[i],playingtime:0});
                }

                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':{
                    team1currentplayers:team1currentplayers,
                    team2currentplayers:team2currentplayers
                }})
                return res.json({
                    error:0,
                    team1Startup:game_docs[0].team1Startup,team2Startup:game_docs[0].team2Startup,
                    team1currentplayers:team1currentplayers,team2currentplayers:team2currentplayers
                })
            }else if(optype == admin_op.update_time){
                var currentsection = meta.currentsection;
                var currentsectiontime = meta.currentsectiontime;

                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':{
                    currentsection:currentsection,
                    currentsectiontime:currentsectiontime,
                }})
                return res.json({error:0})
            }else if(optype == admin_op.update_score){
                var team1currentscore = meta.team1currentscore;
                var team2currentscore = meta.team2currentscore;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':{
                    team1currentscore:team1currentscore,
                    team2currentscore:team2currentscore,
                }})
                return res.json({error:0})
            }else if(optype == admin_op.update_timeout){
                var team1timeout = meta.team1timeout;
                var team2timeout = meta.team2timeout;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':{
                    team1timeout:team1timeout,
                    team2timeout:team2timeout,
                }})
                return res.json({error:0})
            }else if(optype == admin_op.update_ballcontrol){
                var ballowner = meta.ballowner;
                var currentattacktime = meta.currentattacktime;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':{
                    ballowner:ballowner,
                    currentattacktime:currentattacktime
                }})
                return res.json({error:0})
            }else if(optype == admin_op.update_Foul){
                var player_uid = meta.uid;
                var foul = meta.foul;
                var key = player_uid+".foul";
                var obj = {};
                obj[key] = foul;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.update_shoot){
                var player_uid = meta.uid;
                var shoot = meta.shoot; //[{x:-1,y:-1,point:0,score:false}]
                var key = player_uid + ".shoot"
                var obj = {};
                obj[key] = shoot;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.update_point){
                var player_uid = meta.uid;
                var point = meta.point; //[{point,section,time}]
                var key = player_uid + ".point"
                var obj = {};
                obj[key] = point;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            } else if(optype == admin_op.update_freethrow){
                var player_uid = meta.uid;
                var freethrow = meta.freethrow; //[{type:0,shoot:2,score:1}]
                var key = player_uid + ".freethrow"
                var obj = {};
                obj[key] = freethrow;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.update_rebound){
                var player_uid = meta.uid;
                var rebound = meta.rebound;
                var key = player_uid + ".rebound"
                var obj = {};
                obj[key] = rebound;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.update_assists){
                var player_uid = meta.uid;
                var assists = meta.assists;
                var key = player_uid+".assists";
                var obj = {};
                obj[key] = assists;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.update_steals){
                var player_uid = meta.uid;
                var steals = meta.steals;
                var key = player_uid+".steals";
                var obj = {};
                obj[key] = steals;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.update_fault){
                var player_uid = meta.uid;
                var fault = meta.fault;
                var key = player_uid+".fault";
                var obj = {};
                obj[key] = fault;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.update_block){
                var player_uid = meta.uid;
                var block = meta.block;
                var key = player_uid+".block";
                var obj = {};
                obj[key] = block;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':obj})
                return res.json({error:0})
            }else if(optype == admin_op.substitution){
                var player_up_uid = meta.player_up_uid;
                var player_down_uid = meta.player_down_uid;
                var team_index = meta.team_index;
                console.log(meta);
                var room_docs = yield mongoClient.find(mongoClient.TABLES.Rooms,{room_uid:room_uid});
                //找到下场的球员，然后增加该球员的上场时间
                console.log(room_docs);
                var team = null;
                if(team_index == 0){
                    team = room_docs[0].team1currentplayers;
                }else if(team_index == 1){
                    team = room_docs[0].team2currentplayers;
                }else{
                    return res.json({error:2,errorinfo:"队伍索引无效"})
                }

                var down_player = null;
                var currenttime = (room_docs[0].currentsection-1)*room_docs[0].currentsectiontime+(10*60-room_docs[0].currentsectiontime);
                for(var i=0;i<team.length;i++){
                    if(team[i].uid == player_down_uid){
                        down_player = team[i];
                        //从当前上场球员列表中删除下场球员，同时增加上场球员
                        team.splice(i,1,{uid:player_up_uid,playingtime:currenttime});
                        break;
                    }
                }

                if(!down_player){
                    return res.json({error:3,errorinfo:"下场球员ID无效"})
                }

                //计算上场时间
                var oncourttime = currenttime - down_player.playingtime;

                //存储场上球员类别和球员上场时间
                var key = player_down_uid+'.playingtime';
                var obj = {};
                obj[key] = oncourttime;

                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':{
                    team1currentplayers:room_docs[0].team1currentplayers,
                    team2currentplayers:room_docs[0].team2currentplayers,
                },'$inc':obj})
                return res.json({error:0})
            }else if(optype == admin_op.mvpofgame){
                var uid = meta.uid;
                yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{room_uid:room_uid},{'$set':{
                    mvpofgame:uid
                }})
                return res.json({error:0})
            }else{
                return res.json({error:4,errorinfo:"操作类型不存在"})
            }
        })
    },

    getGameInfo:function (req,res) {
        var {game_uid} = req.body;
        co(function* () {
            var game_docs = yield mongoClient.find(mongoClient.TABLES.Games,{game_uid:game_uid});
            if(game_docs.length == 0){
                return res.json({error:2,errorinfo:"游戏ID无效"})
            }
            var team1Players = game_docs[0].team1Player;
            var team2Players = game_docs[0].team2Player;
            var team1Startup = game_docs[0].team1Startup;
            var team2Startup = game_docs[0].team2Startup;
            var position = game_docs[0].position;
            var matchdate =  game_docs[0].matchdate;
            var matchtime = game_docs[0].matchtime;
            var status = game_docs[0].status;

            var room_docs = yield mongoClient.find(mongoClient.TABLES.Rooms,{game_uid:game_uid})

            return res.json({
                error:0,
                team1Player:team1Players,
                team2Player:team2Players,
                team1Startup:team1Startup,
                team2Startup:team2Startup,
                position:position,
                matchdate:matchdate,
                matchtime:matchtime,
                status:status,
                roomInfo:room_docs[0]
            })

        })
    },
    enterRoom:function (req,res) {
        var {game_uid,player_uid} = req.body;
        co(function* () {
            yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{game_uid:game_uid},{'$inc':{audiencenum:1}});
            return res.json({error:0})
        })
    },

    sendChat:function (req,res) {
        var {game_uid,player_uid,content} = req.body;
        var record = {uid:player_uid,content:content,createtime:Date.now()}
        co(function* () {
            yield mongoClient.updateOne(mongoClient.TABLES.Rooms,{game_uid:game_uid},{'$push':{chat:record}})
        })
    }


}