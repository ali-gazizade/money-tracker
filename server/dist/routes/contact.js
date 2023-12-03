"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_1 = __importDefault(require("../models/contact"));
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const contact_2 = __importDefault(require("../assemblers/contact"));
const router = (0, express_1.Router)();
router.get('/list', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const { name } = req.query;
        const skipAmount = (page - 1) * limit;
        const query = { user: req.user, active: true };
        if (name) {
            query.name = {
                $regex: '.*' + name + '.*',
                $options: 'i'
            };
        }
        const contacts = await contact_1.default.find(query)
            .sort({ _id: -1 })
            .skip(skipAmount)
            .limit(limit);
        const totalCount = await contact_1.default.countDocuments(query);
        res.status(200).json({
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            contacts: contacts.map(e => (0, contact_2.default)(e))
        });
    }
    catch (error) {
        console.error('Error retrieving contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/create', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
    try {
        let { name } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Check if a contact with the same name already exists
        const existingContact = await contact_1.default.findOne({ name, user: req.user, active: true }).exec();
        if (existingContact) {
            return res.status(409).json({ error: 'Contact already exists' });
        }
        const contact = new contact_1.default({ name, user: req.user, active: true });
        await contact.save();
        res.status(201).json({
            contact: (0, contact_2.default)(contact)
        });
    }
    catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/get/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const contact = await contact_1.default.findOne({ _id: id, user: req.user, active: true });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        return res.status(200).json((0, contact_2.default)(contact));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { name, active } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const contact = await contact_1.default.findOne({ _id: id, user: req.user, active: true });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        if (typeof name !== 'undefined') {
            contact.name = name;
        }
        if (typeof active !== 'undefined') {
            contact.active = active;
        }
        // Check if the same contact already exists
        if (active !== false && name) {
            const existingContact = await contact_1.default.findOne({ name: contact.name, user: req.user, active: true }).exec();
            if (existingContact) {
                return res.status(409).json({ error: 'Contact already exists' });
            }
        }
        await contact.save();
        res.status(200).json((0, contact_2.default)(contact));
    }
    catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
