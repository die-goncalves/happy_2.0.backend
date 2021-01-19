import { userModel } from '@src/models/user';
import authenticateService from '@src/services/auth';
import resetPasswordService from '@src/services/resetPassword';

describe('Controllers: Users', () => {
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe.skip('Create a new user', () => {
    test('should successfully create a new user', async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const response = await global.testRequest
        .post('/user/create')
        .field(defaultUser);

      expect(response.status).toBe(201);
      await expect(
        authenticateService.comparePasswords(
          defaultUser.password,
          response.body.password
        )
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...defaultUser,
          ...{ password: expect.any(String) },
        })
      );
    });
    test('should return a validation error when a field is missing', async () => {
      const defaultUser = {
        email: 'john@mail.com',
        password: '1234',
      };
      const response = await global.testRequest
        .post('/user/create')
        .field(defaultUser);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        message:
          'user validation failed: username: Path `username` is required.',
        name: 'UNPROCESSABLE_ENTITY',
      });
    });
    test('should return 500 when there is any error other than validation error', async () => {
      jest
        .spyOn(userModel.prototype, 'save')
        .mockImplementationOnce(async () => {
          return await new Promise((resolve, reject) =>
            reject(new Error('fail to create user'))
          );
        });

      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const response = await global.testRequest
        .post('/user/create')
        .field(defaultUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        code: 500,
        name: 'INTERNAL_SERVER_ERROR',
        message: 'fail to create user',
      });
    });
    test('should return CONFLICT when have the email already registered', async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await new userModel(defaultUser).save();
      const newUser = {
        username: 'John Jones',
        email: 'john@mail.com',
        password: '123456',
      };

      const response = await global.testRequest
        .post('/user/create')
        .field(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        message:
          'user validation failed: email: There is a user with the same email.',
        name: 'CONFLICT',
      });
    });
  });

  describe.skip('Authenticate user', () => {
    test('should generate a token for a valid user', async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await new userModel(defaultUser).save();

      const response = await global.testRequest
        .post('/user/authenticate')
        .field({ email: defaultUser.email, password: defaultUser.password });
      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });
    test('should return UNAUTHORIZED if the user with the given email is not found', async () => {
      const response = await global.testRequest
        .post('/user/authenticate')
        .field({ email: 'sample-email@mail.com', password: '1234' });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        message: 'user not found!',
        name: 'UNAUTHORIZED',
      });
    });
    test('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await new userModel(defaultUser).save();

      const response = await global.testRequest
        .post('/user/authenticate')
        .field({ email: defaultUser.email, password: 'different password' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        message: 'passwords does not match!',
        name: 'UNAUTHORIZED',
      });
    });
  });

  describe.skip('User profile info', () => {
    test("should return the token's owner profile information", async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const user = await new userModel(defaultUser).save();
      const token = authenticateService.generateToken({ _id: user._id });

      const response = await global.testRequest
        .get('/user/me')
        .set({ authorization: `Bearer ${token}` });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          ...user.toObject(),
          ...{ _id: user._id.toHexString() },
        })
      );
    });
    test('should return not found, when the user is not found', async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const user = new userModel(defaultUser);
      const token = authenticateService.generateToken({ _id: user._id });

      const response = await global.testRequest
        .get('/user/me')
        .set({ authorization: `Bearer ${token}` });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        name: 'NOT_FOUND',
        message: 'user not found!',
      });
    });
  });

  describe.skip('Forgot password', () => {
    test('should generate a token for a valid user to reset their password', async () => {
      const realDateNow = Date.now.bind(global.Date);
      const mockDate = (new Date(0) as unknown) as string;
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const dateNowStub = jest.fn(() => 0);
      global.Date.now = dateNowStub;

      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const user = await new userModel(defaultUser).save();
      const token = authenticateService.generateToken({ _id: user._id });

      const response = await global.testRequest
        .post('/user/forgot-password')
        .set({ authorization: `Bearer ${token}` })
        .field({ email: defaultUser.email });

      expect(response.status).toBe(200);
      expect(authenticateService.decodeToken(response.body.token)).toEqual(
        expect.objectContaining({
          emailAddress: 'john@mail.com',
          expirationDate: '1970-01-01T01:00:00.000Z',
        })
      );
      spy.mockRestore();
      global.Date.now = realDateNow;
    });
    test('should return not found, when the user is not found', async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const user = new userModel(defaultUser);
      const token = authenticateService.generateToken({ _id: user._id });

      const response = await global.testRequest
        .post('/user/forgot-password')
        .set({ authorization: `Bearer ${token}` })
        .field({ email: defaultUser.email });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        name: 'NOT_FOUND',
        message: 'user not found!',
      });
    });
  });

  describe('Reset password', () => {
    test(`should save the user's new password in the database`, async () => {
      const defaultUser = {
        username: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const user = await new userModel(defaultUser).save();

      const tokenReset = resetPasswordService.generateTokenForResetPassword({
        emailAddress: defaultUser.email,
      });

      const response = await global.testRequest
        .put('/user/reset-password')
        .field('new_password', '9876')
        .field('confirm_password', '9876')
        .query({ t: tokenReset });

      const isTheSame = await authenticateService.comparePasswords(
        '9876',
        response.body.password
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          ...{ _id: user._id.toHexString() },
          ...defaultUser,
          ...{ password: response.body.password },
        })
      );
      expect(isTheSame).toBe(true);
    });
  });
});
