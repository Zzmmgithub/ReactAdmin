import React, { Component } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Redirect } from 'react-router-dom'

import './login.less'
import logo from '../../assets/images/logo.png'
import { reqLogin } from '../../api'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'

const Item = Form.Item//不能写在import之前

const Demo = (props) => {
    const [form] = Form.useForm();//需要去与Form标签关联
    const handleSubmit = (event) => {
        //阻止事件的默认行为
        event.preventDefault();
        const values = form.getFieldValue();//返回一个对象
        console.log(values);//是下面设置了name的Form.Item里input的输入值
    }

    const validatePwd = (rule, value) => {
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

    const onFinish = async (values) => {
        const { history } = props
        // console.log('校验成功');
        const { username, password } = values;
        console.log(username, password)
        //请求登陆(注意：改过接口路径或代理之后要重启服务器端代码)
        // reqLogin(username, password).then(response => {
        //     console.log('成功了，即将将数据发送到服务器', response.data)
        // }).catch(error => {
        //     console.log('失败了', error.response)
        // })

        const result = await reqLogin(username, password) // {status:0,data:user} {status:1,msg:'xxx'}
        if (result.status === 0) {//登录成功
            // 提示登录成功
            message.success('登录成功')
            console.log(result)
            const user = result.data
            memoryUtils.user = user // 保存到内存中
            storageUtils.saveUser(user)  // 保存到本地local中

            // 登录后, 访问登录路径自动跳转到管理界面，在组件中回退使用的是history，render中用的是redirect标签
            history.replace('/')  //这里的处理真是个天才！
        } else {//登录失败
            // 提示错误信息
            message.error(result.msg)
        }
    }
    const onFinishFailed = (values, errorFields, outOfDate) => {//
        console.log('校验失败', values, errorFields, outOfDate);
    }

    return (
        // 这个form={form}是把上面那个form和这个Form标签关联起来的，不能删掉
        <Form form={form}
            className="login-form"
            onSubmit={handleSubmit}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{
                remember: true,
            }}
        >
            <Item
                name="username"
                // initialValue="admin"
                // 声明式验证：直接使用别人写好的验证规则进行验证
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
                <Input prefix={<UserOutlined className="site-form-item-icon" style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="用户名" />
            </Item>
            <Form.Item
                name="password"
                rules={[
                    {
                        required: true,
                        message: '请输入密码!',
                    },
                    { validator: validatePwd }
                ]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" style={{ color: 'rgba(0,0,0,0.25)' }} />}
                    type="password"
                    placeholder="密码"
                />
            </Form.Item>
            <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                    登录
                </Button>
            </Form.Item>
        </Form>
    )
}

// 登陆的路由组件
export default class Login extends Component {
    // handleSubmit(){
    // 神奇的操作，箭头函数不行，普通函数可以，但是又不能出现function那种
    // }
    render() {
        // 如果用户已经登录，则直接跳转到admin界面
        // 登陆后, 刷新后依然是已登陆状态(维持登陆)
        const user = memoryUtils.user
        if (user && user._id) {
            return <Redirect to='/' />
        }
        return (
            <div className="login">
                <header className="login-header">
                    <img src={logo} alt="logo" />
                    <h1>React项目：后台管理系统</h1>
                </header>
                <section className="login-content">
                    <h2>用户登录</h2>
                    <Demo history={this.props.history} />
                </section>
            </div>
        )
    }
}
/*
1.前台表单认证
2.收集表单数据
*/