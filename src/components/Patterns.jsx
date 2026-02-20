import { useMemo } from "react";
import { ACTIONS, RESPONSES, P, t, CONTEXT_MIGRATION } from "../config/index.js";
import { css } from "../styles/css.js";
import Tabs from "./ui/Tabs.jsx";
import PremiumGate from "./PremiumGate.jsx";

// Resolve context display label — handles both old strings and new IDs
function contextLabel(ctx) {
  if (CONTEXT_MIGRATION[ctx]) return ctx;
  return t("context." + ctx);
}

export default function Patterns({ entries, mode, setMode, range, setRange, tier, onRefreshTier }) {
  const ranges = { "1m": 30, "3m": 90, "6m": 180, "1y": 365, all: 99999 };
  const cut = Date.now() - ranges[range] * 86400000;
  const fil = useMemo(() => entries.filter(e => new Date(e.date).getTime() >= cut), [entries, cut]);

  const aPats = useMemo(() => {
    const m = {};
    ACTIONS.forEach(a => { m[a.id] = { total: 0 }; RESPONSES.forEach(r => { m[a.id][r.id] = 0; }); });
    fil.forEach(e => { if (m[e.action]) { m[e.action].total++; m[e.action][e.response]++; } });
    return m;
  }, [fil]);

  const cPats = useMemo(() => {
    const m = {};
    fil.forEach(e => {
      (e.contexts || []).forEach(c => {
        if (!m[c]) { m[c] = { total: 0 }; RESPONSES.forEach(r => { m[c][r.id] = 0; }); }
        m[c].total++; m[c][e.response]++;
      });
    });
    return m;
  }, [fil]);

  const ranked = ACTIONS.map(a => {
    const p = aPats[a.id]; if (p.total < 3) return null;
    const pos = ((p.positive + p.neutral) / p.total) * 100;
    return { ...a, pos, total: p.total };
  }).filter(Boolean).sort((a, b) => b.pos - a.pos);

  if (fil.length < 10) return (
    <div>
      <Tabs items={Object.keys(ranges).map(r => r === "all" ? t("common.all") : r)} active={range === "all" ? t("common.all") : range} onPick={(v) => setRange(v === t("common.all") ? "all" : v)} />
      <div style={{ textAlign: "center", padding: "48px 16px" }}>
        <p style={{ color: P.text, fontSize: 16, marginBottom: 8 }}>{t("patterns.building")}</p>
        <p style={{ color: P.dim, fontSize: 14 }}>Need at least 10 interactions in this range ({fil.length} found).{range !== "all" ? ` ${t("patterns.try_longer")}` : ""}</p>
        <div style={{ margin: "20px auto", maxWidth: 240 }}>
          <div style={{ height: 6, background: P.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (fil.length / 10) * 100)}%`, background: `linear-gradient(90deg, ${P.warm}, ${P.green})`, borderRadius: 3 }} />
          </div>
          <p style={{ color: P.dim, fontSize: 11, marginTop: 6 }}>{fil.length}/10</p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Tabs items={Object.keys(ranges).map(r => r === "all" ? t("common.all") : r)} active={range === "all" ? t("common.all") : range} onPick={(v) => setRange(v === t("common.all") ? "all" : v)} />
      <Tabs items={[t("patterns.by_action"), t("patterns.by_context"), t("patterns.insights")]} active={mode === "action" ? t("patterns.by_action") : mode === "context" ? t("patterns.by_context") : t("patterns.insights")} onPick={v => setMode(v === t("patterns.by_action") ? "action" : v === t("patterns.by_context") ? "context" : "insights")} />

      {mode === "action" && (
        <div>
          <p style={{ color: P.dim, fontSize: 13, marginBottom: 14 }}>{t("patterns.how_responds")}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {[...RESPONSES].reverse().map(r => <span key={r.id} style={{ fontSize: 10, color: r.color }}>{r.icon} {t("response." + r.id)}</span>)}
          </div>
          {ACTIONS.map(a => {
            const p = aPats[a.id]; if (p.total === 0) return null;
            const reversed = [...RESPONSES].reverse();
            return (
              <div key={a.id} style={{ ...css.card, padding: 14, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: a.color, fontSize: 13 }}>{a.icon} {t("action." + a.id)}</span>
                  <span style={{ color: P.dim, fontSize: 11 }}>{p.total} {t("patterns.logged")}</span>
                </div>
                <div style={{ display: "flex", height: 20, borderRadius: 5, overflow: "hidden" }}>
                  {reversed.map(r => {
                    const pct = (p[r.id] / p.total) * 100;
                    if (pct === 0) return null;
                    return <div key={r.id} style={{ width: `${pct}%`, background: r.color + "88", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {pct > 18 && <span style={{ fontSize: 9, color: "#fff" }}>{Math.round(pct)}%</span>}
                    </div>;
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                  {reversed.map(r => { const pct = (p[r.id] / p.total) * 100; if (pct === 0) return null; return <span key={r.id} style={{ color: r.color, fontSize: 10 }}>{r.icon} {Math.round(pct)}%</span>; })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === "context" && (tier !== "premium" ? (
        <PremiumGate inline feature={t("premium.gate.context_analysis")} description={t("premium.gate.context_desc")} onRefreshTier={onRefreshTier} />
      ) : (
        <div>
          <p style={{ color: P.dim, fontSize: 13, marginBottom: 8 }}>{t("patterns.which_contexts")}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[...RESPONSES].reverse().map(r => <span key={r.id} style={{ fontSize: 10, color: r.color }}>{r.icon} {t("response." + r.id)}</span>)}
          </div>
          {Object.entries(cPats).filter(([, v]) => v.total >= 2).sort(([, a], [, b]) => b.total - a.total).map(([ctx, data]) => (
            <div key={ctx} style={{ ...css.card, padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: P.text, fontSize: 13 }}>{contextLabel(ctx)}</span>
                <span style={{ color: P.dim, fontSize: 11 }}>{data.total}&times;</span>
              </div>
              <div style={{ display: "flex", height: 16, borderRadius: 5, overflow: "hidden" }}>
                {[...RESPONSES].reverse().map(r => { const pct = (data[r.id] / data.total) * 100; if (pct === 0) return null; return <div key={r.id} style={{ width: `${pct}%`, background: r.color + "88" }} />; })}
              </div>
            </div>
          ))}
          {Object.keys(cPats).filter(k => cPats[k].total >= 2).length === 0 && <p style={{ color: P.dim, fontSize: 13 }}>{t("patterns.tag_contexts")}</p>}
        </div>
      ))}

      {mode === "insights" && (tier !== "premium" ? (
        <PremiumGate inline feature={t("premium.gate.insights")} description={t("premium.gate.insights_desc")} onRefreshTier={onRefreshTier} />
      ) : (
        <div>
          {ranked.length > 0 && (
            <div style={{ ...css.card, padding: 16, marginBottom: 10 }}>
              <div style={{ color: P.green, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{"\uD83C\uDF31"} {t("patterns.most_effective")}</div>
              <p style={{ color: P.text, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                <strong>{ranked[0].icon} {t("action." + ranked[0].id)}</strong> produces a positive or neutral response {Math.round(ranked[0].pos)}% of the time ({ranked[0].total} interactions).
              </p>
            </div>
          )}
          {ranked.length > 1 && ranked[ranked.length - 1].pos < 40 && (
            <div style={{ ...css.card, padding: 16, marginBottom: 10 }}>
              <div style={{ color: P.rose, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{"\u26A1"} {t("patterns.most_friction")}</div>
              <p style={{ color: P.text, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                <strong>{ranked[ranked.length - 1].icon} {t("action." + ranked[ranked.length - 1].id)}</strong> tends to produce more resistance ({Math.round(100 - ranked[ranked.length - 1].pos)}% negative).
              </p>
            </div>
          )}
          {fil.length >= 20 && (() => {
            const h = Math.floor(fil.length / 2);
            const rAvg = fil.slice(0, h).reduce((s, e) => s + (RESPONSES.find(r => r.id === e.response)?.score ?? 2), 0) / h;
            const oAvg = fil.slice(h).reduce((s, e) => s + (RESPONSES.find(r => r.id === e.response)?.score ?? 2), 0) / (fil.length - h);
            const d = rAvg - oAvg;
            return (
              <div style={{ ...css.card, padding: 16, marginBottom: 10 }}>
                <div style={{ color: d > 0.3 ? P.green : d < -0.3 ? P.rose : P.blue, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  {d > 0.3 ? `\uD83D\uDCC8 ${t("patterns.positive_trend")}` : d < -0.3 ? `\uD83D\uDCC9 ${t("patterns.difficult_stretch")}` : `\u2501 ${t("patterns.steady_state")}`}
                </div>
                <p style={{ color: P.text, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {d > 0.3 ? t("patterns.positive_trend_desc") : d < -0.3 ? t("patterns.difficult_stretch_desc") : t("patterns.steady_state_desc")}
                </p>
              </div>
            );
          })()}
          {fil.length < 20 && (
            <div style={{ ...css.card, padding: 16 }}>
              <div style={{ color: P.blue, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{"\uD83D\uDCCA"} {t("patterns.more_data")}</div>
              <p style={{ color: P.muted, fontSize: 13, margin: 0 }}>Trend analysis needs ~20 entries in this range. You have {fil.length}.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
