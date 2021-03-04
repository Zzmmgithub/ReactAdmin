import React, { Component } from 'react'
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types'

import { reqDeleteImages } from '../../api/index'
import {BASE_IMG_URL} from '../../utils/constants'

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

class PicturesWall extends Component {
    static propTypes = {
        imgs: PropTypes.array
    }
    constructor(props) { // 这种方式更好
        super(props)
        let fileList = []  // 先初始化为空数组
        const { imgs } = this.props
        if (imgs && imgs.length > 0) {/* 如果imgs数组存在并且该数组有值 */
            fileList = imgs.map((item, index) => ({/* value是图片名，即数组里的每个元素 */
                uid: -index,/*文件唯一标识，建议设置为负数，防止和内部产生的 id 冲突 */
                name: item, /* 文件名 xxx.xxx*/
                status: 'done',/* 图片状态。done：已上传；uploading:上传中；removed：.. */
                url: BASE_IMG_URL + item, /* 图片url */
            }))

        }
        this.state = {
            previewVisible: false,/* 标识是否显示大图预览Modal */
            previewImage: '',/* 预览大图的url */
            previewTitle: '',
            fileList: fileList,
        };
    }

    /* 获取所有已上传图片文件名的数组 */
    getImags = () => {
        return this.state.fileList.map((item, index) => item.name)
    }
    /* 隐藏modal */
    handleCancel = () => this.setState({ previewVisible: false });
    /* 显示指定file对应的大图 */
    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };
    /* 
        file:当前操作的图片文件 (上传/删除)
        fileList:所有已上传图片文件的数组
    */
    handleChange = async ({ file, fileList }) => {
        // console.log('file', file)
        // 一旦上传成功，就将file的信息修正 （name,url)
        if (file.status === 'done') {
            const result = file.response
            if (result.status === 0) {
                message.success('图片上传成功')
                const { name, url } = result.data
                file = fileList[fileList.length - 1]
                file.name = name
                file.url = url
            } else {
                message.error('图片上传失败')
            }
        } else if (file.status === 'removed') { // 删除图片
            // 因为前台点击了删除键，此时fileList已经是删除后的数组了
            const result = await reqDeleteImages(file.name)
            if (result.status === 0) {
                message.success('删除图片成功')
            } else {
                message.error('删除图片失败')
            }
        }
        this.setState({ fileList });
    }

    render() {
        const { previewVisible, previewImage, fileList, previewTitle } = this.state;
        const uploadButton = (
            <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
            </div>
        );
        return (
            <>
                <Upload
                    action="/manage/img/upload"  // 上传图片的接口地址
                    accept='image/*'  //只接受图片类型的文件
                    name='image'  //请求参数名
                    listType="picture-card" // 卡片样式
                    fileList={fileList}  // 所有已上传文件对象的数组
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                >
                    {fileList.length >= 8 ? null : uploadButton}{/* 可上传图片上的数量上限 */}
                </Upload>
                <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </>
        );
    }
}

export default PicturesWall