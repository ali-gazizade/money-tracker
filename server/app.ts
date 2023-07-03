import express from 'express';
import dashboardRouter from './routes/dashboard';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import currencyRouter from './routes/currency';
import walletRouter from './routes/wallet';
import cityRouter from './routes/city';
import connectDB from './db';
import auth from './middlewares/auth';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/static', express.static('public'));

app.use('/dashboard', auth, dashboardRouter);
app.use('/user', auth, userRouter);
app.use('/auth', authRouter);
app.use('/currency', auth, currencyRouter);
app.use('/wallet', auth, walletRouter);
app.use('/city', auth, cityRouter);

const port = 3010;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
