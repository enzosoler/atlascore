import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyClients } from '@/services/professionalLinksService';
import { useAuth } from '@/lib/AuthContext';
import RoleGate from '@/components/rbac/RoleGate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Loader2, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDate } from '@/lib/atlas-theme';
import { toast } from 'sonner';

const ROUTES = { oral:'Oral', sublingual:'Sublingual', intramuscular:'IM', subcutaneous:'SC', topical:'Topical', intravenous:'IV', nasal:'Nasal', other:'Other' };
const STATUS_BADGE = { normal:'badge-ok', low:'badge-warn', high:'badge-warn', critical:'badge-err' };
const CATEGORIES = { front:'Front', back:'Back', side:'Side', pose:'Pose' };

function MacroSummary({ label, value, color }) {
  return (
    <div className="text-center">
      <p className="kpi-sm" style={{ color }}>{value ?? '—'}</p>
      <p className="t-caption">{label}</p>
    </div>
  );
}

function OverviewTab({ email }) {
  // Patient data requires professional_links RLS policy (pending migration)
  const checkins = [];
  const measurements = [];
  const protocols = [];
  const exams = [];

  const latest = measurements[0];
  const avgMood = checkins.length ? (checkins.reduce((s, c) => s + (c.mood || 0), 0) / checkins.length).toFixed(1) : null;

  return (
    <div className="space-y-4">
      <div className="surface p-5">
        <p className="t-label mb-3">Overview</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MacroSummary label="Weight" value={latest?.weight ? `${latest.weight}kg` : null} color="hsl(var(--brand))" />
          <MacroSummary label="Body fat" value={latest?.body_fat ? `${latest.body_fat}%` : null} color="hsl(var(--warn))" />
          <MacroSummary label="Average mood" value={avgMood ? `${avgMood}/5` : null} color="hsl(var(--ok))" />
          <MacroSummary label="Protocols" value={protocols.length} color="hsl(var(--brand-ai))" />
        </div>
      </div>
      {exams.length > 0 && (
        <div className="surface p-4">
          <p className="t-label mb-2">Latest exam</p>
          <p className="text-[13px] font-semibold">{exams[0].panel_name}</p>
          <p className="t-caption">{formatDate(exams[0].exam_date)}</p>
        </div>
      )}
    </div>
  );
}

function ExamsTab() {
  // Patient lab exams require professional_links RLS policy (pending migration)
  const exams = [];
  if (exams.length === 0) return <p className="t-caption p-4">No exams recorded.</p>;
  return (
    <div className="space-y-3">
      {exams.map(exam => (
        <div key={exam.id} className="surface p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[14px] font-semibold">{exam.panel_name}</p>
            <p className="t-caption">{formatDate(exam.exam_date)}</p>
          </div>
          {(exam.markers || []).length > 0 && (
            <div className="space-y-1.5">
              {exam.markers.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-[12px]">
                  <span className="text-[hsl(var(--fg))]">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{m.value} {m.unit}</span>
                    {m.status && <span className={`badge ${STATUS_BADGE[m.status] || 'badge-neutral'}`}>{m.status}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {exam.notes && <p className="t-caption italic">{exam.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function MeasurementsTab() {
  // Patient measurements require professional_links RLS policy (pending migration)
  const measurements = [];
  const chartData = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => ({
    date: new Date(m.date + 'T12:00').toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
    Weight: m.weight, BodyFat: m.body_fat,
  })).filter(d => d.Weight);

  return (
    <div className="space-y-4">
      {chartData.length >= 2 && (
        <div className="surface p-5">
          <p className="t-label mb-4">Progress</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={32} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="Weight" stroke="hsl(var(--brand))" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="BodyFat" stroke="hsl(var(--warn))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {measurements.map(m => (
        <div key={m.id} className="surface px-4 py-3">
          <p className="text-[13px] font-semibold mb-1">{formatDate(m.date)}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 t-caption">
            {m.weight && <span>Weight <b>{m.weight}kg</b></span>}
            {m.body_fat && <span>Body fat <b>{m.body_fat}%</b></span>}
            {m.waist && <span>Waist <b>{m.waist}cm</b></span>}
            {m.arms && <span>Arms <b>{m.arms}cm</b></span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotosTab() {
  // Patient photos require professional_links RLS policy (pending migration)
  const photos = [];
  if (photos.length === 0) return <p className="t-caption p-4">No photos recorded.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map(p => (
        <div key={p.id} className="relative rounded-xl overflow-hidden">
          <img src={p.photo_url} alt="" className="w-full aspect-[3/4] object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white text-[11px]">{CATEGORIES[p.category] || p.category}</p>
            <p className="text-white/70 text-[10px]">{formatDate(p.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProtocolsTab() {
  // Patient protocols require professional_links RLS policy (pending migration)
  const protocols = [];
  if (protocols.length === 0) return <p className="t-caption p-4">No protocols recorded.</p>;
  return (
    <div className="space-y-2">
      {protocols.map(p => (
        <div key={p.id} className={`surface px-4 py-3 ${!p.active ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-semibold">{p.name}</p>
            <span className={`badge ${p.active ? 'badge-ok' : 'badge-neutral'}`}>{p.active ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 t-caption">
            {p.substance_name && <span>{p.substance_name}</span>}
            {p.dose && <span className="font-semibold text-[hsl(var(--fg))]">{p.dose}</span>}
            {p.frequency && <span>{p.frequency}</span>}
            {p.route && <span>{ROUTES[p.route]}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExportsTab({ patientEmail }) {
  const exportCSV = async () => {
    // Patient data export requires professional_links RLS policy (pending migration)
    const [exams, measurements, protocols] = [[], [], []];

    const rows = [
      ['Type', 'Date', 'Detail', 'Value'],
      ...measurements.map(m => ['Measurement', m.date, 'Weight', m.weight ?? '']),
      ...measurements.map(m => ['Measurement', m.date, 'Body Fat %', m.body_fat ?? '']),
      ...exams.flatMap(e => (e.markers || []).map(mk => ['Exam', e.exam_date, mk.name, `${mk.value} ${mk.unit}`])),
      ...protocols.map(p => ['Protocol', p.start_date || '', p.name, p.dose || '']),
    ];

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `patient_${patientEmail}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  return (
    <div className="surface p-5 space-y-4">
      <p className="t-label">Exports</p>
      <p className="t-body text-[hsl(var(--fg-2))]">Export the patient’s clinical data to CSV for external use or analysis.</p>
      <button onClick={exportCSV} className="btn btn-primary gap-1.5 h-10">
        <Download className="w-4 h-4" /> Export CSV
      </button>
    </div>
  );
}

export default function ClinicianPatientProfile() {
  const { id: patientId } = useParams();
  const { user } = useAuth();

  const { data: patientLinks = [] } = useQuery({
    queryKey: ['clinician-patients', user?.id],
    queryFn: () => getMyClients(user.id, 'clinician'),
    enabled: !!user?.id,
  });

  const patient = patientLinks.find((p) => p.client_id === patientId) || null;
  const displayName = patient?.client_name || patient?.client_email || patientId;

  return (
    <RoleGate roles={['clinician', 'admin']}>
      <div className="mx-auto max-w-3xl p-5 lg:p-8 space-y-6">
        <div className="pb-5 border-b border-[hsl(var(--border-h))]">
          <Link to="/clinician/patients" className="flex items-center gap-1 t-caption text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] mb-3 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} /> Back to patients
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[hsl(var(--ok)/0.1)] flex items-center justify-center font-bold text-[hsl(var(--ok))] text-[17px] shrink-0">
              {displayName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="t-title">{displayName}</h1>
              <p className="t-caption">{patient?.client_email || patientId}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-[hsl(var(--card-hi))] border border-[hsl(var(--border))] h-10 rounded-xl w-full p-1 gap-1 flex-wrap">
            {[['overview','Overview'], ['exams','Exams'], ['measurements','Measurements'], ['photos','Photos'], ['protocols','Protocols'], ['exports','Export']].map(([v, l]) => (
              <TabsTrigger key={v} value={v}
                className="flex-1 rounded-lg text-[10px] font-medium h-8 transition-all data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--fg))] data-[state=active]:shadow-sm text-[hsl(var(--fg-2))]">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="overview" className="mt-4"><OverviewTab email={patient?.client_email} /></TabsContent>
          <TabsContent value="exams" className="mt-4"><ExamsTab /></TabsContent>
          <TabsContent value="measurements" className="mt-4"><MeasurementsTab /></TabsContent>
          <TabsContent value="photos" className="mt-4"><PhotosTab /></TabsContent>
          <TabsContent value="protocols" className="mt-4"><ProtocolsTab /></TabsContent>
          <TabsContent value="exports" className="mt-4"><ExportsTab patientEmail={patient?.client_email || patientId} /></TabsContent>
        </Tabs>
      </div>
    </RoleGate>
  );
}
