import { P } from "../../config/index.js";

export default function Stat({ n, l }) {
  return (
    <div style={{ flex: 1, background: P.card, borderRadius: 11, padding: "12px 10px", textAlign: "center", border: `1px solid ${P.border}` }}>
      <div style={{ color: P.text, fontSize: 18, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 }}>{n}</div>
      <div style={{ color: P.dim, fontSize: 10, marginTop: 2 }}>{l}</div>
    </div>
  );
}
