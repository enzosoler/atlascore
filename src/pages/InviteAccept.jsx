import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoadingAuth, isAuthenticated } = useAuth();
  const token = searchParams.get('token');

  const [state, setState] = useState('idle'); // idle | redeeming | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Once authenticated, try to redeem
  useEffect(() => {
    if (isLoadingAuth || !token) return;

    if (!isAuthenticated) {
      // Send them to auth with a redirect back here
      const next = encodeURIComponent(`/invite?token=${token}`);
      navigate(`/auth?mode=signup&next=${next}`, { replace: true });
      return;
    }

    if (state !== 'idle') return;

    setState('redeeming');

    supabase.functions.invoke('redeem-invite', { body: { token } })
      .then(async ({ data, error }) => {
        if (error || data?.error) {
          const msg = data?.error || data?.message || error?.context?.error || error?.message || 'Something went wrong.';
          // If the invite belongs to a different email, sign out and redirect to signup
          if (msg.includes('different email')) {
            await supabase.auth.signOut();
            const next = encodeURIComponent(`/invite?token=${token}`);
            navigate(`/auth?mode=signup&next=${next}`, { replace: true });
            return;
          }
          setErrorMsg(msg);
          setState('error');
        } else {
          setState('success');
          // Refresh session so JWT picks up the new role
          supabase.auth.refreshSession().finally(() => {
            setTimeout(() => navigate('/Today', { replace: true }), 2000);
          });
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Something went wrong.');
        setState('error');
      });
  }, [isLoadingAuth, isAuthenticated, token, state, navigate]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--bg))] p-6">
        <div className="text-center space-y-3">
          <XCircle className="w-10 h-10 mx-auto text-[hsl(var(--err))]" />
          <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Invalid invite link</p>
          <p className="t-caption">This link is missing the invite token. Please check your email and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--bg))] p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Logo / brand */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--fg))] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-[hsl(var(--bg))]" />
          </div>
        </div>

        {(state === 'idle' || state === 'redeeming' || isLoadingAuth) && (
          <>
            <div>
              <h1 className="text-[22px] font-semibold text-[hsl(var(--fg))]">You've been invited</h1>
              <p className="mt-2 t-caption">
                {isLoadingAuth || state === 'redeeming'
                  ? 'Activating your access…'
                  : 'Sign up or sign in to accept your invitation to Atlas Core beta.'}
              </p>
            </div>
            {(isLoadingAuth || state === 'redeeming') && (
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-[hsl(var(--primary))]" />
            )}
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto text-[hsl(var(--ok))]" />
            <div>
              <p className="text-[17px] font-semibold text-[hsl(var(--fg))]">Welcome to Atlas Core!</p>
              <p className="mt-1 t-caption">Full access activated. Redirecting you now…</p>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-10 h-10 mx-auto text-[hsl(var(--err))]" />
            <div>
              <p className="text-[17px] font-semibold text-[hsl(var(--fg))]">Invite could not be activated</p>
              <p className="mt-1 t-caption">{errorMsg}</p>
            </div>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full h-11 rounded-xl bg-[hsl(var(--primary))] text-white text-[14px] font-medium hover:bg-[hsl(var(--primary)/0.88)] transition-colors"
            >
              Go to homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
}
