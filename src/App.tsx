import { useEffect, useState } from "react";
import { Menu } from "./pages/Menu";
import { DailyDive } from "./pages/DailyDive";
import { Unlimited } from "./pages/Unlimited";
import { Archive } from "./pages/Archive";
import { Practice } from "./pages/Practice";
import { navigate, viewFor } from "./utils/nav";
import { updateSettings, useSave } from "./utils/storage";

function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  const save = useSave();
  const view = viewFor(path);

  useEffect(() => {
    const onNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ path: string }>).detail;
      if (detail?.path) setPath(detail.path);
    };
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("navigate", onNavigate);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("navigate", onNavigate);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "easy-read",
      save.settings.colorblind,
    );
  }, [save.settings.colorblind]);

  useEffect(() => {
    const titles = {
      menu: "Oddword",
      daily: "Daily game · Oddword",
      unlimited: "Unlimited · Oddword",
      archive: "Archive · Oddword",
      practice: "Practice · Oddword",
    } as const;
    document.title = titles[view.name];
  }, [view.name]);

  const nav = [
    { href: "/", name: "menu" as const, label: "Home" },
    { href: "/daily", name: "daily" as const, label: "Daily game" },
    { href: "/unlimited", name: "unlimited" as const, label: "Unlimited" },
    { href: "/archive", name: "archive" as const, label: "Archive" },
  ];
  const active = view.name === "practice" ? "archive" : view.name;

  return (
    <div className="relative">
      <header>
        <button className="logo" type="button" onClick={() => navigate("/")}>
          <span className="brand-mark" aria-hidden="true">
            ✳
          </span>{" "}
          oddword<span className="brand-dot">.</span>
        </button>
        <div className="header-actions">
          <nav aria-label="Main navigation">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={active === item.name ? "active" : ""}
                aria-current={active === item.name ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <details className="settings">
            <summary>Display</summary>
            <div className="settings-panel">
              <button
                className="btn btn-ghost btn-full"
                type="button"
                aria-pressed={save.settings.sound}
                onClick={() => updateSettings({ sound: !save.settings.sound })}
              >
                {save.settings.sound ? "Sound on" : "Muted"}
              </button>
              <button
                className="btn btn-ghost btn-full"
                type="button"
                aria-pressed={save.settings.colorblind}
                onClick={() =>
                  updateSettings({ colorblind: !save.settings.colorblind })
                }
              >
                {save.settings.colorblind ? "Easy read on" : "Easy read"}
              </button>
              <label className="call-sign-label">
                Player name
                <input
                  className="answer-input call-sign"
                  value={save.settings.character}
                  maxLength={24}
                  onChange={(event) =>
                    updateSettings({ character: event.target.value })
                  }
                />
              </label>
            </div>
          </details>
        </div>
      </header>

      <main>
        {view.name === "menu" && <Menu />}
        {view.name === "daily" && <DailyDive />}
        {view.name === "unlimited" && <Unlimited />}
        {view.name === "archive" && <Archive />}
        {view.name === "practice" && (
          <Practice key={view.date} date={view.date} />
        )}
      </main>

      <footer>
        <span className="footer-brand">oddword.</span>
        <span>A little curiosity goes a long way.</span>
        <span>Seven prompts. A fresh perspective.</span>
      </footer>
    </div>
  );
}

export default App;
