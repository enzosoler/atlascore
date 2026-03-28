/**
 * ProfessionalLinks — Shows the athlete's active/pending professional connections
 * Used in Today page and Profile
 */
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Check, X, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getMyProfessionals, respondToInvite } from '@/services/professionalLinksService';
import { useT } from '@/lib/i18nContext';

export default function ProfessionalLinks({ showPending = true, showActive = true, user: userProp }) {
  const t = useT();
  const { user: authUser } = useAuth();
  const user = userProp || authUser;
  const qc = useQueryClient();

  const PROF_LABELS = {
    coach: { label: t('shared.professionalLinks.roleCoach'), badge: 'badge-blue', icon: '🏋️' },
    nutritionist: { label: t('shared.professionalLinks.roleNutritionist'), badge: 'badge-ok', icon: '🥗' },
    clinician: { label: t('shared.professionalLinks.roleClinician'), badge: 'badge-ai', icon: '⚕️' },
  };

  const { data: allLinks = [] } = useQuery({
    queryKey: ['my-professionals', user?.id],
    queryFn: () => getMyProfessionals(user.id),
    enabled: !!user?.id,
  });

  const respond = (linkId, accept) => async () => {
    await respondToInvite(linkId, accept);
    qc.invalidateQueries({ queryKey: ['my-professionals'] });
    toast.success(accept ? t('shared.professionalLinks.toastAccepted') : t('shared.professionalLinks.toastDeclined'));
  };

  const pendingLinks = allLinks.filter(l => l.status === 'pending');
  const activeLinks = allLinks.filter(l => l.status === 'active');

  if (pendingLinks.length === 0 && activeLinks.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Pending invites */}
      {showPending && pendingLinks.length > 0 && (
        <div className="surface border-[hsl(var(--warn)/0.4)] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[hsl(var(--warn))]" strokeWidth={2} />
            <p className="t-subtitle text-[hsl(var(--warn))]">{t('shared.professionalLinks.pendingInvites', { count: pendingLinks.length })}</p>
          </div>
          <div className="space-y-2">
            {pendingLinks.map(link => {
              const meta = PROF_LABELS[link.link_type] || { label: link.link_type, badge: 'badge-neutral', icon: '👤' };
              return (
                <div key={link.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`badge ${meta.badge}`}>{meta.icon} {meta.label}</span>
                    </div>
                    <p className="text-[12px] text-[hsl(var(--fg-2))]">{link.professional_name || link.professional_email}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={respond(link.id, true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))] border border-[hsl(var(--ok)/0.2)] text-[11px] font-semibold hover:bg-[hsl(var(--ok)/0.2)] transition-colors"
                    >
                      <Check className="w-3 h-3" strokeWidth={2.5} /> {t('shared.professionalLinks.accept')}
                    </button>
                    <button
                      onClick={respond(link.id, false)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--err)/0.07)] text-[hsl(var(--err))] border border-[hsl(var(--err)/0.2)] text-[11px] font-semibold hover:bg-[hsl(var(--err)/0.15)] transition-colors"
                    >
                      <X className="w-3 h-3" strokeWidth={2.5} /> {t('shared.professionalLinks.decline')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active professional links */}
      {showActive && activeLinks.length > 0 && (
        <div className="surface p-4 space-y-2">
          <p className="t-label">{t('shared.professionalLinks.activeProfessionals')}</p>
          {activeLinks.map(link => {
            const meta = PROF_LABELS[link.link_type] || { label: link.link_type, badge: 'badge-neutral', icon: '👤' };
            return (
              <div key={link.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`badge ${meta.badge}`}>{meta.icon} {meta.label}</span>
                    <span className="badge badge-ok text-[9px]">{t('shared.professionalLinks.activeBadge')}</span>
                  </div>
                  <p className="text-[12px] text-[hsl(var(--fg-2))]">{link.professional_name || link.professional_email}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
