import React from 'react'
import {
    Flex
} from 'antd-mobile'

export default class App extends React.Component{
    static navConfig = {
        title:"扫码网址",
    }
    render(){
        return (
            <Flex justify="center" style={{marginTop:50}}>
                <img src={require('../assets/qrcode_for_url.png')} />
            </Flex>
            )
    }
}