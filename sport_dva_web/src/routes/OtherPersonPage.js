import React from 'react'
import {connect} from 'dva'
import {
    Flex,
    List,
    Button,
    WhiteSpace,
    Toast
} from 'antd-mobile'
import request from "../utils/request"

export default class App extends React.Component{
    static navConfig = {
        title:'其他人'
    }
    constructor(props){
        super(props);
        this.state = {
            headImage:""
        }
    }

    componentDidMount(){
        var params = this.props.navigation.params;
        Toast.info(JSON.stringify(params));
        var arr = params.data.split(':');
        if(arr[0] == 'faceid'){
            var face_token = arr[1];
            //获得该用户基本信息
            this.getUserInfo(face_token);
        }
    }

    getUserInfo = async (face_token) => {
        var result = await request("/getFaceInfo",{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({face_token:face_token})
        })
        console.log(result);
        var url = result.data.image_url;
        this.setState({headImage:url})
    }

    render(){
        return (
            <div>
                <Flex justify="center" style={{height:200,backgroundColor:'#00ffcc'}}>
                    <img src={this.state.headImage} style={{height:100,width:100,border:'3px solid #fff',borderRadius:'50%'}} />
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