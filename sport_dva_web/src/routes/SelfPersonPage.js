import React from 'react'
import {
    Flex,
    List,
    Button,
    WhiteSpace
} from 'antd-mobile'

export default class App extends React.Component{
    static navConfig = {
        title:'我'
    }
    constructor(props){
        super(props);
        this.state = {
            headerImage:""
        }
    }
    render(){
        return (
            <div>
                <Flex justify="center" style={{height:200,backgroundColor:'#00ffcc'}}>
                    <img src={this.state.headerImage} style={{height:100,width:100,border:'3px solid #fff',borderRadius:'50%'}} />
                </Flex>
                <List>
                    <List.Item arrow="horizontal">基本资料</List.Item>
                    <List.Item arrow="horizontal">消息</List.Item>
                    <List.Item arrow="horizontal">设置</List.Item>
                </List>
                <WhiteSpace/>
                <Button>退出账号</Button>
            </div>
        )
    }

}