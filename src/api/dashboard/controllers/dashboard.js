const axios = require('axios')
const validateData = require('../../../utils/validateData')
const request = async (url, method, data) => {
    console.log('url:::', process.env.BASE_ADDRESS + url)
    return await axios({
        url: process.env.BASE_ADDRESS + url,
        method,
        data
    })
}

module.exports = {
    async findManyDevice(ctx) { // 获取单用户得所有设备信息
        const { email } = ctx.query

        const validate = validateData({ email }, {
            email: ['string', 'require', 'email']
        })

        // 校验邮箱
        if (validate.check) return validate

        // 查询用户所有设备信息
        const user = await strapi.service('api::user.user').findOne({
            email
        }, ['devices'])

        console.log('devices:::', Array.from(user.devices).map(item => ({ account: item.account, password: item.password })))

        return { code: 200, data: [] }
    },
    async icloudLogin(ctx) { // icloud账号登录

        const { body } = ctx.request

        // 校验参数
        const validate = validateData(body, {
            username: ['string', 'require'],
            password: ['string', 'require']
        })

        if (validate.check) return validate

        // 网关转发
        const result = await request('/v5/client/icloud/auth/login', 'POST', {
            mode: 1,
            username: body.username,
            password: body.password
        })

        console.log(result.config.url, result.status, result.data)

        return { code: 200, msg: '123' }
    }
}