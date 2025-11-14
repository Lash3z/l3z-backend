import http from 'node:http';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './src/config/env.js';
import { createSocketHub } from './src/utils/socketHub.js';
import { isHttpError, HttpError } from './src/utils/errors.js';

import authRoute from './src/routes/auth.route.js';
import walletRoute from './src/routes/wallet.route.js';
import betsRoute from './src/routes/bets.route.js';
import battlegroundRoute from './src/routes/battleground.route.js';
import premierRoute from './src/routes/premier.route.js';
import bonusRoute from './src/routes/bonus.route.js';
import rafflesRoute from './src/routes/raffles.route.js';
import scheduleRoute from './src/routes/schedule.route.js';
import usersRoute from './src/routes/users.route.js';
import staminaRoute from './src/routes/stamina.route.js';
import lucky7Route from './src/routes/lucky7.route.js';
import leaderboardRoute from './src/routes/leaderboard.route.js';

const app = express();

const corsOrigins = config.corsOrigin === '*'
  ? true
  : config.corsOrigin.split(',').map((origin) => origin.trim());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('tiny'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/auth', authRoute);
app.use('/wallet', walletRoute);
app.use('/bets', betsRoute);
app.use('/battleground', battlegroundRoute);
app.use('/premier', premierRoute);
app.use('/bonus', bonusRoute);
app.use('/raffles', rafflesRoute);
app.use('/schedule', scheduleRoute);
app.use('/users', usersRoute);
app.use('/stamina', staminaRoute);
app.use('/lucky7', lucky7Route);
app.use('/leaderboards', leaderboardRoute);

app.use((req, res, next) => {
  next(new HttpError(404, 'not found'));
});

app.use((error, req, res, next) => {
  if (isHttpError(error)) {
    return res.status(error.status || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'internal server error' });
});

const server = http.createServer(app);
createSocketHub(server);

const port = config.port;
server.listen(port, () => {
  console.log(`LASH3Z Interactive Stream Hub API listening on http://localhost:${port}`);
});

export default app;
