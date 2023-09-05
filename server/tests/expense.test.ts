import request from 'supertest';
import app from '../app';
import WalletModel from '../models/wallet';
import CurrencyModel from '../models/currency';
import ContactModel from '../models/contact';
import CityModel from '../models/city';
import TransactionModel from '../models/transaction';
import ExpenseModel from '../models/expense';
import moment from 'moment';

describe('Expense', () => {
  describe('POST /expense/create', () => {
    it('should create an expense', async () => {
      const transactionCountBefore = await TransactionModel.count();
      const expenseCountBefore = await ExpenseModel.count();

      const wallet = await WalletModel.findOne({ name: 'Wallet 1', active: true });
      const contact = await ContactModel.findOne({ name: 'Bravo', active: true });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true });
      const city = await CityModel.findOne({ name: 'Baku', active: true });

      const response = await request(app)
        .post('/expense/create')
        .set('Cookie', `token=${global.token}`)
        .send({
          wallet: wallet?._id,
          contact: contact?._id,
          amount: {
            value: '56.00',
            currency: currency?._id
          },
          city: city?._id,
          happenedAt: '2023-09-04T07:56:00.000Z',
          description: 'Bought wine',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        wallet: { name: 'Wallet 1' },
        contact: { name: 'Bravo' },
        amount: {
          value: '56.00',
          currency: { name: 'AZN' }
        },
        city: { name: 'Baku' },
        happenedAt: '2023-09-04T07:56:00.000Z',
        description: 'Bought wine'
      });

      const transactionCountAfter = await TransactionModel.count();
      const expenseCountAfter = await ExpenseModel.count();
      expect(transactionCountAfter).toBe(transactionCountBefore + 1);
      expect(expenseCountAfter).toBe(expenseCountBefore + 1);
    });

    it('should create an expense with the current time', async () => {
      const transactionCountBefore = await TransactionModel.count();
      const expenseCountBefore = await ExpenseModel.count();

      const wallet = await WalletModel.findOne({ name: 'Wallet 1', active: true });
      const contact = await ContactModel.findOne({ name: 'Bravo', active: true });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true });
      const city = await CityModel.findOne({ name: 'Baku', active: true });

      const response = await request(app)
        .post('/expense/create')
        .set('Cookie', `token=${global.token}`)
        .send({
          wallet: wallet?._id,
          contact: contact?._id,
          amount: {
            value: '56.00',
            currency: currency?._id
          },
          city: city?._id,
          description: 'Bought wine',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        wallet: { name: 'Wallet 1' },
        contact: { name: 'Bravo' },
        amount: {
          value: '56.00',
          currency: { name: 'AZN' }
        },
        city: { name: 'Baku' },
        happenedAt: expect.toBeWithinSecondsOf(moment().toDate()),
        description: 'Bought wine'
      });

      const transactionCountAfter = await TransactionModel.count();
      const expenseCountAfter = await ExpenseModel.count();
      expect(transactionCountAfter).toBe(transactionCountBefore + 1);
      expect(expenseCountAfter).toBe(expenseCountBefore + 1);
    });
  });
});
