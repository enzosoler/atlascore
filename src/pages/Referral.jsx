import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Gift, Link2, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';

export default function Referral() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useT();

  const [referralCount, setReferralCount] = useState(null);
  const [copied, setCopied] = useState(false);

  // Short referral code = first 8 chars of user UUID
  const shortCode = user?.id?.slice(0, 8) || '';
  const referralLink = shortCode
    ? `https://useatlascore.com/?ref=${shortCode}`
    : '';

  // Fetch referral count
  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', user.id)
      .then(({ count, error }) => {
        if (!error) setReferralCount(count ?? 0);
      });
  }, [user?.id]);

  const copyLink = useCallback(async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable
    }
  }, [referralLink]);

  const handleShare = useCallback(async () => {
    if (!referralLink) return;
    const shareText = t('shared.referral.shareText');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'atlas.core',
          text: shareText,
          url: referralLink,
        });
      } catch {
        // User cancelled or share failed — fall back to copy
        copyLink();
      }
    } else {
      copyLink();
    }
  }, [referralLink, t, copyLink]);

  const countLabel =
    referralCount === 1
      ? t('shared.referral.referralCount', { count: referralCount })
      : t('shared.referral.referralCountPlural', { count: referralCount ?? 0 });

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{t('shared.referral.title')}</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('shared.referral.heading')}</h2>
            <p className="text-[hsl(var(--fg-2))]">
              {t('shared.referral.subtitle')}
            </p>
          </div>

          {/* Referral count */}
          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--fg-2))]" />
                <span className="text-sm text-[hsl(var(--fg-2))]">{t('shared.referral.progressLabel')}</span>
              </div>
              {referralCount !== null ? (
                <span className="font-medium">{countLabel}</span>
              ) : (
                <span className="text-sm text-[hsl(var(--fg-2))]">...</span>
              )}
            </div>
            {referralCount === 0 && (
              <p className="text-xs text-[hsl(var(--fg-2))] mt-2">
                {t('shared.referral.noReferrals')}
              </p>
            )}
          </div>

          {/* Referral link */}
          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] mb-4">
            <p className="text-sm text-[hsl(var(--fg-2))] mb-2">{t('shared.referral.yourLink')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 rounded-lg bg-[hsl(var(--fill))] text-sm truncate">
                {referralLink || '...'}
              </code>
              <Button size="sm" onClick={copyLink} disabled={!referralLink}>
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-500 mt-1">{t('shared.referral.copied')}</p>
            )}
          </div>

          {/* Share button */}
          <Button className="w-full" onClick={handleShare} disabled={!referralLink}>
            <Share2 className="w-4 h-4 mr-2" />
            {t('shared.referral.shareButton')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
