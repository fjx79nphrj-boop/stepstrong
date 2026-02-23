import { useState } from "react";
import { CARDS, P, t } from "../config/index.js";
import { css } from "../styles/css.js";

export default function Perspective({ entries, tier, openCard }) {
  const [viewedToday, setViewedToday] = useState(0);
  const dailyLimit = tier === "premium" ? 999 : 1;

  const handleOpen = (c) => {
    if (viewedToday >= dailyLimit) return;
    setViewedToday(v => v + 1);
    openCard(c);
  };

  return (
    <div>
      <p style={{ color: P.muted, fontSize: 14, marginBottom: 16 }}>
        {t("perspective.intro")}
      </p>
      {tier !== "premium" && (
        <div style={{ ...css.card, padding: 14, marginBottom: 12, borderLeft: `3px solid ${P.warm}44` }}>
          <p style={{ color: P.muted, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            {viewedToday >= dailyLimit
              ? t("perspective.free_limit_reached")
              : t("perspective.free_remaining", { count: dailyLimit - viewedToday, total: CARDS.length })}
          </p>
        </div>
      )}
      {CARDS.map((c, i) => (
        <button key={i} onClick={() => handleOpen(c)} disabled={tier !== "premium" && viewedToday >= dailyLimit} style={{ ...css.card, padding: 16, marginBottom: 8, width: "100%", textAlign: "left", cursor: tier !== "premium" && viewedToday >= dailyLimit ? "default" : "pointer", border: `1px solid ${P.border}`, fontFamily: "inherit", opacity: tier !== "premium" && viewedToday >= dailyLimit ? 0.5 : 1 }}>
          <div style={{ color: P.text, fontWeight: 500, marginBottom: 4, fontSize: 14 }}>{c.title}</div>
          <div style={{ color: P.dim, fontSize: 13, lineHeight: 1.5 }}>{c.body.slice(0, 110)}&hellip;</div>
          {c.quote && <div style={{ color: P.warm, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>{t("perspective.includes_account")}</div>}
        </button>
      ))}
    </div>
  );
}
