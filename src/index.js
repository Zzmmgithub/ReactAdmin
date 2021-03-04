/* 入口js */
import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import storageUtils from './utils/storageUtils'
import memoryUtils from './utils/memoryUtils'
/* 一上来就读取local中保存的user */
// 登陆后, 关闭浏览器后打开浏览器访问依然是已登陆状态(自动登陆)
const user = storageUtils.getUser()
memoryUtils.user = user
ReactDOM.render(<App />, document.getElementById('root'));