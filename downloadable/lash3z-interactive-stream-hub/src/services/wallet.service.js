import { nanoid } from 'nanoid';
import { kvGet, kvSet } from '../utils/kvStore.js';
import { HttpError } from '../utils/errors.js';
import { updateUser } from './users.service.js';

const KEY = 'core:wallets';
const DEFAULT_WALLET = { balance: 0, transactions: [], lastDailyClaim: null };

async function loadWallets() {
  const data = await kvGet(KEY, {});
  return typeof data === 'object' && data ? data : {};
}

async function saveWallets(wallets) {
  await kvSet(KEY, wallets);
  return wallets;
}

async function ensureWallet(userId) {
  const wallets = await loadWallets();
  if (!wallets[userId]) {
    wallets[userId] = { ...DEFAULT_WALLET };
    await saveWallets(wallets);
  }
  return wallets[userId];
}

export async function getWallet(userId) {
  if (!userId) throw new HttpError(400, 'userId required');
  const wallets = await loadWallets();
  return wallets[userId] ? { ...wallets[userId] } : { ...DEFAULT_WALLET };
}

export async function getBalance(userId) {
  const wallet = await getWallet(userId);
  return wallet.balance;
}

export async function adjustBalance(userId, delta, reason, metadata = {}) {
  if (!userId) throw new HttpError(400, 'userId required');
  if (!Number.isFinite(delta)) throw new HttpError(400, 'delta must be a number');
  const wallets = await loadWallets();
  const wallet = wallets[userId] || { ...DEFAULT_WALLET };
  const nextBalance = (wallet.balance || 0) + delta;
  if (nextBalance < 0) throw new HttpError(400, 'insufficient balance');
  const transaction = {
    id: nanoid(16),
    delta,
    reason: reason || 'adjustment',
    metadata,
    balanceAfter: nextBalance,
    createdAt: new Date().toISOString()
  };
  wallet.balance = nextBalance;
  wallet.transactions = [transaction, ...(wallet.transactions || [])].slice(0, 100);
  wallets[userId] = wallet;
  await saveWallets(wallets);
  await updateUser(userId, {
    metadata: {
      lbx: nextBalance
    }
  }).catch(() => {});
  return { ...wallet };
}

export async function dailyClaim(userId, amount = 50) {
  const wallets = await loadWallets();
  const wallet = wallets[userId] || { ...DEFAULT_WALLET };
  const lastClaim = wallet.lastDailyClaim ? new Date(wallet.lastDailyClaim) : null;
  const now = new Date();
  if (lastClaim && now.getUTCFullYear() === lastClaim.getUTCFullYear() && now.getUTCMonth() === lastClaim.getUTCMonth() && now.getUTCDate() === lastClaim.getUTCDate()) {
    throw new HttpError(429, 'daily claim already collected');
  }
  wallet.lastDailyClaim = now.toISOString();
  wallet.balance = (wallet.balance || 0) + amount;
  wallet.transactions = [
    {
      id: nanoid(16),
      delta: amount,
      reason: 'daily-claim',
      metadata: {},
      balanceAfter: wallet.balance,
      createdAt: now.toISOString()
    },
    ...(wallet.transactions || [])
  ].slice(0, 100);
  wallets[userId] = wallet;
  await saveWallets(wallets);
  return { ...wallet };
}

export async function setBalance(userId, amount, reason = 'admin-adjustment') {
  const wallet = await getWallet(userId);
  const delta = amount - wallet.balance;
  return adjustBalance(userId, delta, reason, { target: amount });
}

export async function recordPayout(userId, amount, reason, metadata = {}) {
  return adjustBalance(userId, amount, reason || 'payout', metadata);
}
