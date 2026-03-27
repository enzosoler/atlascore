import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
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
        title="Clients"
        subtitle="Manage client relationships and move directly into detailed nutrition reviews."
        maxWidth="max-w-4xl"
      >
        <WorkspaceHeader
          eyebrow="Nutritionist role"
          title="Clients"
          subtitle="Pending invites stay visible, while accepted clients open into richer profile review."
          icon={Users}
          tone="brand"
          badge={`${links.length} linked`}
          actions={<WorkspaceInviteAction label="Invite client" onClick={() => setShowInvite(true)} />}
        />

        {isLoading ? (
          <SectionCard title="Loading clients" subtitle="Fetching client relationships.">
            <div className="py-12 text-center text-[13px] text-[hsl(var(--fg-2))]">Loading clients...</div>
          </SectionCard>
        ) : (
          <WorkspaceRosterSection
            eyebrow="Roster"
            title="All linked clients"
            subtitle="Use accepted client records for meals, measurements, diet plans, and exam review."
            emptyIcon={Users}
            emptyTitle="No clients linked"
            emptyDescription="Invite a client to start prescribing diets and reviewing adherence."
            emptyAction={<WorkspaceInviteAction label="Invite client" onClick={() => setShowInvite(true)} />}
          >
            {links.map((link) => (
              <WorkspacePersonRow
                key={link.id}
                to={`/nutritionist/client/${link.id}`}
                initial={(link.client_name || link.client_email)?.[0]?.toUpperCase() || 'C'}
                title={link.client_name || link.client_email}
                subtitle={link.client_email}
                meta=""
                badge={link.status === 'active' ? 'Active' : 'Pending'}
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
