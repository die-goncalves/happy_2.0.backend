import nodemailer from 'nodemailer';
import config, { IConfig } from 'config';

const mailerConfig: IConfig = config.get('App.nodemailer');
const transporter = nodemailer.createTransport({
  host: mailerConfig.get('host'),
  port: mailerConfig.get('port'),
  auth: {
    user: mailerConfig.get('auth.user'),
    pass: mailerConfig.get('auth.pass'),
  },
});

export default transporter;
