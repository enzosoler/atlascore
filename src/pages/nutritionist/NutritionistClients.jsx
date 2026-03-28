import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { getMyClients, removeLink } from '@/services/professionalLinksService';
import InviteModal from '@/components/shared/InviteModal';
import RoleGate from '@/components/rbac/RoleGate';
import { PageShell, SectionCard } from '@/components/shared/StablePage';
import {
  WorkspaceHeader,
  WorkspaceInviteAction,
  WorkspacePersonRow,
  WorkspaceRosterSection,
} from '@/components/shared/ProfessionalUI';

export default function NutritionistClients() {
  const { user } = useAuth();
  const t = useT();
  const [showInvite, setShowInvite] = useState(false);
  const qc = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['nutritionist-clients', user?.id],
    queryFn: () => getMyClients(user.id, 'nutritionist'),
    enabled: !!user?.id,
  });

  const deleteM = useMutation({
    mutationFn: (id) => removeLink(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutritionist-clients'] }),
  });

  return (
    <RoleGate page="NutritionistClients">
      <PageShell
        title={t('nutritionist.clients.pageTitle')}
        subtitle={t('nutritionist.clients.pageSubtitle')}
        maxWidth="max-w-4xl"
      >
        <WorkspaceHeader
          eyebrow={t('nutritionist.clients.eyebrow')}
          title={t('nutritionist.clients.title')}
          subtitle={t('nutritionist.clients.subtitle')}
          icon={Users}
          tone="brand"
          badge={`${links.length} ${t('nutritionist.clients.linkedBadge')}`}
          actions={<WorkspaceInviteAction label={t('nutritionist.clients.inviteClient')} onClick={() => setShowInvite(true)} />}
        />

        {isLoading ? (
          <SectionCard title={t('nutritionist.clients.loadingTitle')} subtitle={t('nutritionist.clients.loadingSubtitle')}>
            <div className="py-12 text-center text-[13px] text-[hsl(var(--fg-2))]">{t('nutritionist.clients.loadingText')}</div>
          </SectionCard>
        ) : (
          <WorkspaceRosterSection
            eyebrow={t('nutritionist.clients.rosterEyebrow')}
            title={t('nutritionist.clients.rosterTitle')}
            subtitle={t('nutritionist.clients.rosterSubtitle')}
            emptyIcon={Users}
            emptyTitle={t('nutritionist.clients.emptyTitle')}
            emptyDescription={t('nutritionist.clients.emptyDescription')}
            emptyAction={<WorkspaceInviteAction label={t('nutritionist.clients.inviteClient')} onClick={() => setShowInvite(true)} />}
          >
            {links.map((link) => (
              <WorkspacePersonRow
                key={link.id}
                to={`/nutritionist/client/${link.id}`}
                initial={(link.client_name || link.client_email)?.[0]?.toUpperCase() || 'C'}
                title={link.client_name || link.client_email}
                subtitle={link.client_email}
                meta=""
                badge={link.status === 'active' ? t('nutritionist.common.active') : t('nutritionist.common.pending')}
                badgeTone={link.status === 'active' ? 'success' : 'warning'}
                accentTone="brand"
                actions={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      deleteM.mutate(link.id);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] text-[hsl(var(--fg-3))] transition-colors hover:border-[hsl(var(--err)/0.2)] hover:bg-[hsl(var(--err)/0.08)] hover:text-[hsl(var(--err))]"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                  </button>
                }
              />
            ))}
          </WorkspaceRosterSection>
        )}

        <InviteModal open={showInvite} onOpenChange={setShowInvite} role="nutritionist" />
      </PageShell>
    </RoleGate>
  );
}
