var qinu = require('qiniu');

var accessKey = 'j0ixUR2P9W8ur9HfQn5nKuuLZ1gaXMxXFC_uPcg5'
var secretKey = 'tmPRafEh_TC7e35Ogs-mi7D-Q0CrkUZwdNZSfO3j'

exports.getUploadToken = function(bucket){
    var mac = new qinu.auth.digest.Mac(accessKey,secretKey);
    var options = {
        scope:bucket
    }
    var putPolicy = new qinu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
}