import { P } from "../../config/index.js";

export default function Btn({ children, onClick, full, secondary, disabled, style }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        background: secondary ? P.card2 : `linear-gradient(135deg, ${P.warm}, #C4956A)`,
        color: secondary ? P.muted : P.bg,
        border: secondary ? `1px solid ${P.border}` : "none",
        borderRadius: 11,
        padding: "12px 22px",
        fontSize: 14,
        fontWeight: secondary ? 400 : 600,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity .2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
