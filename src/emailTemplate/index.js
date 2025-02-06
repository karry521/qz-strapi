const fs = require("fs");
const { resolve } = require("path");

const { sendEmail } = require("../config/sendEmail");
const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
/*
params:{
  templateName:模板类型
  type:记录邮件发送类型
  to:接收邮箱
  filling:替换字符串
  title:备用标题
}
*/

const readFile = async function (templateName, type, to, filling, title) {
  // 开发环境不发送邮件

  // if (process.env.NODE_ENV === "development") return;

  // 小于20分钟不发送邮件

  let lessThanCheck = myCache.get(`${to}-${type}`);

  // if (lessThanCheck != null) return;

  myCache.set(`${to}-${type}`, `${to}${type}`, 60 * 20);

  let contentResult = await this.strapi
    .query("api::send-template.send-template")
    .findOne({
      where: {
        name: templateName,
      },
    });

  if (contentResult == null) return;

  let replaceData = [];

  replaceData = [...replaceData, ...filling];

  let content = contentResult.content;

  let subject = contentResult.title;

  // console.log(`content:::\n${JSON.stringify(replaceData)}\ncontent:::\n${content}\n`);

  for (let i = 0; i < replaceData.length; i++) {
    console.log('key:::', replaceData[i].key)
    content = content.replaceAll(
      new RegExp("\\{" + replaceData[i].key + "\\}", "g"),
      replaceData[i].value
    );
  }

  if (content.indexOf("}") != "-1") {
    // console.log("邮箱没有过滤}", content);
    return;
  }

  console.log('\ncontent:::\n', content)

  const result = sendEmail(
    to,
    `${process.env.SERVICE_EMAIL_USER}`,
    title == "" ? subject : title,
    content,
    process.env.REOLY_EMAIL
  );

  return result;
};

module.exports = { readFile };
