module.exports = {
    routes: [
        { // 批量查询邮件模板
            method: 'GET',
            path: '/sendTemplate/findMany',
            handler: 'sendtemplate.findMany',
            config: {
                auth: false
            }
        },
        { // 查询单个邮件模板
            method: 'GET',
            path: '/sendTemplate/findOne',
            handler: 'sendtemplate.findOne',
            config: {
                auth: false
            }
        },
        { // 修改单个邮件模板content
            method: 'PUT',
            path: '/sendTemplate/update',
            handler: 'sendtemplate.update',
            config: {
                auth: false
            }
        },
        { // 发送重置密码邮件
            method: 'POST',
            path: '/sendResetPasswordEmail',
            handler: 'sendtemplate.sendResetPasswordEmail',
            config: {
                auth: false
            }
        }
    ]
}