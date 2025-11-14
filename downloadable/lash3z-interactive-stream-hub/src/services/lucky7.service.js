import { kvGet, kvSet } from '../utils/kvStore.js';

const KEY = 'module:lucky7';

const DEFAULT_STATE = {
  scoring: [
    { combo: 'TRIPLE_SEVEN', payout: 777 },
    { combo: 'DOUBLE_SEVEN', payout: 77 },
    { combo: 'SINGLE_SEVEN', payout: 7 }
  ],
  lastWinner: null
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

export async function getLucky7State() {
  return loadState();
}

export async function setScoringTable(scoring) {
  const state = await loadState();
  state.scoring = Array.isArray(scoring) ? scoring : state.scoring;
  return saveState(state);
}

export async function recordWinner(winner) {
  const state = await loadState();
  state.lastWinner = winner;
  return saveState(state);
}
