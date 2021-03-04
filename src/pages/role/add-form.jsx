import React, { Component } from 'react';
import { Form, Input } from 'antd';
import PropTypes from 'prop-types';

const Item = Form.Item
class AddForm extends Component {
    static propTypes = {
        setForm: PropTypes.func.isRequired,
    }
    formRef = React.createRef()
    componentDidMount() {
        this.props.setForm(this.formRef.current)
    }
    render() {
        const layout = {
            labelCol: { span: 4 },//左侧的名称所占栅格数，总栅格数为24
            wrapperCol: { span: 20 },//右侧的表单输入控件所占栅格数，总栅格数为24
        }

        return (
            <Form
                ref={this.formRef}
            >
                <Item
                    name='roleName'
                    label='角色名称：'
                    {...layout}
                    rules={[
                        {
                            required: true,
                            message: '角色名称必须输入!'
                        },
                    ]}
                >
                    <Input
                        placeholder='请输入角色名称'
                        autoFocus
                    >
                    </Input>
                </Item>
            </Form>
        )
    }
}

export default AddForm;