import { userModel } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Controllers: Users', () => {
  beforeEach(async () => {
    await userModel.deleteMany({});
  });
  describe('Create a new user', () => {
    it('should successfully create a new user', async () => {
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
  });
});
