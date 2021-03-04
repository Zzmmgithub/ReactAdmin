import React, { Component } from 'react'
import { Card, Select, Input, Button, Table, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons';

import { reqProducts, reqSearchProducts, reqUpdateStatus } from '../../api/index'
import { PAGE_SIZE } from '../../utils/constants'
import './product.less'
/* 
    product默认子路由组件
*/
const Option = Select.Option
export default class ProductHome extends Component {
    state = {
        total: 0, // 商品的总数量
        products: [], // 商品的数组
        loading: false,
        searchName: '', //搜索的关键字
        searchType: 'productName', //根据哪种搜索方式搜索
    }
    initColumns = () => {
        this.columns = [
            {
                title: '商品名称',
                dataIndex: 'name',/* dataIndex的值对应着数据源中的键名 */
                align: 'center',
                // key: 'name'
            },
            {
                title: '商品描述',
                dataIndex: 'desc',
                align: 'center',
                // key: 'age'
            },
            {
                title: '价格',
                dataIndex: 'price',
                align: 'center',
                render: (price) => '¥' + price
            },
            {
                width: 100,
                title: '状态',
                // dataIndex: 'status',
                align: 'center',
                render: (product) => {
                    let { status, _id } = product
                    // console.log(status)
                    return (
                        <span>
                            <Button
                                type='primary'
                                onClick={() => { this.updateStatus(_id, status === 1 ? 2 : 1) }}
                            >
                                {status === 1 ? '下架' : '上架'}
                            </Button>
                            <span
                                style={{ display: "block" }}
                            >
                                {status === 1 ? '在售' : '已下架'}
                            </span>
                        </span>
                    )
                }
            },
            {
                width: 100,
                title: '操作',
                align: 'center',
                render: (product) => (
                    <span>
                        <a
                            style={{ display: 'block', cursor: 'pointer' }}
                            onClick={() => this.props.history.push('/product/detail', { product })}
                        /* 因为此时ProductHome是路由组件，所以可以用push */
                        /* 这里路由组件向下一路由组件发送product没有利用props，而是BrowserRouter的一个history的api */
                        >详情</a>
                        <a
                            style={{ display: 'block', cursor: 'pointer' }}
                            onClick={() => { this.props.history.push('/product/addupdate', product) }}
                        >修改</a>
                    </span>
                )
            },
        ];
    }

    /* 
        获取指定页码的商品数据显示
    */
    getProducts = async (pageNum) => {
        // 将pageNum存到this中，以便其他方法也看得见
        this.pageNum = pageNum

        this.setState({ loading: true })
        // 判断是搜索分页显示还是一般分页显示
        const { searchName, searchType } = this.state
        // 注意：这里结果要统一处理，即先定义result
        let result;
        // 如果searchName有值，则是搜索分页
        if (searchName) {
            result = await reqSearchProducts({ pageNum, pageSize: PAGE_SIZE, searchName, searchType })
        } else {// 否则是一般分页显示
            result = await reqProducts(pageNum, PAGE_SIZE)
        }

        this.setState({ loading: false })
        // console.log(result)

        // 取出分页数据，更新状态显示分页结果
        if (result.status === 0) {
            // 取出分页数据，更新状态使显示分页列表
            const { total, list } = result.data
            this.setState({
                total,
                products: list
            })
        }
    }
    //  更新商品状态
    updateStatus = async (productId, status) => {
        console.log(status)

        const result = await reqUpdateStatus(productId, status)
        if (result.status === 0) {
            message.success('状态更改成功')
            this.getProducts(this.pageNum || 1)
        } else {
            message.error('状态更改失败')
        }
    }
    componentWillMount() {
        this.initColumns()
    }
    componentDidMount() {
        this.getProducts(1)
    }
    render() {
        // 取出状态数据
        const { products, total, loading, searchName, searchType } = this.state
        const title = (
            <span>
                <Select
                    value={searchType}
                    style={{ width: 150 }}
                    onChange={value => this.setState({ searchType: value })}
                >
                    <Option value='productName'>按名称搜索</Option>
                    <Option value='productDesc'>按描述搜索</Option>
                </Select>
                <Input
                    placeholder='关键字'
                    value={searchName}
                    style={{ width: 150, margin: '0 15px' }}
                    onChange={event => this.setState({ searchName: event.target.value })}
                />
                <Button type='primary' onClick={() => { this.getProducts(1) }}>搜索</Button>
            </span>
        )
        const extra = (
            <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => this.props.history.push('/product/addupdate')}
            >
                添加商品
            </Button>
        )

        return (
            <Card title={title} extra={extra}>
                <Table
                    bordered
                    rowKey='_id'
                    dataSource={products}
                    columns={this.columns}
                    pagination={{
                        total,
                        defaultPageSize: PAGE_SIZE,
                        showQuickJumper: true,
                        // onChange:{(pageNum)=>this.getProducts(pageNum)} 可以简写,pageName就是从这里获取到的
                        onChange: this.getProducts
                    }}
                    loading={loading}
                />;
            </Card>
        )
    }
}
