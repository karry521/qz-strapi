module.exports = (strapi) => {
    // 确保http服务器已启动
    if (strapi.server && strapi.server.httpServer) {

        // 引入 socket.io 模块
        const io = require('socket.io')(strapi.server.httpServer, {
            // 初始化 socket.io 实例，挂载到 Strapi 的 HTTP 服务器上
            // 配置对象解释：
            // - cors: 跨域资源共享配置，允许哪些来源的请求能连接上来
            //   origin: '*' 表示允许所有来源（在生产环境下，建议设置具体的域名）https://example.com
            //   methods: ['GET', 'POST'] 表示只允许 GET 和 POST 请求的 WebSocket 连接
            cors: {
                origin: '*', // 允许所有域名连接
                methods: ['GET', 'POST']
            }
        })

        // 定义一个数组，用于存储连接的用户信息
        let activeUsers = []

        // 处理 WebSocket 连接事件
        io.on('connection', (socket) => {

            // 记录连接成功日志
            strapi.log.info(`WebSocket connected::: ${socket.id}`)

            // 监听用户绑定情况事件
            socket.on('user-account', async ({ email }) => {

                try {
                    // email保存到socket中
                    socket.data.email = email

                    // 加入房间，多设备登录同一账号会全部加入同一个房间
                    socket.join(email + '-user-account')

                    // 获取当前用户的绑定情况
                    const result = await strapi.service('api::common.common').findUserBindInfo(email)

                    // 发送最新的绑定设备信息到客户端
                    socket.emit('user-subscribe-update', result)
                } catch (e) {
                    strapi.log.error('user-account Error:::', e.message)
                }
            })

            // 处理 WebSocket 断开连接事件
            socket.on('disconnect', async () => {
                const email = socket.data.email // 取出存储的 email
                if (email) {
                    socket.leave(email + '-user-account') // 断开时主动退出房间
                    strapi.log.info(`WebSocket disconnected: ${socket.id}, left room: ${email}-user-account`)
                }

                strapi.log.info(`WebSocket disconnected: ${socket.id}`)
            })
        })

        // 将 socket.io 实例挂载到 strapi 对象上，这样在其他控制器或服务中可以使用 strapi.io 进行消息推送
        strapi.io = io
    } else {
        strapi.log.error("HTTP Server is not available. Cannot initialize WebSocket.")
    }
}