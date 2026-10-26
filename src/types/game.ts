export interface Answer {
  text: string;
  aliases: string[];
  rarity: number; // 0-100, higher = rarer
  points: number; // calculated from rarity
  tier: Tier;
  depth: number; // points * 10 (meters)
}

export interface Question {
  id: string;
  prompt: string;
  category: string;
  answers: Answer[];
  source?: string;
}

export interface GameMode {
  id: 'daily' | 'unlimited' | 'archive';
  name: string;
  description: string;
}

export type Tier = 
  | 'plankton'      // 10 pts - common
  | 'krill'         // 20 pts
  | 'lanternfish'   // 30 pts
  | 'squid'         // 40 pts
  | 'anglerfish'    // 50 pts
  | 'giant_squid'   // 75 pts
  | 'krillion';     // 100 pts - one in a krillion

export interface TierConfig {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  emoji: string;
  description: string;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  plankton: {
    name: 'Familiar',
    minPoints: 10,
    maxPoints: 19,
    color: '#6b7280',
    emoji: '✳',
    description: 'Common knowledge'
  },
  krill: {
    name: 'Good thinking',
    minPoints: 20,
    maxPoints: 29,
    color: '#9ca3af',
    emoji: '✳',
    description: 'Known by many'
  },
  lanternfish: {
    name: 'Nice find',
    minPoints: 30,
    maxPoints: 39,
    color: '#fbbf24',
    emoji: '✳',
    description: 'A little less obvious'
  },
  squid: {
    name: 'Unexpected',
    minPoints: 40,
    maxPoints: 49,
    color: '#f59e0b',
    emoji: '✳',
    description: 'Thinking beyond the ordinary'
  },
  anglerfish: {
    name: 'Rare find',
    minPoints: 50,
    maxPoints: 74,
    color: '#ef4444',
    emoji: '✳',
    description: 'Rare territory'
  },
  giant_squid: {
    name: 'Hidden gem',
    minPoints: 75,
    maxPoints: 99,
    color: '#8b5cf6',
    emoji: '✳',
    description: 'Very rare'
  },
  krillion: {
    name: 'Oddword',
    minPoints: 100,
    maxPoints: 100,
    color: '#ec4899',
    emoji: '✳',
    description: 'The rarest pick'
  }
};

export function getTier(points: number): Tier {
  if (points >= 100) return 'krillion';
  if (points >= 75) return 'giant_squid';
  if (points >= 50) return 'anglerfish';
  if (points >= 40) return 'squid';
  if (points >= 30) return 'lanternfish';
  if (points >= 20) return 'krill';
  return 'plankton';
}

export function calculatePoints(rarity: number): number {
  // Rarity 0-100, higher = rarer
  // Map to points: 10-100
  return Math.round(10 + (rarity / 100) * 90);
}

export function calculateDepth(points: number): number {
  return points * 10;
}

export function formatDepth(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

export function depthZone(meters: number): { name: string; color: string } {
  if (meters >= 6000) return { name: 'Trench', color: '#ec4899' };
  if (meters >= 4500) return { name: 'Abyss', color: '#8b5cf6' };
  if (meters >= 3000) return { name: 'Midnight', color: '#ef4444' };
  if (meters >= 1500) return { name: 'Twilight', color: '#f59e0b' };
  return { name: 'Sunlight', color: '#7dd3fc' };
}

export interface Catch {
  questionId: string;
  prompt: string;
  category: string;
  submitted: string | null;
  matchedText: string | null;
  points: number;
  depth: number;
  tier: Tier | null;
  kind: 'catch' | 'miss' | 'timeout';
}

export interface DiveSave {
  questionIds: string[];
  catches: Catch[];
  depth: number;
  points: number;
  completedAt: number | null;
}

export interface PlayerStats {
  totalGames: number;
  totalDepth: number;
  bestDepth: number;
  averageDepth: number;
  tierCounts: Record<Tier, number>;
  streak: number;
  lastPlayed: string | null;
}

export interface Settings {
  sound: boolean;
  colorblind: boolean;
  character: string;
}

export interface PersistedState {
  daily: Record<string, DiveSave>;
  practice: Record<string, DiveSave>;
  unlimited: DiveSave[];
  stats: PlayerStats;
  settings: Settings;
}