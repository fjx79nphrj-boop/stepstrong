import { useState, useEffect, useRef } from "react";
import { ACTIONS, RESPONSES, CONTEXTS, P, t, CONTEXT_MIGRATION } from "../config/index.js";
import { uid } from "../utils/helpers.js";
import { css } from "../styles/css.js";
import Modal from "./ui/Modal.jsx";
import Btn from "./ui/Btn.jsx";
import Chip from "./ui/Chip.jsx";

export default function EntryModal({ entry, onSave, onDelete, onClose }) {
  const isEdit = !!entry;
  const [action, setAction] = useState(entry?.action || "");
  const [response, setResponse] = useState(entry?.response || "");
  const [note, setNote] = useState(entry?.note || "");
  const [ctxs, setCtxs] = useState(() => {
    // Migrate old string-based contexts to IDs
    if (!entry?.contexts) return [];
    return entry.contexts.map(c => CONTEXT_MIGRATION[c] || c);
  });
  const [date, setDate] = useState(entry?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [confirmDel, setConfirmDel] = useState(false);
  const [photo, setPhoto] = useState(entry?.photo || null);
  const [photoZoom, setPhotoZoom] = useState(false);
  const [storagePct, setStoragePct] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        setStoragePct(quota > 0 ? Math.round((usage / quota) * 100) : 0);
      }).catch(() => {});
    }
  }, []);

  const toggle = (id) => setCtxs(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const valid = action && response;
  const photoDisabled = storagePct >= 90;
  const photoWarning = storagePct >= 70;

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const max = 400;
        let w = img.width, h = img.height;
        if (w > max || h > max) {
          if (w > h) { h = Math.round(h * max / w); w = max; }
          else { w = Math.round(w * max / h); h = max; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        setPhoto(canvas.toDataURL("image/jpeg", 0.5));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal onClose={onClose} title={isEdit ? t("entry.edit_title") : t("entry.log_title")}>
      <label htmlFor="entry-date" style={css.label}>{t("entry.date")}</label>
      <input id="entry-date" type="date" value={date} onChange={e => setDate(e.target.value)} style={css.dateIn} />

      <label style={css.label}>{t("entry.what_did_you_do")}</label>
      <div style={css.chips}>
        {ACTIONS.map(a => <Chip key={a.id} active={action === a.id} color={a.color} onClick={() => setAction(a.id)}>{a.icon} {t("action." + a.id)}</Chip>)}
      </div>

      <label style={css.label}>{t("entry.how_respond")}</label>
      <div style={css.chips}>
        {RESPONSES.map(r => <Chip key={r.id} active={response === r.id} color={r.color} onClick={() => setResponse(r.id)}>{r.icon} {t("response." + r.id)}</Chip>)}
      </div>

      <label style={css.label}>{t("entry.context")} <span style={{ color: P.dim, fontWeight: 400 }}>({t("entry.optional")})</span></label>
      <div style={css.chips}>
        {CONTEXTS.map(c => <Chip key={c.id} small active={ctxs.includes(c.id)} color={P.warm} onClick={() => toggle(c.id)}>{t("context." + c.id)}</Chip>)}
      </div>

      <label style={css.label}>{t("entry.photo")} <span style={{ color: P.dim, fontWeight: 400 }}>({t("entry.optional")})</span></label>
      {photoDisabled && (
        <p style={{ color: P.red, fontSize: 12, marginBottom: 10, lineHeight: 1.4 }}>{t("entry.storage_full").replace("{pct}", storagePct)}</p>
      )}
      {!photoDisabled && photoWarning && (
        <p style={{ color: P.warm, fontSize: 11, marginBottom: 8, lineHeight: 1.4 }}>{t("entry.storage_warning").replace("{pct}", storagePct)}</p>
      )}
      {photo ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }} onClick={() => setPhotoZoom(true)}>
            <img src={photo} alt="Attached photo — tap to enlarge" style={{ width: "100%", maxWidth: 220, borderRadius: 10, display: "block", border: `1px solid ${P.border}` }} />
            <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#fff" }}>{t("entry.tap_enlarge")}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setPhoto(null); if (fileRef.current) fileRef.current.value = ""; }} aria-label={t("entry.remove_photo")} style={{ marginTop: 6, background: "none", border: "none", color: P.dim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "4px 0" }}>{t("entry.remove_photo")}</button>
        </div>
      ) : !photoDisabled ? (
        <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 9, border: `1px dashed ${P.border2}`, background: "transparent", color: P.dim, cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 14, width: "100%", minHeight: 44 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          {t("entry.add_photo")}
        </button>
      ) : null}
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} aria-label="Choose photo" />

      <label htmlFor="entry-notes" style={css.label}>{t("entry.notes")} <span style={{ color: P.dim, fontWeight: 400 }}>({t("entry.optional")})</span></label>
      <textarea id="entry-notes" value={note} onChange={e => setNote(e.target.value)} placeholder={t("entry.notes_placeholder")} style={css.textarea} rows={3} />

      <Btn onClick={() => { if (valid) onSave({ id: entry?.id || uid(), date: new Date(date + "T12:00:00").toISOString(), action, response, note, contexts: ctxs, photo: photo || undefined }); }} full disabled={!valid} style={{ marginTop: 16 }}>{isEdit ? t("entry.update") : t("entry.save")}</Btn>

      {isEdit && onDelete && (
        !confirmDel
          ? <button onClick={() => setConfirmDel(true)} style={{ ...css.textBtn, color: P.dim, marginTop: 8 }}>{t("entry.delete")}</button>
          : <div style={{ textAlign: "center", marginTop: 8 }}>
              <p style={{ color: P.red, fontSize: 12, margin: "0 0 6px" }}>{t("entry.delete_confirm")}</p>
              <button onClick={() => onDelete(entry.id)} style={{ ...css.textBtn, color: P.red }}>{t("entry.delete_yes")}</button>
              <button onClick={() => setConfirmDel(false)} style={{ ...css.textBtn, color: P.dim, marginLeft: 12 }}>{t("entry.cancel")}</button>
            </div>
      )}

      {/* Photo lightbox */}
      {photoZoom && photo && (
        <div onClick={() => setPhotoZoom(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" }}>
          <img src={photo} alt="Full size photo" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} />
          <button onClick={() => setPhotoZoom(false)} aria-label="Close photo" style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u2715"}</button>
        </div>
      )}
    </Modal>
  );
}
