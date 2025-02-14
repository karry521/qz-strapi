'use strict'

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories
const dayjs = require('dayjs')

/**
 * @type {import('@strapi/strapi').Strapi}
 *  确保使用db操作时有提示
 */
const strapiInstance = strapi

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    async list(ctx) { // 获取多个订单信息
        const query = ctx.query

        // 是否到期
        const expireStatus = query.expire_status === '1' ? 1 : query.expire_status === '0' ? 0 : -1
        const nowDate = dayjs().format('YYYY-MM-DD HH:mm:ss') // 当前时间
        const queryType = Number(query.queryType) // 查询类型

        try {

            let orderList = strapiInstance.db.connection('orders as o')
                .join('up_users as u', 'o.user_id', 'u.id')
                .join('products as p', 'o.product_id', 'p.id')
                .select('o.id', 'p.name', 'p.type', 'u.email', 'o.amount', 'o.merchant_no', 'o.trade_no', 'o.payment_method', 'o.payment_status', 'o.created_at', 'o.expire_time')
                .orderBy('o.created_at', 'desc')

            // 添加筛选条件
            if (query.merchant_no) orderList.where('o.merchant_no', 'like', `${query.merchant_no}%`)
            if (query.trade_no) orderList.where('o.trade_no', 'like', `${query.trade_no}%`)
            if (query.email) orderList.where('u.email', 'like', `${query.email}%`)
            if (query.payment_method !== 'all') orderList.where('o.payment_method', query.payment_method)
            if (query.payment_status !== 'all') orderList.where('o.payment_status', query.payment_status)
            if (query.product !== 'all') orderList.where('p.name', query.product)
            if (query.product_type !== 'all') orderList.where('p.type', query.product_type)
            if (expireStatus !== -1) orderList.where('o.expire_time', expireStatus === 1 ? '<' : '>', nowDate)
            if (Array.isArray(query.order_time) && query.order_time.length === 2 && query.order_time[0] !== '' && query.order_time[1] !== '') {
                orderList.whereBetween('o.created_at', [`${query.order_time[0]} 00:00:00`, `${query.order_time[1]} 23:59:59`])
            }
            if (Array.isArray(query.expire_time) && query.expire_time.length === 2 && query.expire_time[0] !== '' && query.expire_time[1] !== '') {
                orderList.whereBetween('o.expire_time', [`${query.expire_time[0]} 00:00:00`, `${query.expire_time[1]} 23:59:59`])
            }

            // 计算总数
            const totalQuery = orderList.clone().clearSelect().count({ count: '*' }).clearOrder()

            if (queryType === 1) orderList.limit(Number(query.pageSize)).offset((Number(query.page) - 1) * Number(query.pageSize))

            // 执行查询
            const [totalResult, result] = await Promise.all([totalQuery, orderList])

            return {
                code: 200,
                data: [...result],
                total: totalResult[0].count
            }
        } catch (e) {
            return { code: 500, msg: e.message, total: 0 }
        }
    }
}))