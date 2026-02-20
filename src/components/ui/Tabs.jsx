import { P } from "../../config/index.js";

export default function Tabs({ items, active, onPick }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 3, marginBottom: 14, background: P.card, borderRadius: 9, padding: 3 }}>
      {items.map(i => (
        <button key={i} role="tab" aria-selected={active === i} onClick={() => onPick(i)} style={{
          flex: 1, padding: "8px 10px", borderRadius: 7, border: "none", cursor: "pointer",
          fontSize: 12, fontFamily: "inherit", fontWeight: 500,
          background: active === i ? P.warm + "28" : "transparent",
          color: active === i ? P.warm : P.dim,
          transition: "all .15s",
        }}>
          {i}
        </button>
      ))}
    </div>
  );
}
