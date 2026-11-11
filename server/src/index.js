import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Server as SocketServer } from 'socket.io';
import { createAuthMiddleware } from './middleware/auth.js';
import { HttpError } from './lib/errors.js';
import { createAuthRouter } from './routes/auth.js';
import { createWorkspaceRouter } from './routes/workspace.js';

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`StudyHub cannot start. Set these environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: true }, maxHttpBufferSize: 1_000_000 });
const auth = createAuthMiddleware(process.env.JWT_SECRET);
const port = Number(process.env.PORT || 4000);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const clientDist = path.join(projectRoot, 'client', 'dist');

app.disable('x-powered-by');
app.use(cors({ origin: true, allowedHeaders: ['Authorization', 'Content-Type', 'X-StudyHub-Device'], methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:']
    }
  }
}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' }));
app.use('/api/auth', createAuthRouter({ secret: process.env.JWT_SECRET, auth, io }));
app.use('/api', createWorkspaceRouter({ auth, io }));

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Sign in to connect.'));
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'studyhub' });
    socket.data.userId = String(payload.sub);
    socket.data.deviceId = String(socket.handshake.auth?.deviceId || '').slice(0, 100);
    next();
  } catch {
    next(new Error('Your session expired. Please sign in again.'));
  }
});
io.on('connection', socket => {
  socket.join(socket.data.userId);
  socket.on('disconnect', () => {});
});

app.use('/assets', express.static(path.join(projectRoot, 'assets'), { maxAge: '1d' }));
app.use(express.static(clientDist, { index: false, maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    return res.sendFile(path.join(clientDist, 'index.html'), error => error && next(error));
  }
  next();
});
app.use((req, _res, next) => next(new HttpError(404, 'That StudyHub route was not found.')));
app.use((error, _req, res, _next) => {
  if (error?.code === 11000) return res.status(409).json({ error: { message: 'That record already exists.' } });
  const status = Number(error.status || 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: { message: status >= 500 ? 'StudyHub had a hiccup. Please try again.' : error.message, details: error.details } });
});

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 12000 })
  .then(() => server.listen(port, '0.0.0.0', () => console.log(`StudyHub listening on ${port}`)))
  .catch(error => { console.error('Could not connect to MongoDB:', error.message); process.exit(1); });

process.on('SIGTERM', () => server.close(() => mongoose.connection.close(false).finally(() => process.exit(0))));
