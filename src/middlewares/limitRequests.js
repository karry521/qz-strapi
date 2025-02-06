const rateLimit = require("koa2-ratelimit").RateLimit;

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // 根据当前路由动态设置 max 值
    let maxRequests = 100; // 默认值

    // 根据路由来动态设置 max
    switch (ctx.request.path) {
      case "/api/register":
        maxRequests = 10; // 特定路由的限制
        break;
      // 可以添加更多路由规则
      default:
        maxRequests = 200; // 其他路由的默认限制
        break;
    }

    // 动态创建限流中间件
    const limiter = rateLimit.middleware({
      interval: 1000 * 60, // 1 分钟
      max: maxRequests, // 动态设置 max
      statusCode: 429,
      message: "Too many requests, please try again later",
    });

    await limiter(ctx, async () => {
      await next();
    });
  };
};
