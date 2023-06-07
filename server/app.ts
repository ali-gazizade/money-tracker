import express, { Request, Response } from 'express';
import dashboardRouter from './routes/dashboard';

const app = express();

app.use('/static', express.static('public'));

app.use('/dashboard', dashboardRouter);

const port = 3010;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
