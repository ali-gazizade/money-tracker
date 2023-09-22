import { Router, Response } from 'express';
import { MyRequest } from '../customs/express';
import ContactModel, { Contact } from '../models/contact';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import contactAssembler from '../assemblers/contact';
import { Amount } from '../models/amount';
import LooseObject from '../interfaces/LooseObject';

const router = Router();

router.get('/list', async (req: MyRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { name } = req.query;

    const skipAmount = (page - 1) * limit;

    const query: LooseObject = { user: req.user, active: true };

    if (name) {
      query.name = {
        $regex: '.*' + name + '.*',
        $options: 'i'
      };
    }

    const contacts = await ContactModel.find(query)
      .skip(skipAmount)
      .limit(limit);

    const totalCount = await ContactModel.countDocuments(query);

    res.status(200).json({
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      contacts: contacts.map(e => contactAssembler(e))
    });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create', [
  body('name').notEmpty().withMessage('Name is required')
],
 async (req: MyRequest, res: Response) => {
  try {
    let { name } : { name: string } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if a contact with the same name already exists
    const existingContact = await ContactModel.findOne({ name, user: req.user, active: true }).exec();
    if (existingContact) {
      return res.status(409).json({ error: 'Contact already exists' });
    }

    const contact = new ContactModel({ name, user: req.user, active: true });
    await contact.save();

    res.status(201).json({
      contact: contactAssembler(contact)
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/get/:id', async (req: MyRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const contact: Contact | null = await ContactModel.findOne({ _id: id, user: req.user, active: true });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json(contactAssembler(contact));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:id', async (req: MyRequest, res: Response) => {
  try {
    const { id } = req.params;
    let { name, active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const contact = await ContactModel.findOne({ _id: id, user: req.user, active: true });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (typeof name !== 'undefined') {
      contact.name = name;
    }

    if (typeof active !== 'undefined') {
      contact.active = active;
    }

    // Check if the same contact already exists
    if (active !== false && name) {
      const existingContact = await ContactModel.findOne({ name: contact.name, user: req.user, active: true }).exec();
      if (existingContact) {
        return res.status(409).json({ error: 'Contact already exists' });
      }
    }

    await contact.save();

    res.status(200).json(contactAssembler(contact));
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
