module.exports.randArray = function(arr){
    if(arr.sort && arr.length>0){
        arr.sort(function(){
            return Math.random()>0.5?-1:1;
        })
        return arr[0];
    }else{
        throw "randArray:params error"
    }
}

//产生6位数随机数
module.exports.randsix = function(){
    var arr = [0,1,2,3,4,5,6,7,8,9];
    this.randArray(arr);
    for(var i=0;i<4;i++){
        arr.pop();
    }
    return arr.join('');
}

//随机整数
module.exports.GetRandomNum = function(Min,Max)
{
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}