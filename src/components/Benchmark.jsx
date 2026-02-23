import { BENCH, SNAP_Q, P, t } from "../config/index.js";
import { fmtDate, fmtShortYr } from "../utils/helpers.js";
import { css } from "../styles/css.js";
import SectionTitle from "./ui/SectionTitle.jsx";
import BenchItem from "./ui/BenchItem.jsx";
import Btn from "./ui/Btn.jsx";
import PremiumGate from "./PremiumGate.jsx";

export default function Benchmark({ profile, snaps, entries, tier, openSnap, onDeleteSnap, onRefreshTier }) {
  if (tier !== "premium") return (
    <PremiumGate inline feature={t("premium.gate.benchmark")} description={t("premium.gate.benchmark_desc")} onRefreshTier={onRefreshTier} />
  );
  if (!profile) return null;
  const age = BENCH.ages[profile.childAge];
  const cust = BENCH.custody[profile.custody];
  const loy = BENCH.loyalty[profile.loyaltyConflict];

  return (
    <div>
      <SectionTitle>{t("benchmark.your_situation")}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <BenchItem label={t("benchmark.child_age")} value={t("benchmark.child_age_display", { age: profile.childAge })} />
        <BenchItem label={t("benchmark.custody")} value={profile.custody} />
        <BenchItem label={t("benchmark.loyalty_conflict")} value={profile.loyaltyConflict} />
        <BenchItem label={t("benchmark.time_in_role")} value={profile.yearsInRole !== "1" ? t("benchmark.time_yrs", { n: profile.yearsInRole }) : t("benchmark.time_yr", { n: profile.yearsInRole })} />
      </div>

      {age && (
        <div style={{ ...css.card, padding: 16, marginBottom: 10 }}>
          <div style={{ color: P.warm, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{t("benchmark.typical_timeline")}</div>
          <div style={{ color: P.text, fontSize: 20, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 500, marginBottom: 8 }}>{age.t}</div>
          <p style={{ color: P.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{age.note}</p>
          <div style={{ marginTop: 12, padding: 12, background: P.bg, borderRadius: 8 }}>
            <p style={{ color: P.blue, fontSize: 12, margin: 0 }}>
              {profile.yearsInRole !== "1" ? t("benchmark.years_in_plural", { years: profile.yearsInRole }) : t("benchmark.years_in", { years: profile.yearsInRole })}
              {parseInt(profile.yearsInRole) < 4 ? t("benchmark.early_note") : ""}
              {parseInt(profile.yearsInRole) >= 7 ? t("benchmark.sustained_note") : ""}
            </p>
          </div>
        </div>
      )}

      {cust && <div style={{ ...css.card, padding: 16, marginBottom: 10 }}><div style={{ color: P.warm, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{t("benchmark.custody_impact")}</div><p style={{ color: P.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{cust}</p></div>}
      {loy && <div style={{ ...css.card, padding: 16, marginBottom: 10 }}><div style={{ color: P.warm, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{t("benchmark.loyalty_dynamics")}</div><p style={{ color: P.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{loy}</p></div>}

      {/* Outcomes */}
      <div style={{ ...css.card, padding: 16, marginBottom: 10 }}>
        <div style={{ color: P.warm, fontSize: 13, fontWeight: 500, marginBottom: 10 }}>{t("benchmark.outcome_spectrum")}</div>
        <p style={{ color: P.dim, fontSize: 12, marginBottom: 10 }}>{t("benchmark.outcomes_valid")}</p>
        {BENCH.outcomes.map((o, i) => (
          <div key={i} style={{ padding: "10px 12px", borderLeft: `3px solid ${o.c}`, marginBottom: 6, background: P.bg, borderRadius: "0 8px 8px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: P.text, fontSize: 13, fontWeight: 500 }}>{o.l}</span>
              <span style={{ color: P.dim, fontSize: 11 }}>{o.p}</span>
            </div>
            <p style={{ color: P.dim, fontSize: 12, margin: "3px 0 0" }}>{o.d}</p>
          </div>
        ))}
      </div>

      {/* First vs Latest summary */}
      {snaps.length >= 2 && (() => {
        const first = snaps[0];
        const last = snaps[snaps.length - 1];
        const improved = SNAP_Q.filter(q => (last.answers?.[q.id] ?? 0) > (first.answers?.[q.id] ?? 0)).length;
        const declined = SNAP_Q.filter(q => (last.answers?.[q.id] ?? 0) < (first.answers?.[q.id] ?? 0)).length;
        const same = SNAP_Q.length - improved - declined;
        const daysBetween = Math.round((new Date(last.date) - new Date(first.date)) / 86400000);
        return (
          <div style={{ ...css.card, padding: 18, marginBottom: 10, borderLeft: `3px solid ${improved > declined ? P.green : improved < declined ? P.rose : P.blue}` }}>
            <div style={{ color: P.text, fontSize: 15, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 500, marginBottom: 8 }}>
              {improved > declined ? t("benchmark.things_moving") : improved < declined ? t("benchmark.harder_stretch") : t("benchmark.holding_steady")}
            </div>
            <p style={{ color: P.muted, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>
              {t("benchmark.over_period", { days: daysBetween, count: snaps.length })}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {improved > 0 && <div style={{ flex: 1, padding: 10, background: P.bg, borderRadius: 8, textAlign: "center" }}>
                <div style={{ color: P.green, fontSize: 20, fontWeight: 600 }}>{improved}</div>
                <div style={{ color: P.dim, fontSize: 10 }}>{t("benchmark.improved")}</div>
              </div>}
              {same > 0 && <div style={{ flex: 1, padding: 10, background: P.bg, borderRadius: 8, textAlign: "center" }}>
                <div style={{ color: P.blue, fontSize: 20, fontWeight: 600 }}>{same}</div>
                <div style={{ color: P.dim, fontSize: 10 }}>{t("benchmark.steady")}</div>
              </div>}
              {declined > 0 && <div style={{ flex: 1, padding: 10, background: P.bg, borderRadius: 8, textAlign: "center" }}>
                <div style={{ color: P.rose, fontSize: 20, fontWeight: 600 }}>{declined}</div>
                <div style={{ color: P.dim, fontSize: 10 }}>{t("benchmark.harder")}</div>
              </div>}
            </div>
          </div>
        );
      })()}

      {/* Snapshot trend charts */}
      {snaps.length >= 2 && (
        <div style={{ ...css.card, padding: 16, marginBottom: 10 }}>
          <div style={{ color: P.warm, fontSize: 13, fontWeight: 500, marginBottom: 12 }}>{t("benchmark.progress_over_time")}</div>
          {SNAP_Q.map(q => {
            const dataPoints = snaps.map(s => ({ val: s.answers?.[q.id] ?? null, date: s.date })).filter(d => d.val !== null);
            if (dataPoints.length < 2) return null;
            const vals = dataPoints.map(d => d.val);
            const max = q.s.length - 1;
            const first = vals[0];
            const latest = vals[vals.length - 1];
            const delta = latest - first;
            const deltaColor = delta > 0 ? P.green : delta < 0 ? P.red : P.dim;
            const w = 260, h = 50;
            const xStep = (w - 8) / (vals.length - 1);
            const pts = vals.map((v, i) => ({ x: 4 + i * xStep, y: h - 6 - (v / max) * (h - 12) }));
            const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
            const areaD = pathD + ` L${pts[pts.length - 1].x},${h - 6} L${pts[0].x},${h - 6} Z`;
            return (
              <div key={q.id} style={{ marginBottom: 16 }}>
                <div style={{ color: P.muted, fontSize: 12, marginBottom: 2, lineHeight: 1.4 }}>{q.q}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ color: P.dim, fontSize: 10 }}>{q.s[first]}</span>
                  <span style={{ fontSize: 11 }}>
                    <span style={{ color: P.muted }}>{q.s[latest]}</span>
                    {" "}
                    <span style={{ color: delta > 0 ? P.green : delta < 0 ? P.red : P.dim, fontWeight: 700, fontSize: 14 }}>
                      {delta > 0 ? "\u2191" : delta < 0 ? "\u2193" : "="}
                    </span>
                  </span>
                </div>
                <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h, display: "block" }} aria-hidden="true">
                  <line x1="4" y1={h - 6} x2={w - 4} y2={h - 6} stroke={P.border} strokeWidth="0.5" />
                  <path d={areaD} fill={P.warm + "11"} />
                  <path d={pathD} fill="none" stroke={P.warm} strokeWidth="2" />
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={i === 0 || i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 ? P.warm : P.dim} />
                    </g>
                  ))}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: P.dimmer, fontSize: 8 }}>{fmtShortYr(dataPoints[0].date)}</span>
                  <span style={{ color: P.dimmer, fontSize: 8 }}>{fmtShortYr(dataPoints[dataPoints.length - 1].date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Individual snapshots */}
      {snaps.length > 0 && (
        <div style={{ ...css.card, padding: 16, marginBottom: 10 }}>
          <div style={{ color: P.warm, fontSize: 13, fontWeight: 500, marginBottom: 10 }}>{t("benchmark.all_snapshots", { count: snaps.length })}</div>
          {[...snaps].reverse().map(s => (
            <div key={s.id} style={{ padding: "8px 0", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ color: P.text, fontSize: 12 }}>{fmtDate(s.date)}</span>
                <span style={{ color: P.dim, fontSize: 10, marginLeft: 8 }}>
                  {SNAP_Q.slice(0, 2).map(q => s.answers?.[q.id] !== undefined ? q.s[s.answers[q.id]] : "").filter(Boolean).join(" \u00B7 ")}
                </span>
              </div>
              <button onClick={() => onDeleteSnap(s.id)} style={{ background: "none", border: "none", color: P.dim, cursor: "pointer", fontSize: 11, padding: "4px 8px" }}>{"\u2715"}</button>
            </div>
          ))}
        </div>
      )}

      <Btn onClick={openSnap} full>{t("benchmark.take_snapshot")}</Btn>
    </div>
  );
}
