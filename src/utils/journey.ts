export const JOURNEY_STOPS = [
  { points: 0, name: "The first scribble", note: "Every adventure starts in the margin." },
  { points: 100, name: "Doodle garden", note: "A little curiosity is taking root." },
  { points: 200, name: "Paper peaks", note: "Your ideas are getting some altitude." },
  { points: 300, name: "Cloud nine", note: "Head in the clouds. In a good way." },
  { points: 400, name: "The daydream", note: "Getting wonderfully carried away." },
  { points: 500, name: "Moon notes", note: "That’s some out-of-this-world thinking." },
  { points: 600, name: "Star territory", note: "There’s a whole universe in your head." },
  { points: 700, name: "Off the page", note: "Seven perfect picks. Quite the imagination." },
] as const;

export function journeyAt(points: number) {
  const score = Math.max(0, Math.min(700, Number.isFinite(points) ? points : 0));
  const index = Math.floor(score / 100);
  return {
    score,
    stop: JOURNEY_STOPS[index],
    next: JOURNEY_STOPS[index + 1] ?? null,
    // The landscape travels down as the plane climbs up the page.
    offset: score * 3,
  };
}
