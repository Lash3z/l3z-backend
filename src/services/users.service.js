import { nanoid } from 'nanoid';
import { kvGet, kvSet } from '../utils/kvStore.js';
import { HttpError } from '../utils/errors.js';

const KEY = 'core:users';

async function loadUsers() {
  const data = await kvGet(KEY, []);
  return Array.isArray(data) ? data : [];
}

async function saveUsers(users) {
  await kvSet(KEY, users);
  return users;
}

export async function listUsers() {
  return loadUsers();
}

export async function findUserById(id) {
  const users = await loadUsers();
  return users.find((u) => u.id === id) || null;
}

export async function findUserByEmail(email) {
  const users = await loadUsers();
  return users.find((u) => u.email === email) || null;
}

export async function createUser({ email, password, displayName }) {
  if (!email) throw new HttpError(400, 'email is required');
  const existing = await findUserByEmail(email.toLowerCase());
  if (existing) throw new HttpError(409, 'email already registered');
  const users = await loadUsers();
  const user = {
    id: nanoid(12),
    email: email.toLowerCase(),
    password: password || null,
    displayName: displayName || email.split('@')[0],
    kickUsername: null,
    createdAt: new Date().toISOString(),
    metadata: {
      lastLoginAt: null,
      lbx: 0,
      stats: {}
    }
  };
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function updateUser(id, patch) {
  const users = await loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new HttpError(404, 'user not found');
  const next = {
    ...users[index],
    ...patch,
    metadata: {
      ...(users[index].metadata || {}),
      ...(patch?.metadata || {})
    }
  };
  users[index] = next;
  await saveUsers(users);
  return next;
}

export async function recordLogin(id) {
  const users = await loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new HttpError(404, 'user not found');
  users[index] = {
    ...users[index],
    metadata: {
      ...users[index].metadata,
      lastLoginAt: new Date().toISOString()
    }
  };
  await saveUsers(users);
  return users[index];
}

export async function linkKickAccount(id, username) {
  const users = await loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new HttpError(404, 'user not found');
  users[index] = {
    ...users[index],
    kickUsername: username,
    metadata: {
      ...users[index].metadata,
      kickVerifiedAt: new Date().toISOString()
    }
  };
  await saveUsers(users);
  return users[index];
}
