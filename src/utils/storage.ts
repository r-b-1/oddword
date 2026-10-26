import { useSyncExternalStore } from 'react';
import type { Catch, DiveSave, PersistedState, PlayerStats, Question, Settings, Tier } from '../types/game';
import { shiftEasternDate } from './date';
import { totalDepth, totalPoints } from './scoring';

const KEY = 'oddword-v1';
const LEGACY_KEY = 'krillion-clone-v1';

const TIERS: Tier[] = ['plankton', 'krill', 'lanternfish', 'squid', 'anglerfish', 'giant_squid', 'krillion'];

function emptyStats(): PlayerStats {
  return {
    totalGames: 0,
    totalDepth: 0,
    bestDepth: 0,
    averageDepth: 0,
    tierCounts: {
      plankton: 0,
      krill: 0,
      lanternfish: 0,
      squid: 0,
      anglerfish: 0,
      giant_squid: 0,
      krillion: 0,
    },
    streak: 0,
    lastPlayed: null,
  };
}

function fresh(): PersistedState {
  return {
    daily: {},
    practice: {},
    unlimited: [],
    stats: emptyStats(),
    settings: { sound: true, colorblind: false, character: 'Player' },
  };
}

function isCatch(value: unknown): value is Catch {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<Catch>;
  return typeof entry.questionId === 'string'
    && typeof entry.prompt === 'string'
    && typeof entry.points === 'number'
    && typeof entry.depth === 'number'
    && (entry.kind === 'catch' || entry.kind === 'miss' || entry.kind === 'timeout');
}

function isSave(value: unknown): value is DiveSave {
  if (!value || typeof value !== 'object') return false;
  const save = value as Partial<DiveSave>;
  return Array.isArray(save.questionIds)
    && save.questionIds.every((id) => typeof id === 'string')
    && Array.isArray(save.catches)
    && save.catches.every(isCatch)
    && typeof save.depth === 'number'
    && typeof save.points === 'number'
    && (save.completedAt === null || typeof save.completedAt === 'number');
}

function readMap(value: unknown): Record<string, DiveSave> {
  if (!value || typeof value !== 'object') return {};
  const map: Record<string, DiveSave> = {};
  for (const [key, save] of Object.entries(value)) {
    if (isSave(save)) map[key] = save;
  }
  return map;
}

function normalize(raw: unknown): PersistedState {
  const base = fresh();
  if (!raw || typeof raw !== 'object') return base;
  const parsed = raw as Partial<PersistedState>;
  base.daily = readMap(parsed.daily);
  base.practice = readMap(parsed.practice);
  base.unlimited = Array.isArray(parsed.unlimited) ? parsed.unlimited.filter(isSave).slice(0, 12) : [];

  const stats = parsed.stats;
  if (stats && typeof stats === 'object') {
    base.stats.totalGames = numberOr(stats.totalGames, 0);
    base.stats.totalDepth = numberOr(stats.totalDepth, 0);
    base.stats.bestDepth = numberOr(stats.bestDepth, 0);
    base.stats.averageDepth = numberOr(stats.averageDepth, 0);
    base.stats.streak = numberOr(stats.streak, 0);
    base.stats.lastPlayed = typeof stats.lastPlayed === 'string' ? stats.lastPlayed : null;
    for (const tier of TIERS) {
      base.stats.tierCounts[tier] = numberOr(stats.tierCounts?.[tier], 0);
    }
  }

  const settings = parsed.settings;
  if (settings && typeof settings === 'object') {
    base.settings = {
      sound: settings.sound !== false,
      colorblind: settings.colorblind === true,
      character: typeof settings.character === 'string' && settings.character.trim()
        ? settings.character.trim().slice(0, 24)
        : 'Player',
    };
  }

  return base;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

let cache = fresh();
let loaded = false;
const listeners = new Set<() => void>();

function readFromStorage(): PersistedState {
  if (typeof localStorage === 'undefined') return fresh();
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return fresh();
    return normalize(JSON.parse(raw));
  } catch {
    return fresh();
  }
}

export function getSnapshot(): PersistedState {
  if (!loaded) {
    cache = readFromStorage();
    loaded = true;
  }
  return cache;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function update(mutator: (draft: PersistedState) => void) {
  const draft = structuredClone(getSnapshot());
  mutator(draft);
  cache = draft;
  loaded = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Keep the in-memory logbook if storage is blocked.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSave(): PersistedState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function toSave(questions: Question[], catches: Catch[], completedAt: number | null): DiveSave {
  return {
    questionIds: questions.map((question) => question.id),
    catches,
    depth: totalDepth(catches),
    points: totalPoints(catches),
    completedAt,
  };
}

function applyStats(state: PersistedState, catches: Catch[], dailyDate?: string) {
  const depth = totalDepth(catches);
  const stats = state.stats;
  stats.totalGames += 1;
  stats.totalDepth += depth;
  stats.bestDepth = Math.max(stats.bestDepth, depth);
  stats.averageDepth = Math.round(stats.totalDepth / stats.totalGames);
  for (const entry of catches) {
    if (entry.tier) stats.tierCounts[entry.tier] += 1;
  }
  if (!dailyDate || stats.lastPlayed === dailyDate) return;
  const yesterday = shiftEasternDate(dailyDate, -1);
  stats.streak = stats.lastPlayed === yesterday ? stats.streak + 1 : 1;
  stats.lastPlayed = dailyDate;
}

export function saveDailyProgress(date: string, questions: Question[], catches: Catch[]) {
  update((state) => {
    if (state.daily[date]?.completedAt) return;
    state.daily[date] = toSave(questions, catches, null);
  });
}

export function completeDaily(date: string, questions: Question[], catches: Catch[]) {
  update((state) => {
    if (state.daily[date]?.completedAt) return;
    state.daily[date] = toSave(questions, catches, Date.now());
    applyStats(state, catches, date);
  });
}

export function completePractice(date: string, questions: Question[], catches: Catch[]) {
  update((state) => {
    const previous = state.practice[date];
    state.practice[date] = toSave(questions, catches, Date.now());
    if (!previous?.completedAt) {
      applyStats(state, catches);
      return;
    }
    state.stats.bestDepth = Math.max(state.stats.bestDepth, totalDepth(catches));
  });
}

export function completeUnlimited(questions: Question[], catches: Catch[]) {
  update((state) => {
    state.unlimited.unshift(toSave(questions, catches, Date.now()));
    state.unlimited = state.unlimited.slice(0, 12);
    applyStats(state, catches);
  });
}

export function updateSettings(patch: Partial<Settings>) {
  update((state) => {
    const character = patch.character === undefined
      ? state.settings.character
      : patch.character.trim().slice(0, 24) || 'Player';
    state.settings = {
      sound: patch.sound ?? state.settings.sound,
      colorblind: patch.colorblind ?? state.settings.colorblind,
      character,
    };
  });
}

export function sameSheet(save: DiveSave | undefined, questions: Question[]): boolean {
  if (!save) return false;
  return save.questionIds.join('|') === questions.map((question) => question.id).join('|');
}
