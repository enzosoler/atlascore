/**
 * V3BodyPhotoCapture - Body photo capture screen with proper gate.
 * 
 * This provides a dedicated body photo capture experience that explains
 * the feature and routes appropriately when implemented.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { ACFonts, ACRadii, useACT, ACBrand } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

export default function V3BodyPhotoCapture() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const t = useT();
  const dark = theme === 'dark';
  const c = useACT(dark);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: c.bg, 
      color: c.fg, 
      fontFamily: ACFonts.body,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 22px',
        borderBottom: `1px solid ${c.hair}`
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: c.fg,
            fontSize: 16,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          × Cancel
        </button>
        <HeartMark size={24} dark={dark} />
        <div style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '32px 22px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 24,
      }}>
        {/* Icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: c.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${c.hair}`
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: ACFonts.display,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: -0.8,
          lineHeight: 1.1,
        }}>
          Body Photo Capture
        </div>

        {/* Description */}
        <div style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: c.dim,
          maxWidth: 320,
        }}>
          Track your visual progress with consistent body photos. This feature will guide you through proper positioning and lighting for accurate comparisons over time.
        </div>

        {/* Feature list */}
        <div style={{
          background: c.card,
          borderRadius: ACRadii.card,
          padding: 20,
          width: '100%',
          maxWidth: 400,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: c.fg }}>
            Coming soon:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Front, side, and back view guidance',
              'Consistent positioning overlays',
              'Lighting recommendations',
              'Progress comparison timeline',
              'Photo privacy controls'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  background: c.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-6" stroke={c.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontSize: 14, color: c.fg }}>
                  {feature}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: '100%',
          maxWidth: 400,
        }}>
          <button
            type="button"
            onClick={() => {
              toast('Body photo capture is coming soon', {
                description: 'We\'re building the complete capture experience with positioning guides and progress tracking.'
              });
            }}
            disabled
            style={{
              padding: '16px 24px',
              background: c.faint,
              color: c.dim,
              border: 'none',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'not-allowed',
            }}
          >
            Start Capture (Coming Soon)
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/app/body/progress/photos')}
            style={{
              padding: '14px 24px',
              background: 'none',
              color: c.accent,
              border: `2px solid ${c.accent}`,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View Existing Photos
          </button>
        </div>
      </div>
    </div>
  );
}
