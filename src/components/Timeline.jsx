import { useState, useMemo } from "react";
import { RESPONSES, P, t } from "../config/index.js";
import { fmtShortYr } from "../utils/helpers.js";
import { css, cssChip } from "../styles/css.js";
import Tabs from "./ui/Tabs.jsx";
import Stat from "./ui/Stat.jsx";
import EntryRow from "./ui/EntryRow.jsx";

export default function Timeline({ entries, snaps, range, setRange, openEntry }) {
  const ranges = { "1m": 30, "3m": 90, "6m": 180, "1y": 365, all: 99999 };
  const cut = Date.now() - ranges[range] * 86400000;
  const fil = useMemo(() =>
    entries.filter(e => new Date(e.date).getTime() >= cut).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [entries, cut]
  );

  const groups = useMemo(() => {
    const m = {};
    fil.forEach(e => {
      const d = new Date(e.date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!m[k]) m[k] = [];
      m[k].push(e);
    });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ key: k, entries: v }));
  }, [fil]);

  const scores = groups.map(g => {
    const s = g.entries.map(e => RESPONSES.find(r => r.id === e.response)?.score ?? 2);
    return { ...g, avg: s.reduce((a, b) => a + b, 0) / s.length, count: g.entries.length };
  });

  const [seriesFilter, setSeriesFilter] = useState("all");
  const seriesData = useMemo(() => {
    const allDates = groups.map(g => g.key);
    return RESPONSES.map(r => {
      const counts = groups.map(g => g.entries.filter(e => e.response === r.id).length);
      return { ...r, counts, dates: allDates };
    });
  }, [groups]);

  const trend = (arr) => {
    if (arr.length < 3) return arr;
    return arr.map((_, i) => {
      const start = Math.max(0, i - 1);
      const end = Math.min(arr.length, i + 2);
      const slice = arr.slice(start, end);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
  };

  const fmtKey = (k) => {
    const [y, m, d] = k.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m) - 1]} ${parseInt(d)}, '${y.slice(2)}`;
  };

  const weeklySeriesData = useMemo(() => {
    if (groups.length <= 30) return null;
    const weekMap = {};
    groups.forEach(g => {
      const d = new Date(g.key);
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const wk = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
      const wKey = `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`;
      if (!weekMap[wKey]) weekMap[wKey] = { key: wKey, entries: [], firstDate: g.key };
      weekMap[wKey].entries.push(...g.entries);
    });
    const weeks = Object.values(weekMap).sort((a, b) => a.key.localeCompare(b.key));
    return RESPONSES.map(r => {
      const counts = weeks.map(w => w.entries.filter(e => e.response === r.id).length);
      return { ...r, counts, dates: weeks.map(w => w.firstDate) };
    });
  }, [groups]);

  const weeklyMaxY = useMemo(() => {
    if (!weeklySeriesData) return 0;
    let mx = 0;
    weeklySeriesData.forEach(s => s.counts.forEach(c => { if (c > mx) mx = c; }));
    return mx;
  }, [weeklySeriesData]);

  const useWeekly = weeklySeriesData && groups.length > 30;

  const SmallMultiple = ({ data, maxY }) => {
    const w = 280, h = 60, padL = 0, padR = 4;
    const n = data.counts.length;
    if (n === 0) return null;
    const cMax = Math.max(maxY, 1);
    const xStep = n > 1 ? (w - padL - padR) / (n - 1) : 0;
    const points = data.counts.map((c, i) => ({ x: padL + i * xStep, y: h - 4 - (c / cMax) * (h - 8) }));
    const trendVals = trend(data.counts);
    const trendPts = trendVals.map((c, i) => ({ x: padL + i * xStep, y: h - 4 - (c / cMax) * (h - 8) }));
    const trendD = trendPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const areaD = trendD + ` L${trendPts[trendPts.length - 1].x},${h - 4} L${trendPts[0].x},${h - 4} Z`;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h, display: "block" }} aria-hidden="true">
        <line x1={padL} y1={h - 4} x2={w - padR} y2={h - 4} stroke={P.border} strokeWidth="0.5" />
        <path d={areaD} fill={data.color + "15"} />
        <path d={trendD} fill="none" stroke={data.color} strokeWidth="2" />
        {n <= 30 && points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill={data.color} opacity="0.5" />)}
      </svg>
    );
  };

  const globalMaxDaily = useMemo(() => {
    let mx = 0;
    groups.forEach(g => {
      RESPONSES.forEach(r => {
        const c = g.entries.filter(e => e.response === r.id).length;
        if (c > mx) mx = c;
      });
    });
    return mx;
  }, [groups]);

  const filteredSeries = seriesFilter === "all"
    ? (useWeekly ? weeklySeriesData : seriesData)
    : (useWeekly ? weeklySeriesData : seriesData).filter(s => s.id === seriesFilter);

  return (
    <div>
      <Tabs items={Object.keys(ranges).map(r => r === "all" ? t("common.all") : r)} active={range === "all" ? t("common.all") : range} onPick={(v) => setRange(v === t("common.all") ? "all" : v)} />

      {fil.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ color: P.dim }}>{t("timeline.no_entries")}</p>
        </div>
      ) : (
        <>
          {/* Daily tone bar chart */}
          <div style={{ ...css.card, padding: 16, marginBottom: 12 }}>
            {(() => {
              let bars = scores;
              let barLabel = "day";
              if (scores.length > 90) {
                const weekMap = {};
                scores.forEach(g => {
                  const d = new Date(g.key);
                  const jan1 = new Date(d.getFullYear(), 0, 1);
                  const wk = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
                  const wKey = `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`;
                  if (!weekMap[wKey]) weekMap[wKey] = { key: g.key, totalScore: 0, totalCount: 0 };
                  weekMap[wKey].totalScore += g.avg * g.count;
                  weekMap[wKey].totalCount += g.count;
                });
                bars = Object.values(weekMap).sort((a, b) => a.key.localeCompare(b.key)).map(w => ({
                  key: w.key, avg: w.totalScore / w.totalCount, count: w.totalCount
                }));
                barLabel = "week";
              }
              return (
                <>
                  <p style={{ color: P.dim, fontSize: 12, margin: "0 0 10px" }}>Each bar is one {barLabel}. Taller = more positive. Color = overall tone.</p>
                  <div style={{ display: "flex", gap: bars.length > 60 ? 1 : 2, alignItems: "flex-end", height: 80 }}>
                    {bars.map((g, i) => {
                      const hPx = Math.max(Math.round((g.avg / 4) * 70), 4);
                      const c = g.avg >= 3 ? P.green : g.avg >= 2 ? P.blue : g.avg >= 1 ? P.rose : P.red;
                      return (
                        <div key={i} title={`${fmtKey(g.key)}: avg ${g.avg.toFixed(1)}/4 (${g.count} entries)`} style={{ flex: 1, minWidth: 2 }}>
                          <div style={{ width: "100%", height: hPx, background: c, borderRadius: "2px 2px 0 0" }} />
                        </div>
                      );
                    })}
                  </div>
                  {bars.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ color: P.dimmer, fontSize: 9 }}>{fmtKey(bars[0].key)}</span>
                      {bars.length > 2 && <span style={{ color: P.dimmer, fontSize: 9 }}>{fmtKey(bars[Math.floor(bars.length / 2)].key)}</span>}
                      <span style={{ color: P.dimmer, fontSize: 9 }}>{fmtKey(bars[bars.length - 1].key)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: P.red }}>{"\u25CF"} {t("timeline.very_hard")}</span>
                    <span style={{ fontSize: 10, color: P.rose }}>{"\u25CF"} {t("timeline.difficult")}</span>
                    <span style={{ fontSize: 10, color: P.blue }}>{"\u25CF"} {t("timeline.mixed")}</span>
                    <span style={{ fontSize: 10, color: P.green }}>{"\u25CF"} {t("timeline.positive")}</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Small multiples */}
          {groups.length >= 2 && (
            <div style={{ ...css.card, padding: 16, marginBottom: 12 }}>
              <p style={{ color: P.dim, fontSize: 12, margin: "0 0 8px" }}>Response frequency over time {useWeekly ? "(weekly)" : "(daily)"} &mdash; trend line shows direction</p>
              <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                <button onClick={() => setSeriesFilter("all")} style={{ ...cssChip(seriesFilter === "all", P.warm) }}>{t("common.all")}</button>
                {RESPONSES.map(r => (
                  <button key={r.id} onClick={() => setSeriesFilter(r.id)} style={{ ...cssChip(seriesFilter === r.id, r.color) }}>{r.icon} {t("response." + r.id)}</button>
                ))}
              </div>
              {filteredSeries.map(s => {
                const hasData = s.counts.some(c => c > 0);
                if (!hasData) return null;
                return (
                  <div key={s.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: s.color }}>{s.icon}</span>
                      <span style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{t("response." + s.id)}</span>
                      <span style={{ fontSize: 10, color: P.dim }}>({s.counts.reduce((a, b) => a + b, 0)} {t("common.total")})</span>
                    </div>
                    <SmallMultiple data={s} maxY={useWeekly ? weeklyMaxY : globalMaxDaily} />
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ color: P.dimmer, fontSize: 9 }}>{fmtKey(groups[0].key)}</span>
                {groups.length > 2 && <span style={{ color: P.dimmer, fontSize: 9 }}>{fmtKey(groups[Math.floor(groups.length / 2)].key)}</span>}
                <span style={{ color: P.dimmer, fontSize: 9 }}>{fmtKey(groups[groups.length - 1].key)}</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Stat n={fil.length} l={t("timeline.interactions")} />
            <Stat n={fil.filter(e => e.response === "positive" || e.response === "neutral").length} l={t("timeline.positive_neutral")} />
            <Stat n={fil.filter(e => e.response === "rejection" || e.response === "escalation").length} l={t("timeline.rejections")} />
          </div>

          {/* Entries with snapshot markers */}
          {(() => {
            const items = fil.slice(-60).map(e => ({ type: "entry", data: e, date: new Date(e.date) }));
            snaps.forEach(s => {
              const sd = new Date(s.date);
              if (sd.getTime() >= cut) items.push({ type: "snap", data: s, date: sd });
            });
            items.sort((a, b) => b.date - a.date);
            return items.map((item, i) => {
              if (item.type === "entry") return <EntryRow key={item.data.id} entry={item.data} onClick={() => openEntry(item.data)} />;
              return (
                <div key={"snap-" + item.data.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", margin: "4px 0", borderLeft: `3px solid ${P.purple}`, background: P.card2, borderRadius: "0 8px 8px 0" }}>
                  <span style={{ fontSize: 13 }}>{"\uD83D\uDCCA"}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: P.purple, fontSize: 11, fontWeight: 500 }}>{t("timeline.progress_snapshot")}</span>
                    <span style={{ color: P.dim, fontSize: 10, marginLeft: 6 }}>{fmtShortYr(item.data.date)}</span>
                  </div>
                </div>
              );
            });
          })()}
          {fil.length > 60 && <p style={{ color: P.dim, fontSize: 12, textAlign: "center", padding: 12 }}>Showing 60 of {fil.length}</p>}
        </>
      )}
    </div>
  );
}
