import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
// import {Button} from 'antd'

import Login from './pages/login/login'
import Admin from './pages/admin/admin'

// import 'antd/dist/antd.css'
/* 应用的根组件 */
export default class App extends Component {

    render() {
        return (
            <BrowserRouter>
                <Switch> {/* 只匹配其中的某一个路由标签 */}
                    <Route path='/login' component={Login}></Route>
                    <Route path='/' component={Admin}></Route>
                </Switch>
            </BrowserRouter>
        )

    }
}