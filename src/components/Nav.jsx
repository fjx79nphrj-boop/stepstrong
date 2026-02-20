import { P, t } from "../config/index.js";
import { css } from "../styles/css.js";

const items = [
  { id: "home", ico: "\u2299" },
  { id: "timeline", ico: "\u2501" },
  { id: "patterns", ico: "\u25EB" },
  { id: "perspective", ico: "\u25C7" },
  { id: "partner", ico: "\u2661" },
  { id: "benchmark", ico: "\u25B3" },
];

export default function Nav({ view, go }) {
  return (
    <nav style={css.nav} aria-label="Main navigation">
      {items.map(i => {
        const label = t("nav." + i.id);
        return (
          <button key={i.id} onClick={() => go(i.id)} aria-current={view === i.id ? "page" : undefined} aria-label={label} style={{ ...css.navBtn, color: view === i.id ? P.warm : P.dim, borderBottom: view === i.id ? `2px solid ${P.warm}` : "2px solid transparent" }}>
            <span style={{ fontSize: 15 }} aria-hidden="true">{i.ico}</span>
            <span style={{ fontSize: 10 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
