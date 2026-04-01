import dns from 'dns';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/ticket.js';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const app = express();
app.disable('x-powered-by');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many request',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login request',
  },
});

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (process.env.CORS_ALLOWED_ORIGIN?.includes(origin)) {
        return callback(null, true);
      }
    },
    credentials: true,
  }),
);


app.use(express.json({"limit": "50mb"}));
app.use(express.urlencoded({extended:true, limit: "50mb"}));
app.use(cookieParser());
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh', authLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Server is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server start failed', error);
    process.exit(1);
  }
}
startServer();

/*
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
})
*/
