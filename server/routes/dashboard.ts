import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import ExpenseModel from '../models/expense';
import IncomeModel from '../models/income';
import currencyAssembler from '../assemblers/currency';
import WalletModel from '../models/wallet';
import LoanModel from '../models/loan';

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

const loanAggregate = (matchObj: any) => ([
  {
    $lookup: {
      from: 'amounts',
      localField: 'loanAmountsToUser',
      foreignField: '_id',
      as: 'loanAmountsToUser'
    }
  },
  {
    $unwind: '$loanAmountsToUser'
  },
  {
    $lookup: {
      from: 'currencies',
      localField: 'loanAmountsToUser.currency',
      foreignField: '_id',
      as: 'currency'
    }
  },
  {
    $unwind: '$currency'
  },
  {
    $match: matchObj
  },
  {
    $group: {
      _id: '$loanAmountsToUser.currency',
      currency: { $first: '$currency' },
      total: {
        $sum: '$loanAmountsToUser._value'
      },
    }
  }
]);

router.get('/', (req: MyRequest, res: Response) => {
  res.send('Dashboard');
});

router.get('/totals', async (req: MyRequest, res: Response) => {
  try {
    const wallets = await WalletModel.find().populate([
      {
        path: 'firstTimeAmounts',
        populate: { path: 'currency' }
      }
    ]);
    const expensesByCurrency = await ExpenseModel.aggregate(totalsAggregate);
    const incomesByCurrency = await IncomeModel.aggregate(totalsAggregate);

    // Calculate the sum of firstTimeAmounts first
    let totalFirstTimeAmounts = 0;
    for (let wallet of wallets) {
      for (let amount of wallet.firstTimeAmounts) {
        totalFirstTimeAmounts += amount.currency._exchangeRate * amount._value;
      }
    }
    // End Calculate the sum of firstTimeAmounts first

    let totalExpense = 0;

    for (let e of expensesByCurrency) {
      totalExpense += (e.total * e.currency._exchangeRate);
    }

    let totalIncome = 0;

    for (let e of incomesByCurrency) {
      totalIncome += (e.total * e.currency._exchangeRate);
    }

    res.status(200).json({
      expense: totalExpense.toFixed(2),
      income: totalIncome.toFixed(2),
      balance: (totalFirstTimeAmounts + totalIncome - totalExpense).toFixed(2)
    });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/loan', async (req: MyRequest, res: Response) => {
  try {
    let loanAmountToUser = 0;
    let loanAmountToContacts = 0;

    const amountsToUser = await LoanModel.aggregate(
      loanAggregate({ 'loanAmountsToUser._value': { $gt: 0 } })
    );

    for (let amount of amountsToUser) {
      loanAmountToUser += (amount.total * amount.currency._exchangeRate);
    }

    const amountsToContacts = await LoanModel.aggregate(
      loanAggregate({ 'loanAmountsToUser._value': { $lt: 0 } })
    );

    for (let amount of amountsToContacts) {
      loanAmountToContacts += Math.abs(amount.total * amount.currency._exchangeRate);
    }

    res.status(200).json({
      loanAmountToUser,
      loanAmountToContacts
    });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;