import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, User, Dumbbell, Utensils, Ruler, Image, Brain,
  AlertTriangle, CreditCard, Shield, Clock, ChevronDown,
  Eye, Crown, CrownIcon, RotateCcw, Ban, StickyNote,
  MessageCircle, Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchUserFull, fetchUserWorkouts, fetchUserFoodLogs, fetchUserCheckins,
  fetchUserMeasurements, fetchUserPhotos, fetchUserAIData,
  fetchUserAuditLogs, fetchUserErrors, fetchUserTimeline,
  addAdminNote, grantAccess, revokeAccess, resetOnboarding,
  suspendUser, unsuspendUser, logAdminAction,
} from '@/lib/adminService';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function relTime(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const PROFILE_LABELS = {
  age: 'Age', height: 'Height', weight: 'Weight', sex: 'Sex', gender: 'Gender',
  goal: 'Goal', goals: 'Goals', activity_level: 'Activity Level',
  training_frequency: 'Training Frequency', training_experience: 'Training Experience',
  dietary_preference: 'Dietary Preference', equipment_access: 'Equipment Access',
};

const TIMELINE_ICONS = {
  workout: Dumbbell, meal_day: Utensils, measurement: Ruler, photo: Image,
  ai_message: Brain, error: AlertTriangle, subscription: CreditCard,
  audit: Shield,
};

export default function AdminUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('summary');
  const [dialog, setDialog] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [timelineLimit, setTimelineLimit] = useState(40);

  // ── Core query (always loaded) ──
  const { data: core, isLoading } = useQuery({
    queryKey: ['user360', userId, 'core'],
    queryFn: () => fetchUserFull(userId),
  });
  const profile = core?.profile;
  const subscription = core?.subscription;

  // ── Tab-gated queries ──
  const workoutsQ = useQuery({ queryKey: ['user360', userId, 'workouts'], queryFn: () => fetchUserWorkouts(userId), enabled: tab === 'workouts' || tab === 'summary', staleTime: 30_000 });
  const nutritionQ = useQuery({ queryKey: ['user360', userId, 'nutrition'], queryFn: () => fetchUserFoodLogs(userId), enabled: tab === 'nutrition', staleTime: 30_000 });
  const checkinsQ = useQuery({ queryKey: ['user360', userId, 'checkins'], queryFn: () => fetchUserCheckins(userId), enabled: tab === 'checkins', staleTime: 30_000 });
  const measurementsQ = useQuery({ queryKey: ['user360', userId, 'measurements'], queryFn: () => fetchUserMeasurements(userId), enabled: tab === 'measurements', staleTime: 30_000 });
  const photosQ = useQuery({ queryKey: ['user360', userId, 'photos'], queryFn: () => fetchUserPhotos(userId), enabled: tab === 'photos', staleTime: 30_000 });
  const aiQ = useQuery({ queryKey: ['user360', userId, 'ai'], queryFn: () => fetchUserAIData(userId), enabled: tab === 'ai', staleTime: 30_000 });
  const auditQ = useQuery({ queryKey: ['user360', userId, 'audit'], queryFn: () => fetchUserAuditLogs(userId, 100), enabled: tab === 'audit' || tab === 'summary', staleTime: 30_000 });
  const errorsQ = useQuery({ queryKey: ['user360', userId, 'errors'], queryFn: () => fetchUserErrors(userId, 20), enabled: tab === 'summary', staleTime: 30_000 });
  const timelineQ = useQuery({ queryKey: ['user360', userId, 'timeline'], queryFn: () => fetchUserTimeline(userId), enabled: tab === 'timeline', staleTime: 60_000 });

  // ── Mutations ──
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['user360', userId] });
  const grantM = useMutation({ mutationFn: () => grantAccess(userId, 'premium', 'admin_grant'), onSuccess: () => { toast.success('Premium granted'); invalidate(); setDialog(null); } });
  const revokeM = useMutation({ mutationFn: () => revokeAccess(userId), onSuccess: () => { toast.success('Access revoked'); invalidate(); setDialog(null); } });
  const resetM = useMutation({ mutationFn: () => resetOnboarding(userId), onSuccess: () => { toast.success('Onboarding reset'); invalidate(); setDialog(null); } });
  const suspendM = useMutation({
    mutationFn: () => profile?.is_suspended ? unsuspendUser(userId) : suspendUser(userId),
    onSuccess: () => { toast.success(profile?.is_suspended ? 'User unsuspended' : 'User suspended'); invalidate(); setDialog(null); },
  });
  const noteM = useMutation({
    mutationFn: () => addAdminNote(userId, noteText),
    onSuccess: () => { toast.success('Note added'); setNoteText(''); invalidate(); setDialog(null); },
  });

  if (isLoading) return <div className="flex items-center justify-center py-20 text-[hsl(var(--fg-3))]"><Clock className="mr-2 h-4 w-4 animate-spin" /> Loading user...</div>;
  if (!profile) return <div className="py-20 text-center text-[hsl(var(--fg-3))]">User not found.</div>;

  const pd = profile.profile_data || {};
  const targets = pd.targets || {};

  // ════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════
  return (
    <div className="space-y-6 pb-12">
      {/* Back */}
      <button type="button" onClick={() => navigate('/AdminPanel/users')} className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to users
      </button>

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start gap-4 rounded-[18px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-lg font-bold text-[hsl(var(--brand))]">
          {initials(profile.full_name || profile.email)}
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">{profile.full_name || profile.email || 'Unknown'}</h1>
          <p className="text-[13px] text-[hsl(var(--fg-3))]">{profile.email}</p>
          <p className="font-mono text-[11px] text-[hsl(var(--fg-3))] opacity-60">{userId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[11px]">{profile.role || 'athlete'}</Badge>
          {subscription && (
            <Badge className={`text-[11px] ${subscription.status === 'active' || subscription.status === 'trialing' ? 'bg-[hsl(var(--ok)/0.15)] text-[hsl(var(--ok))]' : 'bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]'}`}>
              {subscription.tier} · {subscription.status}
            </Badge>
          )}
          <Badge className={`text-[11px] ${profile.onboarding_completed ? 'bg-[hsl(var(--ok)/0.15)] text-[hsl(var(--ok))]' : 'bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]'}`}>
            {profile.onboarding_completed ? 'Onboarded' : 'Not onboarded'}
          </Badge>
          {profile.is_suspended && <Badge className="bg-[hsl(var(--err)/0.15)] text-[hsl(var(--err))] text-[11px]">Suspended</Badge>}
        </div>
        <div className="text-right text-[12px] text-[hsl(var(--fg-3))]">
          <div>Joined {fmt(profile.created_at)}</div>
          <div>Last active {relTime(profile.updated_at)}</div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => { logAdminAction('impersonation_started', userId, { source: 'user_360' }); navigate(`/AdminPanel/view-as/${userId}`); }}>
          <Eye className="mr-1.5 h-3.5 w-3.5" /> Impersonate
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDialog('grant')}><Crown className="mr-1.5 h-3.5 w-3.5" /> Grant Premium</Button>
        <Button size="sm" variant="outline" onClick={() => setDialog('revoke')}><CrownIcon className="mr-1.5 h-3.5 w-3.5" /> Revoke Premium</Button>
        <Button size="sm" variant="outline" onClick={() => setDialog('reset')}><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Onboarding</Button>
        <Button size="sm" variant="outline" onClick={() => setDialog('suspend')}><Ban className="mr-1.5 h-3.5 w-3.5" /> {profile.is_suspended ? 'Unsuspend' : 'Suspend'}</Button>
        <Button size="sm" variant="outline" onClick={() => setDialog('note')}><StickyNote className="mr-1.5 h-3.5 w-3.5" /> Add Note</Button>
      </div>

      {/* ── TABS ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-1">
          {['summary','profile','workouts','nutrition','checkins','measurements','photos','ai','timeline','audit'].map((t) => (
            <TabsTrigger key={t} value={t} className="text-[12px] capitalize">{t === 'ai' ? 'AI' : t}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── SUMMARY ── */}
        <TabsContent value="summary" className="space-y-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Workouts', value: workoutsQ.data?.length ?? '—' },
              { label: 'Subscription', value: subscription ? `${subscription.tier} (${subscription.status})` : 'None' },
              { label: 'Onboarding', value: profile.onboarding_completed ? 'Completed' : 'Incomplete' },
              { label: 'Last Active', value: relTime(profile.updated_at) },
            ].map((c) => (
              <div key={c.label} className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--fg-3))]">{c.label}</p>
                <p className="mt-1 text-lg font-semibold text-[hsl(var(--fg))]">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-[hsl(var(--fg))]">Recent Workouts</h3>
              {(workoutsQ.data || []).slice(0, 5).map((w) => (
                <div key={w.id} className="flex items-center justify-between border-b border-[hsl(var(--border)/0.3)] py-2 text-[13px]">
                  <span className="text-[hsl(var(--fg))]">{w.name || 'Workout'}</span>
                  <span className="text-[hsl(var(--fg-3))]">{fmt(w.completed_at)}</span>
                </div>
              ))}
              {(!workoutsQ.data || workoutsQ.data.length === 0) && <p className="text-[13px] text-[hsl(var(--fg-3))]">No workouts yet.</p>}
            </div>
            <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-[hsl(var(--fg))]">Recent Errors</h3>
              {(errorsQ.data || []).slice(0, 5).map((e) => (
                <div key={e.id} className="border-b border-[hsl(var(--border)/0.3)] py-2 text-[13px]">
                  <p className="truncate text-[hsl(var(--fg))]">{e.message || 'Error'}</p>
                  <p className="text-[11px] text-[hsl(var(--fg-3))]">{e.component} · {relTime(e.created_at)}</p>
                </div>
              ))}
              {(!errorsQ.data || errorsQ.data.length === 0) && <p className="text-[13px] text-[hsl(var(--fg-3))]">No errors recorded.</p>}
            </div>
          </div>
          {/* Admin Notes */}
          <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-[hsl(var(--fg))]">Admin Notes</h3>
            {(auditQ.data || []).filter((a) => a.action_type === 'admin.note').map((n) => (
              <div key={n.id} className="border-b border-[hsl(var(--border)/0.3)] py-2 text-[13px]">
                <p className="text-[hsl(var(--fg))]">{typeof n.action_detail === 'object' ? n.action_detail?.text : n.action_detail}</p>
                <p className="text-[11px] text-[hsl(var(--fg-3))]">{fmtTime(n.created_at)} · {n.actor_id?.slice(0, 8)}</p>
              </div>
            ))}
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setDialog('note')}>
              <StickyNote className="mr-1.5 h-3 w-3" /> Add note
            </Button>
          </div>
        </TabsContent>

        {/* ── PROFILE ── */}
        <TabsContent value="profile" className="pt-4">
          <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-5">
            <h3 className="mb-4 text-[14px] font-semibold text-[hsl(var(--fg))]">Profile Data</h3>
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(pd).filter(([k]) => k !== 'targets').map(([k, v]) => (
                <div key={k}>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--fg-3))]">{PROFILE_LABELS[k] || k}</p>
                  <p className="mt-0.5 text-[14px] text-[hsl(var(--fg))]">{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}</p>
                </div>
              ))}
            </div>
            {Object.keys(targets).length > 0 && (
              <>
                <h4 className="mb-3 mt-6 text-[13px] font-semibold text-[hsl(var(--fg))]">Nutrition Targets</h4>
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(targets).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--fg-3))]">{k}</p>
                      <p className="mt-0.5 text-[14px] text-[hsl(var(--fg))]">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ── WORKOUTS ── */}
        <TabsContent value="workouts" className="pt-4">
          <DataTable
            data={workoutsQ.data}
            loading={workoutsQ.isLoading}
            empty="No workouts recorded."
            columns={['Date', 'Name', 'Exercises', 'Duration']}
            renderRow={(w) => (
              <TableRow key={w.id}>
                <TableCell className="text-[13px]">{fmt(w.completed_at)}</TableCell>
                <TableCell className="text-[13px] font-medium">{w.name || 'Workout'}</TableCell>
                <TableCell className="text-[13px]">{Array.isArray(w.exercises_completed) ? w.exercises_completed.length : '—'}</TableCell>
                <TableCell className="text-[13px]">{w.duration_seconds ? `${Math.round(w.duration_seconds / 60)}m` : '—'}</TableCell>
              </TableRow>
            )}
          />
        </TabsContent>

        {/* ── NUTRITION ── */}
        <TabsContent value="nutrition" className="space-y-3 pt-4">
          {nutritionQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
          {nutritionQ.data && (() => {
            const grouped = {};
            nutritionQ.data.forEach((m) => {
              const day = (m.date || '').split('T')[0];
              if (!grouped[day]) grouped[day] = { items: [], kcal: 0, protein: 0, carbs: 0, fat: 0 };
              grouped[day].items.push(m);
              grouped[day].kcal += Number(m.calories) || 0;
              grouped[day].protein += Number(m.protein) || 0;
              grouped[day].carbs += Number(m.carbs) || 0;
              grouped[day].fat += Number(m.fat) || 0;
            });
            const sorted = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
            if (sorted.length === 0) return <p className="text-[13px] text-[hsl(var(--fg-3))]">No nutrition data.</p>;
            return sorted.map(([day, d]) => (
              <div key={day} className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-[13px] font-semibold text-[hsl(var(--fg))]">{day}</h4>
                  <span className="text-[12px] text-[hsl(var(--fg-3))]">
                    {Math.round(d.kcal)} kcal · P {Math.round(d.protein)}g · C {Math.round(d.carbs)}g · F {Math.round(d.fat)}g
                  </span>
                </div>
                {d.items.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border-t border-[hsl(var(--border)/0.2)] py-1.5 text-[12px]">
                    <div className="flex items-center gap-2">
                      {m.meal_type && <Badge variant="outline" className="text-[10px]">{m.meal_type}</Badge>}
                      <span className="text-[hsl(var(--fg))]">{m.food_name || m.description || 'Item'}</span>
                    </div>
                    <span className="text-[hsl(var(--fg-3))]">{Math.round(Number(m.calories) || 0)} kcal</span>
                  </div>
                ))}
              </div>
            ));
          })()}
        </TabsContent>

        {/* ── CHECK-INS ── */}
        <TabsContent value="checkins" className="pt-4">
          {checkinsQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
          {checkinsQ.data && (() => {
            const rows = checkinsQ.data;
            if (rows.length === 0) return <p className="text-[13px] text-[hsl(var(--fg-3))]">No check-ins recorded.</p>;
            const keys = Object.keys(rows[0]).filter((k) => !['id', 'user_id', 'created_at', 'updated_at'].includes(k));
            return (
              <div className="overflow-x-auto rounded-[14px] border border-[hsl(var(--border)/0.6)]">
                <Table>
                  <TableHeader><TableRow>{keys.map((k) => <TableHead key={k} className="text-[11px] uppercase">{k}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={r.id || i}>{keys.map((k) => <TableCell key={k} className="text-[13px]">{String(r[k] ?? '—')}</TableCell>)}</TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })()}
        </TabsContent>

        {/* ── MEASUREMENTS ── */}
        <TabsContent value="measurements" className="pt-4">
          <DataTable
            data={measurementsQ.data}
            loading={measurementsQ.isLoading}
            empty="No measurements recorded."
            columns={['Date', 'Weight', 'Body Fat', 'Details']}
            renderRow={(m, i) => (
              <TableRow key={m.id || i}>
                <TableCell className="text-[13px]">{fmt(m.date)}</TableCell>
                <TableCell className="text-[13px]">{m.weight ?? '—'}</TableCell>
                <TableCell className="text-[13px]">{m.body_fat ?? m.body_fat_percentage ?? '—'}</TableCell>
                <TableCell className="text-[12px] text-[hsl(var(--fg-3))]">
                  {Object.entries(m).filter(([k]) => !['id','user_id','created_at','updated_at','date','weight','body_fat','body_fat_percentage'].includes(k)).map(([k, v]) => v != null ? `${k}: ${v}` : null).filter(Boolean).join(', ') || '—'}
                </TableCell>
              </TableRow>
            )}
          />
        </TabsContent>

        {/* ── PHOTOS ── */}
        <TabsContent value="photos" className="pt-4">
          {photosQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
          {photosQ.data && photosQ.data.length === 0 && <p className="text-[13px] text-[hsl(var(--fg-3))]">No progress photos.</p>}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {(photosQ.data || []).map((p) => (
              <button key={p.id} type="button" onClick={() => setLightbox(p)}
                className="group relative aspect-square overflow-hidden rounded-[12px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill))]">
                <img src={p.photo_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-[10px] text-white/80">{fmt(p.created_at)}</p>
                  {p.weight && <p className="text-[10px] font-medium text-white">{p.weight} kg</p>}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* ── AI ── */}
        <TabsContent value="ai" className="space-y-4 pt-4">
          {aiQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
          {aiQ.data?.memory && (
            <div className="rounded-[14px] border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)] p-4">
              <h4 className="mb-1 text-[12px] font-semibold uppercase text-[hsl(var(--brand))]">Coach Memory Summary</h4>
              <p className="text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{aiQ.data.memory.summary || '—'}</p>
              <p className="mt-2 text-[11px] text-[hsl(var(--fg-3))]">Updated {fmtTime(aiQ.data.memory.updated_at)}</p>
            </div>
          )}
          <div className="space-y-2">
            {(aiQ.data?.messages || []).map((msg) => (
              <div key={msg.id} className={`rounded-[12px] border p-3 ${msg.role === 'user' ? 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))]' : 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.04)]'}`}>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${msg.role === 'assistant' ? 'border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]' : ''}`}>{msg.role}</Badge>
                  <span className="text-[11px] text-[hsl(var(--fg-3))]">{fmtTime(msg.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[hsl(var(--fg))]">{msg.content}</p>
              </div>
            ))}
            {(!aiQ.data?.messages || aiQ.data.messages.length === 0) && <p className="text-[13px] text-[hsl(var(--fg-3))]">No AI messages.</p>}
          </div>
        </TabsContent>

        {/* ── TIMELINE ── */}
        <TabsContent value="timeline" className="pt-4">
          {timelineQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
          <div className="relative space-y-0 pl-6">
            <div className="absolute bottom-0 left-[11px] top-0 w-px bg-[hsl(var(--border)/0.5)]" />
            {(timelineQ.data || []).slice(0, timelineLimit).map((ev, i) => {
              const Icon = TIMELINE_ICONS[ev.type] || Activity;
              return (
                <div key={`${ev.type}-${i}`} className="relative flex gap-3 pb-4">
                  <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))]">
                    <Icon className="h-3 w-3 text-[hsl(var(--fg-3))]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{ev.label}</p>
                    {ev.detail && <p className="text-[12px] text-[hsl(var(--fg-3))]">{ev.detail}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{fmtTime(ev.date)}</span>
                </div>
              );
            })}
          </div>
          {(timelineQ.data?.length || 0) > timelineLimit && (
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setTimelineLimit((l) => l + 40)}>Load more</Button>
          )}
        </TabsContent>

        {/* ── AUDIT ── */}
        <TabsContent value="audit" className="pt-4">
          <DataTable
            data={auditQ.data}
            loading={auditQ.isLoading}
            empty="No audit log entries."
            columns={['Date', 'Action', 'Actor', 'Detail']}
            renderRow={(a) => (
              <TableRow key={a.id}>
                <TableCell className="text-[13px]">{fmtTime(a.created_at)}</TableCell>
                <TableCell className="text-[13px] font-medium">{a.action_type}</TableCell>
                <TableCell className="font-mono text-[11px] text-[hsl(var(--fg-3))]">{(a.actor_id || '').slice(0, 8)}</TableCell>
                <TableCell className="max-w-[300px] truncate text-[12px] text-[hsl(var(--fg-3))]">
                  {typeof a.action_detail === 'object' ? JSON.stringify(a.action_detail) : String(a.action_detail || '—')}
                </TableCell>
              </TableRow>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS ── */}
      <ConfirmDialog open={dialog === 'grant'} onClose={() => setDialog(null)} title="Grant Premium" onConfirm={() => grantM.mutate()} loading={grantM.isPending}>
        Grant premium access to <strong>{profile.full_name || profile.email}</strong>?
      </ConfirmDialog>
      <ConfirmDialog open={dialog === 'revoke'} onClose={() => setDialog(null)} title="Revoke Access" onConfirm={() => revokeM.mutate()} loading={revokeM.isPending}>
        Revoke premium access from <strong>{profile.full_name || profile.email}</strong>?
      </ConfirmDialog>
      <ConfirmDialog open={dialog === 'reset'} onClose={() => setDialog(null)} title="Reset Onboarding" onConfirm={() => resetM.mutate()} loading={resetM.isPending}>
        Reset onboarding for <strong>{profile.full_name || profile.email}</strong>? They will see the onboarding flow again.
      </ConfirmDialog>
      <ConfirmDialog open={dialog === 'suspend'} onClose={() => setDialog(null)} title={profile.is_suspended ? 'Unsuspend User' : 'Suspend User'} onConfirm={() => suspendM.mutate()} loading={suspendM.isPending}>
        {profile.is_suspended ? 'Unsuspend' : 'Suspend'} <strong>{profile.full_name || profile.email}</strong>?
      </ConfirmDialog>
      <Dialog open={dialog === 'note'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Admin Note</DialogTitle></DialogHeader>
          <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Internal note about this user..." rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => noteM.mutate()} disabled={!noteText.trim() || noteM.isPending}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PHOTO LIGHTBOX ── */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-2xl">
          {lightbox && (
            <>
              <img src={lightbox.photo_url} alt="" className="w-full rounded-lg" />
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="text-[hsl(var(--fg-3))]">{fmt(lightbox.created_at)}</span>
                {lightbox.weight && <Badge variant="outline">{lightbox.weight} kg</Badge>}
              </div>
              {lightbox.notes && <p className="mt-2 text-[13px] text-[hsl(var(--fg-2))]">{lightbox.notes}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Reusable sub-components ──

function DataTable({ data, loading, empty, columns, renderRow }) {
  if (loading) return <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>;
  if (!data || data.length === 0) return <p className="text-[13px] text-[hsl(var(--fg-3))]">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-[14px] border border-[hsl(var(--border)/0.6)]">
      <Table>
        <TableHeader><TableRow>{columns.map((c) => <TableHead key={c} className="text-[11px] uppercase">{c}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{data.map(renderRow)}</TableBody>
      </Table>
    </div>
  );
}

function ConfirmDialog({ open, onClose, title, children, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-[14px] text-[hsl(var(--fg-2))]">{children}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} disabled={loading}>{loading ? 'Processing...' : 'Confirm'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
