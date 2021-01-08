import logger from '@src/logger';
import AuthService from '@src/services/auth';
import mongoose, { Document, Model } from 'mongoose';

export interface user {
  _id?: any;
  username: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
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

userSchema.path('email').validate({
  validator: async (email: string) => {
    const emailCount = await userModel.countDocuments({
      email,
    });
    return !emailCount;
  },
  message: function () {
    return `There is a user with the same email.`;
  },
  type: 'duplicate',
});

userSchema.pre<userInterface>('save', async function (): Promise<void> {
  // only hash the password if it has been modified or is new
  if (!this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (err) {
    logger.error(`Error hashing the password for the user ${this.username}`);
  }
});

interface userInterface extends user, Document {}

export const userModel: Model<userInterface> = mongoose.model(
  'user',
  userSchema
);
