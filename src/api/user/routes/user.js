module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/register',
            handler: 'user.register',
            config: {
                auth: false,
                policies: [],
                middlewares: ["global::limitRequests"]
            }
        },
        {
            method: 'POST',
            path: '/login',
            handler: 'user.login',
            config: {
                auth: false,
                policies: [],
                middlewares: ["global::limitRequests"]
            }
        },
        {
            method: 'POST',
            path: '/resetPassword',
            handler: 'user.resetPassword',
            config: {
                auth: false,
                policies: [],
                middlewares: ["global::limitRequests"]
            }
        },
        {
            method: 'GET',
            path: '/findOneUser',
            handler: 'user.findOneUser',
            config: {
                auth: false,
                policies: [],
                middlewares: ["global::limitRequests"]
            }
        }
    ]
}