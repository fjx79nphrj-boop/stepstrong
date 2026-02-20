import { useEffect } from "react";
import { P } from "../../config/index.js";
import { css } from "../../styles/css.js";

export default function Modal({ children, onClose, title, titleColor, small }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={css.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div style={{ ...css.modal, maxWidth: small ? 400 : 600 }} onClick={e => e.stopPropagation()}>
        <div style={{ ...css.modalHdr, borderBottom: `1px solid ${P.border}` }}>
          <h2 style={{ ...css.modalTitle, color: titleColor || P.text }} id="modal-title">{title}</h2>
          <button onClick={onClose} style={css.closeBtn} aria-label="Close dialog">{"\u2715"}</button>
        </div>
        <div style={{ padding: "16px 20px 24px", overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>{children}</div>
      </div>
    </div>
  );
}
