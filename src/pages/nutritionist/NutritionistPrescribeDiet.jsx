import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import RoleGate from '@/components/rbac/RoleGate';
import {
  PageShell,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusBanner,
} from '@/components/shared/StablePage';

export default function NutritionistPrescribeDiet() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    client_email: '',
    name: '',
    description: '',
    target_calories: '',
    target_protein: '',
    target_carbs: '',
    target_fat: '',
    target_water: '',
    meals: [],
    restrictions: [],
    frequency: 'daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    active: true,
    notes: '',
  });

  const { data: client } = useQuery({
    queryKey: ['nutritionist-client', clientId],
    queryFn: () => clientId ? base44.entities.NutritionistClientLink.filter({ id: clientId }).then(r => r?.[0]) : null,
  });

  useEffect(() => {
    if (client) setForm(f => ({ ...f, client_email: client.client_email }));
  }, [client]);

  const saveMut = useMutation({
    mutationFn: (data) => base44.entities.PrescribedDiet.create(data),
    onSuccess: () => {
      toast.success('Diet plan prescribed successfully');
      qc.invalidateQueries(['nutritionist-client']);
      navigate(-1);
    },
  });

  const handleSave = () => {
    if (!form.client_email || !form.name) {
      toast.error('Client name and email are required');
      return;
    }
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) return;
      if (['target_calories', 'target_protein', 'target_carbs', 'target_fat', 'target_water'].includes(k)) payload[k] = Number(v);
      else payload[k] = v;
    });
    saveMut.mutate(payload);
  };

  return (
    <RoleGate roles={['nutritionist']}>
      <PageShell
        title="Prescribe diet"
        subtitle={`Create a structured nutrition plan for ${client?.client_name || 'this client'}.`}
        maxWidth="max-w-4xl"
        actions={
          <SecondaryButton type="button" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Back
          </SecondaryButton>
        }
      >
        <StatusBanner>
          Keep the plan concise, clear, and realistic. Daily targets should read like a prescription, not a spreadsheet.
        </StatusBanner>

        <SectionCard title="Plan details" subtitle="Define the name, targets, schedule, and notes.">
          <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Plan name</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Cutting Phase, Bulk Protocol" className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Plan details..." className="atlas-field min-h-[112px] w-full rounded-[14px] border-0 bg-transparent px-4 py-3 text-base outline-none placeholder:text-[hsl(var(--fg-3))]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Daily calories</label>
              <Input type="number" value={form.target_calories} onChange={e => setForm(f => ({ ...f, target_calories: e.target.value }))} placeholder="2200" className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Protein (g)</label>
              <Input type="number" value={form.target_protein} onChange={e => setForm(f => ({ ...f, target_protein: e.target.value }))} placeholder="160" className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Carbs (g)</label>
              <Input type="number" value={form.target_carbs} onChange={e => setForm(f => ({ ...f, target_carbs: e.target.value }))} placeholder="250" className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Fat (g)</label>
              <Input type="number" value={form.target_fat} onChange={e => setForm(f => ({ ...f, target_fat: e.target.value }))} placeholder="70" className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Water (L/day)</label>
              <Input type="number" step="0.5" value={form.target_water} onChange={e => setForm(f => ({ ...f, target_water: e.target.value }))} placeholder="3" className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Frequency</label>
              <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                <SelectTrigger className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Start date</label>
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Restrictions</label>
            <Input value={form.restrictions.join(', ')} onChange={e => setForm(f => ({ ...f, restrictions: e.target.value.split(',').map(r => r.trim()).filter(r => r) }))} placeholder="Example: dairy-free, vegan, gluten-free" className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Notes</label>
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." className="atlas-field h-12 rounded-[14px] border-0 bg-transparent px-4 text-base" />
          </div>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <PrimaryButton onClick={handleSave} disabled={saveMut.isPending}>
            {saveMut.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Prescribe diet</>}
          </PrimaryButton>
        </div>
      </PageShell>
    </RoleGate>
  );
}
