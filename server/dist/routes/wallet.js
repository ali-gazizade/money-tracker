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
const wallet_1 = __importDefault(require("../models/wallet"));
const mongoose_1 = __importStar(require("mongoose"));
const amount_1 = __importDefault(require("../models/amount"));
const wallet_2 = __importDefault(require("../assemblers/wallet"));
const currency_1 = __importDefault(require("../models/currency"));
const router = express_1.default.Router();
router.get('/list', async (req, res) => {
    try {
        const wallets = await wallet_1.default.find({ user: req.user, active: true })
            .populate({
            path: 'initialAmounts',
            populate: { path: 'currency' }
        })
            .sort({ _id: -1 });
        res.status(200).json(wallets.map(e => (0, wallet_2.default)(e)));
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/create', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('initialAmounts').notEmpty().withMessage('First time amounts must be provided'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, initialAmounts } = req.body;
        // Check first time amount currencies
        for (let initialAmount of initialAmounts) {
            if (!mongoose_1.default.Types.ObjectId.isValid(initialAmount?.currency)) {
                return res.status(400).json({ error: 'Invalid currency id:' + initialAmount?.currency });
            }
            const currency = await currency_1.default.findOne({ _id: initialAmount.currency, user: req.user });
            if (!currency) {
                return res.status(404).json({ error: 'Currency not found with id:' + initialAmount.currency });
            }
        }
        // Create the amount documents
        const amountIds = [];
        for (let initialAmount of initialAmounts) {
            const savedAmount = await (new amount_1.default({
                value: initialAmount.value,
                currency: initialAmount.currency,
                user: req.user
            })).save();
            amountIds.push(savedAmount._id);
        }
        const wallet = new wallet_1.default({ name, initialAmounts: amountIds, user: req.user, active: true });
        const savedWallet = await wallet.save();
        res.status(201).json((0, wallet_2.default)(savedWallet));
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/get/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const wallet = await wallet_1.default.findOne({ _id: id, user: req.user, active: true }).populate({
            path: 'initialAmounts',
            populate: { path: 'currency' }
        });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        return res.status(200).json((0, wallet_2.default)(wallet));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, active } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({ error: 'Invalid wallet ID' });
        }
        const wallet = await wallet_1.default.findOne({ _id: id, user: req.user, active: true });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        if (typeof name !== 'undefined') {
            wallet.name = name;
        }
        if (typeof active !== 'undefined') {
            wallet.active = active;
        }
        await wallet.save();
        res.status(200).json((0, wallet_2.default)(wallet));
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
