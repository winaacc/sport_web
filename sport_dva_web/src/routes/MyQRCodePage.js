import React from 'react'
import QRCode from 'qrcode'
import {
    Flex
} from 'antd-mobile'

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
        QRCode.toDataURL("faceid:1e7797e9ee2ae509c9287466b045fbf5",(err,url) => {
            this.setState({qrcodeSrc:url});
        })
    }
    render(){
        return (
            <Flex justify="center">
            <div style={{position:'relative',marginTop:100}}>
                <img src={this.state.qrcodeSrc} width="300" />
                <img src="https://gss1.bdstatic.com/9vo3dSag_xI4khGkpoWK1HF6hhy/baike/w%3D268%3Bg%3D0/sign=528d74efde62853592e0d527a8d411fb/8718367adab44aede7aeb0f9b81c8701a08bfbcf.jpg"
                     width={50} height={50}
                     style={{position:'absolute', top:125,left:125,borderRadius:10,border:"3px solid white"}} /></div>
            </Flex>
        )
    }
}