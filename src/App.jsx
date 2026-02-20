import { useState, useEffect, useCallback } from "react";
import { CARDS, P, t } from "./config/index.js";
import { idb, put, get, getAll, del, STORES } from "./db/indexedDb.js";
import { isNative, initPurchases, checkEntitlement } from "./services/purchases.js";
import { scheduleDaily } from "./services/notifications.js";
import { css } from "./styles/css.js";
import Nav from "./components/Nav.jsx";
import Home from "./components/Home.jsx";
import Timeline from "./components/Timeline.jsx";
import Patterns from "./components/Patterns.jsx";
import Perspective from "./components/Perspective.jsx";
import Partner from "./components/Partner.jsx";
import Benchmark from "./components/Benchmark.jsx";
import EntryModal from "./components/EntryModal.jsx";
import CardModal from "./components/CardModal.jsx";
import SnapModal from "./components/SnapModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import Onboarding from "./components/Onboarding.jsx";
import PremiumGate from "./components/PremiumGate.jsx";

const S = STORES;

export default function App() {
  const [view, setView] = useState("loading");
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [snaps, setSnaps] = useState([]);
  const [modal, setModal] = useState(null);
  const [timeRange, setTimeRange] = useState("3m");
  const [patMode, setPatMode] = useState("action");
  const [tier, setTier] = useState("free");

  useEffect(() => {
    (async () => {
      try {
        const [e, p, s] = await Promise.all([getAll(S.entries), get(S.profile, "main"), getAll(S.snapshots)]);
        setEntries(e.sort((a, b) => new Date(b.date) - new Date(a.date)));
        const prof = p?.data || null;
        setProfile(prof);
        setSnaps(s.sort((a, b) => new Date(a.date) - new Date(b.date)));
        if (isNative()) {
          await initPurchases();
          const t = await checkEntitlement();
          setTier(t);
          if (prof?.notificationsEnabled) await scheduleDaily(20, 0);
        } else {
          setTier(prof?.tier || "free");
        }
        setView(prof ? "home" : "onboard");
      } catch(e) { setView("onboard"); }
    })();
  }, []);

  const isNativeApp = isNative();

  const refreshTier = useCallback(async (newTier) => {
    setTier(newTier);
    if (!isNativeApp && profile) {
      const updated = { ...profile, tier: newTier };
      await put(S.profile, { key: "main", data: updated });
      setProfile(updated);
    }
  }, [isNativeApp, profile]);

  const saveEntry = async (e) => { await put(S.entries, e); setEntries(prev => [e, ...prev.filter(x => x.id !== e.id)].sort((a, b) => new Date(b.date) - new Date(a.date))); };
  const delEntry = async (id) => { await del(S.entries, id); setEntries(prev => prev.filter(x => x.id !== id)); };
  const saveProfile = async (d) => { await put(S.profile, { key: "main", data: d }); setProfile(d); };
  const saveSnap = async (s) => { await put(S.snapshots, s); setSnaps(prev => [...prev.filter(x => x.id !== s.id), s].sort((a, b) => new Date(a.date) - new Date(b.date))); };
  const delSnap = async (id) => { await del(S.snapshots, id); setSnaps(prev => prev.filter(x => x.id !== id)); };

  const exportData = async () => {
    const d = JSON.stringify({ entries, profile, snapshots: snaps, exported: new Date().toISOString() }, null, 2);
    const filename = `steadfast-backup-${new Date().toISOString().slice(0, 10)}.json`;
    if (isNativeApp && navigator.share) {
      try {
        const file = new File([d], filename, { type: "application/json" });
        await navigator.share({ files: [file] });
      } catch (e) {
        if (e.name !== "AbortError") console.error("Export share error:", e);
      }
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([d], { type: "application/json" }));
      a.download = filename;
      a.click();
    }
  };

  const importData = (evt) => {
    const f = evt.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = async (e) => {
      try {
        const d = JSON.parse(e.target.result);
        const db = await idb();
        await new Promise((ok, fail) => {
          const tx = db.transaction([S.entries, S.profile, S.snapshots], "readwrite");
          tx.objectStore(S.entries).clear();
          tx.objectStore(S.profile).clear();
          tx.objectStore(S.snapshots).clear();
          tx.oncomplete = () => ok();
          tx.onerror = () => fail(tx.error);
        });
        if (d.entries) for (const x of d.entries) await put(S.entries, x);
        if (d.profile) await put(S.profile, { key: "main", data: d.profile });
        if (d.snapshots) for (const x of d.snapshots) await put(S.snapshots, x);
        window.location.reload();
      } catch(e) { alert("Invalid backup file."); }
    };
    r.readAsText(f);
  };

  const openEntry = (e = null) => setModal({ type: "entry", data: e });
  const close = () => setModal(null);

  if (view === "loading") return (
    <div style={{ ...css.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }} role="status" aria-live="polite">
      <p style={{ color: P.dim, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 18 }}>{t("common.loading")}</p>
    </div>
  );

  if (view === "onboard") return <Onboarding onDone={(d) => { saveProfile(d); setView("home"); }} />;

  return (
    <div style={css.root}>
      <div style={css.shell}>
        {/* Modal layer */}
        {modal?.type === "entry" && (
          <EntryModal
            entry={modal.data}
            onSave={(e) => {
              saveEntry(e); close();
              if (!profile?.hideAutoCards && (e.response === "rejection" || e.response === "escalation")) {
                const cs = CARDS.filter(c => c.triggers.includes(e.response));
                if (cs.length) {
                  const idx = (profile?.cardIdx || 0) % cs.length;
                  const card = cs[idx];
                  saveProfile({ ...profile, cardIdx: (profile?.cardIdx || 0) + 1 });
                  setTimeout(() => setModal({ type: "card", data: card, auto: true }), 300);
                }
              }
            }}
            onDelete={modal.data ? (id) => { delEntry(id); close(); } : null}
            onClose={close}
          />
        )}
        {modal?.type === "card" && <CardModal card={modal.data} auto={modal.auto} onClose={close} onDisableAuto={() => { saveProfile({ ...profile, hideAutoCards: true }); }} />}
        {modal?.type === "snap" && (tier === "premium"
          ? <SnapModal snaps={snaps} onSave={(s) => { saveSnap(s); close(); }} onClose={close} />
          : <PremiumGate feature={t("premium.gate.snap")} description={t("premium.gate.snap_desc")} onClose={close} onRefreshTier={refreshTier} />
        )}
        {modal?.type === "settings" && <SettingsModal onClose={close} onExport={exportData} onImport={importData} onRedo={() => { setView("onboard"); close(); }} onErase={async () => { const db = await idb(); const tx = db.transaction([S.entries, S.profile, S.snapshots], "readwrite"); tx.objectStore(S.entries).clear(); tx.objectStore(S.profile).clear(); tx.objectStore(S.snapshots).clear(); tx.oncomplete = () => window.location.reload(); }} tier={tier} onSetTier={(t) => { setTier(t); saveProfile({ ...profile, tier: t }); }} isNativeApp={isNativeApp} onRefreshTier={refreshTier} profile={profile} onSaveProfile={saveProfile} />}

        {/* Header */}
        <header style={css.hdr}>
          <div>
            <h1 style={css.logo}>{t("app.name")}</h1>
            <p style={css.sub}>{t("app.tagline")}</p>
          </div>
          <button onClick={() => setModal({ type: "settings" })} style={css.iconBtn} aria-label="Settings">{"\u2699"}</button>
        </header>

        <Nav view={view} go={setView} />

        <main id="main-content" style={{ padding: "4px 16px 120px" }}>
          {view === "home" && <Home entries={entries} profile={profile} snaps={snaps} tier={tier} openEntry={openEntry} openSnap={() => setModal({ type: "snap" })} openCard={() => { const c = CARDS[Math.floor(Math.random() * CARDS.length)]; setModal({ type: "card", data: c }); }} />}
          {view === "timeline" && <Timeline entries={entries} snaps={snaps} range={timeRange} setRange={setTimeRange} openEntry={openEntry} />}
          {view === "patterns" && <Patterns entries={entries} mode={patMode} setMode={setPatMode} range={timeRange} setRange={setTimeRange} tier={tier} onRefreshTier={refreshTier} />}
          {view === "perspective" && <Perspective entries={entries} tier={tier} openCard={(c) => setModal({ type: "card", data: c })} />}
          {view === "partner" && <Partner entries={entries} profile={profile} snaps={snaps} tier={tier} onRefreshTier={refreshTier} />}
          {view === "benchmark" && <Benchmark profile={profile} snaps={snaps} entries={entries} tier={tier} openSnap={() => setModal({ type: "snap" })} onDeleteSnap={delSnap} onRefreshTier={refreshTier} />}
        </main>

        {/* FAB */}
        <button onClick={() => openEntry()} style={css.fab} aria-label="Log interaction">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  );
}
