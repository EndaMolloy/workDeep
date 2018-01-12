const nodemailer = require("nodemailer");
const settings = require("../settings");

const transport = nodemailer.createTransport({
  service: "Mailgun",
  auth: {
    user: settings.MAILGUN_USER,
    pass: settings.MAILGUN_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

module.exports = {
  sendEmail(from, subject, to, html){
    return transport.sendMail({from, subject, to, html}, (err)=> {
      console.log(err);
    })
  }
}
