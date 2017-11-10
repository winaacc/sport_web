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
var randomword = require('../utils/hanku').randomWord
var httpclient = require('../utils/httpclient')
var facesdk = require('../utils/FacePlusPlus')

var api_key = "-xm4B_VVb9yNX1W3YDYq01QuEt7ilJ6j";
var api_secret = "WNsW3PM5e7AQizRkYg2v2k3q0nArBtao";

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
            //upload.UploadBuffer("grassroot",dataBuffer,"face.jpeg");
            request.post({url:"https://api-cn.faceplusplus.com/facepp/v3/detect",formData:req.body},function(err,httpResponse,body){
                var r = JSON.parse(body);
                console.log(r.faces);
                res.json(body);
            })
        })

        app.get('/getwechatsignature',function(req,res){
            var url = req.query.url;
            console.log("getwechatsignature:url:"+url);
            var config = {
                appId: 'wx6a013f923419dfb4',
                appSecret: 'cb15cc7a2a6edb90cacd35b6ba5ec150',
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

        app.get('/getRandomName',function(req,res){
            var w = randomword();
            var len = w.length;
            var r = Math.random();
            var name = "";
            name += w[Math.floor(len*r)];
            r = Math.random();
            name += w[Math.floor(len*r)];
            r = Math.random();
            name += w[Math.floor(len*r)];
            res.json({name:name})
        })


        app.post('/facelogin',function(req,res){
            co(function*(){
                //去掉data:image/png;base64,或data:image/jpeg;base64,
                if(req.body.image_base64[21] == ','){
                    req.body.image_base64 = req.body.image_base64.substring(22);
                }else{
                    req.body.image_base64 = req.body.image_base64.substring(23);
                }
                //使用express接收POST值后，base64编码字符串中的“+”号被替换成空格了，引起编码出错
                req.body.image_base64 = req.body.image_base64.replace(/\s/g,"+");

                var cityname = req.body.cityName;

                var CityFaceSets = yield mongoClient.find(mongoClient.TABLES.CityFaceSets,{cityname:cityname});
                if(CityFaceSets.length == 0){
                    res.json({error:"没有人脸可以比对"})
                    return;
                }
                console.log(CityFaceSets);
                var faceset_token = CityFaceSets[0].facesets[0].faceset_token;

                var result = yield facesdk.faceLogin(req.body.image_base64,faceset_token);
                res.json({error:null,result:result});
            })
        })

        app.post('/CreateFaceID',function(req,res){
            //去掉data:image/png;base64,或data:image/jpeg;base64,
            if(req.body.image_base64[21] == ','){
                req.body.image_base64 = req.body.image_base64.substring(22);
            }else{
                req.body.image_base64 = req.body.image_base64.substring(23);
            }
            //使用express接收POST值后，base64编码字符串中的“+”号被替换成空格了，引起编码出错
            req.body.image_base64 = req.body.image_base64.replace(/\s/g,"+");

            var dataBuffer = new Buffer(req.body.image_base64, 'base64');
            //上传七牛云

            co(function*(){
                var formdata = {
                    api_key:api_key,
                    api_secret:api_secret,
                    image_base64:req.body.image_base64,
                    return_landmark:2,
                    return_attributes:"gender,age,smiling,headpose,facequality,blur,eyestatus,emotion,ethnicity,beauty,mouthstatus,eyegaze,skinstatus"
                }
                var body = yield facesdk.faceDetect(formdata);
                console.log(body.faces)
                if(body.error_message){
                    res.json({error:"/facepp/v3/detect:"+body.error_message});
                    return;
                }else{
                    if(body.faces.length == 0){
                        res.json({error:"照片没有人脸"});
                        return;
                    }else if(body.faces.length > 1){
                        res.json({error:"识别出的人脸过多，只能有一个"});
                        return;
                    }else{
                        //res.json({error:null,result:body});
                        //return;
                        var Face_token = body.faces[0].face_token;
                        //查询数据库，找到合适的faceset_token,如果没有则创建一个
                        var cityname = req.body.cityName;
                        console.log("cityName:"+cityname);
                        var CityFaceSets_docs = yield mongoClient.find(mongoClient.TABLES.CityFaceSets,{cityname:cityname});
                        console.log(CityFaceSets_docs);
                        var FaceSet_token = "";
                        if(CityFaceSets_docs.length == 0){
                            //创建FaceSet集合
                            var createFaceset_result = yield facesdk.createCityFaceSets(cityname);
                            if(createFaceset_result.error){
                                res.json({error:createFaceset_result.error});
                                return;
                            }else{
                                FaceSet_token = createFaceset_result.result;
                            }
                        }else{
                            //找到第一个没有满的Face Set
                            var arr = CityFaceSets_docs[0].facesets;
                            for(var i=0;i<arr.length;i++){
                                if(arr[i].facecount < 10000){
                                    FaceSet_token = arr[i].faceset_token;
                                    break;
                                }
                            }
                            if(FaceSet_token == ""){
                                //所以的Face Set都满了，需要创建一个
                                var createFaceset_result = yield facesdk.createFaceSet(cityname);
                                if(createFaceset_result.error){
                                    res.json({error:createFaceset_result.error});
                                    return;
                                }else{
                                    FaceSet_token = createFaceset_result.result;
                                }
                            }
                        }

                        //把检测到人脸加入到Face Set中，然后更新数据库
                        var AddFace_result = yield facesdk.addFace(FaceSet_token,Face_token);
                        if(AddFace_result.face_added == 1){
                            //添加成功
                            //上传到七牛云
                            var bucket = "grassroot";
                            var domain = "http://grassroot.qiniudn.com/"
                            var filename = Face_token+".jpeg";
                            var qiniu_upload_result = yield upload.UploadBuffer(bucket,dataBuffer,filename);
                            console.log("qiniu_upload_result:"+JSON.stringify(qiniu_upload_result));
                            //更新CityFaceSets表
                            var CityFaceSets_docs = yield mongoClient.find(mongoClient.TABLES.CityFaceSets,{cityname:cityname});
                            var arr = CityFaceSets_docs[0].facesets;
                            for(var i=0;i<arr.length;i++){
                                if(arr[i].faceset_token == FaceSet_token){
                                    arr[i].facecount++;
                                    break;
                                }
                            }
                            var result = yield mongoClient.updateOne(mongoClient.TABLES.CityFaceSets,{cityname:cityname},{$set:{facesets:CityFaceSets_docs[0].facesets}})

                            //新增FaceInfos
                            var faceinfo = mongoClient.TableDocument(mongoClient.TABLES.FaceInfos);
                            faceinfo.face_token = Face_token;
                            faceinfo.faceset_token = FaceSet_token;
                            faceinfo.image_url = domain+filename;
                            faceinfo.cityname = cityname;
                            faceinfo.face_rectangle = body.faces[0].face_rectangle;
                            faceinfo.landmark = body.faces[0].landmark;
                            faceinfo.attributes = body.faces[0].attributes;
                            yield mongoClient.insert(mongoClient.TABLES.FaceInfos,faceinfo);

                            //查询新增内容
                            var f = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{face_token:Face_token})
                            var c = yield mongoClient.find(mongoClient.TABLES.CityFaceSets,{});
                            res.json({error:null,faceinfo:f,CityFaceSet:c});
                        }else{
                            if(AddFace_result.error_message){
                                res.json({error:"addFace:"+AddFace_result.error_message});
                                return;
                            }else{
                                res.json({error:JSON.stringify(AddFace_result.failure_detail)});
                                return;
                            }
                        }

                    }
                }

            })

        })

        app.post('/getFaceInfo',function(req,res){
            co(function*(){
                var face_token = req.body.face_token;
                var faceinfo = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{face_token:face_token});
                console.log(faceinfo);
                res.json({image_url:faceinfo[0].image_url})
            })
        })

        app.post('/getAllFaceUsers',function (req,res) {
            var cityname = req.body.cityName;
            co(function* () {
                var users = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{cityname:cityname});
                console.log(users);
                res.json(users);
            })
        })

        app.post('/removeFace',function (req,res) {
            var face_token = req.body.face_token;
            co(function* () {
                //判断face_token是否有效
                var faceinfo_arr = yield mongoClient.find(mongoClient.TABLES.FaceInfos,{face_token:face_token});
                if(faceinfo_arr.length == 0){
                    res.json({error:"face_token无效"})
                    return;
                }
                var faceset_token = faceinfo_arr[0].faceset_token;
                var cityname = faceinfo_arr[0].cityname;

                //从face++删除指定的人脸
                var web_result = yield facesdk.faceRemove(faceset_token,face_token);
                if(web_result.error){
                    res.json({error:web_result.error})
                    return;
                }
                //更新CityFaceSets中对应城市的人脸的数量
                var CityFaceSets_docs = yield mongoClient.find(mongoClient.TABLES.CityFaceSets,{cityname:cityname});
                var arr = CityFaceSets_docs[0].facesets;
                for(var i=0;i<arr.length;i++){
                    if(arr[i].faceset_token == faceset_token){
                        arr[i].facecount--;
                        break;
                    }
                }
                var result = yield mongoClient.updateOne(mongoClient.TABLES.CityFaceSets,{cityname:cityname},{$set:{facesets:CityFaceSets_docs[0].facesets}})
                //删除人脸信息
                var result = yield mongoClient.deleteOne(mongoClient.TABLES.FaceInfos,{face_token:face_token})
                res.json({error:null})
            })
        })
	}
}