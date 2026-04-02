import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Save } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { FormField } from './ProfileFormField';
import { toast } from 'sonner';

export default function AccountTab() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    email: '',
  });

  useEffect(() => {
    if (!user) return;
    const fullName = user.full_name || '';
    const parts = fullName.split(/\s+/).filter(Boolean);
    setForm({
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || '',
      display_name: fullName,
      email: user.email || '',
    });
  }, [user]);

  const set = (key) => (e) => {
    const val = e?.target?.value ?? e;
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'first_name' || key === 'last_name') {
        next.display_name = [next.first_name, next.last_name].filter(Boolean).join(' ');
      }
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = [form.first_name, form.last_name].filter(Boolean).join(' ');
      await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      setSaved(true);
      toast.success('Account updated');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Identity */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Identity
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="First name"
            value={form.first_name}
            onChange={set('first_name')}
            type="text"
            placeholder="Alex"
          />
          <FormField
            label="Last name"
            value={form.last_name}
            onChange={set('last_name')}
            type="text"
            placeholder="Thompson"
          />
        </div>
      </section>

      <section>
        <div className="grid gap-3">
          <FormField
            label="Display name"
            value={form.display_name}
            onChange={set('display_name')}
            type="text"
            placeholder="Alex Thompson"
            description="How your name appears in the app"
          />
          <FormField
            label="Email"
            value={form.email}
            type="email"
            disabled
            description="Email cannot be changed here"
          />
        </div>
      </section>

      <Button onClick={handleSave} disabled={saving || saved} className="w-full gap-2">
        {saved ? 'Saved ✓' : saving ? 'Saving...' : (
          <><Save className="h-4 w-4" /> Save account</>
        )}
      </Button>
    </div>
  );
}
