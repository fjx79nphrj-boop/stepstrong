import en from "../i18n/en.json";

export { ACTIONS } from "./actions.js";
export { RESPONSES } from "./responses.js";
export { CONTEXTS, CONTEXT_MIGRATION } from "./contexts.js";
export { CARDS } from "./cards.js";
export { DAILY_QUOTES } from "./quotes.js";
export { PARTNER_TIPS } from "./partnerTips.js";
export { ALIENATION } from "./alienation.js";
export { BENCH } from "./bench.js";
export { SNAP_Q } from "./snapQuestions.js";
export { P } from "./theme.js";

const strings = en;

export function t(key) {
  return strings[key] ?? key;
}
