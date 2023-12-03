"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const currency_1 = __importDefault(require("../models/currency"));
const mongoose_1 = __importDefault(require("mongoose"));
const setup = async () => {
    const name = 'User User';
    const username = 'test@example.com';
    const password = 'testpassword';
    const DB_CONNECTION = 'mongodb://localhost:27017/money-tracker';
    try {
        await mongoose_1.default.connect(DB_CONNECTION);
    }
    catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
    // Check if there are any users in the database
    const userCount = await user_1.default.countDocuments();
    if (userCount > 0) {
        console.error('There are existing users');
        return;
    }
    // Hash the password
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Create the user
    const user = new user_1.default({
        name,
        username,
        password: hashedPassword,
    });
    await user.save();
    // Create a default currency
    const currency = new currency_1.default({ name: 'USD', isDefault: true, user: user._id, exchangeRate: 1, active: true });
    await currency.save();
    console.log('Setup finished successfully');
    return;
};
setup();
