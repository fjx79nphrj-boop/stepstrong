import { DAILY_QUOTES, P, t } from "../config/index.js";
import { daysAgo } from "../utils/helpers.js";
import { css } from "../styles/css.js";
import Btn from "./ui/Btn.jsx";
import Stat from "./ui/Stat.jsx";
import SectionTitle from "./ui/SectionTitle.jsx";
import EntryRow from "./ui/EntryRow.jsx";

export default function Home({ entries, profile, snaps, tier, openEntry, openSnap, openCard }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayN = entries.filter(e => e.date.slice(0, 10) === today).length;
  const week = entries.filter(e => daysAgo(e.date) <= 7);
  const weekPos = week.filter(e => e.response === "positive" || e.response === "neutral").length;
  const days = profile?.startDate ? daysAgo(profile.startDate) : 0;
  const lastSnap = snaps.length ? snaps[snaps.length - 1] : null;
  const snapDue = !lastSnap || daysAgo(lastSnap.date) >= 28;

  const dayNum = Math.floor(Date.now() / 86400000);
  const dailyQuote = DAILY_QUOTES[dayNum % DAILY_QUOTES.length];

  return (
    <div>
      {/* Daily quote */}
      <div style={{ ...css.card, padding: 20, marginBottom: 12, borderLeft: `3px solid ${P.warm}44`, background: `linear-gradient(135deg, ${P.card} 0%, #1a1520 100%)` }}>
        <p style={{ color: P.text, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>"{dailyQuote.q}"</p>
        <p style={{ color: P.warm, fontSize: 11, margin: "10px 0 0", opacity: 0.8 }}>&mdash; {dailyQuote.who}</p>
      </div>

      {/* CTA card */}
      <div style={{ ...css.card, background: `linear-gradient(135deg, ${P.card} 0%, ${P.card2} 100%)`, padding: 24, marginBottom: 12 }}>
        <p style={{ color: P.muted, margin: "0 0 14px", fontSize: 15 }}>
          {todayN === 0 ? t("home.how_did_it_go") : t("home.logged_today", { count: todayN, s: todayN > 1 ? "s" : "" })}
        </p>
        <Btn onClick={() => openEntry()}>{t("home.log_interaction")}</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Stat n={days} l={t("home.days_tracking")} />
        <Stat n={entries.length} l={t("home.total_logged")} />
        <Stat n={week.length > 0 ? Math.round((weekPos / week.length) * 100) + "%" : "\u2014"} l={t("home.positive_this_wk")} />
      </div>

      {/* Snapshot prompt */}
      {tier === "premium" && snapDue && (
        <button onClick={openSnap} style={css.prompt}>
          <span style={{ fontSize: 16 }}>{"\uD83D\uDCCA"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: P.text, fontSize: 14, fontWeight: 500 }}>{t("home.monthly_checkin")} {lastSnap ? t("home.monthly_checkin_due") : t("home.monthly_checkin_available")}</div>
            <div style={{ color: P.dim, fontSize: 12, marginTop: 2 }}>
              {lastSnap ? t("home.last_snapshot_days_ago", { days: daysAgo(lastSnap.date) }) : t("home.first_snapshot")} {t("home.compare_over_time")}
            </div>
          </div>
        </button>
      )}

      {/* Perspective shortcut */}
      <button onClick={openCard} style={{ ...css.prompt, borderColor: P.border2, background: `linear-gradient(135deg, ${P.card} 0%, #1a1520 100%)` }}>
        <span style={{ fontSize: 16 }}>{"\u25C7"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: P.text, fontSize: 14, fontWeight: 500 }}>{t("home.perspective_shift")}</div>
          <div style={{ color: P.dim, fontSize: 12, marginTop: 2 }}>{t("home.perspective_sub")}</div>
        </div>
        <span style={{ color: P.warm, fontSize: 18, alignSelf: "center" }}>{"\u203A"}</span>
      </button>

      {/* Recent */}
      {entries.length > 0 && <SectionTitle>{t("home.recent")}</SectionTitle>}
      {entries.slice(0, 5).map(e => <EntryRow key={e.id} entry={e} onClick={() => openEntry(e)} />)}
    </div>
  );
}
