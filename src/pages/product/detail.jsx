import React, { Component } from 'react'
import { Card, List } from 'antd'
import { DoubleLeftOutlined } from '@ant-design/icons';

import LinkButton from '../../components/link-button'
import { BASE_IMG_URL } from '../../utils/constants'
import { reqCategoryName } from '../../api';

/* 
    详情页路由组件
*/
const Item = List.Item
export default class ProductDetail extends Component {
    state = {
        cName1: '',//一级分类名称
        cName2: '',//二级分类名称
    }
    async componentDidMount() {
        // 得到当前商品的分类ID
        const { pCategoryId, categoryId } = this.props.location.state.product
        if (pCategoryId === '0') {
            const result = await reqCategoryName(categoryId)
            const cName1 = result.data.name
            this.setState({ cName1 })
        } else {
            /* 
            通过promise方法，一次性发送多个请求，只有全部通过时才正常处理,
            这样可以提高处理效率，否则第二个await请求要等第一个结束后再发送 
            Promise.all([promise1, promise2]) 返回值一个promise 对象, 异步成功返回的是[result1, result2]
            */
            const results = await Promise.all([reqCategoryName(pCategoryId), reqCategoryName(categoryId)])
            // console.log(results)
            const cName1 = results[0].data.name
            const cName2 = results[1].data.name
            this.setState({ cName1, cName2 })
        }
    }
    render() {
        // 读取携带过来的state属性
        const { name, desc, price, detail, imgs } = this.props.location.state.product
        // console.log('product', this.props.location.state.product)
        const { cName1, cName2 } = this.state

        const title = (
            <span>
                <LinkButton onClick={() => this.props.history.goBack()}>
                    <DoubleLeftOutlined style={{ margin: '0 8px 0 0', color: 'grey' }} />
                </LinkButton>
                <span>商品详情</span>
            </span>
        )

        return (
            <Card title={title} className='product-detail'>
                <List className='product-detail-list'>
                    <Item>
                        <span className='left'>商品名称</span>
                        {name}
                    </Item>
                    <Item>
                        <span className='left'>商品描述</span>
                        {desc}
                    </Item>
                    <Item>
                        <span className='left'>商品价格</span>
                        {price + '元'}
                    </Item>
                    <Item>
                        <span className='left'>所属分类</span>
                        {cName1 + (cName2 ? ' --> ' + cName2 : '')}
                    </Item>
                    <Item style={{justifyContent:'flex-start'}}>
                        <span className='left-img'>商品图片</span>
                        {imgs.map((item, index) =>
                            <img
                                key={index}
                                src={BASE_IMG_URL + item}
                                className='product-img'
                                alt='img'
                            />
                        )}
                    </Item>
                    <Item style={{justifyContent:'flex-start'}}>
                        <span className='left'>商品详情</span>
                        <span dangerouslySetInnerHTML={{ __html: detail }}></span>
                    </Item>

                </List>
            </Card>
        )
    }
}
