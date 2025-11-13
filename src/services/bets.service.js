import { nanoid } from 'nanoid';
import { kvGet, kvSet } from '../utils/kvStore.js';
import { HttpError } from '../utils/errors.js';
import { adjustBalance } from './wallet.service.js';

const KEY = 'core:bets';

async function loadBets() {
  const data = await kvGet(KEY, []);
  return Array.isArray(data) ? data : [];
}

async function saveBets(bets) {
  await kvSet(KEY, bets);
  return bets;
}

export async function listBets(filter = {}) {
  const bets = await loadBets();
  if (!filter || Object.keys(filter).length === 0) return bets;
  return bets.filter((bet) =>
    Object.entries(filter).every(([key, value]) => (value == null ? true : bet[key] === value))
  );
}

export async function placeBet({ userId, type, selections, stake, metadata = {} }) {
  if (!userId) throw new HttpError(400, 'userId required');
  if (!type) throw new HttpError(400, 'type required');
  if (!Array.isArray(selections) || selections.length === 0)
    throw new HttpError(400, 'at least one selection required');
  if (!Number.isFinite(stake) || stake <= 0) throw new HttpError(400, 'invalid stake');

  await adjustBalance(userId, -stake, 'bet-stake', { type, selections });

  const bets = await loadBets();
  const bet = {
    id: nanoid(16),
    userId,
    type,
    selections,
    stake,
    metadata,
    status: 'pending',
    createdAt: new Date().toISOString(),
    settledAt: null,
    payout: 0
  };
  bets.push(bet);
  await saveBets(bets);
  return bet;
}

export async function settleBet(id, outcome) {
  const bets = await loadBets();
  const index = bets.findIndex((bet) => bet.id === id);
  if (index === -1) throw new HttpError(404, 'bet not found');
  const bet = bets[index];
  if (bet.status !== 'pending') throw new HttpError(400, 'bet already settled');
  const payout = Number(outcome?.payout || 0);
  const status = payout > 0 ? 'won' : 'lost';
  bets[index] = {
    ...bet,
    status,
    payout,
    settledAt: new Date().toISOString(),
    metadata: {
      ...bet.metadata,
      result: outcome
    }
  };
  await saveBets(bets);
  if (payout > 0) {
    await adjustBalance(bet.userId, payout, 'bet-payout', {
      betId: bet.id,
      type: bet.type
    });
  }
  return bets[index];
}
