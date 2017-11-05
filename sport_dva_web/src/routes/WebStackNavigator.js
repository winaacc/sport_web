import React from 'react'
import PropTypes from 'prop-types';
import {
    Button,
    Toast,
    NavBar,
    Icon,
    SegmentedControl,
    Popover
} from 'antd-mobile'
import {CSSTransitionGroup} from 'react-transition-group'

var styles = {
    wrapper:{
        width:'100%',
        height:'100%',
        overflow:"hidden",
        position:'relative',
    },
    page:{
        width:'100%',
        height:'100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor:'#ccc'
    },
    subpage:{
        width:'100%',
        height:'100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor:'#ccc',
        zIndex:1000,
    }
}

const myImg = src => <img src={`https://gw.alipayobjects.com/zos/rmsportal/${src}.svg`} className="am-icon am-icon-xs" alt="" />;

 export  default class WebStackNavigator extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            stack:[],
            navigation:{
                routeName:"",
                params:{}
            },
            visible: false,
            selected: '',
        }
    }

    componentDidMount(){
        console.log(`WebStackNavigator:${this.props.path}`)
        if(this.props.path){
            if(this.props.Pages[this.props.path]){
                this.navigate(this.props.path);
            }
        }else{
            var r = localStorage.getItem("navigation");
            if(r){
                var navInfo = JSON.parse(r);
                this.setState({stack:navInfo.stack});
                this.setState({navigation:navInfo.navigation})
            }
        }
    }

    static propTypes = {
        /*
        * {
            index: { screen: HomeScreen },
            Chat: { screen: ChatScreen },
          }
        * */
        Pages:PropTypes.object,
        Config:PropTypes.object,
    }

    static defaultProps = {
        Pages:{},
        Config:{}
    }

    navigate = (routeName)=>{
        var stack = this.state.stack;
        stack.push(routeName);
        var navigation = this.state.navigation;
        navigation.routeName = routeName;
        this.setState({stack});
        this.setState({navigation});
        console.log(this.state);
        localStorage.setItem("navigation",JSON.stringify(this.state));

    }

    goBack = ()=>{
        if(this.state.stack.length == 0){
            return;
        }
        var stack = this.state.stack;
        stack.pop();
        this.setState({stack});
        localStorage.setItem("navigation",JSON.stringify(this.state));
    }

    reset = ()=>{

    }

     onSelect = (opt) => {
         // console.log(opt.props.value);
         this.setState({
             visible: false,
             selected: opt.props.value,
         });
     };
     handleVisibleChange = (visible) => {
         this.setState({
             visible,
         });
     };
    render(){
        var self = this;
        //设置导航信息
        var navigation = {};
        navigation.routeName = this.state.navigation.routeName;
        navigation.params = this.state.navigation.params;
        navigation.navigate = this.navigate;
        navigation.goBack = this.goBack;
        //设置首页
        var IndexPage = this.props.Pages['index'].screen;
        var items = this.state.stack.map(function(item,index){
            var Page = self.props.Pages[item].screen;
            return <div key={index} style={styles.subpage}>
                <NavBar
                    mode="dark"
                    leftContent="Back"
                    onLeftClick={self.goBack}
                    rightContent={[
                        <Icon key="0" type="search" style={{ marginRight: '16px' }} />,
                        <Icon key="1" type="ellipsis" />,
                    ]}
                >{Page.navConfig?Page.navConfig.title?Page.navConfig.title:"":""}</NavBar>
                <Page navigation={navigation} />
            </div>
        })
        return (
            <div style={styles.wrapper}>
                <div style={styles.page}>
                    <NavBar
                        mode="dark"
                        leftContent={<Icon key="1" type="ellipsis" />}
                        rightContent={
                            <Popover mask
                                     overlayClassName="fortest"
                                     overlayStyle={{ color: 'currentColor' }}
                                     visible={this.state.visible}
                                     overlay={[
                                         (<Popover.Item key="4" value="scan" icon={myImg('tOtXhkIWzwotgGSeptou')} data-seed="logId">Scan</Popover.Item>),
                                         (<Popover.Item key="5" value="special" icon={myImg('PKAgAqZWJVNwKsAJSmXd')} style={{ whiteSpace: 'nowrap' }}>My Qrcode</Popover.Item>),
                                         (<Popover.Item key="6" value="button ct" icon={myImg('uQIYTFeRrjPELImDRrPt')}>
                                             <span style={{ marginRight: 5 }}>Help</span>
                                         </Popover.Item>),
                                     ]}
                                     align={{
                                         overflow: { adjustY: 0, adjustX: 0 },
                                         offset: [-10, 0],
                                     }}
                                     onVisibleChange={this.handleVisibleChange}
                                     onSelect={this.onSelect}
                            >
                                <div style={{
                                    height: '100%',
                                    padding: '0 15px',
                                    marginRight: '-15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <Icon type="ellipsis" />
                                </div>
                            </Popover>
                        }
                    >{IndexPage.navConfig?IndexPage.navConfig.title?IndexPage.navConfig.title:"":""}</NavBar>
                    <IndexPage navigation={navigation} />
                </div>
                <CSSTransitionGroup
                    transitionName="slideleft"
                    transitionEnter={true}
                    transitionLeave={true}
                    transitionEnterTimeout={400}
                    transitionLeaveTimeout={400}
                >
                {items}
                </CSSTransitionGroup>
            </div>
        )
    }
}
