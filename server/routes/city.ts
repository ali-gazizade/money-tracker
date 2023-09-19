import { Router, Response } from 'express';
import { MyRequest } from '../customs/express';
import CityModel, { City } from '../models/city';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import cityAssembler from '../assemblers/city';

const router = Router();

router.get('/list', async (req: MyRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skipAmount = (page - 1) * limit;

    const query = { user: req.user, active: true };

    const cities = await CityModel.find(query)
      .skip(skipAmount)
      .limit(limit);

    const totalCount = await CityModel.countDocuments(query);

    res.status(200).json({
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      cities: cities.map(e => cityAssembler(e))
    });
  } catch (error) {
    console.error('Error retrieving cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/country_list', async (req: MyRequest, res: Response) => {
  try {
    const countries = await CityModel.distinct('countryName', { user: req.user, active: true });

    res.status(200).json(countries);
  } catch (error) {
    console.error('Error retrieving cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create', [
  body('name').notEmpty().withMessage('name is required'),
  body('countryName').notEmpty().withMessage('countryName is required')
],
 async (req: MyRequest, res: Response) => {
  try {
    let { name, countryName } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if a city with the same name already exists
    const existingCity = await CityModel.findOne({ name, countryName, user: req.user, active: true }).exec();
    if (existingCity) {
      return res.status(409).json({ error: 'City already exists' });
    }

    const city = new CityModel({ name, countryName, user: req.user, active: true });
    await city.save();

    res.status(201).json(cityAssembler(city));
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/get/:id', async (req: MyRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const city: City | null = await CityModel.findOne({ _id: id, user: req.user, active: true });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    return res.status(200).json(cityAssembler(city));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:id', async (req: MyRequest, res: Response) => {
  try {
    const { id } = req.params;
    let { name, countryName, active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const city = await CityModel.findOne({ _id: id, user: req.user, active: true });
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
        user: req.user,
        active: true
      }).exec();
      if (existingCity) {
        return res.status(409).json({ error: 'City already exists' });
      }
    }

    await city.save();

    res.status(200).json(cityAssembler(city));
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
