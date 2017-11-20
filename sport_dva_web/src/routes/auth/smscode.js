import React from 'react'
import {
    List,
    InputItem,
    Button,
    Flex,
    WhiteSpace
} from 'antd-mobile'

export default class App extends React.Component{
    static navConfig = {
        title:"输入验证码"
    }
    constructor(props){
        super(props);
        this.state = {
            smscode:"",
            buttonsecond:"30秒",
            disabled:true
        }
        this.timer = null
    }

    timecount = ()=>{
        this.setState({disabled:true})
        var total = 30;
        this.timer = setInterval(()=>{
            total--;
            this.setState({buttonsecond:total+"秒"})
            if(total == 0){
                clearInterval(this.timer);
                this.setState({buttonsecond:"获得验证码",disabled:false})

            }
        },1000)
    }

    componentDidMount(){
        console.log(this.props.navigation.params.phonenumber);
        this.timecount();
    }

    render(){
        return (
            <div>
                <WhiteSpace/>
                <list>
                    <List.Item>
                    <Flex>
                        <Flex.Item><InputItem
                            onChange={(val)=>{this.setState({smscode:val})}}
                            type="number" value={this.state.smscode} placeholder="输入验证码" /></Flex.Item>

                            <Button
                                onClick={()=>{this.timecount()}}
                            disabled={this.state.disabled}
                            style={{width:100}}
                            size="small"
                            type="ghost">{this.state.buttonsecond}
                            </Button>

                    </Flex>
                    </List.Item>
                </list>
                <WhiteSpace/>
                <Button onClick={()=>{
                    this.props.navigation.navigate("bindresult")
                }}>下一步</Button>
            </div>
        )
    }
}