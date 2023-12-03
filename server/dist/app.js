"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
const currency_1 = __importDefault(require("./routes/currency"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const city_1 = __importDefault(require("./routes/city"));
const contact_1 = __importDefault(require("./routes/contact"));
const transaction_1 = __importDefault(require("./routes/transaction"));
const loan_1 = __importDefault(require("./routes/loan"));
const db_1 = __importDefault(require("./db"));
const auth_2 = __importDefault(require("./middlewares/auth"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
(0, db_1.default)();
app.use('/static', express_1.default.static('public'));
app.use('/dashboard', auth_2.default, dashboard_1.default);
app.use('/user', auth_2.default, user_1.default);
app.use('/auth', auth_1.default);
app.use('/currency', auth_2.default, currency_1.default);
app.use('/wallet', auth_2.default, wallet_1.default);
app.use('/city', auth_2.default, city_1.default);
app.use('/contact', auth_2.default, contact_1.default);
app.use('/transaction', auth_2.default, transaction_1.default);
app.use('/loan', auth_2.default, loan_1.default);
const port = 3010;
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
exports.default = app;
