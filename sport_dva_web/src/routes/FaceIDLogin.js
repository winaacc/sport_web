import React from 'react'
import {connect} from 'dva'
import {
    ImagePicker,
    List,
    WhiteSpace,
    Button,
    WingBlank,
    Toast,
    NavBar,
    Icon
} from 'antd-mobile'
import request from "../utils/request"
import browser from '../utils/browser'

function rotateImg(img, direction,canvas) {
    //最小与最大旋转方向，图片旋转4次后回到原方向
    var min_step = 0;
    var max_step = 3;

    if (img == null)return;
    //img的高度和宽度不能在img元素隐藏后获取，否则会出错
    var height = img.height;
    var width = img.width;

    var step = 2;
    if (step == null) {
        step = min_step;
    }
    if (direction == 'right') {
        step++;
        //旋转到原位置，即超过最大值
        step > max_step && (step = min_step);
    } else {
        step--;
        step < min_step && (step = max_step);
    }

    //旋转角度以弧度值为参数
    var degree = step * 90 * Math.PI / 180;
    var ctx = canvas.getContext('2d');
    switch (step) {
        case 0:
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            break;
        case 1:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, 0, -height);
            break;
        case 2:
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, -height);
            break;
        case 3:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, 0);
            break;
    }
}

@connect()
export default class App extends React.Component{
    static navConfig = {
        notitle:true
    }
    constructor(props){
        super(props);
        this.state = {
            pickfiles : [],
            cityName: "未知",
            faceImage:""
        }
        this.readFileResult = null;
        this.uploadFileResult = null;
        this.chooseImage = null;
    }

    componentDidMount(){
        this.getLocalCity();
    }

    getLocalCity = ()=>{
        var self = this;
        function myFun(result){
            var cityName = result.name;
            //Toast.info(cityName);
            self.setState({cityName});
        }
        var myCity = new BMap.LocalCity();
        myCity.get(myFun);
    }

    readFile2 = (files, type, index)=>{
        if(files.length == 0){
            this.setState({pickfiles:files})
            return;
        }
        var reader = new FileReader();
        Toast.loading("加载中...")
        console.log(files[0].file)
        reader.readAsDataURL(files[0].file);
        reader.addEventListener('load',()=>{
            this.readFileResult = reader.result;
            //获得图片实际宽高
            this.chooseImage = new Image();
            this.chooseImage.src = this.readFileResult;
            this.chooseImage.onload = () => {
                this.createUploadImage(this.chooseImage,files[0].orientation);
                this.setState({pickfiles:files})
            }
        })
    }

    createUploadImage = (image,orientation)=>{
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image,0,0);
        if(browser.versions.ios){
            if(orientation != 1){
                switch (orientation){
                    case 6://需要顺时针（向左）90度旋转;
                        rotateImg(image,'left',canvas);
                        break;
                    case 8://需要逆时针（向右）90度旋转
                        rotateImg(image,'right',canvas);
                        break;
                    case 3://需要180度旋转
                        rotateImg(image,'right',canvas);//转两次
                        rotateImg(image,'right',canvas);
                        break;
                }
            }
            this.uploadFileResult = canvas.toDataURL("image/jpeg", 0.8);
        }else{
            this.uploadFileResult = canvas.toDataURL("image/jpeg", 0.8);
        }

        this.setState({fileSize:this.uploadFileResult.length})
        this.setState({imageSrc:this.uploadFileResult})
        Toast.hide();
    }

    createFaceID = async ()=>{
        if(!this.chooseImage){
            Toast.info("没有选择图片")
            return;
        }
        var body = {
            image_base64:this.uploadFileResult,
            cityName:this.state.cityName
        }
        Toast.loading("脸部对比中...")
        var result = await request("/facelogin",{
            method:'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded'
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body) //`api_key=${body.api_key}&api_secret=${body.api_secret}&image_base64=${body.image_base64}`
        })
        console.log(result);
        if(result.data.result.error_message){
            Toast.info(result.data.result.error_message);
            return;
        }
        var confidence = result.data.result.results[0].confidence;
        //Toast.info(confidence);
        var thresholds = result.data.result.thresholds;
        if(confidence <= 80 /*thresholds["1e-5"]*/){
            Toast.info("登录失败")
            return;
        }else{
            Toast.info("登录成功",1)
        }
        var face_token = result.data.result.results[0].face_token;
        var result = await request("/getFaceInfo",{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({face_token:face_token})
        })
        console.log(result);
        var url = result.data.image_url;
        this.setState({faceImage:url});
        this.props.dispatch({type:'faceinfo/login',data:result.data});
        this.props.navigation.goBack();

    }

    render(){
        return (<div>
                <NavBar
                    mode="dark"
                    leftContent="Back"
                    onLeftClick={()=>{this.props.navigation.goBack()}}
                    rightContent={[
                        <Button key="0" size="small" onClick={
                            ()=>{this.props.navigation.navigate("CreateFaceID")}
                        }>注册</Button>,
                    ]}
                >人脸登录</NavBar>
            <WingBlank>
                <List renderHeader={() => '选择自拍照'}><List.Item><ImagePicker
                    files={this.state.pickfiles}
                    onChange={this.readFile2}
                    onImageClick={(index, fs) => console.log(index, fs)}
                    selectable={this.state.pickfiles.length < 1}
                />
                </List.Item>
                </List>
                <WhiteSpace/>
                <Button type="primary" onClick={this.createFaceID}>登录</Button>
                <img height={100} src={this.state.faceImage} />
            </WingBlank>
            </div>
            )
    }
}