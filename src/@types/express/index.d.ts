import * as http from 'http';

interface decodedToken {
  _id: string;
  iat: number;
  exp: number;
}

declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: decodedToken;
  }
}
