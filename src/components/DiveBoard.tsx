import type { Catch, Question } from "../types/game";
import { TIER_CONFIG } from "../types/game";
import { useDive } from "../hooks/useDive";
import { normalizeAnswer } from "../utils/scoring";
import { DepthMeter } from "./DepthMeter";
import { Timer } from "./Timer";
import { QuestionCard } from "./QuestionCard";
import { AnswerInput } from "./AnswerInput";

interface DiveBoardProps {
  mode: "daily" | "unlimited" | "practice";
  dateLabel?: string;
  questions: Question[];
  initialCatches?: Catch[];
  onComplete: (catches: Catch[]) => void;
  onProgress?: (catches: Catch[]) => void;
}

const MODE_LABEL = {
  daily: "Daily game",
  unlimited: "Unlimited",
  practice: "Practice",
} as const;

export function DiveBoard({
  mode,
  dateLabel,
  questions,
  initialCatches,
  onComplete,
  onProgress,
}: DiveBoardProps) {
  const dive = useDive({ questions, initialCatches, onComplete, onProgress });

  if (questions.length === 0 || !dive.question) {
    return <p className="empty-note">This sheet has no prompts.</p>;
  }

  if (dive.phase === "intro") {
    return (
      <section className="intro-panel">
        <p className="game-mode-badge">{MODE_LABEL[mode]}</p>
        <h1 className="game-title">Let’s play</h1>
        {dateLabel ? <p className="game-subtitle">{dateLabel}</p> : null}
        <p>
          Seven prompts. Three seconds to read each one, then twenty seconds to
          answer. If a guess isn’t on the list, try another while the clock
          runs. Rarer answers earn more points. See every accepted answer when
          you finish.
        </p>
        <button className="btn btn-primary" type="button" onClick={dive.begin}>
          Let’s play
        </button>
      </section>
    );
  }

  const verdict = dive.currentCatch;
  const tier = verdict?.tier ? TIER_CONFIG[verdict.tier] : null;
  const showTyped =
    verdict?.kind === "catch" &&
    verdict.submitted &&
    verdict.matchedText &&
    normalizeAnswer(verdict.submitted) !== normalizeAnswer(verdict.matchedText);

  return (
    <div className="game-container">
      <div className="game-header">
        <p className="game-mode-badge">{MODE_LABEL[mode]}</p>
        <h1 className="game-title">
          Prompt {dive.index + 1} of {questions.length}
        </h1>
        {dateLabel ? (
          <p className="game-subtitle">{dateLabel}</p>
        ) : (
          <p className="game-subtitle">A fresh sheet of seven</p>
        )}
      </div>

      <div className="pips" aria-hidden="true">
        {questions.map((question, pip) => {
          const state =
            pip < dive.catches.length
              ? "done"
              : pip === dive.index
                ? "now"
                : "";
          return <span key={question.id} className={`pip ${state}`} />;
        })}
      </div>

      <DepthMeter depth={dive.depth} />

      {dive.phase === "preview" || dive.phase === "answering" ? (
        <Timer
          seconds={dive.secondsLeft}
          label={dive.phase === "preview" ? "Preview" : "Time"}
          warning={dive.phase === "answering" && dive.secondsLeft <= 5}
        />
      ) : null}

      <QuestionCard
        question={dive.question}
        index={dive.index}
        total={questions.length}
      />

      {dive.phase === "preview" ? (
        <div className="phase-note">
          <p>A moment to think. Make it an unexpected one.</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={dive.skipPreview}
          >
            Start answering
          </button>
        </div>
      ) : null}

      {dive.phase === "answering" ? (
        <>
          <AnswerInput
            value={dive.draft}
            onChange={dive.changeDraft}
            onSubmit={dive.submit}
            status={dive.feedback ? "incorrect" : "idle"}
          />
          {dive.feedback === "nothing" ? (
            <div className="answer-result incorrect" role="status">
              Not on this game’s list. Try another.
            </div>
          ) : null}
          <button
            className="btn btn-ghost btn-full"
            type="button"
            onClick={dive.skip}
          >
            Skip this prompt
          </button>
        </>
      ) : null}

      {dive.phase === "verdict" && verdict ? (
        <div
          className={`verdict ${verdict.kind === "catch" ? "correct" : "incorrect"}`}
          role="status"
        >
          {verdict.kind === "catch" && tier ? (
            <>
              <p className={`verdict-kicker tier-${verdict.tier}`}>
                {tier.emoji} {tier.name}
              </p>
              <p className="verdict-answer">{verdict.matchedText}</p>
              {showTyped ? (
                <p className="input-hint">You entered “{verdict.submitted}”</p>
              ) : null}
              <p className="verdict-score">+{verdict.points} points</p>
              <p className="input-hint">{tier.description}</p>
            </>
          ) : (
            <>
              <p className="verdict-kicker">
                {verdict.kind === "timeout"
                  ? "The clock beat you to it"
                  : "Skipped"}
              </p>
              <p className="verdict-score">0 pts</p>
            </>
          )}
          <button
            className="btn btn-primary btn-full"
            type="button"
            onClick={dive.descend}
          >
            {dive.isLast ? "See results & answers" : "Next prompt"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
