import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { PageShell, SectionCard, SafePageBoundary, StatusBanner } from '@/components/shared/StablePage';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const t = useT();
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fnError } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: user.id },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      await logout?.();
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Failed to delete account. Please contact support.');
      setIsDeleting(false);
    }
  };

  return (
    <SafePageBoundary title={t('deleteAccount.title')} maxWidth="max-w-2xl" fallbackDescription={t('deleteAccount.warningDesc')}>
      <PageShell
        eyebrow="Danger zone"
        title={t('deleteAccount.title')}
        subtitle="This permanently removes the account. Read the summary before continuing."
        maxWidth="max-w-2xl"
        actions={(
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      >
        <SectionCard title="Warning" subtitle={t('deleteAccount.warningDesc')}>
          <StatusBanner tone="warning">
            <span className="font-semibold">{t('deleteAccount.warning')}</span>
            <span className="text-[hsl(var(--fg-2))]"> · This cannot be undone.</span>
          </StatusBanner>
        </SectionCard>

        <SectionCard title={step === 1 ? 'What gets deleted' : 'Confirm deletion'} subtitle="Review the impact before you proceed.">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2 text-[13px] text-[hsl(var(--fg-2))]">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-[hsl(var(--err))]" />
                  {t('deleteAccount.item.workouts')}
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-[hsl(var(--err))]" />
                  {t('deleteAccount.item.nutrition')}
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-[hsl(var(--err))]" />
                  {t('deleteAccount.item.photos')}
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-[hsl(var(--err))]" />
                  {t('deleteAccount.item.profileSettings')}
                </div>
              </div>

              <Button variant="destructive" onClick={handleDelete} className="w-full gap-2">
                <Trash2 className="h-4 w-4" />
                {t('deleteAccount.continueBtn')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] leading-5 text-[hsl(var(--fg-2))]">
                {t('deleteAccount.typeToConfirmPrefix')} <strong className="text-[hsl(var(--fg))]">DELETE</strong> {t('deleteAccount.typeToConfirmSuffix')}
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t('deleteAccount.inputPlaceholder')}
              />
              {error ? <p className="text-[13px] text-[hsl(var(--err))]">{error}</p> : null}
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="w-full gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('deleteAccount.deletingBtn') || 'Deleting...'}
                  </>
                ) : (
                  t('deleteAccount.permanentlyDeleteBtn')
                )}
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full rounded-[12px] border border-[hsl(var(--border)/0.82)] px-4 py-2.5 text-[13px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill)/0.4)] hover:text-[hsl(var(--fg))]"
              >
                {t('deleteAccount.cancel')}
              </button>
            </div>
          )}
        </SectionCard>
      </PageShell>
    </SafePageBoundary>
  );
}
