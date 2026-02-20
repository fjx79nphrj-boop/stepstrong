import { ACTIONS, RESPONSES, P, t, CONTEXT_MIGRATION } from "../../config/index.js";
import { fmtShortYr } from "../../utils/helpers.js";
import { css } from "../../styles/css.js";

// Resolve a context value to its display label.
// Handles both old string-based contexts and new ID-based ones.
function contextLabel(ctx) {
  // If it's an old-style string that exists in migration map, use it as-is (it IS the label)
  if (CONTEXT_MIGRATION[ctx]) return ctx;
  // Otherwise it's a new-style ID — look up via t()
  return t("context." + ctx);
}

export default function EntryRow({ entry, onClick }) {
  const a = ACTIONS.find(x => x.id === entry.action);
  const r = RESPONSES.find(x => x.id === entry.response);
  const actionLabel = a ? t("action." + a.id) : "Entry";
  const responseLabel = r ? t("response." + r.id) : "";
  return (
    <button onClick={onClick} aria-label={`${actionLabel} - ${responseLabel} on ${fmtShortYr(entry.date)}`} style={{ ...css.card, width: "100%", padding: 12, marginBottom: 6, textAlign: "left", cursor: "pointer", fontFamily: "inherit", border: `1px solid ${P.border}` }}>
      <div style={{ display: "flex", gap: 10 }}>
        {entry.photo && (
          <img src={entry.photo} alt="" style={{ width: 44, height: 44, borderRadius: 7, objectFit: "cover", flexShrink: 0, border: `1px solid ${P.border}` }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: entry.note ? 4 : 0, flexWrap: "wrap", gap: 4 }}>
            <span style={{ color: P.dim, fontSize: 11 }}>{fmtShortYr(entry.date)}</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {a && <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 11, background: a.color + "1a", color: a.color }}>{a.icon} {actionLabel}</span>}
              {r && <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 11, background: r.color + "1a", color: r.color }}>{r.icon}</span>}
            </div>
          </div>
          {entry.note && <p style={{ color: P.muted, fontSize: 12, margin: 0, lineHeight: 1.4 }}>{entry.note.slice(0, 100)}{entry.note.length > 100 ? "\u2026" : ""}</p>}
          {entry.contexts?.length > 0 && (
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4 }}>
              {entry.contexts.map(c => <span key={c} style={{ padding: "1px 5px", borderRadius: 3, fontSize: 9, color: P.dim, background: P.card2 }}>{contextLabel(c)}</span>)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
