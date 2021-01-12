import { adm } from '@src/middlewares/auth';
import { userModel } from '@src/models/user';
import mongoose from 'mongoose';

describe('RolesMiddleware', () => {
  beforeEach(async () => {
    await userModel.deleteMany({});
  });
  test('should check if the user has an administrator role and call the next middleware', async () => {
    const defaultUser = {
      _id: new mongoose.Types.ObjectId('000000000000000000000000'),
      username: 'John Doe',
      email: 'john2@mail.com',
      password: '1234',
      role: ['adm'],
    };
    await new userModel(defaultUser).save();

    const reqFake = {
      decoded: {
        _id: '000000000000000000000000',
        iat: 0,
        exp: 0,
      },
    };
    const resFake = {};
    const nextFake = jest.fn();
    await adm(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });
  test('should return FORBIDDEN if there is no role adm', async () => {
    const defaultUser = {
      _id: new mongoose.Types.ObjectId('000000000000000000000000'),
      username: 'John Doe',
      email: 'john2@mail.com',
      password: '1234',
      role: ['usr'],
    };
    await new userModel(defaultUser).save();

    const reqFake = {
      decoded: {
        _id: '000000000000000000000000',
        iat: 0,
        exp: 0,
      },
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();

    await adm(reqFake, resFake as object, nextFake);

    expect(resFake.status).toHaveBeenCalledWith(403);
    expect(sendMock).toHaveBeenCalledWith({
      code: 403,
      message: 'required administrative role.',
      name: 'FORBIDDEN',
    });
  });
});
