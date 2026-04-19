import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACMono, ACBtn,
} from '../lib/paper.jsx';

/**
 * Highlight a substring match within text.
 * Returns a fragment with the matched portion wrapped in accent color.
 */
function highlight(text, frag, color) {
  if (!frag) return text;
  const i = text.toUpperCase().indexOf(frag.toUpperCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color }}>{text.slice(i, i + frag.length)}</span>
      {text.slice(i + frag.length)}
    </>
  );
}

export default function S47_Substance_Picker({
  dark = false,
  query = 'bpc',
  results,
  categories,
  activeCategory = 'Peptides',
  onClose,
  onSelect,
  onAddCustom,
  onSearch,
  onChangeCategory,
}) {
  const c = useACT(dark);

  const resolvedCategories = categories || [
    'All', 'Hormones', 'Peptides', 'Vitamins', 'Nootropics', 'Other',
  ];

  const resolvedResults = results || [
    { name: 'BPC-157',               meta: 'PEPTIDE \u00B7 REGENERATIVE',       route: 'Subcutaneous' },
    { name: 'TB-500',                meta: 'PEPTIDE \u00B7 REGENERATIVE',       route: 'Subcutaneous' },
    { name: 'CJC-1295 / Ipamorelin', meta: 'PEPTIDE \u00B7 GH SECRETAGOGUE', route: 'Subcutaneous' },
    { name: 'Semaglutide',           meta: 'PEPTIDE \u00B7 GLP-1',              route: 'Subcutaneous' },
    { name: 'Tesamorelin',           meta: 'PEPTIDE \u00B7 GHRH',               route: 'Subcutaneous' },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      overflow: 'hidden', background: c.bg,
    }}>
      {/* Sheet nav */}
      <div style={{
        padding: '0 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          }}
        >
          <ACMono size={11} color={c.dim}>{'\u2715'} CLOSE</ACMono>
        </button>
        <ACMono size={11} color={c.fg} style={{ fontWeight: 600 }}>SUBSTANCE</ACMono>
        <div style={{ width: 48 }} />
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{
          padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke={c.dim} strokeWidth="1.5" />
            <line x1="11" y1="11" x2="14" y2="14" stroke={c.dim} strokeWidth="1.5" />
          </svg>
          <div style={{
            flex: 1, fontFamily: ACFonts.body, fontSize: 14, color: c.fg,
          }}>
            {query}
            <span style={{
              display: 'inline-block', width: 1, height: 14,
              background: c.accent, marginLeft: 2, verticalAlign: 'middle',
            }} />
          </div>
          <ACMono size={10} color={c.dim}>{'\u2318'}K</ACMono>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {resolvedCategories.map((k) => {
          const on = k === activeCategory;
          return (
            <button
              type="button"
              key={k}
              onClick={onChangeCategory ? () => onChangeCategory(k) : undefined}
              style={{
                padding: '6px 12px', cursor: 'pointer',
                background: on ? c.fg : 'transparent',
                color: on ? c.bg : c.fg,
                border: on ? 'none' : `1px solid ${c.faint}`,
                fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600,
                letterSpacing: -0.1,
              }}
            >
              {k}
            </button>
          );
        })}
      </div>

      {/* Results list */}
      <div style={{
        flex: 1, overflow: 'hidden auto',
        WebkitOverflowScrolling: 'touch',
        padding: '0 20px',
      }}>
        <div style={{ marginBottom: 10 }}>
          <ACMono size={9} color={c.dim} track={2}>
            {resolvedResults.length} RESULTS {'\u00B7'} {activeCategory.toUpperCase()}
          </ACMono>
        </div>

        {resolvedResults.map((r, i) => (
          <button
            type="button"
            key={i}
            onClick={onSelect ? () => onSelect(r) : undefined}
            style={{
              width: '100%',
              padding: '14px 0', borderBottom: `1px solid ${c.hair}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'none', border: 'none', borderBottomStyle: 'solid',
              borderBottomWidth: 1, borderBottomColor: c.hair,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
                letterSpacing: -0.3, color: c.fg,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {highlight(r.name, query, c.accent)}
              </div>
              <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>
                {r.meta}
              </ACMono>
            </div>
            <ACMono size={10} color={c.dim}>{r.route}</ACMono>
          </button>
        ))}

        {/* "Can't find it?" card */}
        <div style={{
          marginTop: 18, padding: '16px 14px',
          background: c.card, borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACMono size={9} color={c.accent} track={2}>CAN'T FIND IT?</ACMono>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700,
            letterSpacing: -0.2, color: c.fg, marginTop: 4,
          }}>
            Add a custom substance.
          </div>
          <div style={{
            fontFamily: ACFonts.body, fontSize: 12, color: c.dim,
            marginTop: 4, lineHeight: 1.5,
          }}>
            Your protocol, your vocabulary. We'll keep it private unless you share.
          </div>
          <div style={{ marginTop: 10 }}>
            <ACBtn dark={dark} size="sm" onClick={onAddCustom}>+ Add custom</ACBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
