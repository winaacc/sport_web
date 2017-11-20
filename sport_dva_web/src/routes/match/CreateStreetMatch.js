import React from 'react'
import {
    List,
    Picker,
    Toast
} from 'antd-mobile'

const seasons = [
    [
        {
            label: '2013',
            value: '2013',
        },
        {
            label: '2014',
            value: '2014',
        },
    ],
    [
        {
            label: '春',
            value: '春',
        },
        {
            label: '夏',
            value: '夏',
        },
    ],
];

const playerNums = [

        {label:'3人',value:3},
        {label:'4人',value:4},
        {label:'5人',value:5}

]

export default class App extends React.Component{
    static navConfig = {
        title:"创建野球赛"
    }
    constructor(props){
        super(props);
        this.state = {
            seasonValue:["2013","春"],
            playerNumber:[3]
        }
    }
    render(){
        return (
            <div>
                <List>
                    <Picker
                        data={seasons}
                        title="选择季节"
                        cascade={false}
                        extra="请选择(可选)"
                        value={this.state.seasonValue}
                        onChange={v=>{Toast.info(JSON.stringify(v));this.setState({seasonValue:v})}}
                    >
                        <List.Item arrow="horizontal">季节</List.Item>
                    </Picker>
                    <Picker
                        data={playerNums}
                        title="选择人数"
                        cols={1}
                        extra="请选择(可选)"
                        value={this.state.playerNumber}
                        onChange={v=>{this.setState({playerNumber:v})}}
                    >
                        <List.Item arrow="horizontal">人数</List.Item>
                    </Picker>
                </List>
            </div>
        )
    }
}