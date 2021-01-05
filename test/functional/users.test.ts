import { userModel } from '@src/models/user';
import AuthService from '@src/services/auth';

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
        AuthService.comparePasswords(
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
  });
});
