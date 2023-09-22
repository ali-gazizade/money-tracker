import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import { body, validationResult } from 'express-validator';
import Service, { Type } from '../services/transaction';
import { User } from '../models/user';
import TransactionBaseModel from '../models/transactionBase';
import transactionAssembler from '../assemblers/transaction';
import ExpenseModel from '../models/expense';
import IncomeModel from '../models/income';
import TransferModel from '../models/transfer';
import moment from 'moment';

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

router.get('/list', async (req: MyRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skipAmount = (page - 1) * limit;

    const query = { user: req.user };

    const transactionBases = await TransactionBaseModel.find(query)
      .sort({ happenedAt: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const population = [
      {
        path: 'transactionBase',
        populate: [
          {
            path: 'amount',
            populate: { path: 'currency' }
          },
          { path: 'city' },
        ]
      },
      { path: 'from' },
      { path: 'to' }
    ]

    const transactionBaseIds = transactionBases.map(e => e._id);
    const expenses = await ExpenseModel.find({
      transactionBase: { $in: transactionBaseIds }
    }).populate(population);
    const incomes = await IncomeModel.find({
      transactionBase: { $in: transactionBaseIds }
    }).populate(population);
    const transfers = await TransferModel.find({
      transactionBase: { $in: transactionBaseIds }
    }).populate(population);
    const transactions = [...expenses, ...incomes, ...transfers].sort((a, b) =>
      (+moment(b.transactionBase.happenedAt).format('X')) - (+moment(a.transactionBase.happenedAt).format('X'))
    );

    const totalCount = await TransactionBaseModel.countDocuments(query);

    res.status(200).json({
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      transactions: transactions.map(e => transactionAssembler(e))
    });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(500).json({ error });
  }
});

export default router;
