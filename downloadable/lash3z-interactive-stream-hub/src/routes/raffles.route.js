import express from 'express';
import { listRaffles, createRaffle, enterRaffle, pickWinner } from '../services/raffle.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const raffles = await listRaffles();
    res.json(raffles);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const raffle = await createRaffle(req.body || {});
    res.status(201).json(raffle);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/enter', async (req, res, next) => {
  try {
    const entry = await enterRaffle({ raffleId: req.params.id, ...(req.body || {}) });
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/draw', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const winner = await pickWinner(req.params.id);
    res.json(winner);
  } catch (error) {
    next(error);
  }
});

export default router;
