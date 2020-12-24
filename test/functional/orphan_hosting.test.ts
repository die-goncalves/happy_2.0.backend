import { hostingModel } from '@src/models/orphanhosting';

describe('Controllers: Orphan Hosting', () => {
  beforeEach(async () => {
    await hostingModel.deleteMany({});
  });

  describe('Create a new orphan hosting', () => {
    test('should successfully create a new orphan hosting', async () => {
      const newOrphanHosting = {
        name: 'sample-name',
        latitude: -10.660795923446559,
        longitude: -14.784882579454477,
        about: 'sample-about',
        instructions: 'sample-instructions',
        opening_hours: 'sample-availableTime',
        open_on_weekends: false,
      };

      const response = await global.testRequest
        .post('/hosting')
        .send(newOrphanHosting);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newOrphanHosting));
    });
  });
});
