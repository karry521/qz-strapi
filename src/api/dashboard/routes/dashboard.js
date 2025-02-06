module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/findManyDevice',
            handler: 'dashboard.findManyDevice',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/dashboard/icloudLogin',
            handler: 'dashboard.icloudLogin',
            config: {
                auth: false
            }
        }
    ]
}


// ,
                // middlewares: ["global::order-auth"]