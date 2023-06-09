import express, { Request, Response } from 'express';
import dashboardRouter from './routes/dashboard';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import connectDB from './db';

const app = express();

connectDB();

app.use('/static', express.static('public'));

app.use('/dashboard', dashboardRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);

const port = 3010;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
