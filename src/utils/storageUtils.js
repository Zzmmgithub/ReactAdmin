/* 
    local数据存储管理的工具模块
    登陆后, 关闭浏览器后打开浏览器访问依然是已登陆状态(自动登陆)
*/
import store from 'store' //使用store库可以解决兼容性问题，简化语法，且可以自动转化格式
const USER_KEY = 'user_key'
export default {
    // 保存user
    saveUser(user) {
        // localStorage.setItem(USER_KEY, JSON.stringify(user))
        store.set(USER_KEY, user)
    },
    // 读取user
    getUser() {
        // return JSON.parse(localStorage.getItem(USER_KEY) || '{}')
        return store.get(USER_KEY)||{}
    },
    // 删除user
    removeUser() {
        // localStorage.removeItem(USER_KEY)
        store.remove(USER_KEY)
    }
}