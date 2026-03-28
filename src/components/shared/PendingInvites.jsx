/**
 * PendingInvites — shown to athletes/patients on their Today/Profile page
 * Lets them accept or reject pending invitations from coaches, nutritionists, clinicians
 */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Check, X, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getPendingInvites, respondToInvite } from '@/services/professionalLinksService';
import { useT } from '@/lib/i18nContext';

export default function PendingInvites() {
  const t = useT();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: invites = [] } = useQuery({
    queryKey: ['pending-invites', user?.id],
    queryFn: () => getPendingInvites(user.id),
    enabled: !!user?.id,
  });

  const respondM = useMutation({
    mutationFn: ({ linkId, accept }) => respondToInvite(linkId, accept),
    onSuccess: (_, { accept }) => {
      qc.invalidateQueries({ queryKey: ['pending-invites'] });
      qc.invalidateQueries({ queryKey: ['my-professionals'] });
      toast.success(accept ? t('shared.pendingInvites.toastAccepted') : t('shared.pendingInvites.toastDeclined'));
    },
  });

  const LABELS = {
    coach: t('shared.pendingInvites.labelCoach'),
    nutritionist: t('shared.pendingInvites.labelNutritionist'),
    clinician: t('shared.pendingInvites.labelClinician'),
  };

  if (invites.length === 0) return null;

  return (
    <div className="surface border-[hsl(var(--warn)/0.3)] p-4 space-y-3" style={{ borderColor: 'hsl(var(--warn)/0.4)' }}>
      <div className="flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-[hsl(var(--warn))]" strokeWidth={2} />
        <p className="t-subtitle text-[hsl(var(--warn))]">{t('shared.pendingInvites.heading', { count: invites.length })}</p>
      </div>
      <div className="space-y-2">
        {invites.map(invite => (
          <div key={invite.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))]">
            <div className="flex-1 min-w-0">
              <span className="badge badge-warn mr-2">{LABELS[invite.link_type] || invite.link_type}</span>
              <span className="text-[13px] font-medium">{invite.professional_name || invite.professional_email}</span>
              <p className="t-caption mt-0.5">{t('shared.pendingInvites.wantsAccess')}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => respondM.mutate({ linkId: invite.id, accept: true })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))] border border-[hsl(var(--ok)/0.2)] text-[12px] font-semibold hover:bg-[hsl(var(--ok)/0.2)] transition-colors"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> {t('shared.pendingInvites.accept')}
              </button>
              <button
                onClick={() => respondM.mutate({ linkId: invite.id, accept: false })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--err)/0.07)] text-[hsl(var(--err))] border border-[hsl(var(--err)/0.2)] text-[12px] font-semibold hover:bg-[hsl(var(--err)/0.15)] transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} /> {t('shared.pendingInvites.decline')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
