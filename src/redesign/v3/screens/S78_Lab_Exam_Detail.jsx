import React, { useMemo, useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACChip, ACBtn,
} from '../lib/paper.jsx';

/* ── status colors (amber for monitor, red for out-of-range) ──── */

const STATUS_ACCENT  = null;  // resolved from theme (c.accent → optimal)
const STATUS_AMBER   = '#d4a017';
const STATUS_RED     = '#c65b4b';

function statusColor(status, c) {
  if (status === 'optimal')  return c.accent;
  if (status === 'monitor')  return STATUS_AMBER;
  if (status === 'out')      return STATUS_RED;
  return c.dim;
}

function statusLabel(status) {
  if (status === 'optimal')  return 'Optimal';
  if (status === 'monitor')  return 'Monitor';
  if (status === 'out')      return 'Out of range';
  return status || '';
}

/* ── demo data (gallery fallback) ─────────────────────────────── */

const DEMO_EXAM = {
  id: 'exam-001',
  name: 'Q2 Comprehensive Panel',
  date: '2026-04-12',
  source: 'Function Health',
  provider: 'Dr. Patel',
  summary: '42 biomarkers analyzed',
};

const DEMO_BIOMARKERS = [
  { id: 'b-01', name: 'ApoB',             value: 82,   unit: 'mg/dL',  status: 'out',     category: 'Cardiovascular' },
  { id: 'b-02', name: 'hs-CRP',           value: 0.6,  unit: 'mg/L',   status: 'optimal', category: 'Inflammation' },
  { id: 'b-03', name: 'HbA1c',            value: 5.2,  unit: '%',      status: 'optimal', category: 'Metabolic' },
  { id: 'b-04', name: 'Vitamin D',        value: 28,   unit: 'ng/mL',  status: 'monitor', category: 'Vitamins' },
  { id: 'b-05', name: 'Testosterone',     value: 642,  unit: 'ng/dL',  status: 'optimal', category: 'Hormones' },
  { id: 'b-06', name: 'Fasting glucose',  value: 92,   unit: 'mg/dL',  status: 'optimal', category: 'Metabolic' },
  { id: 'b-07', name: 'Ferritin',         value: 18,   unit: 'ng/mL',  status: 'out',     category: 'Blood count' },
  { id: 'b-08', name: 'LDL-C',            value: 118,  unit: 'mg/dL',  status: 'monitor', category: 'Cardiovascular' },
  { id: 'b-09', name: 'TSH',              value: 2.1,  unit: 'mIU/L',  status: 'optimal', category: 'Hormones' },
  { id: 'b-10', name: 'ALT',              value: 22,   unit: 'U/L',    status: 'optimal', category: 'Metabolic' },
];

const DEMO_COACH_SUMMARY = {
  title: 'Two markers need action',
  body: 'ApoB is above optimal and correlates with your recent sat-fat intake climbing to 28g/day. Ferritin is low at 18 — consider a 4-week iron protocol with vitamin C co-factor. Everything else is tracking well.',
};

/**
 * S78_Lab_Exam_Detail -- single lab panel overview with coach summary,
 * category filter chips, and biomarker list.
 *
 * Gallery:    <S78_Lab_Exam_Detail dark />
 * Production: <S78_Lab_Exam_Detail dark exam={{...}} biomarkers={[...]}
 *               coachSummary={{title, body}}
 *               onBack={fn} onOpenBiomarker={fn} onAsk={fn} onShare={fn} />
 *
 * @param {boolean}  dark              - light/dark variant
 * @param {Object}   exam              - {id, name, date, source, provider, summary}
 * @param {Array}    biomarkers        - [{id, name, value, unit, status, category}]
 * @param {Object}   coachSummary      - {title, body}
 * @param {Function} onBack            - back navigation
 * @param {Function} onOpenBiomarker   - (id) => void
 * @param {Function} onAsk             - ({examId}) => void
 * @param {Function} onShare           - ({examId}) => void
 */
export default function S78_Lab_Exam_Detail({
  dark = false,
  exam,
  biomarkers,
  coachSummary,
  onBack,
  onOpenBiomarker,
  onAsk,
  onShare,
}) {
  const c = useACT(dark);
  const _exam       = exam || DEMO_EXAM;
  const _biomarkers = biomarkers || DEMO_BIOMARKERS;
  const _coach      = coachSummary || DEMO_COACH_SUMMARY;

  const [filter, setFilter] = useState('All');

  const handleBack   = () => { if (typeof onBack === 'function') onBack(); };
  const handleOpen   = (id) => { if (typeof onOpenBiomarker === 'function') onOpenBiomarker(id); };
  const handleAsk    = () => { if (typeof onAsk === 'function') onAsk({ examId: _exam.id }); };
  const handleShare  = () => { if (typeof onShare === 'function') onShare({ examId: _exam.id }); };

  /* ── derive categories from biomarkers ──────────────────────── */

  const categories = useMemo(() => {
    const cats = new Set();
    for (const b of _biomarkers) {
      if (b.category) cats.add(b.category);
    }
    return ['All', 'Flagged', ...Array.from(cats)];
  }, [_biomarkers]);

  const visible = useMemo(() => {
    if (filter === 'All') return _biomarkers;
    if (filter === 'Flagged') return _biomarkers.filter((b) => b.status === 'monitor' || b.status === 'out');
    return _biomarkers.filter((b) => b.category === filter);
  }, [_biomarkers, filter]);

  /* ── counts for header ──────────────────────────────────────── */

  const counts = useMemo(() => {
    let optimal = 0, monitor = 0, out = 0;
    for (const b of _biomarkers) {
      if (b.status === 'optimal') optimal++;
      else if (b.status === 'monitor') monitor++;
      else if (b.status === 'out') out++;
    }
    return { optimal, monitor, out, total: _biomarkers.length };
  }, [_biomarkers]);

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
          Lab panel
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── scrollable content ─────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 100px' }}>

        {/* ── header ─────────────────────────────────────── */}
        <div>
          <ACLabel size={11} color={c.dim} style={{ letterSpacing: 0.3 }}>
            {_exam.date}{_exam.source ? ` \u00b7 ${_exam.source}` : ''}
          </ACLabel>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.1, color: c.fg, marginTop: 4,
          }}>
            {_exam.name}
          </div>
          {_exam.provider && (
            <ACLabel size={12} color={c.mute} style={{ marginTop: 4, display: 'block' }}>
              Ordered by {_exam.provider}
            </ACLabel>
          )}

          {/* marker count strip */}
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <CountDot count={counts.optimal} label="Optimal" color={c.accent} c={c} />
            <CountDot count={counts.monitor} label="Monitor" color={STATUS_AMBER} c={c} />
            <CountDot count={counts.out} label="Out" color={STATUS_RED} c={c} />
          </div>
        </div>

        {/* ── coach summary card ──────────────────────────── */}
        {_coach && (
          <div style={{
            marginTop: 18, padding: 16, background: c.card,
            borderRadius: ACRadii.card, borderLeft: `3px solid ${c.accent}`,
          }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              Coach
            </ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 15, fontWeight: 600,
              color: c.fg, marginTop: 6, letterSpacing: -0.2,
            }}>
              {_coach.title}
            </div>
            <div style={{ marginTop: 6, fontSize: 13.5, color: c.dim, lineHeight: 1.55, fontFamily: ACFonts.body }}>
              {_coach.body}
            </div>
          </div>
        )}

        {/* ── category filter chips ──────────────────────── */}
        <div style={{
          marginTop: 18, display: 'flex', gap: 6,
          overflowX: 'auto', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 2,
        }}>
          {categories.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                style={{
                  flex: '0 0 auto',
                  padding: '6px 14px', borderRadius: 999,
                  background: active ? c.fg : c.card,
                  color: active ? c.bg : c.dim,
                  fontSize: 12, fontWeight: 600,
                  fontFamily: ACFonts.body,
                  border: 'none', cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  letterSpacing: -0.1,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── biomarker list ─────────────────────────────── */}
        <div style={{ marginTop: 14 }}>
          {visible.length === 0 ? (
            <div style={{
              padding: 24, background: c.card, borderRadius: ACRadii.card, textAlign: 'center',
            }}>
              <ACLabel size={13} color={c.dim}>No biomarkers match this filter.</ACLabel>
            </div>
          ) : visible.map((b, i) => {
            const sCol = statusColor(b.status, c);
            return (
              <button
                key={b.id || i}
                type="button"
                onClick={() => handleOpen(b.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                  background: 'transparent', border: 'none',
                  borderTopStyle: i === 0 ? 'solid' : 'none',
                  borderBottomStyle: 'solid',
                  borderTopColor: i === 0 ? c.hair : 'transparent',
                  borderBottomColor: c.hair,
                  borderTopWidth: i === 0 ? 1 : 0,
                  borderBottomWidth: 1,
                  borderLeft: 'none', borderRight: 'none',
                  textAlign: 'left', cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent', color: c.fg,
                }}
              >
                {/* status bar */}
                <div style={{
                  width: 4, height: 32, borderRadius: 2,
                  background: sCol, flexShrink: 0,
                }} />

                {/* name + status badge */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: c.fg, letterSpacing: -0.1 }}>
                    {b.name}
                  </div>
                  <span style={{
                    display: 'inline-block', marginTop: 3,
                    padding: '2px 8px', borderRadius: 4,
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: 0.4, textTransform: 'uppercase',
                    background: sCol === c.accent
                      ? (dark ? 'rgba(232,181,0,0.15)' : 'rgba(232,181,0,0.12)')
                      : `${sCol}18`,
                    color: sCol,
                  }}>
                    {statusLabel(b.status)}
                  </span>
                </div>

                {/* value + unit */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <ACNum size={18} color={c.fg} weight={700}>{b.value}</ACNum>
                  <span style={{ fontSize: 11, color: c.dim, marginLeft: 3, fontFamily: ACFonts.mono }}>
                    {b.unit}
                  </span>
                </div>

                {/* chevron */}
                <svg width="10" height="12" viewBox="0 0 10 12" style={{ flexShrink: 0 }}>
                  <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── sticky bottom bar: Ask AI + Share ──────────────── */}
      <div style={{
        padding: '14px 22px calc(14px + env(safe-area-inset-bottom, 0px))',
        background: c.bg,
        borderTop: `1px solid ${c.hair}`,
        display: 'flex', gap: 10,
      }}>
        <ACBtn dark={dark} block onClick={handleAsk} size="md">
          Ask AI
        </ACBtn>
        <ACBtn primary dark={dark} block onClick={handleShare} size="md">
          Share
        </ACBtn>
      </div>
    </div>
  );
}

/* ── sub-components ───────────────────────────────────────────── */

function CountDot({ count, label, color, c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <ACMono size={11} color={c.dim}>
        {count} {label}
      </ACMono>
    </div>
  );
}
