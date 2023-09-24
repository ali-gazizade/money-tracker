import express, { Response } from 'express';
import { MyRequest } from '../customs/express';
import { body, validationResult } from 'express-validator';
import WalletModel, { Wallet } from '../models/wallet';
import mongoose, { isValidObjectId } from 'mongoose';
import AmountModel from '../models/amount';
import walletAssembler from '../assemblers/wallet';
import CurrencyModel from '../models/currency';

const router = express.Router();

router.get('/list', async (req: MyRequest, res: Response) => {
  try {
    const wallets = await WalletModel.find({ user: req.user, active: true }).populate({
      path: 'initialAmounts',
      populate: { path: 'currency' }
    });
    res.status(200).json(wallets.map(e => walletAssembler(e)));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/create', [
  body('name').notEmpty().withMessage('Name is required'),
  body('initialAmounts').notEmpty().withMessage('First time amounts must be provided'),
], async (req: MyRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, initialAmounts } = req.body;

    // Check first time amount currencies
    for (let initialAmount of initialAmounts) {
      if (!mongoose.Types.ObjectId.isValid(initialAmount?.currency)) {
        return res.status(400).json({ error: 'Invalid currency id:' + initialAmount?.currency });
      }

      const currency = await CurrencyModel.findOne({ _id: initialAmount.currency, user: req.user });

      if (!currency) {
        return res.status(404).json({ error: 'Currency not found with id:' + initialAmount.currency });
      }
    }

    // Create the amount documents
    const amountIds: string[] = [];
    for (let initialAmount of initialAmounts) {
      const savedAmount = await (new AmountModel({
        value: initialAmount.value,
        currency: initialAmount.currency,
        user: req.user
      })).save();
      amountIds.push(savedAmount._id);
    }

    const wallet = new WalletModel({ name, initialAmounts: amountIds, user: req.user, active: true });
    const savedWallet = await wallet.save();

    res.status(201).json(walletAssembler(savedWallet));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/get/:id', async (req: MyRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const wallet: Wallet | null = await WalletModel.findOne({ _id: id, user: req.user, active: true }).populate({
      path: 'initialAmounts',
      populate: { path: 'currency' }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.status(200).json(walletAssembler(wallet));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:id', async (req: MyRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    const wallet = await WalletModel.findOne({ _id: id, user: req.user, active: true });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (typeof name !== 'undefined') {
      wallet.name = name;
    }

    if (typeof active !== 'undefined') {
      wallet.active = active;
    }

    await wallet.save();

    res.status(200).json(walletAssembler(wallet));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
