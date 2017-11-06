var mongoClient = require("../db/mongoClient")
var co = require('co');
var thunkify = require('thunkify');
var random = require('../utils/random')
var UCPaas = require('ucpaas');
var createToken = require("../utils/token").createToken;
var verifyToken = require("../utils/token").verifyToken;
var upload = require('../utils/uploadQiniu')
var request = require('request')
var fs = require('fs')
var signature = require('wx_jsapi_sign')

module.exports = {
	init:function(app){
		app.get("/login",function(req,res){
		    console.log(req.query);
            var {phonenumber,password} = req.query;
            var result = {
                error:0,
                token:""
            }
            co(function* (){
                var userdoc = yield mongoClient.find(mongoClient.TABLES.Users,{phonenumber:phonenumber})
                if(userdoc.length == 0){
                    result.error = 1;
                    res.end(JSON.stringify(result));
                    return;
                }else{
                    var p = userdoc[0].password;
                    if(p != password){
                        result.error = 2;
                        res.end(JSON.stringify(result));
                        return;
                    }else{
                        var uid = userdoc[0].uid;
                        var t = createToken(uid);
                        result.token = t;
                        res.end(JSON.stringify(result));
                        return;
                    }
                }
            })
		})

        app.get('/getUserInfo',function(req,res){
            console.log(req.query);
            var {token} = req.query;
            var result = {
                error:0,
                data:{}
            }
            var decoded = verifyToken(token);
            if(decoded.error){
                //token过期
                result.error = 1;
                res.end(JSON.stringify(result))
            }else{
                var uid = decoded.uid;
                co(function* () {
                    var userdoc = yield mongoClient.find(mongoClient.TABLES.Users,{uid:uid});
                    result.data = userdoc[0];
                    res.end(JSON.stringify(result))
                })
            }
        })

		app.post('/register',function(req,res){
            co(function* (){
                var  {phoneValue,smscode,password,confirmPassword,nickname,sex} = req.body;
                var result = {
                    error:0,
                    data:""
                }

                var doc = yield mongoClient.find(mongoClient.TABLES.Users,{phonenumber:phoneValue});
                if(doc.length>0){
                    result.error = "电话号码已存在"
                    res.end(JSON.stringify(result))
                    return;
                }

                //输入数据格式判断
                if(phoneValue.length != 11){
                    result.error = "手机号码格式错误"
                    res.end(JSON.stringify(result))
                    return;
                }

                var doc = yield mongoClient.find(mongoClient.TABLES.SmsCode,{phonenumber:phoneValue});
                if(doc.length == 0){
                    result.error = "没有生成验证码"
                    res.end(JSON.stringify(result))
                    return;
                }

                if(doc[0].code != smscode){
                    result.error = "验证码错误"
                    res.end(JSON.stringify(result))
                    return;
                }

                if(password.length < 8){
                    result.error = "密码太短"
                    res.end(JSON.stringify(result))
                    return;
                }

                if(password != confirmPassword){
                    result.error = "两次密码填写不一致"
                    res.end(JSON.stringify(result))
                    return;
                }

                if(nickname.length == 0){
                    result.error = "昵称不能为空"
                    res.end(JSON.stringify(result))
                    return;
                }

                var doc = yield mongoClient.find(mongoClient.TABLES.Users,{nickname:nickname});
                if(doc.length>0){
                    result.error = "昵称已经存在"
                    res.end(JSON.stringify(result))
                    return;
                }

                //验证通过，生成新的用户
                var maxuid = yield mongoClient.getUserUniqueID();
                console.log("maxuid",maxuid);
                var newuser = mongoClient.TableDocument(mongoClient.TABLES.Users);
                newuser.uid = maxuid;
                newuser.phonenumber = phoneValue;
                newuser.password = password;
                newuser.nickname = nickname;
                newuser.sex = sex[0];

                yield mongoClient.insert(mongoClient.TABLES.Users,newuser);

                res.end(JSON.stringify(result))
            })
		})

        app.get('/getAllUsers',function(req,res){
            co(function* (){
                var docs = yield mongoClient.find(mongoClient.TABLES.Users,{});
                res.end(JSON.stringify(docs));
            })
        })

        app.get("/isNicknameExist",function(req,res){
            co(function* (){
                var result = {exist:false}
                var doc = yield mongoClient.find(mongoClient.TABLES.Users,{nickname:req.query.nickname});
                if(doc.length>0){
                    result.exist = true;
                    res.end(JSON.stringify(result))
                }else{
                    res.end(JSON.stringify(result))
                }
            })
        })

		app.post('/sendSmsCode',function(req,res){
			co(function* (){
                var phonenumber = req.body.phonenumber;
                var vertify = random.randsix();
                var doc = mongoClient.TableDocument(mongoClient.TABLES.SmsCode);
                doc.phonenumber = phonenumber;
                doc.code = vertify;
                yield mongoClient.findOneAndReplace(mongoClient.TABLES.SmsCode,{phonenumber:phonenumber},doc);
                var ucpaas = UCPaas({
                    'accountSid': 'a1b499f9b13db8b5cfe960b8d43d8505',
                    'token': 'd33fbfd123ca731747140d02258210ba',
                    'appId': '410718db05114d9ab4dd043ada6ab989'
                });
                var result = yield ucpaas.sms({
                    "param": "珊瑚体育," + vertify + ",3",
                    "templateId": "9974",
                    "to": phonenumber
                });
                console.log("result:",result);
                res.end(JSON.stringify(result));
			})
		})

        app.get('/getSmsCode',function(req,res){
            co(function* (){
                console.log(req.query);
                var phonenumber = req.query.phonenumber;
                var doc = yield mongoClient.find(mongoClient.TABLES.SmsCode,{phonenumber:phonenumber});
                var result = {};
                if(doc.length == 0){
                    result.isEmpty = true;
                }else{
                    result.code = doc[0].code;
                }
                res.end(JSON.stringify(result))
            })
        })

        app.get("/removeSmsCode",function(req,res){
            co(function* (){
                yield mongoClient.deleteMany(mongoClient.TABLES.SmsCode,{});
                var result = yield mongoClient.find(mongoClient.TABLES.SmsCode,{});
                res.end(JSON.stringify(result));
            })
        })

        app.get("/getUploadToken",function(req,res){
            var bucket = req.query.bucket;
            var token = upload.getUploadToken(bucket);
            console.log("getUploadToken:"+token);
            res.end(token);
        })

        app.get("/geofind",function(req,res){
            co(function* (){
                var result = yield mongoClient.find("testgeo",{area:{$geoIntersects:
                    {
                        $geometry:{
                            "type" : "Point",
                            "coordinates" : [113.33831,23.137335] }
                    }
                }})
                res.end(JSON.stringify(result));
            })
        })

        app.get("/insertgeodata",function(req,res){
            var data = [
                {"address" : "南京 浦口公园","loc" : { "type": "Point", "coordinates": [118.639523,32.070078]}},
                {"address" : "南京 火车站","loc" : { "type": "Point", "coordinates": [118.803032,32.09248]}},
                {"address" : "南京 新街口","loc" : { "type": "Point", "coordinates": [118.790611,32.047616]}},
                {"address" : "南京 张府园","loc" : { "type": "Point", "coordinates": [118.790427,32.03722]}},
                {"address" : "南京 三山街","loc" : { "type": "Point", "coordinates": [118.788135,32.029064]}},
                {"address" : "南京 中华门","loc" : { "type": "Point", "coordinates": [118.781161,32.013023]}},
                {"address" : "南京 安德门","loc" : { "type": "Point", "coordinates": [118.768964,31.99646]}}
            ]

            var basketballcourt = {name:"laker",area:{
                type:"Polygon",
                coordinates:[[
                    [113.314882,23.163055],
                    [113.355845,23.167042],
                    [113.370289,23.149564],
                    [113.356779,23.129758],
                    [113.338238,23.13913],
                    [113.330979,23.124706],
                    [113.313588,23.140858],
                    [113.323865,23.158204],
                    [113.314882,23.163055],
                ]]
            },location:{type:"Point",coordinates:[118.639523,32.070078]}}

            co(function* () {
                yield mongoClient.insert("testgeo",basketballcourt);
                yield mongoClient.createIndex("testgeo",{area: "2dsphere"});
                yield mongoClient.createIndex("testgeo",{location: "2dsphere"});
                var docs = yield mongoClient.find("testgeo",{});
                var indexes = yield mongoClient.indexes("testgeo");
                var result = {docs:docs,indexes:indexes};
                res.end(JSON.stringify(result));
            })

        })

        app.post("/facedetect",function(req,res){
            //去掉data:image/png;base64,或data:image/jpeg;base64,
            if(req.body.image_base64[21] == ','){
                req.body.image_base64 = req.body.image_base64.substring(22);
            }else{
                req.body.image_base64 = req.body.image_base64.substring(23);
            }
            //使用express接收POST值后，base64编码字符串中的“+”号被替换成空格了，引起编码出错
            req.body.image_base64 = req.body.image_base64.replace(/\s/g,"+");

            var dataBuffer = new Buffer(req.body.image_base64, 'base64');
            fs.writeFile("out.jpeg", dataBuffer, function(err) {
                if(err){
                    console.log(err);
                }else{
                    console.log("保存成功！");
                }
            });

            //console.log(req.body);
            request.post({url:"https://api-cn.faceplusplus.com/facepp/v3/detect",formData:req.body},function(err,httpResponse,body){
                //console.log(body);
                //console.log(httpResponse);
                //console.log(err);
                res.end(JSON.stringify(body));
            })
        })

        app.get('/getwechatsignature',function(req,res){
            var url = req.query.url;
            console.log("getwechatsignature:url:"+url);
            var config = {
                appId: 'wx6a013f923419dfb4',
                appSecret: 'wx6a013f923419dfb4',
                appToken: 'SHANG',
                cache_json_file:'/tmp'
            }
            signature.getSignature(config)(url, function(error, result) {
                console.log("error:"+error);
                console.log("result:"+JSON.stringify(result));
                if (error) {
                    res.json({
                        'error': error
                    });
                } else {
                    res.json(result);
                }
            });
        })
	}
}