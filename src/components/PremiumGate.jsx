import { useState } from "react";
import { P, t } from "../config/index.js";
import { isNative, getOfferings, purchasePackage } from "../services/purchases.js";
import Modal from "./ui/Modal.jsx";
import Btn from "./ui/Btn.jsx";

export default function PremiumGate({ feature, description, onClose, inline, onRefreshTier }) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const native = isNative();

  const handleSubscribe = async () => {
    setError(null);
    setPurchasing(true);
    try {
      const packages = await getOfferings();
      if (!packages.length) { setError(t("subscribe.no_products")); setPurchasing(false); return; }
      const newTier = await purchasePackage(packages[0]);
      if (newTier && onRefreshTier) onRefreshTier(newTier);
    } catch {
      setError(t("subscribe.error"));
    } finally {
      setPurchasing(false);
    }
  };

  const content = (
    <div style={{ textAlign: "center", padding: inline ? "32px 16px" : 0 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{"\u2B50"}</div>
      <h3 style={{ color: P.text, fontSize: 18, fontFamily: "Georgia, 'Times New Roman', serif", margin: "0 0 8px", fontWeight: 500 }}>{feature}</h3>
      <p style={{ color: P.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>{description}</p>
      <div style={{ background: P.bg, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <p style={{ color: P.warm, fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>{t("premium.name")}</p>
        <p style={{ color: P.dim, fontSize: 13, margin: "0 0 12px" }}>{t("premium.tagline")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", maxWidth: 260, margin: "0 auto" }}>
          {[
            t("premium.feature.context"),
            t("premium.feature.checkins"),
            t("premium.feature.benchmarks"),
            t("premium.feature.partner"),
            t("premium.feature.cards"),
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: P.green, fontSize: 13, flexShrink: 0 }}>{"\u2713"}</span>
              <span style={{ color: P.muted, fontSize: 13 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
      {native ? (
        <div>
          <Btn onClick={handleSubscribe} full disabled={purchasing}>
            {purchasing ? t("subscribe.purchasing") : t("subscribe.subscribe")}
          </Btn>
          {error && <p style={{ color: P.red, fontSize: 12, margin: "8px 0 0" }}>{error}</p>}
        </div>
      ) : (
        <p style={{ color: P.dimmer, fontSize: 11, margin: 0 }}>{t("premium.coming_soon")}</p>
      )}
    </div>
  );

  if (inline) return content;
  return <Modal onClose={onClose} title={t("premium.title")} small>{content}</Modal>;
}
