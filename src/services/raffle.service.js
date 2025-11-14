import { nanoid } from 'nanoid';
import { kvGet, kvSet } from '../utils/kvStore.js';
import { HttpError } from '../utils/errors.js';

const KEY = 'module:raffles';

async function loadRaffles() {
  const data = await kvGet(KEY, []);
  return Array.isArray(data) ? data : [];
}

async function saveRaffles(raffles) {
  await kvSet(KEY, raffles);
  return raffles;
}

export async function listRaffles() {
  return loadRaffles();
}

export async function createRaffle({ title, prize, cost, adminId }) {
  if (!title) throw new HttpError(400, 'title required');
  const raffles = await loadRaffles();
  const raffle = {
    id: nanoid(12),
    title,
    prize: prize || '',
    cost: Number(cost || 0),
    adminId: adminId || null,
    entries: [],
    createdAt: new Date().toISOString(),
    winner: null,
    status: 'open'
  };
  raffles.push(raffle);
  await saveRaffles(raffles);
  return raffle;
}

export async function enterRaffle({ raffleId, userId, username }) {
  if (!raffleId || !userId) throw new HttpError(400, 'raffleId and userId required');
  const raffles = await loadRaffles();
  const index = raffles.findIndex((raffle) => raffle.id === raffleId);
  if (index === -1) throw new HttpError(404, 'raffle not found');
  const raffle = raffles[index];
  if (raffle.status !== 'open') throw new HttpError(403, 'raffle closed');
  const entry = {
    id: nanoid(16),
    userId,
    username,
    createdAt: new Date().toISOString()
  };
  raffle.entries.push(entry);
  raffles[index] = raffle;
  await saveRaffles(raffles);
  return entry;
}

export async function pickWinner(raffleId) {
  const raffles = await loadRaffles();
  const index = raffles.findIndex((raffle) => raffle.id === raffleId);
  if (index === -1) throw new HttpError(404, 'raffle not found');
  const raffle = raffles[index];
  if (!raffle.entries.length) throw new HttpError(400, 'no entries to draw');
  const winner = raffle.entries[Math.floor(Math.random() * raffle.entries.length)];
  raffle.winner = winner;
  raffle.status = 'closed';
  raffles[index] = raffle;
  await saveRaffles(raffles);
  return winner;
}
