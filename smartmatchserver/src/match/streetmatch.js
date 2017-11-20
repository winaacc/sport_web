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
                        players.push({type:'app',id:match_players[i],image:docs[0].headerimage,nickname:docs[0].nickname})
                    }else{
                        //Web用户
                        players.push({type:'web',id:match_players[i],image:docs[0].image_url,nickname:docs[0].nickname})
                    }

                }

                res.json({error:0,players:players})

            }else{
                res.json({error:1,errorinfo:"比赛ID无效"})
            }
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
    }
}