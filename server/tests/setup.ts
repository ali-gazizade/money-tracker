import request from 'supertest';
import app from '../app';
import AmountModel from "../models/amount";
import CurrencyModel from "../models/currency";
import WalletModel from "../models/wallet";
import ContactModel from "../models/contact";
import CityModel from "../models/city";
import UserModel from "../models/user";
import mongoose from 'mongoose';
import ExpenseModel from '../models/expense';
import IncomeModel from '../models/income';
import TransferModel from '../models/transfer';
import TransactionBaseModel from '../models/transactionBase';

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
}

const login = async () => {
  const credentials = {
    username: 'test@example.com',
    password: 'testpassword'
  };

  const response = await request(app)
    .post('/auth/login')
    .send(credentials);

  const user = await UserModel.findOne({ username: credentials.username });

  const tokenCookie = response.header['set-cookie'];
  if (tokenCookie) {
    const tokenMatch = tokenCookie[0].match(/token=([^;]*)/);
    if (tokenMatch) {
      global.token = tokenMatch[1];
      global.userId = user?._id;
    } else {
      throw new Error('No "token" cookie found in the response.');
    }
  } else {
    throw new Error('No set-cookie header found in the response.');
  }
}

beforeAll(async () => {
  await login();

  await WalletModel.deleteMany();
  await AmountModel.deleteMany();
  await CurrencyModel.deleteMany();
  await ContactModel.deleteMany();
  await CityModel.deleteMany();
  await ExpenseModel.deleteMany();
  await IncomeModel.deleteMany();
  await TransferModel.deleteMany();
  await TransactionBaseModel.deleteMany();

  const currencies = [];
  currencies[0] = await CurrencyModel.create({ name: 'AZN', isDefault: true, active: true, user: global.userId });
  currencies[1] = await CurrencyModel.create({ name: 'USD', isDefault: false, active: true, user: global.userId });
  currencies[2] = await CurrencyModel.create({ name: 'EUR', isDefault: false, active: true, user: global.userId });

  const cities = [];
  cities[0] = await CityModel.create({ name: 'Baku', countryName: 'Azerbaijan', user: global.userId });
  cities[1] = await CityModel.create({ name: 'Sheki', countryName: 'Azerbaijan', user: global.userId });
  cities[2] = await CityModel.create({ name: 'Istanbul', countryName: 'Turkey', user: global.userId });

  const amounts = [];
  amounts[0] = await AmountModel.create({ value: '148.00', currency: currencies[getRandomInt(3)]._id, user: global.userId });
  amounts[1] = await AmountModel.create({ value: '21.50', currency: currencies[getRandomInt(3)]._id, user: global.userId });
  amounts[2] = await AmountModel.create({ value: '152.00', currency: currencies[getRandomInt(3)]._id, user: global.userId });

  const wallets = [];
  wallets[0] = await WalletModel.create({ name: 'Wallet 1', firstTimeAmounts: [amounts[0], amounts[1]], user: global.userId });
  wallets[1] = await WalletModel.create({ name: 'Wallet 2', firstTimeAmounts: [amounts[2]], user: global.userId });
  wallets[2] = await WalletModel.create({ name: 'Wallet 3', firstTimeAmounts: [], user: global.userId });

  const contacts = [];
  contacts[0] = await ContactModel.create({ name: 'Bravo', user: global.userId });
  contacts[1] = await ContactModel.create({ name: 'GrandMart', user: global.userId });
  contacts[2] = await ContactModel.create({ name: 'Araz', user: global.userId });
  contacts[2] = await ContactModel.create({ name: 'John', user: global.userId });
  contacts[2] = await ContactModel.create({ name: 'Jack', user: global.userId });

  const transactionBaseIds = [];
  for (let i = 0; i < 84; i++) {
    const amount = await AmountModel.create({
      value: ((getRandomInt(20) + 1) + '.00'),
      currency: currencies[getRandomInt(3)]._id,
      user: global.userId
    });

    const transactionBase = await TransactionBaseModel.create({
      amount: amount._id,
      city: cities[getRandomInt(3)]._id,
      description: 'Test' + i,
      user: global.userId
    });
    transactionBaseIds.push(transactionBase._id);
  }

  const incomeIds = [];
  for (let i = 0; i < 28; i++) {
    const income = await IncomeModel.create({
      transactionBase: transactionBaseIds[i],
      from: contacts[getRandomInt(3)]._id,
      to: wallets[2]._id,
      user: global.userId
    });
    incomeIds.push(income._id);
  }

  const transferIds = [];
  for (let i = 28; i < 56; i++) {
    const transfer = await TransferModel.create({
      transactionBase: transactionBaseIds[i],
      from: wallets[2]._id,
      to: wallets[getRandomInt(2)]._id,
      user: global.userId
    });
    transferIds.push(transfer._id);
  }

  const expenseIds = [];
  for (let i = 56; i < 84; i++) {
    const expense = await ExpenseModel.create({
      transactionBase: transactionBaseIds[i],
      from: wallets[getRandomInt(2)]._id,
      to: contacts[getRandomInt(3)]._id,
      user: global.userId
    });
    expenseIds.push(expense._id);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
