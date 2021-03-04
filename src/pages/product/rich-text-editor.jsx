/* 
    用来指定商品详情的富文本编辑器组件
*/
import React, { Component } from 'react'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import PropTypes from 'prop-types'


export default class RichTextEdtior extends Component {
    static propTypes = {
        detail: PropTypes.string
    }
    constructor(props) {
        super(props)
        const html = this.props.detail
        let editorState
        if (html) {
            const contentBlock = htmlToDraft(html)
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
                editorState = EditorState.createWithContent(contentState)
            }
        } else {
            editorState = EditorState.createEmpty() // 创建一个没有内容的编辑器对象
        }
        this.state = {
            editorState,
        }
    }
    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        })
    }
    /* 获取当前商品的详情输入，用于父组件addupdate主动获取子组件富文本编辑器的新内容 */
    getDetail = () => {
        // 返回当前输入数据的html格式的文本
        return draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
    }
    uploadImageCallBack = (file) => {
        return new Promise(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', '/manage/img/upload')
                const data = new FormData()
                data.append('image', file)
                xhr.send(data)
                xhr.addEventListener('load', () => { /* 图片上传成功后的回调函数 */
                    const response = JSON.parse(xhr.responseText)
                    const { url } = response.data // 得到图片的url
                    resolve({ data: { link: url } }) /* 这是这个库上传图片时的一个格式 */
                })
                xhr.addEventListener('error', () => {
                    const error = JSON.parse(xhr.responseText)
                    reject(error)
                })
            }
        )
    }
    render() {
        const { editorState } = this.state
        // console.log(editorState)
        return (
            <Editor
                editorState={editorState}
                wrapperClassName="demo-wrapper"
                editorClassName="demo-editor"/* 这里两行是指定类名，然后可以通过在css指定类名来修改样式 */
                /* 我们也可以通过下面这种方式来设置样式 */
                editorStyle={{ border: '1px solid grey', minHeight: 200, paddingLeft: 15 }}
                onEditorStateChange={this.onEditorStateChange}
                toolbar={{
                    image: { uploadCallback: this.uploadImageCallBack, alt: { present: true, mandatory: true } },
                }}
            />
        )
    }
}