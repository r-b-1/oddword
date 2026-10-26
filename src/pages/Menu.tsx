import { JourneyPreview } from "../components/NotebookJourney";
import { navigate } from "../utils/nav";
import { useSave } from "../utils/storage";
import { useEasternToday } from "../hooks/useToday";

export function Menu() {
  const save = useSave();
  const today = useEasternToday();
  const playedToday = Boolean(save.daily[today]?.completedAt);
  const inProgress = Boolean(save.daily[today]?.catches.length);
  const date = new Date(`${today}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="menu-container">
      <div className="edition-line">
        <span>The daily game for curious minds</span>
        <span>{date}</span>
      </div>
      <section className="menu-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-star">✳</span> A little less obvious.
          </p>
          <h1>
            Good answers.
            <br />
            Great <span className="odd-word">odd ones.</span>
          </h1>
          <p className="hero-description">
            Seven prompts. Twenty seconds. Think past the obvious — the rarer
            your answer, the farther you fly. A whole world is hiding in the margins.
          </p>
          <div className="hero-action">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate("/daily")}
            >
              {playedToday
                ? "See today’s results"
                : inProgress
                  ? "Continue today’s game"
                  : "Play today’s game"}
              <span aria-hidden="true">↗</span>
            </button>
            <span className="play-note">
              Free to play.
              <br />A few minutes well spent.
            </span>
          </div>
          {playedToday && (
            <p className="menu-status">
              Today’s score: <strong>{save.daily[today].points} points.</strong>{" "}
              Another round? Try unlimited below.
            </p>
          )}
        </div>
        <JourneyPreview />
      </section>
      <section className="how-strip" aria-label="How to play">
        <div>
          <span>01</span>
          <p>
            Read the prompt.<small>You get a 3-second head start.</small>
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            Find your odd answer.<small>20 seconds. One accepted pick.</small>
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            See how far you fly.
            <small>New doodles along the way. Every answer at the end.</small>
          </p>
        </div>
      </section>
      <section className="more-play">
        <div className="section-intro">
          <p className="eyebrow">Keep your curiosity going</p>
          <h2>
            There’s more
            <br />
            where that came from.
          </h2>
        </div>
        <button
          className="mode-link"
          type="button"
          onClick={() => navigate("/unlimited")}
        >
          <span className="mode-icon" aria-hidden="true">
            ∞
          </span>
          <h3>Unlimited</h3>
          <p>
            Another seven. And another.
            <br />
            No need to wait for tomorrow.
          </p>
          <span className="text-link">
            Play a fresh game <span aria-hidden="true">↗</span>
          </span>
        </button>
        <button
          className="mode-link"
          type="button"
          onClick={() => navigate("/archive")}
        >
          <span className="mode-icon archive-icon" aria-hidden="true">
            ▤
          </span>
          <h3>The archive</h3>
          <p>
            Revisit past games.
            <br />
            Find something you didn’t know.
          </p>
          <span className="text-link">
            Explore past games <span aria-hidden="true">↗</span>
          </span>
        </button>
      </section>
      {save.stats.totalGames > 0 && (
        <dl className="logbook menu-stats">
          <div>
            <dt>Daily streak</dt>
            <dd>{save.stats.streak}</dd>
          </div>
          <div>
            <dt>Personal best</dt>
            <dd>
              {save.stats.bestDepth / 10} <small>pts</small>
            </dd>
          </div>
          <div>
            <dt>Games played</dt>
            <dd>{save.stats.totalGames}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
