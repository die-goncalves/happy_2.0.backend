import { userModel } from '@src/models/user';
import authenticateService from '@src/services/auth';

describe('Controllers: Users', () => {
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe('Create a new user', () => {
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

  describe('Authenticate user', () => {
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

  describe('User profile info', () => {
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
        name: 'John Doe',
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
});
