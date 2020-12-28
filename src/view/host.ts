import { hostingModel } from '@src/models/orphanhosting';
import { picture, pictureModel } from '@src/models/picture';

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
};
