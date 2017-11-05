import React from 'react'
import ReactDOM from 'react-dom'
import {
    WhiteSpace,
    WingBlank,
    Button,
    Toast
} from 'antd-mobile'
import fetch from 'dva/fetch';

var domain = "http://grassroot.qiniudn.com/"
export default class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            token:'',
            filename:""
        }
    }

    componentDidMount(){

    }

    readFile = async ()=>{
        var response = await fetch("http://192.168.0.105:3000/getUploadToken?bucket=grassroot")
        var token = await response.text();
        this.setState({token})
        console.log(token);
        var filename = Math.random().toString(36).substr(2) + Date.now();
        this.setState({filename})
    }

    upload = async ()=>{
        var f = new FormData(document.getElementById("testform"));

        var $selectedFile = $('.selected-file');
        var $progress = $(".progress");
        var $uploadedResult = $('.uploaded-result');

        $.ajax({
            url: 'http://upload.qiniu.com/',  // Different bucket zone has different upload url, you can get right url by the browser error massage when uploading a file with wrong upload url.
            type: 'POST',
            data: f,
            processData: false,
            contentType: false,
            xhr: function(){
                var myXhr = $.ajaxSettings.xhr();
                console.log("myXhr:"+myXhr);
                if(myXhr.upload){
                    myXhr.upload.addEventListener('progress',function(e) {
                        // console.log(e);
                        if (e.lengthComputable) {
                            var percent = e.loaded/e.total*100;
                            $progress.html('上传：' + e.loaded + "/" + e.total+" bytes. " + percent.toFixed(2) + "%");
                        }
                    }, false);
                }
                return myXhr;
            },
            success: function(res) {
                console.log("成功：" + JSON.stringify(res));
                var str = '<span>已上传：' + res.key + '</span>';
                str += '<img height="50px" src="' + domain + res.key + '"/>';

                $uploadedResult.html(str);
            },
            error: function(res) {
                console.log("失败:" +  JSON.stringify(res));
                $uploadedResult.html('上传失败：' + res.responseText);
            }
        });
    }

    render(){
        return (
        <div>
            <WingBlank>
            <form id="testform" method="post" encType="multipart/form-data">
                <input name="key" id="key" type="hidden" value={this.state.filename} />
                <input name="token" type="hidden" value={this.state.token} />
                <input onChange={this.readFile} id="userfile" name="file" type="file" />
                <input name="accept" type="hidden" />
            </form>
            <label id="uploadFile" htmlFor="userfile">
                <span></span>
                <em>添加文件</em>
            </label>
            <div className="selected-file"></div>
            <div className="progress"></div>
            <div className="uploaded-result"></div>
            <WhiteSpace/>
            <Button onClick={this.upload}>上传</Button>
            </WingBlank>
        </div>
        )
    }
}