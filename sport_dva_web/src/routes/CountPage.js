import React from 'react'
import {connect} from 'dva'
import {Link} from 'dva/router'
import {
    NavBar
} from 'antd-mobile'
import styles from './CountPage.less'
const CountApp = ({count,dispatch}) => {
    return (

        <div className={styles.normal}>
            <Link to="/chat/mangguo">切换链接</Link>
            <div className={styles.record}>Highest Record:{count.record}</div>
            <div className={styles.current}>{count.current}</div>
            <div className={styles.button}>
                <button onClick={()=>{dispatch({type:'count/add'});}}>+</button>
            </div>
        </div>

    );
}

function mapStateToProps(state){
    return {count:state.count}
}

const HomePage = connect(mapStateToProps)(CountApp)

export default HomePage