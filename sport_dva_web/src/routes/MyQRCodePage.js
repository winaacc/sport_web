import React from 'react'
import {connect} from 'dva'
import QRCode from 'qrcode'
import {
    Flex,
    Button
} from 'antd-mobile'

@connect(({faceinfo}) => ({faceinfo}))
export default class App extends React.Component{
    static navConfig = {
        title:"我的二维码",
    }
    constructor(props){
        super(props);
        this.state = {
            qrcodeSrc:""
        }
    }
    componentDidMount(){
        var data = "faceid:"+this.props.faceinfo.face_token;
        QRCode.toDataURL(data,(err,url) => {
            this.setState({qrcodeSrc:url});
        })
    }
    render(){
        return (
            <Flex justify="center">
            <div style={{position:'relative',marginTop:100}}>
                {this.props.faceinfo.face_token?<div>
                <img src={this.state.qrcodeSrc} width="300" />
                <img src={this.props.faceinfo.image_url}
                     width={50} height={50}
                     style={{position:'absolute', top:125,left:125,borderRadius:10,border:"3px solid white"}} />
                </div>:<div><div>登录后才能显示二维码</div><Button onClick={()=>{this.props.navigation.navigate("FaceIDLogin")}} size="small">登录</Button></div>}
            </div>
            </Flex>
        )
    }
}