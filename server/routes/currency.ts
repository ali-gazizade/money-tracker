import { Router, Response } from 'express';
import { MyRequest } from '../customs/express';
import CurrencyModel, { Currency } from '../models/currency';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import currencyAssembler from '../assemblers/currency';

const router = Router();

router.get('/list', async (req: MyRequest, res: Response) => {
  try {
    const currencies = await CurrencyModel.find({ user: req.user, active: true });
    res.status(200).json(currencies.map(e => currencyAssembler(e)));
  } catch (error) {
    console.error('Error retrieving currencies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create', [
  body('name').notEmpty().withMessage('Name is required'),
  body('isDefault').notEmpty().withMessage('isDefault is required')
],
 async (req: MyRequest, res: Response) => {
  try {
    let { name, isDefault } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if a currency with the same name already exists
    const existingCurrency = await CurrencyModel.findOne({ name, user: req.user, active: true }).exec();
    if (existingCurrency) {
      return res.status(409).json({ error: 'Currency already exists' });
    }

    // Check if there is a default one
    const defaultCurrency = await CurrencyModel.findOne({ isDefault: true, user: req.user, active: true }).exec();
    if (isDefault === true && defaultCurrency) {
      defaultCurrency.isDefault = false;
      await defaultCurrency.save();
    } else if (!defaultCurrency) {
      isDefault = true;
    }

    const currency = new CurrencyModel({ name, isDefault, user: req.user, active: true });
    await currency.save();

    res.status(201).json(currencyAssembler(currency));
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/get/:id', async (req: MyRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const currency: Currency | null = await CurrencyModel.findOne({ _id: id, user: req.user, active: true });

    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    return res.status(200).json(currencyAssembler(currency));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:id', async (req: MyRequest, res: Response) => {
  try {
    const { id } = req.params;
    let { name, isDefault, active } = req.body;

    if (active === false) {
      isDefault = false;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const currency = await CurrencyModel.findOne({ _id: id, user: req.user, active: true });
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    // Check for default
    if (typeof isDefault !== 'undefined') {
      const defaultCurrency = await CurrencyModel.findOne({ isDefault: true, user: req.user, active: true }).exec();

      if (isDefault === true && defaultCurrency) {
        defaultCurrency.isDefault = false;
        await defaultCurrency.save();
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

    // Check if the same currency already exists
    if (active !== false && name) {
      const existingCurrency = await CurrencyModel.findOne({ name: currency.name, user: req.user, active: true }).exec();
      if (existingCurrency) {
        return res.status(409).json({ error: 'Currency already exists' });
      }
    }

    await currency.save();

    // If the default currency removed then make 1 default
    const defaultCurrenciesCount = await CurrencyModel.count({ isDefault: true, user: req.user, active: true });
    if (defaultCurrenciesCount === 0) {
      const anyCurrency = await CurrencyModel.findOne({ user: req.user, active: true }).exec();
      if (anyCurrency) {
        anyCurrency.isDefault = true;
        await anyCurrency.save();
      }
    }

    res.status(200).json(currencyAssembler(currency));
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
