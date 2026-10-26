import type { Question } from '../types/game';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
}

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  return (
    <div className="question-card">
      <div className="question-number">{index + 1} / {total}</div>
      <div className="category-badge">{question.category}</div>
      <h2 className="question-text">{question.prompt}</h2>
    </div>
  );
}
