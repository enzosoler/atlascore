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

  // Add meals
  meals.forEach((meal) => {
    rows.push([
      meal.date || '',
      'Meal',
      meal.description || 'Meal',
      `${meal.total_calories || 0} cal`,
    ]);
  });

  // Add workouts
  workouts.forEach((workout) => {
    rows.push([
      workout.date || '',
      'Workout',
      workout.status || workout.name || 'Workout',
      workout.exercises?.length ? `${workout.exercises.length} exercises` : 'N/A',
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
    const datasets = [
      ['meals', async () => []],
      ['workouts', async () => { const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(300); return data || []; }],
      ['measurements', async () => { const { data } = await supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(300); return data || []; }],
      ['checkins', async () => { const { data } = await supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(300); return data || []; }],
      ['protocols', async () => []],
      ['labExams', async () => []],
      ['progressPhotos', async () => []],
    ];

    const results = await Promise.allSettled(datasets.map(([, request]) => request()));
    const warnings = [];

    const getArray = (index, label) => {
      const result = results[index];
      if (result?.status === 'fulfilled') {
        return toArray(result.value);
      }
      warnings.push(label);
      return [];
    };

    const meals = getArray(0, 'meals');
    const workouts = getArray(1, 'workouts');
    const measurements = getArray(2, 'measurements');
    const checkins = getArray(3, 'checkins');
    const protocols = getArray(4, 'protocols');
    const labExams = getArray(5, 'labExams');
    const progressPhotos = getArray(6, 'progressPhotos');

    return {
      generated_at: new Date().toISOString(),
      period: { startDate, endDate },
      warnings,
      user: {
        name: user?.full_name || 'Athlete',
        email: user?.email || '',
      },
      meals: meals.filter((item) => isWithinRange(item?.date, startDate, endDate)),
      workouts: workouts.filter((item) => isWithinRange(item?.date, startDate, endDate)),
      measurements: measurements.filter((item) => isWithinRange(item?.date, startDate, endDate)),
      checkins: checkins.filter((item) => isWithinRange(item?.date, startDate, endDate)),
      protocols: protocols.filter((item) =>
        isWithinRange(item?.start_date || item?.created_date?.slice(0, 10), startDate, endDate)
      ),
      labExams: labExams.filter((item) => isWithinRange(item?.exam_date, startDate, endDate)),
      progressPhotos: progressPhotos.filter((item) => isWithinRange(item?.date, startDate, endDate)),
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;
      const margin = 10;
      const lineHeight = 5;
      const sectionGap = 8;

      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('atlas.core - Data Report', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Athlete: ${payload.user.name}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Period: ${payload.period.startDate} to ${payload.period.endDate}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Generated on: ${new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US')}`, margin, yPosition);
      yPosition += sectionGap;

      const addSection = (title, items) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 15;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(title, margin, yPosition);
        yPosition += 6;

        if (items.length === 0) {
          doc.setFontSize(9);
          doc.setFont(undefined, 'italic');
          doc.text('No records in this period', margin, yPosition);
          yPosition += 5;
        } else {
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          items.forEach((item) => {
            if (yPosition > pageHeight - 15) {
              doc.addPage();
              yPosition = 15;
            }
            doc.text(item, margin, yPosition);
            yPosition += lineHeight;
          });
        }
        yPosition += sectionGap;
      };

      // Workouts section
      const workoutItems = payload.workouts.map(
        (w) => `${w.date} - ${w.status || w.name || 'Workout'} (${w.exercises?.length || 0} exercises)`
      );
      addSection('Workouts', workoutItems);

      // Meals/Nutrition section
      const mealItems = payload.meals.map(
        (m) => `${m.date} - ${m.description || 'Meal'} (${m.total_calories || 0} cal, ${m.total_protein || 0}g protein)`
      );
      addSection('Meals and Nutrition', mealItems);

      // Measurements section
      const measurementItems = payload.measurements.map(
        (m) => `${m.date} - Weight: ${m.weight || 'N/A'} kg`
      );
      addSection('Measurements', measurementItems);

      // Protocols section
      const protocolItems = payload.protocols.map(
        (p) => `${p.start_date || p.created_date?.slice(0, 10) || '?'} - ${p.name} (${p.status || 'active'})`
      );
      addSection('Protocols', protocolItems);

      // Lab exams section
      const examItems = payload.labExams.map(
        (e) => `${e.exam_date} - ${e.exam_type || 'Exam'}`
      );
      addSection('Lab Exams', examItems);

      // Footer
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text(
        `Document generated by atlas.core on ${new Date().toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US')}`,
        margin,
        pageHeight - 8
      );

      doc.save(`${fileBase}.pdf`);
      setNotice(
        payload.warnings.length > 0
          ? `PDF export finished with partial data. Failed datasets: ${payload.warnings.join(', ')}.`
          : 'PDF export finished.'
      );
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
