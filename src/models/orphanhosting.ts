import mongoose, { Document, Model } from 'mongoose';

export interface hosting {
  _id?: any;
  name: string;
  latitude: number;
  longitude: number;
  about: string;
  instructions: string;
  opening_hours: string;
  open_on_weekends: boolean;
  pending: boolean;
}

const hostingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    about: { type: String, required: true },
    instructions: { type: String, required: true },
    opening_hours: { type: String, required: true },
    open_on_weekends: { type: Boolean, required: true },
    pending: { type: Boolean, required: true, default: true },
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

interface hostingInterface extends hosting, Document {}

export const hostingModel: Model<hostingInterface> = mongoose.model(
  'hosting',
  hostingSchema
);
