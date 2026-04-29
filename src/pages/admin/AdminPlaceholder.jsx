import React from 'react';
import { ACFonts, useACT, ACMono } from '@/redesign/v3/lib/paper.jsx';

export default function AdminPlaceholder({ title = 'Coming soon', description = 'This section is planned for a future phase.' }) {
  const c = useACT(true);
  return (
    <div data-testid="admin-placeholder" style={{ padding: '40px 0' }}>
      <div style={{
        fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
        letterSpacing: -1, color: c.fg,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: c.dim, marginTop: 8, maxWidth: 400 }}>
        {description}
      </div>
      <div style={{
        marginTop: 24, padding: 20, borderRadius: 14,
        background: c.card, border: `1px solid ${c.hair}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: 999,
          background: c.accent, opacity: 0.5,
        }} />
        <ACMono size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}>
          Phase {title.includes('User') ? '2-3' : title.includes('Bill') ? '4' : title.includes('Mod') ? '5' : title.includes('Sup') ? '4' : '6-8'} · see docs/admin-panel/PLAN.md
        </ACMono>
      </div>
    </div>
  );
}
