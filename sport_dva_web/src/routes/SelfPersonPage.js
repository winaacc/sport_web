import React from 'react'
import {connect} from 'dva'
import {
    Flex,
    List,
    Button,
    WhiteSpace
} from 'antd-mobile'

@connect(({faceinfo}) => ({faceinfo}))
export default class App extends React.Component{
    static navConfig = {
        title:'我'
    }
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div>
                <Flex justify="center" direction="column" style={{height:200,backgroundColor:'#00ffcc'}}>
                    <div><img src={this.props.faceinfo.image_url} style={{height:100,width:100,border:'3px solid #fff',borderRadius:'50%'}} /></div>
                    <WhiteSpace/>
                    {this.props.faceinfo.nickname?this.props.faceinfo.nickname:<Button size="small" type="ghost" >添加昵称</Button>}
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