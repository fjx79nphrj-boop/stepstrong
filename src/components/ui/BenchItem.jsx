import { P } from "../../config/index.js";
import { css } from "../../styles/css.js";

export default function BenchItem({ label, value }) {
  return (
    <div style={{ ...css.card, padding: 11, display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ color: P.dim, fontSize: 11 }}>{label}</span>
      <span style={{ color: P.text, fontSize: 13, textTransform: "capitalize" }}>{value}</span>
    </div>
  );
}
