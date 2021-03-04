import React, { Component } from 'react'
import { Form, Input } from 'antd'
import PropTypes from 'prop-types';

/* 
    添加分类的form组件 
    一些路由组件独有的非路由组件也可以放到pages文件夹的对应路由组件文件夹下
    不一定非要放在components文件夹下 
*/
const Item = Form.Item
export default class UpdateForm extends Component {
    static propTypes = {
        categoryName: PropTypes.string,
        setForm: PropTypes.func.isRequired,
    }
    formRef = React.createRef()
    componentDidMount() {
        // 将form对象通过setForm传递给父组件
        this.props.setForm(this.formRef.current)
    }
    render() {
        const { categoryName } = this.props
        return (
            <Form
                initialValues={{ categoryName }}
                ref={this.formRef}
            >
                <Item
                    name='categoryName'
                    rules={[
                        {
                            required: true,
                            message: '请输入需要修改分类的名称!'
                        },
                    ]}
                >
                    <Input
                        autoFocus
                        placeholder='请输入分类名称：'
                    />
                </Item>
            </Form>
        )
    }
}