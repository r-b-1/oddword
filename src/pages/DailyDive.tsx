import { useMemo } from 'react';
import { getDailyQuestions } from '../data/mockQuestions';
import { DiveBoard } from '../components/DiveBoard';
import { ResultScreen } from '../components/ResultScreen';
import { useEasternToday } from '../hooks/useToday';
import { completeDaily, sameSheet, saveDailyProgress, useSave } from '../utils/storage';

export function DailyDive() {
  const today = useEasternToday();
  const questions = useMemo(() => getDailyQuestions(today), [today]);
  const save = useSave();
  const record = save.daily[today];

  if (record?.completedAt) {
    return <ResultScreen mode="daily" date={today} catches={record.catches} />;
  }

  const initialCatches = record && !record.completedAt && sameSheet(record, questions) ? record.catches : [];

  return (
    <DiveBoard
      key={today}
      mode="daily"
      dateLabel={today}
      questions={questions}
      initialCatches={initialCatches}
      onProgress={(catches) => saveDailyProgress(today, questions, catches)}
      onComplete={(catches) => completeDaily(today, questions, catches)}
    />
  );
}
