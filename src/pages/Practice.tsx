import { useMemo, useState } from "react";
import { getDailyQuestions } from "../data/mockQuestions";
import type { Catch, Question } from "../types/game";
import { DiveBoard } from "../components/DiveBoard";
import { ResultScreen } from "../components/ResultScreen";
import { useEasternToday } from "../hooks/useToday";
import { isIsoDate } from "../utils/date";
import { navigate } from "../utils/nav";
import { completePractice, useSave } from "../utils/storage";

export function Practice({ date }: { date: string }) {
  const today = useEasternToday();
  const save = useSave();
  const questions = useMemo(
    () => (isIsoDate(date) ? getDailyQuestions(date) : []),
    [date],
  );
  const [session, setSession] = useState(0);
  const [result, setResult] = useState<Catch[] | null>(null);

  if (!isIsoDate(date)) {
    return (
      <section className="intro-panel">
        <h1 className="game-title">No game on that date</h1>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => navigate("/archive")}
        >
          Back to archive
        </button>
      </section>
    );
  }

  if (date === today && !save.daily[today]?.completedAt) {
    return (
      <section className="intro-panel">
        <h1 className="game-title">Today’s game is still open</h1>
        <p>
          Finish the daily sheet before practicing it. Your answer review
          unlocks when you finish.
        </p>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => navigate("/daily")}
        >
          Play today’s game
        </button>
      </section>
    );
  }

  if (result) {
    return (
      <ResultScreen
        mode="practice"
        date={date}
        catches={result}
        onRetry={() => {
          setResult(null);
          setSession((value) => value + 1);
        }}
      />
    );
  }

  return (
    <DiveBoard
      key={`${date}-${session}`}
      mode="practice"
      dateLabel={date}
      questions={questions}
      onComplete={(catches) => {
        completePractice(date, questions as Question[], catches);
        setResult(catches);
      }}
    />
  );
}
