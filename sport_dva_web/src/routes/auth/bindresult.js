import React from 'react'
import {
    Result,
    Button,
    WhiteSpace,
    Icon
} from 'antd-mobile'

export default class App extends React.Component{
    render(){
        return (
            <div>
                <Result
                    img={<Icon type="check-circle" style={{width:60,height:60, fill: '#1F90E6' }} />}
                    title="绑定成功"
                    message="恭喜，您可以使用高级功能了"
                />
                <WhiteSpace/>
                <Button onClick={()=>{
                    this.props.navigation.goBack();
                    this.props.navigation.goBack();
                    this.props.navigation.goBack();
                }}>完成</Button>

            </div>
        )
    }
}