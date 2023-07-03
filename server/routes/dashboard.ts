import express, { Response } from 'express';
import { MyRequest } from '../customs/express';

const router = express.Router();

router.get('/', (req: MyRequest, res: Response) => {
  res.send('Dashboard');
});

export default router;