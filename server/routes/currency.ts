import { Router, Request, Response } from 'express';
import CurrencyModel, { Currency } from '../models/currency';
import { body, validationResult } from 'express-validator';

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

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('isDefault').notEmpty().withMessage('isDefault is required')
],
 async (req: Request, res: Response) => {
  try {
    const { name, isDefault } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if a currency with the same name already exists
    const existingCurrency = await CurrencyModel.findOne({ name, active: 1 }).exec();
    if (existingCurrency) {
      return res.status(409).json({ error: 'Currency already exists' });
    }

    const currency = new CurrencyModel({ name, isDefault, active: 1 });
    await currency.save();

    res.status(201).json(currency);
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, isDefault, active } = req.body;

    const currency = await CurrencyModel.findOne({ id, active: 1 });
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    currency.name = name;
    currency.isDefault = isDefault;
    currency.active = active;
    await currency.save();

    res.status(200).json(currency);
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
