"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const amount_1 = __importDefault(require("../models/amount"));
const currency_1 = __importDefault(require("../models/currency"));
const wallet_1 = __importDefault(require("../models/wallet"));
const contact_1 = __importDefault(require("../models/contact"));
const city_1 = __importDefault(require("../models/city"));
const user_1 = __importDefault(require("../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
const expense_1 = __importDefault(require("../models/expense"));
const income_1 = __importDefault(require("../models/income"));
const transfer_1 = __importDefault(require("../models/transfer"));
const transactionBase_1 = __importDefault(require("../models/transactionBase"));
const borrowing_1 = __importDefault(require("../models/borrowing"));
const repayment_1 = __importDefault(require("../models/repayment"));
const loan_1 = __importDefault(require("../models/loan"));
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
};
const login = async () => {
    const credentials = {
        username: 'test@example.com',
        password: 'testpassword'
    };
    const response = await (0, supertest_1.default)(app_1.default)
        .post('/auth/login')
        .send(credentials);
    const user = await user_1.default.findOne({ username: credentials.username });
    const tokenCookie = response.header['set-cookie'];
    if (tokenCookie) {
        const tokenMatch = tokenCookie[0].match(/token=([^;]*)/);
        if (tokenMatch) {
            global.token = tokenMatch[1];
            global.userId = user?._id;
        }
        else {
            throw new Error('No "token" cookie found in the response.');
        }
    }
    else {
        throw new Error('No set-cookie header found in the response.');
    }
};
beforeAll(async () => {
    await login();
    await wallet_1.default.deleteMany();
    await amount_1.default.deleteMany();
    await currency_1.default.deleteMany();
    await contact_1.default.deleteMany();
    await city_1.default.deleteMany();
    await expense_1.default.deleteMany();
    await income_1.default.deleteMany();
    await transfer_1.default.deleteMany();
    await transactionBase_1.default.deleteMany();
    await borrowing_1.default.deleteMany();
    await repayment_1.default.deleteMany();
    await loan_1.default.deleteMany();
    const currencies = [];
    currencies[0] = await currency_1.default.create({ name: 'AZN', isDefault: true, exchangeRate: 1, active: true, user: global.userId });
    currencies[1] = await currency_1.default.create({ name: 'USD', isDefault: false, exchangeRate: 1.7, active: true, user: global.userId });
    currencies[2] = await currency_1.default.create({ name: 'EUR', isDefault: false, exchangeRate: 1.81, active: true, user: global.userId });
    const cities = [];
    cities[0] = await city_1.default.create({ name: 'Baku', countryName: 'Azerbaijan', user: global.userId });
    cities[1] = await city_1.default.create({ name: 'Sheki', countryName: 'Azerbaijan', user: global.userId });
    cities[2] = await city_1.default.create({ name: 'Istanbul', countryName: 'Turkey', user: global.userId });
    const amounts = [];
    amounts[0] = await amount_1.default.create({ value: '148.00', currency: currencies[getRandomInt(3)]._id, user: global.userId });
    amounts[1] = await amount_1.default.create({ value: '21.50', currency: currencies[getRandomInt(3)]._id, user: global.userId });
    amounts[2] = await amount_1.default.create({ value: '152.00', currency: currencies[getRandomInt(3)]._id, user: global.userId });
    const wallets = [];
    wallets[0] = await wallet_1.default.create({ name: 'Wallet 1', initialAmounts: [amounts[0], amounts[1]], user: global.userId });
    wallets[1] = await wallet_1.default.create({ name: 'Wallet 2', initialAmounts: [amounts[2]], user: global.userId });
    wallets[2] = await wallet_1.default.create({ name: 'Wallet 3', initialAmounts: [], user: global.userId });
    const contacts = [];
    contacts[0] = await contact_1.default.create({ name: 'Bravo', user: global.userId });
    contacts[1] = await contact_1.default.create({ name: 'GrandMart', user: global.userId });
    contacts[2] = await contact_1.default.create({ name: 'Araz', user: global.userId });
    contacts[2] = await contact_1.default.create({ name: 'John', user: global.userId });
    contacts[2] = await contact_1.default.create({ name: 'Jack', user: global.userId });
    const transactionBaseIds = [];
    for (let i = 0; i < 84; i++) {
        const amount = await amount_1.default.create({
            value: ((getRandomInt(20) + 1) + '.00'),
            currency: currencies[getRandomInt(3)]._id,
            user: global.userId
        });
        const transactionBase = await transactionBase_1.default.create({
            amount: amount._id,
            city: cities[getRandomInt(3)]._id,
            description: 'Test' + i,
            user: global.userId
        });
        transactionBaseIds.push(transactionBase._id);
    }
    const incomeIds = [];
    for (let i = 0; i < 28; i++) {
        const income = await income_1.default.create({
            transactionBase: transactionBaseIds[i],
            from: contacts[getRandomInt(3)]._id,
            to: wallets[2]._id,
            user: global.userId
        });
        incomeIds.push(income._id);
    }
    const transferIds = [];
    for (let i = 28; i < 56; i++) {
        const transfer = await transfer_1.default.create({
            transactionBase: transactionBaseIds[i],
            from: wallets[2]._id,
            to: wallets[getRandomInt(2)]._id,
            user: global.userId
        });
        transferIds.push(transfer._id);
    }
    const expenseIds = [];
    for (let i = 56; i < 84; i++) {
        const expense = await expense_1.default.create({
            transactionBase: transactionBaseIds[i],
            from: wallets[getRandomInt(2)]._id,
            to: contacts[getRandomInt(3)]._id,
            user: global.userId
        });
        expenseIds.push(expense._id);
    }
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
});
