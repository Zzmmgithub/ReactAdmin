import React, { Component } from 'react'
import { Card, Form, Input, Cascader, Button, message } from 'antd'
import { DoubleLeftOutlined } from '@ant-design/icons'

import LinkButton from '../../components/link-button'
import { reqCategories, reqAddorUpdateProduct } from '../../api/index'
import PicturesWall from './pictures-wall'
import RichTextEdtior from './rich-text-editor'
/* 
Product添加更新子路由组件
*/
const { Item } = Form
const { TextArea } = Input

export default class ProductAddUpdate extends Component {
    /* 如果是添加product是没有值的，修改才有值 */
    // product = this.props.location.state   //home中通过history传过来给addupdate组件的product对象
    state = {
        options: [],
        // isUpdate: !!this.product,   /* 进行一个强制类型转换，来作为一个布尔值。以此来区分添加和修改操作 */
        // product: this.product || {} /* 用于点击修改商品时默认显示的值。加了“|| {}”是为了防止点击添加商品时报错 */
    }

    formRef = React.createRef()
    pwRef = React.createRef()
    editorRef = React.createRef()
    initOptions = async (categories) => {
        // 根据categories生成options数组
        const options = categories.map((item, index) => ({
            value: item._id, // 收集的数据
            label: item.name, // 显示的名字
            isLeaf: false, /* 如果不是叶子，该选项后面会有个箭头，表示后面还有二级分类 */
        }))
        // 如果是修改操作，需要一开始就 显示 + 默认选中原来的分类选项
        // 注意这里不负责默认选中，在后面categorysId设置那里负责，这里只负责显示
        const { isUpdate, product } = this.state
        if (isUpdate && product.pCategoryId !== '0') { //二级分类列表
            const subCategories = await this.getCategories(product.pCategoryId)
            const subOptions = subCategories.map((item, index) => ({
                value: item._id, // 收集的数据
                label: item.name, // 显示的名字
                isLeaf: true, /* 如果不是叶子，该选项后面会有个箭头，表示后面还有二级分类 */
            }))
            // console.log(subOptions)

            const targetOption = options.find((item) => item.value === product.pCategoryId)
            // 关联上一级选中的options选项，其实就是设置下一级需要选中哪个选项
            targetOption.children = subOptions
        }

        // 更新状态
        this.setState({ options })
    }
    /* 主动获取一级/二级分类列表 */
    /* 
        async函数返回的结果是一个新的promise对象，promise对象的结果和值都由async的结果决定
    */
    getCategories = async (parentId) => {
        const result = await reqCategories(parentId)
        if (result.status === 0) {
            const categories = result.data
            if (parentId === '0') {
                this.initOptions(categories)
            } else { //注意是获取二级分类列表时执行
                // console.log(parentId)
                return categories // 返回二级列表，此时async函数返回的promise对象的结果是成功且返回值value是categories
            }
        }
    }
    /* 点击某个一级分类列表时自动触发的函数 */
    loadData = async selectedOptions => {
        // 得到选中的一级分类，请求加载二级分类列表
        const targetOption = selectedOptions[selectedOptions.length - 1]
        targetOption.loading = true
        // 获取被点击的分类的_id，来请求二级分类列表
        const subCategories = await this.getCategories(targetOption.value) //这里的value实际是id，map上面不是写着吗
        targetOption.loading = false
        // 如果二级分类有数据
        if (subCategories && subCategories.length > 0) {
            // 生成一个二级列表的options，并关联到当前选中目标
            targetOption.children = subCategories.map((item, index) => ({
                value: item._id, // 收集的数据
                label: item.name, // 显示的名字
                isLeaf: true, /* 如果不是叶子，该选项后面会有个箭头，表示后面还有二级分类 */
            }))
        } else {  //当前选中的分类没有二级分类
            targetOption.isLeaf = true
        }
        this.setState({ options: [...this.state.options] })
    }

    submit = () => {
        this.formRef.current.validateFields().then(async (values) => {
            // 1. 收集数据，并封装成product对象
            const { name, desc, price, categoryIds } = values
            let categoryId, pCategoryId
            if (categoryIds.length === 1) {
                pCategoryId = '0'
                categoryId = categoryIds[0]
            } else {
                pCategoryId = categoryIds[0]
                categoryId = categoryIds[1]
            }
            // 通过ref获取子组件中包含的已经上传的
            const imgs = this.pwRef.current.getImags() /* 该方法返回一个包含图片名的数组，这些图片是刚刚上传的 */
            const detail = this.editorRef.current.getDetail()
            // console.log('detail',detail)
            const product = { name, desc, price, categoryId, pCategoryId, imgs, detail }
            // 2. 调用接口请求函数去添加或者修改（更新）
            // 如果是更新，需要添加_id
            if (this.isUpdate) {
                product._id = this.product._id
            }
            // 3. 根据结果提示
            const result = await reqAddorUpdateProduct(product)
            if (result.status === 0) {
                message.success(`${this.isUpdate ? '更新' : '添加'}商品成功`)
                this.props.history.goBack()
            }
        }).catch(errInfo => {
            // message.error(errInfo.errorFields[0].errors)
            message.error(`${this.isUpdate ? '更新' : '添加'}商品失败`)
        })

    }
    componentWillMount() {
        // 取出携带的state
        const product = this.props.location.state  // 如果是添加没值, 否则有值
        // 保存是否是更新的标识
        this.isUpdate = !!product
        // 保存商品(如果没有, 保存是{})
        this.product = product || {}
    }
    componentDidMount() {
        this.getCategories('0')
    }
    render() {
        const { isUpdate, product } = this
        // console.log('product.imgs',product.imgs)  // product.imgs是该商品的（一个包含原本修改前）图片文件名的数组
        // 用来接收默认级联分类ID的数组
        const categoryIds = []
        if (isUpdate) {
            // 商品是一级分类商品
            if (product.pCategoryId === '0') {
                categoryIds.push(product.categoryId)
            } else { // 商品是二级分类商品
                categoryIds.push(product.pCategoryId)
                categoryIds.push(product.categoryId)
            }
        }
        const title = (
            <span>
                <LinkButton onClick={() => this.props.history.goBack()}>
                    <DoubleLeftOutlined style={{ margin: '0 8px 0 0', color: 'grey' }} />
                </LinkButton>
                {isUpdate ? '修改商品' : '添加商品'}
            </span>
        )
        // 指定form的样式布局
        const layout = {
            labelCol: { span: 2 },//左侧的名称所占栅格数，总栅格数为24
            wrapperCol: { span: 8 },//右侧的表单输入控件所占栅格数，总栅格数为24
        }
        return (
            <Card title={title}>
                <Form
                    {...layout}
                    ref={this.formRef}
                // onFinish={this.onFinish}
                >
                    <Item label='商品名称'
                        name='name'
                        initialValue={product.name}
                        rules={[
                            {
                                required: true,
                                message: '必须输入商品名称!'
                            }
                        ]}
                    >
                        <Input
                            placeholder='请输入商品名称'
                        />
                    </Item>
                    <Item
                        label='商品描述'
                        name='desc'
                        initialValue={product.desc}
                        rules={[
                            {
                                required: true,
                                message: '必须输入商品描述!'
                            }
                        ]}
                    >
                        <TextArea
                            placeholder='请输入商品描述'
                            autoSize={{ minRows: 2, maxRows: 8 }}
                        />
                    </Item>
                    <Item
                        label='商品价格'
                        name='price'
                        initialValue={product.price}
                        rules={[
                            {
                                required: true,
                                message: '必须输入商品价格!'
                            },
                            {
                                validator(rule, value) {
                                    if (!value || value > 0) {/* 注意前面这里加上“!value ||”是为了防止没有输入时，通知出现两条验证错误信息 */
                                        return Promise.resolve()
                                    }
                                    return Promise.reject('金额必须大于0！')
                                },
                            }
                        ]}
                    >
                        <Input
                            placeholder='请输入商品价格'
                            type='number'
                            addonAfter='元'
                        />
                    </Item>
                    <Item label='商品分类'
                        name='categoryIds'
                        initialValue={categoryIds} // 这里的value传入id值就可以控制级联列表显示，因为loadData中使用的就是选中项的value，即id值
                        rules={[
                            {
                                required: true,
                                message: '必须输入商品分类!'
                            }
                        ]}
                    >
                        <Cascader
                            options={this.state.options} /* 需要显示的列表数据数组 */
                            loadData={this.loadData} /* 当选择某个列表项，加载 下一级 列表的事件回调 */
                            changeOnSelect
                            placeholder='请指定商品分类！'
                        />
                    </Item>
                    <Item label='商品图片'>
                        <PicturesWall
                            ref={this.pwRef}
                            imgs={product.imgs} //当前商品的图片数组
                        />
                    </Item>
                    <Item
                        label='商品详情'
                        labelCol={{ span: 0 }}
                        wrapperCol={{ span: 20 }}
                    >
                        <RichTextEdtior
                            ref={this.editorRef}
                            detail={product.detail}
                        />
                    </Item>
                    <Item>
                        <Button type='primary' htmlType="submit" onClick={this.submit}>提交</Button>
                    </Item>

                </Form>
            </Card>
        )
    }
}

/*
    1.子组件调用父组件的方法：将父组件的方法以函数的形式传递给子组件，子组件就可以调用
    2.父组件调用子组件的方法：在父组件中通过ref得到子组件标签对象（也就是组件对象），调用其方法
*/