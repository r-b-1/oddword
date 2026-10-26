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
            your answer, the bigger your score.
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
        <div
          className="word-art"
          aria-label="Example: name a shade of blue. Navy earns 24 points. Zaffre earns 100 points."
        >
          <div className="art-orbit" />
          <span className="art-spark spark-one" aria-hidden="true">
            ✳
          </span>
          <div className="prompt-slip">
            <span>LET’S SAY THE PROMPT IS…</span>
            <p>
              A shade
              <br />
              of blue.
            </p>
            <span className="slip-rule">THINK A LITTLE SIDEWAYS ↴</span>
          </div>
          <div className="word-ticket common-ticket">
            <div>
              <span>A GOOD ANSWER</span>
              <strong>Navy</strong>
            </div>
            <b>
              24<small>PTS</small>
            </b>
          </div>
          <div className="word-ticket rare-ticket">
            <div>
              <span>AN ODDWORD ANSWER</span>
              <strong>
                Zaffre
                <span className="ticket-star" aria-hidden="true">
                  ✳
                </span>
              </strong>
            </div>
            <b>
              100<small>PTS</small>
            </b>
          </div>
          <p className="art-caption">You had that tucked away somewhere.</p>
        </div>
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
            Meet the ones you missed.
            <small>Every answer, revealed at the end.</small>
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
