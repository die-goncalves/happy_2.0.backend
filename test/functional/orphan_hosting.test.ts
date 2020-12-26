import { hostingModel } from '@src/models/orphanhosting';
import { pictureModel } from '@src/models/picture';
import mongoose from 'mongoose';

describe('Controllers: Orphan Hosting', () => {
  beforeEach(async () => {
    await hostingModel.deleteMany({});
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
        .field(newOrphanHosting);
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

    test('should successfully show a specific orphan hosting', async () => {
      const defaultHosting = {
        _id: new mongoose.Types.ObjectId('000000000000000000000000'),
        name: 'sample-name',
        latitude: -10.660795923446559,
        longitude: -14.784882579454477,
        about: 'sample-about',
        instructions: 'sample-instructions',
        opening_hours: 'sample-availableTime',
        open_on_weekends: false,
      };
      const newHosting = await new hostingModel(defaultHosting).save();
      const defaultPicture_1 = {
        _id: new mongoose.Types.ObjectId('000000000000000000000001'),
        _idHosting: newHosting._id,
        destination: 'sample-destination_1',
        filename: 'sample-filename_1',
        size: 8888,
      };
      const defaultPicture_2 = {
        _id: new mongoose.Types.ObjectId('000000000000000000000002'),
        _idHosting: newHosting._id,
        destination: 'sample-destination_2',
        filename: 'sample-filename_2',
        size: 9999,
      };
      const newPictures_1 = await new pictureModel(defaultPicture_1).save();
      const newPictures_2 = await new pictureModel(defaultPicture_2).save();

      /**
       * Note that `_id` in query is a string, Mongoose will cast` _id` to a MongoDB ObjectId
       *
       * 1 - The controller received _id as string
       * 2 - Run the query .findById (req.query._id), mongoose cast _id to ObjectId, and return the model hosting and here the _id is an ObjectId.
       * 3 - The response.body._id comes as a string.
       * 4 - Use toHexString () to compare _id.
       */
      const response = await global.testRequest
        .get('/hosting/show')
        .query({ _id: newHosting._id.toHexString() });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: newHosting._id.toHexString(),
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
            expect.objectContaining({
              _id: newPictures_1._id.toHexString(),
              _idHosting: newHosting._id.toHexString(),
              destination: 'sample-destination_1',
              filename: 'sample-filename_1',
              size: 8888,
            }),
          ]),
        })
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          pictures: expect.arrayContaining([
            expect.objectContaining({
              _id: newPictures_2._id.toHexString(),
              _idHosting: newHosting._id.toHexString(),
              destination: 'sample-destination_2',
              filename: 'sample-filename_2',
              size: 9999,
            }),
          ]),
        })
      );
    });
  });
});
