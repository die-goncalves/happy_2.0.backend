import jwt from 'jsonwebtoken';
import config from 'config';

interface resetPassToken {
  emailAddress: string;
  iat: number;
  exp: number;
}

export default class resetPasswordService {
  public static decodeTokenForResetPassword(token: string): resetPassToken {
    return jwt.verify(token, config.get('App.password.key')) as resetPassToken;
  }
  public static generateTokenForResetPassword(payload: object): string {
    return jwt.sign(payload, config.get('App.password.key'), {
      expiresIn: config.get('App.password.tokenExpiresIn'),
    });
  }
}
