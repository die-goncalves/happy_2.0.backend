import { hostingModel } from '@src/models/orphanhosting';
import { pictureModel } from '@src/models/picture';
import { userModel } from '@src/models/user';
import authenticateService from '@src/services/auth';
import mongoose from 'mongoose';

describe('Controllers: Orphan Hosting', () => {
  const defaultUser = {
    username: 'John Doe',
    email: 'john2@mail.com',
    password: '1234',
  };
  const admUser = {
    username: 'Jane Doe',
    email: 'jane@mail.com',
    password: '1234',
    role: 'adm',
  };
  let token: string;
  let admtoken: string;
  beforeEach(async () => {
    await hostingModel.deleteMany({});
    await pictureModel.deleteMany({});
    await userModel.deleteMany({});
    const user = await new userModel(defaultUser).save();
    const adm = await new userModel(admUser).save();
    token = authenticateService.generateToken({ _id: user._id });
    admtoken = authenticateService.generateToken({ _id: adm._id });
  });

  describe('Create a new orphan hosting', () => {
    test('should successfully create a new orphan hosting', async () => {
      const realDateNow = Date.now.bind(global.Date);
      const dateNowStub = jest.fn(() => 0);
      global.Date.now = dateNowStub;

      const filePath = `${__dirname}/files/apples.jpg`;
      const response = await global.testRequest
        .post('/hosting/create')
        .set({ authorization: `Bearer ${token}` })
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
        .set({ authorization: `Bearer ${token}` })
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
              destination: 'sample-destination_1',
              filename: 'sample-filename_1',
            }),
          ]),
        })
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          pictures: expect.arrayContaining([
            expect.objectContaining({
              _id: newPictures_2._id.toHexString(),
              destination: 'sample-destination_2',
              filename: 'sample-filename_2',
            }),
          ]),
        })
      );
    });
    test('should successfully show all orphan hosting', async () => {
      const defaultHosting_a = {
        _id: new mongoose.Types.ObjectId('000000000000000000000000'),
        name: 'sample-name-a',
        latitude: -10.660795923446559,
        longitude: -14.784882579454477,
        about: 'sample-about-a',
        instructions: 'sample-instructions-a',
        opening_hours: 'sample-availableTime-a',
        open_on_weekends: false,
        pending: false,
      };
      const newHosting_a = await new hostingModel(defaultHosting_a).save();
      const defaultPicture_a1 = {
        _id: new mongoose.Types.ObjectId('000000000000000000000001'),
        _idHosting: newHosting_a._id,
        destination: 'sample-destination_a1',
        filename: 'sample-filename_a1',
        size: 8888,
      };
      const defaultPicture_a2 = {
        _id: new mongoose.Types.ObjectId('000000000000000000000002'),
        _idHosting: newHosting_a._id,
        destination: 'sample-destination_a2',
        filename: 'sample-filename_a2',
        size: 9999,
      };
      const newPictures_a1 = await new pictureModel(defaultPicture_a1).save();
      const newPictures_a2 = await new pictureModel(defaultPicture_a2).save();

      const defaultHosting_b = {
        _id: new mongoose.Types.ObjectId('000000000000000000000010'),
        name: 'sample-name-b',
        latitude: -11.660795923446559,
        longitude: -15.784882579454477,
        about: 'sample-about-b',
        instructions: 'sample-instructions-b',
        opening_hours: 'sample-availableTime-b',
        open_on_weekends: true,
        pending: false,
      };
      const newHosting_b = await new hostingModel(defaultHosting_b).save();
      const defaultHosting_c = {
        _id: new mongoose.Types.ObjectId('000000000000000000000100'),
        name: 'sample-name-c',
        latitude: -11.660795923446559,
        longitude: -15.784882579454477,
        about: 'sample-about-c',
        instructions: 'sample-instructions-c',
        opening_hours: 'sample-availableTime-c',
        open_on_weekends: true,
      };
      const newHosting_c = await new hostingModel(defaultHosting_c).save();

      const response = await global.testRequest
        .get('/hosting')
        .set({ authorization: `Bearer ${token}` });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            _id: '000000000000000000000000',
            name: 'sample-name-a',
            latitude: -10.660795923446559,
            longitude: -14.784882579454477,
            about: 'sample-about-a',
            instructions: 'sample-instructions-a',
            opening_hours: 'sample-availableTime-a',
            open_on_weekends: false,
            pending: false,
            pictures: [
              {
                _id: '000000000000000000000001',
                destination: 'sample-destination_a1',
                filename: 'sample-filename_a1',
              },
              {
                _id: '000000000000000000000002',
                destination: 'sample-destination_a2',
                filename: 'sample-filename_a2',
              },
            ],
          },
          {
            _id: '000000000000000000000010',
            name: 'sample-name-b',
            latitude: -11.660795923446559,
            longitude: -15.784882579454477,
            about: 'sample-about-b',
            instructions: 'sample-instructions-b',
            opening_hours: 'sample-availableTime-b',
            open_on_weekends: true,
            pending: false,
          },
        ])
      );
    });
  });

  describe('Error handling', () => {
    test('should return a validation error when a field is missing', async () => {
      const response = await global.testRequest
        .post('/hosting/create')
        .set({ authorization: `Bearer ${token}` })
        .field('name', 'sample-name')
        .field('longitude', -14.784882579454477)
        .field('about', 'sample-about')
        .field('instructions', 'sample-instructions')
        .field('opening_hours', 'sample-availableTime')
        .field('open_on_weekends', false);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        message:
          'hosting validation failed: latitude: Path `latitude` is required.',
        name: 'UNPROCESSABLE_ENTITY',
      });
    });
    test('should return 500 when there is any error other than validation error', async () => {
      jest
        .spyOn(hostingModel.prototype, 'save')
        .mockImplementationOnce(async () => {
          return await new Promise((resolve, reject) =>
            reject(new Error('fail to create host'))
          );
        });

      const filePath = `${__dirname}/files/apples.jpg`;
      const response = await global.testRequest
        .post('/hosting/create')
        .set({ authorization: `Bearer ${token}` })
        .field('name', 'sample-name')
        .field('latitude', -10.660795923446559)
        .field('longitude', -14.784882579454477)
        .field('about', 'sample-about')
        .field('instructions', 'sample-instructions')
        .field('opening_hours', 'sample-availableTime')
        .field('open_on_weekends', false)
        .attach('pictures', filePath);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        code: 500,
        name: 'INTERNAL_SERVER_ERROR',
        message: 'fail to create host',
      });
    });
  });

  describe('Administrative operations', () => {
    test('should show all pending entries of orphan hosting', async () => {
      const defaultHosting_a = {
        _id: new mongoose.Types.ObjectId('000000000000000000000000'),
        name: 'sample-name-a',
        latitude: -10.660795923446559,
        longitude: -14.784882579454477,
        about: 'sample-about-a',
        instructions: 'sample-instructions-a',
        opening_hours: 'sample-availableTime-a',
        open_on_weekends: false,
        pending: true,
      };
      const newHosting_a = await new hostingModel(defaultHosting_a).save();
      const defaultPicture_a1 = {
        _id: new mongoose.Types.ObjectId('000000000000000000000001'),
        _idHosting: newHosting_a._id,
        destination: 'sample-destination_a1',
        filename: 'sample-filename_a1',
        size: 8888,
      };
      const defaultPicture_a2 = {
        _id: new mongoose.Types.ObjectId('000000000000000000000002'),
        _idHosting: newHosting_a._id,
        destination: 'sample-destination_a2',
        filename: 'sample-filename_a2',
        size: 9999,
      };
      const newPictures_a1 = await new pictureModel(defaultPicture_a1).save();
      const newPictures_a2 = await new pictureModel(defaultPicture_a2).save();

      const defaultHosting_b = {
        _id: new mongoose.Types.ObjectId('000000000000000000000010'),
        name: 'sample-name-b',
        latitude: -11.660795923446559,
        longitude: -15.784882579454477,
        about: 'sample-about-b',
        instructions: 'sample-instructions-b',
        opening_hours: 'sample-availableTime-b',
        open_on_weekends: true,
        pending: true,
      };
      const newHosting_b = await new hostingModel(defaultHosting_b).save();
      const defaultHosting_c = {
        _id: new mongoose.Types.ObjectId('000000000000000000000100'),
        name: 'sample-name-c',
        latitude: -11.660795923446559,
        longitude: -15.784882579454477,
        about: 'sample-about-c',
        instructions: 'sample-instructions-c',
        opening_hours: 'sample-availableTime-c',
        open_on_weekends: true,
        pending: false,
      };
      const newHosting_c = await new hostingModel(defaultHosting_c).save();

      const response = await global.testRequest
        .get('/hosting/pending')
        .set({ authorization: `Bearer ${admtoken}` });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            _id: '000000000000000000000000',
            name: 'sample-name-a',
            latitude: -10.660795923446559,
            longitude: -14.784882579454477,
            about: 'sample-about-a',
            instructions: 'sample-instructions-a',
            opening_hours: 'sample-availableTime-a',
            open_on_weekends: false,
            pending: true,
            pictures: [
              {
                _id: '000000000000000000000001',
                destination: 'sample-destination_a1',
                filename: 'sample-filename_a1',
              },
              {
                _id: '000000000000000000000002',
                destination: 'sample-destination_a2',
                filename: 'sample-filename_a2',
              },
            ],
          },
          {
            _id: '000000000000000000000010',
            name: 'sample-name-b',
            latitude: -11.660795923446559,
            longitude: -15.784882579454477,
            about: 'sample-about-b',
            instructions: 'sample-instructions-b',
            opening_hours: 'sample-availableTime-b',
            open_on_weekends: true,
            pending: true,
          },
        ])
      );
    });
  });
});
