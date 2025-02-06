const fs = require("fs");
const path = require("path");
const { AlipaySdk } = require("alipay-sdk");

// 初始化 Alipay SDK
const alipaySdk = new AlipaySdk({
  // 设置应用 ID
  appId: process.env.ALI_APP_ID,
  // 设置应用私钥
  privateKey: fs.readFileSync(
    path.join(__dirname, "../config/aliAppPrivateKey.pem"),
    "ascii"
  ),
  // 设置支付宝公钥
  alipayPublicKey: fs.readFileSync(
    path.join(__dirname, "../config/aliPublicKey.pem"),
    "ascii"
  ),
  gateway: process.env.ALI_GATEWAY,
});

/**
 * 发起支付宝支付
 * @param
 * 订单号
 * 产品码
 * 金额
 * 描述
 */

const initiateAliPayment = async (
  out_trade_no,
  product_code,
  total_amount,
  subject,
  isMobile,
  qr_pay_mode = 1
) => {
  console.log("支付宝支付", out_trade_no, product_code, total_amount, subject, isMobile)

  // return alipaySdk.pageExecute(isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay', {
  return alipaySdk.pageExecute('alipay.trade.page.pay', {
    biz_content: {
      out_trade_no, // 商户订单号
      product_code, // 产品码
      total_amount, // 金额
      subject, // 描述
      qr_pay_mode
      // qr_pay_mode: "4", // 二维码支付模式
      // qrcode_width:"120"
    },
    return_url: process.env.PAY_SUCCESS_URL,
    notify_url: `${process.env.PAY_NOTIFY_URL}/api/alipay/notify`
  })
}

module.exports = initiateAliPayment;
