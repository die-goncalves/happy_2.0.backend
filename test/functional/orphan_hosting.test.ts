import { hostingModel } from '@src/models/orphanhosting';
import { pictureModel } from '@src/models/picture';

describe('Controllers: Orphan Hosting', () => {
  beforeEach(async () => {
    await hostingModel.deleteMany({});
  });
  beforeEach(async () => {
    await pictureModel.deleteMany({});
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

    test('should successfully upload file for a orphan hosting', async () => {
      const realDateNow = Date.now.bind(global.Date);
      const dateNowStub = jest.fn(() => 0);
      global.Date.now = dateNowStub;

      const filePath = `${__dirname}/files/apples.jpg`;
      const response = await global.testRequest
        .post('/hosting/create')
        .field('name', 'sample-name')
        .field('latitude', -10.660795923446559)
        .field('longitude', -14.784882579454477)
        .field('about', 'sample-about')
        .field('instructions', 'sample-instructions')
        .field('opening_hours', 'sample-availableTime')
        .field('open_on_weekends', false)
        .attach('pictures', filePath);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          name: 'sample-name',
          latitude: -10.660795923446559,
          longitude: -14.784882579454477,
          about: 'sample-about',
          instructions: 'sample-instructions',
          opening_hours: 'sample-availableTime',
          open_on_weekends: false,
        })
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          pictures: expect.arrayContaining([
            expect.objectContaining({ filename: '0-apples.jpg' }),
          ]),
        })
      );
      global.Date.now = realDateNow;
    });
  });
});
