import { useEffect, useState } from "react";
import type { Catch } from "../types/game";
import { AnswerReview } from "./AnswerReview";
import { formatCountdown, nextEasternMidnight } from "../utils/date";
import { navigate } from "../utils/nav";
import { formatResult, totalPoints } from "../utils/scoring";
import { useSave } from "../utils/storage";

interface ResultScreenProps {
  mode: "daily" | "unlimited" | "practice";
  date?: string;
  catches: Catch[];
  onAgain?: () => void;
  onRetry?: () => void;
}

const HEADING = {
  daily: "Daily game complete",
  unlimited: "Unlimited game complete",
  practice: "Practice complete",
} as const;

export function ResultScreen({
  mode,
  date,
  catches,
  onAgain,
  onRetry,
}: ResultScreenProps) {
  const save = useSave();
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const points = totalPoints(catches);
  const midnight = nextEasternMidnight(new Date(now));

  useEffect(() => {
    if (mode !== "daily") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  const copy = async () => {
    const heading = date ? `${HEADING[mode]} · ${date}` : HEADING[mode];
    const text = formatResult(heading, catches);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      ok = document.execCommand("copy");
      area.remove();
    }
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="game-over">
      <p className="game-mode-badge">{HEADING[mode]}</p>
      <h1 className="results-title">
        Nice thinking<span className="brand-dot">.</span>
      </h1>
      <div className="result-score">
        {points}
        <span>points</span>
        <span className="result-star" aria-hidden="true">
          ✳
        </span>
      </div>
      <p className="game-subtitle">
        {catches.filter((entry) => entry.kind === "catch").length} of{" "}
        {catches.length} answers found{date ? ` · ${date}` : ""}
      </p>
      <p className="input-hint">Played by {save.settings.character}</p>

      <dl className="logbook">
        <div>
          <dt>Streak</dt>
          <dd>{save.stats.streak}</dd>
        </div>
        <div>
          <dt>Games</dt>
          <dd>{save.stats.totalGames}</dd>
        </div>
        <div>
          <dt>Average</dt>
          <dd>{Math.round(save.stats.averageDepth / 10)} pts</dd>
        </div>
        <div>
          <dt>Best</dt>
          <dd>{save.stats.bestDepth / 10} pts</dd>
        </div>
      </dl>

      {mode === "daily" ? (
        <p className="countdown">
          Next daily game in {formatCountdown(midnight, now)}
        </p>
      ) : null}

      <div className="action-row">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => void copy()}
        >
          {copied ? "Copied" : "Copy result"}
        </button>
        {onAgain ? (
          <button className="btn btn-primary" type="button" onClick={onAgain}>
            New game
          </button>
        ) : null}
        {onRetry ? (
          <button className="btn btn-ghost" type="button" onClick={onRetry}>
            Retry same sheet
          </button>
        ) : null}
        {mode === "daily" ? (
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate("/unlimited")}
          >
            Play unlimited
          </button>
        ) : null}
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => navigate("/archive")}
        >
          Archive
        </button>
      </div>
      <AnswerReview catches={catches} />
    </section>
  );
}
