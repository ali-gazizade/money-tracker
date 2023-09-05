import request from 'supertest';
import app from '../app';
import AmountModel from "../models/amount";
import CurrencyModel from "../models/currency";
import WalletModel from "../models/wallet";
import ContactModel from "../models/contact";
import CityModel from "../models/city";
import UserModel from "../models/user";

beforeAll(async () => {
  const credentials = {
    username: 'test@example.com',
    password: 'testpassword'
  };

  const response = await request(app)
    .post('/auth/login')
    .send(credentials);

  const tokenCookie = response.header['set-cookie'];
  if (tokenCookie) {
    const tokenMatch = tokenCookie[0].match(/token=([^;]*)/);
    if (tokenMatch) {
      global.token = tokenMatch[1];
    } else {
      throw new Error('No "token" cookie found in the response.');
    }
  } else {
    throw new Error('No set-cookie header found in the response.');
  }
});

beforeEach(async () => {
  const user = await UserModel.findOne({ username: 'test@example.com' });

  await WalletModel.deleteMany({ user: user?._id });
  await AmountModel.deleteMany({ user: user?._id });
  await CurrencyModel.deleteMany({ user: user?._id });
  await ContactModel.deleteMany({ user: user?._id });

  const currency1 = await CurrencyModel.create({ name: 'AZN', isDefault: true, active: true, user: user?._id });
  const currency2 = await CurrencyModel.create({ name: 'USD', isDefault: false, active: true, user: user?._id });

  const amount1 = await AmountModel.create({ value: '148.00', currency: currency1._id, user: user?._id });
  const amount2 = await AmountModel.create({ value: '21.50', currency: currency2._id, user: user?._id });
  const amount3 = await AmountModel.create({ value: '152.00', currency: currency2._id, user: user?._id });

  await WalletModel.create({ name: 'Wallet 1', firstTimeAmounts: [amount1, amount2], user: user?._id });
  await WalletModel.create({ name: 'Wallet 2', firstTimeAmounts: [amount3], user: user?._id });
  await WalletModel.create({ name: 'Wallet 3', firstTimeAmounts: [], user: user?._id });

  await ContactModel.create({ name: 'Bravo', user: user?._id });
  await ContactModel.create({ name: 'GrandMart', user: user?._id });
  await ContactModel.create({ name: 'Araz', user: user?._id });

  await CityModel.create({ name: 'Baku', countryName: 'Azerbaijan', user: user?._id });
  await CityModel.create({ name: 'Sheki', countryName: 'Azerbaijan', user: user?._id });
});