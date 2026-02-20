import { useState } from "react";
import { BENCH, P, t } from "../config/index.js";
import { css } from "../styles/css.js";
import Btn from "./ui/Btn.jsx";

function ObBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={active} style={{
      padding: "12px 20px",
      borderRadius: 11,
      border: `1px solid ${active ? P.warm : P.border}`,
      background: active ? P.warm + "18" : "transparent",
      color: active ? P.warm : P.muted,
      cursor: "pointer",
      fontSize: 14,
      fontFamily: "inherit",
      transition: "all .15s",
      minHeight: 44,
    }}>
      {children}
    </button>
  );
}

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ childAge: "", custody: "", loyaltyConflict: "", yearsInRole: "", currentState: "", startDate: new Date().toISOString() });
  const upd = (k, v) => setD(p => ({ ...p, [k]: v }));

  const steps = [
    { title: t("onboard.before_start"), sub: t("onboard.before_sub"), content: (
      <div>
        <p style={css.obText}>The path to a functional relationship with a resistant stepchild typically takes <strong style={{ color: P.warm }}>7 to 12 years</strong>. The fastest documented full integration was 4 years. Some families never get there &mdash; and a stable, respectful distance is a valid outcome.</p>
        <p style={css.obText}>No app will change that timeline. What this tool does is make the invisible visible &mdash; so you can see whether your efforts are producing change, even when it doesn't feel like it.</p>
        <p style={css.obText}>You're not here because you failed. You're here because you care enough to track what's actually happening.</p>
      </div>
    )},
    { title: t("onboard.child_age"), sub: t("onboard.child_age_sub"), content: (
      <div style={css.chips}>{Object.keys(BENCH.ages).map(a => <ObBtn key={a} active={d.childAge === a} onClick={() => upd("childAge", a)}>{a} years</ObBtn>)}</div>
    )},
    { title: t("onboard.custody"), content: (
      <div style={css.chips}>{["full", "50-50", "weekends", "other"].map(c => <ObBtn key={c} active={d.custody === c} onClick={() => upd("custody", c)}>{c === "full" ? t("onboard.custody_full") : c === "50-50" ? t("onboard.custody_5050") : c === "weekends" ? t("onboard.custody_weekends") : t("onboard.custody_other")}</ObBtn>)}</div>
    )},
    { title: t("onboard.loyalty"), sub: t("onboard.loyalty_sub"), content: (
      <div style={css.chips}>{["none", "mild", "strong", "unknown"].map(l => <ObBtn key={l} active={d.loyaltyConflict === l} onClick={() => upd("loyaltyConflict", l)}>{l === "none" ? t("onboard.loyalty_none") : l === "mild" ? t("onboard.loyalty_mild") : l === "strong" ? t("onboard.loyalty_strong") : t("onboard.loyalty_unknown")}</ObBtn>)}</div>
    )},
    { title: t("onboard.years"), content: (
      <div style={css.chips}>{["< 1", "1", "2-3", "4-6", "7+"].map(y => <ObBtn key={y} active={d.yearsInRole === y} onClick={() => upd("yearsInRole", y)}>{y} yr{y !== "1" && y !== "< 1" ? "s" : ""}</ObBtn>)}</div>
    )},
    { title: t("onboard.state"), content: (
      <div style={css.chips}>{["hostile", "avoidant", "tense", "neutral", "warming"].map(s => <ObBtn key={s} active={d.currentState === s} onClick={() => upd("currentState", s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</ObBtn>)}</div>
    )},
    { title: t("onboard.benchmark_title"), content: (() => {
      const age = BENCH.ages[d.childAge];
      return (
        <div>
          {age && <>
            <p style={{ color: P.dim, fontSize: 13 }}>{t("onboard.benchmark_intro")}</p>
            <p style={{ color: P.text, fontSize: 22, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 500, margin: "12px 0" }}>Typical timeline: {age.t}</p>
            <p style={{ color: P.muted, fontSize: 13, lineHeight: 1.6 }}>{age.note}</p>
          </>}
          <div style={{ marginTop: 16, padding: 14, background: `${P.card2}88`, borderRadius: 10, borderLeft: `3px solid ${P.warm}44` }}>
            <p style={{ color: P.text, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {t("onboard.benchmark_note")}
            </p>
          </div>
        </div>
      );
    })()},
  ];

  const canGo = step === 0 || step === 6
    || (step === 1 && d.childAge) || (step === 2 && d.custody)
    || (step === 3 && d.loyaltyConflict) || (step === 4 && d.yearsInRole)
    || (step === 5 && d.currentState);

  return (
    <div style={css.root}>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }} role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={7} aria-label={`Step ${step + 1} of 7`}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? P.warm : P.border, transition: "background .3s" }} />)}
        </div>
        <h2 style={{ color: P.text, fontSize: 22, fontFamily: "Georgia, 'Times New Roman', serif", margin: "0 0 6px" }}>{steps[step].title}</h2>
        {steps[step].sub && <p style={{ color: P.dim, fontSize: 14, margin: "0 0 16px" }}>{steps[step].sub}</p>}
        {steps[step].content}
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {step > 0 && <Btn onClick={() => setStep(s => s - 1)} secondary>{t("onboard.back")}</Btn>}
          <Btn onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onDone(d)} disabled={!canGo} style={{ flex: 1 }}>
            {step === steps.length - 1 ? t("onboard.get_started") : t("onboard.continue")}
          </Btn>
        </div>
      </div>
    </div>
  );
}
