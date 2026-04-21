import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ACFonts, ACRadii } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import { useAuth } from '@/lib/AuthContext';
import { downloadUserDataCsv, downloadUserDataJson } from '@/services/dataExportService';

const EXPORT_OPTIONS = [
  {
    title: 'Full export (JSON)',
    description: 'Machine-readable. Import into other tools.',
    button: 'Download JSON',
    format: 'json',
  },
  {
    title: 'Spreadsheet (CSV)',
    description: 'Open in Excel, Sheets, or Numbers.',
    button: 'Download CSV',
    format: 'csv',
  },
];

export default function V3DataExport() {
  const { user } = useAuth();
  const [activeFormat, setActiveFormat] = useState(null);

  async function handleExport(format) {
    if (!user?.id) {
      toast.error('You must be signed in to export data.');
      return;
    }

    setActiveFormat(format);
    try {
      if (format === 'json') {
        await downloadUserDataJson(user.id);
      } else {
        await downloadUserDataCsv(user.id);
      }
      toast.success(`${format.toUpperCase()} export ready`);
    } catch (error) {
      console.error('[V3DataExport] export failed', error);
      toast.error('Export failed', { description: error?.message || 'Please try again.' });
    } finally {
      setActiveFormat(null);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: MC.bg,
        color: MC.fg,
        fontFamily: ACFonts.body,
        display: 'flex',
        justifyContent: 'center',
        padding: '48px 20px 64px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Back link */}
        <Link
          to="/app/account"
          style={{
            display: 'inline-block',
            color: MC.dim,
            textDecoration: 'none',
            fontFamily: ACFonts.body,
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          &larr; Back to account
        </Link>

        {/* HeartMark centered */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <HeartMark size={40} color={MC.fg} accent={MC.accent} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: ACFonts.display,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.6,
            lineHeight: 1.2,
            margin: '0 0 12px',
            textAlign: 'center',
          }}
        >
          Export your data
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: MC.body,
            textAlign: 'center',
            margin: '0 0 36px',
          }}
        >
          Download your complete body record — workouts, nutrition, measurements,
          and labs. Your data is always yours.
        </p>

        {/* Export option cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {EXPORT_OPTIONS.map((opt) => (
            <div
              key={opt.title}
              style={{
                border: MC.border,
                borderRadius: ACRadii.card,
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  fontFamily: ACFonts.display,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: -0.2,
                  marginBottom: 4,
                }}
              >
                {opt.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: MC.dim,
                  marginBottom: 16,
                }}
              >
                {opt.description}
              </div>
              <button
                type="button"
                onClick={() => handleExport(opt.format)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 18px',
                  background: MC.fg,
                  color: MC.bg,
                  border: 'none',
                  borderRadius: ACRadii.button,
                  fontFamily: ACFonts.body,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: -0.1,
                  cursor: activeFormat ? 'wait' : 'pointer',
                  opacity: activeFormat && activeFormat !== opt.format ? 0.6 : 1,
                  WebkitAppearance: 'none',
                }}
              >
                {activeFormat === opt.format ? 'Preparing…' : opt.button}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: MC.dim,
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          Export includes your profile, workouts, nutrition logs, measurements, check-ins, routines, and available session history.
        </p>
      </div>
    </div>
  );
}
