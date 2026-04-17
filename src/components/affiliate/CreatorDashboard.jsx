import React, { useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  Copy,
  Share2,
  ExternalLink,
  MousePointerClick,
  UserPlus,
  CreditCard,
  DollarSign,
  TrendingUp,
  HelpCircle,
  FileText,
  Mail,
  ChevronRight,
  Check,
  X,
  Loader2,
  Gift,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * CreatorDashboard -- Cameo-style affiliate/creator hub.
 *
 * Layout:
 *   1. Hero: creator code + referral link (large, prominent)
 *   2. Copy + share action buttons
 *   3. Funnel stats: clicks, signups, conversions, earnings
 *   4. Payout + rules
 *   5. Help / resources
 */
export default function CreatorDashboard({ open, onClose }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(null); // 'code' | 'link' | null

  // ── Fetch creator profile ──────────────────────────────────────────────────

  const { data: creator, isLoading } = useQuery({
    queryKey: ['creator-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get creator profile (code, stats, etc.)
      const { data: profile } = await supabase
        .from('profiles')
        .select('creator_code, creator_locked, creator_attached_at, full_name, email')
        .eq('id', user.id)
        .single();

      // Try to get affiliate stats if table exists
      let stats = { clicks: 0, signups: 0, conversions: 0, earnings: 0 };
      try {
        const { data: affiliateStats } = await supabase
          .from('affiliate_stats')
          .select('clicks, signups, conversions, earnings')
          .eq('user_id', user.id)
          .single();
        if (affiliateStats) stats = affiliateStats;
      } catch {
        // Table may not exist yet -- show zeroed shell
      }

      return {
        code: profile?.creator_code || null,
        name: profile?.full_name || profile?.email?.split('@')[0] || 'Creator',
        locked: profile?.creator_locked || false,
        attachedAt: profile?.creator_attached_at || null,
        stats,
      };
    },
    enabled: !!user?.id && open,
  });

  // ── Derived values ─────────────────────────────────────────────────────────

  const creatorCode = creator?.code || null;
  const referralLink = creatorCode
    ? `https://useatlascore.com/start?ref=${creatorCode}`
    : null;

  const funnelStats = [
    {
      label: 'Clicks',
      value: creator?.stats?.clicks ?? 0,
      icon: MousePointerClick,
      color: 'hsl(var(--brand))',
    },
    {
      label: 'Signups',
      value: creator?.stats?.signups ?? 0,
      icon: UserPlus,
      color: '#4facfe',
    },
    {
      label: 'Conversions',
      value: creator?.stats?.conversions ?? 0,
      icon: CreditCard,
      color: '#43e97b',
    },
    {
      label: 'Earnings',
      value: `$${(creator?.stats?.earnings ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: '#f5a623',
    },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────

  const copyToClipboard = useCallback(async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(type === 'code' ? 'Code copied' : 'Link copied');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!referralLink) return;
    const shareData = {
      title: 'Atlas Core',
      text: `Use my code ${creatorCode} to get started with Atlas Core`,
      url: referralLink,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        toast.success('Share link copied');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('Share failed');
      }
    }
  }, [referralLink, creatorCode]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close button ──────────────────────────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-xl p-2 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--fg-3))]" />
          </div>
        ) : !creatorCode ? (
          /* ── No creator code state ─────────────────────────────────── */
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--brand)/0.1)]">
              <Gift className="h-8 w-8 text-[hsl(var(--brand))]" />
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--fg))]">
              Become a Creator
            </h2>
            <p className="text-sm text-[hsl(var(--fg-2))] max-w-xs">
              Apply for the Atlas Core affiliate program to get your own creator code, track referrals, and earn commissions.
            </p>
            <a
              href="mailto:creators@useatlascore.com?subject=Creator%20Program%20Application"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              Apply Now
            </a>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════
                1. HERO: Creator code + referral link
            ══════════════════════════════════════════════════════════════ */}
            <div className="p-6 pb-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">
                Your Creator Code
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 rounded-2xl border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)] px-6 py-5">
                  <p className="text-center text-3xl font-extrabold tracking-wide text-[hsl(var(--brand))]">
                    {creatorCode}
                  </p>
                </div>
              </div>

              {/* Referral link */}
              <div className="mt-3 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--shell)/0.5)] px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--fg-3))]">
                  Referral Link
                </p>
                <p className="mt-1 truncate text-sm font-medium text-[hsl(var(--fg-2))]">
                  {referralLink}
                </p>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                2. ACTIONS: Copy + Share
            ══════════════════════════════════════════════════════════════ */}
            <div className="flex gap-3 px-6 pt-4">
              <button
                onClick={() => copyToClipboard(creatorCode, 'code')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--shell))] active:scale-[0.98]"
              >
                {copied === 'code' ? (
                  <Check className="h-4 w-4 text-[hsl(var(--ok))]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === 'code' ? 'Copied' : 'Copy Code'}
              </button>
              <button
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--shell))] active:scale-[0.98]"
              >
                {copied === 'link' ? (
                  <Check className="h-4 w-4 text-[hsl(var(--ok))]" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {copied === 'link' ? 'Copied' : 'Copy Link'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center rounded-xl bg-[hsl(var(--brand))] px-4 py-3 text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                3. FUNNEL STATS: Clicks, Signups, Conversions, Earnings
            ══════════════════════════════════════════════════════════════ */}
            <div className="px-6 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--fg-3))]" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">
                  Funnel
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {funnelStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--shell)/0.4)] p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                          {stat.label}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                4. PAYOUT + RULES
            ══════════════════════════════════════════════════════════════ */}
            <div className="px-6 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-[hsl(var(--fg-3))]" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">
                  Payout & Rules
                </p>
              </div>
              <div className="space-y-2">
                <div className="rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--shell)/0.4)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--fg))]">Commission Rate</p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--fg-2))]">Per qualifying conversion</p>
                    </div>
                    <span className="text-lg font-bold text-[hsl(var(--brand))]">20%</span>
                  </div>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--shell)/0.4)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--fg))]">Payout Schedule</p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--fg-2))]">Minimum $50 balance required</p>
                    </div>
                    <span className="text-sm font-semibold text-[hsl(var(--fg))]">Monthly</span>
                  </div>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--shell)/0.4)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--fg))]">Cookie Duration</p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--fg-2))]">Attribution window after click</p>
                    </div>
                    <span className="text-sm font-semibold text-[hsl(var(--fg))]">30 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                5. HELP / RESOURCES
            ══════════════════════════════════════════════════════════════ */}
            <div className="px-6 pt-6 pb-6">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4 text-[hsl(var(--fg-3))]" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">
                  Resources
                </p>
              </div>
              <div className="space-y-1">
                {[
                  {
                    label: 'Affiliate Terms',
                    href: '/terms#affiliate',
                    icon: FileText,
                  },
                  {
                    label: 'Creator Support',
                    href: 'mailto:creators@useatlascore.com',
                    icon: Mail,
                  },
                  {
                    label: 'Marketing Assets',
                    href: 'https://useatlascore.com/brand',
                    icon: ExternalLink,
                  },
                ].map((link) => {
                  const LinkIcon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') || link.href.startsWith('mailto') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--shell)/0.5)] hover:text-[hsl(var(--fg))]"
                    >
                      <LinkIcon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight className="h-4 w-4 opacity-40" />
                    </a>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
