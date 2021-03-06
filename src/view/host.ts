import { hosting, hostingModel } from '@src/models/orphanhosting';
import { picture, pictureModel } from '@src/models/picture';

export interface matchPictures {
  id: string;
  count: number;
}

interface hosts extends hosting {
  pictures?: picture[];
}

export default {
  async specificHosting(id: string) {
    let typeHost;
    const foundHosting = await hostingModel.findById(id);
    const foundPictures = await pictureModel.find({
      _idHosting: id,
    });

    const foundPicturesObjects = foundPictures.map((pic) => {
      const filterPic: picture = {
        _id: pic._id,
        destination: pic.destination,
        filename: pic.filename,
      };
      return filterPic;
    });

    if (foundPicturesObjects.length == 0) {
      typeHost = {
        ...foundHosting?.toObject(),
      };
    } else {
      typeHost = {
        ...foundHosting?.toObject(),
        pictures: foundPicturesObjects,
      };
    }
    return typeHost;
  },

  async rated_hosting() {
    let typeHost: hosts;
    const allHost: hosts[] = [];

    const foundHosting = await hostingModel.find({ pending: false });
    for (const host of foundHosting) {
      const foundPictures = await pictureModel.find({
        _idHosting: host._id,
      });
      const foundPicturesObjects = foundPictures.map((pic) => {
        const filterPic: picture = {
          _id: pic._id,
          destination: pic.destination,
          filename: pic.filename,
        };
        return filterPic;
      });
      foundPicturesObjects.length == 0
        ? (typeHost = {
            ...host?.toObject(),
          })
        : (typeHost = {
            ...host?.toObject(),
            pictures: foundPicturesObjects,
          });
      allHost.push(typeHost);
    }
    return allHost;
  },

  async pending_hosting() {
    let typeHost: hosts;
    const allHost: hosts[] = [];

    const foundHosting = await hostingModel.find({ pending: true });
    for (const host of foundHosting) {
      const foundPictures = await pictureModel.find({
        _idHosting: host._id,
      });
      const foundPicturesObjects = foundPictures.map((pic) => {
        const filterPic: picture = {
          _id: pic._id,
          destination: pic.destination,
          filename: pic.filename,
        };
        return filterPic;
      });
      foundPicturesObjects.length == 0
        ? (typeHost = {
            ...host?.toObject(),
          })
        : (typeHost = {
            ...host?.toObject(),
            pictures: foundPicturesObjects,
          });
      allHost.push(typeHost);
    }
    return allHost;
  },
};
