import express from 'express';
import { listBets, placeBet, settleBet } from '../services/bets.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { userId, type } = req.query;
    const bets = await listBets({
      userId: userId || undefined,
      type: type || undefined
    });
    res.json(bets);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const bet = await placeBet(req.body || {});
    res.status(201).json(bet);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/settle', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const bet = await settleBet(req.params.id, req.body || {});
    res.json(bet);
  } catch (error) {
    next(error);
  }
});

export default router;
