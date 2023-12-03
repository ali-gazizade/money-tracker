"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const transaction_1 = __importStar(require("../services/transaction"));
const transactionBase_1 = __importDefault(require("../models/transactionBase"));
const transaction_2 = __importDefault(require("../assemblers/transaction"));
const expense_1 = __importDefault(require("../models/expense"));
const income_1 = __importDefault(require("../models/income"));
const transfer_1 = __importDefault(require("../models/transfer"));
const moment_1 = __importDefault(require("moment"));
const router = express_1.default.Router();
router.post('/create/:type', [
    (0, express_validator_1.body)('from').notEmpty().withMessage('From is required'),
    (0, express_validator_1.body)('to').notEmpty().withMessage('To is required'),
    (0, express_validator_1.body)('amount').notEmpty().withMessage('Amount is required'),
    (0, express_validator_1.body)('city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let type;
        switch (req.params.type) {
            case 'expense':
                type = transaction_1.Type.Expense;
                break;
            case 'income':
                type = transaction_1.Type.Income;
                break;
            default:
                type = transaction_1.Type.Transfer;
                break;
        }
        const service = new transaction_1.default({ body: req.body, type, user: req.user });
        const validation = await service.validateBody();
        if (validation.error) {
            return res.status(400).json({ error: validation.error });
        }
        const newExpense = await service.create();
        if (newExpense.error) {
            return res.status(404).json({ error: 'Unknown problem' });
        }
        res.status(201).json(newExpense.result);
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
router.get('/list', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skipAmount = (page - 1) * limit;
        const query = { user: req.user };
        const transactionBases = await transactionBase_1.default.find(query)
            .sort({ happenedAt: 'desc' })
            .skip(skipAmount)
            .limit(limit);
        const population = [
            {
                path: 'transactionBase',
                populate: [
                    {
                        path: 'amount',
                        populate: { path: 'currency' }
                    },
                    { path: 'city' },
                ]
            },
            { path: 'from' },
            { path: 'to' }
        ];
        const transactionBaseIds = transactionBases.map(e => e._id);
        const expenses = await expense_1.default.find({
            transactionBase: { $in: transactionBaseIds }
        }).populate(population);
        const incomes = await income_1.default.find({
            transactionBase: { $in: transactionBaseIds }
        }).populate(population);
        const transfers = await transfer_1.default.find({
            transactionBase: { $in: transactionBaseIds }
        }).populate(population);
        const transactions = [...expenses, ...incomes, ...transfers].sort((a, b) => (+(0, moment_1.default)(b.transactionBase.happenedAt).format('X')) - (+(0, moment_1.default)(a.transactionBase.happenedAt).format('X')));
        const totalCount = await transactionBase_1.default.countDocuments(query);
        res.status(200).json({
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            transactions: transactions.map(e => (0, transaction_2.default)(e))
        });
    }
    catch (error) {
        console.error('Error retrieving transactions:', error);
        res.status(500).json({ error });
    }
});
exports.default = router;
