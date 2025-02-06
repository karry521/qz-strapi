module.exports = {
  routes: [
    {
      method: "POST",
      path: "/alipay/create",
      handler: "alipay.create",
      config: {
        auth: false,
        middlewares: ["global::user-auth"],
      },
    },
    {
      method: "POST",
      path: "/alipay/notify",
      handler: "alipay.notify",
      config: {
        auth: false,
      },
    },
  ],
};
