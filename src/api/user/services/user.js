module.exports = {
    async findOne(data, arr = []) {

        const whereData = {
            where: data
        }

        if (arr.length > 0) whereData.populate = [...arr]

        return strapi.db.query('plugin::users-permissions.user').findOne(whereData)
    },
    async findMany(data) {
        return strapi.db.query('plugin::users-permissions.user').findMany({
            where: data
        })
    },
    async create(data) {
        return strapi.db.query('plugin::users-permissions.user').create({
            data
        })
    },
    async update(where, data) {
        return strapi.db.query('plugin::users-permissions.user').update({
            where,
            data
        })
    }
}