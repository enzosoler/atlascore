import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { MobileFormLayout } from '@/components/app/MobileFormLayout';
import { useAuth } from '@/lib/AuthContext';
import { createMeasurement } from '@/services/bodyProgressService';
import { getToday } from '@/lib/atlas-theme';
import { toast } from 'sonner';

const FIELD_LABEL = 'block text-[13px] font-medium text-[hsl(var(--fg-2))] mb-1.5';
const INPUT = 'w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--fill))] px-4 py-3 text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors';

const FIELDS = [
  { key: 'weight',           label: 'Weight',      unit: 'kg', step: '0.1', placeholder: '0.0' },
  { key: 'body_fat_percent', label: 'Body Fat',     unit: '%',  step: '0.1', placeholder: '0.0' },
  { key: 'muscle_mass',      label: 'Muscle Mass',  unit: 'kg', step: '0.1', placeholder: '0.0' },
  { key: 'waist',            label: 'Waist',        unit: 'cm', step: '0.5', placeholder: '0.0' },
  { key: 'hip',              label: 'Hip',          unit: 'cm', step: '0.5', placeholder: '0.0' },
  { key: 'chest',            label: 'Chest',        unit: 'cm', step: '0.5', placeholder: '0.0' },
];

export default function NewCheckpointPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(getToday());
  const [values, setValues] = useState({});

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = { date };
      for (const { key } of FIELDS) {
        if (values[key] !== undefined && values[key] !== '') {
          payload[key] = parseFloat(values[key]);
        }
      }
      return createMeasurement(user.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      toast.success('Checkpoint saved');
      navigate(-1);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save');
    },
  });

  const handleSave = () => {
    const hasValues = FIELDS.some(({ key }) => values[key] !== undefined && values[key] !== '');
    if (!hasValues) {
      toast.error('Enter at least one measurement');
      return;
    }
    save();
  };

  const setValue = (key, raw) =>
    setValues((prev) => ({ ...prev, [key]: raw }));

  const header = (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-[hsl(var(--fg))]">New Checkpoint</h1>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex h-9 items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-3 text-sm font-medium text-white disabled:opacity-60 transition-opacity"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        Save
      </button>
    </div>
  );

  return (
    <MobileFormLayout header={header}>
      <div className="p-4 space-y-5">
        <div>
          <label className={FIELD_LABEL}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ key, label, unit, step, placeholder }) => (
            <div key={key}>
              <label className={FIELD_LABEL}>
                {label}
                <span className="ml-1 text-[11px] text-[hsl(var(--fg-3))]">({unit})</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                step={step}
                min="0"
                placeholder={placeholder}
                value={values[key] ?? ''}
                onChange={(e) => setValue(key, e.target.value)}
                className={INPUT}
              />
            </div>
          ))}
        </div>
      </div>
    </MobileFormLayout>
  );
}
