"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const city_1 = __importDefault(require("../models/city"));
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const city_2 = __importDefault(require("../assemblers/city"));
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
        const cities = await city_1.default.find(query)
            .sort({ _id: -1 })
            .skip(skipAmount)
            .limit(limit);
        const totalCount = await city_1.default.countDocuments(query);
        res.status(200).json({
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            cities: cities.map(e => (0, city_2.default)(e))
        });
    }
    catch (error) {
        console.error('Error retrieving cities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/country_list', async (req, res) => {
    try {
        const countries = await city_1.default.distinct('countryName', { user: req.user, active: true });
        res.status(200).json(countries);
    }
    catch (error) {
        console.error('Error retrieving cities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/create', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('name is required'),
    (0, express_validator_1.body)('countryName').notEmpty().withMessage('countryName is required')
], async (req, res) => {
    try {
        let { name, countryName } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Check if a city with the same name already exists
        const existingCity = await city_1.default.findOne({ name, countryName, user: req.user, active: true }).exec();
        if (existingCity) {
            return res.status(409).json({ error: 'City already exists' });
        }
        const city = new city_1.default({ name, countryName, user: req.user, active: true });
        await city.save();
        res.status(201).json((0, city_2.default)(city));
    }
    catch (error) {
        console.error('Error creating city:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/get/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const city = await city_1.default.findOne({ _id: id, user: req.user, active: true });
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }
        return res.status(200).json((0, city_2.default)(city));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { name, countryName, active } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const city = await city_1.default.findOne({ _id: id, user: req.user, active: true });
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }
        if (typeof name !== 'undefined') {
            city.name = name;
        }
        if (typeof countryName !== 'undefined') {
            city.countryName = countryName;
        }
        if (typeof active !== 'undefined') {
            city.active = active;
        }
        // Check if the same city already exists
        if (active !== false && (name || countryName)) {
            const existingCity = await city_1.default.findOne({
                name: city.name,
                countryName: city.countryName,
                user: req.user,
                active: true
            }).exec();
            if (existingCity) {
                return res.status(409).json({ error: 'City already exists' });
            }
        }
        await city.save();
        res.status(200).json((0, city_2.default)(city));
    }
    catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
