const nodemailer = require("nodemailer")
const transporter = nodemailer.createTransport({
  host: process.env.SERVICE_EMAIL_HOST,
  port: process.env.SERVICE_EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.SERVICE_EMAIL_USER,
    pass: process.env.SERVICE_EMAIL_PWD
  },
  // debug: true,
  // logger: true
})

const sendEmail = async (to, from, subject, html, replyTo) => {
  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html
    })

    return result
  } catch (error) {
    return { code: 500, msg: error.message }
  }
}

module.exports = { sendEmail }