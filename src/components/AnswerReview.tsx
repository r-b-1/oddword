import type { Catch } from "../types/game";
import { QUESTION_BANK } from "../data/mockQuestions";

export function AnswerReview({ catches }: { catches: Catch[] }) {
  return (
    <section className="answer-review" aria-labelledby="review-title">
      <div className="review-heading">
        <div>
          <p className="eyebrow">The afterword</p>
          <h2 id="review-title">The ones you could’ve picked.</h2>
        </div>
        <span className="review-count">{catches.length} prompts, revealed</span>
      </div>
      <p className="review-note">
        Every accepted answer in this game’s list, from rarest to most familiar.
        Scores are curated, not based on player statistics.
      </p>
      <div className="review-list">
        {catches.map((entry, index) => {
          const question = QUESTION_BANK.find(
            (item) => item.id === entry.questionId,
          );
          const answers = [...(question?.answers ?? [])].sort(
            (a, b) => b.points - a.points || a.text.localeCompare(b.text),
          );
          const best = answers.filter(
            (answer) => answer.points === answers[0]?.points,
          );
          return (
            <article className="review-question" key={entry.questionId}>
              <div className="review-prompt">
                <span className="review-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="eyebrow">{entry.category}</span>
                  <h3>{entry.prompt}</h3>
                </div>
              </div>
              <div className="review-comparison">
                <div>
                  <span className="eyebrow">
                    Your answer · {entry.points} pts
                  </span>
                  <p>
                    {entry.matchedText ??
                      (entry.kind === "timeout"
                        ? "Time ran out"
                        : entry.submitted || "Skipped")}
                  </p>
                </div>
                {best.length > 0 && (
                  <div className="best-answer">
                    <span className="eyebrow">
                      ✳{" "}
                      {best[0].points === 100
                        ? "Oddword pick"
                        : "Top available pick"}{" "}
                      · {best[0].points} pts
                    </span>
                    <p>{best.map((answer) => answer.text).join(" / ")}</p>
                  </div>
                )}
              </div>
              {answers.length ? (
                <details className="answer-details" open>
                  <summary>
                    All {answers.length} accepted answers{" "}
                    <span aria-hidden="true">↗</span>
                  </summary>
                  <ul className="answer-options">
                    {answers.map((answer) => (
                      <li
                        key={answer.text}
                        className={`${answer.points === best[0].points ? "answer-top" : ""} ${answer.text === entry.matchedText ? "answer-yours" : ""}`}
                      >
                        <span>
                          {answer.text}
                          {answer.text === entry.matchedText && (
                            <small>✓ you</small>
                          )}
                        </span>
                        <strong>
                          {answer.points}
                          <span className="sr-only"> points</span>
                        </strong>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <p className="review-note">
                  The answer list for this saved prompt is no longer available.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
