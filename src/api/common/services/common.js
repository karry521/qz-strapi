
const dayjs = require('dayjs')

module.exports = {
    async userLog(data) { // 记录用户操作日志
        try {
            const result = await strapi.db.query('api::user-log.user-log').create({
                data
            })
            return result
        } catch (error) {
            throw new Error('Failed to create user log: ' + error.message)
        }
    },
    async findUserBindInfo(email) { // 获取用户绑定情况
        try {
            // 查询用户信息
            const user = await strapi.service('api::user.user').findOne({
                email
            }, ['devices'])

            // 未注册
            if (!user) return { code: 401, msg: '该邮箱未注册' }

            const deviceNum = Array.from(user.devices).length // 当前绑定设备数量
            let maxNum = 0 // 最大可绑定设备数量
            let basicNum = 0 // 初始绑定设备数量
            let isBasic = false // 基础服务未到期
            let isAdvanced = false // 高级服务未到期
            let basicExpiretime = null // 基础服务到期时间
            let advancedExpiretime = null // 高级服务到期时间
            let unlimitedNum = false // 无限绑定数量

            const nowDate = dayjs().valueOf() // 当前时间时间戳

            // 基础服务未到期
            if (dayjs(user.basic_expire_time).valueOf() > nowDate) {
                isBasic = true
                basicNum = Number(user.basic_basic_limit)
            }

            // 高级服务未到期
            if (dayjs(user.advanced_expire_time).valueOf() > nowDate) {
                isAdvanced = true

                if (Number(user.advanced_basic_limit) === -1) unlimitedNum = true
                else basicNum = Number(user.advanced_basic_limit)
            }

            maxNum = basicNum + Number(user.basic_extra_limit) + Number(user.advanced_extra_limit)

            if (user.basic_expire_time) basicExpiretime = dayjs(user.basic_expire_time).format('YYYY-MM-DD HH:mm:ss')
            if (user.advanced_expire_time) advancedExpiretime = dayjs(user.advanced_expire_time).format('YYYY-MM-DD HH:mm:ss')

            return {
                code: 200,
                msg: 'success',
                data: {
                    maxNum,
                    deviceNum,
                    isBasic,
                    isAdvanced,
                    basicExpiretime,
                    advancedExpiretime,
                    unlimitedNum
                }
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    }
}