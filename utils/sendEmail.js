const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

// const catchAsync = require('../utils/catchAsync');

//1. Create Class Email
module.exports = class Email {
  constructor(user, url, res) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Tran Owen <${process.env.EMAIL_FROM}>`;
    this.res = res;
  }

  newCreateTransport() {
    // Production env (assuming you have Sendgrid or BREVO configured)
    if (process.env.NODE_ENV === 'production') {
      // Production env
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.BREVO_LOGIN, // generated brevo user
          pass: process.env.BREVO_PASSWORD // generated brevo password
        }
      });
    } else {
      // Dev env
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secureConnection: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  async send(template, subject) {
    // 1. Render HTML form file pug
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2. Option Email
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html)
    };
    // 3. send email to client
    await this.newCreateTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to you our Tour.');
  }

  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'Your token is used to reset your password only valid for 10 munites.'
    );
  }
};

// const sendEmailClient = catchAsync(async options => {
//   //1. Create Transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secureConnection: false,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });
//   //2. MailOptions
//   console.log('options.email--', options.email);
//   const mailOptions = {
//     from: 'Tran Owen <ngochaiccu@gmail.com',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//   };
//   // 3. send email to client
//   const infor = await transporter.sendMail(mailOptions);
//   console.log('send email ---', infor);
// });

// module.exports = sendEmailClient;
