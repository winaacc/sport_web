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
    Modal
} from 'antd-mobile'
import styles from './IndexPage.css';
import Example from "../components/Example";

import iScroll from 'iscroll/build/iscroll-probe';

const tabs = [
    { title: '比赛' },
    { title: '球队' },
    { title: '附近' },
];

var turnplate={
    restaraunts:[],				//大转盘奖品名称
    colors:[],					//大转盘奖品区块对应背景颜色
    outsideRadius:192,			//大转盘外圆的半径
    textRadius:155,				//大转盘奖品位置距离圆心的距离
    insideRadius:68,			//大转盘内圆的半径
    startAngle:0,				//开始角度

    bRotate:false				//false:停止;ture:旋转
};

//动态添加大转盘的奖品与奖品区域背景颜色
turnplate.restaraunts = ["50M免费流量包", "10闪币", "谢谢参与", "5闪币", "10M免费流量包", "20M免费流量包", "20闪币 ", "30M免费流量包", "100M免费流量包", "2闪币"];
turnplate.colors = ["#FFF4D6", "#FFFFFF", "#FFF4D6", "#FFFFFF","#FFF4D6", "#FFFFFF", "#FFF4D6", "#FFFFFF","#FFF4D6", "#FFFFFF"];

var shanimage = null;
var sorryimage = null;
function drawRouletteWheel() {
    var canvas = document.getElementById("wheelcanvas");
    if (canvas.getContext) {
        //根据奖品个数计算圆周角度
        var arc = Math.PI / (turnplate.restaraunts.length/2);
        var ctx = canvas.getContext("2d");
        //在给定矩形内清空一个矩形
        ctx.clearRect(0,0,422,422);
        //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
        ctx.strokeStyle = "#FFBE04";
        //font 属性设置或返回画布上文本内容的当前字体属性
        ctx.font = '16px Microsoft YaHei';
        for(var i = 0; i < turnplate.restaraunts.length; i++) {
            var angle = turnplate.startAngle + i * arc;
            ctx.fillStyle = turnplate.colors[i];
            ctx.beginPath();
            //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
            ctx.arc(211, 211, turnplate.outsideRadius, angle, angle + arc, false);
            ctx.arc(211, 211, turnplate.insideRadius, angle + arc, angle, true);
            ctx.stroke();
            ctx.fill();
            //锁画布(为了保存之前的画布状态)
            ctx.save();

            //----绘制奖品开始----
            ctx.fillStyle = "#E5302F";
            var text = turnplate.restaraunts[i];
            var line_height = 17;
            //translate方法重新映射画布上的 (0,0) 位置
            ctx.translate(211 + Math.cos(angle + arc / 2) * turnplate.textRadius, 211 + Math.sin(angle + arc / 2) * turnplate.textRadius);

            //rotate方法旋转当前的绘图
            ctx.rotate(angle + arc / 2 + Math.PI / 2);

            /** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) **/
            if(text.indexOf("M")>0){//流量包
                var texts = text.split("M");
                for(var j = 0; j<texts.length; j++){
                    ctx.font = j == 0?'bold 20px Microsoft YaHei':'16px Microsoft YaHei';
                    if(j == 0){
                        ctx.fillText(texts[j]+"M", -ctx.measureText(texts[j]+"M").width / 2, j * line_height);
                    }else{
                        ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                    }
                }
            }else if(text.indexOf("M") == -1 && text.length>6){//奖品名称长度超过一定范围
                text = text.substring(0,6)+"||"+text.substring(6);
                var texts = text.split("||");
                for(var j = 0; j<texts.length; j++){
                    ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                }
            }else{
                //在画布上绘制填色的文本。文本的默认颜色是黑色
                //measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
                ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            }

            //添加对应图标
            if(text.indexOf("闪币")>0){
                ctx.drawImage(shanimage,-15,10);
            }else if(text.indexOf("谢谢参与")>=0){
                ctx.drawImage(sorryimage,-15,10);
            }
            //把当前画布返回（调整）到上一个save()状态之前
            ctx.restore();
            //----绘制奖品结束----
        }
    }
}

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
        var imagecount = 0;
        shanimage = new Image();
        shanimage.src = require('../assets/1.png');
        shanimage.onload=function(){
            imagecount++;
            if(imagecount == 2){
                drawRouletteWheel();
            }
        };
        sorryimage= new Image();
        sorryimage.src = require('../assets/2.png');
        sorryimage.onload=function(){
            imagecount++;
            if(imagecount == 2){
                drawRouletteWheel();
            }
        };

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
                                                总决赛 <List.Item.Brief>进行中</List.Item.Brief>
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
                            <canvas id="wheelcanvas" width="422px" height="422px" style={{width:300,height:300}}></canvas>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: this.state.tabHeight, backgroundColor: '#fff' }}>
                            Content of third tab
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
