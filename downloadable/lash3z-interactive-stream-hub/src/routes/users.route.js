import express from 'express';
import { listUsers, findUserById, updateUser } from '../services/users.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) throw new HttpError(404, 'user not found');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const user = await updateUser(req.params.id, req.body || {});
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
