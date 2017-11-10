function is_weixin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
}
if(is_weixin()){
    console.log("wechat browser")
    $.getJSON('/getwechatsignature?url=' + encodeURIComponent(location.href.split('#')[0]), function (res) {
        wx.config({
            beta: true,
            debug: false,
            appId: res.appId,
            timestamp: res.timestamp,
            nonceStr: res.nonceStr,
            signature: res.signature,
            jsApiList: [
                "scanQRCode",
                "openLocation",
                "getLocation"
            ]
        });
        wx.ready(function () {
            wx.checkJsApi({
                jsApiList: ['scanQRCode',"openLocation",
                    "getLocation"], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                success: function(res) {
                    console.log(res);
                }
            });
        });
        wx.error(function(res){
            console.log(res);
        })
    });
}