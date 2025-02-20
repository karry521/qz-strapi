const axios = require('axios')
const dayjs = require('dayjs')

// 网关转发
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

        // 网关转发
        const result = await request('/v5/client/icloud/auth/cookie', 'POST', {
            mode: body.mode, // 1:基础模式  2:高级模式
            username: body.username
        })

        ctx.body = result.data
    },
    async HomeSummary(ctx) { // 获取dashboard页面统计图数据
        const { dates, orderType } = ctx.query

        try {
            const startOfDay = dates && dates.length === 2 ? dayjs(dates[0]).format('YYYY-MM-DD') : dayjs().subtract(30, 'days').format('YYYY-MM-DD')
            const endOfDay = dates && dates.length === 2 ? dayjs(dates[1]).format('YYYY-MM-DD') : dayjs().endOf('days').format('YYYY-MM-DD')

            // 开始时间与结束时间天数之差
            const diff = dayjs(endOfDay).diff(startOfDay, 'days') + 1

            // 创建knex实例
            const knex = strapi.db.connection

            // 获取近一个月每天注册用户数量
            const queryRegister = knex.raw(`
                SELECT DATE(created_at) AS date, COUNT(*) AS registerNum FROM up_users
                WHERE DATE(created_at) BETWEEN ? AND ?
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `, [startOfDay, endOfDay])

            let whereRaw = 'DATE(o.created_at) BETWEEN ? AND ?'

            if (Number(orderType) !== -1) whereRaw += ` AND ${Number(orderType) === 0 ? `p.renew = 'N'` : `p.renew = 'Y'`}`

            // 获取近一个月每天的订单信息
            const queryOrder = knex.raw(`
                SELECT
                    DATE(o.created_at) AS date,
                    ROUND(SUM(o.amount) / 100, 2) AS totalAmount,
                    ROUND(SUM(CASE WHEN p.renew = 'Y' THEN o.amount ELSE 0 END) / 100, 2) AS renewAmount,
                    ROUND(SUM(CASE WHEN p.renew = 'N' THEN o.amount ELSE 0 END) / 100, 2) AS notRenewAmount,
                    COUNT(CASE WHEN p.renew = 'Y' THEN 1 END) AS renewNum,
                    COUNT(*) AS orderNum
                FROM orders as o
                INNER JOIN products AS p on o.product_id = p.id
                WHERE ${whereRaw}
                GROUP BY DATE(o.created_at)
                ORDER BY DATE(o.created_at) ASC
                `, [startOfDay, endOfDay])

            const [registerArr, orderArr] = await Promise.all([queryRegister, queryOrder])

            const result = []
            let nowData = null

            let nowDate = startOfDay

            // 生成对应天数的空数据
            for (let i = 1; i <= diff; i++) {

                nowData = {
                    date: nowDate,
                    registerNum: 0,
                    totalAmount: 0,
                    renewAmount: 0,
                    notRenewAmount: 0,
                    renewNum: 0,
                    orderNum: 0
                }

                // 合并注册的统计数据
                registerArr[0].forEach(item => {
                    if (item.date === nowDate) nowData.registerNum = item.registerNum
                })

                // 合并订单的统计数据
                orderArr[0].forEach(item => {
                    if (item.date === nowDate) nowData = {
                        ...nowData,
                        totalAmount: item.totalAmount,
                        renewAmount: item.renewAmount,
                        notRenewAmount: item.notRenewAmount,
                        renewNum: item.renewNum,
                        orderNum: item.orderNum
                    }
                })

                result.push(nowData)

                nowDate = dayjs(nowDate).add(1, 'days').format('YYYY-MM-DD')
            }

            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async HomeRegisterCount(ctx) { // 获取dashboard页面注册统计
        const { dates } = ctx.query

        const startOfDay = dates && dates.length === 2 ? dayjs(dates[0]).format('YYYY-MM-DD') : dayjs().subtract(30, 'days').format('YYYY-MM-DD') // 时间范围开始日期
        const endOfDay = dates && dates.length === 2 ? dayjs(dates[1]).format('YYYY-MM-DD') : dayjs().endOf('days').format('YYYY-MM-DD') // 时间范围结束日期
        const today = dayjs().format('YYYY-MM-DD') // 当天日期

        try {
            const result = await strapi.db.connection.raw(`
                SELECT 
                    COUNT(*) AS today,
                    (SELECT COUNT(*) FROM up_users WHERE DATE(created_at) BETWEEN ? AND ?) AS month,
                    (SELECT COUNT(*) FROM up_users) AS total
                FROM up_users
                WHERE DATE(created_at) = ?
                `, [startOfDay, endOfDay, today])

            return {
                code: 200,
                data: result[0][0]
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async HomeOrderCount(ctx) { // 获取dashboard页面订单统计
        const { dates } = ctx.query

        const startOfDay = dates && dates.length === 2 ? dayjs(dates[0]).format('YYYY-MM-DD') : dayjs().subtract(30, 'days').format('YYYY-MM-DD') // 时间范围开始日期
        const endOfDay = dates && dates.length === 2 ? dayjs(dates[1]).format('YYYY-MM-DD') : dayjs().endOf('days').format('YYYY-MM-DD') // 时间范围结束日期
        const today = dayjs().format('YYYY-MM-DD') // 当天日期

        try {
            const result = await strapi.db.connection.raw(`
                SELECT 
                    COUNT(*) AS today,
                    (SELECT COUNT(*) FROM orders WHERE payment_status = '0' AND DATE(created_at) BETWEEN ? AND ?) AS month,
                    (SELECT COUNT(*) FROM orders WHERE payment_status = '0') AS total
                FROM orders
                WHERE payment_status = '0' AND DATE(created_at) = ?
                `, [startOfDay, endOfDay, today])

            return {
                code: 200,
                data: result[0][0]
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async HomeOrderPayCount(ctx) { // 获取dashboard页面订阅订单统计
        const { dates, type } = ctx.query

        const startOfDay = dates && dates.length === 2 ? dayjs(dates[0]).format('YYYY-MM-DD') : dayjs().subtract(30, 'days').format('YYYY-MM-DD') // 时间范围开始日期
        const endOfDay = dates && dates.length === 2 ? dayjs(dates[1]).format('YYYY-MM-DD') : dayjs().endOf('days').format('YYYY-MM-DD') // 时间范围结束日期
        const today = dayjs().format('YYYY-MM-DD') // 当天日期

        try {
            let baseWhere = `WHERE payment_status = '0' AND renew = 'N'` // 通用的查询条件
            let whereData1 = [today] // today占位符数据
            let whereData2 = [startOfDay, endOfDay] // month占位符数据
            let whereData3 = [] // total占位符数据

            // 筛选支付方式
            if (type && type !== 'all') {
                baseWhere += ' AND payment_method = ?'
                whereData1 = [type, today]
                whereData2 = [type, startOfDay, endOfDay]
                whereData3 = [type]
            }

            const query1 = strapi.db.connection.raw(`SELECT COUNT(*) AS today1,SUM(amount) AS today2 FROM orders ${baseWhere} AND DATE(created_at) = ?`, [...whereData1])

            const query2 = strapi.db.connection.raw(`SELECT COUNT(*) AS month1,SUM(amount) AS month2 FROM orders ${baseWhere} AND DATE(created_at) BETWEEN ? AND ?`, [...whereData2])

            const query3 = strapi.db.connection.raw(`SELECT COUNT(*) AS total1,SUM(amount) AS total2 FROM orders ${baseWhere}`, [...whereData3])

            const [result1, result2, result3] = await Promise.all([query1, query2, query3])

            return {
                code: 200,
                data: {
                    today1: result1[0][0].today1 || 0,
                    month1: result2[0][0].month1 || 0,
                    total1: result3[0][0].total1 || 0,
                    today2: result1[0][0].today2 || 0,
                    month2: result2[0][0].month2 || 0,
                    total2: result3[0][0].total2 || 0
                }
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async HomeRenewPayCount(ctx) { // 获取dashboard页面续订订单统计
        const { dates, type } = ctx.query

        const startOfDay = dates && dates.length === 2 ? dayjs(dates[0]).format('YYYY-MM-DD') : dayjs().subtract(30, 'days').format('YYYY-MM-DD') // 时间范围开始日期
        const endOfDay = dates && dates.length === 2 ? dayjs(dates[1]).format('YYYY-MM-DD') : dayjs().endOf('days').format('YYYY-MM-DD') // 时间范围结束日期
        const today = dayjs().format('YYYY-MM-DD') // 当天日期

        try {
            let baseWhere = `WHERE payment_status = '0' AND renew = 'Y'` // 通用的查询条件
            let whereData1 = [today] // today占位符数据
            let whereData2 = [startOfDay, endOfDay] // month占位符数据
            let whereData3 = [] // total占位符数据

            // 筛选支付方式
            if (type && type !== 'all') {
                baseWhere += ' AND payment_method = ?'
                whereData1 = [type, today]
                whereData2 = [type, startOfDay, endOfDay]
                whereData3 = [type]
            }

            const query1 = strapi.db.connection.raw(`SELECT COUNT(*) AS today1,SUM(amount) AS today2 FROM orders ${baseWhere} AND DATE(created_at) = ?`, [...whereData1])

            const query2 = strapi.db.connection.raw(`SELECT COUNT(*) AS month1,SUM(amount) AS month2 FROM orders ${baseWhere} AND DATE(created_at) BETWEEN ? AND ?`, [...whereData2])

            const query3 = strapi.db.connection.raw(`SELECT COUNT(*) AS total1,SUM(amount) AS total2 FROM orders ${baseWhere}`, [...whereData3])

            const [result1, result2, result3] = await Promise.all([query1, query2, query3])

            return {
                code: 200,
                data: {
                    today1: result1[0][0].today1 || 0,
                    month1: result2[0][0].month1 || 0,
                    total1: result3[0][0].total1 || 0,
                    today2: result1[0][0].today2 || 0,
                    month2: result2[0][0].month2 || 0,
                    total2: result3[0][0].total2 || 0
                }
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async HomeTotalCount(ctx) { // 获取dashboard页面总金额统计
        const { dates, type } = ctx.query

        const startOfDay = dates && dates.length === 2 ? dayjs(dates[0]).format('YYYY-MM-DD') : dayjs().subtract(30, 'days').format('YYYY-MM-DD') // 时间范围开始日期
        const endOfDay = dates && dates.length === 2 ? dayjs(dates[1]).format('YYYY-MM-DD') : dayjs().endOf('days').format('YYYY-MM-DD') // 时间范围结束日期
        const today = dayjs().format('YYYY-MM-DD') // 当天日期

        try {
            let baseWhere = `WHERE payment_status = '0'` // 通用的查询条件
            let whereData = [startOfDay, endOfDay, today] // 占位符数据

            // 筛选支付方式
            if (type && type !== 'all') {
                baseWhere += ' AND payment_method = ?'
                whereData = [type, startOfDay, endOfDay, type, type, today]
            }

            const result = await strapi.db.connection.raw(`
                SELECT 
                    SUM(amount) AS today,
                    (SELECT SUM(amount) FROM orders ${baseWhere} AND DATE(created_at) BETWEEN ? AND ?) AS month,
                    (SELECT SUM(amount) FROM orders ${baseWhere}) AS total
                FROM orders
                ${baseWhere} AND DATE(created_at) = ?
            `, [...whereData])

            return {
                code: 200,
                data: result[0][0]
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    }
}