import mongoose, { Document, Model, Schema } from 'mongoose';

export interface picture {
  _id?: any;
  destination: string;
  filename: string;
}

const pictureSchema = new mongoose.Schema(
  {
    _idHosting: {
      type: Schema.Types.ObjectId,
      ref: 'hosting',
      required: true,
    },
    destination: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
  },
  {
    toObject: {
      transform: (doc: any, ret: any) => {
        // ret.id = doc.id;
        // delete ret._id;
        delete ret.__v;
      },
    },
  }
);

interface pictureInterface extends picture, Document {}

export const pictureModel: Model<pictureInterface> = mongoose.model(
  'picture',
  pictureSchema
);
