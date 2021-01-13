import nodemailer from 'nodemailer';
import config, { IConfig } from 'config';
const hbs = require('nodemailer-express-handlebars');

const mailerConfig: IConfig = config.get('App.nodemailer');
const transporter = nodemailer.createTransport({
  host: mailerConfig.get('host'),
  port: mailerConfig.get('port'),
  auth: {
    user: mailerConfig.get('auth.user'),
    pass: mailerConfig.get('auth.pass'),
  },
});

const options = {
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve(__dirname, '../resource'), //__dirname = /modules
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, '../resource'),
  extName: '.html',
};

transporter.use('compile', hbs(options));

export default transporter;
