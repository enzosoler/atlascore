import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bug, Lightbulb, HelpCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useT } from '@/lib/i18nContext';
import MobileSheet from '@/components/shared/MobileSheet';
import { hasSession } from '@/lib/workoutSession';

export default function SupportWidget() {
  const t = useT();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionActive, setSessionActive] = useState(() => hasSession());

  useEffect(() => {
    const handler = () => setSessionActive(hasSession());
    window.addEventListener('atlas:session:change', handler);
    return () => window.removeEventListener('atlas:session:change', handler);
  }, []);

  if (sessionActive) return null;

  const OPTIONS = [
    { id: 'bug',     icon: Bug,        label: t('shared.supportWidget.optionBug'),     color: 'text-[hsl(var(--err))]',  bg: 'bg-[hsl(var(--err)/0.07)]' },
    { id: 'feature', icon: Lightbulb,  label: t('shared.supportWidget.optionFeature'), color: 'text-[hsl(var(--warn))]', bg: 'bg-[hsl(var(--warn)/0.07)]' },
    { id: 'help',    icon: HelpCircle, label: t('shared.supportWidget.optionHelp'),    color: 'text-[hsl(var(--brand))]', bg: 'bg-[hsl(var(--brand)/0.07)]' },
    { id: 'contact', icon: Mail,       label: t('shared.supportWidget.optionContact'), color: 'text-[hsl(var(--fg-2))]', bg: 'bg-[hsl(var(--shell))]' },
  ];

  const PLACEHOLDERS = {
    bug:     t('shared.supportWidget.placeholderBug'),
    feature: t('shared.supportWidget.placeholderFeature'),
    help:    t('shared.supportWidget.placeholderHelp'),
    contact: t('shared.supportWidget.placeholderContact'),
  };

  const reset = () => { setSelected(null); setText(''); };

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await supabase.from('support_requests').insert({
        user_id: user?.id || null,
        user_email: user?.email || null,
        type: selected,
        message: text,
      });
      toast.success(t('shared.supportWidget.toastSuccess'));
      setOpen(false);
      reset();
    } catch {
      toast.error(t('shared.supportWidget.toastError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* FAB button */}
      <div className="fixed bottom-[calc(var(--tab-bar-h,94px)+env(safe-area-inset-bottom,0px)+8px)] right-4 lg:bottom-6 z-[65]">
        <button
          onClick={() => { setOpen(o => !o); reset(); }}
          className={`w-11 h-11 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center
            ${open
              ? 'bg-[hsl(var(--card))] border border-[hsl(var(--border-h))] text-[hsl(var(--fg-2))]'
              : 'bg-[hsl(var(--brand))] text-white hover:shadow-xl hover:scale-105'
            }`}
        >
          {open ? <X className="w-4 h-4" strokeWidth={2} /> : <MessageCircle className="w-4.5 h-4.5" strokeWidth={2} />}
        </button>
      </div>

      {/* Sheet on mobile */}
      <MobileSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}
        title={selected ? OPTIONS.find(o => o.id === selected)?.label : t('shared.supportWidget.needHelp')}
        description={!selected ? t('shared.supportWidget.earlyAccess') : undefined}
      >
        <MobileSheet.Body>
          {!selected ? (
            <div className="space-y-2">
              {OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.id} onClick={() => setSelected(opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] transition-colors text-left ${opt.bg} active:scale-[0.98]`}>
                    <Icon className={`w-5 h-5 shrink-0 ${opt.color}`} strokeWidth={2} />
                    <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={reset} className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors">
                ← {t('shared.supportWidget.back')}
              </button>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={PLACEHOLDERS[selected]}
                rows={5}
                className="w-full px-4 py-3 text-[13px] rounded-[14px] border border-[hsl(var(--border-h))] bg-[hsl(var(--card-hi))] resize-none outline-none focus:border-[hsl(var(--brand)/0.4)] transition-colors"
              />
            </div>
          )}
        </MobileSheet.Body>
        {selected && (
          <MobileSheet.Footer>
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="atlas-button atlas-button-primary w-full disabled:opacity-50"
            >
              {sending ? t('shared.supportWidget.sending') : t('shared.supportWidget.send')}
            </button>
          </MobileSheet.Footer>
        )}
      </MobileSheet>
    </>
  );
}
