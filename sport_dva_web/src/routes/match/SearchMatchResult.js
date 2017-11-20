import React from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'dva'
import {
    List,
    Toast,
    ActivityIndicator,
    Flex,
    Button,
    WhiteSpace,
    PullToRefresh,
    Modal,
    Grid,
    Accordion,
    Badge,
    Steps,
    WingBlank
} from 'antd-mobile'
import {post} from '../../utils/request'
import type2text from '../../utils/Type2Text'
const createAction = type => payload => ({type,payload})

@connect(({faceinfo}) => ({faceinfo}))
export default class App extends React.Component{
    static navConfig={
        title:"比赛详情"
    }
    constructor(props){
        super(props);
        this.state = {
            isloaded:false,
            matchinfo:{},
            headerimage:null,
            refreshing:false,
            height:document.documentElement.clientHeight,
            down: true,
            players:[],
            showid:null,
        }
    }

    load = async()=>{
        var showid = parseInt(this.props.navigation.params.data);
        var result = await post("/getMatchDetailByShowId",{showid:showid})
        var headerimage = await post("/getUserHeaderImage",{uid:result.matchinfo.total.create_useruid})
        var players = await post("/getPlayersOfStreetMatch",{showid:showid});
        console.log("players:",players);
        var temp_players = [];
        for(var i=0;i<players.players.length;i++){

                temp_players.push({icon:players.players[i].image,text:players.players[i].nickname})

        }
        this.setState({
            matchinfo:result.matchinfo,
            isloaded:true,
            headerimage:headerimage.headerimage,
            players:temp_players,
            showid:showid
        })
    }

    joinmatch = async()=>{
        if(!this.props.faceinfo.face_token){
            this.props.navigation.navigate("FaceIDLogin")
            return;
        }
        if(!this.props.faceinfo.nickname){
            Modal.prompt('名字', '请输入您的名字',
                [
                    { text: '取消' },
                    {
                        text: '下一步',
                        onPress: async(value) => {
                            if(value.length == 0){
                                Toast.info("名字不能为空")
                                return;
                            }
                            var result = await post("/updateNickNameOfFaceInfo",{nickname:value,face_token:this.props.faceinfo.face_token})
                            if(result.error){
                                Toast.info(result.errorinfo);
                            }else{
                                this.props.dispatch(createAction('faceinfo/updatenickname')({nickname:result.nickname}))
                            }
                        },
                    },
                ], 'default', null, ['你的昵称'])
        }else{
            Modal.alert(this.props.faceinfo.nickname, '是否加入比赛？', [
                { text: 'Cancel', onPress: () => console.log('cancel') },
                { text: 'Ok', onPress: async() => {

                    var result = await post("/joinmatch",{face_token:this.props.faceinfo.face_token,showid:this.state.showid})
                    if(result.error){
                        Toast.info(result.errorinfo);
                    }else{
                        this.load();
                    }
                } },
            ])
        }

    }

    componentDidMount(){
        this.load();
        setTimeout(()=>{
            const hei = document.documentElement.clientHeight - ReactDOM.findDOMNode(this.ptr).offsetTop;
            //Toast.info(document.documentElement.clientHeight)
            this.setState({
                height: hei,
            })
        },300)
    }

    render(){
        if(this.state.isloaded){
            var matchid = "比赛ID：" + this.state.matchinfo.total.match_showid;
            var creater = "创建者：" + this.state.matchinfo.total.create_useruid;
            var cityname = "所在城市：" + this.state.matchinfo.total.city_name;
            var createdate = "创建日期：" + new Date(this.state.matchinfo.total.createtime).toLocaleDateString();
            var createtime = "创建时间：" + new Date(this.state.matchinfo.total.createtime).toLocaleTimeString();
            var sporttype = this.state.matchinfo.total.sport_type;
        }
        return (
            <PullToRefresh
                ref={el => this.ptr = el}
                style={{
                    height: this.state.height,
                    overflow: 'auto',
                }}
                indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
                direction={this.state.down ? 'down' : 'up'}
                refreshing={this.state.refreshing}
                onRefresh={() => {
                    this.setState({ refreshing: true });
                    setTimeout(() => {
                        this.setState({ refreshing: false });
                    }, 1000);
                }}
            >
                {this.state.isloaded?<div>
                    <Steps style={{backgroundColor:'white',paddingTop:10}} current={0} direction="horizontal">
                        <Steps.Step key={1} status="process" title={"进行中"} description={"邀请球员"}></Steps.Step>
                        <Steps.Step key={2} status="wait" title={"等待"} description={"组队"}></Steps.Step>
                        <Steps.Step key={3} status="wait" title={"等待"} description={"比赛"}></Steps.Step>
                    </Steps>
                    <WhiteSpace/>
                    <WingBlank>
                    <Flex>
                        <Flex.Item><Button size="small" type="primary">二维码</Button></Flex.Item>
                        <Flex.Item><Button size="small" type="primary">组队</Button></Flex.Item>
                        <Flex.Item><Button size="small" type="primary">开始比赛</Button></Flex.Item>
                    </Flex>
                    </WingBlank>
                    <WhiteSpace/>
                    <Accordion defaultActiveKey="1">
                        <Accordion.Panel header="球员列表">
                            <Flex justify="center" wrap="wrap">
                            {
                                this.state.players.map(function (item,index) {
                                    return <div style={{textAlign:'center',height:100,width:80,paddingTop:20}} key={index}>
                                        <Badge text={index+""}><img src={item.icon}
                                     style={{
                                         width:44,
                                         height:44
                                     }} /></Badge>
                                        <div>{item.text}</div>
                                        <Button style={{marginLeft:5,marginRight:5,marginTop:5}} size="small" type="ghost">删除</Button>
                                    </div>
                                })
                            }
                            </Flex>
                        </Accordion.Panel>
                        <Accordion.Panel header="基本信息">
                            <List renderHeader={()=>"基本信息"}>
                                <List.Item>
                                    <Flex>
                                        <div>{matchid}</div>
                                        <Button style={{marginLeft:10}} size="small" type="ghost">关注</Button>
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>{creater}</div>
                                        <img src={this.state.headerimage}
                                             style={{marginLeft:10,width:32,height:32,borderRadius:16,borderWidth:2,borderColor:'#ccc'}} />
                                        <Button style={{marginLeft:10}} size="small" type="ghost">加为好友</Button>
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>{type2text.getSportType(sporttype)}</div>
                                        <img src={type2text.getSportImage(sporttype)}
                                             style={{marginLeft:10,width:22,height:22}} />
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>{cityname}</div>
                                        <img src={require("../../assets/location.png")}
                                             style={{marginLeft:10,width:22,height:22}} />
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>{createdate}</div>
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>{createtime}</div>
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>{type2text.getMatchType(this.state.matchinfo.total.match_type)}</div>
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>{type2text.getMatchState(this.state.matchinfo.total.match_state)}</div>
                                        <Button
                                            onClick={this.joinmatch}
                                            style={{marginLeft:20}} size="small" type="ghost">加入比赛</Button>
                                    </Flex>
                                </List.Item>
                            </List>
                        </Accordion.Panel>
                        <Accordion.Panel header="比赛规则">
                            <List renderHeader={()=>"比赛规则"}>
                                <List.Item>
                                    <Flex>
                                        <div>首发：{this.state.matchinfo.detail.match_rule.startup_num}</div>
                                    </Flex>
                                </List.Item>
                                <List.Item>
                                    <Flex>
                                        <div>赢球方式：{type2text.getHowWinType(this.state.matchinfo.detail.match_rule.howwin)}</div>
                                    </Flex>
                                </List.Item>
                                {this.state.matchinfo.detail.match_rule.howwin == 2?<List.Item>
                                    <Flex>
                                        <div>单节时间：{this.state.matchinfo.detail.match_rule.sectiontime}分钟</div>
                                    </Flex>
                                </List.Item>:null}
                                {this.state.matchinfo.detail.match_rule.howwin == 2?<List.Item>
                                    <Flex>
                                        <div>分几节：{this.state.matchinfo.detail.match_rule.sectionnum}节</div>
                                    </Flex>
                                </List.Item>:null}
                                {this.state.matchinfo.detail.match_rule.howwin == 1?<List.Item>
                                    <Flex>
                                        <div>分制：{this.state.matchinfo.detail.match_rule.pointwin}分</div>
                                    </Flex>
                                </List.Item>:null}
                                <List.Item>
                                    <Flex>
                                        <div>场地：{type2text.getCourtType(this.state.matchinfo.detail.match_rule.courttype)}</div>
                                    </Flex>
                                </List.Item>
                            </List>
                        </Accordion.Panel>
                    </Accordion>
                </div>:<ActivityIndicator
                    text="Loading..."
                />
                }
            </PullToRefresh>
        )
    }
}