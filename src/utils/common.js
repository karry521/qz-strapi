const validateData = require('./validateData.js')
const jwt = require('jsonwebtoken')

const verifyToken = async token => {
    // 校验入参格式
    const validate = validateData({ token }, {
        token: ['string', 'require']
    })

    if (validate.check) return validate

    return new Promise((resolve) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                resolve({ code: 401, msg: `Token verification failed: ${err.message}` })
            } else {
                resolve({ code: 200, data: decoded })
            }
        })
    })
}

module.exports = { verifyToken }