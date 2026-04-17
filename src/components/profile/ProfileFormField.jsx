import React from 'react';

export function FormField({ label, value, onChange, unit, placeholder, type = 'number', min, max, step = '1', description, disabled }) {
  return (
    <label className="block rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.34)] px-4 py-4 transition-colors duration-200 focus-within:border-[hsl(var(--brand)/0.28)] focus-within:bg-[hsl(var(--card))]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          {label}
        </span>
        {unit && (
          <span className="shrink-0 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
            {unit}
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="mt-3 w-full border-0 bg-transparent p-0 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))] disabled:opacity-50"
      />
      {description && (
        <p className="mt-2 text-[12px] text-[hsl(var(--fg-2))]">{description}</p>
      )}
    </label>
  );
}

export function SelectField({ label, value, onChange, options, description }) {
  return (
    <label className="block rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.34)] px-4 py-4 transition-colors duration-200 focus-within:border-[hsl(var(--brand)/0.28)] focus-within:bg-[hsl(var(--card))]">
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full border-0 bg-transparent p-0 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))] outline-none"
        style={{ colorScheme: 'light dark' }}
      >
        {(options || []).map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-black dark:bg-neutral-900 dark:text-white" style={{ background: '#fff', color: '#111' }}>{opt.label}</option>
        ))}
      </select>
      {description && (
        <p className="mt-2 text-[12px] text-[hsl(var(--fg-2))]">{description}</p>
      )}
    </label>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3, description }) {
  return (
    <label className="block rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.34)] px-4 py-4 transition-colors duration-200 focus-within:border-[hsl(var(--brand)/0.28)] focus-within:bg-[hsl(var(--card))]">
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-[15px] font-medium tracking-[-0.01em] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
      />
      {description && (
        <p className="mt-2 text-[12px] text-[hsl(var(--fg-2))]">{description}</p>
      )}
    </label>
  );
}
