import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Menu } from 'antd'


import './index.less'
import logo from '../../assets/images/logo.png'
import menuList from '../../config/menuConfig'
import memoryUtils from '../../utils/memoryUtils'
/* 
    左侧导航的组件
    使用map + 递归调用
    使用reduce + 递归调用
*/

const { SubMenu } = Menu;

class LeftNav extends Component {

    /* 判断当前用户对item是否有权限 */
    hasAuth = (item) => {
        const { key, isPublic } = item

        const menus = memoryUtils.user.role.menus
        const username = memoryUtils.user.username
        /*
        1. 如果当前用户是admin
        2. 如果当前item是公开的
        3. 当前用户有此item的权限: key有没有menus中
         */
        if (username === 'admin' || isPublic || menus.indexOf(key) !== -1) {
            return true
        } else if (item.children) { // 4. 如果当前用户有此item的某个子item的权限
            return !!item.children.find(child => menus.indexOf(child.key) !== -1)
        }

        return false
    }
    /* 根据menu的数据数组生成对应的标签数组 */
    getMenuNodes_map(menuList) {
        return menuList.map(item => {
            // 如果当前用户有item对应的权限，才需要显示对应的菜单项
            if (this.hasAuth(item)) {

                if (!item.children) {
                    return (
                        <Menu.Item key={item.key} icon={item.icon}>
                            <Link to={item.key}>{item.title}</Link>
                        </Menu.Item>
                    )
                } else {
                    return (
                        <SubMenu key={item.key} icon={item.icon} title={item.title}>
                            {this.getMenuNodes(item.children)}
                        </SubMenu>
                    )
                }
            }

        })
    }
    getMenuNodes = (menuList) => {
        // 得到当前路由请求的路径
        let path = this.props.location.pathname

        return menuList.reduce((pre, item) => {
            if (this.hasAuth(item)) {
                if (!item.children) {
                    pre.push(<Menu.Item key={item.key} icon={item.icon}>
                        <Link to={item.key}>{item.title}</Link>
                    </Menu.Item>)
                } else {
                    // 查找一个与当前路径匹配的子item
                    const cItem = item.children.find(cItem => path.indexOf(cItem.key) === 0)
                    // 如果存在，说明当前的子列表需要展开
                    if (cItem) { this.openKey = item.key }
                    pre.push(
                        <SubMenu key={item.key} icon={item.icon} title={item.title}>
                            {this.getMenuNodes(item.children)}
                        </SubMenu>
                    )
                }
            }
            return pre
        }, [])
    }
    /* 
        在第一次render()之前执行
        为第一次渲染做准备数据（同步的）
     */
    UNSAFE_componentWillMount() {
        this.menuNodes = this.getMenuNodes(menuList)
    }
    render() {
        // 得到当前路由请求的路径
        let path = this.props.location.pathname
        if (path.indexOf('/product') === 0) { //当前请求的是商品或其子路由界面
            path = '/product'
        }
        // 获取需要展开的key
        const openKey = this.openKey
        return (
            <div to='/' className='left-nav'>
                <Link to='/' className='left-nav-header'>
                    <img src={logo} alt="logo" />
                    <h1>后台管理</h1>
                </Link>

                <Menu
                    selectedKeys={[path]}
                    mode="inline"
                    theme="dark"
                    defaultOpenKeys={[openKey]}
                >
                    {this.menuNodes}
                </Menu>
            </div>
        )
    }
}


export default withRouter(LeftNav);
/*
    withRouter()高阶组件
        包装非路由组件，返回一个新的组件，并向非路由组件传递3个属性  history/location/match
*/