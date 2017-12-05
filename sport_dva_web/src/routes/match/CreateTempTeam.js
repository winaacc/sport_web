import React from 'react'
import {
    Button
} from 'antd-mobile'
import {post} from '../../utils/request'

export default class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            logo:"",
            change_face:""
        }
    }

    componentDidMount(){

    }

    changeFace = ()=>{
        var myface = "http://grassroot.qiniudn.com/1e7797e9ee2ae509c9287466b045fbf5.jpeg";
        var my_rec = {width: 1124, top: 1204, left: 430, height: 1124};
        var nbaface = "http://grassroot.qiniudn.com/b498f0f6860fa5f73eb20147b7c088d4.jpeg"
        var nba_rec = {width: 77, top: 53, left: 102, height: 77};

        var nbaface_canvas = document.createElement('canvas');

        var my_Image = new Image();
        my_Image.crossOrigin = 'anonymous'
        my_Image.src = myface;
        my_Image.onload = ()=>{
            var nba_Image = new Image();
            nba_Image.crossOrigin = 'anonymous'
            nba_Image.src = nbaface;
            nba_Image.onload = ()=>{
                //开始换脸
                nbaface_canvas.width = nba_Image.width;
                nbaface_canvas.height = nba_Image.height;
                var nba_ctx = nbaface_canvas.getContext('2d');
                nba_ctx.drawImage(nba_Image,0,0);
                nba_ctx.drawImage(my_Image,my_rec.left,my_rec.top,my_rec.width,my_rec.height,nba_rec.left,nba_rec.top,nba_rec.width,nba_rec.height);
                var base64 = nbaface_canvas.toDataURL();
                this.setState({change_face:base64})
            }
        }

    }


    createLogo = async()=>{
        var result = await post("/createTeamLogo",{teamname:"湖人队"});
        this.setState({logo:result.base64})
    }

    render(){
        return (
            <div>
                <img src={this.state.logo} />
                <Button onClick={this.createLogo}>生成球队logo</Button>
                <img src={this.state.change_face} />
                <Button onClick={this.changeFace}>变脸</Button>
            </div>
        )
    }
}