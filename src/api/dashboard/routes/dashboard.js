module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/icloud/reset',
            handler: 'dashboard.icloudReset',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/icloud/login',
            handler: 'dashboard.icloudLogin',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/icloud/authinfo',
            handler: 'dashboard.icloudAuthInfo',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/icloud/verify',
            handler: 'dashboard.icloudVerify',
            config: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/icloud/cookie',
            handler: 'dashboard.icloudCookie',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/dashboard/summary',
            handler: 'dashboard.HomeSummary',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/dashboard/register',
            handler: 'dashboard.HomeRegisterCount',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/dashboard/order',
            handler: 'dashboard.HomeOrderCount',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/dashboard/order-pay',
            handler: 'dashboard.HomeOrderPayCount',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/dashboard/renew-pay',
            handler: 'dashboard.HomeRenewPayCount',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/dashboard/total',
            handler: 'dashboard.HomeTotalCount',
            config: {
                auth: false
            }
        }
    ]
}


// ,
// middlewares: ["global::order-auth"]