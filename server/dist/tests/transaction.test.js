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
const moment_1 = __importDefault(require("moment"));
const income_1 = __importDefault(require("../models/income"));
const transfer_1 = __importDefault(require("../models/transfer"));
describe('Transaction', () => {
    describe('POST /transaction/create/:type', () => {
        it('should create an expense', async () => {
            const trBaseCountBefore = await transactionBase_1.default.count();
            const expenseCountBefore = await expense_1.default.count();
            const wallet = await wallet_1.default.findOne({ name: 'Wallet 1', active: true });
            const contact = await contact_1.default.findOne({ name: 'Bravo', active: true });
            const currency = await currency_1.default.findOne({ name: 'AZN', active: true });
            const city = await city_1.default.findOne({ name: 'Baku', active: true });
            const response = await (0, supertest_1.default)(app_1.default)
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
            const trBaseCountAfter = await transactionBase_1.default.count();
            const expenseCountAfter = await expense_1.default.count();
            expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
            expect(expenseCountAfter).toBe(expenseCountBefore + 1);
        });
        it('should create an expense with the current time', async () => {
            const trBaseCountBefore = await transactionBase_1.default.count();
            const expenseCountBefore = await expense_1.default.count();
            const wallet = await wallet_1.default.findOne({ name: 'Wallet 1', active: true });
            const contact = await contact_1.default.findOne({ name: 'Bravo', active: true });
            const currency = await currency_1.default.findOne({ name: 'AZN', active: true });
            const city = await city_1.default.findOne({ name: 'Baku', active: true });
            const response = await (0, supertest_1.default)(app_1.default)
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
                happenedAt: expect.toBeWithinSecondsOf((0, moment_1.default)().toDate()),
                description: 'Bought wine'
            });
            const trBaseCountAfter = await transactionBase_1.default.count();
            const expenseCountAfter = await expense_1.default.count();
            expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
            expect(expenseCountAfter).toBe(expenseCountBefore + 1);
        });
        it('should create an income with the current time', async () => {
            const trBaseCountBefore = await transactionBase_1.default.count();
            const incomeCountBefore = await income_1.default.count();
            const wallet = await wallet_1.default.findOne({ name: 'Wallet 1', active: true });
            const contact = await contact_1.default.findOne({ name: 'Bravo', active: true });
            const currency = await currency_1.default.findOne({ name: 'AZN', active: true });
            const city = await city_1.default.findOne({ name: 'Baku', active: true });
            const response = await (0, supertest_1.default)(app_1.default)
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
                happenedAt: expect.toBeWithinSecondsOf((0, moment_1.default)().toDate()),
                description: 'Bought wine'
            });
            const trBaseCountAfter = await transactionBase_1.default.count();
            const incomeCountAfter = await income_1.default.count();
            expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
            expect(incomeCountAfter).toBe(incomeCountBefore + 1);
        });
        it('should create a transfer', async () => {
            const trBaseCountBefore = await transactionBase_1.default.count();
            const transferCountBefore = await transfer_1.default.count();
            const walletFrom = await wallet_1.default.findOne({ name: 'Wallet 1', active: true });
            const walletTo = await wallet_1.default.findOne({ name: 'Wallet 2', active: true });
            const currency = await currency_1.default.findOne({ name: 'AZN', active: true });
            const city = await city_1.default.findOne({ name: 'Baku', active: true });
            const response = await (0, supertest_1.default)(app_1.default)
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
            const trBaseCountAfter = await transactionBase_1.default.count();
            const transferCountAfter = await transfer_1.default.count();
            expect(trBaseCountAfter).toBe(trBaseCountBefore + 1);
            expect(transferCountAfter).toBe(transferCountBefore + 1);
        });
    });
    describe('GET /transaction/list', () => {
        it('should list the last transactions with pagination', async () => {
            const trBaseCount = await transactionBase_1.default.count({ user: global.userId });
            const limit = 10;
            const lastPage = Math.ceil(trBaseCount / limit);
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/transaction/list?page=${lastPage}&limit=${limit}`)
                .set('Cookie', `token=${global.token}`);
            expect(response.body.transactions.length).toBe(trBaseCount % limit || limit);
            expect(response.body.totalPages).toBe(lastPage);
        });
    });
});
