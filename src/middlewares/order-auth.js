const dayjs = require('dayjs')
const validateData = require('../utils/validateData')

// 校验用户订阅是否过期
module.exports = (config, { strapi }) => {
    return async (context, next) => {
        const { body, query, method } = context.request

        const isGet = method.toLowerCase() === 'get' ? true : false
        const email = isGet ? query.email : body.email
        const advanced = isGet ? query.advanced : body.advanced

        // 校验用户邮箱
        const validate = validateData({ email, advanced }, {
            email: ['string', 'require', 'email'],
            advanced: ['string', 'require']
        })

        if (validate.check) {
            context.body = {
                code: 400,
                msg: JSON.stringify(validate.data)
            }

            return
        }

        // 查询用户信息
        const user = await strapi.service('api::user.user').findOne({
            email
        })

        // 获取服务到期时间
        const expireTime = advanced === 'Y' ? dayjs(user.advanced_expire_time).valueOf() : dayjs(user.basic_expire_time).valueOf()

        // 服务已到期或未订阅
        if (expireTime < dayjs().valueOf()) {
            context.body = {
                code: 401,
                msg: '订阅的服务时间已到期或未订阅，请先订阅服务'
            }

            return
        }

        return next()
    }
}