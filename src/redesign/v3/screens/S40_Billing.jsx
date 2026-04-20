import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';

const DEMO_PERKS = [
  'Unlimited AI coach conversations',
  'Full lab panel ingestion + tracking',
  'Programs library + custom builder',
  'Crew of up to 10 people',
  'Priority Function panel scheduling',
];

const DEMO_INVOICES = [
  { d: '18 APR 26', n: 'INV-0014', a: '$12.00', s: 'PAID' },
  { d: '18 MAR 26', n: 'INV-0013', a: '$12.00', s: 'PAID' },
  { d: '18 FEB 26', n: 'INV-0012', a: '$12.00', s: 'PAID' },
  { d: '18 JAN 26', n: 'INV-0011', a: '$12.00', s: 'PAID' },
];

/**
 * S40_Billing — subscription / billing management screen.
 *
 * Gallery:    <S40_Billing dark />
 * Production: <S40_Billing dark planName="atlas.core" price="$12" interval="/month"
 *               nextCharge="MAY 18" perks={[...]} invoices={[{d,n,a,s},...]}
 *               paymentLast4="4242" paymentBrand="VISA" paymentExpiry="08/27"
 *               onBack={fn} onEditPayment={fn} onSwitchPlan={fn}
 *               onCancel={fn} onOpenInvoice={fn} />
 *
 * onEditPayment({last4, brand}) — edit payment method
 * onSwitchPlan({fromPlan, targetInterval}) — switch to annual
 * onCancel({planName}) — cancel subscription
 * onOpenInvoice({invoiceId, date, amount}) — open invoice PDF/detail
 */
function S40_Billing({
  dark = false,
  planName = 'atlas.core',
  price = '$12',
  interval = '/month',
  nextCharge = 'MAY 18',
  perks,
  invoices,
  paymentLast4 = '4242',
  paymentBrand = 'VISA',
  paymentExpiry = '08/27',
  onBack,
  onEditPayment,
  onSwitchPlan,
  onCancel,
  onOpenInvoice,
}) {
  const c = useACT(dark);
  const _perks = perks || DEMO_PERKS;
  const _invoices = invoices || DEMO_INVOICES;

  const handleEditPayment = () => {
    if (typeof onEditPayment === 'function') onEditPayment({ last4: paymentLast4, brand: paymentBrand });
  };
  const handleSwitchPlan = () => {
    if (typeof onSwitchPlan === 'function') onSwitchPlan({ fromPlan: planName, targetInterval: 'annual' });
  };
  const handleCancel = () => {
    if (typeof onCancel === 'function') onCancel({ planName });
  };
  const handleOpenInvoice = (r) => {
    if (typeof onOpenInvoice === 'function') onOpenInvoice({ invoiceId: r.n, date: r.d, amount: r.a });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>BILLING</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Plan hero */}
        <div style={{ padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                Current plan
              </ACLabel>
              <div style={{
                marginTop: 8, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
                letterSpacing: -1.2, lineHeight: 1, color: c.bg,
              }}>
                {planName.includes('.') ? (
                  <>
                    {planName.split('.')[0]}.<span style={{ color: c.accent }}>{planName.split('.')[1]}</span>
                  </>
                ) : planName}
              </div>
            </div>
            <div style={{
              padding: '4px 10px', fontFamily: ACFonts.mono, fontSize: 10,
              background: c.accent, color: c.ink, fontWeight: 700, letterSpacing: 0.4,
            }}>ACTIVE</div>
          </div>
          <div style={{
            marginTop: 18, paddingTop: 18,
            borderTop: `1px solid ${dark ? 'rgba(10,10,10,0.16)' : 'rgba(239,233,218,0.16)'}`,
            display: 'flex', alignItems: 'baseline', gap: 12,
          }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 42, fontWeight: 700,
              letterSpacing: -1.8, color: c.bg, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>{price}</div>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.4 }}>
              {interval} · next charge<br/>{nextCharge}
            </div>
          </div>
        </div>

        {/* Perks */}
        <div style={{ marginTop: 14 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            In your plan
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {_perks.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6L4 9L11 2" stroke={c.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ flex: 1, fontSize: 13, color: c.fg, letterSpacing: -0.1 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Payment
          </ACLabel>
          <div style={{
            marginTop: 10, padding: 14, background: c.card, borderRadius: ACRadii.card,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 46, height: 32, background: c.fg, color: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: 0.6, borderRadius: 4,
            }}>{paymentBrand}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 12, fontWeight: 600, color: c.fg, letterSpacing: 0.4 }}>
                •••• {paymentLast4}
              </div>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, marginTop: 2, display: 'block' }}>
                EXPIRES {paymentExpiry}
              </ACLabel>
            </div>
            <button type="button" onClick={handleEditPayment} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
              <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6 }}>
                EDIT
              </ACLabel>
            </button>
          </div>
        </div>

        {/* Invoices */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Invoices · {_invoices.length} total
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {_invoices.map((r, i) => (
              <button key={i} type="button" onClick={() => handleOpenInvoice(r)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 0', width: '100%', textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
                cursor: 'pointer',
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, letterSpacing: 0.4, width: 76 }}>{r.d}</div>
                <div style={{ flex: 1, fontFamily: ACFonts.mono, fontSize: 11, color: c.fg, letterSpacing: 0.3, fontWeight: 600 }}>{r.n}</div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700, color: c.fg, fontVariantNumeric: 'tabular-nums' }}>{r.a}</div>
                <div style={{
                  padding: '2px 7px', fontFamily: ACFonts.mono, fontSize: 9,
                  color: c.accent, border: `1px solid ${c.accent}`,
                  letterSpacing: 0.5, fontWeight: 700,
                }}>{r.s}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Plan swap CTA */}
        <button type="button" onClick={handleSwitchPlan} style={{
          marginTop: 22, padding: 16, width: '100%', textAlign: 'left',
          background: c.card, borderRadius: ACRadii.card,
          border: 'none',
          borderLeft: `3px solid ${c.accent}`,
          cursor: 'pointer',
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Annual saves $24
          </ACLabel>
          <div style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>
            Switch to yearly · $120/yr
          </div>
          <div style={{ marginTop: 4, fontFamily: ACFonts.mono, fontSize: 11, color: c.dim, letterSpacing: 0.3 }}>
            Two months on the house. Cancel anytime.
          </div>
        </button>

        {/* Cancel */}
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <button type="button" onClick={handleCancel} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 16px',
            fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5,
            color: '#c2391a', textTransform: 'uppercase', fontWeight: 600,
          }}>
            Cancel subscription
          </button>
        </div>
      </div>
    </div>
  );
}

export default S40_Billing;
