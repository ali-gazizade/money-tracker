import request from 'supertest';
import app from '../app';
import WalletModel from '../models/wallet';
import CurrencyModel from '../models/currency';
import ContactModel from '../models/contact';
import CityModel from '../models/city';
import TransactionBaseModel from '../models/transactionBase';
import ExpenseModel from '../models/expense';
import moment from 'moment';
import IncomeModel from '../models/income';
import TransferModel from '../models/transfer';

describe('Transaction', () => {
  describe('POST /transaction/create/:type', () => {
    it('should create an expense', async () => {
      const trBaseCountBefore = await TransactionBaseModel.count();
      const expenseCountBefore = await ExpenseModel.count();

      const wallet = await WalletModel.findOne({ name: 'Wallet 1', active: true });
      const contact = await ContactModel.findOne({ name: 'Bravo', active: true });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true });
      const city = await CityModel.findOne({ name: 'Baku', active: true });

      const response = await request(app)
        .post('/transaction/create/expense')
        .set('Cookie', `token=${global.token}`)
        .send({
          from: wallet?._id,
          to: contact?._id,
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
        from: { name: 'Wallet 1' },
        to: { name: 'Bravo' },
        amount: {
          value: '56.00',
          currency: { name: 'AZN' }
        },
        city: { name: 'Baku' },
        happenedAt: '2023-09-04T07:56:00.000Z',
        description: 'Bought wine'
      });

      const trBaseCountAfter = await TransactionBaseModel.count();
      const expenseCountAfter = await ExpenseModel.count();
      expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
      expect(expenseCountAfter).toBe(expenseCountBefore + 1);
    });

    it('should create an expense with the current time', async () => {
      const trBaseCountBefore = await TransactionBaseModel.count();
      const expenseCountBefore = await ExpenseModel.count();

      const wallet = await WalletModel.findOne({ name: 'Wallet 1', active: true });
      const contact = await ContactModel.findOne({ name: 'Bravo', active: true });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true });
      const city = await CityModel.findOne({ name: 'Baku', active: true });

      const response = await request(app)
        .post('/transaction/create/expense')
        .set('Cookie', `token=${global.token}`)
        .send({
          from: wallet?._id,
          to: contact?._id,
          amount: {
            value: '56.00',
            currency: currency?._id
          },
          city: city?._id,
          description: 'Bought wine',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        from: { name: 'Wallet 1' },
        to: { name: 'Bravo' },
        amount: {
          value: '56.00',
          currency: { name: 'AZN' }
        },
        city: { name: 'Baku' },
        happenedAt: expect.toBeWithinSecondsOf(moment().toDate()),
        description: 'Bought wine'
      });

      const trBaseCountAfter = await TransactionBaseModel.count();
      const expenseCountAfter = await ExpenseModel.count();
      expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
      expect(expenseCountAfter).toBe(expenseCountBefore + 1);
    });
    
    it('should create an income with the current time', async () => {
      const trBaseCountBefore = await TransactionBaseModel.count();
      const incomeCountBefore = await IncomeModel.count();

      const wallet = await WalletModel.findOne({ name: 'Wallet 1', active: true });
      const contact = await ContactModel.findOne({ name: 'Bravo', active: true });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true });
      const city = await CityModel.findOne({ name: 'Baku', active: true });

      const response = await request(app)
        .post('/transaction/create/income')
        .set('Cookie', `token=${global.token}`)
        .send({
          from: contact?._id,
          to: wallet?._id,
          amount: {
            value: '56.00',
            currency: currency?._id
          },
          city: city?._id,
          description: 'Bought wine',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        from: { name: 'Bravo' },
        to: { name: 'Wallet 1' },
        amount: {
          value: '56.00',
          currency: { name: 'AZN' }
        },
        city: { name: 'Baku' },
        happenedAt: expect.toBeWithinSecondsOf(moment().toDate()),
        description: 'Bought wine'
      });

      const trBaseCountAfter = await TransactionBaseModel.count();
      const incomeCountAfter = await IncomeModel.count();
      expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
      expect(incomeCountAfter).toBe(incomeCountBefore + 1);
    });

    it('should create a transfer', async () => {
      const trBaseCountBefore = await TransactionBaseModel.count();
      const transferCountBefore = await TransferModel.count();

      const walletFrom = await WalletModel.findOne({ name: 'Wallet 1', active: true });
      const walletTo = await WalletModel.findOne({ name: 'Wallet 2', active: true });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true });
      const city = await CityModel.findOne({ name: 'Baku', active: true });

      const response = await request(app)
        .post('/transaction/create/transfer')
        .set('Cookie', `token=${global.token}`)
        .send({
          from: walletFrom?._id,
          to: walletTo?._id,
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
        from: { name: 'Wallet 1' },
        to: { name: 'Wallet 2' },
        amount: {
          value: '56.00',
          currency: { name: 'AZN' }
        },
        city: { name: 'Baku' },
        happenedAt: '2023-09-04T07:56:00.000Z',
        description: 'Bought wine'
      });

      const trBaseCountAfter = await TransactionBaseModel.count();
      const transferCountAfter = await TransferModel.count();
      expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
      expect(transferCountAfter).toBe(transferCountBefore + 1);
    });
  });

  describe('GET /transaction/list', () => {
    it('should list the last transactions with pagination', async () => {
      const trBaseCount = await TransactionBaseModel.count({ user: global.userId });
      const limit = 10;
      const lastPage = Math.ceil(trBaseCount / limit);

      const response = await request(app)
        .get(`/transaction/list?page=${lastPage}&limit=${limit}`)
        .set('Cookie', `token=${global.token}`);

      expect(response.body.transactions.length).toBe(trBaseCount % limit || limit);
      expect(response.body.totalPages).toBe(lastPage);
    });
  });
});
