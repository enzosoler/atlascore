/**
 * BillingHistory — /app/billing/invoices.
 *
 * List of past invoices (paid / pending / refunded). Each row shows the
 * date, amount, status chip, and a "Download PDF" action.
 *
 * TRUST RULE — fabricates nothing. When no invoice history exists the
 * user sees an honest empty state, not fake line items.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, SpringReveal } from '../lib/glass';

export default function BillingHistory({
  invoices = [],      // [{ id, date, amount, currency, status, pdfUrl, planName, period }]
  onBack,
}) {
  const hasInvoices = Array.isArray(invoices) && invoices.length > 0;

  return (
    <SafeScreen hasTopBar hasBottomNav>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <BackBar onBack={onBack} />

        <SpringReveal>
          <div style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'hsl(var(--rd-fg-muted))', fontWeight: 700,
          }}>
            Billing
          </div>
          <h1 style={{
            margin: '6px 0 0', fontSize: 28, fontWeight: 800,
            letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Invoices
          </h1>
          <p style={{
            margin: '6px 0 0', fontSize: 13,
            color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.55,
          }}>
            Download any past receipt for expense reports or tax purposes.
          </p>
        </SpringReveal>

        <div style={{ marginTop: 22 }}>
          {hasInvoices ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {invoices.map((inv, i) => (
                <SpringReveal key={inv.id || i} delay={Math.min(i * 20, 180)}>
                  <InvoiceRow invoice={inv} />
                </SpringReveal>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: 22,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.10)',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: 'hsl(var(--rd-fg-primary))', marginBottom: 6,
              }}>
                No invoices yet
              </div>
              <div style={{
                fontSize: 12.5, color: 'hsl(var(--rd-fg-muted))',
                lineHeight: 1.55, maxWidth: 300, margin: '0 auto',
              }}>
                Once you subscribe, every monthly or yearly charge will appear
                here with a downloadable PDF receipt.
              </div>
            </div>
          )}
        </div>
      </div>
    </SafeScreen>
  );
}
export { BillingHistory };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function BackBar({ onBack }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{
          width: 36, height: 36, borderRadius: 9999,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function InvoiceRow({ invoice: i }) {
  const status = (i.status || 'paid').toLowerCase();
  const statusColor = {
    paid:     { bg: 'rgba(52,211,153,0.10)', bd: 'rgba(52,211,153,0.28)', c: '#34D399' },
    pending:  { bg: 'rgba(251,191,36,0.10)', bd: 'rgba(251,191,36,0.28)', c: '#FBBF24' },
    refunded: { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-muted))' },
    failed:   { bg: 'rgba(248,113,113,0.10)', bd: 'rgba(248,113,113,0.28)', c: '#F87171' },
  }[status] || { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-muted))' };

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em',
          color: 'hsl(var(--rd-fg-primary))',
        }}>
          {i.planName || 'Subscription'} · {i.period === 'yearly' ? 'Yearly' : 'Monthly'}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {formatDate(i.date)}
        </div>
      </div>
      <div style={{
        fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: 'hsl(var(--rd-fg-primary))',
        letterSpacing: '-0.01em',
      }}>
        {formatCurrency(i.amount, i.currency)}
      </div>
      <span
        style={{
          height: 22, paddingInline: 8, borderRadius: 6,
          background: statusColor.bg,
          border: `1px solid ${statusColor.bd}`,
          color: statusColor.c,
          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center',
        }}
      >
        {status}
      </span>
      {i.pdfUrl ? (
        <a
          href={i.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download PDF"
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'hsl(var(--rd-fg-secondary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}

function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}

function formatDate(input) {
  if (!input) return '—';
  try {
    return new Date(input).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(input);
  }
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function BillingHistoryRoute() {
  const navigate = useNavigate();
  return (
    <BillingHistory
      invoices={[]}          // TODO: wire RevenueCat transaction list
      onBack={() => navigate(-1)}
    />
  );
}
