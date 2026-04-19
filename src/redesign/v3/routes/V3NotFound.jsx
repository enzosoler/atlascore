import React from 'react';
import { Link } from 'react-router-dom';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';

export default function V3NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: ACBrand.paper,
        color: ACBrand.ink,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        fontFamily: ACFonts.body,
      }}
    >
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <HeartMark size={48} color={ACBrand.ink} accent={ACBrand.accent} />

        <div style={{
          marginTop: 28, fontFamily: ACFonts.brand, fontSize: 96,
          letterSpacing: -5, lineHeight: 0.85, textTransform: 'lowercase',
          color: ACBrand.ink,
        }}>
          404
        </div>

        <div style={{
          marginTop: 16, fontFamily: ACFonts.display, fontSize: 22,
          fontWeight: 700, letterSpacing: -0.6, color: ACBrand.ink,
        }}>
          Off the map.
        </div>

        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: MC.body }}>
          This page doesn't exist. It might have moved, or the link was off by a point.
        </p>

        <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 999, padding: '14px 24px', textDecoration: 'none',
            background: ACBrand.ink, color: ACBrand.paper,
            fontFamily: ACFonts.brand, fontSize: 18,
            letterSpacing: -0.5, textTransform: 'lowercase',
          }}>
            go home
          </Link>
        </div>
      </div>
    </div>
  );
}
