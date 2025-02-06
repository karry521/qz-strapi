module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/verifyToken',
            handler: 'common.verifyToken',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/findProducts',
            handler: 'common.findProducts',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/findOneProduct',
            handler: 'common.findOneProduct',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/someProducts',
            handler: 'common.someProducts',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/findOneAppInfo',
            handler: 'common.findOneAppInfo',
            config: {
                auth: false
            }
        }
    ]
}