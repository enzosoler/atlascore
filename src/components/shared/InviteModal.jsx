import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { PrimaryButton, SecondaryButton } from '@/components/shared/StablePage';

/**
 * InviteModal - Send invite to student/client/patient
 * Usage: <InviteModal open={show} onOpenChange={setShow} role="coach" />
 */
export default function InviteModal({ open, onOpenChange, role = 'coach' }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);

  const roleLabels = {
    coach: {
      title: 'Convidar aluno',
      subtitle: 'Envie um convite seguro para liberar acompanhamento, prescrição e aderência em um único histórico.',
      placeholder: 'aluno@example.com',
    },
    nutritionist: {
      title: 'Convidar cliente',
      subtitle: 'Convide um cliente para compartilhar refeições, medidas, exames e planos prescritos.',
      placeholder: 'cliente@example.com',
    },
    clinician: {
      title: 'Convidar paciente',
      subtitle: 'Crie um vínculo clínico com acesso claro a protocolos, exames e composição corporal.',
      placeholder: 'paciente@example.com',
    },
  };

  const label = roleLabels[role] || roleLabels.coach;

  const handleSend = async () => {
    if (!email.trim() || !name.trim()) {
      toast.error('Preencha email e nome');
      return;
    }

    setSending(true);
    try {
      const res = await base44.functions.invoke('sendInviteEmail', {
        recipient_email: email,
        recipient_name: name,
        invited_by_role: role,
      });

      if (res.data?.success) {
        toast.success(`Convite enviado para ${email}`);
        qc.invalidateQueries({ queryKey: ['invites'] });
        setEmail('');
        setName('');
        onOpenChange(false);
      } else {
        toast.error(res.data?.error || 'Erro ao enviar convite');
      }
    } catch (err) {
      toast.error('Erro ao enviar convite');
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
              Nome completo
            </label>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
              />
            </div>
          </div>

          <div className="atlas-field px-4 py-3">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              Email
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
              Convite
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              O convite expira em 30 dias se não for aceito. O vínculo só fica ativo após confirmação.
            </p>
          </div>

          <div className="flex gap-3">
            <SecondaryButton type="button" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex-1 justify-center"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {sending ? 'Enviando...' : 'Enviar convite'}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
