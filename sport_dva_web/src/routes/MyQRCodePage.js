import React from 'react'
import QRCode from 'qrcode'

export default class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            qrcodeSrc:""
        }
    }
    componentDidMount(){
        QRCode.toDataURL("www.baidu.com",(err,url) => {
            this.setState({qrcodeSrc:url});
        })
    }
    render(){
        return (
            <div><img src={this.state.qrcodeSrc} /></div>
        )
    }
}