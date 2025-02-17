
const validateData = require('../../../utils/validateData')
const { verifyToken } = require('../../../utils/common')
const dayjs = require('dayjs')
const { decodeJwtToken } = require("@strapi/admin/server/services/token")
const { decode } = require('jsonwebtoken')
const jwt = require('jsonwebtoken')

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

                return { payload: verify, isValid: true }
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
        const { id } = ctx.query

        console.log('id:::', id)

        // 校验入参格式
        const validate = validateData({ id }, {
            id: ['number', 'require']
        })

        if (validate.check) return validate

        // 查询指定用户信息
        const user = await strapi.service('api::user.user').findOne({
            id: Number(id)
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
    },
    async createDeviceInfo(ctx) { // 创建设备信息
        const { body } = ctx.request

        const validate = validateData(body, {
            email: ['string', 'require', 'email'],
            account: ['string', 'require'],
            password: ['string', 'require']
        })

        // 校验参数
        if (validate.check) return validate

        try {
            // 查询用户所有设备信息
            const user = await strapi.service('api::user.user').findOne({
                email: body.email
            }, ['devices'])

            // 未注册
            if (!user) return { code: 401, status: -1, msg: '该邮箱未注册' }

            const devices = Array.from(user.devices).map(item => (item.account))

            // 已绑定过此ID
            if (devices.includes(body.account)) return { code: 401, status: -1, msg: '您已绑定过此ID' }

            // 判断是否绑定上限
            const deviceNum = Array.from(user.devices).length // 当前绑定设备数量
            let maxNum = 0 // 最大可绑定设备数量
            let basicNum = 0 // 初始可绑定数量
            let unlimitedNum = false // 是否无限制绑定数量

            const nowDate = dayjs().valueOf() // 当前时间时间戳

            // 基础服务未到期
            if (dayjs(user.basic_expire_time).valueOf() > nowDate) basicNum = Number(user.basic_basic_limit)

            // 高级服务未到期
            if (dayjs(user.advanced_expire_time).valueOf() > nowDate) {
                if (Number(user.advanced_basic_limit) === -1) unlimitedNum = true
                else basicNum = Number(user.advanced_basic_limit)
            }

            // 加上额外的设备数量
            maxNum = basicNum + Number(user.basic_extra_limit) + Number(user.advanced_extra_limit)

            console.log('basicNum:::', basicNum)
            console.log('maxNum:::', maxNum)

            if (deviceNum >= maxNum && !unlimitedNum) return { code: 200, status: 5254, msg: '用户绑定数量已上限' }

            // 绑定
            const newDevice = await strapi.db.query('api::device.device').create({
                data: {
                    account: body.account,
                    password: body.password,
                    isVerify: body.isVerify || false,
                    user: user.id
                }
            })

            // 获取最新的用户绑定情况
            const info = await strapi.service('api::common.common').findUserBindInfo(user.email)

            if (strapi.io) {
                strapi.io.to(user.email + '-user-account').emit('user-subscribe-update', info)
            }

            return { code: 200, status: 0, msg: 'success', data: newDevice }
        } catch (e) {
            return { code: 500, status: -1, msg: e.message }
        }
    },
    async findManyDevice(ctx) { // 获取单用户的所有设备信息
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

        // 未注册
        if (!user) return { code: 401, msg: '该邮箱未注册' }

        const devices = Array.from(user.devices).map(item => ({ account: item.account, password: item.password }))

        return { code: 200, data: devices }
    },
    async findUserBindInfo(ctx) { // 获取用户绑定情况
        const { email } = ctx.query

        const validate = validateData({ email }, {
            email: ['string', 'require', 'email']
        })

        // 校验邮箱
        if (validate.check) return validate

        return await strapi.service('api::common.common').findUserBindInfo(email)
    },
    async deleteDevice(ctx) { // 删除绑定的设备信息
        const { email, account } = ctx.request.body

        const validate = validateData({ email, account }, {
            email: ['string', 'require', 'email'],
            account: ['string', 'require']
        })

        // 校验邮箱
        if (validate.check) return validate

        try {
            // 判断设备信息是否存在
            const device = await strapi.db.query('api::device.device').findOne({
                where: {
                    account,
                    user: {
                        email
                    }
                }
            })

            // 不存在该设备
            if (!device) return { code: 401, msg: '用户未绑定该设备信息，无需删除' }


            // 删除指定设备信息
            const result = await strapi.db.query('api::device.device').delete({
                where: {
                    account,
                    user: {
                        email
                    }
                }
            })

            // 获取最新的用户绑定情况
            const info = await strapi.service('api::common.common').findUserBindInfo(email)

            if (strapi.io) {
                strapi.io.to(email + '-user-account').emit('user-subscribe-update', info)
            }

            return { code: 200, msg: '删除绑定设备成功' }
        } catch (e) {
            return { code: 500, msg: e.mmessage }
        }
    },
    async updateDevice(ctx) { // 修改设备密码
        const { email, account, password } = ctx.request.body

        const validate = validateData({ email, account, password }, {
            email: ['string', 'require', 'email'],
            account: ['string', 'require'],
            password: ['string', 'require']
        })

        // 校验邮箱
        if (validate.check) return validate

        try {
            // 获取用户信息
            const user = await strapi.service('api::user.user').findOne({
                email
            }, ['devices'])

            // 用户不存在
            if (!user) return { code: 401, msg: '用户不存在' }

            // 判断设备信息是否存在
            const devices = Array.from(user.devices).filter(item => item.account === account)

            // 不存在该设备
            if (devices.length <= 0) return { code: 401, msg: '不存在该设备信息' }

            // 旧密码新密码一致
            if (devices[0].password === password) return { code: 401, msg: '新密码与旧密码一致，无需修改' }

            // 修改指定设备密码
            const result = await strapi.db.query('api::device.device').update({
                where: {
                    account,
                    user: {
                        email
                    }
                },
                data: {
                    password
                }
            })

            return { code: 200, msg: '修改设备密码成功' }
        } catch (e) {
            return { code: 500, msg: e.mmessage }
        }
    },
    async findOneSubscribe(ctx) { // 查询单个用户订阅信息

        const { id } = ctx.query

        const validate = validateData({ id }, {
            id: ['string', 'require']
        })

        // 校验邮箱
        if (validate.check) return validate

        try {
            const nowDate = dayjs().format('YYYY-MM-DD HH:mm:ss') // 当前时间

            let query = strapi.db.connection('up_users as u')
                .join('orders as o', 'u.id', 'o.user_id')
                .join('products as p', 'o.product_id', 'p.id')
                .select('p.name', 'p.type', 'p.json', 'p.priority', 'u.basic_expire_time', 'u.advanced_expire_time')
                .where('u.id', id)
                .where('o.payment_status', '0')
                .where('o.expire_time', '>', nowDate)
                .orderBy('o.created_at', 'desc')

            const result = await query

            const order = Array.from(result).sort((a, b) => {
                // 按照 priority 排序，越小越优先
                if (a.priority !== b.priority) {
                    return a.priority - b.priority
                }
                // 如果 priority 相同，则 type 为 business 的优先
                if (a.type === 'business' && b.type !== 'business') {
                    return -1 // a 优先
                }
                if (a.type !== 'business' && b.type === 'business') {
                    return 1 // b 优先
                }
                return 0 // 如果 type 也相同，则认为平级
            })[0]

            return {
                code: 200,
                data: {
                    name: order.name,
                    textArr: order.json.list,
                    basicExpireTime: result[0].basic_expire_time,
                    advancedExpireTime: result[0].advanced_expire_time
                }
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    }
}