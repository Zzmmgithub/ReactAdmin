import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { reqWeather } from '../../api';
import storageUtils from '../../utils/storageUtils';
import menuList from '../../config/menuConfig';
import './index.less'
import memoryUtils from '../../utils/memoryUtils';
import { formateDate } from '../../utils/dateUtils';

const { confirm } = Modal;
/* 
    右侧上header组件
*/

class Header extends Component {
    state = {
        citynm: '',
        weather: '',
        weather_icon: '',
        time: formateDate(Date.now())
    }

    getTitle = () => {
        // 得到当前请求路径
        const path = this.props.location.pathname
        let title
        menuList.forEach(item => {
            if (item.key === path) { // 得到key值和当前路径匹配的组件
                title = item.title
            } else if (item.children) {
                const cItem = item.children.find((cItem) => path.indexOf(cItem.key) === 0)
                if (cItem) {
                    title = cItem.title
                }
            }
        })
        return title
    }
    getWeather = async () => {
        const Weather = await reqWeather('北京')
        const { citynm, weather, weather_icon } = Weather.data.result
        this.setState({ citynm, weather, weather_icon })
    }

    getTime = () => {

        // 每隔1秒获取当前事件，并更新状态数据
        this.intervalId = setInterval(() => {
            // console.log(this.intervalId)
            const time = formateDate(Date.now())
            this.setState({ time })
        }, 1000)
    }
    logOut = () => {
        confirm({
            title: '确认退出吗？',
            icon: <ExclamationCircleOutlined />,
            content: '你将会返回到登录界面',
            onOk: () => {
                // 删除保存的user数据，这两个操作先后顺序不可反，否则会检查是否登录，会跳回来
                storageUtils.removeUser()
                memoryUtils.user = {}
                // 跳转到login
                this.props.history.replace('/login');
            },
            onCancel() {
                console.log('已取消退出登录');
            },
        });
    }
    /* 
        第一次render之后执行 
        一般在此执行异步操作：发送ajax请求/启动定时器
    */
    componentDidMount() {
        this.getTime()
        this.getWeather()
    }
    /* 不能这么做，因为不会更新显示 */
    // componentWillMount(){
    //     this.title=this.getTitle()
    // }

    componentWillUnmount() {
        // console.log(this.intervalId)
        clearInterval(this.intervalId)
    }
    render() {
        // 得到当前登录的用户名
        const { username } = memoryUtils.user
        const { time, weather, weather_icon, citynm } = this.state
        // 得到当前需要显示的title
        const title = this.getTitle()/* 这里暂时不可以放在生命周期的didMount或willMount中，因为这里是要每一次切换路由即每一次渲染都要变化，而didMount是挂载组件 */

        return (
            <div className='header'>
                <div className='header-top'>
                    <span>欢迎，{username}</span>
                    <Button type="primary" size='small' onClick={this.logOut} className='log-out'> 退出</Button>
                </div>
                <div className='header-bottom'>
                    <div className="header-bottom-left">{title}</div>
                    <div className="header-bottom-right">
                        <span>{time}</span>
                        <img src={weather_icon} alt="weather" />
                        <span>{citynm} {weather}</span>
                    </div>
                </div>
            </div>
        )
    }
}


export default withRouter(Header)