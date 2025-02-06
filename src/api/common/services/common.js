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
    }
}