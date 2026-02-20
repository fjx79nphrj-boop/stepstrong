import { P } from "../config/index.js";

export const cssChip = (active, color) => ({
  padding: "4px 9px",
  borderRadius: 7,
  border: `1px solid ${active ? color : P.border}`,
  background: active ? color + "22" : "transparent",
  color: active ? color : P.dim,
  cursor: "pointer",
  fontSize: 11,
  fontFamily: "inherit",
  whiteSpace: "nowrap",
});

export const css = {
  root: { background: P.bg, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#D1D5DB", WebkitFontSmoothing: "antialiased" },
  shell: { maxWidth: 600, margin: "0 auto", position: "relative" },
  hdr: { padding: "max(22px, calc(env(safe-area-inset-top, 22px) + 8px)) 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { fontSize: 26, fontFamily: "Georgia, 'Times New Roman', serif", color: P.text, margin: 0, fontWeight: 500, letterSpacing: "-0.02em" },
  sub: { fontSize: 11, color: P.dim, margin: "2px 0 0", fontStyle: "italic" },
  iconBtn: { background: "none", border: "none", color: P.dim, cursor: "pointer", padding: 12, fontSize: 18, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" },
  nav: { display: "flex", borderBottom: `1px solid ${P.border}`, padding: "0 8px", overflowX: "auto" },
  navBtn: { flex: 1, background: "none", border: "none", cursor: "pointer", padding: "12px 6px 10px", minHeight: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", transition: "color .2s" },
  fab: { position: "fixed", bottom: 22, right: 22, width: 54, height: 54, borderRadius: 27, background: `linear-gradient(135deg, ${P.warm}, #C4956A)`, color: P.bg, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px ${P.warm}44`, zIndex: 50 },
  card: { background: P.card, borderRadius: 12, border: `1px solid ${P.border}` },
  prompt: { width: "100%", background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: 14, display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", textAlign: "left", marginBottom: 10, fontFamily: "inherit" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.72)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modal: { background: P.card, borderRadius: "18px 18px 0 0", width: "100%", maxHeight: "min(85vh, calc(100dvh - 40px))", overflow: "hidden", border: `1px solid ${P.border}`, borderBottom: "none", display: "flex", flexDirection: "column" },
  modalHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 0", flexShrink: 0, background: P.card, zIndex: 10 },
  modalTitle: { color: P.text, fontSize: 17, fontFamily: "Georgia, 'Times New Roman', serif", margin: 0, fontWeight: 500 },
  closeBtn: { background: "none", border: "none", color: P.dim, fontSize: 17, cursor: "pointer", padding: 12, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" },
  label: { display: "block", color: P.muted, fontSize: 12, marginBottom: 7, fontWeight: 500 },
  dateIn: { background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: "9px 11px", color: "#D1D5DB", fontSize: 14, fontFamily: "inherit", marginBottom: 14, width: "100%", boxSizing: "border-box", colorScheme: "dark" },
  chips: { display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  textarea: { width: "100%", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 9, padding: 11, color: "#D1D5DB", fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 },
  textBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: "6px 14px" },
  obText: { color: P.muted, fontSize: 15, lineHeight: 1.7, margin: "0 0 12px" },
};
