import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Link,browserHistory } from 'dva/router';
import {
    Button,
    Toast,
    SegmentedControl,
    Grid,
    Tabs,
    Card,
    WingBlank,
    WhiteSpace,
    SearchBar,
    List,
    Modal,
    Badge,
    NoticeBar,
    Flex
} from 'antd-mobile'
const operation = Modal.operation;
const Item = List.Item;
const Brief = Item.Brief;
import styles from './IndexPage.css';
import Example from "../components/Example";

import iScroll from 'iscroll/build/iscroll-probe';
import WebStackNavigator from "./WebStackNavigator";

import {post} from '../utils/request'

const tabs = [
    { title: '比赛' },
    { title: '球队' },
    { title: '附近' },
];

@connect(
    ({faceinfo}) => ({faceinfo})
    )
class IndexPage extends Component{
    static navConfig = {
        title:"首页",
    }

    constructor(props){
        super(props);
        this.state = {
            tabContainerHeight:300,
            tabHeight:250,
            modelVisible:false
        }
    }
    gotoChat = ()=>{
        this.props.navigation.navigate("count")
        Toast.info(window.devicePixelRatio)
        //browserHistory.push("custom/users")
        //window.location.reload();
    }
    componentDidMount(){
        //设置tab选项高度
        //设置容器高度
        var t = document.getElementById("tabContainer");
        const tabContainerHeight = document.documentElement.clientHeight - t.offsetTop;
        this.setState({tabContainerHeight});

        var t = document.getElementById("tab_item1");
        const tabHeight = document.documentElement.clientHeight - t.offsetTop;
        this.setState({tabHeight});

        Modal.alert('登录', '是否绑定手机号', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '绑定', onPress: () => {this.props.navigation.navigate("bindcellphone")} },
        ]);

    }
    showModal = (e)=>{
        e.preventDefault();
        this.setState({modelVisible:true})
    }
    onClose = ()=>{
        this.setState({modelVisible:false})
    }
    render(){
        return (
                <div className={styles.normal}>
                    <NoticeBar mode="link" action={<span>点击查看</span>}>
                        最新消息
                    </NoticeBar>
                    <div id="tabContainer" style={{height:this.state.tabContainerHeight}}>
                    <Tabs tabs={tabs}
                          initalPage={'t2'}
                    >
                        <div id="tab_item1" style={{ height: this.state.tabHeight, backgroundColor: '#eee' }}>
                            <WingBlank size="lg">
                                <WhiteSpace size="xs" />
                                {this.props.faceinfo.face_token?<List>
                                    <List.Item
                                        style={{height:80}}
                                        extra={<Badge text={2} overflowCount={99} />}
                                        arrow="horizontal"
                                        onClick={() => {this.props.navigation.navigate("SelfPersonPage")}}
                                    >
                                        <img style={{
                                            height:50,
                                            width:40,
                                            borderRadius:10,
                                            border:'1px solid #ccc',
                                            marginRight:10
                                        }} src={this.props.faceinfo.image_url} />
                                        个人主页
                                    </List.Item>
                                </List>:<Button onClick={
                                    ()=>{this.props.navigation.navigate("FaceIDLogin")}
                                }>登录</Button>}
                                <WhiteSpace size="xs"/>
                                <Card>
                                    <Card.Header
                                        title="你的比赛"
                                        thumb={require("../assets/1.png")}
                                        extra={<Button onClick={() => operation([
                                            { text: '野球赛', onPress: () => {
                                                this.props.navigation.navigate("CreateStreetMatch")
                                            } },
                                            { text: '热身赛', onPress: () => console.log('置顶聊天被点击了') },
                                            { text: '技巧赛', onPress: () => console.log('置顶聊天被点击了') },
                                            { text: '1VS1挑战赛', onPress: () => console.log('置顶聊天被点击了') },
                                        ])} type="primary" size="small" inline>创建比赛</Button>}
                                    />
                                    <Card.Body>
                                        <SearchBar onSubmit={async(val)=>{
                                            var result = await post("/getMatchDetailByShowId",{showid:parseInt(val)})
                                            if(!result.matchinfo){
                                                Toast.info("ID无效",1)
                                                return;
                                            }
                                            this.props.navigation.navigate("SearchMatchResult",{data:val})
                                        }} placeholder="比赛，用户，球队ID或名称" maxLength={8} />
                                        <Flex style={{height:100,borderBottom:'1px solid #ccc',paddingBottom:10}}>
                                            <Flex.Item style={{textAlign:'center'}}>
                                                <img src={require("../assets/teamlogo/Blazers.png")} />
                                                <div>开拓者</div>
                                            </Flex.Item>
                                            <Flex.Item style={{textAlign:'center',height:100}}>
                                                <Flex direction="column" justify="center" style={{height:100}}>
                                                    <div style={{marginBottom:5,fontSize:22,fontWeight:"bold"}}>20 - 10</div>
                                                    <div style={{marginBottom:10,fontSize:12}}>第一节</div>
                                                    <Button onClick={this.showModal} type="primary" size="small" inline>进行中</Button>
                                                </Flex>

                                            </Flex.Item>
                                            <Flex.Item style={{textAlign:'center'}}>
                                                <img src={require("../assets/teamlogo/net.png")} />
                                                <div>篮网</div>
                                            </Flex.Item>
                                        </Flex>
                                    </Card.Body>
                                    <Card.Footer content="" extra={<div>更多</div>} />
                                </Card>
                                <WhiteSpace size="lg" />
                            </WingBlank>
                        </div>
                        <div style={{height: this.state.tabHeight, backgroundColor: '#fff' }}>
                            <Button onClick={this.gotoChat}>聊天6</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("RefreshListView")}}>可刷新列表</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("FootballCourtPortrait")}}>足球场</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("basketballCourtPortrait")}}>篮球场</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("ShortVideoPage")}}>短视频</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("CreateFaceID")}}>创建Face ID</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("UploadFilePage")}}>上传文件</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("MyQRCodePage")}}>我的二维码</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("BaiduMap")}}>百度地图</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("LotteryTurntable")}}>抽奖转盘</Button>
                            <Button onClick={()=>{this.props.navigation.navigate("FaceIDLogin")}}>人脸登录</Button>
                        </div>
                        <div style={{height: this.state.tabHeight, backgroundColor: '#ccc' }}>
                            <WingBlank>
                                <WhiteSpace/>
                                <Button onClick={()=>{this.props.navigation.navigate("FaceUsers")}}>本市所有用户</Button>
                                <Button onClick={()=>{this.props.navigation.navigate("SocketIOPage")}}>Socket.IO</Button>
                                <Button onClick={()=>{
                                    var size = 0;
                                    for(var item in window.localStorage) {
                                                 if(window.localStorage.hasOwnProperty(item)) {
                                                         size += window.localStorage.getItem(item).length;
                                                     }
                                             }
                                    Toast.info('当前localStorage使用量为' + (size / 1024).toFixed(2) + 'KB');
                                }}>localstorage占用空间</Button>
                            </WingBlank>
                        </div>
                    </Tabs>
                    </div>
                </div>
        );
    }
}

IndexPage.propTypes = {
};

export default connect()(IndexPage);
