export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtShort = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const fmtShortYr = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });

export const daysAgo = (d) =>
  Math.round((Date.now() - new Date(d).getTime()) / 86400000);
