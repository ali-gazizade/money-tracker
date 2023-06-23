import { Router, Request, Response } from 'express';
import CurrencyModel, { Currency } from '../models/currency';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const router = Router();

router.get('/list', async (req: Request, res: Response) => {
  try {
    const currencies = await CurrencyModel.find({ active: true });
    res.status(200).json(currencies);
  } catch (error) {
    console.error('Error retrieving currencies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create', [
  body('name').notEmpty().withMessage('Name is required'),
  body('isDefault').notEmpty().withMessage('isDefault is required')
],
 async (req: Request, res: Response) => {
  try {
    let { name, isDefault } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if a currency with the same name already exists
    const existingCurrency = await CurrencyModel.findOne({ name, active: true }).exec();
    if (existingCurrency) {
      return res.status(409).json({ error: 'Currency already exists' });
    }

    // Check if there is a default one
    const defaultCurrency = await CurrencyModel.findOne({ isDefault: true, active: true }).exec();
    if (isDefault === true && defaultCurrency) {
      defaultCurrency.isDefault = false;
      await defaultCurrency.save();
    } else if (!defaultCurrency) {
      isDefault = true;
    }

    const currency = new CurrencyModel({ name, isDefault, active: true });
    await currency.save();

    res.status(201).json(currency);
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/update/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { name, isDefault, active } = req.body;

    if (active === false) {
      isDefault = false;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const currency = await CurrencyModel.findOne({ _id: id, active: true });
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    // Check for default
    if (typeof isDefault !== 'undefined') {
      const defaultCurrency = await CurrencyModel.findOne({ isDefault: true, active: true }).exec();

      if (isDefault === true && defaultCurrency) {
        defaultCurrency.isDefault = true;
        defaultCurrency.save();
      } else if (isDefault === false && !defaultCurrency) {
        // There must be at least 1 default, so nothing will happen here
        isDefault = true;
      }
    }

    if (typeof name !== 'undefined') {
      currency.name = name;
    }

    if (typeof isDefault !== 'undefined') {
      currency.isDefault = isDefault;
    }

    if (typeof active !== 'undefined') {
      currency.active = active;
    }

    await currency.save();

    // If the default currency removed then make 1 default
    const defaultCurrenciesCount = await CurrencyModel.count({ isDefault: true, active: true });
    if (defaultCurrenciesCount === 0) {
      const anyCurrency = await CurrencyModel.findOne({ active: true }).exec();
      if (anyCurrency) {
        anyCurrency.isDefault = true;
        await anyCurrency.save();
      }
    }

    res.status(200).json(currency);
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
