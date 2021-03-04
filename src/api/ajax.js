/* 
    能发送ajax请求的函数类型的模块
        封装axios库
        函数的返回值是promise对象 
    优化1：统一处理请求异常?
        在外层包一个自己创建的promise对象
        在请求出错时，不去reject(error)，而是显示错误提示
    优化2：异步直接得到response.data而不是仅获取到response
        在请求成功resolve时：resolve(response.data)
*/
import axios from 'axios'
import { message } from 'antd'

export default function ajax(url, data = {}, type = 'GET') {
    // 1. 优化：统一处理请求异常
    return new Promise((resolve, reject) => {
        let promise
        // 1.异步执行ajax请求
        if (type === 'GET') {
            promise = axios.get(url, { //配置对象（属性名不可以任意写）
                params: data
            });
        } else {
            promise = axios.post(url, data);
        }
        // 2. 如果成功了，调用resolve(value)
        promise.then(response => {
            resolve(response.data)

        // 3. 如果失败了，调用reject(reason),而是提示异常信息
        }).catch(error => {
            message.error('请求出错了：' + error.message)
        })
    })
}

