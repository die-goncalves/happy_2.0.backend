import nodemailer from 'nodemailer';
import config, { IConfig } from 'config';
import Email from 'email-templates';

const mailerConfig: IConfig = config.get('App.nodemailer');
const transporter = nodemailer.createTransport({
  host: mailerConfig.get('host'),
  port: mailerConfig.get('port'),
  auth: {
    user: mailerConfig.get('auth.user'),
    pass: mailerConfig.get('auth.pass'),
  },
});

const email = new Email({
  message: {
    subject: 'Happy.com | Your password',
    from: '"Happy.com" <password.reset@happy.com>',
  },
  send: true,
  preview: false,
  transport: transporter,
});

export default email;
