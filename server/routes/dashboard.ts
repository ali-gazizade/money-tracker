import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import ExpenseModel from '../models/expense';
import IncomeModel from '../models/income';
import currencyAssembler from '../assemblers/currency';

const router = express.Router();

const totalsAggregate = [
  {
    $lookup: {
      from: 'transactionbases',
      localField: 'transactionBase',
      foreignField: '_id',
      as: 'transactionBase'
    }
  },
  {
    $unwind: '$transactionBase'
  },
  {
    $lookup: {
      from: 'amounts',
      localField: 'transactionBase.amount',
      foreignField: '_id',
      as: 'transactionBase.amount'
    }
  },
  {
    $unwind: '$transactionBase.amount'
  },
  {
    $lookup: {
      from: 'currencies',
      localField: 'transactionBase.amount.currency',
      foreignField: '_id',
      as: 'currency'
    }
  },
  {
    $unwind: '$currency'
  },
  {
    $group: {
      _id: '$transactionBase.amount.currency',
      currency: { $first: '$currency' },
      total: {
        $sum: '$transactionBase.amount._value'
      },
    }
  }
];

router.get('/', (req: MyRequest, res: Response) => {
  res.send('Dashboard');
});

router.get('/totals', async (req: MyRequest, res: Response) => {
  try {
    const expensesByCurrency = await ExpenseModel.aggregate(totalsAggregate);
    const incomesByCurrency = await IncomeModel.aggregate(totalsAggregate);

    const defCurExpense = expensesByCurrency.find(e => e.currency.isDefault);
    const expense = {
      total: defCurExpense.total,
      currency: defCurExpense.currency
    };

    for (let e of expensesByCurrency) {
      if (e.currency.isDefault) {
        continue;
      }

      expense.total += (e.total * e.currency._exchangeRate);
    }

    const defCurIncome = incomesByCurrency.find(e => e.currency.isDefault);
    const income = {
      total: defCurIncome.total
    };

    for (let e of incomesByCurrency) {
      if (e.currency.isDefault) {
        continue;
      }

      income.total += (e.total * e.currency._exchangeRate);
    }

    res.status(200).json({
      expense: expense.total.toFixed(2),
      income: income.total.toFixed(2),
      currency: currencyAssembler(expense.currency),
      balance: (income.total - expense.total).toFixed(2)
    });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;