import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, X } from 'lucide-react';

const MAX_SESSION_SECONDS = 3600; // 60 min auto-exit

export default function ImpersonationBanner({ targetEmail, adminEmail, startTime, onExit }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const secs = Math.round((Date.now() - startTime) / 1000);
      setElapsed(secs);
      if (secs >= MAX_SESSION_SECONDS) onExit();
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, onExit]);

  const fmt = useCallback((s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[200] flex h-11 items-center justify-between bg-amber-500 px-4 text-[13px] font-medium text-white shadow-md">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        <span>Support session — viewing as <strong>{targetEmail}</strong></span>
        {adminEmail && <span className="opacity-70">(you: {adminEmail})</span>}
      </div>
      <div className="flex items-center gap-3">
        <span className="tabular-nums opacity-80">{fmt(elapsed)}</span>
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1 rounded-md bg-white/20 px-2.5 py-1 text-[12px] font-semibold transition hover:bg-white/30"
        >
          <X className="h-3.5 w-3.5" />
          Exit session
        </button>
      </div>
    </div>
  );
}
