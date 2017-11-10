var qiniu = require('qiniu');
var thunkify = require('thunkify');

var accessKey = 'j0ixUR2P9W8ur9HfQn5nKuuLZ1gaXMxXFC_uPcg5'
var secretKey = 'tmPRafEh_TC7e35Ogs-mi7D-Q0CrkUZwdNZSfO3j'

function getUploadToken(bucket){
    var mac = new qiniu.auth.digest.Mac(accessKey,secretKey);
    var options = {
        scope:bucket
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
}

exports.getUploadToken = getUploadToken;

function UploadBuffer(bucket,buffer,filename,cb){
    var token = getUploadToken(bucket);
    var config = new qiniu.conf.Config();
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    formUploader.put(token,filename,buffer,putExtra,function(respErr,
                                                             respBody, respInfo){
        if (respErr) {
            throw respErr;
        }
        if (respInfo.statusCode == 200) {
            console.log(respBody);
        } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
        }
        cb(respErr,respBody);
    })
}

exports.UploadBuffer = thunkify(UploadBuffer);