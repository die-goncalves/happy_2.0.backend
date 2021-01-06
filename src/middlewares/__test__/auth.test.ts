import AuthService from '@src/services/auth';
import { authMiddleware } from '../auth';

describe('AuthMiddleware', () => {
  test('should verify a JWT token and call the next middleware', () => {
    const jwtToken = AuthService.generateToken({ data: 'fake' });
    const reqFake = {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    };
    const resFake = {};
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });
  test('should return UNAUTHORIZED if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        authorization: `Bearer invalid token`,
      },
    };

    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };

    const nextFake = jest.fn();

    authMiddleware(reqFake, resFake as object, nextFake);

    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      message: 'jwt malformed',
      name: 'UNAUTHORIZED',
    });
  });
});
