var request = require('request')
var thunkify = require('thunkify');

function post(url,formData,cb){
    request.post({url:url,formData:formData,json:true},function(err,httpResponse,body){
        cb(err,body);
    })
}

exports.post = thunkify(post);