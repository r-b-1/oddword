const TZ = 'America/New_York';

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function parts(date: Date, timeZone = TZ): ZonedParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) map[part.type] = part.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function zoneOffsetMs(date: Date, timeZone = TZ): number {
  const zoned = parts(date, timeZone);
  const asUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return asUtc - date.getTime();
}

function zonedUtc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): number {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const first = utcGuess - zoneOffsetMs(new Date(utcGuess));
  return utcGuess - zoneOffsetMs(new Date(first));
}

export function easternDate(date = new Date()): string {
  const zoned = parts(date);
  const month = String(zoned.month).padStart(2, '0');
  const day = String(zoned.day).padStart(2, '0');
  return `${zoned.year}-${month}-${day}`;
}

export function nextEasternMidnight(now = new Date()): number {
  const zoned = parts(now);
  return zonedUtc(zoned.year, zoned.month, zoned.day + 1, 0, 0, 0);
}

export function shiftEasternDate(iso: string, deltaDays: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return easternDate(new Date(Date.UTC(year, month - 1, day + deltaDays, 16, 0, 0)));
}

export function recentEasternDates(count: number, from = new Date()): string[] {
  const today = easternDate(from);
  return Array.from({ length: count }, (_, index) => shiftEasternDate(today, -index));
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function formatCountdown(targetMs: number, now = Date.now()): string {
  const diff = Math.max(0, targetMs - now);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}
