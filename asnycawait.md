asnyc 和 await
1. 作用？
   简化promise对象的使用：不用再使用then来指定成功/失败的回调函数
   以同步编码的方式（没有回调函数了）实现异步流程
2. 哪里写await？
    在返回promise的表达式左侧写await:不想要promise，想要promise异步执行的成功的value（response）数据
3. 哪里写asnyc？
    await所在函数（最近的）定义的左侧