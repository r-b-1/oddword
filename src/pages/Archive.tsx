import { useMemo, useState } from "react";
import { getDailyQuestions } from "../data/mockQuestions";
import type { DiveSave } from "../types/game";
import { AnswerReview } from "../components/AnswerReview";
import { isIsoDate, recentEasternDates } from "../utils/date";
import { navigate } from "../utils/nav";
import { useSave } from "../utils/storage";
import { useEasternToday } from "../hooks/useToday";

export function Archive() {
  const save = useSave();
  const today = useEasternToday();
  const [selectedRun, setSelectedRun] = useState<DiveSave | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const dates = useMemo(() => {
    const extra = Object.keys(save.daily).filter(isIsoDate);
    return Array.from(new Set([...recentEasternDates(21), ...extra]))
      .sort()
      .reverse();
  }, [save.daily]);

  if (selectedRun)
    return (
      <div className="archive-container">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => setSelectedRun(null)}
        >
          Back to archive
        </button>
        <h1 className="game-title archive-heading">Unlimited game</h1>
        <CatchLog record={selectedRun} />
      </div>
    );

  if (selected) {
    const daily = save.daily[selected];
    const practice = save.practice[selected];
    const record = daily?.completedAt
      ? daily
      : practice?.completedAt
        ? practice
        : null;
    const prompts = getDailyQuestions(selected);
    return (
      <div className="archive-container">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => setSelected(null)}
        >
          Back to archive
        </button>
        <h1 className="game-title archive-heading">{selected}</h1>
        {record ? (
          <CatchLog record={record} />
        ) : (
          <p className="menu-status">
            No finished game is stored for this day.
          </p>
        )}
        {selected === today && !daily?.completedAt ? (
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate("/daily")}
          >
            {daily?.catches.length
              ? "Resume today’s game"
              : "Play today’s game"}
          </button>
        ) : (
          <>
            {!record ? (
              <ol className="prompt-list">
                {prompts.map((question) => (
                  <li key={question.id}>{question.prompt}</li>
                ))}
              </ol>
            ) : null}
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate(`/practice/${selected}`)}
            >
              Practice this sheet
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="archive-container">
      <h1 className="menu-title archive-title">Archive</h1>
      <p className="menu-subtitle">
        The last three weeks, plus any game you have finished.
      </p>
      <div className="archive-list">
        {dates.map((date) => {
          const daily = save.daily[date];
          const practice = save.practice[date];
          const finished = daily?.completedAt ? daily : null;
          let label = "Not played";
          if (finished) label = `${finished.points} pts`;
          else if (date === today && daily?.catches.length)
            label = "In progress";
          else if (practice?.completedAt)
            label = `Practice ${practice.points} pts`;

          return (
            <button
              key={date}
              className="archive-item"
              type="button"
              onClick={() => setSelected(date)}
            >
              <span className="archive-date">
                {date}
                {date === today ? " · today" : ""}
              </span>
              <span className="archive-progress">{label}</span>
            </button>
          );
        })}
      </div>

      <h2 className="section-heading">Recent unlimited games</h2>
      {save.unlimited.length === 0 ? (
        <p className="menu-status">
          Unlimited games you finish will collect here.
        </p>
      ) : (
        <div className="archive-list">
          {save.unlimited.map((run, index) => (
            <button
              key={`${run.completedAt ?? index}`}
              className="archive-item"
              type="button"
              onClick={() => setSelectedRun(run)}
            >
              <span className="archive-date">
                {run.completedAt
                  ? new Date(run.completedAt).toLocaleString()
                  : "Game"}
              </span>
              <span className="archive-progress">{run.points} pts ↗</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CatchLog({ record }: { record: DiveSave }) {
  return (
    <>
      <p className="archive-score">{record.points} points</p>
      <AnswerReview catches={record.catches} />
    </>
  );
}
