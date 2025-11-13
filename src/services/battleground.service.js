import { kvGet, kvSet } from '../utils/kvStore.js';
import { HttpError } from '../utils/errors.js';

const KEY = 'module:battleground';

const DEFAULT_STATE = {
  seasonId: 'default',
  round: 1,
  totalRounds: 16,
  status: 'idle',
  rotationIndex: 0,
  matches: [],
  scoreboard: {},
  odds: {}
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

export async function getBattlegroundState() {
  return loadState();
}

export async function setBattlegroundState(patch) {
  const state = await loadState();
  const next = {
    ...state,
    ...patch,
    matches: Array.isArray(patch?.matches) ? patch.matches : state.matches,
    odds: patch?.odds && typeof patch.odds === 'object' ? patch.odds : state.odds,
    scoreboard:
      patch?.scoreboard && typeof patch.scoreboard === 'object'
        ? patch.scoreboard
        : state.scoreboard
  };
  return saveState(next);
}

export async function updateMatchScore(matchId, data) {
  const state = await loadState();
  const matches = (state.matches || []).map((match) => {
    if (match.id !== matchId) return match;
    return {
      ...match,
      ...data
    };
  });
  state.matches = matches;
  return saveState(state);
}

export async function recordScore(result) {
  const { matchId, winner, score } = result || {};
  if (!matchId) throw new HttpError(400, 'matchId required');
  const state = await loadState();
  const matchIndex = (state.matches || []).findIndex((match) => match.id === matchId);
  if (matchIndex === -1) throw new HttpError(404, 'match not found');
  const match = state.matches[matchIndex];
  state.matches[matchIndex] = {
    ...match,
    winner,
    score,
    status: 'finished'
  };
  if (winner) {
    state.scoreboard = {
      ...state.scoreboard,
      [winner]: (state.scoreboard?.[winner] || 0) + 1
    };
  }
  return saveState(state);
}

export async function advanceRotation() {
  const state = await loadState();
  const total = (state.matches || []).length;
  const nextIndex = total === 0 ? 0 : (state.rotationIndex + 1) % total;
  state.rotationIndex = nextIndex;
  return saveState(state);
}
