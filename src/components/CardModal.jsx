import { useState } from "react";
import { P, t } from "../config/index.js";
import Modal from "./ui/Modal.jsx";

export default function CardModal({ card, onClose, auto, onDisableAuto }) {
  const [checked, setChecked] = useState(false);
  return (
    <Modal onClose={() => { if (checked && onDisableAuto) onDisableAuto(); onClose(); }} title={`\u25C7 ${card.title}`} titleColor={P.warm}>
      <p style={{ color: "#D1D5DB", fontSize: 15, lineHeight: 1.7 }}>{card.body}</p>
      {card.src && <p style={{ color: P.blue, fontSize: 12, fontStyle: "italic", marginTop: 12 }}>Source: {card.src}</p>}
      {card.quote && (
        <div style={{ background: P.bg, borderRadius: 12, padding: 16, marginTop: 16, borderLeft: `3px solid ${P.warm}44` }}>
          <p style={{ color: P.text, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>{card.quote}</p>
          {card.who && <p style={{ color: P.warm, fontSize: 12, marginTop: 8, marginBottom: 0 }}>{"\u2014"} {card.who}</p>}
        </div>
      )}
      <div style={{ marginTop: 20, padding: 14, background: `${P.card2}88`, borderRadius: 10, borderLeft: `3px solid ${P.green}33` }}>
        <p style={{ color: P.dim, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          {t("perspective.card_footer")}
        </p>
      </div>
      {auto && onDisableAuto && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, cursor: "pointer", padding: "10px 0" }}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ width: 18, height: 18, accentColor: P.warm, flexShrink: 0 }} />
          <span style={{ color: P.dim, fontSize: 12, lineHeight: 1.4 }}>{t("perspective.disable_auto")}</span>
        </label>
      )}
      {auto && <p style={{ color: P.dimmer, fontSize: 11, marginTop: 4 }}>{t("perspective.find_on_shift")}</p>}
    </Modal>
  );
}
