import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle2, Clock, Mail, Plus, RefreshCw, Send, Trash2, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { fetchBetaInvites, sendBetaInvite, revokeBetaInvite } from '@/lib/adminService';

const STATUS_STYLE = {
  pending:  'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]',
  accepted: 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
  expired:  'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
  revoked:  'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]',
};

const STATUS_ICON = {
  pending:  <Clock className="w-3 h-3" />,
  accepted: <CheckCircle2 className="w-3 h-3" />,
  expired:  <XCircle className="w-3 h-3" />,
  revoked:  <X className="w-3 h-3" />,
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLE[status] || STATUS_STYLE.expired}`}>
      {STATUS_ICON[status]}
      {status}
    </span>
  );
}

function SendInviteModal({ onClose, onSent }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await sendBetaInvite({ email: email.trim(), firstName: firstName.trim(), notes: notes.trim() });
      toast.success(`Invite sent to ${email.trim()}`);
      onSent?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-xl)] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Send beta invite</h3>
            <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">
              The user will receive full access to all features (except admin).
            </p>
          </div>
          <button onClick={onClose} className="text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="block mb-1.5 text-[12px] font-medium text-[hsl(var(--fg))]">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              disabled={loading}
              className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-[12px] font-medium text-[hsl(var(--fg))]">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Optional"
              disabled={loading}
              className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-[12px] font-medium text-[hsl(var(--fg))]">Personal note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why you're inviting them (shown in the email)"
              rows={2}
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-9 rounded-xl border border-[hsl(var(--border))] text-[13px] font-medium text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 h-9 rounded-xl bg-[hsl(var(--primary))] text-white text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-[hsl(var(--primary)/0.88)] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminInvites() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: invites = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-beta-invites'],
    queryFn: fetchBetaInvites,
    staleTime: 30 * 1000,
  });

  const revokeMutation = useMutation({
    mutationFn: revokeBetaInvite,
    onSuccess: () => {
      toast.success('Invite revoked');
      queryClient.invalidateQueries({ queryKey: ['admin-beta-invites'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to revoke invite'),
  });

  const pending  = invites.filter(i => i.status === 'pending').length;
  const accepted = invites.filter(i => i.status === 'accepted').length;
  const expired  = invites.filter(i => i.status === 'expired').length;

  const appUrl = import.meta.env.VITE_APP_URL || 'https://atlascore.app';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">Beta Invites</h2>
          <p className="t-caption mt-1">
            {pending} pending · {accepted} accepted · {expired} expired
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Send invite
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: pending, color: 'text-[hsl(var(--primary))]' },
          { label: 'Accepted', value: accepted, color: 'text-[hsl(var(--ok))]' },
          { label: 'Expired / Revoked', value: expired + invites.filter(i => i.status === 'revoked').length, color: 'text-[hsl(var(--fg-2))]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="surface p-4 text-center">
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            <p className="t-caption mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Invite list */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-[hsl(var(--fg-2))] gap-2">
          <div className="w-5 h-5 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
          Loading…
        </div>
      )}

      {!isLoading && invites.length === 0 && (
        <div className="surface p-10 text-center space-y-3">
          <Mail className="w-8 h-8 mx-auto text-[hsl(var(--fg-3))]" />
          <p className="text-sm text-[hsl(var(--fg-2))]">No invites sent yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-[13px] font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Send the first invite
          </button>
        </div>
      )}

      {!isLoading && invites.length > 0 && (
        <div className="space-y-2">
          {invites.map((invite) => (
            <div key={invite.id} className="surface p-4 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-medium text-[hsl(var(--fg))] break-all">{invite.email}</p>
                  <StatusBadge status={invite.status} />
                </div>
                {invite.notes && (
                  <p className="text-[12px] text-[hsl(var(--fg-3))] italic truncate">"{invite.notes}"</p>
                )}
                <p className="text-[11px] text-[hsl(var(--fg-3))]">
                  Sent {format(new Date(invite.created_at), 'MMM d, yyyy')}
                  {invite.status === 'pending' && ` · expires ${format(new Date(invite.expires_at), 'MMM d, yyyy')}`}
                  {invite.accepted_at && ` · accepted ${format(new Date(invite.accepted_at), 'MMM d, yyyy')}`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {invite.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        const url = `${appUrl}/invite?token=${invite.token}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Invite link copied');
                      }}
                      className="text-[12px] text-[hsl(var(--primary))] hover:underline"
                    >
                      Copy link
                    </button>
                    <button
                      onClick={() => revokeMutation.mutate(invite.id)}
                      disabled={revokeMutation.isPending}
                      className="p-1.5 rounded-lg text-[hsl(var(--fg-2))] hover:text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.08)] transition-colors"
                      title="Revoke invite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <SendInviteModal
          onClose={() => setShowModal(false)}
          onSent={() => queryClient.invalidateQueries({ queryKey: ['admin-beta-invites'] })}
        />
      )}
    </div>
  );
}
