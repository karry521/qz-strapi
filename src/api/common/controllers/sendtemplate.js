const dayjs = require('dayjs')
const validateData = require('../../../utils/validateData')
const jwt = require('jsonwebtoken')
const { readFile } = require(`../../../emailTemplate/index.js`);

module.exports = {
    async findMany(ctx) { // 批量查询邮件模板
        const { offset, pageNum, orderBy, sortBy } = ctx.query

        const result = await strapi.db.query('api::send-template.send-template').findMany({
            offset: offset,
            limit: pageNum,
            orderBy: { [orderBy]: sortBy }
        })

        return result
    },
    async findOne(ctx) { // 查询单个邮件模板
        const { name } = ctx.query

        const result = await strapi.db.query('api::send-template.send-template').findOne({ where: { name } })

        return result
    },
    async update(ctx) { // 修改单个邮件模板content
        const { name, content } = ctx.request.body

        try {
            const result = await strapi.db.query('api::send-template.send-template').update({
                where: { name },
                data: {
                    content
                }
            })

            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async sendResetPasswordEmail(ctx) { // 发送重置密码邮件
        const { email } = ctx.request.body

        // 校验邮箱格式
        const validate = validateData({ email }, {
            email: ['string', 'require', 'email']
        })

        if (validate.check) return validate

        try {
            // 查询该邮箱是否已注册
            const user = await strapi.service('api::user.user').findOne({
                email
            })

            // 未注册直接返回
            if (!user) return { code: 401, msg: '电子邮件地址未注册，您可以直接注册' }

            // 查询是否还有未过期的临时token
            const tempData = await strapi.db.query('api::user-action-temp.user-action-temp').findOne({
                where: {
                    email,
                    action: 'User Action Send Reset Password Email'
                },
                orderBy: { createdAt: 'DESC' }
            })

            // 存在临时记录且时间相近
            if (tempData && (1800 - dayjs().diff(dayjs(tempData.createdAt), 'seconds') > 300)) return { code: 200, msg: '已发送电子邮件，请检查您的邮箱' }

            // 生成插入本次操作过期时间等内容
            const temp = {
                email,
                action: 'User Action Send Reset Password Email',
                token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: "30m"
                }),
                expire_date: dayjs().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
                useNum: 0
            }

            // 调用发送邮箱方法
            const result = await readFile('resetPassword', 'resetPassword', email, [
                { key: 'onlineAddress', value: 'http://localhost:1337' },
                { key: 'siteLogo', value: '/admin/70674f63fc3904c20de0.svg' },
                { key: 'webSite', value: '乐数取证' },
                { key: 'clientAddress', value: process.env.CLIENT_ADDRESS },
                { key: 'token', value: temp.token },
                { key: 'demoAddress', value: `${process.env.CLIENT_ADDRESS$}/demo` }
            ])

            console.log('result:::', result)

            // 插入至临时表
            await strapi.db.query('api::user-action-temp.user-action-temp').create({
                data: temp
            })

            // 插入日志
            await strapi.service('api::common.common').userLog({
                email: email,
                description: 'User Action Send Reset Password Email'
            })

            return { code: 200, msg: '电子邮件发送成功' }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    }
}