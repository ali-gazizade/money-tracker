import express, { Request, Response } from 'express';
import UserModel from '../models/user';

const router = express.Router();

// GET /users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().exec();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

// POST /users
// Todo add validations
router.post('/', async (req: Request, res: Response) => {
  const { name, username, password } = req.body;

  // Validate the request body
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, username, and password are required' });
  }

  try {
    const newUser = new UserModel({ name, username, password });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating a user' });
  }
});

// DELETE /users/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId).exec();
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
});

export default router;
