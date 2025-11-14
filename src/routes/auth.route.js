import express from 'express';
import { config } from '../config/env.js';
import { createUser, findUserByEmail, recordLogin, linkKickAccount } from '../services/users.service.js';
import { getWallet } from '../services/wallet.service.js';
import { verifyKickUsername } from '../services/kickAPI.service.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body || {};
    const user = await createUser({ email, password, displayName });
    const wallet = await getWallet(user.id);
    res.status(201).json({ user, wallet });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await findUserByEmail((email || '').toLowerCase());
    if (!user || (user.password && password !== user.password)) {
      throw new HttpError(401, 'invalid credentials');
    }
    await recordLogin(user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/kick/verify', async (req, res, next) => {
  try {
    const { username, userId } = req.body || {};
    const result = await verifyKickUsername(username);
    if (!result.valid) {
      throw new HttpError(404, 'kick user not found', { error: result.error });
    }
    if (userId) {
      await linkKickAccount(userId, result.profile?.user?.username?.toUpperCase());
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/admin/session', (req, res) => {
  const { token } = req.body || {};
  if (token && token === config.adminToken) {
    res
      .cookie('admin_auth', '1', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 60 * 60 * 24
      })
      .json({ ok: true });
  } else {
    res.status(401).json({ error: 'invalid token' });
  }
});

export default router;
