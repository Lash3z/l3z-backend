import { kvGet, kvSet } from '../utils/kvStore.js';

const KEY = 'module:leaderboards';

const DEFAULT_STATE = {
  lbx: [],
  premier: [],
  wagerRace: []
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

export async function getLeaderboards() {
  return loadState();
}

export async function updateLeaderboard(name, entries) {
  const state = await loadState();
  state[name] = entries;
  await saveState(state);
  return state[name];
}
