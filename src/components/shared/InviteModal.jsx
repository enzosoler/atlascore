import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { PrimaryButton, SecondaryButton } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import { inviteClient } from '@/services/professionalLinksService';
import { useT } from '@/lib/i18nContext';

/**
 * InviteModal - Send invite to student/client/patient
 * Usage: <InviteModal open={show} onOpenChange={setShow} role="coach" />
 */
export default function InviteModal({ open, onOpenChange, role = 'coach' }) {
  const t = useT();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);

  const roleLabels = {
    coach: {
      title: t('shared.inviteModal.coachTitle'),
      subtitle: t('shared.inviteModal.coachSubtitle'),
      placeholder: t('shared.inviteModal.coachPlaceholder'),
    },
    nutritionist: {
      title: t('shared.inviteModal.nutritionistTitle'),
      subtitle: t('shared.inviteModal.nutritionistSubtitle'),
      placeholder: t('shared.inviteModal.nutritionistPlaceholder'),
    },
    clinician: {
      title: t('shared.inviteModal.clinicianTitle'),
      subtitle: t('shared.inviteModal.clinicianSubtitle'),
      placeholder: t('shared.inviteModal.clinicianPlaceholder'),
    },
  };

  // Map role to link_type (coach -> 'coach', etc.)
  const linkTypeMap = { coach: 'coach', nutritionist: 'nutritionist', clinician: 'clinician' };
  const label = roleLabels[role] || roleLabels.coach;

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error(t('shared.inviteModal.errorEnterEmail'));
      return;
    }

    setSending(true);
    try {
      await inviteClient(user.id, email.trim(), linkTypeMap[role] || role);
      toast.success(t('shared.inviteModal.toastSuccess', { email }));
      qc.invalidateQueries({ queryKey: ['coach-students'] });
      qc.invalidateQueries({ queryKey: ['clinician-patients'] });
      qc.invalidateQueries({ queryKey: ['nutritionist-clients'] });
      setEmail('');
      setName('');
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || t('shared.inviteModal.toastError'));
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[20px] border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] px-0 py-0 shadow-[var(--shadow-xl)]">
        <DialogHeader>
          <div className="border-b border-[hsl(var(--border)/0.76)] px-6 pb-4 pt-6">
            <DialogTitle className="text-[18px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {label.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {label.subtitle}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6 pt-2">
          <div className="atlas-field px-4 py-3">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              {t('shared.inviteModal.labelFullName')}
            </label>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              <input
                type="text"
                placeholder={t('shared.inviteModal.placeholderFullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
              />
            </div>
          </div>

          <div className="atlas-field px-4 py-3">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              {t('shared.inviteModal.labelEmail')}
            </label>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              <input
                type="email"
                placeholder={label.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
              />
            </div>
          </div>

          <div className="rounded-[16px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.52)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              {t('shared.inviteModal.inviteLabel')}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {t('shared.inviteModal.inviteExpiry')}
            </p>
          </div>

          <div className="flex gap-3">
            <SecondaryButton type="button" className="flex-1" onClick={() => onOpenChange(false)}>
              {t('shared.inviteModal.cancel')}
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex-1 justify-center"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {sending ? t('shared.inviteModal.sending') : t('shared.inviteModal.sendInvite')}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
