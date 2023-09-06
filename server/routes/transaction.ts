import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import { body, validationResult } from 'express-validator';
import Service, { Type } from '../services/transaction';
import { User } from '../models/user';

const router = express.Router();

router.post('/create/:type', [
  body('from').notEmpty().withMessage('From is required'),
  body('to').notEmpty().withMessage('To is required'),
  body('amount').notEmpty().withMessage('Amount is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('description').notEmpty().withMessage('Description is required'),
], async (req: MyRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    let type: Type;
    switch (req.params.type) {
      case 'expense':
        type = Type.Expense;
        break;
      case 'income':
        type = Type.Income;
        break;
      default:
        type = Type.Transfer;
        break;
    }
          
    const service = new Service({ body: req.body, type, user: (req.user as User) });
          
    const validation = await service.validateBody();
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const newExpense = await service.create();

    if (newExpense.error) {
      return res.status(404).json({ error: 'Unknown problem' });
    }

    res.status(201).json(newExpense.result);
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
