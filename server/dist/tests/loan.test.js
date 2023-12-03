"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const wallet_1 = __importDefault(require("../models/wallet"));
const currency_1 = __importDefault(require("../models/currency"));
const contact_1 = __importDefault(require("../models/contact"));
const city_1 = __importDefault(require("../models/city"));
const transactionBase_1 = __importDefault(require("../models/transactionBase"));
const expense_1 = __importDefault(require("../models/expense"));
const borrowing_1 = __importDefault(require("../models/borrowing"));
const repayment_1 = __importDefault(require("../models/repayment"));
const amount_1 = __importDefault(require("../models/amount"));
const loan_1 = __importDefault(require("../models/loan"));
beforeAll(async () => {
    await borrowing_1.default.deleteMany();
    await repayment_1.default.deleteMany();
    await loan_1.default.deleteMany();
    const contact = await contact_1.default.findOne({ name: 'Jack', active: true, user: global.userId });
    const currency = await currency_1.default.findOne({ name: 'USD', active: true, user: global.userId });
    for (let i = 0; i < 24; i++) {
        const amount = await amount_1.default.create({ value: '25.00', currency: currency?._id, user: global.userId });
        await borrowing_1.default.create({ amount: amount._id, contact: contact?._id, borrowerType: 'Contact', description: 'Test', user: global.userId });
    }
    for (let i = 0; i < 14; i++) {
        const amount = await amount_1.default.create({ value: '25.00', currency: currency?._id, user: global.userId });
        await repayment_1.default.create({ amount: amount._id, contact: contact?._id, repayerType: 'Contact', description: 'Test', user: global.userId });
    }
    const loanAmount = await amount_1.default.create({ value: '250.00', currency: currency?._id, user: global.userId });
    await loan_1.default.create({ loanAmountsToUser: [loanAmount], contact: contact?._id, user: global.userId });
});
const calculateLoan = async (contact, currency) => {
    const contactBorrowings = await borrowing_1.default.find({ contact: contact?._id, user: global.userId }).populate([
        {
            path: 'amount',
            populate: { path: 'currency' }
        }
    ]);
    const contactRepayments = await repayment_1.default.find({ contact: contact?._id, user: global.userId }).populate([
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
    const foundLoan = await loan_1.default.findOne({ contact: contact?._id }).populate({
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
            const contact = await contact_1.default.findOne({ name: 'John', active: true, user: global.userId });
            const currency = await currency_1.default.findOne({ name: 'AZN', active: true, user: global.userId });
            const borrowingCountBefore = await borrowing_1.default.count();
            const response = await (0, supertest_1.default)(app_1.default)
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
            const borrowingCountAfter = await borrowing_1.default.count();
            expect(borrowingCountAfter).toBe(borrowingCountBefore + 1);
            calculateLoan(contact, currency);
        });
        it('should create a borrowing with a binded expense', async () => {
            const contact = await contact_1.default.findOne({ name: 'John', active: true, user: global.userId });
            const currency = await currency_1.default.findOne({ name: 'AZN', active: true, user: global.userId });
            const wallet = await wallet_1.default.findOne({ name: 'Wallet 1', active: true, user: global.userId });
            const city = await city_1.default.findOne({ name: 'Baku', active: true, user: global.userId });
            const borrowingCountBefore = await borrowing_1.default.count();
            const trBaseCountBefore = await transactionBase_1.default.count();
            const expenseCountBefore = await expense_1.default.count();
            const response = await (0, supertest_1.default)(app_1.default)
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
            const borrowingCountAfter = await borrowing_1.default.count();
            const trBaseCountAfter = await transactionBase_1.default.count();
            const expenseCountAfter = await expense_1.default.count();
            expect(borrowingCountAfter).toBe(borrowingCountBefore + 1);
            expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
            expect(expenseCountAfter).toBe(expenseCountBefore + 1);
            calculateLoan(contact, currency);
        });
        it('should create a repayment', async () => {
            const contact = await contact_1.default.findOne({ name: 'John', active: true, user: global.userId });
            const currency = await currency_1.default.findOne({ name: 'AZN', active: true, user: global.userId });
            const repaymentCountBefore = await repayment_1.default.count();
            const response = await (0, supertest_1.default)(app_1.default)
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
            const repaymentCountAfter = await repayment_1.default.count();
            expect(repaymentCountAfter).toBe(repaymentCountBefore + 1);
            calculateLoan(contact, currency);
        });
        it('should return an error for the repayment not matching any borrowing', async () => {
            const contact = await contact_1.default.findOne({ name: 'John', active: true, user: global.userId });
            const currency = await currency_1.default.findOne({ name: 'USD', active: true, user: global.userId });
            const repaymentCountBefore = await repayment_1.default.count();
            const response = await (0, supertest_1.default)(app_1.default)
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
            const repaymentCountAfter = await repayment_1.default.count();
            expect(repaymentCountAfter).toBe(repaymentCountBefore);
            calculateLoan(contact, currency);
        });
    });
    describe('GET /loan/list/:type', () => {
        it('should list the last borrowings with pagination', async () => {
            const borrowingCount = await borrowing_1.default.count({ user: global.userId });
            const limit = 10;
            const lastPage = Math.ceil(borrowingCount / limit);
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/loan/list/borrowing?page=${lastPage}&limit=${limit}`)
                .set('Cookie', `token=${global.token}`);
            expect(response.body.borrowings.length).toBe(borrowingCount % limit || limit);
            expect(response.body.totalPages).toBe(lastPage);
        });
        it('should list the last repayments with pagination', async () => {
            const repaymentCount = await repayment_1.default.count({ user: global.userId });
            const limit = 10;
            const lastPage = Math.ceil(repaymentCount / limit);
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/loan/list/repayment?page=${lastPage}&limit=${limit}`)
                .set('Cookie', `token=${global.token}`);
            expect(response.body.repayments.length).toBe(repaymentCount % limit || limit);
            expect(response.body.totalPages).toBe(lastPage);
        });
    });
    describe('GET /loan/contact_list', () => {
        it('should list the contact loans with pagination', async () => {
            const loanCount = await loan_1.default.count({ 'loanAmountsToUser.0': { "$exists": true }, user: global.userId });
            const limit = 10;
            const lastPage = Math.ceil(loanCount / limit);
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/loan/contact_list?page=${lastPage}&limit=${limit}`)
                .set('Cookie', `token=${global.token}`);
            expect(response.status).toBe(200);
            expect(response.body.loans.length).toBe(loanCount % limit || limit);
            expect(response.body.totalPages).toBe(lastPage);
        });
    });
});
