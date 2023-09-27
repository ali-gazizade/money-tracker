import bcrypt from 'bcrypt';
import UserModel from "../models/user";
import CurrencyModel from '../models/currency';
import mongoose from 'mongoose';

const setup = async () => {
  const name = 'User User';
  const username = 'test@example.com';
  const password = 'testpassword';
  const DB_CONNECTION = 'mongodb://localhost:27017/money-tracker';

  try {
    await mongoose.connect(DB_CONNECTION);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }

  // Check if there are any users in the database
  const userCount = await UserModel.countDocuments();
  if (userCount > 0) {
    console.error('There are existing users');
    return;
  }
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = new UserModel({
    name,
    username,
    password: hashedPassword,
  });
  await user.save();

  // Create a default currency
  const currency = new CurrencyModel({ name: 'USD', isDefault: true, user: user._id, exchangeRate: 1, active: true });
  await currency.save();

  console.log('Setup finished successfully');
  return;
}

setup();