var httpclient = require('../utils/httpclient')
var co = require('co');
var mongoClient = require("../db/mongoClient")

var api_key = "-xm4B_VVb9yNX1W3YDYq01QuEt7ilJ6j";
var api_secret = "WNsW3PM5e7AQizRkYg2v2k3q0nArBtao";

module.exports = {
    createCityFaceSets : function(cityname){
        return co(function*(){
            var FaceSet_Create_Request_Params = {
                api_key:api_key,
                api_secret:api_secret,
                display_name:cityname
            }
            var FaceSet_Create_Body = yield httpclient.post("https://api-cn.faceplusplus.com/facepp/v3/faceset/create",FaceSet_Create_Request_Params);
            if(FaceSet_Create_Body.error_message){
                return {error:"faceset/create:"+FaceSet_Create_Body.error_message};
            }else {
                var FaceSet_token = FaceSet_Create_Body.faceset_token;
                //把新建的CityFaceSets保存到数据库
                var doc = mongoClient.TableDocument(mongoClient.TABLES.CityFaceSets);
                doc.cityname = cityname;
                var subdoc = {
                    faceset_token: FaceSet_token,
                    facecount: 0,
                }
                doc.facesets.push(subdoc);
                var result = yield mongoClient.insert(mongoClient.TABLES.CityFaceSets, doc);
                return {error:null,result:FaceSet_token};
            }
        }).then(function(value){
            return value;
        },function(err){
            console.error(err);
        })
    },
    createFaceSet:function(cityname){
        return co(function* () {
            var FaceSet_Create_Request_Params = {
                api_key:api_key,
                api_secret:api_secret,
                display_name:cityname
            }
            var FaceSet_Create_Body = yield httpclient.post("https://api-cn.faceplusplus.com/facepp/v3/faceset/create",FaceSet_Create_Request_Params);
            if(FaceSet_Create_Body.error_message){
                return {error:"faceset/create:"+FaceSet_Create_Body.error_message};
            }else {
                var FaceSet_token = FaceSet_Create_Body.faceset_token;
                var CityFaceSets_docs = yield mongoClient.find(mongoClient.TABLES.CityFaceSets,{cityname:cityname});
                if(CityFaceSets_docs.length > 0){
                    var subdoc = {
                        faceset_token: FaceSet_token,
                        facecount: 0,
                    }
                    CityFaceSets_docs[0].facesets.push(subdoc);
                    var result = mongoClient.updateOne(mongoClient.TABLES.CityFaceSets,{cityname:cityname},{$set:{facesets:CityFaceSets_docs[0].facesets}})
                    return {error:null,result:FaceSet_token};
                }else{
                    return {error:"faceset/create:"+"调用API错误，该城市没有创建CityFaceSets"};
                }

            }
        }).then(function (value) {
            return value;
        },function (err) {
            console.error(err);
        })
    },
    faceDetect:function (data) {
        return co(function*(){
            var body = yield httpclient.post("https://api-cn.faceplusplus.com/facepp/v3/detect",data)
            return body;
        }).then(function(value){
            return value;
        },function (err) {
            console.error(err);
        })
    },
    addFace:function (faceset_token,face_tokens) {
        return co(function*(){
            var data = {
                api_key:api_key,
                api_secret:api_secret,
                faceset_token:faceset_token,
                face_tokens:face_tokens
            }
            var body = yield httpclient.post("https://api-cn.faceplusplus.com/facepp/v3/faceset/addface",data)
            return body;

        }).then(function (value) {
            return value;
        },function(err){
            console.error(err);
        })
    },
    faceLogin:function(image_base64,faceset_token){
        return co(function*(){
            var data = {
                api_key:api_key,
                api_secret:api_secret,
                image_base64:image_base64,
                faceset_token:faceset_token
            }
            var body = yield httpclient.post("https://api-cn.faceplusplus.com/facepp/v3/search",data);
            return body;
        }).then(function (value) {
            return value;
        },function (err) {
            console.error(err);
        })
    },
    faceRemove:function (faceset_token,face_token) {
        return co(function* () {
            var data = {
                api_key:api_key,
                api_secret:api_secret,
                faceset_token:faceset_token,
                face_tokens:face_token
            }
            var body = yield httpclient.post("https://api-cn.faceplusplus.com/facepp/v3/faceset/removeface",data);
            if(body.error_message){
                return {error:body.error_message}
            }
            if(body.face_removed == 0){
                return {error:JSON.stringify(body.failure_detail)}
            }
            return {error:null,count:body.face_removed}
        }).then(function (value) {
            return value;
        },function (err) {
            console.error(err);
        })
    }
}