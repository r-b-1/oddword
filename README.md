# Oddword

A daily trivia game for curious minds. Seven prompts, a three-second preview, and twenty seconds to find an answer. Rarer answers earn more points.

## Run

```sh
npm install
npm run dev
```

`npm run build` type-checks and bundles the app. `npm run lint` runs Oxlint. `npm test` checks answer reveals, score ranking, result modes, and legacy save migration.

## Play

- **Daily** (`/daily`): seven shared prompts, resetting at midnight US Eastern. One attempt per day, with saved progress.
- **Unlimited** (`/unlimited`): new random games or another attempt at the same sheet.
- **Archive** (`/archive`): past daily games and recent unlimited results. Replay a past date at `/practice/YYYY-MM-DD`.

After a completed game, the answer review lists every accepted answer for each prompt in descending score order. It marks your answer and highlights the 100-point **Oddword pick** (formerly the Krillion tier). Prompts without a 100-point answer show their actual **Top available pick**. The same review is available in completed archive entries. Answers stay hidden during play.

The answer bank is finite and scores are curated, not calculated from live player statistics. It does not claim to list every possible real-world answer.

## Design

Original warm-paper puzzle-club identity, orange accents, typographic word tickets, and an asterisk mark. Bricolage Grotesque and Manrope are loaded from Google Fonts, with sans-serif fallbacks. The design context is recorded in `.impeccable.md`.

## Code

- `src/data/mockQuestions.ts`: questions, accepted answers, aliases, and scores.
- `src/components/AnswerReview.tsx`: shared post-game and archive answer review.
- `src/hooks/useDive.ts`: game phases, timers, and answer handling.
- `src/utils/scoring.ts`: answer matching and share text.
- `src/utils/storage.ts`: local progress, settings, and stats.

Data is saved under `oddword-v1`. Existing `krillion-clone-v1` data is read as a fallback until the first new save. Internal legacy tier IDs and depth values remain compatible with older saved games; the UI displays points.
# oddword
