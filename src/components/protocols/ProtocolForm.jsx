import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, FlaskConical, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SubstancePicker from '@/components/protocols/SubstancePicker';

const CATEGORY_OPTIONS = [
  { value: 'supplement', label: 'Suplemento' },
  { value: 'medication', label: 'Medicação' },
  { value: 'hormone', label: 'Hormônio' },
  { value: 'peptide', label: 'Peptídeo' },
  { value: 'ancillary', label: 'Auxiliar' },
  { value: 'other', label: 'Outro' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'finished', label: 'Finalizado' },
];

const EMPTY_FORM = {
  substance_name: '',
  name: '',
  category: 'supplement',
  dose: '',
  frequency: '',
  schedule: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  notes: '',
  status: 'active',
};

function resolveStatus(protocol) {
  if (protocol?.end_date) return 'finished';
  if (protocol?.active === false) return 'paused';
  return 'active';
}

function buildFormState(protocol) {
  if (!protocol) return EMPTY_FORM;

  return {
    substance_name: protocol.substance_name || '',
    name: protocol.name || '',
    category: protocol.category || 'supplement',
    dose: protocol.dose || '',
    frequency: protocol.frequency || '',
    schedule: protocol.schedule || '',
    start_date: protocol.start_date || new Date().toISOString().split('T')[0],
    end_date: protocol.end_date || '',
    notes: protocol.notes || '',
    status: resolveStatus(protocol),
  };
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

function SectionHeader({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div>
          <p className="atlas-overline">{eyebrow}</p>
          <h3 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {title}
          </h3>
        </div>
      </div>
      <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{description}</p>
    </div>
  );
}

export default function ProtocolForm({
  protocol = null,
  isSubmitting = false,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(() => buildFormState(protocol));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(buildFormState(protocol));
    setErrors({});
  }, [protocol]);

  const selectedStatus = form.status;

  const previewLabel = useMemo(() => {
    return form.substance_name || form.name || 'Novo protocolo';
  }, [form.name, form.substance_name]);

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubstanceSelect = (item) => {
    setForm((previous) => ({
      ...previous,
      substance_name: item.canonical_name || previous.substance_name,
      name: previous.name || item.canonical_name,
      category: item.category || previous.category || 'supplement',
      frequency: previous.frequency || item.common_frequency_reference || '',
      notes: previous.notes || item.structured_notes || '',
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.substance_name.trim() && !form.name.trim()) {
      nextErrors.substance_name = 'Informe a substância principal ou um nome de protocolo.';
    }
    if (!form.start_date) {
      nextErrors.start_date = 'Defina a data inicial.';
    }
    if (form.status === 'finished' && !form.end_date) {
      nextErrors.end_date = 'Defina a data final para protocolos concluídos.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      substance_name: form.substance_name.trim(),
      name: form.name.trim() || form.substance_name.trim(),
      category: form.category,
      dose: form.dose.trim(),
      frequency: form.frequency.trim(),
      schedule: form.schedule.trim(),
      start_date: form.start_date,
      end_date: form.status === 'finished' ? form.end_date : '',
      notes: form.notes.trim(),
      active: form.status === 'active',
    };

    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 lg:p-7">
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.88)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.1),transparent_34%),linear-gradient(180deg,hsl(var(--fill)/0.78)_0%,hsl(var(--card))_100%)] p-5 shadow-[var(--shadow-xs)]">
        <p className="atlas-overline">Preview</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.12)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--brand))]">
            {STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || 'Ativo'}
          </span>
          <span className="rounded-full border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
            {CATEGORY_OPTIONS.find((option) => option.value === form.category)?.label || 'Outro'}
          </span>
        </div>
        <p className="mt-4 text-[1.25rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
          {previewLabel}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          {form.dose || 'Dose a definir'} · {form.frequency || 'Frequência a definir'}
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeader
          icon={Pill}
          eyebrow="Identidade"
          title="Definição do protocolo"
          description="Estruture a substância principal, categoria e o nome interno usado na operação clínica."
        />

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-2">
            <SubstancePicker
              value={form.substance_name}
              onChange={(value) => setField('substance_name', value)}
              onSelect={handleSubstanceSelect}
            />
            {errors.substance_name ? (
              <p className="text-[12px] text-[hsl(var(--err))]">{errors.substance_name}</p>
            ) : null}
          </div>

          <FieldShell
            label="Nome interno / stack"
            description="Opcional, útil quando o protocolo faz parte de um bloco maior."
          >
            <Input
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Ex: TRT Base, Base de recuperação"
              className="h-12"
            />
          </FieldShell>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FieldShell label="Categoria">
            <select
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
              className="atlas-field h-12 px-4 text-base"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label="Dose">
            <Input
              value={form.dose}
              onChange={(event) => setField('dose', event.target.value)}
              placeholder="Ex: 200 mg, 5 g, 1 cápsula"
              className="h-12"
            />
          </FieldShell>

          <FieldShell label="Frequência">
            <Input
              value={form.frequency}
              onChange={(event) => setField('frequency', event.target.value)}
              placeholder="Ex: 1x/semana, diário, dsdn"
              className="h-12"
            />
          </FieldShell>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={CalendarRange}
          eyebrow="Cadência"
          title="Janela e operação"
          description="Defina o ritmo de uso, o status atual e a janela temporal do protocolo."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Horário / rotina">
            <Input
              value={form.schedule}
              onChange={(event) => setField('schedule', event.target.value)}
              placeholder="Ex: manhã, pré-treino, antes de dormir"
              className="h-12"
            />
          </FieldShell>

          <FieldShell label="Status atual">
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setField('status', option.value)}
                  className={
                    option.value === form.status
                      ? 'atlas-button atlas-button-primary h-11'
                      : 'atlas-button atlas-button-secondary h-11'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </FieldShell>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Início">
            <Input
              type="date"
              value={form.start_date}
              onChange={(event) => setField('start_date', event.target.value)}
              className="h-12"
            />
            {errors.start_date ? (
              <p className="text-[12px] text-[hsl(var(--err))]">{errors.start_date}</p>
            ) : null}
          </FieldShell>

          <FieldShell
            label="Fim"
            description={form.status === 'finished' ? 'Obrigatório para protocolos concluídos.' : 'Opcional enquanto o protocolo estiver ativo ou pausado.'}
          >
            <Input
              type="date"
              value={form.end_date}
              onChange={(event) => setField('end_date', event.target.value)}
              className="h-12"
            />
            {errors.end_date ? (
              <p className="text-[12px] text-[hsl(var(--err))]">{errors.end_date}</p>
            ) : null}
          </FieldShell>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={FlaskConical}
          eyebrow="Notas"
          title="Contexto clínico"
          description="Adicione observações de monitoramento, resposta percebida ou instruções da equipe."
        />

        <FieldShell label="Observações">
          <Textarea
            value={form.notes}
            onChange={(event) => setField('notes', event.target.value)}
            placeholder="Ex: ajustar após novos exames, observar pressão, uso apenas em dias de treino..."
            className="min-h-[140px] resize-y"
          />
        </FieldShell>
      </section>

      <div className="flex flex-col gap-3 border-t border-[hsl(var(--border)/0.82)] pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="sm:min-w-[140px]" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="sm:min-w-[180px]" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : protocol ? 'Salvar alterações' : 'Criar protocolo'}
        </Button>
      </div>
    </form>
  );
}
