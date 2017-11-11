import React from 'react'
import {connect} from 'dva'
import {
    Flex,
    List,
    Button,
    WhiteSpace,
    Toast
} from 'antd-mobile'

export default class App extends React.Component{
    static navConfig = {
        title:'其他人'
    }
    constructor(props){
        super(props);
    }

    componentDidMount(){
        var params = this.props.navigation.params;
        Toast.info(JSON.stringify(params));
    }

    render(){
        return (
            <div>
                <Flex justify="center" style={{height:200,backgroundColor:'#00ffcc'}}>
                    <img src="" style={{height:100,width:100,border:'3px solid #fff',borderRadius:'50%'}} />
                </Flex>
                <List>
                    <List.Item arrow="horizontal">基本资料</List.Item>
                </List>
                <WhiteSpace/>
                <Button>加为好友</Button>
                <Button>邀请加入球队</Button>
                <Button>邀请参加比赛</Button>
            </div>
        )
    }

}