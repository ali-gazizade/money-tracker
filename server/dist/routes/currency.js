"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currency_1 = __importDefault(require("../models/currency"));
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const currency_2 = __importDefault(require("../assemblers/currency"));
const router = (0, express_1.Router)();
router.get('/list', async (req, res) => {
    try {
        const currencies = await currency_1.default.find({ user: req.user, active: true })
            .sort({ _id: -1 });
        res.status(200).json(currencies.map(e => (0, currency_2.default)(e)));
    }
    catch (error) {
        console.error('Error retrieving currencies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/create', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('isDefault').notEmpty().withMessage('isDefault is required')
], async (req, res) => {
    try {
        let { name, isDefault, exchangeRate } = req.body;
        if (isDefault) {
            exchangeRate = 1;
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Check if a currency with the same name already exists
        const existingCurrency = await currency_1.default.findOne({ name, user: req.user, active: true }).exec();
        if (existingCurrency) {
            return res.status(409).json({ error: 'Currency already exists' });
        }
        // Check if there is a default one
        const defaultCurrency = await currency_1.default.findOne({ isDefault: true, user: req.user, active: true }).exec();
        if (isDefault === true && defaultCurrency) {
            defaultCurrency.isDefault = false;
            await defaultCurrency.save();
        }
        else if (!defaultCurrency) {
            isDefault = true;
        }
        const currency = new currency_1.default({ name, isDefault, user: req.user, exchangeRate, active: true });
        await currency.save();
        res.status(201).json((0, currency_2.default)(currency));
    }
    catch (error) {
        console.error('Error creating currency:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/get/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const currency = await currency_1.default.findOne({ _id: id, user: req.user, active: true });
        if (!currency) {
            return res.status(404).json({ error: 'Currency not found' });
        }
        return res.status(200).json((0, currency_2.default)(currency));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { name, isDefault, exchangeRate, active } = req.body;
        if (active === false) {
            isDefault = false;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const currency = await currency_1.default.findOne({ _id: id, user: req.user, active: true });
        if (!currency) {
            return res.status(404).json({ error: 'Currency not found' });
        }
        if ( // Default currencies always have exchange rate as 1
        (typeof isDefault !== 'undefined' && isDefault) ||
            (typeof isDefault === 'undefined' && currency.isDefault)) {
            exchangeRate = 1;
        }
        if (typeof name !== 'undefined') {
            currency.name = name;
        }
        if (typeof exchangeRate !== 'undefined') {
            currency.exchangeRate = exchangeRate;
        }
        if (typeof isDefault !== 'undefined') {
            currency.isDefault = isDefault;
        }
        if (typeof active !== 'undefined') {
            currency.active = active;
        }
        // Check if the same currency already exists
        if (active !== false && name) {
            const existingCurrency = await currency_1.default.findOne({
                name: currency.name,
                user: req.user,
                active: true,
                _id: {
                    $ne: id
                }
            }).exec();
            if (existingCurrency) {
                return res.status(409).json({ error: 'Currency already exists' });
            }
        }
        // Check for default
        if (typeof isDefault !== 'undefined') {
            const defaultCurrency = await currency_1.default.findOne({ isDefault: true, user: req.user, active: true }).exec();
            if (isDefault === true && defaultCurrency) {
                defaultCurrency.isDefault = false;
                await defaultCurrency.save();
            }
            else if (isDefault === false && !defaultCurrency) {
                // There must be at least 1 default, so nothing will happen here
                isDefault = true;
            }
        }
        await currency.save();
        // If the default currency removed then make 1 default
        const defaultCurrenciesCount = await currency_1.default.count({ isDefault: true, user: req.user, active: true });
        if (defaultCurrenciesCount === 0) {
            const anyCurrency = await currency_1.default.findOne({ user: req.user, active: true }).exec();
            if (anyCurrency) {
                anyCurrency.isDefault = true;
                anyCurrency.exchangeRate = 1;
                await anyCurrency.save();
            }
        }
        res.status(200).json((0, currency_2.default)(currency));
    }
    catch (error) {
        console.error('Error updating currency:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/default', async (req, res) => {
    try {
        const currency = await currency_1.default.findOne({ isDefault: true, user: req.user, active: true });
        if (!currency) {
            return res.status(404).json({ error: 'Currency not found' });
        }
        return res.status(200).json((0, currency_2.default)(currency));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
