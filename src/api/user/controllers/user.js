const dayjs = require('dayjs')
const validateData = require('../../../utils/validateData')
const jwt = require('jsonwebtoken')
const { verifyToken } = require('../../../utils/common')

module.exports = {
    async register(ctx) { // 注册
        const { body } = ctx.request
        const { email, password, userType, phone, companyName } = body
        const enterprise = userType === 'enterprise'

        console.log('enterprise:::', enterprise)
        // 需要校验的属性
        let validationDefinition = {
            email: ['string', 'require', 'email'],
            password: ['string', 'require', ['min', 8]]
        }

        // 注册类型是否是企业
        if (enterprise) {
            validationDefinition = {
                ...validationDefinition,
                phone: ['string', 'require', ['min', 11], ['max', 11]],
                companyName: ['string', 'require']
            }
        }

        // 校验各属性值格式
        const validate = validateData(body, validationDefinition)

        // 校验不通过直接返回校验结果
        if (validate.check) return validate

        // 深层校验密码格式&手机格式
        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/ // 8位数&包含大小写
        const phoneRegex1 = /^(?!170|171|172|176|177|166|199)\d{11}$/ // 不包含虚拟号码
        // const phoneRegex2 = /^1\d{10}$/ // 包含虚拟号码

        if (!pwdRegex.test(password)) return { code: 400, msg: 'Password format error' }
        if (enterprise && !phoneRegex1.test(phone)) return { code: 400, msg: 'Phone format is incorrect or it is a virtual number' }

        try {
            // 查询邮箱是否已注册
            const checkEmail = await strapi.service('api::user.user').findOne({
                email
            })

            // 已注册
            // if (checkEmail) return { code: 400, msg: 'Email already registered' }
            if (checkEmail) return { code: 400, msg: '邮箱已注册' }

            // 注册账号
            const register = await strapi.service('api::user.user').create({
                email,
                password,
                userType,
                phone,
                companyName,
                username: email,
                basic_basic_limit: 0,
                basic_extra_limit: 0,
                advanced_basic_limit: 0,
                advanced_extra_limit: 0
            })

            // 注册不成功
            // if (!register) return { code: 500, msg: 'Registration error' }
            if (!register) return { code: 500, msg: '注册失败，请稍后再试' }

            return {
                code: 200,
                data: {
                    jwt: jwt.sign({ id: register.id }, process.env.JWT_SECRET, {
                        expiresIn: "30d",
                    }),
                    user: register
                }
            }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async login(ctx) { // 登录
        const { body } = ctx.request

        // 校验邮箱跟密码格式
        const validate = validateData(body, {
            email: ['string', 'require', 'email'],
            password: ['string', 'require', ['min', 8]]
        })

        // 校验不通过直接返回校验结果
        if (validate.check) return validate

        try {
            const { email, password } = body

            const user = await strapi.service('api::user.user').findOne({
                email
            })

            // 账号不存在
            if (!user) return { code: 401, msg: '账号或密码错误' }

            // 密码不匹配
            if (user.password.trim() !== password.trim()) return { code: 401, msg: '账号或密码错误' }

            // 修改最后登录ip跟时间
            await strapi.service('api::user.user').update(
                { email },
                {
                    last_login_ip: ctx.ip,
                    last_login_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }
            )

            return {
                code: 200,
                data: {
                    jwt: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                        expiresIn: "30d",
                    }),
                    user: {
                        id: user.id,
                        email: user.email
                    }
                }
            }
        } catch (e) {
            return { code: 500, msg: '调用接口时出错' }
        }
    },
    async resetPassword(ctx) { // 重置密码
        const { body } = ctx.request

        // 校验参数格式
        const validate = validateData(body, {
            token: ['string', 'require'],
            password: ['string', 'require', ['min', 8]]
        })

        if (validate.check) return validate

        try {
            const temp = await strapi.db.query('api::user-action-temp.user-action-temp').findOne({
                where: { token: body.token }
            })

            // 不存在此token
            if (!temp || temp?.useNum > 0) return { code: 401, msg: 'Token无效或已被使用，请重新获取邮箱' }

            const verify = await verifyToken(body.token)

            // token校验未通过
            if (verify.code !== 200) return verify

            const userId = verify.data.id

            const user = await strapi.service('api::user.user').findOne({
                id: userId
            })

            // 用户不存在
            if (!user) return { code: 401, msg: '用户不存在，您可以直接注册' }

            // 密码8位数&包含大小写
            const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/

            if (!pwdRegex.test(body.password)) return { code: 400, msg: '密码格式错误' }

            // 修改user表password
            await strapi.service('api::user.user').update(
                { id: userId },
                {
                    password: body.password
                }
            )

            // 修改token表useNum
            await strapi.db.query('api::user-action-temp.user-action-temp').update({
                where: { id: temp.id },
                data: {
                    useNum: Number(temp.useNum) + 1
                }
            })

            // 插入日志
            await strapi.service('api::common.common').userLog({
                email: user.email,
                description: `User Action Reset Password,Changed from ${user.password} to ${body.password}`
            })

            return { code: 200, msg: '密码重置成功' }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    },
    async findOneUser(ctx) { // 查询单个用户信息
        const { id } = ctx.query

        try {
            const response = await strapi.service('api::user.user').findOne({
                id
            })

            return { code: 200, data: response }
        } catch (e) {
            return { code: 500, msg: e.message }
        }
    }
}