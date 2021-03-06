var session = require('express-session');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const color = require('colors');

//security
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const errorHandler = require('./middlewares/error');
const connectDB = require('./config/db');

// load env vars
require('dotenv').config();

//connect DB
connectDB();

//routes file
const categories = require('./routes/category');
const products = require('./routes/product');
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const order = require('./routes/order');
const stripe = require('./routes/stripe');
const user_data = require('./routes/user_data');
const discount = require('./routes/discount');

const app = express();

// app.use(
//   cors({
//     preflightContinue: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   })
// );
//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());
// use session
app.use(
  session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
  })
);
//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//file uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors({ origin: true }));
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//

// app.options('/api/checkout', cors());
// Mount routers
app.use('/api/categories', categories);
app.use('/api/products', products);
app.use('/api/auth', auth);
app.use('/api/users', admin);
app.use('/api/order', order);
app.use('/api/user_data', user_data);
app.use('/api/discount', discount);
app.use('/', stripe);

// Moutn error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `Server is running on ${process.env.NODE_ENV} mode by Duong Ace on port ${PORT}  `
      .yellow.bold
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // server.close(() => process.exit());
});
