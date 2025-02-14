module.exports = {
    routes: [
        { // 批量查询邮件模板
            method: 'GET',
            path: '/send-template/list',
            handler: 'sendtemplate.findMany',
            config: {
                auth: false
            }
        },
        { // 查询单个邮件模板
            method: 'GET',
            path: '/send-template/one',
            handler: 'sendtemplate.findOne',
            config: {
                auth: false
            }
        },
        { // 修改单个邮件模板content
            method: 'PUT',
            path: '/send-template/update',
            handler: 'sendtemplate.update',
            config: {
                auth: false
            }
        },
        { // 发送重置密码邮件
            method: 'POST',
            path: '/send-reset-password-email',
            handler: 'sendtemplate.sendResetPasswordEmail',
            config: {
                auth: false
            }
        }
    ]
}