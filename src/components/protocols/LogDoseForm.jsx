import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// ── Constants ─────────────────────────────────────────────────────────────────

const UNIT_OPTIONS = [
  { value: 'mg', label: 'mg' },
  { value: 'mcg', label: 'mcg' },
  { value: 'IU', label: 'IU' },
  { value: 'mL', label: 'mL' },
  { value: 'cc', label: 'cc' },
  { value: 'g', label: 'g' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodayString() {
  return new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
}

function FieldShell({ label, description, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">{label}</label>
      {children}
      {description ? (
        <p className="text-[12px] leading-5 text-[hsl(var(--fg-3))]">{description}</p>
      ) : null}
    </div>
  );
}

// ── Form component ────────────────────────────────────────────────────────────

export default function LogDoseForm({
  protocol = null,
  isSubmitting = false,
  onCancel,
  onSubmit,
}) {
  // Initialize form with protocol defaults
  const defaultDose = useMemo(() => {
    if (!protocol?.dose) return '';
    // Try to parse numeric value from dose string
    const match = String(protocol.dose).match(/[\d.]+/);
    return match ? match[0] : '';
  }, [protocol]);

  const [form, setForm] = useState({
    dose_amount: defaultDose,
    unit: protocol?.unit || 'mg',
    taken_at: getTodayString(),
    notes: '',
    site: '',
  });
  const [errors, setErrors] = useState({});

  // Update form when protocol changes
  useEffect(() => {
    const newDefaultDose = (() => {
      if (!protocol?.dose) return '';
      const match = String(protocol.dose).match(/[\d.]+/);
      return match ? match[0] : '';
    })();

    setForm({
      dose_amount: newDefaultDose,
      unit: protocol?.unit || 'mg',
      taken_at: getTodayString(),
      notes: '',
      site: '',
    });
    setErrors({});
  }, [protocol]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.dose_amount || isNaN(parseFloat(form.dose_amount))) {
      nextErrors.dose_amount = 'Enter a valid dose amount.';
    }

    if (!form.taken_at) {
      nextErrors.taken_at = 'Set when the dose was taken.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      dose_amount: parseFloat(form.dose_amount),
      unit: form.unit,
      taken_at: new Date(form.taken_at).toISOString(),
      notes: form.notes.trim(),
      site: form.site.trim(),
    };

    onSubmit?.(payload);
  };

  const previewLabel = protocol?.substance_name || protocol?.name || 'Dose';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 lg:p-7">
      {/* Live preview */}
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.88)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.1),transparent_34%),linear-gradient(180deg,hsl(var(--fill)/0.78)_0%,hsl(var(--card))_100%)] p-5 shadow-[var(--shadow-xs)]">
        <p className="atlas-overline">Preview</p>
        <p className="mt-3 text-[1.25rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
          {previewLabel}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          {form.dose_amount} {form.unit} at {new Date(form.taken_at).toLocaleString()}
        </p>
      </div>

      {/* Dose details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Dose Amount" description="Amount taken this time">
          <Input
            type="number"
            step="0.01"
            value={form.dose_amount}
            onChange={(e) => setField('dose_amount', e.target.value)}
            placeholder="e.g., 200"
            className="h-12"
          />
          {errors.dose_amount ? (
            <p className="text-[12px] text-[hsl(var(--err))]">{errors.dose_amount}</p>
          ) : null}
        </FieldShell>

        <FieldShell label="Unit">
          <select
            value={form.unit}
            onChange={(e) => setField('unit', e.target.value)}
            className="atlas-field h-12 px-4 text-base"
          >
            {UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldShell>
      </div>

      <FieldShell label="Taken At" description="Date and time of administration">
        <Input
          type="datetime-local"
          value={form.taken_at}
          onChange={(e) => setField('taken_at', e.target.value)}
          className="h-12"
        />
        {errors.taken_at ? (
          <p className="text-[12px] text-[hsl(var(--err))]">{errors.taken_at}</p>
        ) : null}
      </FieldShell>

      {/* Optional: injection site for injectables */}
      {protocol?.category === 'hormone' || protocol?.category === 'peptide' ? (
        <FieldShell label="Site (Optional)" description="Injection site, e.g., deltoid, glute">
          <Input
            value={form.site}
            onChange={(e) => setField('site', e.target.value)}
            placeholder="e.g., left deltoid, right glute"
            className="h-12"
          />
        </FieldShell>
      ) : null}

      <FieldShell label="Notes (Optional)" description="Any observations or side effects">
        <Textarea
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="e.g., felt good, slight pip, etc."
          className="min-h-[100px] resize-y"
        />
      </FieldShell>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-[hsl(var(--border)/0.82)] pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="sm:min-w-[140px]"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="sm:min-w-[180px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Log Dose'}
        </Button>
      </div>
    </form>
  );
}
