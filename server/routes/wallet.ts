import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import WalletModel, { Wallet } from '../models/wallet';
import mongoose, { isValidObjectId } from 'mongoose';
import AmountModel from '../models/amount';

const router = express.Router();

router.get('/list', async (req: Request, res: Response) => {
  try {
    const wallets = await WalletModel.find({ active: true }).populate({
      path: 'firstTimeAmounts',
      populate: { path: 'currency' }
    });
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/create', [
  body('name').notEmpty().withMessage('Name is required'),
  body('firstTimeAmounts').notEmpty().withMessage('First time amounts must be provided'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, firstTimeAmounts } = req.body;

    const amountIds: string[] = [];
    for (let firstTimeAmount of firstTimeAmounts) {
      const savedAmount = await (new AmountModel(firstTimeAmount)).save();
      amountIds.push(savedAmount._id);
    }

    const wallet = new WalletModel({ name, firstTimeAmounts: amountIds, active: true });
    const savedWallet = await wallet.save();

    res.status(201).json(savedWallet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/get/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const wallet: Wallet | null = await WalletModel.findById(id).populate({
      path: 'firstTimeAmounts',
      populate: { path: 'currency' }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.status(200).json(wallet);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    const wallet = await WalletModel.findOne({ _id: id,  active: true });

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

    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
