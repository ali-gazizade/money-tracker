"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const users = await user_1.default.find().exec();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});
// Todo add validations
router.post('/', async (req, res) => {
    const { name, username, password } = req.body;
    // Validate the request body
    if (!name || !username || !password) {
        return res.status(400).json({ error: 'Name, username, and password are required' });
    }
    try {
        const newUser = new user_1.default({ name, username, password });
        const savedUser = await newUser.save();
        res.json(savedUser);
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while creating a user' });
    }
});
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const deletedUser = await user_1.default.findByIdAndDelete(userId).exec();
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the user' });
    }
});
exports.default = router;
