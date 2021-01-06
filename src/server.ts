import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
// yarn add express-validator@5.3.1--save-exact
import expressValidator from 'express-validator';
import cors from 'cors';

import 'dotenv/config';

import routes from './routes';

const app = express();

mongoose
  .connect(`${process.env.MONGO_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('✈ Database connected'));

mongoose.connection.on('error', err => {
  console.log(`Database connection error: ${err.message}`);
});

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

app.use('/', routes);

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`🚀 Server has started on port ${port}`);
});
