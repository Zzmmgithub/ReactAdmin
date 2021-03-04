//  添加分类的form组件
/* 一些路由组件独有的非路由组件也可以放到pages文件夹的对应路由组件文件夹下 */
/* 不一定非要放在components文件夹下 */

import React, { Component } from 'react';
import { Form, Input, Select } from 'antd';
import PropTypes from 'prop-types';

const Item = Form.Item
class AddForm extends Component {
    static propTypes = {
        categories: PropTypes.array.isRequired,
        parentId: PropTypes.string.isRequired,
        setForm: PropTypes.func.isRequired,
    }
    formRef = React.createRef()
    componentDidMount() {
        this.props.setForm(this.formRef.current)
    }
    render() {
        const {categories, parentId} = this.props
        return (
            <Form 
                ref={this.formRef}
                initialValues={{parentId}}
                >
                <Item>
                    <p>分类名称：</p>
                    <Item name='parentId'>
                        <Select>
                            <Select.Option value='0'>一级分类</Select.Option>
                            {
                                categories.map(
                                    (item, index) => <Select.Option value={item._id} key={item._id}>{item.name}</Select.Option>
                                )
                            }
                        </Select>
                    </Item>
                </Item>
                <Item>
                    <p>添加分类：</p>
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
                            placeholder='请输入分类名称'
                            autoFocus
                            >
                        </Input>
                    </Item>
                </Item>
            </Form>
        )
    }
}
 
export default AddForm;