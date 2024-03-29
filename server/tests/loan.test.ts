import request from 'supertest';
import app from '../app';
import WalletModel from '../models/wallet';
import CurrencyModel, { Currency } from '../models/currency';
import ContactModel, { Contact } from '../models/contact';
import CityModel from '../models/city';
import TransactionBaseModel from '../models/transactionBase';
import ExpenseModel from '../models/expense';
import BorrowingModel from '../models/borrowing';
import RepaymentModel from '../models/repayment';
import AmountModel from '../models/amount';
import LoanModel from '../models/loan';

beforeAll(async () => {
  await BorrowingModel.deleteMany();
  await RepaymentModel.deleteMany();
  await LoanModel.deleteMany();

  const contact = await ContactModel.findOne({ name: 'Jack', active: true, user: global.userId });
  const currency = await CurrencyModel.findOne({ name: 'USD', active: true, user: global.userId });

  for (let i = 0; i < 24; i++) {
    const amount = await AmountModel.create({ value: '25.00', currency: currency?._id, user: global.userId });
    await BorrowingModel.create({ amount: amount._id, contact: contact?._id, borrowerType: 'Contact', description: 'Test', user: global.userId });
  }

  for (let i = 0; i < 14; i++) {
    const amount = await AmountModel.create({ value: '25.00', currency: currency?._id, user: global.userId });
    await RepaymentModel.create({ amount: amount._id, contact: contact?._id, repayerType: 'Contact', description: 'Test', user: global.userId });
  }

  const loanAmount = await AmountModel.create({ value: '250.00', currency: currency?._id, user: global.userId });
  await LoanModel.create({ loanAmountsToUser: [loanAmount], contact: contact?._id, user: global.userId });
});

const calculateLoan = async (contact: Contact | null, currency: Currency | null) => {
  const contactBorrowings = await BorrowingModel.find({ contact: contact?._id, user: global.userId }).populate([
    {
      path: 'amount',
      populate: { path: 'currency' }
    }
  ]);
  const contactRepayments = await RepaymentModel.find({ contact: contact?._id, user: global.userId }).populate([
    {
      path: 'amount',
      populate: { path: 'currency' }
    }
  ]);
  let totalContactLoan = 0;
  let foundLoanAmount = 0;
  contactBorrowings.forEach(e => {
    if (e.amount.currency?._id.equals(currency?._id)) {
      totalContactLoan += +e.amount.value;
    }
  });
  contactRepayments.forEach(e => {
    if (e.amount.currency?._id.equals(currency?._id)) {
      totalContactLoan -= +e.amount.value;
    }
  });
  const foundLoan = await LoanModel.findOne({ contact: contact?._id }).populate({
    path: 'loanAmountsToUser',
    populate: { path: 'currency' }
  });
  foundLoan?.loanAmountsToUser.forEach(e => {
    if (e.currency._id.equals(currency?._id)) {
      foundLoanAmount = +e.value;
    }
  });
  expect(totalContactLoan).toBe(foundLoanAmount);
};

describe('Loan', () => {
  describe('POST /loan/create/:type', () => {
    it('should create a borrowing', async () => {
      const contact = await ContactModel.findOne({ name: 'John', active: true, user: global.userId });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true, user: global.userId });

      const borrowingCountBefore = await BorrowingModel.count();

      const response = await request(app)
        .post('/loan/create/borrowing')
        .set('Cookie', `token=${global.token}`)
        .send({
          contact: contact?._id,
          amount: {
            value: '16.00',
            currency: currency?._id
          },
          borrowerType: 'Contact',
          borrowedAt: '2023-09-10T07:56:00.000Z',
          repaymentExpectedAt: '2023-09-12T07:56:00.000Z',
          description: 'Paid to the restaurant instead of me'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        contact: { name: 'John' },
        amount: {
          value: '16.00',
          currency: { name: 'AZN' }
        },
        borrowerType: 'Contact',
        borrowedAt: '2023-09-10T07:56:00.000Z',
        repaymentExpectedAt: '2023-09-12T07:56:00.000Z',
        description: 'Paid to the restaurant instead of me'
      });

      const borrowingCountAfter = await BorrowingModel.count();
      expect(borrowingCountAfter).toBe(borrowingCountBefore + 1);

      calculateLoan(contact, currency);
    });

    it('should create a borrowing with a binded expense', async () => {
      const contact = await ContactModel.findOne({ name: 'John', active: true, user: global.userId });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true, user: global.userId });
      const wallet = await WalletModel.findOne({ name: 'Wallet 1', active: true, user: global.userId });
      const city = await CityModel.findOne({ name: 'Baku', active: true, user: global.userId });

      const borrowingCountBefore = await BorrowingModel.count();
      const trBaseCountBefore = await TransactionBaseModel.count();
      const expenseCountBefore = await ExpenseModel.count();

      const response = await request(app)
        .post('/loan/create/borrowing')
        .set('Cookie', `token=${global.token}`)
        .send({
          contact: contact?._id,
          amount: {
            value: '52.00',
            currency: currency?._id
          },
          borrowerType: 'Contact',
          description: 'John borrowed money from me',
          transactionParams: {
            from: wallet?._id,
            to: contact?._id,
            amount: {
              value: '52.00',
              currency: currency?._id
            },
            city: city?._id,
            description: 'John borrowed money from me'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        contact: { name: 'John' },
        amount: {
          value: '52.00',
          currency: { name: 'AZN' }
        },
        borrowerType: 'Contact',
        description: 'John borrowed money from me'
      });
      expect(response.body.bindedTransactionBase).toBeTruthy();

      const borrowingCountAfter = await BorrowingModel.count();
      const trBaseCountAfter = await TransactionBaseModel.count();
      const expenseCountAfter = await ExpenseModel.count();
      expect(borrowingCountAfter).toBe(borrowingCountBefore + 1);
      expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
      expect(expenseCountAfter).toBe(expenseCountBefore + 1);

      calculateLoan(contact, currency);
    });

    it('should create a repayment', async () => {
      const contact = await ContactModel.findOne({ name: 'John', active: true, user: global.userId });
      const currency = await CurrencyModel.findOne({ name: 'AZN', active: true, user: global.userId });

      const repaymentCountBefore = await RepaymentModel.count();

      const response = await request(app)
        .post('/loan/create/repayment')
        .set('Cookie', `token=${global.token}`)
        .send({
          contact: contact?._id,
          amount: {
            value: '18.10',
            currency: currency?._id
          },
          repayerType: 'Contact',
          repaidAt: '2023-09-09T07:56:00.000Z',
          description: 'John repaid the loan'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        contact: { name: 'John' },
        amount: {
          value: '18.10',
          currency: { name: 'AZN' }
        },
        repayerType: 'Contact',
        repaidAt: '2023-09-09T07:56:00.000Z',
        description: 'John repaid the loan'
      });

      const repaymentCountAfter = await RepaymentModel.count();
      expect(repaymentCountAfter).toBe(repaymentCountBefore + 1);

      calculateLoan(contact, currency);
    });
    
    it('should return an error for the repayment not matching any borrowing', async () => {
      const contact = await ContactModel.findOne({ name: 'John', active: true, user: global.userId });
      const currency = await CurrencyModel.findOne({ name: 'USD', active: true, user: global.userId });

      const repaymentCountBefore = await RepaymentModel.count();

      const response = await request(app)
        .post('/loan/create/repayment')
        .set('Cookie', `token=${global.token}`)
        .send({
          contact: contact?._id,
          amount: {
            value: '2000.00',
            currency: currency?._id
          },
          repayerType: 'Contact',
          repaidAt: '2023-09-09T07:56:00.000Z',
          description: 'John repaid the loan'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Borrowing not found');

      const repaymentCountAfter = await RepaymentModel.count();
      expect(repaymentCountAfter).toBe(repaymentCountBefore);

      calculateLoan(contact, currency);
    });
  });

  describe('GET /loan/list/:type', () => {
    it('should list the last borrowings with pagination', async () => {
      const borrowingCount = await BorrowingModel.count({ user: global.userId });
      const limit = 10;
      const lastPage = Math.ceil(borrowingCount / limit);

      const response = await request(app)
        .get(`/loan/list/borrowing?page=${lastPage}&limit=${limit}`)
        .set('Cookie', `token=${global.token}`);

      expect(response.body.borrowings.length).toBe(borrowingCount % limit || limit);
      expect(response.body.totalPages).toBe(lastPage);
    });

    it('should list the last repayments with pagination', async () => {
      const repaymentCount = await RepaymentModel.count({ user: global.userId });
      const limit = 10;
      const lastPage = Math.ceil(repaymentCount / limit);

      const response = await request(app)
        .get(`/loan/list/repayment?page=${lastPage}&limit=${limit}`)
        .set('Cookie', `token=${global.token}`);

      expect(response.body.repayments.length).toBe(repaymentCount % limit || limit);
      expect(response.body.totalPages).toBe(lastPage);
    });
  });

  describe('GET /loan/contact_list', () => {
    it('should list the contact loans with pagination', async () => {
      const loanCount = await LoanModel.count({ 'loanAmountsToUser.0': { "$exists": true }, user: global.userId });
      const limit = 10;
      const lastPage = Math.ceil(loanCount / limit);

      const response = await request(app)
        .get(`/loan/contact_list?page=${lastPage}&limit=${limit}`)
        .set('Cookie', `token=${global.token}`);

      expect(response.status).toBe(200);
      expect(response.body.loans.length).toBe(loanCount % limit || limit);
      expect(response.body.totalPages).toBe(lastPage);
    });
  });
});
