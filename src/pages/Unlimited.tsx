import { useState } from 'react';
import { getRandomQuestions } from '../data/mockQuestions';
import type { Catch, Question } from '../types/game';
import { DiveBoard } from '../components/DiveBoard';
import { ResultScreen } from '../components/ResultScreen';
import { completeUnlimited } from '../utils/storage';

export function Unlimited() {
  const [session, setSession] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(() => getRandomQuestions(7));
  const [result, setResult] = useState<Catch[] | null>(null);

  if (result) {
    return (
      <ResultScreen
        mode="unlimited"
        catches={result}
        onAgain={() => {
          setQuestions(getRandomQuestions(7));
          setResult(null);
          setSession((value) => value + 1);
        }}
        onRetry={() => {
          setResult(null);
          setSession((value) => value + 1);
        }}
      />
    );
  }

  return (
    <DiveBoard
      key={session}
      mode="unlimited"
      questions={questions}
      onComplete={(catches) => {
        completeUnlimited(questions, catches);
        setResult(catches);
      }}
    />
  );
}
