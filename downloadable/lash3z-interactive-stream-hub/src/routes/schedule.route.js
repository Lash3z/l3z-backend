import express from 'express';
import { getSchedule, addUpcoming, startRound, finishCurrentRound } from '../services/schedule.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const schedule = await getSchedule();
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.post('/upcoming', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const schedule = await addUpcoming(req.body || {});
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

router.post('/start', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const schedule = await startRound(req.body || {});
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.post('/finish', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const schedule = await finishCurrentRound(req.body || {});
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

export default router;
