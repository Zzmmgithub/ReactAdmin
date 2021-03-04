import React, { Component } from 'react'
import { Card, Button, Table, Modal, message } from 'antd'

import { reqRoles, reqAddRole, reqUpdateRole } from '../../api/index'
import AddForm from './add-form'
import AuthForm from './auth-form'
import memoryUtils from '../../utils/memoryUtils'
import { formateDate } from '../../utils/dateUtils'
import storageUtils from '../../utils/storageUtils'
/* 
    角色路由
*/
export default class Role extends Component {
    state = {
        roles: [], // 所有角色的列表
        role: {},  //选中的角色
        isShowAdd: false,  //是否显示添加的确认框
        isShowAuth: false,  //是否显示权限设置的确认框
    }
    authRef = React.createRef()
    initColumns = () => {
        this.columns = [
            {
                title: '角色名称',
                dataIndex: 'name'
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (create_time) => formateDate(create_time)
            },
            {
                title: '授权时间',
                dataIndex: 'auth_time',
                render: formateDate
            },
            {
                title: '授权人',
                dataIndex: 'auth_name'
            }
        ]
    }
    onRow = (role) => {
        return {
            onClick: event => { //点击行
                // console.log('role', role)
                this.setState({ role })
            }
        }
    }
    getRoles = async () => {
        const result = await reqRoles()
        if (result.status === 0) {
            const roles = result.data
            // 这是全新的状态数组，和原来的状态没有关系，可以这样更新
            this.setState({ roles })
        }
    }
    addRole = () => {
        // 进行表单验证，只有通过了才继续
        this.form.validateFields()
            .then(async values => {
                // 隐藏确认框
                this.setState({ isShowAdd: false })
                // 收集数据
                const { roleName } = values
                this.form.resetFields()
                // 请求添加
                const result = await reqAddRole(roleName)
                // 根据结果状态更新显示
                if (result.status === 0) {
                    message.success('添加成功')
                    // this.getRoles() // 可以这样做，也可以像下面这种操作方式
                    let role = result.data
                    // 这是在原本状态的基础上更新状态，使用函数形式进行更新
                    this.setState((state, props) => ({
                        roles: [...state.roles, role]
                    }))
                }
            }).catch(() => {
                message.error('添加失败')
            })
    }

    authRole = async () => {
        // 隐藏确认框
        this.setState({
            isShowAuth: false
        })
        const role = this.state.role
        // 得到最新的menus
        const menus = this.authRef.current.getMenus()
        // 将得到的menus传给当前role
        role.menus = menus
        role.auth_time = Date.now()
        role.auth_name = memoryUtils.user.username
        // 发送设置权限请求
        const result = await reqUpdateRole(role)
        if (result.status === 0) {
            // 如果当前更新的是自己权限，需要强制退出
            if (role._id===memoryUtils.user.role_id) {
                // 清楚用户数据并退出
                memoryUtils.user={}
                storageUtils.removeUser()
                this.props.history.replace('/login')
                message.success('当前用户权限发生改变，需重新登陆')
            } else {
            message.success('权限设置成功')
                // this.getRoles()
                this.setState({
                    roles: [...this.state.roles]
                })
            }

        } else {
            message.error('权限设置失败')
        }
    }
    handleAddCancel = () => {
        this.setState({ isShowAdd: false })
        this.form.resetFields()
    }
    handleAuthCancel = () => {
        this.setState({ isShowAuth: false })
    }
    componentWillMount() {
        this.initColumns()
    }
    componentDidMount() {
        this.getRoles()
    }
    render() {
        const { roles, role, isShowAdd, isShowAuth } = this.state

        const title = (
            <span>
                <Button type='primary' onClick={() => { this.setState({ isShowAdd: true }) }}>创建角色</Button>&nbsp;&nbsp;
                <Button
                    type='primary'
                    disabled={!role._id}
                    onClick={() => { this.setState({ isShowAuth: true }) }}
                >
                    设置用户权限
                </Button>
            </span>
        )
        return (
            <Card title={title} >
                <Table
                    bordered
                    dataSource={roles}
                    columns={this.columns}
                    rowKey='_id'
                    pagination={{ defaultPageSize: 4, showQuickJumper: true }}
                    rowSelection={{ 
                        type: 'radio', 
                        selectedRowKeys: [role._id],
                        onSelect:role=>{ // 选择某个radio时回调,和onrow的回调相同操作
                            this.setState({role})
                        }
                     }}
                    onRow={this.onRow}
                >
                </Table>
                <Modal
                    title="添加角色"
                    visible={isShowAdd}
                    onOk={this.addRole}
                    onCancel={this.handleAddCancel}>
                    <AddForm
                        setForm={(form) => { this.form = form }}
                    />
                </Modal>
                <Modal
                    title="设置角色权限"
                    visible={isShowAuth}
                    onOk={this.authRole}
                    onCancel={this.handleAuthCancel}>
                    <AuthForm
                        role={role}
                        ref={this.authRef}
                    />
                </Modal>
            </Card>
        )
    }
}
