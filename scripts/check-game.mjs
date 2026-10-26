import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

// Compile application modules without opening a listening socket.
const storageValues = new Map();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  writable: true,
  value: {
    getItem: (key) => storageValues.get(key) ?? null,
    setItem: (key, value) => storageValues.set(key, value),
  },
});
const vite = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: "custom",
});
try {
  const { QUESTION_BANK } = await vite.ssrLoadModule(
    "/src/data/mockQuestions.ts",
  );
  const { AnswerReview } = await vite.ssrLoadModule(
    "/src/components/AnswerReview.tsx",
  );
  const { DiveBoard } = await vite.ssrLoadModule(
    "/src/components/DiveBoard.tsx",
  );
  const { ResultScreen } = await vite.ssrLoadModule(
    "/src/components/ResultScreen.tsx",
  );
  const { NotebookJourney } = await vite.ssrLoadModule(
    "/src/components/NotebookJourney.tsx",
  );
  const { journeyAt, JOURNEY_STOPS } = await vite.ssrLoadModule(
    "/src/utils/journey.ts",
  );
  const { matchAnswer, formatResult } = await vite.ssrLoadModule(
    "/src/utils/scoring.ts",
  );
  const render = (Component, props) =>
    renderToStaticMarkup(createElement(Component, props));
  const escape = (text) =>
    text
      .replaceAll("&", "&amp;")
      .replaceAll("'", "&#x27;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  const entryFor = (question, answer = question.answers[0]) => ({
    questionId: question.id,
    prompt: question.prompt,
    category: question.category,
    submitted: answer.text,
    matchedText: answer.text,
    points: answer.points,
    depth: answer.depth,
    tier: answer.tier,
    kind: "catch",
  });

  for (const question of QUESTION_BANK) {
    const entry = entryFor(question);
    const html = render(AnswerReview, { catches: [entry] });
    for (const answer of question.answers) {
      assert.ok(
        html.includes(escape(answer.text)),
        `${question.id}: missing answer ${answer.text}`,
      );
      assert.equal(
        matchAnswer(answer.text, question.answers)?.text,
        answer.text,
      );
    }
    assert.equal((html.match(/<li /g) ?? []).length, question.answers.length);
    assert.ok(
      html.includes("✓ you"),
      `${question.id}: selected answer missing`,
    );
    const top = Math.max(...question.answers.map((answer) => answer.points));
    assert.ok(
      html.includes(top === 100 ? "Oddword pick" : "Top available pick"),
    );
    const sorted = [...question.answers].sort(
      (a, b) => b.points - a.points || a.text.localeCompare(b.text),
    );
    const list = html.slice(html.indexOf("<ul"));
    assert.ok(
      list.indexOf(escape(sorted[0].text)) <
        list.indexOf(escape(sorted.at(-1).text)),
    );
  }

  const questions = QUESTION_BANK.slice(0, 7);
  const catches = questions.map((question) => entryFor(question));
  catches[1] = {
    ...catches[1],
    submitted: null,
    matchedText: null,
    tier: null,
    points: 0,
    depth: 0,
    kind: "timeout",
  };
  catches[2] = {
    ...catches[2],
    submitted: null,
    matchedText: null,
    tier: null,
    points: 0,
    depth: 0,
    kind: "miss",
  };

  // The world moves in proportion to earned points, including partial milestones.
  assert.equal(journeyAt(75).offset, journeyAt(25).offset * 3);
  assert.equal(journeyAt(99).next.points, 100);
  for (const stop of JOURNEY_STOPS) {
    assert.equal(journeyAt(stop.points).stop.name, stop.name);
    if (stop.points > 0) {
      assert.notEqual(journeyAt(stop.points - 1).stop.name, stop.name);
    }
    const scene = render(NotebookJourney, { points: stop.points, finished: true });
    assert.ok(scene.includes(`aria-valuenow="${stop.points}"`));
    assert.ok(scene.includes(escape(stop.note)));
  }
  assert.equal(journeyAt(700).next, null);
  assert.equal(journeyAt(900).score, 700);
  assert.equal(journeyAt(-10).score, 0);
  assert.equal(journeyAt(NaN).score, 0);

  const review = render(AnswerReview, { catches });
  assert.ok(review.includes("Time ran out"));
  assert.ok(review.includes("Skipped"));
  assert.equal((review.match(/class="review-question"/g) ?? []).length, 7);
  assert.ok(
    render(AnswerReview, {
      catches: [{ ...catches[0], questionId: "retired" }],
    }).includes("no longer available"),
  );

  for (const mode of ["daily", "unlimited", "practice"]) {
    const intro = render(DiveBoard, { mode, questions, onComplete() {} });
    assert.ok(
      !intro.includes("answer-review"),
      `${mode}: answers leaked before completion`,
    );
    const result = render(ResultScreen, { mode, catches });
    const earned = catches.reduce((sum, entry) => sum + entry.points, 0);
    assert.ok(result.includes(`aria-valuenow="${earned}"`), `${mode}: final journey score`);
    const resumed = render(DiveBoard, {
      mode, questions, initialCatches: catches.slice(0, 3), onComplete() {},
    });
    assert.ok(
      resumed.includes(`aria-valuenow="${catches[0].points}"`),
      `${mode}: resumed journey must count points and ignore skips/timeouts`,
    );
    assert.ok(!resumed.includes("answer-review"));
    assert.ok(result.includes("The ones you could’ve picked."));
    assert.equal((result.match(/class="review-question"/g) ?? []).length, 7);
  }
  assert.ok(
    formatResult("Daily game complete", catches).startsWith("Oddword ·"),
  );

  // Existing players keep their saved results and settings after the brand changes.
  const legacy = {
    daily: {
      "2026-10-25": {
        questionIds: questions.map((q) => q.id),
        catches,
        points: 123,
        depth: 1230,
        completedAt: 1,
      },
    },
    settings: { sound: false, character: "Returning player" },
  };
  const values = new Map([["krillion-clone-v1", JSON.stringify(legacy)]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  // Reload just this module to give its store a fresh initialization.
  vite.moduleGraph.invalidateAll();
  const storage = await vite.ssrLoadModule("/src/utils/storage.ts");
  assert.equal(storage.getSnapshot().daily["2026-10-25"].points, 123);
  assert.equal(storage.getSnapshot().settings.character, "Returning player");
  storage.updateSettings({ colorblind: true });
  assert.equal(
    JSON.parse(values.get("oddword-v1")).daily["2026-10-25"].points,
    123,
  );
  assert.ok(values.has("krillion-clone-v1"));
  console.log(
    `Passed: ${QUESTION_BANK.length} answer lists, ranking, selected answers, skips, timeouts, missing prompts, all three result modes, pre-game answer hiding, share branding, legacy save migration, journey milestones, proportional movement, resumed scores, and final expeditions.`,
  );
} finally {
  await vite.close();
}
