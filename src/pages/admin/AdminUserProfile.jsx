import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Activity,
  Utensils,
  Ruler,
  Image,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

function getIntlLocale() {
  const loc = localStorage.getItem('atlas_locale') || 'en';
  return loc === 'pt-BR' ? 'pt-BR' : 'en-US';
}
function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(getIntlLocale(), { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(getIntlLocale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Section({ icon: Icon, title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[hsl(var(--fill)/0.5)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span className="text-[14px] font-semibold text-[hsl(var(--fg))]">{title}</span>
          {count != null && (
            <span className="text-[11px] font-medium text-[hsl(var(--fg-2))] bg-[hsl(var(--fill))] px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-[hsl(var(--fg-2))]" /> : <ChevronDown className="h-4 w-4 text-[hsl(var(--fg-2))]" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[13px] text-[hsl(var(--fg))]">{value || '—'}</p>
    </div>
  );
}

function EmptyMsg({ text }) {
  return <p className="text-[13px] text-[hsl(var(--fg-2))] py-4 text-center">{text}</p>;
}

export default function AdminUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!userId) return;
    loadAll();
  }, [userId]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, subRes, workoutsRes, foodRes, measRes, photosRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('workouts').select('id, name, completed_at, exercises_completed').eq('user_id', userId).eq('status', 'completed').order('completed_at', { ascending: false }).limit(20),
        supabase.from('food_logs').select('id, date, meal_type, food_name, calories, protein, carbs, fat, created_at').eq('user_id', userId).order('date', { ascending: false }).limit(30),
        supabase.from('measurements').select('*').eq('user_id', userId).order('measured_at', { ascending: false }).limit(10),
        supabase.from('progress_photos').select('id, url, created_at, notes, weight').eq('user_id', userId).order('created_at', { ascending: false }).limit(12),
      ]);

      setProfile(profileRes.data);
      setSubscription(subRes.data);
      setWorkouts(workoutsRes.data || []);
      setFoodLogs(foodRes.data || []);
      setMeasurements(measRes.data || []);
      setPhotos(photosRes.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center px-4">
        <AlertTriangle className="h-8 w-8 text-[hsl(var(--err))]" />
        <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Failed to load profile</p>
        <p className="text-[13px] text-[hsl(var(--fg-2))]">{error}</p>
        <button
          onClick={() => navigate('/AdminPanel')}
          className="mt-2 text-[13px] text-[hsl(var(--primary))] hover:underline"
        >
          ← Back to admin
        </button>
      </div>
    );
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : profile?.email || userId;

  // Group food logs by date
  const foodByDate = foodLogs.reduce((acc, log) => {
    const d = log.date || log.created_at?.slice(0, 10) || '?';
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-8 lg:py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/AdminPanel')}
            className="inline-flex items-center gap-1.5 text-[13px] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin
          </button>
          <span className="text-[hsl(var(--border))]">/</span>
          <span className="text-[13px] text-[hsl(var(--fg))]">{displayName}</span>
        </div>

        {/* Identity card */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[22px] font-bold shrink-0">
              {(profile?.first_name || profile?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-bold text-[hsl(var(--fg))] tracking-tight">{displayName}</h1>
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{profile?.email}</p>
              <p className="text-[11px] font-mono text-[hsl(var(--fg-3))] mt-0.5">{userId}</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center shrink-0">
              {profile?.role && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-[hsl(var(--border))] text-[hsl(var(--fg-2))]">
                  {profile.role}
                </span>
              )}
              {subscription?.status && (
                <span className={cn(
                  'text-[11px] font-medium px-2.5 py-1 rounded-full',
                  subscription.status === 'active' || subscription.status === 'trialing'
                    ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
                    : 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]'
                )}>
                  {subscription.tier} · {subscription.status}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[hsl(var(--border)/0.6)]">
            <KV label="Joined" value={fmt(profile?.created_at)} />
            <KV label="Gender" value={profile?.profile_data?.gender || profile?.gender} />
            <KV label="Date of birth" value={fmt(profile?.profile_data?.date_of_birth || profile?.date_of_birth)} />
            <KV label="Country" value={profile?.profile_data?.country || profile?.country} />
          </div>

          {subscription && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[hsl(var(--border)/0.6)]">
              <KV label="Plan" value={subscription.tier} />
              <KV label="Billing status" value={subscription.status} />
              <KV label="Period ends" value={fmt(subscription.current_period_ends_at)} />
              <KV label="Trial ends" value={fmt(subscription.trial_ends_at)} />
            </div>
          )}
        </div>

        {/* Workouts */}
        <Section icon={Activity} title="Completed workouts" count={workouts.length}>
          {workouts.length === 0 ? (
            <EmptyMsg text="No completed workouts yet." />
          ) : (
            <div className="space-y-2">
              {workouts.map((w) => {
                const exerciseCount = Array.isArray(w.exercises_completed) ? w.exercises_completed.length : 0;
                return (
                  <div key={w.id} className="flex items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{w.name || 'Unnamed workout'}</p>
                      {exerciseCount > 0 && (
                        <p className="text-[11px] text-[hsl(var(--fg-2))]">{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                    <p className="text-[12px] text-[hsl(var(--fg-2))] shrink-0">{fmtTime(w.completed_at)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Food logs */}
        <Section icon={Utensils} title="Food logs" count={foodLogs.length}>
          {foodLogs.length === 0 ? (
            <EmptyMsg text="No food logs yet." />
          ) : (
            <div className="space-y-4">
              {Object.entries(foodByDate).slice(0, 7).map(([date, logs]) => {
                const totalCals = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
                return (
                  <div key={date}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[12px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                        {fmt(date)}
                      </p>
                      <p className="text-[12px] text-[hsl(var(--fg-2))]">{Math.round(totalCals)} kcal total</p>
                    </div>
                    <div className="space-y-1">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between gap-4 rounded-lg border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.3)] px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-[hsl(var(--fg-3))] capitalize shrink-0">{log.meal_type || '—'}</span>
                            <p className="text-[12px] text-[hsl(var(--fg))] truncate">{log.food_name}</p>
                          </div>
                          <div className="flex gap-3 text-[11px] text-[hsl(var(--fg-2))] shrink-0">
                            <span>{Math.round(log.calories || 0)} kcal</span>
                            {log.protein != null && <span>{Math.round(log.protein)}g P</span>}
                            {log.carbs != null && <span>{Math.round(log.carbs)}g C</span>}
                            {log.fat != null && <span>{Math.round(log.fat)}g F</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Measurements */}
        <Section icon={Ruler} title="Measurements" count={measurements.length}>
          {measurements.length === 0 ? (
            <EmptyMsg text="No measurements recorded yet." />
          ) : (
            <div className="space-y-2">
              {measurements.map((m) => {
                const fields = Object.entries(m).filter(([k, v]) =>
                  !['id', 'user_id', 'created_at', 'updated_at'].includes(k) && v != null
                );
                return (
                  <div key={m.id} className="rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[hsl(var(--fg-2))] mb-2">{fmt(m.measured_at || m.created_at)}</p>
                    <div className="flex flex-wrap gap-3">
                      {fields.map(([k, v]) => (
                        k !== 'measured_at' && (
                          <span key={k} className="text-[12px] text-[hsl(var(--fg))]">
                            <span className="text-[hsl(var(--fg-2))]">{k.replace(/_/g, ' ')}: </span>{String(v)}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Progress photos */}
        <Section icon={Image} title="Progress photos" count={photos.length} defaultOpen={false}>
          {photos.length === 0 ? (
            <EmptyMsg text="No progress photos uploaded." />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="space-y-1">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={p.url}
                      alt="Progress photo"
                      className="w-full aspect-square object-cover rounded-xl border border-[hsl(var(--border)/0.6)] hover:opacity-90 transition-opacity"
                    />
                  </a>
                  <p className="text-[10px] text-[hsl(var(--fg-3))] text-center">{fmt(p.created_at)}</p>
                  {p.weight && <p className="text-[10px] text-[hsl(var(--fg-2))] text-center">{p.weight} kg</p>}
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}
