const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();

connectDB();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const configuredOrigins = process.env.CORS_ORIGIN || '*';
const allowedOrigins = configuredOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    const isVercelOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin || '');
    callback(null, allowedOrigins.includes('*') || allowedOrigins.includes(origin) || isVercelOrigin);
  }
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/versions', require('./routes/versions'));
app.use('/api/pdf', require('./routes/pdf'));

app.get('/', (req, res) => {
  res.json({ message: 'X-Ray AI System API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
