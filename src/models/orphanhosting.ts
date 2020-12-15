import mongoose, { Document, Model } from 'mongoose';

export interface OrphanHosting {
  _id?: any;
  name: string;
  latitude: number;
  longitude: number;
  about: string;
  instructions: string;
  opening_hours: string;
  open_on_weekends: boolean;
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    about: { type: String, required: true },
    instructions: { type: String, required: true },
    opening_hours: { type: String, required: true },
    open_on_weekends: { type: Boolean, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

interface OrphanHostingModel extends OrphanHosting, Document {}

export const OrphanHosting: Model<OrphanHostingModel> = mongoose.model(
  'OrphanHosting',
  schema
);
