import { useState } from "react";
import { SNAP_Q, P, t } from "../config/index.js";
import { uid } from "../utils/helpers.js";
import { css } from "../styles/css.js";
import Modal from "./ui/Modal.jsx";
import Btn from "./ui/Btn.jsx";
import Chip from "./ui/Chip.jsx";

export default function SnapModal({ snaps, onSave, onClose }) {
  const [ans, setAns] = useState({});
  const done = SNAP_Q.every(q => ans[q.id] !== undefined);

  return (
    <Modal onClose={onClose} title={t("snap.title")}>
      <p style={{ color: P.dim, fontSize: 13, marginBottom: 16 }}>{t("snap.intro")}</p>
      {SNAP_Q.map(q => (
        <div key={q.id} style={{ marginBottom: 18 }}>
          <label style={{ ...css.label, fontSize: 13 }}>{q.q}</label>
          <div style={css.chips}>
            {q.s.map((s, i) => <Chip key={i} small active={ans[q.id] === i} color={P.warm} onClick={() => setAns(p => ({ ...p, [q.id]: i }))}>{s}</Chip>)}
          </div>
        </div>
      ))}
      <Btn onClick={() => { if (done) onSave({ id: uid(), date: new Date().toISOString(), answers: ans }); }} full disabled={!done}>{t("snap.save")}</Btn>
    </Modal>
  );
}
