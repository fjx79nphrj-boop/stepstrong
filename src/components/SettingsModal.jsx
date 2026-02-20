import { useRef, useState } from "react";
import { P, t } from "../config/index.js";
import { css } from "../styles/css.js";
import Modal from "./ui/Modal.jsx";
import Btn from "./ui/Btn.jsx";

export default function SettingsModal({ onClose, onExport, onImport, onRedo, onErase, tier, onSetTier }) {
  const ref = useRef(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [eraseStep, setEraseStep] = useState(0);
  return (
    <Modal onClose={onClose} title={t("settings.title")} small>
      {/* Dev tier toggle */}
      <div style={{ padding: 14, background: tier === "premium" ? P.green + "11" : P.bg, borderRadius: 10, border: `1px solid ${tier === "premium" ? P.green + "44" : P.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: P.text, fontSize: 13, fontWeight: 500 }}>{tier === "premium" ? `\u2B50 ${t("settings.premium")}` : t("settings.free_plan")}</span>
          <span style={{ color: P.dimmer, fontSize: 10, background: P.card2, padding: "2px 8px", borderRadius: 4 }}>{t("settings.dev_toggle")}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onSetTier("free")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${tier === "free" ? P.warm : P.border}`, background: tier === "free" ? P.warm + "22" : "transparent", color: tier === "free" ? P.warm : P.dim, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>{t("settings.free")}</button>
          <button onClick={() => onSetTier("premium")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${tier === "premium" ? P.green : P.border}`, background: tier === "premium" ? P.green + "22" : "transparent", color: tier === "premium" ? P.green : P.dim, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>{t("settings.premium_btn")}</button>
        </div>
        <p style={{ color: P.dimmer, fontSize: 10, margin: "8px 0 0", textAlign: "center" }}>{t("settings.dev_note")}</p>
      </div>

      <p style={{ color: P.dim, fontSize: 13, marginBottom: 14 }}>{t("settings.data_note")}</p>
      <Btn onClick={onExport} full>{t("settings.export")}</Btn>
      <Btn onClick={() => ref.current?.click()} full secondary style={{ marginTop: 8 }}>{t("settings.import")}</Btn>
      <input ref={ref} type="file" accept=".json" onChange={onImport} style={{ display: "none" }} aria-label="Choose backup file" />
      <hr style={{ border: "none", borderTop: `1px solid ${P.border}`, margin: "20px 0 14px" }} />
      <Btn onClick={onRedo} full secondary>{t("settings.redo_onboarding")}</Btn>
      <hr style={{ border: "none", borderTop: `1px solid ${P.border}`, margin: "20px 0 14px" }} />

      {eraseStep === 0 && (
        <button onClick={() => setEraseStep(1)} style={{ ...css.textBtn, color: P.red, width: "100%", textAlign: "center", fontSize: 13 }}>
          {t("settings.erase_all")}
        </button>
      )}
      {eraseStep === 1 && (
        <div style={{ padding: 16, background: P.red + "11", borderRadius: 10, border: `1px solid ${P.red}33` }}>
          <p style={{ color: P.red, fontSize: 13, fontWeight: 500, margin: "0 0 6px" }}>{t("settings.erase_confirm")}</p>
          <p style={{ color: P.muted, fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>{t("settings.erase_warning")}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setEraseStep(2)} style={{ flex: 1, background: P.red, fontSize: 13 }}>{t("settings.erase_yes")}</Btn>
            <Btn onClick={() => setEraseStep(0)} secondary style={{ flex: 1, fontSize: 13 }}>{t("entry.cancel")}</Btn>
          </div>
        </div>
      )}
      {eraseStep === 2 && (
        <div style={{ padding: 16, background: P.red + "11", borderRadius: 10, border: `1px solid ${P.red}33` }}>
          <p style={{ color: P.red, fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>{t("settings.erase_last")}</p>
          <p style={{ color: P.muted, fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>{t("settings.erase_final")}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={onErase} style={{ flex: 1, background: P.red, fontSize: 13 }}>{t("settings.erase_permanent")}</Btn>
            <Btn onClick={() => setEraseStep(0)} secondary style={{ flex: 1, fontSize: 13 }}>{t("settings.keep_data")}</Btn>
          </div>
        </div>
      )}

      <hr style={{ border: "none", borderTop: `1px solid ${P.border}`, margin: "20px 0 14px" }} />
      <button onClick={() => setShowPrivacy(p => !p)} style={{ ...css.textBtn, color: P.dim, width: "100%", textAlign: "center", fontSize: 12 }}>
        {showPrivacy ? t("settings.hide_privacy") : t("settings.show_privacy")}
      </button>
      {showPrivacy && (
        <div style={{ marginTop: 10, padding: 14, background: P.bg, borderRadius: 10, fontSize: 11, color: P.muted, lineHeight: 1.7 }}>
          <p style={{ fontWeight: 600, color: P.text, marginBottom: 8, fontSize: 12 }}>{t("privacy.title")}</p>
          <p style={{ margin: "0 0 8px" }}>{t("privacy.p1")}</p>
          <p style={{ margin: "0 0 8px" }}><strong style={{ color: P.text }}>{t("privacy.p2")}</strong> {t("privacy.p2_bold")}</p>
          <p style={{ margin: "0 0 8px" }}>{t("privacy.p3")}</p>
          <p style={{ margin: "0 0 8px" }}>{t("privacy.p4")}</p>
          <p style={{ margin: "0 0 8px" }}>{t("privacy.p5")}</p>
          <p style={{ margin: 0 }}>{t("privacy.contact")}</p>
        </div>
      )}
    </Modal>
  );
}
