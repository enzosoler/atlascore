import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Crown, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountStatus() {
  const navigate = useNavigate();
  const status = 'premium'; // 'free' | 'premium' | 'expired'
  const expiryDate = 'Feb 14, 2025';
  const daysLeft = 45;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Account Status</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`p-6 rounded-2xl mb-6 ${
            status === 'premium' 
              ? 'bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] text-white'
              : 'bg-[hsl(var(--fill))]'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-white/20">
                {status === 'premium' ? <Crown className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm opacity-90">Current Plan</p>
                <p className="text-2xl font-bold capitalize">{status}</p>
              </div>
            </div>
            
            {status === 'premium' && (
              <>
                <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Renews on {expiryDate}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '60%' }} />
                </div>
                <p className="text-xs mt-2 opacity-70">{daysLeft} days remaining</p>
              </>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <h2 className="font-semibold text-sm text-[hsl(var(--fg-3))] uppercase tracking-wider">Plan Features</h2>
            {[
              { label: 'Workout Tracking', free: true, premium: true },
              { label: 'Basic Nutrition', free: true, premium: true },
              { label: 'Progress Photos', free: false, premium: true },
              { label: 'Advanced Analytics', free: false, premium: true },
              { label: 'Custom Protocols', free: false, premium: true },
              { label: 'Priority Support', free: false, premium: true },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <span className="text-sm">{feature.label}</span>
                <div className="flex items-center gap-2">
                  {feature.free && <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]">Free</span>}
                  {feature.premium && status === 'premium' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {status === 'free' ? (
            <Button onClick={() => navigate('/pricing')} className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          ) : (
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => navigate('/billing')}>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              <button className="w-full text-sm text-red-500 hover:text-red-600 py-2">
                Cancel Subscription
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
