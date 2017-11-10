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
    NoticeBar
} from 'antd-mobile'
const Item = List.Item;
const Brief = Item.Brief;
import styles from './IndexPage.css';
import Example from "../components/Example";

import iScroll from 'iscroll/build/iscroll-probe';
import WebStackNavigator from "./WebStackNavigator";

const tabs = [
    { title: '比赛' },
    { title: '球队' },
    { title: '附近' },
];

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
                    <div id="tabContainer" style={{height:this.state.tabContainerHeight}}>
                        <NoticeBar mode="link" action={<span>点击查看</span>}>
                            最新消息
                        </NoticeBar>
                    <Tabs tabs={tabs}
                          initalPage={'t2'}
                    >
                        <div id="tab_item1" style={{ height: this.state.tabHeight, backgroundColor: '#eee' }}>
                            <WingBlank size="lg">
                                <WhiteSpace size="lg" />
                                <Modal
                                    visible={this.state.modelVisible}
                                    transparent={true}
                                    maskClosable={true}
                                    onClose={this.onClose}
                                    title="Title"
                                    footer={[{ text: 'Ok', onPress: () => { console.log('ok'); this.onClose(); } }]}
                                >
                                    <div style={{ height: 100, overflow: 'scroll' }}>
                                        scoll content...<br />
                                        scoll content...<br />
                                        scoll content...<br />
                                        scoll content...<br />
                                        scoll content...<br />
                                        scoll content...<br />
                                    </div>
                                </Modal>
                                <List>
                                    <List.Item
                                        thumb=""
                                        extra={<Badge text={2} overflowCount={99} />}
                                        arrow="horizontal"
                                        onClick={() => {this.props.navigation.navigate("SelfPersonPage")}}
                                    >
                                        个人主页
                                    </List.Item>
                                </List>
                                <WhiteSpace/>
                                <Card>
                                    <Card.Header
                                        title="你的比赛"
                                        thumb={require("../assets/1.png")}
                                        extra={<Button onClick={this.showModal} type="primary" size="small" inline>创建比赛</Button>}
                                    />
                                    <Card.Body>
                                        <SearchBar onSubmit={(val)=>{Toast.info(val)}} placeholder="比赛，用户，球队ID或名称" maxLength={8} />
                                        <List renderHeader={() => ''}>
                                            <List.Item extra="预约" arrow="horizontal" onClick={() => {}}>投篮比赛</List.Item>
                                            <List.Item arrow="horizontal" onClick={() => {}} thumb="https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png" multipleLine>
                                                总决赛
                                            </List.Item>
                                        </List>
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
