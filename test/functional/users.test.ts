import { userModel } from '@src/models/user';

describe('Controllers: Users', () => {
  beforeEach(async () => {
    await userModel.deleteMany({});
  });
  describe('Create a new user', () => {
    it('should successfully create a new user', async () => {
      const defaultUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const response = await global.testRequest
        .post('/user/create')
        .field(defaultUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          ...defaultUser,
        })
      );
    });
  });
});
