import express, { Request, Response } from 'express';
import dashboardRouter from './routes/dashboard';
import userRouter from './routes/user';
import connectDB from './db';

const app = express();

connectDB();

app.use('/static', express.static('public'));

app.use('/dashboard', dashboardRouter);
app.use('/user', userRouter);

const port = 3010;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
