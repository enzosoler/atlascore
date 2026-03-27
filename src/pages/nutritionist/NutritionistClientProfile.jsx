import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, Loader2, Mail } from 'lucide-react';
import RoleGate from '@/components/rbac/RoleGate';
import ClientPdfExport from '@/components/nutritionist/ClientPdfExport';
import DietPlanVsExecution from '@/components/nutritionist/DietPlanVsExecution';

export default function NutritionistClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: link, isLoading: loadingLink } = useQuery({
    queryKey: ['nutritionist-client', id],
    queryFn: async () => null,
  });

  // Client data requires professional_links RLS policy (pending migration)
  const meals = [];
  const measurements = [];
  const photos = [];
  const exams = [];
  const diets = [];

  if (loadingLink) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2 text-[hsl(var(--fg-2))]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="t-subtitle mb-2">Client not found</p>
          <button onClick={() => navigate('/nutritionist/clients')} className="btn btn-secondary">
            Back
          </button>
        </div>
      </div>
    );
  }

  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sorted.map(m => ({
    date: new Date(m.date + 'T12:00').toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
    weight: m.weight,
    bf: m.body_fat,
  }));

  return (
    <RoleGate page="NutritionistClientProfile">
      <div className="mx-auto max-w-4xl p-5 lg:p-8 space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/nutritionist/clients')} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--shell))] transition-colors">
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{link.client_name}</h1>
            <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))] mt-1">
              <Mail className="w-4 h-4" /> {link.client_email}
            </div>
          </div>
          <ClientPdfExport
            link={link}
            measurements={measurements}
            meals={meals}
            photos={photos}
            exams={exams}
            diets={diets}
          />
          <span className={`badge ${link.status === 'accepted' ? 'badge-ok' : 'badge-neutral'}`}>
            {link.status === 'accepted' ? 'Active' : link.status === 'pending' ? 'Pending' : link.status}
          </span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[hsl(var(--card-hi))] border border-[hsl(var(--border))] h-10 rounded-xl w-full p-1 gap-1">
            <TabsTrigger value="overview" className="flex-1 rounded-lg text-[12px] font-medium h-8 transition-all data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--fg))] data-[state=active]:shadow-sm text-[hsl(var(--fg-2))]">
              Overview
            </TabsTrigger>
            {link.permissions?.can_view_meals && (
              <TabsTrigger value="meals" className="flex-1 rounded-lg text-[12px] font-medium h-8 transition-all data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--fg))] data-[state=active]:shadow-sm text-[hsl(var(--fg-2))]">
                Meals
              </TabsTrigger>
            )}
            {link.permissions?.can_view_measurements && (
              <TabsTrigger value="measurements" className="flex-1 rounded-lg text-[12px] font-medium h-8 transition-all data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--fg))] data-[state=active]:shadow-sm text-[hsl(var(--fg-2))]">
                Measurements
              </TabsTrigger>
            )}
            {link.permissions?.can_view_progress_photos && (
              <TabsTrigger value="photos" className="flex-1 rounded-lg text-[12px] font-medium h-8 transition-all data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--fg))] data-[state=active]:shadow-sm text-[hsl(var(--fg-2))]">
                Photos
              </TabsTrigger>
            )}
            {link.permissions?.can_view_lab_exams && (
               <TabsTrigger value="exams" className="flex-1 rounded-lg text-[12px] font-medium h-8 transition-all data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--fg))] data-[state=active]:shadow-sm text-[hsl(var(--fg-2))]">
                 Labs
               </TabsTrigger>
             )}
             {link.permissions?.can_view_meals && (
               <TabsTrigger value="adherence" className="flex-1 rounded-lg text-[12px] font-medium h-8 transition-all data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--fg))] data-[state=active]:shadow-sm text-[hsl(var(--fg-2))]">
                 Adherence
               </TabsTrigger>
             )}
            </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="surface rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[11px] text-[hsl(var(--fg-2))] uppercase tracking-wider font-medium mb-1">Meals</p>
                  <p className="text-[24px] font-bold text-[hsl(var(--fg))]">{meals.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-[hsl(var(--fg-2))] uppercase tracking-wider font-medium mb-1">Measurements</p>
                  <p className="text-[24px] font-bold text-[hsl(var(--fg))]">{measurements.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-[hsl(var(--fg-2))] uppercase tracking-wider font-medium mb-1">Plans</p>
                  <p className="text-[24px] font-bold text-[hsl(var(--fg))]">{diets.length}</p>
                </div>
              </div>
            </div>

            {/* Permissions summary */}
            <div className="surface rounded-xl p-5 space-y-2">
              <p className="text-[13px] font-semibold mb-3">Permissions</p>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${link.permissions?.can_view_meals ? 'bg-[hsl(var(--ok))]' : 'bg-[hsl(var(--fg-2)/0.3)]'}`} />
                  View meals
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${link.permissions?.can_view_measurements ? 'bg-[hsl(var(--ok))]' : 'bg-[hsl(var(--fg-2)/0.3)]'}`} />
                  View measurements
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${link.permissions?.can_create_diet_plan ? 'bg-[hsl(var(--ok))]' : 'bg-[hsl(var(--fg-2)/0.3)]'}`} />
                  Create plans
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${link.permissions?.can_view_lab_exams ? 'bg-[hsl(var(--ok))]' : 'bg-[hsl(var(--fg-2)/0.3)]'}`} />
                  View labs
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Meals */}
          {link.permissions?.can_view_meals && (
            <TabsContent value="meals" className="mt-4 space-y-2">
              {meals.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-[hsl(var(--fg-2))]">
                  No meals logged
                </div>
              ) : (
                meals.slice(0, 10).map((m) => (
                  <div key={m.id} className="surface p-3 text-[12px]">
                    <p className="font-semibold">{m.date}</p>
                    <p className="text-[hsl(var(--fg-2))] mt-1">{m.total_calories} kcal • P:{m.total_protein}g C:{m.total_carbs}g G:{m.total_fat}g</p>
                  </div>
                ))
              )}
            </TabsContent>
          )}

          {/* Measurements */}
          {link.permissions?.can_view_measurements && (
            <TabsContent value="measurements" className="mt-4 space-y-4">
              {chartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--fg-2))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--fg-2))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--brand))" strokeWidth={2} dot={{ r: 3 }} name="Weight" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-[13px] text-[hsl(var(--fg-2))]">
                  Log at least 2 measurements to see the chart
                </div>
              )}
              <div className="space-y-2">
                {measurements.slice(0, 5).map((m) => (
                  <div key={m.id} className="surface p-3 text-[12px]">
                    <p className="font-semibold">{m.date}</p>
                    <p className="text-[hsl(var(--fg-2))] mt-1">
                      {m.weight && `${m.weight}kg`} {m.body_fat && `• ${m.body_fat}% body fat`}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Photos */}
          {link.permissions?.can_view_progress_photos && (
            <TabsContent value="photos" className="mt-4 grid grid-cols-2 gap-3">
              {photos.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-[13px] text-[hsl(var(--fg-2))]">
                  No progress photos yet
                </div>
              ) : (
                photos.slice(0, 6).map((p) => (
                  <div key={p.id} className="rounded-lg overflow-hidden border border-[hsl(var(--border))]">
                    <img src={p.photo_url} alt="" className="w-full h-40 object-cover" />
                    <div className="p-2 bg-[hsl(var(--shell))]">
                      <p className="text-[11px] font-semibold">{p.date}</p>
                      <p className="text-[10px] text-[hsl(var(--fg-2))]">{p.category}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          )}

          {/* Exams */}
          {link.permissions?.can_view_lab_exams && (
            <TabsContent value="exams" className="mt-4 space-y-2">
              {exams.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-[hsl(var(--fg-2))]">
                  No lab exams yet
                </div>
              ) : (
                exams.slice(0, 5).map((e) => (
                  <div key={e.id} className="surface p-4 space-y-2">
                    <p className="font-semibold text-[13px]">{e.panel_name}</p>
                    <p className="text-[11px] text-[hsl(var(--fg-2))]">{e.exam_date}</p>
                    {e.markers?.slice(0, 3).map((m, i) => (
                      <p key={i} className="text-[11px]">
                        {m.name}: <span className="font-semibold">{m.value}{m.unit}</span>
                      </p>
                    ))}
                  </div>
                ))
              )}
            </TabsContent>
          )}

          {/* Plan vs Execution */}
          {link.permissions?.can_view_meals && (
            <TabsContent value="adherence" className="mt-4">
              <DietPlanVsExecution diet={diets[0]} meals={meals} />
            </TabsContent>
          )}
          </Tabs>
          </div>
          </RoleGate>
          );
          }
