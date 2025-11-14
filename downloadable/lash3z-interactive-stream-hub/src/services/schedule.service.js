import { kvGet, kvSet } from '../utils/kvStore.js';

const KEY = 'module:schedule';

const DEFAULT_STATE = {
  upcoming: [],
  history: [],
  currentRound: null
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

export async function getSchedule() {
  return loadState();
}

export async function addUpcoming(event) {
  const state = await loadState();
  state.upcoming = [...(state.upcoming || []), event];
  return saveState(state);
}

export async function startRound(round) {
  const state = await loadState();
  state.currentRound = {
    ...round,
    startedAt: new Date().toISOString()
  };
  return saveState(state);
}

export async function finishCurrentRound(result) {
  const state = await loadState();
  if (state.currentRound) {
    state.history = [
      {
        ...state.currentRound,
        finishedAt: new Date().toISOString(),
        result
      },
      ...(state.history || [])
    ];
  }
  state.currentRound = null;
  return saveState(state);
}
