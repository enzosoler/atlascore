import React, { useMemo, useState } from 'react';
import { Calendar, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
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
      'Refeição',
      meal.description || 'Refeição',
      `${meal.total_calories || 0} cal`,
    ]);
  });

  // Add workouts
  workouts.forEach((workout) => {
    rows.push([
      workout.date || '',
      'Treino',
      workout.status || workout.name || 'Treino',
      workout.exercises?.length ? `${workout.exercises.length} exercícios` : 'N/A',
    ]);
  });

  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

export default function Export() {
  return (
    <SafePageBoundary
      title="Exportar"
      subtitle="Modo seguro da página de exportação."
      maxWidth="max-w-4xl"
      fallbackDescription="Export page loaded. O conteudo principal falhou, mas a rota continua acessivel."
    >
      <ExportContent />
    </SafePageBoundary>
  );
}

function ExportContent() {
  const { user } = useAuth();
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
      ['meals', () => base44.entities.Meal.list('-date', 500)],
      ['workouts', () => base44.entities.Workout.list('-date', 300)],
      ['measurements', () => base44.entities.Measurement.list('-date', 300)],
      ['checkins', () => base44.entities.DailyCheckin.list('-date', 300)],
      ['protocols', () => base44.entities.Protocol.list('-start_date', 200)],
      ['labExams', () => base44.entities.LabExam.list('-exam_date', 200)],
      ['progressPhotos', () => base44.entities.ProgressPhoto.list('-date', 200)],
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
        name: user?.full_name || 'Atleta',
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
      setNotice('Ajuste o período antes de exportar.');
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
          ? `Exportação JSON concluida com dados parciais. Falharam: ${payload.warnings.join(', ')}.`
          : 'Exportação JSON concluida.'
      );
    } catch (error) {
      console.error(error);
      setNotice('Não foi possivel gerar o arquivo JSON.');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    if (invalidRange) {
      setNotice('Ajuste o período antes de exportar.');
      return;
    }

    setBusy(true);
    try {
      const payload = await collectData();
      const csvData = serializeCsvDataRows(payload.workouts, payload.meals);
      downloadFile(`${fileBase}.csv`, csvData, 'text/csv;charset=utf-8');
      setNotice(
        payload.warnings.length > 0
          ? `CSV exportado com dados parciais. Falharam: ${payload.warnings.join(', ')}.`
          : 'CSV exportado com sucesso.'
      );
    } catch (error) {
      console.error(error);
      setNotice('Não foi possivel gerar o CSV.');
    } finally {
      setBusy(false);
    }
  };

  const exportPdf = async () => {
    if (invalidRange) {
      setNotice('Ajuste o período antes de exportar.');
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
      doc.text('Atlas Core — Relatório de Dados', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Atleta: ${payload.user.name}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Período: ${payload.period.startDate} a ${payload.period.endDate}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
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
          doc.text('Sem registros neste período', margin, yPosition);
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

      // Treinos section
      const workoutItems = payload.workouts.map(
        (w) => `${w.date} — ${w.status || w.name || 'Treino'} (${w.exercises?.length || 0} exercícios)`
      );
      addSection('Treinos', workoutItems);

      // Refeições/Nutrição section
      const mealItems = payload.meals.map(
        (m) => `${m.date} — ${m.description || 'Refeição'} (${m.total_calories || 0} cal, ${m.total_protein || 0}g proteína)`
      );
      addSection('Refeições e Nutrição', mealItems);

      // Medições section
      const measurementItems = payload.measurements.map(
        (m) => `${m.date} — Peso: ${m.weight || 'N/A'} kg`
      );
      addSection('Medições', measurementItems);

      // Protocolos section
      const protocolItems = payload.protocols.map(
        (p) => `${p.start_date || p.created_date?.slice(0, 10) || '?'} — ${p.name} (${p.status || 'ativo'})`
      );
      addSection('Protocolos', protocolItems);

      // Exames Laboratoriais section
      const examItems = payload.labExams.map(
        (e) => `${e.exam_date} — ${e.exam_type || 'Exame'}`
      );
      addSection('Exames Laboratoriais', examItems);

      // Footer
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text(
        `Documento gerado por Atlas Core em ${new Date().toLocaleString('pt-BR')}`,
        margin,
        pageHeight - 8
      );

      doc.save(`${fileBase}.pdf`);
      setNotice(
        payload.warnings.length > 0
          ? `PDF exportado com dados parciais. Falharam: ${payload.warnings.join(', ')}.`
          : 'PDF exportado com sucesso.'
      );
    } catch (error) {
      console.error(error);
      setNotice('Não foi possivel gerar o PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      title="Exportar"
      subtitle="Exporte seus dados em JSON, CSV ou PDF formatado com resumo completo."
      maxWidth="max-w-4xl"
    >
      {notice ? <StatusBanner>{notice}</StatusBanner> : null}

      {busy ? (
        <LoadingState
          title="Página de exportação carregada"
          description="Estamos gerando o arquivo em modo seguro para evitar falhas silenciosas."
        />
      ) : null}

      {invalidRange ? (
        <ErrorState
          title="Período inválido"
          description="A data inicial precisa ser menor ou igual a data final para a exportação continuar."
        />
      ) : null}

      <SectionCard title="Período de exportação" subtitle="Escolha o intervalo que você quer baixar.">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-zinc-700">
            Data inicial
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none focus:border-zinc-400"
            />
          </label>
          <label className="text-sm text-zinc-700">
            Data final
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none focus:border-zinc-400"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryButton type="button" onClick={() => setStartDate(endDate)}>
            Mesmo dia
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => {
              const date = new Date(`${endDate}T12:00:00`);
              date.setDate(date.getDate() - 7);
              setStartDate(date.toISOString().split('T')[0]);
            }}
          >
            Ultimos 7 dias
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => {
              const date = new Date(`${endDate}T12:00:00`);
              date.setDate(date.getDate() - 30);
              setStartDate(date.toISOString().split('T')[0]);
            }}
          >
            Ultimos 30 dias
          </SecondaryButton>
        </div>
      </SectionCard>

      <UpgradeGate feature="standard_exports" plan="Pro">
        <SectionCard title="Downloads" subtitle="Arquivos simples, diretos e confiáveis.">
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              disabled={busy || invalidRange}
              onClick={exportJson}
              className="rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileJson className="h-6 w-6 text-zinc-700" strokeWidth={2} />
              <p className="mt-4 text-base font-semibold text-zinc-950">Exportar JSON completo</p>
              <p className="mt-2 text-sm text-zinc-600">
                Baixa todas as entidades principais filtradas pelo período escolhido.
              </p>
            </button>

            <button
              type="button"
              disabled={busy || invalidRange}
              onClick={exportCsv}
              className="rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileSpreadsheet className="h-6 w-6 text-zinc-700" strokeWidth={2} />
              <p className="mt-4 text-base font-semibold text-zinc-950">Exportar CSV</p>
              <p className="mt-2 text-sm text-zinc-600">
                Planilha com registros de treinos e refeições no período.
              </p>
            </button>

            <button
              type="button"
              disabled={busy || invalidRange}
              onClick={exportPdf}
              className="rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-6 w-6 text-zinc-700" strokeWidth={2} />
              <p className="mt-4 text-base font-semibold text-zinc-950">Exportar PDF</p>
              <p className="mt-2 text-sm text-zinc-600">
                Relatório formatado com resumo de treinos, nutrição, medições e protocolos.
              </p>
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <PrimaryButton type="button" disabled={busy || invalidRange} onClick={exportJson}>
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" strokeWidth={2} />
                {busy ? 'Gerando arquivo...' : 'Exportar agora'}
              </span>
            </PrimaryButton>
          </div>
        </SectionCard>
      </UpgradeGate>

      <SectionCard title="O que entra no arquivo" subtitle="Escopo da exportação reconstruída.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <Calendar className="mb-3 h-5 w-5 text-zinc-700" strokeWidth={2} />
            Refeições, check-ins, treinos e medições dentro do período selecionado.
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            Protocolos, exames laboratoriais e fotos de progresso também entram.
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            O arquivo inclui nome, email e o período usado na geração.
          </div>
        </div>
      </SectionCard>
    </PageShell>
  );
}
