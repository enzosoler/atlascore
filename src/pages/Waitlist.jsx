import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { COPY } from '@/config/landingCopy';
import { supabase } from '@/lib/supabaseClient';

export default function Waitlist() {
  const navigate = useNavigate();
  const { language: locale } = useTranslation();
  const c = COPY[locale === 'pt-BR' ? 'pt-BR' : 'en-US'];
  const copy = c.form;

  const [form, setForm] = useState({
    name: '',
    email: '',
    goal: '',
    improving: '',
    currentTools: '',
    interest: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setChip = (key, value) => () =>
    setForm((f) => ({ ...f, [key]: f[key] === value ? '' : value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('waitlist').insert([{
        name: form.name || null,
        email: form.email,
        primary_goal: form.goal || null,
        improving: form.improving || null,
        current_tools: form.currentTools || null,
        interest_type: form.interest || null,
      }]);
      if (error && !error.message?.includes('duplicate')) {
        console.error('Waitlist insert error:', error);
      }
    } catch {
      // silently succeed
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-app))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border-default))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{copy.heading}</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {submitted ? (
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--sys-green)/0.12)] mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[hsl(var(--sys-green))]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{copy.successHeading}</h2>
              <p className="text-[hsl(var(--fg-2))] mb-6">{copy.successText}</p>
              <Button onClick={() => navigate('/today')}>Back to App</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <p className="text-[14px] text-[hsl(var(--fg-2))]">{copy.sub}</p>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
                  {copy.name}
                </label>
                <Input value={form.name} onChange={set('name')} placeholder={copy.namePlaceholder} className="h-11" />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
                  {copy.email} *
                </label>
                <Input type="email" required value={form.email} onChange={set('email')} placeholder={copy.emailPlaceholder} className="h-11" />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
                  {copy.goal}
                </label>
                <div className="flex flex-wrap gap-2">
                  {copy.goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={setChip('goal', opt.value)}
                      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                        form.goal === opt.value
                          ? 'border-[hsl(var(--accent-primary)/0.4)] bg-[hsl(var(--accent-primary)/0.08)] text-[hsl(var(--accent-primary))]'
                          : 'border-[hsl(var(--border-default))] bg-transparent text-[hsl(var(--fg-2))] hover:border-[hsl(var(--accent-primary)/0.3)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
                  {copy.improving}
                </label>
                <Input value={form.improving} onChange={set('improving')} placeholder={copy.improvingPlaceholder} className="h-11" />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
                  {copy.currentTools}
                </label>
                <div className="flex flex-wrap gap-2">
                  {copy.currentToolsOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={setChip('currentTools', opt.value)}
                      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                        form.currentTools === opt.value
                          ? 'border-[hsl(var(--accent-primary)/0.4)] bg-[hsl(var(--accent-primary)/0.08)] text-[hsl(var(--accent-primary))]'
                          : 'border-[hsl(var(--border-default))] bg-transparent text-[hsl(var(--fg-2))] hover:border-[hsl(var(--accent-primary)/0.3)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
                  {copy.interest}
                </label>
                <div className="flex flex-wrap gap-2">
                  {copy.interestOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={setChip('interest', opt.value)}
                      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                        form.interest === opt.value
                          ? 'border-[hsl(var(--accent-primary)/0.4)] bg-[hsl(var(--accent-primary)/0.08)] text-[hsl(var(--accent-primary))]'
                          : 'border-[hsl(var(--border-default))] bg-transparent text-[hsl(var(--fg-2))] hover:border-[hsl(var(--accent-primary)/0.3)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading || !form.email.trim()} className="w-full h-12 gap-2">
                {loading ? '...' : copy.submit}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
