import React from 'react';
import { ACFonts, useACT } from '@/redesign/v3/lib/paper.jsx';

export default function OfflineBanner({
  dark = false,
  message = 'You are offline. Core surfaces remain available and sync will resume once the connection returns.',
}) {
  const c = useACT(dark);

  return (
    <div
      style={{
        marginTop: 12,
        padding: '10px 14px',
        borderRadius: 14,
        border: `1px solid ${c.hair}`,
        background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)',
        color: c.dim,
        fontFamily: ACFonts.body,
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      {message}
    </div>
  );
}
