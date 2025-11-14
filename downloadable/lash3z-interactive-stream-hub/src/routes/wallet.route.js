import express from 'express';
import { getWallet, adjustBalance, dailyClaim, setBalance, recordPayout } from '../services/wallet.service.js';
import { HttpError } from '../utils/errors.js';
import { config } from '../config/env.js';

const router = express.Router();

function ensureAdmin(req) {
  const token = req.headers['x-admin-token'];
  if (token !== config.adminToken) {
    throw new HttpError(401, 'unauthorized');
  }
}

router.get('/:userId', async (req, res, next) => {
  try {
    const wallet = await getWallet(req.params.userId);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/adjust', async (req, res, next) => {
  try {
    ensureAdmin(req);
    const { amount, reason, metadata } = req.body || {};
    const wallet = await adjustBalance(req.params.userId, Number(amount), reason, metadata);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/set', async (req, res, next) => {
  try {
    ensureAdmin(req);
    const { amount, reason } = req.body || {};
    const wallet = await setBalance(req.params.userId, Number(amount), reason);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/daily-claim', async (req, res, next) => {
  try {
    const wallet = await dailyClaim(req.params.userId, Number(req.body?.amount || 50));
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/payout', async (req, res, next) => {
  try {
    ensureAdmin(req);
    const { amount, reason, metadata } = req.body || {};
    const wallet = await recordPayout(req.params.userId, Number(amount), reason, metadata);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

export default router;
