var mongoClient = require("../db/mongoClient")
var co = require('co');
var thunkify = require('thunkify');
var verifyToken = require("../utils/token").verifyToken;

module.exports = {
    createTimeLine:function (req,res) {
        var {token,text,images} = req.body;
        var myuid = null;
        var decoded = verifyToken(token);
        if(decoded.error){
            //token过期
            res.json({error:1})
            return;
        }

        myuid = decoded.uid;

        co(function* () {
            var newobj = mongoClient.TableDocument(mongoClient.TABLES.TimeLines);
            var timelineuid = yield mongoClient.getTimeLineUniqueID();
            newobj.timeline_uid = timelineuid;
            newobj.creater = myuid;
            newobj.text = text;
            newobj.images = images;
            yield mongoClient.insert(mongoClient.TABLES.TimeLines,newobj);
            res.json({error:0})
        })
    },

    getAllTimeLines:function (req,res) {
        co(function* () {
            var timelines = yield mongoClient.find(mongoClient.TABLES.TimeLines,{});
            for(var i=0;i<timelines.length;i++){
                var uid = timelines[i].creater;
                var timeline_uid = timelines[i].timeline_uid;
                var userinfos = yield mongoClient.find(mongoClient.TABLES.Users,{uid:uid})
                timelines[i].userinfo = {nickname:userinfos[0].nickname,headerimage:userinfos[0].headerimage}
                //获得评论
                var comments = yield mongoClient.find(mongoClient.TABLES.TimeLineComments,{timeline_uid:timeline_uid});
                //获得评论的用户信息
                for(var c=0;c<comments.length;c++){
                    var commentuser = yield mongoClient.find(mongoClient.TABLES.Users,{uid:comments[c].creater});
                    comments[c].userinfo = {nickname:commentuser[0].nickname,headerimage:commentuser[0].headerimage}
                }
                timelines[i].comments = comments;
            }
            console.log(timelines);
            res.json({timelines:timelines})
        })
    },
    getMyTimeLines:function (req,res) {
        var {token} = req.body;
        var myuid = null;
        var decoded = verifyToken(token);
        if(decoded.error){
            //token过期
            res.json({error:1})
            return;
        }

        myuid = decoded.uid;

        co(function* () {
            var timelines = yield mongoClient.find(mongoClient.TABLES.TimeLines,{creater:myuid})
            res.json({timelines:timelines,error:0})
        })
    },
    getOtherTimeLines:function (req,res) {
        var {uid} = req.body;
        co(function* () {
            var timelines = yield mongoClient.find(mongoClient.TABLES.TimeLines,{creater:uid})
            res.json({timelines:timelines,error:0})
        })
    },
    deleteTimeLines:function (req,res) {
        var {timelineuid} = req.body;
        co(function* () {
            yield mongoClient.deleteOne(mongoClient.TABLES.TimeLines,{timeline_uid:timelineuid});
            res.json({error:0})
        })
    },

    commentTimeLine:function (req,res) {
        var {token,timelineuid,iszan,text} = req.body;
        var myuid = null;
        var decoded = verifyToken(token);
        if(decoded.error){
            //token过期
            res.json({error:1})
            return;
        }

        myuid = decoded.uid;
        co(function* () {
            var newobj = mongoClient.TableDocument(mongoClient.TABLES.TimeLineComments);
            newobj.comment_uid = yield mongoClient.getCommentOfTimeLineUniqueID();
            newobj.creater = myuid;
            newobj.timeline_uid = timelineuid;
            if(iszan){
                newobj.iszan = true;
            }else{
                newobj.text = text;
            }

            yield mongoClient.insert(mongoClient.TABLES.TimeLineComments,newobj);
            res.json({error:0})
        })
    },

    deleteTimeLineComment:function (req,res) {
        var {token,commentuid} = req.body;
        var myuid = null;
        var decoded = verifyToken(token);
        if(decoded.error){
            //token过期
            res.json({error:1})
            return;
        }

        myuid = decoded.uid;
        co(function* () {
            yield mongoClient.deleteOne(mongoClient.TABLES.TimeLineComments,{comment_uid:commentuid,creater:myuid});
            res.json({error:0})
        })
    },

    getCommentofTimeLine:function (req,res) {
        var {token,timelineuid} = req.body;
        co(function* () {
            var comments = yield mongoClient.find(mongoClient.TABLES.TimeLineComments,{timeline_uid:timelineuid});
            res.json({comments:comments,error:0})
        })
    },

    sendMessage:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    processMessage:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    friendApply:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    attentionPeople:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    deleteAttention:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    deleteFriend:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },
    
    getFriends:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    getAttentions:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    getFans:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    getReceivedMessages:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },
    
    getChatHistory:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    deleteMessage:function (req,res) {
        var {} = req.body;
        co(function* () {

            res.json({error:0})
        })
    },

    getNearbyUsers:function (req,res) {
        var {} = req.body;
        co(function* () {
            var users = yield mongoClient.find(mongoClient.TABLES.Users,{});
            res.json({users:users,error:0})
        })
    }


}