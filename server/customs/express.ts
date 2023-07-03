import { Request } from 'express';
import { User } from '../models/user';

interface MyRequest extends Request {
  user?: User;
}

export { MyRequest };
