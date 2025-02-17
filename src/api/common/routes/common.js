module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/verify-token',
            handler: 'common.verifyToken',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/list-products',
            handler: 'common.findProducts',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/one-product',
            handler: 'common.findOneProduct',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/some-products',
            handler: 'common.someProducts',
            config: {
                auth: false,
                middlewares: ["global::user-auth"]
            }
        },
        {
            method: 'GET',
            path: '/one-app-info',
            handler: 'common.findOneAppInfo',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/device/create-info',
            handler: 'common.createDeviceInfo',
            config: {
                auth: false,
                middlewares: ["global::user-auth"]
            }
        },
        {
            method: 'GET',
            path: '/device/list',
            handler: 'common.findManyDevice',
            config: {
                auth: false,
                middlewares: ["global::user-auth"]
            }
        },
        {
            method: 'GET',
            path: '/user-bind-info',
            handler: 'common.findUserBindInfo',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/delete-device',
            handler: 'common.deleteDevice',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/device/update-password',
            handler: 'common.updateDevice',
            config: {
                auth: false,
                middlewares: ["global::user-auth"]
            }
        },
        {
            method: 'GET',
            path: '/one-subscribe-info',
            handler: 'common.findOneSubscribe',
            config: {
                auth: false,
                middlewares: ["global::user-auth"]
            }
        }
    ]
}