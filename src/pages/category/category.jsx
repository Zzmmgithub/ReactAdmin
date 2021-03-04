import React, { Component } from 'react'
import { Card, Table, Button, Space, message, Modal } from 'antd';
import { PlusOutlined, DoubleRightOutlined } from '@ant-design/icons';

import LinkButton from '../../components/link-button'
import { reqCategories, reqAddCategory, reqUpdateCategory } from '../../api/index'
import AddForm from './add-form'
import UpdateForm from './update-form'
/* 
    商品分类路由
*/
export default class Category extends Component {

    state = {
        categories: [],  //一级分类列表
        subCategories: [], //子分类列表
        loading: false,  //是否正在获取数据中
        parentId: '0',  // 当前需要显示的分类列表的一级分类id
        parentName: '',  // 当前需要显示的分类列表的一级分类名称
        showStatus: 0,  //标识 添加/更新 的确认框是否显示（0：都不显示； 1：显示添加； 2：显示更新）
        /* 这里是用一个变量来控制两个对话框是否显示 */
    }

    // 初始化table所有列的数组
    initColumns = () => {
        this.columns = [
            {
                title: '分类的名称',
                dataIndex: 'name',
                key: 'name',
            },

            {
                title: '操作',
                width: 300,
                key: 'action',
                render: (category) => (
                    <Space size="small">
                        <LinkButton onClick={() => { this.showUpdate(category) }}>修改分类</LinkButton>
                        {/* 如何向事件回调函数中传参数：先定义一个匿名函数，然后在匿名函数中调用函数并传递参数 */}
                        {this.state.parentId === '0' ? <LinkButton onClick={() => { this.showSubCategories(category) }}>查看子分类</LinkButton> : null}
                    </Space>
                ),
            },
        ];
    }

    /* 获取一级或2级分类列表 */
    /* 
        如果parentId没指定则按照状态中的值输入，如果指定了则按指定的parentId进行处理
    */
    getCategories = async (parentId) => {
        // 在发请求前，显示loading
        this.setState({ loading: true })
        parentId = parentId || this.state.parentId  //保证state中的parentId不变，即不会显示一级列表
        const result = await reqCategories(parentId);  // 向后台请求数据并返回

        // 请求完成后，结束loading
        this.setState({ loading: false })

        if (result.status === 0) {
            // 获取分类列表数组，可能是一级也可能是二级
            const categories = result.data
            if (parentId === '0') {
                // 更新一级列表状态
                this.setState({ categories })
            } else {
                // 更新二级列表状态
                this.setState({ subCategories: categories })
            }

        } else {
            message('获取分类列表失败')
        }
    }

    /* 显示指定一级分类列表的二级列表  */
    showSubCategories = (category) => {
        // 更新状态
        this.setState({
            parentId: category._id,
            parentName: category.name
        }, () => { // 在状态更新且重新render()后执行
            // 获取二级分类列表显示
            this.getCategories()
        })
        // setState()不能立即获取最新的状态：因为setState()是异步更新状态的
    }

    /* 显示指定二级分类列表时，此时点击一级分类列表，则返回上一层列表 */
    showCategories = () => {
        // console.log(this)
        // 更新为显示一级列表的状态
        this.setState({
            parentId: '0',
            parentName: '',
            subCategories: [],
            showStatus: 0, //标识添加/修改的确认框是否显示，0：都不显示，1：显示添加，2：显示修改
        })
    }
    // 点击取消显示确认框
    handleCancel = () => {
        // 清除输入数据，重置
        this.form.resetFields()
        // 隐藏Form
        this.setState({ showStatus: 0 })
    }
    // 显示添加分类的确认框
    showAdd = () => {
        this.setState({ showStatus: 1 })
    }
    // 添加分类
    addCategory = () => {
        this.form.validateFields().then(async (values) => { //这个表单验证api可以直接获取到this.form对应的表单输入的数据
            // 关闭对话框
            this.setState({ showStatus: 0 })
            // 收集数据并添加分类请求
            const { categoryName, parentId } = values
            this.form.resetFields()
            console.log(`即将用于添加的categoryName和parentId分别为${categoryName}和${parentId}`)
            // 提交添加分类的请求给后台（后台自行操作即完成后台数据添加），并返回promise对象的结果值，
            // 这里发送的数据将保存在后台，除非后台删除数据，否则每次登录都可以看到添加的数据
            const result = await reqAddCategory(categoryName, parentId)
            // 从后台重新获取分类列表显示
            if (result.status === 0) {
                // 添加的分类就是当前分类列表的子分类
                if (parentId === this.state.parentId) {
                    // 重新获取当前分类列表显示
                    this.getCategories()
                } else if (parentId === '0') { // 在二级分类列表下添加一级分类列表中的分类
                    // 重新获取一级分类列表，但不需要显示一级列表
                    this.getCategories('0')
                }
            }
        }).catch(errInfo => {
            message.error(errInfo.errorFields[0].errors)
        })
        // 重新获取分类列表显示
    }
    // 显示修改分类的对话框
    showUpdate = (category) => {
        // 保存category对象（给修改分类名字用）（没有必要放到state里）
        this.category = category
        // 更新状态
        this.setState({ showStatus: 2 })
    }

    // 更新分类
    updateCategory = () => {
        this.form.validateFields().then(async (values) => {
            // 关闭对话框
            this.setState({ showStatus: 0 })
            // 发送请求更新分类
            const categoryId = this.category._id
            /*  ↓
                分类的名字categoryName需要从子组件获取，子组件传递数据给父组件
                只能通过父组件传递一个函数prop给子组件，子组件通过传参来
                传递数据给父组件了。
            */
            // const {categoryName} = this.form.getFieldsValue()
            const { categoryName } = values
            console.log('即将用于更新的categoryName', categoryName);
            // 清除输入数据，重置
            this.form.resetFields()
            // 提交修改分类的请求给后台，后台自行添加，并返回promise对象的结果值
            const result = await reqUpdateCategory({ categoryName, categoryId })
            // 从后台重新显示列表
            if (result.status === 0) {
                this.getCategories()
            }
        }).catch(errInfo => {
            message.error(errInfo.errorFields[0].errors)
        })
    }
    /* 为第一次render准备数据 */
    componentWillMount() {
        this.initColumns()
    }
    /* 执行异步任务，发异步ajax请求 */
    componentDidMount() {
        this.getCategories();
    }
    render() {
        // 读取showUpdate()里保存的category对象
        const category = this.category || {}
        // 读取状态数据
        const { categories, subCategories, parentId, parentName, loading, showStatus } = this.state
        // card的左侧
        const title = parentId === '0' ? '一级分类列表' : (
            <span>
                <LinkButton onClick={() => { this.showCategories() }}>一级分类列表</LinkButton>
                <DoubleRightOutlined style={{ marginRight: 5 }} />
                <span>{parentName}</span>
            </span>
        )
        // card的右侧
        const extra = (
            <Button
                icon={<PlusOutlined />}
                onClick={this.showAdd}
                type='primary'>
                添加
            </Button>
        )
        return (
            <Card title={title} extra={extra}>
                <Table
                    bordered
                    dataSource={parentId === '0' ? categories : subCategories}
                    columns={this.columns}
                    rowKey='_id'
                    pagination={{ defaultPageSize: 5, showQuickJumper: true }}
                    loading={loading}
                />

                <Modal
                    title="添加分类"
                    visible={showStatus === 1}
                    onOk={this.addCategory}
                    onCancel={this.handleCancel}>
                    <AddForm
                        parentId={parentId}
                        categories={categories}
                        setForm={(form) => { this.form = form }}
                    />
                </Modal>
                <Modal
                    title="修改分类"
                    visible={showStatus === 2}
                    onOk={this.updateCategory}
                    onCancel={this.handleCancel}>
                    <UpdateForm
                        categoryName={category.name}
                        setForm={(form) => { this.form = form }}
                    />
                </Modal>
            </Card>
        )
    }
}
