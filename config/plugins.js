module.exports = {
    graphql: {
        config: {
            endpoint: "/graphql",
            shadowCRUD: true,
            playgroundAlways: false,
            depthLimit: 10,
            amountLimit: 100,
            apolloServer: {
                tracing: false
            }
        }
    },
    client: {
        enabled: true,
        resolve: "./src/plugins/client"
    }
}