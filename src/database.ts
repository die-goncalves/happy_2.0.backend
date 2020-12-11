import mongoose, { Mongoose } from 'mongoose';
import config, { IConfig } from 'config';

const dbConfig: IConfig = config.get('App.database');

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(dbConfig.get('mongoUrl'), {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
  });

export const close = (): Promise<void> => mongoose.connection.close();
