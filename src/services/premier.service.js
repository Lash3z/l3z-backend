import { kvGet, kvSet } from '../utils/kvStore.js';
import { HttpError } from '../utils/errors.js';

const KEY = 'module:premier';

const DEFAULT_STATE = {
  seasonId: 'pl-1',
  status: 'idle',
  groups: {},
  fixtures: [],
  leaderboard: {},
  activeMatch: null,
  multiplierBar: 0
};

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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

function normalizeGroups(groups = {}) {
  const output = {};
  GROUPS.forEach((groupKey) => {
    const list = groups[groupKey];
    output[groupKey] = Array.isArray(list)
      ? list.slice(0, 4).map((team) => ({
          name: (team?.name || '').toUpperCase(),
          points: Number(team?.points || 0),
          played: Number(team?.played || 0),
          wins: Number(team?.wins || 0),
          losses: Number(team?.losses || 0)
        }))
      : [];
  });
  return output;
}

export async function getPremierState() {
  return loadState();
}

export async function setPremierState(patch) {
  const state = await loadState();
  const next = {
    ...state,
    ...patch,
    groups: normalizeGroups(patch?.groups || state.groups),
    fixtures: Array.isArray(patch?.fixtures) ? patch.fixtures : state.fixtures,
    leaderboard:
      patch?.leaderboard && typeof patch.leaderboard === 'object'
        ? patch.leaderboard
        : state.leaderboard,
    multiplierBar: Number.isFinite(patch?.multiplierBar) ? patch.multiplierBar : state.multiplierBar
  };
  return saveState(next);
}

export async function recordMatchMultiplier({ matchId, group, home, away, multiplier }) {
  if (!matchId) throw new HttpError(400, 'matchId required');
  if (!group || !GROUPS.includes(group)) throw new HttpError(400, 'invalid group');
  const state = await loadState();
  const fixtures = state.fixtures.map((fixture) => {
    if (fixture.id !== matchId) return fixture;
    return {
      ...fixture,
      multiplier,
      home,
      away,
      completed: true
    };
  });
  const leaderboard = { ...state.leaderboard };
  leaderboard[group] = leaderboard[group] || [];
  leaderboard[group] = leaderboard[group].map((team) => {
    if (team.name === home) return { ...team, points: (team.points || 0) + (multiplier > 0 ? 3 : 0) };
    if (team.name === away) return { ...team, points: (team.points || 0) + (multiplier > 0 ? 1 : 0) };
    return team;
  });
  state.fixtures = fixtures;
  state.leaderboard = leaderboard;
  state.multiplierBar = Math.min(100, Math.max(0, Number(multiplier) + Number(state.multiplierBar || 0)));
  return saveState(state);
}

export async function shuffleGroups() {
  const state = await loadState();
  const entries = GROUPS.flatMap((group) => state.groups[group] || []);
  const shuffled = entries.sort(() => Math.random() - 0.5);
  const nextGroups = {};
  let index = 0;
  GROUPS.forEach((group) => {
    nextGroups[group] = shuffled.slice(index, index + 4);
    index += 4;
  });
  state.groups = nextGroups;
  return saveState(state);
}

export async function setActiveMatch(match) {
  const state = await loadState();
  state.activeMatch = match;
  return saveState(state);
}
