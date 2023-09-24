import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import ExpenseModel from '../models/expense';
import IncomeModel from '../models/income';
import currencyAssembler from '../assemblers/currency';
import WalletModel from '../models/wallet';
import LoanModel from '../models/loan';
import LooseObject from '../interfaces/LooseObject';
import TransferModel from '../models/transfer';
import { ObjectId } from 'mongoose';
import { Interface } from 'readline';
import CurrencyModel, { Currency } from '../models/currency';

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

const walletsAggregate = (transactionField: 'from' | 'to') => ([
  {
    $lookup: {
      from: 'wallets',
      localField: transactionField,
      foreignField: '_id',
      as: transactionField
    }
  },
  {
    $unwind: `$${transactionField}`
  },
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
      as: 'transactionAmount'
    }
  },
  {
    $unwind: '$transactionAmount'
  },
  {
    $group: {
      _id: {
        wallet: `$${transactionField}._id`,
        currency: '$transactionAmount.currency'
      },
      total: {
        $sum: '$transactionAmount._value'
      }
    }
  },
  {
    $group: {
      _id: '$_id.wallet',
      amounts: {
        $push: {
          currency: '$_id.currency',
          total: '$total'
        }
      }
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

router.get('/wallet_list', async (req: MyRequest, res: Response) => {
  try {
    const walletsRes = await WalletModel.find().populate('firstTimeAmounts');

    // Add initial amounts
    const wallets: LooseObject[] = walletsRes.map(wallet => {
      const currentAmountsObj: {
        [key: string]: number
      } = {};

      wallet.firstTimeAmounts.forEach(amount => {
        currentAmountsObj[amount.currency] = (
          currentAmountsObj[amount.currency] ? (currentAmountsObj[amount.currency] + amount._value) : amount._value
        );
      });

      const currentAmounts: { currency: string, total: number }[] = [];

      return {
        _id: wallet._id,
        name: wallet.name,
        currentAmountsObj,
        currentAmounts
      };
    });
    // End Add initial amounts

    // Add incomes
    const incomesByWallets = await IncomeModel.aggregate(walletsAggregate('to'));

    incomesByWallets.forEach(tr => {
      tr.amounts.forEach((amount: { currency: ObjectId, total: number }) => {
        const currencyId = amount.currency.toString();

        const wallet = wallets.find(e => e._id.toString() === tr._id.toString());

        if (wallet && wallet.currentAmountsObj) {
          wallet.currentAmountsObj[currencyId] = (
            wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] + amount.total) : amount.total
          );
        }
      });
    });
    // End Add incomes

    // Add transfers
    const transfersToWallets = await TransferModel.aggregate(walletsAggregate('to'));

    transfersToWallets.forEach(tr => {
      tr.amounts.forEach((amount: { currency: ObjectId, total: number }) => {
        const currencyId = amount.currency.toString();

        const wallet = wallets.find(e => e._id.toString() === tr._id.toString());

        if (wallet && wallet.currentAmountsObj) {
          wallet.currentAmountsObj[currencyId] = (
            wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] + amount.total) : amount.total
          );
        }
      });
    });
    // End Add transfers

    // Subtract expenses
    const expensesByWallets = await ExpenseModel.aggregate(walletsAggregate('from'));

    expensesByWallets.forEach(tr => {
      tr.amounts.forEach((amount: { currency: ObjectId, total: number }) => {
        const currencyId = amount.currency.toString();

        const wallet = wallets.find(e => e._id.toString() === tr._id.toString());

        if (wallet && wallet.currentAmountsObj) {
          wallet.currentAmountsObj[currencyId] = (
            wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] - amount.total) : -amount.total
          );
        }
      });
    });
    // End Subtract expenses

    // Subtract transfers
    const transfersFromWallets = await TransferModel.aggregate(walletsAggregate('from'));

    transfersFromWallets.forEach(tr => {
      tr.amounts.forEach((amount: { currency: ObjectId, total: number }) => {
        const currencyId = amount.currency.toString();

        const wallet = wallets.find(e => e._id.toString() === tr._id.toString());

        if (wallet && wallet.currentAmountsObj) {
          wallet.currentAmountsObj[currencyId] = (
            wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] - amount.total) : -amount.total
          );
        }
      });
    });
    // End Subtract transfers

    // Add currentAmounts to wallets
    wallets.forEach(wallet => {
      Object.keys(wallet.currentAmountsObj).forEach((k: string) => {
        wallet.currentAmounts.push({
          currencyId: k,
          total: wallet.currentAmountsObj[k]
        });
      });

      delete wallet.currentAmountsObj;
    });
    // End Add currentAmounts to wallets

    // Add currency names
    const currencies = await CurrencyModel.find();

    wallets.forEach(wallet => {
      wallet.currentAmounts.forEach((amount: { currencyId: string, currencyName: string, total: number }) => {
        const currency = currencies.find((e: Currency) => amount.currencyId === e._id.toString());

        if (currency) {
          amount.currencyName = currency.name;
        }
      });
    });
    // End Add currency names

    res.status(200).json({
      wallets
    });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;