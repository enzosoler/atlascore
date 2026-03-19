import React, { useMemo, useState } from 'react';
import {
  Activity,
  CalendarClock,
  Pencil,
  Plus,
  Scale,
  Trash2,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MeasurementInsights from '@/components/measurements/MeasurementInsights';
import {
  EmptyState,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  SectionCard,
  StatusBanner,
  shiftDate,
} from '@/components/shared/StablePage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getToday } from '@/lib/atlas-theme';

const INPUT_CLASS_NAME =
  'w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400';
const TEXTAREA_CLASS_NAME = `${INPUT_CLASS_NAME} min-h-[120px] resize-y`;

const TODAY = getToday();

const MOCK_MEASUREMENTS = [
  {
    id: 'measurement-1',
    date: shiftDate(TODAY, -28),
    weight: 84.4,
    body_fat: 16.8,
    waist: 86.5,
    chest: 103,
    arms: 38.2,
    thighs: 59.3,
    hips: 97.4,
    neck: 39.5,
    notes: 'Retorno apos deload.',
  },
  {
    id: 'measurement-2',
    date: shiftDate(TODAY, -21),
    weight: 83.8,
    body_fat: 16.4,
    waist: 85.9,
    chest: 103.4,
    arms: 38.3,
    thighs: 59.1,
    hips: 97,
    neck: 39.4,
    notes: '',
  },
  {
    id: 'measurement-3',
    date: shiftDate(TODAY, -14),
    weight: 83.1,
    body_fat: 15.9,
    waist: 85,
    chest: 103.6,
    arms: 38.5,
    thighs: 58.8,
    hips: 96.5,
    neck: 39.3,
    notes: 'Sono melhor e cintura baixando.',
  },
  {
    id: 'measurement-4',
    date: shiftDate(TODAY, -7),
    weight: 82.6,
    body_fat: 15.5,
    waist: 84.3,
    chest: 103.8,
    arms: 38.7,
    thighs: 58.6,
    hips: 96.1,
    neck: 39.2,
    notes: '',
  },
  {
    id: 'measurement-5',
    date: TODAY,
    weight: 82.1,
    body_fat: 15.1,
    waist: 83.7,
    chest: 104.1,
    arms: 38.9,
    thighs: 58.4,
    hips: 95.8,
    neck: 39.1,
    notes: 'Check-in mais seco, sem queda de performance.',
  },
];

const METRIC_OPTIONS = [
  { key: 'weight', label: 'Peso', unit: 'kg', color: '#111827' },
  { key: 'body_fat', label: 'Body fat', unit: '%', color: '#2563eb' },
  { key: 'waist', label: 'Cintura', unit: 'cm', color: '#ea580c' },
  { key: 'chest', label: 'Peito', unit: 'cm', color: '#059669' },
];

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatMeasurementDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function toDisplayNumber(value, digits = 1) {
  return Number(value || 0).toFixed(digits);
}

function SummaryTile({ label, value, hint, icon: Icon }) {
  return (
    <article className="rounded-[28px] border border-zinc-200/90 bg-white px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{hint}</p>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function HistoryCard({ measurement, onEdit, onDelete }) {
  return (
    <article className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-950">
                {new Date(`${measurement.date}T12:00:00`).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                Registro local
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Peso {toDisplayNumber(measurement.weight)} kg · BF {toDisplayNumber(measurement.body_fat)}% · Cintura{' '}
              {toDisplayNumber(measurement.waist)} cm
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <InfoBadge label="Peito" value={toDisplayNumber(measurement.chest)} unit="cm" />
            <InfoBadge label="Braco" value={toDisplayNumber(measurement.arms)} unit="cm" />
            <InfoBadge label="Coxa" value={toDisplayNumber(measurement.thighs)} unit="cm" />
            <InfoBadge label="Quadril" value={toDisplayNumber(measurement.hips)} unit="cm" />
          </div>

          {measurement.notes ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Notes
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{measurement.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[220px] lg:justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoBadge({ label, value, unit }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-zinc-950">
        {value}
        {unit ? <span className="ml-1 text-xs font-medium text-zinc-500">{unit}</span> : null}
      </p>
    </div>
  );
}

function getMeasurementFormState(measurement) {
  return {
    date: measurement?.date || TODAY,
    weight: measurement?.weight ? String(measurement.weight) : '',
    body_fat: measurement?.body_fat ? String(measurement.body_fat) : '',
    waist: measurement?.waist ? String(measurement.waist) : '',
    chest: measurement?.chest ? String(measurement.chest) : '',
    arms: measurement?.arms ? String(measurement.arms) : '',
    thighs: measurement?.thighs ? String(measurement.thighs) : '',
    hips: measurement?.hips ? String(measurement.hips) : '',
    neck: measurement?.neck ? String(measurement.neck) : '',
    notes: measurement?.notes || '',
  };
}

function MeasurementForm({ measurement, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => getMeasurementFormState(measurement));

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      id: measurement?.id || createLocalId('measurement'),
      date: form.date || TODAY,
      weight: Number(form.weight || 0),
      body_fat: Number(form.body_fat || 0),
      waist: Number(form.waist || 0),
      chest: Number(form.chest || 0),
      arms: Number(form.arms || 0),
      thighs: Number(form.thighs || 0),
      hips: Number(form.hips || 0),
      neck: Number(form.neck || 0),
      notes: form.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
      <label className="block text-sm font-medium text-zinc-700">
        Data
        <input
          type="date"
          value={form.date}
          onChange={(event) => updateField('date', event.target.value)}
          className={`${INPUT_CLASS_NAME} mt-2`}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm font-medium text-zinc-700">
          Peso
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.weight}
            onChange={(event) => updateField('weight', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Body fat
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.body_fat}
            onChange={(event) => updateField('body_fat', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Cintura
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.waist}
            onChange={(event) => updateField('waist', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block text-sm font-medium text-zinc-700">
          Peito
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.chest}
            onChange={(event) => updateField('chest', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Braco
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.arms}
            onChange={(event) => updateField('arms', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Coxa
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.thighs}
            onChange={(event) => updateField('thighs', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Quadril
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.hips}
            onChange={(event) => updateField('hips', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          Pescoco
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.neck}
            onChange={(event) => updateField('neck', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-zinc-700">
        Observacoes
        <textarea
          value={form.notes}
          onChange={(event) => updateField('notes', event.target.value)}
          placeholder="Ex: reducao consistente na cintura."
          className={`${TEXTAREA_CLASS_NAME} mt-2`}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit">
          {measurement ? 'Salvar medidas' : 'Registrar medidas'}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function Measurements() {
  return (
    <SafePageBoundary
      title="Measurements"
      subtitle="Historico de medidas com estado local proprio, sem aderencia de treino e sem reuse indevido."
      maxWidth="max-w-6xl"
      fallbackDescription="A rota de Measurements continua acessivel mesmo se a interface principal falhar."
    >
      <MeasurementsContent />
    </SafePageBoundary>
  );
}

function MeasurementsContent() {
  const [metricKey, setMetricKey] = useState('weight');
  const [notice, setNotice] = useState(null);
  const [measurements, setMeasurements] = useState(MOCK_MEASUREMENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);

  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort((left, right) => new Date(left.date) - new Date(right.date));
  }, [measurements]);

  const latestMeasurement = sortedMeasurements[sortedMeasurements.length - 1] || null;
  const previousMeasurement = sortedMeasurements[sortedMeasurements.length - 2] || null;
  const selectedMetric = METRIC_OPTIONS.find((metric) => metric.key === metricKey) || METRIC_OPTIONS[0];

  const chartData = sortedMeasurements.map((measurement) => ({
    date: formatMeasurementDate(measurement.date),
    value: measurement[metricKey],
  }));

  const latestValue = latestMeasurement?.[metricKey] || 0;
  const previousValue = previousMeasurement?.[metricKey] || 0;
  const delta = latestMeasurement && previousMeasurement ? latestValue - previousValue : 0;

  const handleCreate = () => {
    setNotice(null);
    setEditingMeasurement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (measurement) => {
    setNotice(null);
    setEditingMeasurement(measurement);
    setIsFormOpen(true);
  };

  const handleDelete = (measurement) => {
    const confirmed = window.confirm(`Delete measurements from ${measurement.date}?`);

    if (!confirmed) return;

    setMeasurements((current) => current.filter((item) => item.id !== measurement.id));
    setNotice({
      tone: 'success',
      message: 'Registro de medidas removido do estado local.',
    });
  };

  const handleSaveMeasurement = (payload) => {
    if (!payload.date || payload.weight <= 0) {
      setNotice({
        tone: 'warning',
        message: 'Informe ao menos data e peso para salvar o registro.',
      });
      return;
    }

    setMeasurements((current) => {
      const exists = current.some((item) => item.id === payload.id);

      if (exists) {
        return current.map((item) => (item.id === payload.id ? payload : item));
      }

      return [...current, payload];
    });

    setIsFormOpen(false);
    setEditingMeasurement(null);
    setNotice({
      tone: 'success',
      message:
        payload.id === editingMeasurement?.id
          ? 'Registro de medidas atualizado.'
          : 'Registro de medidas criado.',
    });
  };

  return (
    <PageShell
      title="Measurements"
      subtitle="Somente historico corporal e acompanhamento de medidas vivem nesta pagina."
      actions={
        <PrimaryButton type="button" onClick={handleCreate} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Registrar medidas
        </PrimaryButton>
      }
      maxWidth="max-w-6xl"
    >
      <StatusBanner tone="warning">
        Measurements agora esta isolada: sem imports de treino, sem adherence e sem logica compartilhada com outras paginas.
      </StatusBanner>

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Weight"
          value={latestMeasurement ? `${toDisplayNumber(latestMeasurement.weight)} kg` : '--'}
          hint="Ultimo peso registrado nesta pagina."
          icon={Scale}
        />
        <SummaryTile
          label="Body Fat"
          value={latestMeasurement ? `${toDisplayNumber(latestMeasurement.body_fat)} %` : '--'}
          hint="Percentual corporal mais recente."
          icon={Activity}
        />
        <SummaryTile
          label="Last Update"
          value={latestMeasurement ? formatMeasurementDate(latestMeasurement.date) : '--'}
          hint="Data do ultimo registro local."
          icon={CalendarClock}
        />
      </section>

      <SectionCard
        title="Tendencia"
        subtitle="Grafico local de medidas sem qualquer logica de treino."
        actions={
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => setMetricKey(metric.key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  metricKey === metric.key
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        }
      >
        {latestMeasurement ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <InfoBadge label="Metric" value={selectedMetric.label} unit={selectedMetric.unit} />
              <InfoBadge
                label="Current"
                value={toDisplayNumber(latestValue)}
                unit={selectedMetric.unit}
              />
              <InfoBadge
                label="Delta"
                value={`${delta > 0 ? '+' : ''}${toDisplayNumber(delta)}`}
                unit={selectedMetric.unit}
              />
            </div>

            <div className="h-[280px] rounded-[28px] border border-zinc-200 bg-zinc-50 px-4 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(1)} ${selectedMetric.unit}`, selectedMetric.label]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={selectedMetric.color}
                    strokeWidth={3}
                    dot={{ fill: selectedMetric.color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <MeasurementInsights
              measurements={sortedMeasurements}
              latest={latestMeasurement}
              prev={previousMeasurement}
            />
          </div>
        ) : (
          <EmptyState
            title="Sem medidas para mostrar"
            description="Registre a primeira entrada para ativar o grafico e os insights locais."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Historico de medidas"
        subtitle="Registros editaveis e isolados desta rota."
      >
        {!sortedMeasurements.length ? (
          <EmptyState
            title="Nenhum registro de medidas"
            description="Use o modal correto desta pagina para criar seu primeiro checkpoint corporal."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Registrar medidas
              </PrimaryButton>
            }
          />
        ) : (
          <div className="space-y-4">
            {[...sortedMeasurements]
              .reverse()
              .map((measurement) => (
                <HistoryCard
                  key={measurement.id}
                  measurement={measurement}
                  onEdit={() => handleEdit(measurement)}
                  onDelete={() => handleDelete(measurement)}
                />
              ))}
          </div>
        )}
      </SectionCard>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingMeasurement(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] border-zinc-200 bg-white p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:max-w-3xl">
          <DialogHeader className="border-b border-zinc-200 px-6 pb-5 pt-6 text-left">
            <DialogTitle className="text-[28px] font-semibold tracking-[-0.04em] text-zinc-950">
              {editingMeasurement ? 'Editar medidas' : 'Registrar medidas'}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Este modal pertence somente a Measurements e salva dados corporais no estado local desta rota.
            </DialogDescription>
          </DialogHeader>

          <MeasurementForm
            key={editingMeasurement?.id || 'new-measurement'}
            measurement={editingMeasurement}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingMeasurement(null);
            }}
            onSubmit={handleSaveMeasurement}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
