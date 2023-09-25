import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import { body, validationResult } from 'express-validator';
import Service, { BorrowerRepayerType, Type } from '../services/loan';
import TransactionService, { Type as TransactionType } from '../services/transaction';
import { User } from '../models/user';
import BorrowingModel from '../models/borrowing';
import borrowingAssembler from '../assemblers/borrowing';
import RepaymentModel from '../models/repayment';
import repaymentAssembler from '../assemblers/repayment';
import LoanModel from '../models/loan';
import loanAssembler from '../assemblers/loan';

const router = express.Router();

router.post('/create/:type', [
  body('contact').notEmpty().withMessage('Contact is required'),
  body('amount').notEmpty().withMessage('Amount is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req: MyRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    let type: Type;
    if (req.params.type === 'borrowing') {
      type = Type.Borrowing;
    } else if (req.params.type === 'repayment') {
      type = Type.Repayment;
    } else {
      return res.status(400).json({ error: 'Type is not valid' });
    }

    // Create a new transaction and bind it to loan action
    let bindedTransactionBase;
    if (req.body.transactionParams) {
      let transactionType;
      if (type === Type.Borrowing) {
        if (req.body.borrowerType === BorrowerRepayerType.Contact) {
          transactionType = TransactionType.Expense;
        } else {
          transactionType = TransactionType.Income;
        }
      } else {
        if (req.body.borrowerType === BorrowerRepayerType.Contact) {
          transactionType = TransactionType.Income;
        } else {
          transactionType = TransactionType.Expense;
        }
      }

      const transactionService = new TransactionService({
        body: req.body.transactionParams,
        type: transactionType,
        user: (req.user as User)
      });

      const transactionValidation = await transactionService.validateBody();
      if (transactionValidation.error) {
        return res.status(400).json({ error: transactionValidation.error });
      }

      const newTransaction = await transactionService.create();

      if (newTransaction.error) {
        return res.status(404).json({ error: newTransaction.error });
      }

      bindedTransactionBase = newTransaction.result;
    }
    // End Create a new transaction and bind it to loan action
          
    const service = new Service({
      body: req.body,
      type,
      user: (req.user as User),
      bindedTransactionBaseId: bindedTransactionBase?._id
    });
          
    const validation = await service.validateBody();
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const newLoanAction = await service.create();

    if (newLoanAction.error) {
      return res.status(404).json({ error: newLoanAction.error });
    }

    res.status(201).json({ ...newLoanAction.result, bindedTransactionBase });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/list/:type', async (req: MyRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skipAmount = (page - 1) * limit;

    const query = { user: req.user };

    const population = [
      {
        path: 'amount',
        populate: { path: 'currency' }
      },
      { path: 'contact' },
      { path: 'bindedTransactionBase' }
    ];

    if (req.params.type === 'borrowing') {
      const borrowings = await BorrowingModel.find(query)
        .populate(population)
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit);

      const totalCount = await BorrowingModel.countDocuments(query);

      res.status(200).json({
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        borrowings: borrowings.map(e => borrowingAssembler(e))
      });
    } else if (req.params.type === 'repayment') {
      const repayments = await RepaymentModel.find(query)
        .populate(population)
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit);

      const totalCount = await RepaymentModel.countDocuments(query);

      res.status(200).json({
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        repayments: repayments.map(e => repaymentAssembler(e))
      });
    } else {
      return res.status(400).json({ error: 'Type is not valid' });
    }
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(500).json({ error });
  }
});

router.get('/contact_list', async (req: MyRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skipAmount = (page - 1) * limit;

    const query = { user: req.user, 'loanAmountsToUser.0': { "$exists": true } };

    const population = [
      { path: 'contact' },
      {
        path: 'loanAmountsToUser',
        populate: { path: 'currency' }
      }
    ];

    const loans = await LoanModel.find(query)
      .populate(population)
      .sort({ _id: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalCount = await LoanModel.countDocuments(query);

    res.status(200).json({
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      loans: loans.map(e => loanAssembler(e))
    });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(500).json({ error });
  }
});

export default router;
