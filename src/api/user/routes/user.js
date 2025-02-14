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
            path: '/reset-password',
            handler: 'user.resetPassword',
            config: {
                auth: false,
                policies: [],
                middlewares: ["global::limitRequests"]
            }
        },
        {
            method: 'GET',
            path: '/one-user',
            handler: 'user.findOneUser',
            config: {
                auth: false,
                policies: [],
                middlewares: ["global::user-auth", "global::limitRequests"]
            }
        }
    ]
}