import { Router, Request, Response } from 'express';
import CityModel, { City } from '../models/city';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const router = Router();

router.get('/list', async (req: Request, res: Response) => {
  try {
    const cities = await CityModel.find({ active: true });
    res.status(200).json(cities);
  } catch (error) {
    console.error('Error retrieving cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create', [
  body('name').notEmpty().withMessage('name is required'),
  body('countryName').notEmpty().withMessage('countryName is required')
],
 async (req: Request, res: Response) => {
  try {
    let { name, countryName } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if a city with the same name already exists
    const existingCity = await CityModel.findOne({ name, countryName, active: true }).exec();
    if (existingCity) {
      return res.status(409).json({ error: 'City already exists' });
    }

    const city = new CityModel({ name, countryName, active: true });
    await city.save();

    res.status(201).json(city);
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/get/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const city: City | null = await CityModel.findById(id);

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    return res.status(200).json(city);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { name, countryName, active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const city = await CityModel.findOne({ _id: id, active: true });
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    if (typeof name !== 'undefined') {
      city.name = name;
    }

    if (typeof countryName !== 'undefined') {
      city.countryName = countryName;
    }

    if (typeof active !== 'undefined') {
      city.active = active;
    }

    // Check if the same city already exists
    if (active !== false && (name || countryName)) {
      const existingCity = await CityModel.findOne({
        name: city.name,
        countryName: city.countryName,
        active: true
      }).exec();
      if (existingCity) {
        return res.status(409).json({ error: 'City already exists' });
      }
    }

    await city.save();

    res.status(200).json(city);
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
