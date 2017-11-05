import React from 'react'

export default class App extends React.Component{
    componentDidMount(){

    }
    componentWillMount(){

    }
    render(){
        return (
            <div>
                <video id="really-cool-video" className="video-js vjs-default-skin" controls preload="auto" width="640" height="360" data-setup='{}'>
                    <source src="http://foodsound.qiniudn.com/video/hls/introducing_thinglist_240.m3u8" type='application/x-mpegURL' />
                </video>
            </div>
        )
    }
}