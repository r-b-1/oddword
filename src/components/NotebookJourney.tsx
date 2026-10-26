import { memo, useId, useState } from "react";
import { JOURNEY_STOPS, journeyAt } from "../utils/journey";
import "./notebook.css";

function PaperPeak({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-85 72 -58 14 -23 -6 5 -78 33 -41 62 18 98 73Z" fill="#e7e1ce" />
      <path d="M-85 72 -23 -6 5 -78 0 35Z" fill="#faf6e9" />
      <path d="m5-78 28 37-33 76 62-17 36 55H-85l85-38Z" fill="#d6d0bf" />
      <path d="m-23-6 23 41 33-76M0 35l98 38M0 35l-58-21M5-78 0 35l-23 38" fill="none" stroke="#b3af9e" strokeWidth="1" />
      <path d="M-85 72 -58 14 -23 -6 5 -78 33 -41 62 18 98 73" fill="none" />
      <path d="m-45 63 13-13m-3 15 13-12m-4 15 12-10" opacity=".4" />
    </g>
  );
}

function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-64 20C-85 2-66-25-42-18-49-51 5-62 19-31 50-49 72-17 56 0 90 11 62 35 42 28L-49 31Z" fill="#fcf9ef" />
      <path d="m-54 38 72-2m-51 9 66-2" opacity=".3" />
    </g>
  );
}

function Star({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="m0-20 6 14 16 2-12 11 3 16-14-8-14 7 3-16-11-12 17-1Z" fill="#eebc5d" />;
}

const Landscape = memo(function Landscape() {
  return (
    <g stroke="#5a5b4c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M62 375q76-37 142-10t210-8" fill="none" />
      <PaperPeak x={360} y={320} scale={0.9} />
      <PaperPeak x={105} y={352} scale={0.5} />
      <g transform="translate(102 225) rotate(-9)">
        <path d="m0 0 12-4 31 80-5 16-12-10Z" fill="#efb75f" />
        <path d="m26 82 12 10 5-16M4 3l28 77M9 1l28 77" fill="none" />
        <path d="m34 89 4 3-1-6" fill="#5a5b4c" />
      </g>
      <path d="M342-5q-20-31 0-44 22 11 0 44v75m0-38q-44 2-33-28 28-2 33 28m0 19q37 0 31-25-27-1-31 25" fill="#c5cf9c" />
      <g transform="translate(115 -86)">
        <path d="M-8 55-5 12h16l5 43" fill="#efe8d7" />
        <path d="M-37 12q35-69 72 0Z" fill="#eeb28d" />
        <path d="m-34 60 74-3" fill="none" />
        <circle cx="-9" cy="-3" r="5" fill="#faf6e9" /><circle cx="13" cy="1" r="4" fill="#faf6e9" />
      </g>
      <PaperPeak x={105} y={-337} scale={0.8} />
      <PaperPeak x={365} y={-300} scale={1.1} />
      <path d="m369-386-2-45 39 9-38 13" fill="#e7956d" />
      <Cloud x={112} y={-610} scale={0.8} />
      <Cloud x={367} y={-665} scale={1.1} />
      <path d="m88-729 13-9 14 8m204 185 14-10 15 8" fill="none" />
      <g transform="translate(340 -970) rotate(9)">
        <path d="M-43 0q0-83 43-83T43 0L13 41h-27Z" fill="#eab483" />
        <path d="M0-83q-36 35-14 124M0-83q34 38 13 124M-38 7h76M-14 41l2 21h24l1-21" fill="none" />
        <path d="m-13 61 26 1-3 20h-20Z" fill="#d9cda8" />
      </g>
      <Cloud x={105} y={-907} scale={0.7} />
      <g transform="translate(112 -1270) rotate(-16)">
        <path d="M24-64C-74-51-68 53 13 61 39 62 59 44 65 25-8 55-40-23 24-64Z" fill="#eac978" />
        <path d="m-22-8 3 6m2 24q8 10 16 2" fill="none" />
      </g>
      <Star x={357} y={-1225} /><Star x={312} y={-1350} scale={0.5} />
      <Star x={105} y={-1560} scale={1.3} /><Star x={362} y={-1600} scale={0.8} />
      <Star x={320} y={-1480} scale={0.5} />
      <path d="m110-1650 47-36 33 20 55-48 30 19" fill="none" strokeDasharray="3 6" />
      {[ [110, -1650], [157, -1686], [190, -1666], [245, -1714], [275, -1695] ].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="#eac978" />)}
      <g transform="translate(240 -1900)">
        <path d="m-58 20-14-51 37 24 34-43 31 43 40-25-14 53Z" fill="#eac978" />
        <path d="m-55 28 109-1M-24 6l5 4M19 5l5 3M-8 17q8 7 15-1" fill="none" />
      </g>
      <Star x={104} y={-1880} scale={0.6} /><Star x={370} y={-1935} />
      <g fill="none" opacity=".45">
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`m${i % 2 ? 395 : 80} ${180 - i * 100} 6-9m-9 3 12 3`} />
        ))}
      </g>
      {JOURNEY_STOPS.map((stop, i) => (
        <g key={stop.points} transform={`translate(51 ${240 - i * 300})`}>
          <path d="M0 0h16" opacity=".45" />
          <text x="20" y="5" className="journey-ruler-label" stroke="none">{stop.points}</text>
        </g>
      ))}
    </g>
  );
});

interface NotebookJourneyProps {
  points: number;
  gain?: number;
  turn?: number;
  finished?: boolean;
  demo?: boolean;
}

export const NotebookJourney = memo(function NotebookJourney({ points, gain = 0, turn = 0, finished = false, demo = false }: NotebookJourneyProps) {
  const id = useId();
  const { score, stop, next, offset } = journeyAt(points);
  return (
    <section className={`notebook-journey${demo ? " journey-demo" : ""}`} aria-label={demo ? "Example notebook journey" : "Your notebook journey"}>
      <div className="journey-heading">
        <span className="eyebrow">{demo ? "A little test flight" : "Your expedition"}</span>
        <span className="journey-score"><strong>{score}</strong> pts</span>
      </div>
      <div className="journey-window">
        <svg className="journey-scene" viewBox="0 0 480 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id={`${id}-rules`} width="480" height="30" patternUnits="userSpaceOnUse">
              <path d="M0 29.5H480" stroke="#9bb4c1" strokeOpacity=".32" strokeWidth="1" />
            </pattern>
          </defs>
          <g className="journey-world" style={{ transform: `translateY(${offset}px)` }}>
            <rect x="0" y="-2300" width="480" height="2900" fill={`url(#${id}-rules)`} />
            <path d="M49-2300V600M53-2300V600" stroke="#cb8b81" strokeOpacity=".4" />
            <path d="M240 410C155 280 318 210 240 80S155-120 240-250 320-480 240-620 160-840 240-980 320-1200 240-1340 160-1560 240-1700 300-1830 240-1950" fill="none" stroke="#8a8b77" strokeWidth="1.5" strokeDasharray="5 9" opacity=".5" />
            <Landscape />
          </g>
          <g className="journey-plane-position" style={{ transform: `translate(${Math.sin(score / 80) * 24}px, ${-Math.min(score, 100) * 0.3}px)` }}>
            <g key={`${turn}-${score}`} className={gain > 0 ? "journey-plane journey-launch" : "journey-plane"}>
              <g transform="translate(242 226) rotate(-14)" stroke="#4d5147" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
                <path d="m-65-24 132-21-69 91-10-45Z" fill="#faf6e9" strokeWidth="8" stroke="#faf6e9" />
                <path d="m-65-24 132-21-69 91-10-45Z" fill="#f2d09b" />
                <path d="m-65-24 132-21-79 46Z" fill="#f6ead1" />
                <path d="m-12 1 79-46-55 61-14 30Z" fill="#e68d5a" />
                <path d="m-12 1 24 15-14 30" fill="none" />
                <path d="m-27-15 1 5m14-9 1 5m-13 9q7 7 13-3" fill="none" />
                <path d="m-48 41-10 14m24-7-6 17m-18-32-15 7" fill="none" opacity=".65" />
              </g>
            </g>
          </g>
          {score === 0 ? <g className="journey-start-note"><text x="272" y="132" transform="rotate(5 272 132)">big ideas start here</text><path d="M320 143q16 30-17 40m5-10-5 10 13 1" fill="none" stroke="currentColor" strokeWidth="1.4" /></g> : null}
        </svg>
        <span className="journey-page-number" aria-hidden="true">field notes / {String(Math.floor(score / 100) + 1).padStart(2, "0")}</span>
        {gain > 0 ? <span key={`${turn}-${score}`} className="journey-gain">+{gain} · a little higher!</span> : null}
      </div>
      <div className="journey-caption" aria-live="polite" aria-atomic="true">
        <span className="journey-location">{stop.name}</span>
        <p>{finished ? stop.note : next ? `${next.points - score} pts to ${next.name}` : stop.note}</p>
      </div>
      <div className="journey-route" role="meter" aria-label="Notebook journey score" aria-valuemin={0} aria-valuemax={700} aria-valuenow={score} aria-valuetext={`${score} points, ${stop.name}`}>
        {JOURNEY_STOPS.map((landmark) => <span key={landmark.points} className={score >= landmark.points ? "reached" : ""} title={`${landmark.name} · ${landmark.points} pts`} />)}
      </div>
    </section>
  );
});

export function JourneyPreview() {
  const [points, setPoints] = useState(0);
  return (
    <div className="journey-preview">
      <NotebookJourney points={points} gain={points > 0 ? 100 : 0} demo />
      <button type="button" className="journey-demo-button" onClick={() => setPoints((value) => value >= 700 ? 0 : value + 100)}>
        {points >= 700 ? "↺ Back to the first scribble" : "Try a rare answer. +100 pts ↗"}
      </button>
      <p className="journey-demo-note">Just a doodle break. Your real adventure starts when you play.</p>
    </div>
  );
}
