import { kvGet, kvSet } from '../utils/kvStore.js';

const KEY = 'module:stamina';

const DEFAULT_STATE = {
  queue: [],
  active: null
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

export async function getStaminaState() {
  return loadState();
}

export async function enqueuePlayer(entry) {
  const state = await loadState();
  state.queue = [...(state.queue || []), entry];
  return saveState(state);
}

export async function recordWin(userId) {
  const state = await loadState();
  if (!userId) {
    return state;
  }
  if (state.active && state.active.userId === userId) {
    state.active.streak = (state.active.streak || 0) + 1;
  }
  return saveState(state);
}

export async function nextChallenger() {
  const state = await loadState();
  const [next, ...rest] = state.queue || [];
  state.queue = rest;
  state.active = next ? { ...next, streak: 0 } : null;
  return saveState(state);
}
