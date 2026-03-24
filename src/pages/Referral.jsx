import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Users, Gift, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Referral() {
  const navigate = useNavigate();
  const referralCode = 'ATLAS2024';
  const referralLink = `https://atlas.core/r/${referralCode}`;
  const referrals = 3;
  const rewards = [
    { count: 1, reward: '1 week Premium' },
    { count: 3, reward: '1 month Premium' },
    { count: 5, reward: '3 months Premium' },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Invite Friends</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Share Atlas Core</h2>
            <p className="text-[hsl(var(--fg-2))]">
              Invite friends and earn free Premium time
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[hsl(var(--fg-2))]">Your Progress</span>
              <span className="font-medium">{referrals} referrals</span>
            </div>
            <div className="w-full bg-[hsl(var(--border))] rounded-full h-2">
              <div className="bg-[hsl(var(--accent-primary))] rounded-full h-2" style={{ width: '60%' }} />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {rewards.map((tier, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  referrals >= tier.count ? 'bg-green-500/10' : 'bg-[hsl(var(--fill))]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    referrals >= tier.count ? 'bg-green-500 text-white' : 'bg-[hsl(var(--border))]'
                  }`}>
                    {referrals >= tier.count ? <Check className="w-3 h-3" /> : <span className="text-xs">{tier.count}</span>}
                  </div>
                  <span className="text-sm">Refer {tier.count} friend{tier.count > 1 ? 's' : ''}</span>
                </div>
                <span className={`text-sm font-medium ${referrals >= tier.count ? 'text-green-500' : ''}`}>
                  {tier.reward}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] mb-4">
            <p className="text-sm text-[hsl(var(--fg-2))] mb-2">Your referral link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 rounded-lg bg-[hsl(var(--fill))] text-sm truncate">
                {referralLink}
              </code>
              <Button size="sm" onClick={copyLink}>
                <Link2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Friends
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
