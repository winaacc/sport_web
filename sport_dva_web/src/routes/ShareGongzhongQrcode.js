import React from 'react'
import {
    Flex
} from 'antd-mobile'

export default class App extends React.Component{
    static navConfig = {
        title:"扫码关注公众号",
    }
    render(){
        return (
            <Flex justify="center" style={{marginTop:50}}>
                <img src={require('../assets/qrcode_for_gongzhonghao.jpg')} />
            </Flex>
        )
    }
}