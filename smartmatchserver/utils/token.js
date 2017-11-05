var jwt = require('jsonwebtoken');

exports.createToken = function(uid){
    var token = jwt.sign({uid:uid},"mangguo",{ expiresIn: 24*60*60 })
    return token;
}

exports.verifyToken = function(token){
    try{
        var r = jwt.verify(token,"mangguo")
        return {error:0,uid:r.uid};
    }catch(err){
        console.log(err);
        return {error:1}
    }

}