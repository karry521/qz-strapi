
const validateData = require('../../../utils/validateData')
const { verifyToken } = require('../../../utils/common')
const dayjs = require('dayjs')
const { decodeJwtToken } = require("@strapi/admin/server/services/token")
const { decode } = require('jsonwebtoken')

module.exports = {
    async verifyToken(ctx) { // 验证token是否有效
        const { body } = ctx.request

        // 校验入参格式
        const validate = validateData(body, {
            token: ['string', 'require'],
            type: ['number', 'require']
        })

        if (validate.check) return validate

        try {
            const { token, type } = body

            // 验证token
            if (Number(type) === 0) { // 验证有效期
                const verify = decodeJwtToken(token)

                return verify
            } else { // 不验证有效期
                const verify = decode(token)

                if (!verify) return { payload: null, isValid: false }

                return { payload: verify }
            }

            // const verify = await verifyToken(token)
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async findProducts(ctx) { // 获取所有产品信息
        const { renew } = ctx.query

        const queryOptions = {
            where: {}
        }

        if (renew) queryOptions.where.renew = renew

        // 获取数据
        const response = await strapi.db.query('api::product.product').findMany({
            ...queryOptions
        })

        return { code: 200, data: response }
    },
    async findOneProduct(ctx) { // 获取单个产品信息
        const { id } = ctx.query

        // 校验入参格式
        const validate = validateData({ id }, {
            id: ['number', 'require']
        })

        if (validate.check) return validate

        // 获取数据
        const response = await strapi.db.query('api::product.product').findOne({
            where: { id }
        })

        return { code: 200, data: response }
    },
    async someProducts(ctx) { // 检查用户是否有未过期的订阅订单
        const { userId } = ctx.query

        console.log('userId:::', userId)

        // 校验入参格式
        const validate = validateData({ userId }, {
            userId: ['number', 'require']
        })

        if (validate.check) return validate

        // 查询指定用户信息
        const user = await strapi.service('api::user.user').findOne({
            id: Number(userId)
        }, ['orders'])

        if (!user) return { code: 401, msg: '用户不存在' }

        // 筛选符合条件的订单
        const orders = Array.from(user.orders).filter(item => item.payment_status === '0' && dayjs(item.expire_time).valueOf() > dayjs().valueOf())

        // 查询是否有订阅产品
        const products = await strapi.db.query('api::product.product').count({
            where: {
                id: {
                    $in: orders.map(item => (item.product_id))
                },
                renew: 'N'
            }
        })

        // 没有订阅中的产品
        if (products === 0) return { code: 401, msg: '没有未过期的订阅中产品，请先订阅产产品' }

        return { code: 200, msg: '有未过期的订阅，验证通过' }
    },
    async findOneAppInfo(ctx) { // 获取指定app信息（下载地址
        const { name } = ctx.query

        // 校验参数
        const validate = validateData({ name }, {
            name: ['string', 'require']
        })

        if (validate.check) return validate

        // 获取app信息
        const response = await strapi.db.query('api::app-version.app-version').findOne({
            where: { name }
        })

        // app信息不存在
        if (!response) return { code: 200, msg: '未查询到对应的app信息' }

        return { code: 200, data: response.info }
    }
}