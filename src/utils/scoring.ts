import type { Answer, Catch, Tier } from '../types/game';

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/c\+\+/g, 'cplusplus')
    .replace(/c#/g, 'csharp')
    .replace(/f#/g, 'fsharp')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(the|a|an) /, '');
}

function optionsFor(answer: Answer): string[] {
  return [answer.text, ...answer.aliases];
}

export function matchAnswer(userAnswer: string, validAnswers: Answer[]): Answer | null {
  const normalized = normalizeAnswer(userAnswer);
  if (!normalized) return null;

  for (const answer of validAnswers) {
    if (optionsFor(answer).some((option) => normalizeAnswer(option) === normalized)) return answer;
  }

  if (normalized.length < 5) return null;

  let best: { answer: Answer; distance: number } | null = null;
  let tied = false;

  for (const answer of validAnswers) {
    for (const option of optionsFor(answer)) {
      const candidate = normalizeAnswer(option);
      if (candidate.length < 5) continue;
      const distance = levenshteinDistance(normalized, candidate);
      if (distance > 1) continue;
      if (!best || distance < best.distance) {
        best = { answer, distance };
        tied = false;
      } else if (best.answer !== answer && distance === best.distance) {
        tied = true;
      }
    }
  }

  if (!best || tied) return null;
  return best.answer;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }

  return matrix[b.length][a.length];
}

export function calculateScore(matched: Answer | null): { points: number; depth: number; tier: Tier } {
  if (!matched) return { points: 0, depth: 0, tier: 'plankton' };
  return {
    points: matched.points,
    depth: matched.depth,
    tier: matched.tier,
  };
}

export function totalPoints(catches: Pick<Catch, 'points'>[]): number {
  return catches.reduce((sum, entry) => sum + entry.points, 0);
}

export function totalDepth(catches: Pick<Catch, 'depth'>[]): number {
  return catches.reduce((sum, entry) => sum + entry.depth, 0);
}

export function formatResult(heading: string, catches: Catch[]): string {
  const lines = catches.map((entry, index) => {
    const landed = entry.matchedText ?? (entry.kind === 'timeout' ? 'time out' : 'miss');
    return `${index + 1}. ${entry.prompt} — ${landed} (${entry.points})`;
  });
  return [`Oddword · ${heading}`, `${totalPoints(catches)} pts`, ...lines].join('\n');
}
