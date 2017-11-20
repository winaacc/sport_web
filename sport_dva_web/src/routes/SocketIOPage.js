import React from 'react'
import io from 'socket.io-client'

export default class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            message:""
        }
    }

    componentDidMount(){
        var socket = io("http://192.168.0.105",{
            //transports: ['websocket'],
        });
    }

    render(){
        return (
            <div>
                {this.state.message}
            </div>
        )
    }
}