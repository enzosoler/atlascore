import React, { useMemo, useState } from 'react';
import { Calendar, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
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
      setNotice(
        payload.warnings.length > 0
          ? `JSON export finished with partial data. Failed datasets: ${payload.warnings.join(', ')}.`
          : 'JSON export finished.'
      );
    } catch (error) {
      console.error(error);
      setNotice('Could not generate the JSON file.');
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
      setNotice(
        payload.warnings.length > 0
          ? `CSV export finished with partial data. Failed datasets: ${payload.warnings.join(', ')}.`
          : 'CSV export finished.'
      );
    } catch (error) {
      console.error(error);
      setNotice('Could not generate the CSV file.');
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
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      // Brand Colors
      const brandPrimary = [10, 10, 10]; // Near black
      const colorRed = [220, 38, 38];
      const colorYellow = [217, 119, 6];
      const colorGreen = [22, 163, 74];
      const colorMuted = [107, 114, 128];

      const checkPage = (needed = 15) => {
        if (y + needed > pageH - 20) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Header Bar
      doc.setFillColor(...brandPrimary);
      doc.rect(0, 0, pageW, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('atlas.core', margin, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Performance Data Report', margin, 32);
      doc.text(`${payload.period.startDate} to ${payload.period.endDate}`, pageW - margin, 32, { align: 'right' });

      y = 55;

      // User Info
      doc.setTextColor(...brandPrimary);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(payload.user.name, margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colorMuted);
      doc.text(payload.user.email, margin, y);
      y += 15;

      // --- Nutrition Section ---
      doc.setTextColor(...brandPrimary);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Nutrition Totals', margin, y);
      y += 10;

      const mealsByDay = {};
      payload.meals.forEach(m => {
        const d = (m.date || '').split('T')[0];
        if (!mealsByDay[d]) mealsByDay[d] = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        mealsByDay[d].kcal += (Number(m.calories) || Number(m.total_calories) || 0);
        mealsByDay[d].protein += (Number(m.protein) || Number(m.protein_g) || Number(m.total_protein) || 0);
        mealsByDay[d].carbs += (Number(m.carbs) || Number(m.carbs_g) || Number(m.total_carbs) || 0);
        mealsByDay[d].fat += (Number(m.fat) || Number(m.fat_g) || Number(m.total_fat) || 0);
      });

      const targets = payload.user.targets;
      const targetKcal = Number(targets.calories) || 0;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorMuted);
      doc.text('Date', margin, y);
      doc.text('Calories', margin + 40, y);
      doc.text('P / C / F', margin + 80, y);
      doc.text('Status', margin + 130, y);
      y += 4;
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      Object.entries(mealsByDay).sort().forEach(([date, data]) => {
        checkPage(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...brandPrimary);
        doc.text(date, margin, y);
        doc.text(`${Math.round(data.kcal)} kcal`, margin + 40, y);
        doc.text(`${Math.round(data.protein)}g / ${Math.round(data.carbs)}g / ${Math.round(data.fat)}g`, margin + 80, y);

        if (targetKcal > 0) {
          let status = 'On target';
          let statusColor = colorGreen;
          const diff = data.kcal - targetKcal;
          
          if (diff > targetKcal * 0.1) {
            status = 'Over';
            statusColor = colorRed;
          } else if (diff < -targetKcal * 0.15) {
            status = 'Under';
            statusColor = colorYellow;
          }

          doc.setTextColor(...statusColor);
          doc.setFont('helvetica', 'bold');
          doc.text(status, margin + 130, y);
        }
        y += 7;
      });

      y += 12;

      // --- Workouts Section ---
      checkPage(25);
      doc.setTextColor(...brandPrimary);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Workout Logs', margin, y);
      y += 10;

      if (payload.workouts.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(...colorMuted);
        doc.text('No workouts recorded in this period.', margin, y);
        y += 10;
      } else {
        payload.workouts.forEach(w => {
          checkPage(8);
          const date = (w.completed_at || '').split('T')[0];
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...brandPrimary);
          doc.text(`${date} - ${w.name || 'Workout'}`, margin, y);
          
          doc.setTextColor(...colorGreen);
          doc.setFont('helvetica', 'bold');
          doc.text('Completed ✓', pageW - margin, y, { align: 'right' });
          y += 7;
        });
      }

      // Final Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...colorMuted);
        doc.text(`Generated by atlas.core - Page ${i} of ${totalPages}`, margin, pageH - 10);
        doc.text(new Date().toLocaleString(), pageW - margin, pageH - 10, { align: 'right' });
      }

      doc.save(`${fileBase}.pdf`);
      setNotice('PDF report generated successfully.');
    } catch (error) {
      console.error(error);
      setNotice('Could not generate the PDF file.');
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
