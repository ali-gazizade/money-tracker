import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import WalletModel from '../models/wallet';
import { isValidObjectId } from 'mongoose';

const router = express.Router();

// List Wallets
router.get('/list', async (req: Request, res: Response) => {
  try {
    const wallets = await WalletModel.find({ active: true });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Wallet
router.put('/update/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, firstTimeAmounts } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    const wallet = await WalletModel.findByIdAndUpdate(
      id,
      { name, firstTimeAmounts },
      { new: true }
    );

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Wallet
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

    const wallet = new WalletModel({ name, firstTimeAmounts, active: true });
    const savedWallet = await wallet.save();

    res.status(201).json(savedWallet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
