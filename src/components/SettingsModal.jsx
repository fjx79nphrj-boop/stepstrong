import { useRef, useState } from "react";
import { P, t } from "../config/index.js";
import { css } from "../styles/css.js";
import { getOfferings, purchasePackage, restorePurchases } from "../services/purchases.js";
import { requestPermission, scheduleDaily, cancelAll, isSupported } from "../services/notifications.js";
import Modal from "./ui/Modal.jsx";
import Btn from "./ui/Btn.jsx";

export default function SettingsModal({ onClose, onExport, onImport, onRedo, onErase, tier, onSetTier, isNativeApp, onRefreshTier, profile, onSaveProfile }) {
  const ref = useRef(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [eraseStep, setEraseStep] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [notifDenied, setNotifDenied] = useState(false);
  const [notifError, setNotifError] = useState(null);

  const handleSubscribe = async () => {
    setError(null);
    setPurchasing(true);
    try {
      const packages = await getOfferings();
      if (!packages.length) { setError(t("subscribe.no_products")); return; }
      const newTier = await purchasePackage(packages[0]);
      if (newTier) onRefreshTier(newTier);
    } catch (e) {
      setError(t("subscribe.error"));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setError(null);
    setRestoring(true);
    try {
      const newTier = await restorePurchases();
      onRefreshTier(newTier);
    } catch (e) {
      setError(t("subscribe.error"));
    } finally {
      setRestoring(false);
    }
  };

  const handleNotifToggle = async () => {
    setNotifDenied(false);
    setNotifError(null);
    try {
      const enabled = profile?.notificationsEnabled;
      if (enabled) {
        await cancelAll();
        onSaveProfile({ ...profile, notificationsEnabled: false });
      } else {
        const granted = await requestPermission();
        if (granted) {
          await scheduleDaily(20, 0);
          onSaveProfile({ ...profile, notificationsEnabled: true });
        } else {
          setNotifDenied(true);
        }
      }
    } catch (e) {
      setNotifError(t("settings.notifications_error"));
      console.error("Notification toggle error:", e);
    }
  };

  return (
    <Modal onClose={onClose} title={t("settings.title")} small>
      {/* Subscription / tier section */}
      {isNativeApp ? (
        <div style={{ padding: 14, background: tier === "premium" ? P.green + "11" : P.bg, borderRadius: 10, border: `1px solid ${tier === "premium" ? P.green + "44" : P.border}`, marginBottom: 16 }}>
          {tier === "premium" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{"\u2B50"}</span>
              <span style={{ color: P.green, fontSize: 14, fontWeight: 600 }}>{t("subscribe.active")}</span>
            </div>
          ) : (
            <div>
              <Btn onClick={handleSubscribe} full disabled={purchasing}>
                {purchasing ? t("subscribe.purchasing") : t("subscribe.subscribe")}
              </Btn>
            </div>
          )}
          <button onClick={handleRestore} disabled={restoring} style={{ ...css.textBtn, color: P.dim, width: "100%", textAlign: "center", fontSize: 12, marginTop: 10 }}>
            {restoring ? t("subscribe.restoring") : t("subscribe.restore")}
          </button>
          {error && <p style={{ color: P.red, fontSize: 12, textAlign: "center", margin: "8px 0 0" }}>{error}</p>}
        </div>
      ) : (
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
      )}

      {isSupported() && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: P.card, borderRadius: 10, border: `1px solid ${P.border2}` }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: P.text, fontWeight: 500 }}>{t("settings.notifications")}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: P.muted }}>{t("settings.notifications_sub")}</p>
            </div>
            <button
              onClick={handleNotifToggle}
              role="switch"
              aria-checked={!!profile?.notificationsEnabled}
              style={{
                width: 48, height: 28, borderRadius: 14, border: "none", cursor: "pointer", flexShrink: 0,
                background: profile?.notificationsEnabled ? P.green : "#4a5568",
                position: "relative", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: 3, left: profile?.notificationsEnabled ? 23 : 3,
                width: 22, height: 22, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", display: "block",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }} />
            </button>
          </div>
          {notifDenied && (
            <p style={{ margin: "6px 0 0 2px", fontSize: 12, color: P.red }}>{t("settings.notifications_denied")}</p>
          )}
          {notifError && (
            <p style={{ margin: "6px 0 0 2px", fontSize: 12, color: P.red }}>{notifError}</p>
          )}
        </div>
      )}

      <p style={{ color: P.dim, fontSize: 13, marginBottom: 14 }}>{t("settings.data_note")}</p>
      <Btn onClick={onExport} full>{t("settings.export")}</Btn>
      <Btn onClick={() => ref.current?.click()} full secondary style={{ marginTop: 8 }}>{t("settings.import")}</Btn>
      <input ref={ref} type="file" accept=".json" onChange={onImport} style={{ position: "absolute", left: -9999, opacity: 0, width: 1, height: 1 }} aria-label="Choose backup file" />
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
