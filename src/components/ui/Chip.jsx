import { P } from "../../config/index.js";

export default function Chip({ children, active, color, onClick, small }) {
  return (
    <button onClick={onClick} aria-pressed={active} style={{
      padding: small ? "6px 12px" : "10px 16px",
      borderRadius: small ? 7 : 9,
      border: `1px solid ${active ? color : P.border}`,
      background: active ? color + "22" : "transparent",
      color: active ? color : P.dim,
      cursor: "pointer",
      fontSize: small ? 12 : 13,
      fontFamily: "inherit",
      transition: "all .15s",
      whiteSpace: "nowrap",
      minHeight: 44,
    }}>
      {children}
    </button>
  );
}
