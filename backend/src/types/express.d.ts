import 'express-serve-static-core';
import { AuthenticatedUser } from './auth';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
