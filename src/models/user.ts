import mongoose, { Document, Model } from 'mongoose';

export interface user {
  _id?: any;
  username: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
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

interface userInterface extends user, Document {}

export const userModel: Model<userInterface> = mongoose.model(
  'user',
  userSchema
);
