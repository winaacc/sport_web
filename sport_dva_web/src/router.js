import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute, Link } from 'dva/router';
import IndexPage from './routes/IndexPage';
import CountPage from './routes/CountPage'
import RefreshListView from './routes/RefreshListView'
import FootballCourt from './routes/FootballCourt'
import FootballCourtPortrait from './routes/FootballCourtPortrait'
import basketballCourtPortrait from './routes/basketballCourtPortrait'
import ShortVideoPage from './routes/ShortVideoPage'
import CreateFaceID from './routes/CreateFaceID'
import UploadFilePage from './routes/UploadFilePage'
import MyQRCodePage from './routes/MyQRCodePage'
import BaiduMap from './routes/BaiduMap'
import LotteryTurntable from './routes/LotteryTurntable'
import FaceIDLogin from './routes/FaceIDLogin'
import FaceUsers from './routes/FaceUsers'
import SelfPersonPage from './routes/SelfPersonPage'
import ShareUrlQrcode from './routes/ShareUrlQrcode'
import  ShareGongzhongQrcode from './routes/ShareGongzhongQrcode'
import OtherPersonPage from './routes/OtherPersonPage'
import SocketIOPage from './routes/SocketIOPage'
import CreateStreetMatch from './routes/match/CreateStreetMatch'
import SearchMatchResult from './routes/match/SearchMatchResult'
import bindcellphone from './routes/auth/bindcellphone'
import smscode from './routes/auth/smscode'
import bindresult from './routes/auth/bindresult'
import CreateTempTeam from './routes/match/CreateTempTeam'

import {
    Button,
    Toast,
    NavBar,
    Icon
} from 'antd-mobile'
import WebStackNavigator from './routes/WebStackNavigator'

class HomeScreen extends React.Component{
    constructor(props){
        super(props);
    }
    gotoChat=()=>{
        //Toast.info(JSON.stringify(this.props.navigation));
        this.props.navigation.navigate("Chat")
    }
    render(){
        return (
            <div>
                <Button onClick={this.gotoChat}>聊天2</Button>
            </div>
        )
    }
}

class ChatScreen extends React.Component{
    goBack = ()=>{
        //this.props.navigation.goBack();
        window.history.back();
    }
    goPerson = ()=>{
        this.props.navigation.navigate("PersonInfo")
    }
    render(){
        return (
            <div>
                <Button onClick={this.goBack}>返回</Button>
                <Button onClick={this.goPerson}>个人信息2</Button>
            </div>
        )
    }
}

class PersonInfo extends React.Component{
    goBack = ()=>{
        this.props.navigation.goBack();
    }
    render(){
        return (
            <div>
                <Button onClick={this.goBack}>返回</Button>
                <div>篮球肥肉2</div>
            </div>
        )
    }
}

var pages = {
    index: { screen: IndexPage },
    Chat: { screen: ChatScreen },
    PersonInfo:{screen:PersonInfo},
    count:{screen:CountPage},
    RefreshListView:{screen:RefreshListView},
    FootballCourt:{screen:FootballCourt},
    FootballCourtPortrait:{screen:FootballCourtPortrait},
    basketballCourtPortrait:{screen:basketballCourtPortrait},
    ShortVideoPage:{screen:ShortVideoPage},
    CreateFaceID:{screen:CreateFaceID},
    UploadFilePage:{screen:UploadFilePage},
    MyQRCodePage:{screen:MyQRCodePage},
    BaiduMap:{screen:BaiduMap},
    LotteryTurntable:{screen:LotteryTurntable},
    FaceIDLogin:{screen:FaceIDLogin},
    FaceUsers:{screen:FaceUsers},
    SelfPersonPage:{screen:SelfPersonPage},
    ShareUrlQrcode:{screen:ShareUrlQrcode},
    ShareGongzhongQrcode:{screen:ShareGongzhongQrcode},
    OtherPersonPage:{screen:OtherPersonPage},
    SocketIOPage:{screen:SocketIOPage},
    CreateStreetMatch:{screen:CreateStreetMatch},
    SearchMatchResult:{screen:SearchMatchResult},
    bindcellphone:{screen:bindcellphone},
    smscode:{screen:smscode},
    bindresult:{screen:bindresult},
    CreateTempTeam:{screen:CreateTempTeam},
}

var Main = (params)=>{
    var path = params.routeParams.path;
    if(path){
        path = path.substring(1);
    }
    return <WebStackNavigator path={path} Pages={pages}  />
}

export default function({ history }) {
  return (
    <Router history={history}>
        <Route exact path="/" component={Main} />
        <Route path="/:path" component={Main} />
        <Route path="/chat/mangguo" component={ChatScreen}/>
    </Router>
  );
};
