import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Bell, Eye, Check } from 'lucide-react';

const CONSENT_ITEMS = [
  { id: 'marketing', title: 'Marketing Communications', desc: 'Receive emails about new features and offers', enabled: true },
  { id: 'analytics', title: 'Analytics & Improvement', desc: 'Help us improve by sharing usage data', enabled: true },
  { id: 'third_party', title: 'Third-Party Sharing', desc: 'Share data with trusted partners', enabled: false },
  { id: 'personalization', title: 'Personalization', desc: 'Allow personalized recommendations', enabled: true },
];

export default function ManageConsent() {
  const navigate = useNavigate();
  const [consents, setConsents] = React.useState(CONSENT_ITEMS);

  const toggleConsent = (id) => {
    setConsents(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Manage Consent</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <span className="font-medium">Your Privacy Matters</span>
            </div>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              Control how we use your data and what communications you receive.
            </p>
          </div>

          <div className="space-y-3">
            {consents.map((consent) => (
              <div
                key={consent.id}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{consent.title}</p>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{consent.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleConsent(consent.id)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      consent.enabled ? 'bg-[hsl(var(--accent-primary))]' : 'bg-[hsl(var(--border))]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      consent.enabled ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-[hsl(var(--fg-3))]" />
              <span className="text-sm font-medium">Essential Notifications</span>
            </div>
            <p className="text-sm text-[hsl(var(--fg-2))] mb-3">
              You cannot disable essential notifications like account security alerts and subscription updates.
            </p>
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--fg-3))]">
              <Eye className="w-4 h-4" />
              <span>Required for account operation</span>
            </div>
          </div>

          <button className="w-full mt-6 p-3 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--fill))] transition-colors">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Save Preferences
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
