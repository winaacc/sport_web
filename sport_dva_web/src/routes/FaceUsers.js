import React from 'react'
import ReactDOM from 'react-dom'
import request from "../utils/request"
import {
    List,
    ListView,
    Toast,
    Button
} from 'antd-mobile'

export default class App extends React.Component{
    constructor(props){
        super(props);
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        })
        this.state = {
            height: document.documentElement.clientHeight,
            cityName:"未知",
            players:[],
            dataSource,
            isLoading:true
        }
    }

    componentDidMount(){
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
        this.setState({height:hei});
        this.getLocalCity();
    }

    getLocalCity = ()=>{
        var self = this;
        function myFun(result){
            var cityName = result.name;
            self.setState({cityName});
            self.getUsersByCityName();
        }
        var myCity = new BMap.LocalCity();
        myCity.get(myFun);
    }
    
    getUsersByCityName = async ()=>{
        var body = {cityName:this.state.cityName}
        var server_response = await request("/getAllFaceUsers",{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        this.setState({players:server_response.data});
        this.setState({
            dataSource:this.state.dataSource.cloneWithRows(server_response.data),
            isLoading:false,
        })
    }

    deleteFace = async (face_token)=>{
        var body = {face_token:face_token}
        var server_response = await request("/removeFace", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        if(server_response.data.error){
            Toast.info(error);
        }else{
            Toast.info("删除成功")
            this.getUsersByCityName();
        }
    }

    render(){
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#F5F5F9',
                    height: 8,
                    borderTop: '1px solid #ECECED',
                    borderBottom: '1px solid #ECECED',
                }}
            />
        );

        const row = (rowData, sectionID, rowID) => {
            return (
                <div key={rowID} style={{ padding: '0 15px' }}>
                    <div
                        style={{
                            lineHeight: '50px',
                            color: '#888',
                            fontSize: 18,
                            borderBottom: '1px solid #F6F6F6',
                        }}
                    >{rowData.face_token}</div>
                    <div style={{ display: '-webkit-box', display: 'flex', padding: '15px 0' }}>
                        <img style={{ height: '64px', marginRight: '15px' }} src={rowData.image_url} alt="" />
                        <div style={{ lineHeight: 1 }}>
                            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{rowData.cityname}</div>
                            <div><span style={{ fontSize: '30px', color: '#FF6E27' }}>{rowID}</span>¥</div>
                            <div>{JSON.stringify(rowData.face_rectangle)}</div>
                            <Button onClick={()=>{this.deleteFace(rowData.face_token)}}>删除</Button>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <ListView
                ref={el => this.lv = el}
                dataSource={this.state.dataSource}
                renderHeader={() => <span>本地所有用户</span>}
                renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                    {this.state.isLoading ? 'Loading...' : 'Loaded'}
                </div>)}
                renderRow={row}
                renderSeparator={separator}
                className="am-list"
                pageSize={4}
                useBodyScroll={false}
                style={{
                    height:this.state.height,
                    border:'1px solid #ddd',
                    margin:'5px 0',
                }}
                onScroll={() => { console.log('scroll'); }}
                scrollRenderAheadDistance={500}
                onEndReachedThreshold={10}
            />
        )
    }
}