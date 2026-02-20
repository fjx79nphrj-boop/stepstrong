import { Capacitor } from "@capacitor/core";
import { InAppReview } from "@capacitor-community/in-app-review";

// Returns the Monday of the week for a given date string — used to count distinct calendar weeks
function weekKey(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
}

// 14+ entries AND at least 3 different calendar weeks represented
export function meetsReviewCriteria(entries) {
  if (entries.length < 14) return false;
  const weeks = new Set(entries.map(e => weekKey(e.date)));
  return weeks.size >= 3;
}

export async function requestReview() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await InAppReview.requestReview();
  } catch (e) {
    console.error("Review request error:", e);
  }
}
