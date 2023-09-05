import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import { body, validationResult } from 'express-validator';
import WalletModel, { Wallet } from '../models/wallet';
import mongoose, { isValidObjectId } from 'mongoose';
import AmountModel from '../models/amount';
import CurrencyModel from '../models/currency';
import ContactModel from '../models/contact';
import CityModel from '../models/city';
import TransactionModel from '../models/transaction';
import ExpenseModel, { Expense } from '../models/expense';
import expenseAssembler from '../assemblers/expense';

const router = express.Router();

router.post('/create', [
  body('wallet').notEmpty().withMessage('Wallet is required'),
  body('contact').notEmpty().withMessage('Contact is required'),
  body('amount').notEmpty().withMessage('Amount is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('description').notEmpty().withMessage('Description is required'),
], async (req: MyRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { wallet, contact, amount, city, happenedAt, description } = req.body;

    // Check if the ids are valid
    if (!mongoose.Types.ObjectId.isValid(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet id:' + wallet });
    } else if (!mongoose.Types.ObjectId.isValid(contact)) {
      return res.status(400).json({ error: 'Invalid contact id:' + contact });
    } else if (!mongoose.Types.ObjectId.isValid(city)) {
      return res.status(400).json({ error: 'Invalid city id:' + city });
    } else if (!mongoose.Types.ObjectId.isValid(amount?.currency)) {
      return res.status(400).json({ error: 'Invalid currency id:' + amount?.currency });
    }

    const foundWallet = WalletModel.findOne({ _id: wallet, user: req.user });
    const foundContact = ContactModel.findOne({ _id: contact, user: req.user });
    const foundCity = CityModel.findOne({ _id: city, user: req.user });
    const foundCurrency = CurrencyModel.findOne({ _id: amount?.currency, user: req.user });

    if (!foundWallet) {
      return res.status(404).json({ error: 'Wallet not found with id:' + wallet });
    } else if (!foundContact) {
      return res.status(404).json({ error: 'Contact not found with id:' + contact });
    } else if (!foundCity) {
      return res.status(404).json({ error: 'City not found with id:' + city });
    } else if (!foundCurrency) {
      return res.status(404).json({ error: 'Currency not found with id:' + amount?.currency });
    }
    // End Check if the ids are valid

    const savedAmount = await (new AmountModel({
      value: amount.value,
      currency: amount.currency,
      user: req.user
    })).save();

    const savedTransaction = await (new TransactionModel({
      amount: savedAmount._id,
      city: city,
      happenedAt: happenedAt,
      description: description,
      user: req.user
    })).save();

    const savedExpense = await (new ExpenseModel({
      transaction: savedTransaction._id,
      wallet: wallet,
      contact: contact,
      user: req.user
    })).save();

    const expense: Expense | null = await ExpenseModel.findOne({ _id: savedExpense._id }).populate([
      {
        path: 'transaction',
        populate: [
          {
            path: 'amount',
            populate: { path: 'currency' }
          },
          { path: 'city' },
        ]
      },
      { path: 'wallet' },
      { path: 'contact' }
    ]);

    if (!expense) {
      return res.status(404).json({ error: 'Unknown problem' });
    }

    res.status(201).json(expenseAssembler(expense));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
