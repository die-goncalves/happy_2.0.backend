import mongoose, { Mongoose } from 'mongoose';

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect('mongodb://localhost:27017/happy_2-backend', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
  });

export const close = (): Promise<void> => mongoose.connection.close();
