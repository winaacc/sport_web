import React from 'react';

export default class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            mapHeight:"100%"
        }
    }
    componentDidMount(){
        var mapcontainer = document.getElementById("mapcontainer");
        var height = document.documentElement.clientHeight;
        var actualheight = height - mapcontainer.offsetTop;
        this.setState({mapHeight:actualheight})
        var map = new BMap.Map('mapcontainer')
        var point = new BMap.Point(116.404, 39.915);
        map.centerAndZoom(point, 15);
        map.addControl(new BMap.NavigationControl({
            // LARGE类型
            type: BMAP_NAVIGATION_CONTROL_LARGE,
            // 启用显示定位
            enableGeolocation: true
        }));
        // 添加定位控件
        var geolocationControl = new BMap.GeolocationControl();
        geolocationControl.addEventListener("locationSuccess", function(e){
            // 定位成功事件
            var address = '';
            address += e.addressComponent.province;
            address += e.addressComponent.city;
            address += e.addressComponent.district;
            address += e.addressComponent.street;
            address += e.addressComponent.streetNumber;
            alert("当前定位地址为：" + address);
        });
        geolocationControl.addEventListener("locationError",function(e){
            // 定位失败事件
            alert(e.message);
        });
        map.addControl(geolocationControl);
        map.addControl(new BMap.ScaleControl());
        var mapType1 = new BMap.MapTypeControl();
        map.addControl(mapType1);
    }

    render(){
        return (
            <div id="mapcontainer" style={{height:this.state.mapHeight}}></div>
        )
    }
}