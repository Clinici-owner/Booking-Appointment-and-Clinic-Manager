const express = require('express');
const morgan = require('morgan');
const path = require('path');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const app = express();
const route = require('./routes');
const db = require('./config/db');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
// Load biến môi trường
dotenv.config({ path: './.env' });

// Kết nối DB
db.connect();

// Port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ứng dụng đang chạy trên cổng ${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('combined'));


// Sử dụng session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookingappointment',
    collectionName: 'sessions'
  }),
  cookie: { secure: false } // Đặt secure: true nếu dùng HTTPS
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Khởi tạo routes
route(app);
