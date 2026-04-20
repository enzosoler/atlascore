import React, { useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACBtn,
} from '../lib/paper.jsx';

/* ── status colors (amber for monitor, red for out-of-range) ──── */

const STATUS_AMBER = '#d4a017';
const STATUS_RED   = '#c65b4b';

/* ── demo data (gallery fallback) ─────────────────────────────── */

const DEMO_EXAMS = [
  { id: 'e-01', name: 'Q2 Comprehensive Panel', date: '2026-04-12', source: 'Function Health', optimalCount: 37, monitorCount: 3,  outCount: 2 },
  { id: 'e-02', name: 'Q1 Panel',               date: '2026-01-14', source: 'Function Health', optimalCount: 35, monitorCount: 5,  outCount: 2 },
  { id: 'e-03', name: 'Thyroid + Hormones',      date: '2025-10-08', source: 'LabCorp',         optimalCount: 8,  monitorCount: 1,  outCount: 0 },
  { id: 'e-04', name: 'Annual CBC + CMP',        date: '2025-07-22', source: 'Quest',           optimalCount: 22, monitorCount: 2,  outCount: 1 },
  { id: 'e-05', name: 'Q2 Comprehensive Panel', date: '2025-04-10', source: 'Function Health', optimalCount: 34, monitorCount: 6,  outCount: 2 },
  { id: 'e-06', name: 'Baseline Panel',          date: '2024-11-03', source: 'InsideTracker',   optimalCount: 30, monitorCount: 8,  outCount: 4 },
];

/**
 * S79_Lab_History -- all uploaded lab panels grouped by year.
 *
 * Each row: date, exam name, source, biomarker summary
 * (optimal / monitor / out counts as colored dots).
 * Upload button in header. Empty state with upload CTA.
 *
 * Gallery:    <S79_Lab_History dark />
 * Production: <S79_Lab_History dark exams={[...]}
 *               onOpenExam={fn} onUpload={fn} onBack={fn} />
 *
 * @param {boolean}  dark         - light/dark variant
 * @param {Array}    exams        - [{id, name, date, source, optimalCount, monitorCount, outCount}]
 * @param {Function} onOpenExam   - (id) => void
 * @param {Function} onUpload     - () => void
 * @param {Function} onBack       - () => void
 */
export default function S79_Lab_History({
  dark = false,
  exams,
  onOpenExam,
  onUpload,
  onBack,
}) {
  const c = useACT(dark);
  const _exams = exams || DEMO_EXAMS;

  const handleOpen   = (id) => { if (typeof onOpenExam === 'function') onOpenExam(id); };
  const handleUpload = ()   => { if (typeof onUpload === 'function') onUpload(); };
  const handleBack   = ()   => { if (typeof onBack === 'function') onBack(); };

  /* ── group by year, newest first ────────────────────────────── */

  const grouped = useMemo(() => {
    const by = {};
    for (const ex of _exams) {
      const d = new Date(ex.date);
      const y = d.getFullYear();
      if (!by[y]) by[y] = [];
      by[y].push(ex);
    }
    const years = Object.keys(by).map(Number).sort((a, b) => b - a);
    for (const y of years) {
      by[y].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return { years, by };
  }, [_exams]);

  const isEmpty = _exams.length === 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* ── nav bar ────────────────────────────────────────── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button" onClick={handleBack}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Lab history
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── scrollable content ─────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 28px' }}>

        {/* ── title + upload button ──────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
              letterSpacing: -0.8, lineHeight: 1.1, color: c.fg,
            }}>
              All panels
            </div>
            <div style={{ marginTop: 4 }}>
              <ACMono size={12} color={c.dim}>
                {_exams.length} {_exams.length === 1 ? 'panel' : 'panels'}
              </ACMono>
            </div>
          </div>
          <button
            type="button" onClick={handleUpload}
            style={{
              padding: '8px 14px', borderRadius: 999,
              border: `1px solid ${c.faint}`, background: 'transparent',
              color: c.fg, fontSize: 12, fontWeight: 600,
              fontFamily: ACFonts.body, cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            + Upload
          </button>
        </div>

        {/* ── empty state ────────────────────────────────── */}
        {isEmpty && (
          <div style={{
            marginTop: 28, padding: 28, background: c.card,
            borderRadius: ACRadii.card, textAlign: 'center',
          }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
              color: c.fg, letterSpacing: -0.3,
            }}>
              No panels yet
            </div>
            <ACLabel size={13} color={c.dim} style={{ marginTop: 8, display: 'block', lineHeight: 1.5 }}>
              Upload your first lab PDF to turn this into a living biology timeline.
            </ACLabel>
            <div style={{ marginTop: 18 }}>
              <ACBtn primary dark={dark} onClick={handleUpload} size="md">
                Upload panel
              </ACBtn>
            </div>
          </div>
        )}

        {/* ── grouped exam list ──────────────────────────── */}
        {!isEmpty && grouped.years.map((year) => (
          <div key={year} style={{ marginTop: 24 }}>
            {/* year header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 10,
            }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                {year}
              </ACLabel>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>
                {grouped.by[year].length} panel{grouped.by[year].length !== 1 ? 's' : ''}
              </ACLabel>
            </div>

            {/* exam rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {grouped.by[year].map((ex) => (
                <ExamRow
                  key={ex.id}
                  exam={ex}
                  c={c}
                  dark={dark}
                  onTap={() => handleOpen(ex.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── sub-components ───────────────────────────────────────────── */

function ExamRow({ exam, c, dark, onTap }) {
  const d = new Date(exam.date);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const day     = d.getDate();
  const month   = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const totalMarkers = (exam.optimalCount || 0) + (exam.monitorCount || 0) + (exam.outCount || 0);

  return (
    <button
      type="button" onClick={onTap}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', background: c.card, borderRadius: ACRadii.card,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent', color: c.fg,
      }}
    >
      {/* date chip */}
      <div style={{ width: 42, textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.5, color: c.mute, fontWeight: 600 }}>
          {weekday}
        </div>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
          fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4, color: c.fg,
        }}>
          {day}
        </div>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.3, color: c.mute }}>
          {month}
        </div>
      </div>

      {/* separator */}
      <div style={{ width: 1, alignSelf: 'stretch', background: c.hair }} />

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 15, fontWeight: 600,
          letterSpacing: -0.2, color: c.fg,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {exam.name || 'Lab panel'}
        </div>
        {exam.source && (
          <ACLabel size={11} color={c.dim} style={{ marginTop: 2, display: 'block' }}>
            {exam.source}
          </ACLabel>
        )}

        {/* biomarker status dots */}
        {totalMarkers > 0 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 10, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {exam.optimalCount > 0 && (
              <StatusCount count={exam.optimalCount} label="optimal" color={c.accent} />
            )}
            {exam.monitorCount > 0 && (
              <StatusCount count={exam.monitorCount} label="monitor" color={STATUS_AMBER} />
            )}
            {exam.outCount > 0 && (
              <StatusCount count={exam.outCount} label="out" color={STATUS_RED} />
            )}
          </div>
        )}
      </div>

      {/* chevron */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
        <path d="M4.5 2.5l3.5 3.5-3.5 3.5" stroke={c.fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function StatusCount({ count, label, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color, display: 'inline-block' }} />
      <span style={{ color, fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif' }}>
        {count} {label}
      </span>
    </span>
  );
}
