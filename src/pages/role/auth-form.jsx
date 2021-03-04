import React, { Component } from 'react'
import { Form, Input, Tree } from 'antd'
import PropTypes from 'prop-types';

import menuConfig from '../../config/menuConfig'

const Item = Form.Item
const { TreeNode } = Tree

export default class AuthForm extends Component {
    static propTypes = {
        role: PropTypes.object,
    }
    constructor(props) {
        super(props)
        // 根据传入的role的menus生成初始状态
        const { menus } = this.props.role
        this.state = {
            checkedKeys: menus
        }
    }
    getTreeNodes = (menuConfig) => {
        return menuConfig.map(item => (
            <TreeNode title={item.title} key={item.key}>
                {
                    item.children ? this.getTreeNodes(item.children) : null
                }
            </TreeNode>
        ))
        // return menuConfig.reduce((pre, item) => {
        //     pre.push(
        //         <TreeNode title={item.title} key={item.key}>
        //             {
        //                 item.children ? this.getTreeNodes(item.children) : null
        //             }
        //         </TreeNode>
        //     )
        //     return pre
        // }, [])
    }
    // 选中某个node时的回调函数
    onCheck = (checkedKeys) => {
        console.log('onCheck', checkedKeys);
        this.setState({ checkedKeys });
    };
    // 为父组件提供最新的勾选项数组，由父组件调用
    getMenus = () => {
        return this.state.checkedKeys
    }
    componentWillMount() {
        this.treeNodes = this.getTreeNodes(menuConfig)
    }
    // 根据新传入的role来更新checkedKeys状态
    /* 当接收到新的属性时自动调用，且是在render之前调用 */
    UNSAFE_componentWillReceiveProps(nextProps){
        console.log('UNSAFE_componentWillReceiveProps', nextProps)
        const menus= nextProps.role.menus
        this.setState({checkedKeys: menus})
    }
    render() {
        console.log('AuthForm render()')
        const { role } = this.props
        const { checkedKeys } = this.state
        const layout = {
            labelCol: { span: 4 },//左侧的名称所占栅格数，总栅格数为24
            wrapperCol: { span: 20 },//右侧的表单输入控件所占栅格数，总栅格数为24
        }

        return (
            <div>
                <Item
                    name='roleName'
                    label='角色名称：'
                    {...layout}
                >
                    <Input value={role.name} disabled />
                    <Tree
                        checkable
                        defaultExpandAll={true}
                        checkedKeys={checkedKeys}
                        onCheck={this.onCheck}
                    >
                        <TreeNode title='平台权限' key='all'>
                            {this.treeNodes}
                        </TreeNode>
                    </Tree>
                </Item>
            </div>
        )
    }
}
