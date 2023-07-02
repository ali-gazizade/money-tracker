import express, { Request, Response } from 'express';
import dashboardRouter from './routes/dashboard';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import currencyRouter from './routes/currency';
import walletRouter from './routes/wallet';
import cityRouter from './routes/city';
import connectDB from './db';

const app = express();

app.use(express.json());

connectDB();

app.use('/static', express.static('public'));

app.use('/dashboard', dashboardRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/currency', currencyRouter);
app.use('/wallet', walletRouter);
app.use('/city', cityRouter);

const port = 3010;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
