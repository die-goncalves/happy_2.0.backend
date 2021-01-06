import * as http from 'http';
import { user } from '@src/models/user';

declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: user;
  }
}
