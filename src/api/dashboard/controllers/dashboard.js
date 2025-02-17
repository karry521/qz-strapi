const axios = require('axios')
const dayjs = require('dayjs')

const request = async (url, method, data) => {
    return await axios({
        url: process.env.BASE_ADDRESS + url,
        method,
        data
    })
}

module.exports = {
    async icloudReset(ctx) { // icloud重置状态
        const { body } = ctx.request

        // 网关转发
        const result = await request('/v5/client/icloud/auth/reset', 'POST', {
            mode: body.mode, // 1:基础模式  2:高级模式
            username: body.username
        })

        ctx.body = result.data
    },
    async icloudLogin(ctx) { // icloud登录or发送短信验证码
        const { body } = ctx.request

        const dataJson = {
            mode: body.mode, // 1:基础模式  2:高级模式
            username: body.username,
            password: body.password
        }

        // 短信验证码
        if (body.verifyType === 'sms') {
            dataJson.verifyType = body.verifyType
            dataJson.deviceid = body.deviceid
        }

        // 网关转发
        const result = await request('/v5/client/icloud/auth/login', 'POST', dataJson)

        ctx.body = result.data
    },
    async icloudAuthInfo(ctx) { // 获取icloud的手机号列表
        const { body } = ctx.request

        // 网关转发
        const result = await request('/v5/client/icloud/auth/authinfo', 'POST', {
            mode: body.mode, // 1:基础模式  2:高级模式
            username: body.username,
            password: body.password
        })

        ctx.body = result.data
    },
    async icloudVerify(ctx) { // icloud双重验证
        const { body } = ctx.request

        const dataJson = {
            mode: body.mode, // 1:基础模式  2:高级模式
            username: body.username,
            password: body.password,
            securityCode: body.securityCode // 验证码
        }

        // 短信验证码
        if (body.verifyType === 'sms') {
            dataJson.verifyType = body.verifyType
            dataJson.deviceid = body.deviceid
        }

        // 网关转发
        const result = await request('/v5/client/icloud/auth/verify', 'POST', dataJson)

        ctx.body = result.data
    },
    async icloudCookie(ctx) { // icloud下载cookie
        const { body } = ctx.request

        console.log('body:::', body)

        // 网关转发
        const result = await request('/v5/client/icloud/auth/cookie', 'POST', {
            mode: body.mode, // 1:基础模式  2:高级模式
            username: body.username
        })

        console.log('result:::', result)
        console.log('result.data:::', result.data)

        ctx.body = result.data
    },
    async HomeSummary(ctx) { // 获取dashboard页面统计图数据
        try {

            // 获取近三十天时间
            const startOfDay = dayjs().subtract(30, 'days').format('YYYY-MM-DD')
            const endOfDay = dayjs().endOf('days').format('YYYY-MM-DD')

            // 创建knex实例
            const knex = strapi.db.connection


            // .select(knex.raw('DATE(created_at) as date, COUNT(*) as count'))
            // .whereBetween('DATE(created_at)', [startOfDay, endOfDay])
            // .groupBy('DATE(created_at)')
            // .orderBy('DATE(created_at)', 'asc')

            // 获取近一个月每天注册用户数量
            const queryRegister = knex.raw(`
                SELECT DATE(created_at) AS date, COUNT(*) AS count FROM up_users
                WHERE DATE(created_at) BETWEEN ? AND ?
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `, [startOfDay, endOfDay])


            // 获取近一个月每天的订单信息
            const queryOrder = knex.raw(`
                SELECT
                    DATE(o.created_at) AS date,
                    ROUND(SUM(o.amount) / 100, 2) AS totalAmount,
                    ROUND(SUM(CASE WHEN p.renew = 'Y' THEN o.amount ELSE 0 END) / 100, 2) AS RenewAmount,
                    ROUND(SUM(CASE WHEN p.renew = 'N' THEN o.amount ELSE 0 END) / 100, 2) AS NotRenewAmount,
                    COUNT(CASE WHEN p.renew = 'Y' THEN 1 END) AS renewSum,
                    COUNT(*) AS count
                FROM orders as o
                INNER JOIN products AS p on o.product_id = p.id
                WHERE DATE(o.created_at) BETWEEN ? AND ?
                GROUP BY DATE(o.created_at)
                ORDER BY DATE(o.created_at) ASC
                `, [startOfDay, endOfDay])

            const [registerArr, orderArr] = await Promise.all([queryRegister, queryOrder])

            console.log('registerArr:::', registerArr[0])
            console.log('orderArr:::', orderArr[0])

            return { code: 500, data: [] }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    }
}