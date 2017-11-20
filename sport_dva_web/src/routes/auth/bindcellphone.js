import React from 'react'
import {
    List,
    Button,
    InputItem,
    WhiteSpace,
    Modal
} from 'antd-mobile'

export default class App extends React.Component{
    static navConfig = {
        title:"绑定手机号"
    }
    constructor(props){
        super(props);
        this.state = {
            cellnumber:""
        }
    }

    render(){
        return (
            <div>
                <WhiteSpace/>
                <List>
                    <InputItem
                        placeholder="手机号码"
                        type="phone" onChange={(val)=>this.setState({cellnumber:val})} value={this.state.cellnumber}></InputItem>
                </List>
                <WhiteSpace/>
                <Button onClick={()=>{
                    Modal.alert('', '我们将发送验证码短信到这个号码：'+this.state.cellnumber, [
                        { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
                        { text: '好', onPress: () => {
                            var phonenumber = this.state.cellnumber.replace(/\s/g,'');
                            this.props.navigation.navigate("smscode",{phonenumber:phonenumber})
                        } },
                    ]);
                }} type="primary">下一步</Button>
            </div>
        )
    }
}