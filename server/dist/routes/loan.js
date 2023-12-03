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
const loan_1 = __importStar(require("../services/loan"));
const transaction_1 = __importStar(require("../services/transaction"));
const borrowing_1 = __importDefault(require("../models/borrowing"));
const borrowing_2 = __importDefault(require("../assemblers/borrowing"));
const repayment_1 = __importDefault(require("../models/repayment"));
const repayment_2 = __importDefault(require("../assemblers/repayment"));
const loan_2 = __importDefault(require("../models/loan"));
const loan_3 = __importDefault(require("../assemblers/loan"));
const router = express_1.default.Router();
router.post('/create/:type', [
    (0, express_validator_1.body)('contact').notEmpty().withMessage('Contact is required'),
    (0, express_validator_1.body)('amount').notEmpty().withMessage('Amount is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let type;
        if (req.params.type === 'borrowing') {
            type = loan_1.Type.Borrowing;
        }
        else if (req.params.type === 'repayment') {
            type = loan_1.Type.Repayment;
        }
        else {
            return res.status(400).json({ error: 'Type is not valid' });
        }
        // Create a new transaction and bind it to loan action
        let bindedTransactionBase;
        if (req.body.transactionParams) {
            let transactionType;
            if (type === loan_1.Type.Borrowing) {
                if (req.body.borrowerType === loan_1.BorrowerRepayerType.Contact) {
                    transactionType = transaction_1.Type.Expense;
                }
                else {
                    transactionType = transaction_1.Type.Income;
                }
            }
            else {
                if (req.body.borrowerType === loan_1.BorrowerRepayerType.Contact) {
                    transactionType = transaction_1.Type.Income;
                }
                else {
                    transactionType = transaction_1.Type.Expense;
                }
            }
            const transactionService = new transaction_1.default({
                body: req.body.transactionParams,
                type: transactionType,
                user: req.user
            });
            const transactionValidation = await transactionService.validateBody();
            if (transactionValidation.error) {
                return res.status(400).json({ error: transactionValidation.error });
            }
            const newTransaction = await transactionService.create();
            if (newTransaction.error) {
                return res.status(404).json({ error: newTransaction.error });
            }
            bindedTransactionBase = newTransaction.result;
        }
        // End Create a new transaction and bind it to loan action
        const service = new loan_1.default({
            body: req.body,
            type,
            user: req.user,
            bindedTransactionBaseId: bindedTransactionBase?._id
        });
        const validation = await service.validateBody();
        if (validation.error) {
            return res.status(400).json({ error: validation.error });
        }
        const newLoanAction = await service.create();
        if (newLoanAction.error) {
            return res.status(404).json({ error: newLoanAction.error });
        }
        res.status(201).json({ ...newLoanAction.result, bindedTransactionBase });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
router.get('/list/:type', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skipAmount = (page - 1) * limit;
        const query = { user: req.user };
        const population = [
            {
                path: 'amount',
                populate: { path: 'currency' }
            },
            { path: 'contact' },
            { path: 'bindedTransactionBase' }
        ];
        if (req.params.type === 'borrowing') {
            const borrowings = await borrowing_1.default.find(query)
                .populate(population)
                .sort({ createdAt: -1 })
                .skip(skipAmount)
                .limit(limit);
            const totalCount = await borrowing_1.default.countDocuments(query);
            res.status(200).json({
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                borrowings: borrowings.map(e => (0, borrowing_2.default)(e))
            });
        }
        else if (req.params.type === 'repayment') {
            const repayments = await repayment_1.default.find(query)
                .populate(population)
                .sort({ createdAt: -1 })
                .skip(skipAmount)
                .limit(limit);
            const totalCount = await repayment_1.default.countDocuments(query);
            res.status(200).json({
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                repayments: repayments.map(e => (0, repayment_2.default)(e))
            });
        }
        else {
            return res.status(400).json({ error: 'Type is not valid' });
        }
    }
    catch (error) {
        console.error('Error retrieving transactions:', error);
        res.status(500).json({ error });
    }
});
router.get('/contact_list', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skipAmount = (page - 1) * limit;
        const query = { user: req.user, 'loanAmountsToUser.0': { "$exists": true } };
        const population = [
            { path: 'contact' },
            {
                path: 'loanAmountsToUser',
                populate: { path: 'currency' }
            }
        ];
        const loans = await loan_2.default.find(query)
            .populate(population)
            .sort({ _id: -1 })
            .skip(skipAmount)
            .limit(limit);
        const totalCount = await loan_2.default.countDocuments(query);
        res.status(200).json({
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            loans: loans.map(e => (0, loan_3.default)(e))
        });
    }
    catch (error) {
        console.error('Error retrieving transactions:', error);
        res.status(500).json({ error });
    }
});
exports.default = router;
