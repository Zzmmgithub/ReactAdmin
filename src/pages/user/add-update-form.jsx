import React, { PureComponent } from 'react';
import { Form, Input, Select } from 'antd';
import PropTypes from 'prop-types';
/* 
    添加/修改用户的form组件
*/
const Item = Form.Item
class AddOrUpdateForm extends PureComponent {
    static propTypes = {
        setForm: PropTypes.func.isRequired,
        roles: PropTypes.array.isRequired,
        user: PropTypes.object,
    }
    formRef = React.createRef()

    validatePwd = (rule, value) => {
        if (!value) {
            return Promise.reject('需要输入');
        } else if (value.length < 4) {
            return Promise.reject('密码长度必须大于4');
        } else if (value.length > 12) {
            return Promise.reject('密码长度必须小于12');
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return Promise.reject('密码必须由英文字母、数字、下划线组成');
        } else {
            return Promise.resolve();
        }
    } 

    componentDidMount() {
        this.props.setForm(this.formRef.current)
    }
    render() {
        const { roles,user } = this.props
        const layout = {
            labelCol: { span: 4 },//左侧的名称所占栅格数，总栅格数为24
            wrapperCol: { span: 20 },//右侧的表单输入控件所占栅格数，总栅格数为24
        }

        return (
            <Form
                ref={this.formRef}
            >
                <Item
                    name='username'
                    label='用户名：'
                    initialValue={user.username}
                    {...layout}
                    rules={[
                        {
                            required: true,
                            message: '用户名必须输入!',
                            whitespace: true//如果字段仅包含空格则校验不通过
                        },
                        {
                            min: 4, message: '用户名至少四位'
                        },
                        {
                            max: 12, message: '用户名最多12位'
                        },
                        {
                            pattern: /^[a-zA-Z0-9_]+$/, message: '用户名必须是英文，数字或下划线组成'
                        }
                    ]}
                >
                    <Input
                        placeholder='请输入用户名称'
                        autoFocus
                    >
                    </Input>
                </Item>
                {
                    user._id ? null : (
                        <Item
                            name='password'
                            label='密码：'
                            initialValue={user.password}
                            {...layout}
                            rules={[
                                {
                                    required: true,
                                    message: '密码必须输入!'
                                },
                                { validator: this.validatePwd }
                            ]}
                        >
                            <Input
                                placeholder='请输入密码'
                            >
                            </Input>
                        </Item>
                    )
                }

                <Item
                    name='phone'
                    label='手机号码：'
                    initialValue={user.phone}
                    {...layout}
                >
                    <Input
                        placeholder='请输入手机号码'
                    >
                    </Input>
                </Item>
                <Item
                    name='email'
                    label='邮箱：'
                    initialValue={user.email}
                    {...layout}
                >
                    <Input
                        placeholder='请输入邮箱'
                    >
                    </Input>
                </Item>
                <Item
                    name='role_id'
                    label='用户角色：'
                    initialValue={user.role_id}
                    {...layout}
                >
                    <Select
                        initialValue={user.menus}
                        placeholder='请选择用户角色'
                    >
                        {
                            roles.map((item, index) => (
                                <Select.Option value={item._id} key={item._id}>{item.name}</Select.Option>
                            ))
                        }

                    </Select>
                </Item>
            </Form>
        )
    }
}

export default AddOrUpdateForm;