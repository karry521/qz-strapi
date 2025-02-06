const { createCoreController } = require("@strapi/strapi").factories
const validateData = require("../../../utils/validateData")
const generateOrderNumber = require("../../../utils/generateOrderNumber")
const initiateAliPayment = require("../../../utils/aliPaymentSDK")
const dayjs = require('dayjs')

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  // 创建订单
  async create(ctx) {
    const { body } = ctx.request
    console.log("支付宝订单", body)

    let validate = validateData(body, {
      p_id: ["number", "require"],
    })
    if (validate.check) return validate

    // 查询产品
    let queryProduct = await strapi.db.query("api::product.product").findOne({
      where: {
        id: body.p_id
      }
    })

    if (queryProduct) {
      // 查询用户
      let user = await strapi.db.query("plugin::users-permissions.user").findOne({
        where: {
          id: body.tokenId
        }
      })

      // 创建订单
      let order = await strapi.db.query("api::order.order").create({
        data: {
          merchant_no: generateOrderNumber(),
          email: user.email,
          user_id: user.id,
          payment_method: "ali",
          amount: queryProduct.price,
          payment_status: "-1",
          product_id: body.p_id,
          expire_time:
            new Date().getTime() + 1000 * 60 * 60 * 24 * queryProduct.valid_days,
          user: {
            connect: { id: body.tokenId } // 关联用户信息
          }
        }
      })

      // 用户表关联订单信息
      user = await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: body.tokenId },
        data: {
          orders: {
            connect: { id: order.id } //  关联订单
          }
        }
      })

      // 发起支付
      let result = await initiateAliPayment(
        order.merchant_no,
        "FAST_INSTANT_TRADE_PAY",
        order.amount / 100,
        queryProduct.name,
        body.isMobile
      )

      ctx.set("Content-Type", "text/html")

      ctx.send(result)
    }

    return { code: 500, msg: "error" }
  },
  // 支付宝回调
  async notify(ctx) {
    const { body } = ctx.request
    console.log("支付宝回调", body)

    try {
      // 判断是否支付成功
      if (body.trade_status === "TRADE_SUCCESS") {
        // 更新订单状态
        let queryOrder = await strapi.db.query("api::order.order").update({
          where: { merchant_no: body.out_trade_no },
          data: {
            trade_no: body.trade_no,
            payment_status: "0",
            payment_channel_info: {
              buyer_id: body.buyer_id,
              seller_id: body.seller_id,
            }
          }
        })

        console.log('queryOrder:::', queryOrder)

        // 查询产品信息
        const product = await strapi.db.query("api::product.product").findOne({
          where: {
            id: queryOrder.product_id
          }
        })

        console.log('product:::', product)

        // 查询用户信息
        const user = await strapi.service('api::user.user').findOne({
          id: queryOrder.user_id
        })

        const nowDate = dayjs().valueOf() // 当前时间时间戳
        const isRenew = product.renew === 'Y' // 是否是增值服务

        // 根据服务类型动态选择字段
        const isAdvanced = product.advanced
        const basicLimitKey = isAdvanced ? 'advanced_basic_limit' : 'basic_basic_limit'
        const extraLimitKey = isAdvanced ? 'advanced_extra_limit' : 'basic_extra_limit'
        const expireTimeKey = isAdvanced ? 'advanced_expire_time' : 'basic_expire_time'

        // 获取当前用户绑定数量和到期时间
        let basicLimit = Number(user[basicLimitKey])
        let extraLimit = Number(user[extraLimitKey])
        const expireDate = dayjs(user[expireTimeKey]).valueOf()

        // 判断是否未到期且购买增值服务
        if (expireDate > nowDate) {
          if (isRenew) {
            extraLimit += Number(product.device_num)
          } else {
            basicLimit = Number(product.device_num)
          }
        } else {
          // 已到期，重置绑定数量
          basicLimit = Number(product.device_num)
          extraLimit = 0
        }

        // 更新绑定数量和到期时间
        const newUser = await strapi.service('api::user.user').update(
          { id: user.id },
          {
            [basicLimitKey]: basicLimit,
            [extraLimitKey]: extraLimit,
            [expireTimeKey]: dayjs(queryOrder.expire_time).valueOf()
          }
        )

        console.log('newUser:::', newUser)
      }

      return "success"
    } catch (error) {
      return "success"
    }
  }
}))
