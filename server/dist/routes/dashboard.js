"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expense_1 = __importDefault(require("../models/expense"));
const income_1 = __importDefault(require("../models/income"));
const wallet_1 = __importDefault(require("../models/wallet"));
const loan_1 = __importDefault(require("../models/loan"));
const transfer_1 = __importDefault(require("../models/transfer"));
const currency_1 = __importDefault(require("../models/currency"));
const router = express_1.default.Router();
const totalsAggregate = [
    {
        $lookup: {
            from: 'transactionbases',
            localField: 'transactionBase',
            foreignField: '_id',
            as: 'transactionBase'
        }
    },
    {
        $unwind: '$transactionBase'
    },
    {
        $lookup: {
            from: 'amounts',
            localField: 'transactionBase.amount',
            foreignField: '_id',
            as: 'transactionBase.amount'
        }
    },
    {
        $unwind: '$transactionBase.amount'
    },
    {
        $lookup: {
            from: 'currencies',
            localField: 'transactionBase.amount.currency',
            foreignField: '_id',
            as: 'currency'
        }
    },
    {
        $unwind: '$currency'
    },
    {
        $group: {
            _id: '$transactionBase.amount.currency',
            currency: { $first: '$currency' },
            total: {
                $sum: '$transactionBase.amount._value'
            },
        }
    }
];
const loanAggregate = (matchObj) => ([
    {
        $lookup: {
            from: 'amounts',
            localField: 'loanAmountsToUser',
            foreignField: '_id',
            as: 'loanAmountsToUser'
        }
    },
    {
        $unwind: '$loanAmountsToUser'
    },
    {
        $lookup: {
            from: 'currencies',
            localField: 'loanAmountsToUser.currency',
            foreignField: '_id',
            as: 'currency'
        }
    },
    {
        $unwind: '$currency'
    },
    {
        $match: matchObj
    },
    {
        $group: {
            _id: '$loanAmountsToUser.currency',
            currency: { $first: '$currency' },
            total: {
                $sum: '$loanAmountsToUser._value'
            },
        }
    }
]);
const walletsAggregate = (transactionField) => ([
    {
        $lookup: {
            from: 'wallets',
            localField: transactionField,
            foreignField: '_id',
            as: transactionField
        }
    },
    {
        $unwind: `$${transactionField}`
    },
    {
        $lookup: {
            from: 'transactionbases',
            localField: 'transactionBase',
            foreignField: '_id',
            as: 'transactionBase'
        }
    },
    {
        $unwind: '$transactionBase'
    },
    {
        $lookup: {
            from: 'amounts',
            localField: 'transactionBase.amount',
            foreignField: '_id',
            as: 'transactionAmount'
        }
    },
    {
        $unwind: '$transactionAmount'
    },
    {
        $group: {
            _id: {
                wallet: `$${transactionField}._id`,
                currency: '$transactionAmount.currency'
            },
            total: {
                $sum: '$transactionAmount._value'
            }
        }
    },
    {
        $group: {
            _id: '$_id.wallet',
            amounts: {
                $push: {
                    currency: '$_id.currency',
                    total: '$total'
                }
            }
        }
    }
]);
router.get('/', (req, res) => {
    res.send('Dashboard');
});
router.get('/totals', async (req, res) => {
    try {
        const wallets = await wallet_1.default.find().populate([
            {
                path: 'initialAmounts',
                populate: { path: 'currency' }
            }
        ]);
        const expensesByCurrency = await expense_1.default.aggregate(totalsAggregate);
        const incomesByCurrency = await income_1.default.aggregate(totalsAggregate);
        // Calculate the sum of initialAmounts first
        let totalInitialAmounts = 0;
        for (let wallet of wallets) {
            for (let amount of wallet.initialAmounts) {
                totalInitialAmounts += amount.currency._exchangeRate * amount._value;
            }
        }
        // End Calculate the sum of initialAmounts first
        let totalExpense = 0;
        for (let e of expensesByCurrency) {
            totalExpense += (e.total * e.currency._exchangeRate);
        }
        let totalIncome = 0;
        for (let e of incomesByCurrency) {
            totalIncome += (e.total * e.currency._exchangeRate);
        }
        res.status(200).json({
            expense: totalExpense.toFixed(2),
            income: totalIncome.toFixed(2),
            balance: (totalInitialAmounts + totalIncome - totalExpense).toFixed(2)
        });
    }
    catch (error) {
        console.error('Error retrieving contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/loan', async (req, res) => {
    try {
        let loanAmountToUser = 0;
        let loanAmountToContacts = 0;
        const amountsToUser = await loan_1.default.aggregate(loanAggregate({ 'loanAmountsToUser._value': { $gt: 0 } }));
        for (let amount of amountsToUser) {
            loanAmountToUser += (amount.total * amount.currency._exchangeRate);
        }
        const amountsToContacts = await loan_1.default.aggregate(loanAggregate({ 'loanAmountsToUser._value': { $lt: 0 } }));
        for (let amount of amountsToContacts) {
            loanAmountToContacts += Math.abs(amount.total * amount.currency._exchangeRate);
        }
        res.status(200).json({
            loanAmountToUser,
            loanAmountToContacts
        });
    }
    catch (error) {
        console.error('Error retrieving contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/wallet_list', async (req, res) => {
    try {
        const walletsRes = await wallet_1.default.find().populate('initialAmounts');
        // Add initial amounts
        const wallets = walletsRes.map(wallet => {
            const currentAmountsObj = {};
            wallet.initialAmounts.forEach(amount => {
                currentAmountsObj[amount.currency] = (currentAmountsObj[amount.currency] ? (currentAmountsObj[amount.currency] + amount._value) : amount._value);
            });
            const currentAmounts = [];
            return {
                _id: wallet._id,
                name: wallet.name,
                currentAmountsObj,
                currentAmounts
            };
        });
        // End Add initial amounts
        // Add incomes
        const incomesByWallets = await income_1.default.aggregate(walletsAggregate('to'));
        incomesByWallets.forEach(tr => {
            tr.amounts.forEach((amount) => {
                const currencyId = amount.currency.toString();
                const wallet = wallets.find(e => e._id.toString() === tr._id.toString());
                if (wallet && wallet.currentAmountsObj) {
                    wallet.currentAmountsObj[currencyId] = (wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] + amount.total) : amount.total);
                }
            });
        });
        // End Add incomes
        // Add transfers
        const transfersToWallets = await transfer_1.default.aggregate(walletsAggregate('to'));
        transfersToWallets.forEach(tr => {
            tr.amounts.forEach((amount) => {
                const currencyId = amount.currency.toString();
                const wallet = wallets.find(e => e._id.toString() === tr._id.toString());
                if (wallet && wallet.currentAmountsObj) {
                    wallet.currentAmountsObj[currencyId] = (wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] + amount.total) : amount.total);
                }
            });
        });
        // End Add transfers
        // Subtract expenses
        const expensesByWallets = await expense_1.default.aggregate(walletsAggregate('from'));
        expensesByWallets.forEach(tr => {
            tr.amounts.forEach((amount) => {
                const currencyId = amount.currency.toString();
                const wallet = wallets.find(e => e._id.toString() === tr._id.toString());
                if (wallet && wallet.currentAmountsObj) {
                    wallet.currentAmountsObj[currencyId] = (wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] - amount.total) : -amount.total);
                }
            });
        });
        // End Subtract expenses
        // Subtract transfers
        const transfersFromWallets = await transfer_1.default.aggregate(walletsAggregate('from'));
        transfersFromWallets.forEach(tr => {
            tr.amounts.forEach((amount) => {
                const currencyId = amount.currency.toString();
                const wallet = wallets.find(e => e._id.toString() === tr._id.toString());
                if (wallet && wallet.currentAmountsObj) {
                    wallet.currentAmountsObj[currencyId] = (wallet?.currentAmountsObj?.[currencyId] ? (wallet?.currentAmountsObj?.[currencyId] - amount.total) : -amount.total);
                }
            });
        });
        // End Subtract transfers
        // Add currentAmounts to wallets
        wallets.forEach(wallet => {
            Object.keys(wallet.currentAmountsObj).forEach((k) => {
                wallet.currentAmounts.push({
                    currencyId: k,
                    total: wallet.currentAmountsObj[k].toFixed(2)
                });
            });
            delete wallet.currentAmountsObj;
        });
        // End Add currentAmounts to wallets
        // Add currency names
        const currencies = await currency_1.default.find();
        wallets.forEach(wallet => {
            wallet.currentAmounts.forEach((amount) => {
                const currency = currencies.find((e) => amount.currencyId === e._id.toString());
                if (currency) {
                    amount.currencyName = currency.name;
                }
            });
        });
        // End Add currency names
        res.status(200).json({
            wallets
        });
    }
    catch (error) {
        console.error('Error retrieving contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
