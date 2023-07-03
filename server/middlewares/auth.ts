import { Response, NextFunction } from 'express';
import { MyRequest } from '../customs/express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user';

const auth = async (req: MyRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY as string) as { userId: string };
    const user = await UserModel.findOne({ _id: decodedToken.userId });

    if (!user) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
};

export default auth;
