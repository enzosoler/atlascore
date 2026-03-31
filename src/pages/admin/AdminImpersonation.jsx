import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Dumbbell, Utensils, Image, Ruler, Brain, Calendar, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ImpersonationBanner from '@/components/admin/ImpersonationBanner';
import {
  fetchUserFull, fetchUserWorkouts, fetchUserFoodLogs,
  fetchUserPhotos, fetchUserMeasurements, fetchUserAIData,
  logAdminAction,
} from '@/lib/adminService';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminImpersonation() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const startTime = useRef(Date.now());
  const [tab, setTab] = useState('today');
  const [lightbox, setLightbox] = useState(null);

  // Audit log on mount/unmount
  useEffect(() => {
    logAdminAction('impersonation_started', userId, { reason: 'admin_view' }).catch(() => {});
    return () => {
      const dur = Math.round((Date.now() - startTime.current) / 1000);
      logAdminAction('impersonation_ended', userId, { duration_seconds: dur }).catch(() => {});
    };
  }, [userId]);

  const handleExit = useCallback(() => navigate(-1), [navigate]);

  const coreQ = useQuery({ queryKey: ['impersonate', userId, 'core'], queryFn: () => fetchUserFull(userId) });
  const workoutsQ = useQuery({ queryKey: ['impersonate', userId, 'workouts'], queryFn: () => fetchUserWorkouts(userId), enabled: tab === 'workouts' || tab === 'today', staleTime: 30_000 });
  const nutritionQ = useQuery({ queryKey: ['impersonate', userId, 'nutrition'], queryFn: () => fetchUserFoodLogs(userId), enabled: tab === 'nutrition' || tab === 'today', staleTime: 30_000 });
  const photosQ = useQuery({ queryKey: ['impersonate', userId, 'photos'], queryFn: () => fetchUserPhotos(userId), enabled: tab === 'photos', staleTime: 30_000 });
  const measurementsQ = useQuery({ queryKey: ['impersonate', userId, 'measurements'], queryFn: () => fetchUserMeasurements(userId), enabled: tab === 'measurements', staleTime: 30_000 });
  const aiQ = useQuery({ queryKey: ['impersonate', userId, 'ai'], queryFn: () => fetchUserAIData(userId), enabled: tab === 'ai', staleTime: 30_000 });

  const profile = coreQ.data?.profile;
  const sub = coreQ.data?.subscription;

  if (coreQ.isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Clock className="mr-2 h-4 w-4 animate-spin text-[hsl(var(--fg-3))]" />
      <span className="text-[hsl(var(--fg-3))]">Loading user session...</span>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <ImpersonationBanner
        targetEmail={profile?.email || userId}
        adminEmail={adminUser?.email}
        startTime={startTime.current}
        onExit={handleExit}
      />

      <div className="mx-auto max-w-5xl px-4 pt-14 pb-12">
        {/* User identity */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-sm font-bold text-[hsl(var(--brand))]">
            {(profile?.full_name || profile?.email || '?')[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">{profile?.full_name || 'User'}</p>
            <p className="text-[12px] text-[hsl(var(--fg-3))]">{profile?.email} · {sub ? `${sub.tier} (${sub.status})` : 'No subscription'}</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="today" className="text-[12px]"><Calendar className="mr-1.5 h-3.5 w-3.5" /> Today</TabsTrigger>
            <TabsTrigger value="workouts" className="text-[12px]"><Dumbbell className="mr-1.5 h-3.5 w-3.5" /> Workouts</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-[12px]"><Utensils className="mr-1.5 h-3.5 w-3.5" /> Nutrition</TabsTrigger>
            <TabsTrigger value="photos" className="text-[12px]"><Image className="mr-1.5 h-3.5 w-3.5" /> Photos</TabsTrigger>
            <TabsTrigger value="measurements" className="text-[12px]"><Ruler className="mr-1.5 h-3.5 w-3.5" /> Measurements</TabsTrigger>
            <TabsTrigger value="ai" className="text-[12px]"><Brain className="mr-1.5 h-3.5 w-3.5" /> AI Chat</TabsTrigger>
          </TabsList>

          {/* TODAY */}
          <TabsContent value="today" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
                <h3 className="mb-3 text-[13px] font-semibold text-[hsl(var(--fg))]">Recent Workouts</h3>
                {(workoutsQ.data || []).slice(0, 5).map((w) => (
                  <div key={w.id} className="flex justify-between border-b border-[hsl(var(--border)/0.2)] py-2 text-[13px]">
                    <span className="text-[hsl(var(--fg))]">{w.name || 'Workout'}</span>
                    <span className="text-[hsl(var(--fg-3))]">{fmt(w.completed_at)}</span>
                  </div>
                ))}
                {(!workoutsQ.data || workoutsQ.data.length === 0) && <p className="text-[13px] text-[hsl(var(--fg-3))]">No workouts.</p>}
              </div>
              <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
                <h3 className="mb-3 text-[13px] font-semibold text-[hsl(var(--fg))]">Today's Nutrition</h3>
                {(() => {
                  const todayMeals = (nutritionQ.data || []).filter((m) => (m.date || '').startsWith(today));
                  if (todayMeals.length === 0) return <p className="text-[13px] text-[hsl(var(--fg-3))]">No meals logged today.</p>;
                  const kcal = todayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
                  return (
                    <>
                      <p className="mb-2 text-[14px] font-medium text-[hsl(var(--fg))]">{Math.round(kcal)} kcal total</p>
                      {todayMeals.map((m) => (
                        <div key={m.id} className="flex justify-between border-b border-[hsl(var(--border)/0.2)] py-1.5 text-[12px]">
                          <span className="text-[hsl(var(--fg))]">{m.food_name || m.description || 'Item'}</span>
                          <span className="text-[hsl(var(--fg-3))]">{Math.round(Number(m.calories) || 0)} kcal</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </TabsContent>

          {/* WORKOUTS */}
          <TabsContent value="workouts" className="pt-4">
            {workoutsQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
            {workoutsQ.data && workoutsQ.data.length === 0 && <p className="text-[13px] text-[hsl(var(--fg-3))]">No workouts.</p>}
            {workoutsQ.data && workoutsQ.data.length > 0 && (
              <div className="overflow-x-auto rounded-[14px] border border-[hsl(var(--border)/0.6)]">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-[11px] uppercase">Date</TableHead>
                    <TableHead className="text-[11px] uppercase">Name</TableHead>
                    <TableHead className="text-[11px] uppercase">Exercises</TableHead>
                    <TableHead className="text-[11px] uppercase">Duration</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {workoutsQ.data.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="text-[13px]">{fmt(w.completed_at)}</TableCell>
                        <TableCell className="text-[13px] font-medium">{w.name || 'Workout'}</TableCell>
                        <TableCell className="text-[13px]">{Array.isArray(w.exercises_completed) ? w.exercises_completed.length : '—'}</TableCell>
                        <TableCell className="text-[13px]">{w.duration_seconds ? `${Math.round(w.duration_seconds / 60)}m` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* NUTRITION */}
          <TabsContent value="nutrition" className="space-y-3 pt-4">
            {nutritionQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
            {nutritionQ.data && (() => {
              const grouped = {};
              nutritionQ.data.forEach((m) => {
                const day = (m.date || '').split('T')[0];
                if (!grouped[day]) grouped[day] = { items: [], kcal: 0 };
                grouped[day].items.push(m);
                grouped[day].kcal += Number(m.calories) || 0;
              });
              const sorted = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
              if (sorted.length === 0) return <p className="text-[13px] text-[hsl(var(--fg-3))]">No nutrition data.</p>;
              return sorted.map(([day, d]) => (
                <div key={day} className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-[13px] font-semibold text-[hsl(var(--fg))]">{day}</h4>
                    <span className="text-[12px] text-[hsl(var(--fg-3))]">{Math.round(d.kcal)} kcal</span>
                  </div>
                  {d.items.map((m) => (
                    <div key={m.id} className="flex justify-between border-t border-[hsl(var(--border)/0.2)] py-1.5 text-[12px]">
                      <span className="text-[hsl(var(--fg))]">{m.food_name || m.description || 'Item'}</span>
                      <span className="text-[hsl(var(--fg-3))]">{Math.round(Number(m.calories) || 0)} kcal</span>
                    </div>
                  ))}
                </div>
              ));
            })()}
          </TabsContent>

          {/* PHOTOS */}
          <TabsContent value="photos" className="pt-4">
            {photosQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
            {photosQ.data && photosQ.data.length === 0 && <p className="text-[13px] text-[hsl(var(--fg-3))]">No progress photos.</p>}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {(photosQ.data || []).map((p) => (
                <button key={p.id} type="button" onClick={() => setLightbox(p)}
                  className="group relative aspect-square overflow-hidden rounded-[12px] border border-[hsl(var(--border)/0.6)]">
                  <img src={p.url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 px-2 py-1.5">
                    <p className="text-[10px] text-white/80">{fmt(p.created_at)}</p>
                    {p.weight && <p className="text-[10px] font-medium text-white">{p.weight} kg</p>}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* MEASUREMENTS */}
          <TabsContent value="measurements" className="pt-4">
            {measurementsQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
            {measurementsQ.data && measurementsQ.data.length === 0 && <p className="text-[13px] text-[hsl(var(--fg-3))]">No measurements.</p>}
            {measurementsQ.data && measurementsQ.data.length > 0 && (
              <div className="overflow-x-auto rounded-[14px] border border-[hsl(var(--border)/0.6)]">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-[11px] uppercase">Date</TableHead>
                    <TableHead className="text-[11px] uppercase">Weight</TableHead>
                    <TableHead className="text-[11px] uppercase">Body Fat</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {measurementsQ.data.map((m, i) => (
                      <TableRow key={m.id || i}>
                        <TableCell className="text-[13px]">{fmt(m.date)}</TableCell>
                        <TableCell className="text-[13px]">{m.weight ?? '—'}</TableCell>
                        <TableCell className="text-[13px]">{m.body_fat ?? m.body_fat_percentage ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* AI CHAT */}
          <TabsContent value="ai" className="space-y-3 pt-4">
            {aiQ.isLoading && <p className="text-[13px] text-[hsl(var(--fg-3))]">Loading...</p>}
            {aiQ.data?.memory && (
              <div className="rounded-[14px] border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)] p-4">
                <h4 className="mb-1 text-[12px] font-semibold uppercase text-[hsl(var(--brand))]">Coach Memory</h4>
                <p className="text-[13px] text-[hsl(var(--fg-2))]">{aiQ.data.memory.summary || '—'}</p>
              </div>
            )}
            {(aiQ.data?.messages || []).map((msg) => (
              <div key={msg.id} className={`rounded-[12px] border p-3 ${msg.role === 'user' ? 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))]' : 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.04)]'}`}>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${msg.role === 'assistant' ? 'border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]' : ''}`}>{msg.role}</Badge>
                  <span className="text-[11px] text-[hsl(var(--fg-3))]">{fmtTime(msg.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap text-[13px] text-[hsl(var(--fg))]">{msg.content}</p>
              </div>
            ))}
            {(!aiQ.data?.messages || aiQ.data.messages.length === 0) && <p className="text-[13px] text-[hsl(var(--fg-3))]">No AI messages.</p>}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-2xl">
          {lightbox && (
            <>
              <img src={lightbox.url} alt="" className="w-full rounded-lg" />
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
