import { P } from "../../config/index.js";

export default function SectionTitle({ children }) {
  return <div style={{ color: P.dim, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", margin: "16px 0 8px", fontWeight: 500 }}>{children}</div>;
}
