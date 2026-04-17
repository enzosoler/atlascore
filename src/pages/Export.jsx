import React, { useMemo, useState } from 'react';
import { Calendar, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import {
  ErrorState,
  LoadingState,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  SecondaryButton,
  downloadFile,
  toArray,
} from '@/components/shared/StablePage';

function isWithinRange(value, startDate, endDate) {
  if (!value) return false;
  return value >= startDate && value <= endDate;
}

function serializeCsvDataRows(workouts, meals) {
  const rows = [
    ['date', 'type', 'name_or_description', 'value'],
  ];

  // Add meals (food_logs table)
  meals.forEach((meal) => {
    rows.push([
      (meal.date || '').split('T')[0],
      'Meal',
      meal.description || meal.food_name || 'Meal',
      `${meal.calories || meal.total_calories || 0} cal`,
    ]);
  });

  // Add workouts (workouts table — uses completed_at, not date)
  workouts.forEach((workout) => {
    rows.push([
      (workout.completed_at || '').split('T')[0],
      'Workout',
      workout.name || 'Workout',
      workout.duration_minutes ? `${workout.duration_minutes} min` : workout.status || 'N/A',
    ]);
  });

  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

export default function Export() {
  return (
    <SafePageBoundary
      title="Export"
      subtitle="Safe mode for the export page."
      maxWidth="max-w-4xl"
      fallbackDescription="The export page loaded. The main content failed, but the route is still accessible."
    >
      <ExportContent />
    </SafePageBoundary>
  );
}

function ExportContent() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const invalidRange = Boolean(startDate && endDate && startDate > endDate);

  const fileBase = useMemo(() => {
    const name = (user?.full_name || 'atlas-core')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `atlas-core-${name || 'export'}-${startDate}-to-${endDate}`;
  }, [endDate, startDate, user?.full_name]);

  const collectData = async () => {
    // IMPORTANT: table names and date columns must match the actual DB schema.
    // workouts table has completed_at (timestamptz), NOT date.
    // food_logs.date is a timestamp string. measurements.date is DATE.
    // daily_checkins.date is DATE. protocols.start_date is DATE.
    // lab_exams.exam_date is DATE. progress_photos.date is DATE.
    const datasets = [
      ['meals', async () => { const { data } = await supabase.from('food_logs').select('*').eq('user_id', user.id).gte('date', `${startDate}T00:00:00`).lte('date', `${endDate}T23:59:59`).order('date', { ascending: true }).limit(1000); return data || []; }],
      ['workouts', async () => { const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id).gte('completed_at', `${startDate}T00:00:00`).lte('completed_at', `${endDate}T23:59:59`).order('completed_at', { ascending: true }).limit(300); return data || []; }],
      ['measurements', async () => { const { data } = await supabase.from('measurements').select('*').eq('user_id', user.id).gte('date', startDate).lte('date', endDate).order('date', { ascending: true }).limit(300); return data || []; }],
      ['checkins', async () => { const { data } = await supabase.from('daily_checkins').select('*').eq('user_id', user.id).gte('date', startDate).lte('date', endDate).order('date', { ascending: true }).limit(300); return data || []; }],
      ['protocols', async () => { const { data } = await supabase.from('protocols').select('*').eq('user_id', user.id).order('start_date', { ascending: false }).limit(100); return data || []; }],
      ['labExams', async () => { const { data } = await supabase.from('lab_exams').select('*').eq('user_id', user.id).order('exam_date', { ascending: false }).limit(100); return data || []; }],
      ['profile', async () => { const { data } = await supabase.from('profiles').select('profile_data').eq('id', user.id).single(); return data || {}; }],
    ];

    const results = await Promise.allSettled(datasets.map(([, request]) => request()));
    const warnings = [];

    const getVal = (index, label) => {
      const result = results[index];
      if (result?.status === 'fulfilled') return result.value;
      warnings.push(label);
      return null;
    };

    const meals = toArray(getVal(0, 'meals'));
    const workouts = toArray(getVal(1, 'workouts'));
    const measurements = toArray(getVal(2, 'measurements'));
    const checkins = toArray(getVal(3, 'checkins'));
    const protocols = toArray(getVal(4, 'protocols'));
    const labExams = toArray(getVal(5, 'labExams'));
    const profile = getVal(6, 'profile');

    return {
      generated_at: new Date().toISOString(),
      period: { startDate, endDate },
      warnings,
      user: {
        name: user?.full_name || 'Athlete',
        email: user?.email || '',
        targets: profile?.profile_data?.targets || {},
      },
      meals,
      workouts,
      measurements,
      checkins: checkins.filter((item) => isWithinRange(item?.date, startDate, endDate)),
      protocols: protocols.filter((item) => isWithinRange(item?.start_date, startDate, endDate)),
      labExams: labExams.filter((item) => isWithinRange(item?.exam_date, startDate, endDate)),
    };
  };

  const exportJson = async () => {
    if (invalidRange) {
      setNotice('Adjust the date range before exporting.');
      return;
    }

    setBusy(true);
    try {
      const payload = await collectData();
      downloadFile(
        `${fileBase}.json`,
        JSON.stringify(payload, null, 2),
        'application/json;charset=utf-8'
      );
      const msg = payload.warnings.length > 0
        ? `JSON export finished with partial data. Failed datasets: ${payload.warnings.join(', ')}.`
        : 'JSON export finished.';
      setNotice(msg);
      toast.success(msg);
    } catch (error) {
      console.error(error);
      setNotice('Could not generate the JSON file.');
      toast.error('Could not generate the JSON file.');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    if (invalidRange) {
      setNotice('Adjust the date range before exporting.');
      return;
    }

    setBusy(true);
    try {
      const payload = await collectData();
      const csvData = serializeCsvDataRows(payload.workouts, payload.meals);
      downloadFile(`${fileBase}.csv`, csvData, 'text/csv;charset=utf-8');
      const csvMsg = payload.warnings.length > 0
        ? `CSV export finished with partial data. Failed datasets: ${payload.warnings.join(', ')}.`
        : 'CSV export finished.';
      setNotice(csvMsg);
      toast.success(csvMsg);
    } catch (error) {
      console.error(error);
      setNotice('Could not generate the CSV file.');
      toast.error('Could not generate the CSV file.');
    } finally {
      setBusy(false);
    }
  };

  const exportPdf = async () => {
    if (invalidRange) {
      setNotice('Adjust the date range before exporting.');
      return;
    }

    setBusy(true);
    try {
      const payload = await collectData();
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();   // 210 mm (A4)
      const pageH = doc.internal.pageSize.getHeight();  // 297 mm (A4)
      const L = 16;        // left margin
      const R = pageW - 16; // right edge
      let y = 0;

      // ── Brand palette (from /public/branding SVGs) ──────────────────────
      const C_BG    = [5,   7,  10];   // #05070A  – near-black header bg
      const C_CYAN  = [0,  220, 220];  // toned brand cyan (~#00DCDC)
      const C_INK   = [18,  18,  22];  // very dark body text
      const C_MUTED = [120, 120, 130]; // secondary/meta text
      const C_LINE  = [220, 220, 225]; // subtle separator
      const C_ROW   = [248, 248, 250]; // alternating row fill
      const C_RED   = [200,  40,  40]; // over-target flag
      const C_AMBER = [190, 120,  20]; // under-target flag
      const C_GREEN = [30,  148,  75]; // on-target / completed

      const checkPage = (needed = 14) => {
        if (y + needed > pageH - 20) {
          doc.addPage();
          y = L;
        }
      };

      // ════════════════════════════════════════
      //  HEADER  (dark bg + heartbeat icon)
      // ════════════════════════════════════════
      const HDR_H = 42;
      doc.setFillColor(...C_BG);
      doc.rect(0, 0, pageW, HDR_H, 'F');

      // Cyan accent strip at very top (2 mm)
      doc.setFillColor(...C_CYAN);
      doc.rect(0, 0, pageW, 2, 'F');

      // ── Heartbeat-to-arrow icon (drawn from brand SVG path data) ──
      // Brand SVG viewBox 800x400; heartbeat occupies x:[150,550], y:[120,240]
      // Scale to ~30 mm wide, placed at left margin, vertically centered in header
      const IC_X = L;
      const IC_Y = 14;    // top of icon area in mm
      const SC   = 0.075; // 30mm / 400 SVG units
      const tx = (sx) => IC_X + (sx - 150) * SC;
      const ty = (sy) => IC_Y + (sy - 120) * SC;

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.75);
      const hbPts = [[150,200],[250,200],[275,240],[325,120],[375,240],[400,200],[450,200],[550,140]];
      for (let i = 0; i < hbPts.length - 1; i++) {
        doc.line(tx(hbPts[i][0]), ty(hbPts[i][1]), tx(hbPts[i + 1][0]), ty(hbPts[i + 1][1]));
      }
      // Arrow tick: M530,140 H550 V160
      doc.line(tx(530), ty(140), tx(550), ty(140));
      doc.line(tx(550), ty(140), tx(550), ty(160));

      // ── Brand logotype: "atlas" (cyan) + ".core" (white) ──
      const BRAND_X = IC_X + (550 - 150) * SC + 5; // icon right edge + 5 mm gap = L + 35
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C_CYAN);
      doc.text('atlas', BRAND_X, 22);
      const atlasW = doc.getTextWidth('atlas');
      doc.setTextColor(255, 255, 255);
      doc.text('.core', BRAND_X + atlasW, 22);

      // Subtitle row
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(155, 158, 168);
      doc.text('Performance Data Report', BRAND_X, 31);
      doc.text(`${payload.period.startDate}  —  ${payload.period.endDate}`, R, 31, { align: 'right' });

      y = HDR_H + 10;

      // ════════════════════════════════════════
      //  ATHLETE INFO
      // ════════════════════════════════════════
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C_INK);
      doc.text(payload.user.name, L, y);
      y += 6;
      if (payload.user.email) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C_MUTED);
        doc.text(payload.user.email, L, y);
        y += 5;
      }
      y += 12;

      // ════════════════════════════════════════
      //  NUTRITION  —  daily summaries only
      // ════════════════════════════════════════
      checkPage(30);

      // Section label + rule
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C_CYAN);
      doc.text('NUTRITION', L, y);
      const nutLabelW = doc.getTextWidth('NUTRITION');
      doc.setDrawColor(...C_LINE);
      doc.setLineWidth(0.25);
      doc.line(L + nutLabelW + 3, y - 1, R, y - 1);
      y += 8;

      // Column headers
      const N_DATE   = L;
      const N_KCAL   = L + 40;
      const N_MACROS = L + 78;
      const N_STATUS = L + 152;

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C_MUTED);
      doc.text('DATE',      N_DATE,   y);
      doc.text('CALORIES',  N_KCAL,   y);
      doc.text('P / C / F', N_MACROS, y);
      doc.text('STATUS',    N_STATUS, y);
      y += 2.5;
      doc.setDrawColor(...C_LINE);
      doc.setLineWidth(0.25);
      doc.line(L, y, R, y);
      y += 6;

      // Aggregate meals by day
      const mealsByDay = {};
      payload.meals.forEach((m) => {
        const d = (m.date || '').split('T')[0];
        if (!mealsByDay[d]) mealsByDay[d] = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        mealsByDay[d].kcal    += Number(m.calories)      || Number(m.total_calories) || 0;
        mealsByDay[d].protein += Number(m.protein)       || Number(m.protein_g)      || Number(m.total_protein) || 0;
        mealsByDay[d].carbs   += Number(m.carbs)         || Number(m.carbs_g)        || Number(m.total_carbs)   || 0;
        mealsByDay[d].fat     += Number(m.fat)           || Number(m.fat_g)          || Number(m.total_fat)     || 0;
      });

      const targets    = payload.user.targets || {};
      const targetKcal = Number(targets.calories) || Number(targets.kcal) || 0;

      const sortedNutDays = Object.entries(mealsByDay).sort(([a], [b]) => a.localeCompare(b));

      if (sortedNutDays.length === 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...C_MUTED);
        doc.text('No nutrition data recorded in this period.', L, y);
        y += 10;
      } else {
        sortedNutDays.forEach(([date, data], idx) => {
          checkPage(9);
          if (idx % 2 === 0) {
            doc.setFillColor(...C_ROW);
            doc.rect(L - 2, y - 5.5, R - L + 4, 8.5, 'F');
          }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...C_INK);
          doc.text(date, N_DATE, y);
          doc.text(`${Math.round(data.kcal)} kcal`, N_KCAL, y);
          doc.text(
            `${Math.round(data.protein)}g / ${Math.round(data.carbs)}g / ${Math.round(data.fat)}g`,
            N_MACROS, y
          );

          if (targetKcal > 0) {
            const ratio = data.kcal / targetKcal;
            let statusText;
            let statusColor;
            if (ratio > 1.1) {
              statusText  = 'Over target';
              statusColor = C_RED;
            } else if (ratio < 0.85) {
              statusText  = 'Under target';
              statusColor = C_AMBER;
            } else {
              statusText  = 'On target';
              statusColor = C_GREEN;
            }
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...statusColor);
            doc.text(statusText, N_STATUS, y);
          }
          y += 9;
        });
      }

      y += 14;

      // ════════════════════════════════════════
      //  WORKOUTS
      // ════════════════════════════════════════
      checkPage(30);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C_CYAN);
      doc.text('WORKOUTS', L, y);
      const wkoLabelW = doc.getTextWidth('WORKOUTS');
      doc.setDrawColor(...C_LINE);
      doc.setLineWidth(0.25);
      doc.line(L + wkoLabelW + 3, y - 1, R, y - 1);
      y += 8;

      // Column headers
      const W_DATE   = L;
      const W_NAME   = L + 38;
      const W_STATUS = R;

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C_MUTED);
      doc.text('DATE',     W_DATE,   y);
      doc.text('TRAINING', W_NAME,   y);
      doc.text('STATUS',   W_STATUS, y, { align: 'right' });
      y += 2.5;
      doc.setDrawColor(...C_LINE);
      doc.setLineWidth(0.25);
      doc.line(L, y, R, y);
      y += 6;

      if (payload.workouts.length === 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...C_MUTED);
        doc.text('No workouts recorded in this period.', L, y);
        y += 10;
      } else {
        payload.workouts.forEach((w, idx) => {
          checkPage(9);
          if (idx % 2 === 0) {
            doc.setFillColor(...C_ROW);
            doc.rect(L - 2, y - 5.5, R - L + 4, 8.5, 'F');
          }
          const date = (w.completed_at || '').split('T')[0];
          const name = w.name || 'Training Session';

          // Truncate name to fit available column width
          doc.setFontSize(9);
          const maxNameW = W_STATUS - W_NAME - 32;
          let displayName = name;
          while (doc.getTextWidth(displayName) > maxNameW && displayName.length > 4) {
            displayName = displayName.slice(0, -1);
          }
          if (displayName !== name) displayName += '...';

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...C_INK);
          doc.text(date, W_DATE, y);
          doc.text(displayName, W_NAME, y);

          // Drawn check mark (avoids jsPDF Unicode rendering issues with helvetica)
          const ckX = W_STATUS - 23;
          const ckY = y;
          doc.setDrawColor(...C_GREEN);
          doc.setLineWidth(0.9);
          doc.line(ckX,       ckY + 0.5, ckX + 1.5, ckY + 2.2);
          doc.line(ckX + 1.5, ckY + 2.2, ckX + 4,   ckY - 0.8);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...C_GREEN);
          doc.text('Completed', W_STATUS, y, { align: 'right' });
          y += 9;
        });
      }

      // ════════════════════════════════════════
      //  FOOTER  (every page)
      // ════════════════════════════════════════
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...C_LINE);
        doc.setLineWidth(0.25);
        doc.line(L, pageH - 14, R, pageH - 14);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C_MUTED);
        doc.text(
          `atlas.core  ·  Performance Data Report  ·  Page ${i} of ${totalPages}`,
          L, pageH - 9
        );
        doc.text(new Date().toLocaleDateString(), R, pageH - 9, { align: 'right' });
      }

      doc.save(`${fileBase}.pdf`);
      setNotice('PDF report generated.');
      toast.success('PDF report generated.');
    } catch (error) {
      console.error(error);
      setNotice('Could not generate the PDF file.');
      toast.error('Could not generate the PDF file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      title="Export"
      subtitle="Export your data as JSON, CSV, or a formatted PDF report."
      maxWidth="max-w-4xl"
    >
      {notice ? <StatusBanner>{notice}</StatusBanner> : null}

      {busy ? (
        <LoadingState
          title="Export page loaded"
          description="We are generating the file in safe mode to avoid silent failures."
        />
      ) : null}

      {invalidRange ? (
        <ErrorState
          title="Invalid date range"
          description="The start date must be earlier than or equal to the end date."
        />
      ) : null}

      <SectionCard title="Export range" subtitle="Choose the period you want to download.">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="atlas-field px-4 py-3 text-sm text-[hsl(var(--fg-2))]">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full bg-transparent text-[14px] font-medium text-[hsl(var(--fg))] outline-none"
            />
          </label>
          <label className="atlas-field px-4 py-3 text-sm text-[hsl(var(--fg-2))]">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              End date
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full bg-transparent text-[14px] font-medium text-[hsl(var(--fg))] outline-none"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryButton type="button" onClick={() => setStartDate(endDate)}>
            Same day
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => {
              const date = new Date(`${endDate}T12:00:00`);
              date.setDate(date.getDate() - 7);
              setStartDate(date.toISOString().split('T')[0]);
            }}
          >
            Last 7 days
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => {
              const date = new Date(`${endDate}T12:00:00`);
              date.setDate(date.getDate() - 30);
              setStartDate(date.toISOString().split('T')[0]);
            }}
          >
            Last 30 days
          </SecondaryButton>
        </div>
      </SectionCard>

      <UpgradeGate feature="standard_exports" plan="Pro">
        <SectionCard title="Downloads" subtitle="Simple, dependable files ready to use.">
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              disabled={busy || invalidRange}
              onClick={exportJson}
              className="atlas-card rounded-[24px] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.62)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
                <FileJson className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mt-4 text-base font-semibold tracking-[-0.025em] text-[hsl(var(--fg))]">Export full JSON</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
                Download all primary entities filtered by the selected range.
              </p>
            </button>

            <button
              type="button"
              disabled={busy || invalidRange}
              onClick={exportCsv}
              className="atlas-card rounded-[24px] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.62)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
                <FileSpreadsheet className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mt-4 text-base font-semibold tracking-[-0.025em] text-[hsl(var(--fg))]">Export CSV</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
                Spreadsheet with workout and meal records for the selected range.
              </p>
            </button>

            <button
              type="button"
              disabled={busy || invalidRange}
              onClick={exportPdf}
              className="atlas-card rounded-[24px] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.62)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
                <FileText className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mt-4 text-base font-semibold tracking-[-0.025em] text-[hsl(var(--fg))]">Export PDF</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
                Formatted report with workouts, nutrition, measurements, and protocols.
              </p>
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <PrimaryButton type="button" disabled={busy || invalidRange} onClick={exportJson}>
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" strokeWidth={2} />
                {busy ? 'Generating file...' : 'Export now'}
              </span>
            </PrimaryButton>
          </div>
        </SectionCard>
      </UpgradeGate>

      <SectionCard title="What goes into the file" subtitle="Scope of the rebuilt export flow.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.52)] p-4 text-sm text-[hsl(var(--fg-2))]">
            <Calendar className="mb-3 h-5 w-5 text-[hsl(var(--brand))]" strokeWidth={2} />
            Meals, check-ins, workouts, and measurements inside the selected period.
          </div>
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.52)] p-4 text-sm text-[hsl(var(--fg-2))]">
            Protocols, lab exams, and progress photos are included too.
          </div>
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.52)] p-4 text-sm text-[hsl(var(--fg-2))]">
            The file includes name, email, and the date range used for generation.
          </div>
        </div>
      </SectionCard>
    </PageShell>
  );
}
