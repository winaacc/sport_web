import React from 'react'
import ReactDOM from 'react-dom'
import {
    Flex,
    Toast,
    Button,
    InputItem,
    List,
    WingBlank,
    WhiteSpace,
    ImagePicker
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

export default class App extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            fileSize : 0,
            imageSrc:"http://k2.jsqq.net/uploads/allimg/1706/7_170629152344_5.jpg",
            pickfiles : []
        }
        this.readFileResult = null;
        this.uploadFileResult = null;
        this.chooseImage = null;
    }

    componentDidMount(){

    }

    componentWillMount(){

    }

    readFile = ()=>{
        //console.log("readFile")
        var self = this;
        var files = ReactDOM.findDOMNode(this.inputFile).files;
        var Orientation = null;
        if(files.length > 0){
            //console.log(files[0]);
            var reader = new FileReader();
            Toast.loading("加载中...")
            reader.readAsDataURL(files[0]);
            reader.addEventListener('load',()=>{
                //this.setState({fileSize:files[0].size})
                //this.setState({imageSrc:reader.result})
                //console.log(reader.result);
                this.readFileResult = reader.result;
                //获得图片实际宽高
                this.chooseImage = new Image();
                this.chooseImage.src = this.readFileResult;
                this.chooseImage.onload = () => {
                    //Toast.hide();
                    //Toast.info("width:"+t.width+",height:"+t.height);
                    EXIF.getData(files[0],function () {
                        Orientation = EXIF.getTag(this, 'Orientation');
                        //Toast.info("Orientation:"+Orientation);
                        self.createUploadImage(self.chooseImage,Orientation);
                    })

                }
            })
        }

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
            api_key:"-xm4B_VVb9yNX1W3YDYq01QuEt7ilJ6j",
            api_secret:"WNsW3PM5e7AQizRkYg2v2k3q0nArBtao",
            //image_url:"http://k2.jsqq.net/uploads/allimg/1706/7_170629152344_5.jpg",
            image_base64:this.uploadFileResult
        }
        Toast.loading("脸部识别中...")
        var result = await request("/facedetect",{
            method:'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded'
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body) //`api_key=${body.api_key}&api_secret=${body.api_secret}&image_base64=${body.image_base64}`
        })
        var json = JSON.parse(result.data);
        console.log(json);
        if(json.error_message){
            Toast.info("产生错误："+json.error_message);
        }else{
            if(json.faces.length > 0){
                Toast.info("识别成功")
                /*Toast.info("开始绘制canvas")
                //绘制脸部方框
                var offscreenCanvas = document.createElement('canvas');
                var offscreenContext = offscreenCanvas.getContext('2d');
                var image = new Image();
                image.src = this.uploadFileResult;
                image.onload = () => {
                    offscreenCanvas.width = image.width;
                    offscreenCanvas.height = image.height;
                    offscreenContext.drawImage(image,0,0);
                    offscreenContext.lineWidth = 5;
                    offscreenContext.strokeStyle = "blue"
                    for(var i=0;i<json.faces.length;i++){
                        var face = json.faces[i].face_rectangle;
                        offscreenContext.strokeRect(face.left,face.top,face.width,face.height);
                    }
                    this.setState({imageSrc:offscreenCanvas.toDataURL()})
                    Toast.hide();
                }*/
            }else {
                //Toast.hide();
                Toast.info("没有识别出人脸")
            }
        }

    }

    render(){
        return (
            <Flex style={{height:"100%"}} direction="column">
                <WingBlank>
                    {false?<div><div>{parseInt(this.state.fileSize/1024)+"k"}</div>
                <img src={this.state.imageSrc} style={{border:'1px solid #eee',borderRadius:"10px",margin:"auto"}} height="100"></img>
                <label style={{
                    height:50,
                    textAlign:'center',
                    lineHeight:"50px",
                    backgroundColor:'#3399ff',
                    border:"1px solid #ccc",
                    borderRadius:'5px'
                }} htmlFor="photo">选择自拍头像</label>
                <input onChange={this.readFile} ref={el=>this.inputFile=el} style={{position:"absolute",clip:"rect(0,0,0,0)"}} type="file" id="photo" accept="image/*" />
                    </div> :<List renderHeader={() => '选择自拍照'}><List.Item><ImagePicker
                        files={this.state.pickfiles}
                        onChange={this.readFile2}
                        onImageClick={(index, fs) => console.log(index, fs)}
                        selectable={this.state.pickfiles.length < 1}
                    />
                    </List.Item>
                    </List>}
                    <WhiteSpace/>
                    {/*<img src={this.state.imageSrc} style={{border:'1px solid #eee',borderRadius:"10px",margin:"auto"}} height="100"></img>*/}
                    <WhiteSpace/>
                    <List>
                    <InputItem
                        type="phone"
                        placeholder="手机号码"
                    >手机号码</InputItem>

                    <Flex>
                        <div>
                            <InputItem
                                placeholder="输入验证码"
                            ></InputItem>
                        </div>
                        <div>
                            <Button type="primary" size="small" style={{width:100,marginRight:30}}>获得验证码</Button>
                        </div>
                    </Flex>
                        <Flex>
                            <div>
                                <InputItem
                                    placeholder="输入昵称"
                                ></InputItem>
                            </div>
                            <div>
                                <Button type="primary" size="small" style={{width:100,marginRight:30}}>随机昵称</Button>
                            </div>
                        </Flex>

                </List>
                    <WhiteSpace/>
                    <Button type="primary" onClick={this.createFaceID}>创建FaceID</Button>
                </WingBlank>
            </Flex>
        )
    }
}
