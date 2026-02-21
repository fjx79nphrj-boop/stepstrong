import { useState } from "react";
import { ACTIONS, RESPONSES, PARTNER_TIPS, ALIENATION, P, t } from "../config/index.js";
import { daysAgo } from "../utils/helpers.js";
import { css } from "../styles/css.js";
import Tabs from "./ui/Tabs.jsx";
import Btn from "./ui/Btn.jsx";
import PremiumGate from "./PremiumGate.jsx";

export default function Partner({ entries, profile, snaps, tier, onRefreshTier }) {
  if (tier !== "premium") return (
    <PremiumGate inline feature={t("premium.gate.partner")} description={t("premium.gate.partner_desc")} onRefreshTier={onRefreshTier} />
  );
  const [tab, setTab] = useState("tips");
  const [expandedTip, setExpandedTip] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateReport = () => {
    const month = entries.filter(e => daysAgo(e.date) <= 30);
    if (month.length === 0) return null;
    const total = month.length;
    const pos = month.filter(e => e.response === "positive" || e.response === "neutral").length;
    const rej = month.filter(e => e.response === "rejection" || e.response === "escalation").length;
    const pct = Math.round((pos / total) * 100);
    const actionCounts = {};
    ACTIONS.forEach(a => { actionCounts[a.id] = { pos: 0, total: 0 }; });
    month.forEach(e => {
      if (actionCounts[e.action]) {
        actionCounts[e.action].total++;
        if (e.response === "positive" || e.response === "neutral") actionCounts[e.action].pos++;
      }
    });
    let bestAction = null, bestPct = 0;
    Object.entries(actionCounts).forEach(([id, d]) => {
      if (d.total >= 3) {
        const p = d.pos / d.total;
        if (p > bestPct) { bestPct = p; bestAction = ACTIONS.find(a => a.id === id); }
      }
    });
    const lines = [
      t("report.title"),
      String.fromCharCode(9472).repeat(29),
      "",
      `This month, I logged ${total} interactions with your child.`,
      "",
      `${pct}% of responses were positive or neutral.`,
      `${rej} interactions involved active rejection or escalation.`,
      "",
    ];
    if (bestAction) {
      lines.push(`What seems to work best: "${t("action." + bestAction.id)}" \u2014 ${Math.round(bestPct * 100)}% positive response rate.`);
      lines.push("");
    }
    lines.push(t("report.need_from_you"));
    lines.push("\u2022 " + t("report.need1"));
    lines.push("\u2022 " + t("report.need2"));
    lines.push("\u2022 " + t("report.need3"));
    lines.push("");
    lines.push(t("report.closing"));
    lines.push("");
    lines.push("\u2014 " + t("report.signature"));
    return lines.join("\n");
  };

  const report = generateReport();

  const copyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = report; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <p style={{ color: P.muted, fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>These conversations are hard. Here's how to start them.</p>
      <Tabs items={[t("partner.tips"), t("partner.share"), t("partner.alienation")]} active={tab === "tips" ? t("partner.tips") : tab === "share" ? t("partner.share") : t("partner.alienation")} onPick={v => setTab(v === t("partner.tips") ? "tips" : v === t("partner.share") ? "share" : "alienation")} />

      {tab === "tips" && (
        <div>
          <p style={{ color: P.muted, fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
            {t("partner.tips_intro")}
          </p>
          {PARTNER_TIPS.map((tp, i) => (
            <button key={i} onClick={() => setExpandedTip(expandedTip === i ? null : i)} style={{ ...css.card, padding: 16, marginBottom: 8, width: "100%", textAlign: "left", cursor: "pointer", border: `1px solid ${expandedTip === i ? P.warm + "44" : P.border}`, fontFamily: "inherit" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: P.text, fontWeight: 500, fontSize: 14 }}>{tp.title}</div>
                <span style={{ color: P.dim, fontSize: 12, transform: expandedTip === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}>{"\u25BE"}</span>
              </div>
              <div style={{ color: P.dim, fontSize: 12, marginTop: 4 }}>{tp.situation}</div>
              {expandedTip === i && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ padding: 14, background: P.bg, borderRadius: 10, borderLeft: `3px solid ${P.green}44`, marginBottom: 10 }}>
                    <p style={{ color: P.dim, fontSize: 10, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("partner.try_saying")}</p>
                    <p style={{ color: P.text, fontSize: 13, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>{tp.tip}</p>
                  </div>
                  <div style={{ padding: 14, background: P.bg, borderRadius: 10, borderLeft: `3px solid ${P.blue}44` }}>
                    <p style={{ color: P.dim, fontSize: 10, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("partner.why_works")}</p>
                    <p style={{ color: P.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{tp.why}</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {tab === "share" && (
        <div>
          <p style={{ color: P.muted, fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
            {t("partner.share_intro")}
          </p>
          {report ? (
            <div>
              <div style={{ ...css.card, padding: 16, marginBottom: 12 }}>
                <pre style={{ color: P.muted, fontSize: 11, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" }}>{report}</pre>
              </div>
              <Btn onClick={copyReport} full>{copied ? t("partner.copied") : t("partner.copy_clipboard")}</Btn>
              <p style={{ color: P.dim, fontSize: 11, marginTop: 10, textAlign: "center" }}>{t("partner.paste_hint")}</p>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: P.dim, fontSize: 14 }}>{t("partner.no_data")}</p>
            </div>
          )}
        </div>
      )}

      {tab === "alienation" && (
        <div>
          <div style={{ ...css.card, padding: 20, marginBottom: 12, borderLeft: `3px solid ${P.rose}` }}>
            <h3 style={{ color: P.text, fontSize: 16, fontFamily: "Georgia, 'Times New Roman', serif", margin: "0 0 10px" }}>{ALIENATION.title}</h3>
            <p style={{ color: P.muted, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{ALIENATION.intro}</p>
          </div>
          <div style={{ ...css.card, padding: 16, marginBottom: 12 }}>
            <div style={{ color: P.rose, fontSize: 13, fontWeight: 500, marginBottom: 10 }}>{t("partner.warning_signs")}</div>
            {ALIENATION.signs.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ color: P.rose, fontSize: 11, marginTop: 2, flexShrink: 0 }}>{"\u2022"}</span>
                <p style={{ color: P.muted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
          {ALIENATION.guidance.map((g, i) => (
            <div key={i} style={{ ...css.card, padding: 16, marginBottom: 8 }}>
              <div style={{ color: P.text, fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{g.title}</div>
              <p style={{ color: P.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{g.text}</p>
            </div>
          ))}
          <div style={{ ...css.card, padding: 16, marginTop: 4, background: `${P.card2}88`, borderLeft: `3px solid ${P.blue}44` }}>
            <p style={{ color: P.dim, fontSize: 12, margin: 0, lineHeight: 1.6 }}>{ALIENATION.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
