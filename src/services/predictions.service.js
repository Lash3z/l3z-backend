import { nanoid } from 'nanoid';
import { kvGet, kvSet } from '../utils/kvStore.js';
import { HttpError } from '../utils/errors.js';

const KEY = 'module:bonus-hunt';

const DEFAULT_STATE = {
  title: '',
  status: 'open',
  entryFee: 20,
  entries: [],
  results: null,
  communityStats: {},
  startedAt: null,
  closedAt: null
};

async function loadState() {
  const state = await kvGet(KEY, DEFAULT_STATE);
  return {
    ...DEFAULT_STATE,
    ...(state || {})
  };
}

async function saveState(state) {
  await kvSet(KEY, state);
  return state;
}

export async function getBonusHunt() {
  return loadState();
}

export async function submitPrediction({ userId, payload }) {
  if (!userId) throw new HttpError(400, 'userId required');
  const state = await loadState();
  if (state.status !== 'open') throw new HttpError(403, 'predictions closed');
  const entries = Array.isArray(state.entries) ? [...state.entries] : [];
  const existingIndex = entries.findIndex((entry) => entry.userId === userId);
  const entry = {
    id: existingIndex >= 0 ? entries[existingIndex].id : nanoid(16),
    userId,
    payload: payload && typeof payload === 'object' ? payload : {},
    createdAt: new Date().toISOString()
  };
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  state.entries = entries;
  state.communityStats = buildCommunityStats(entries);
  await saveState(state);
  return entry;
}

function buildCommunityStats(entries) {
  const stats = {};
  entries.forEach((entry) => {
    Object.entries(entry.payload || {}).forEach(([key, value]) => {
      const bucket = stats[key] || [];
      bucket.push(value);
      stats[key] = bucket;
    });
  });
  return stats;
}

export async function setBonusHuntState(patch) {
  const state = await loadState();
  const next = {
    ...state,
    ...patch,
    entries: Array.isArray(patch?.entries) ? patch.entries : state.entries,
    communityStats:
      patch?.communityStats && typeof patch.communityStats === 'object'
        ? patch.communityStats
        : state.communityStats
  };
  return saveState(next);
}

export async function lockBonusHunt(results) {
  const state = await loadState();
  state.status = 'closed';
  state.results = results;
  state.closedAt = new Date().toISOString();
  return saveState(state);
}
