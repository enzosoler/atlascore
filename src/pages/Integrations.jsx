import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { ArrowLeft, Link2, Check } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'health', name: 'Apple Health', status: 'connected', icon: '🍎', platform: 'ios' },
  { id: 'garmin', name: 'Garmin', status: 'coming_soon', icon: '📍' },
  { id: 'strava', name: 'Strava', status: 'coming_soon', icon: '🏃' },
  { id: 'fitbit', name: 'Fitbit', status: 'coming_soon', icon: '⌚' },
  { id: 'whoop', name: 'WHOOP', status: 'coming_soon', icon: '💜' },
  { id: 'myfitnesspal', name: 'MyFitnessPal', status: 'coming_soon', icon: '🥗' },
];

export default function Integrations() {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
  const isAndroid = isNative && platform === 'android';

  // On Android, hide Apple Health (iOS-only)
  const visibleIntegrations = INTEGRATIONS.filter(
    (i) => !(isAndroid && i.platform === 'ios')
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Integrations</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <span className="font-medium">Connect Your Apps</span>
            </div>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              Sync data from your favorite fitness apps and devices for a complete picture of your health.
            </p>
          </div>

          {isAndroid && (
            <div className="p-3 rounded-lg bg-[hsl(var(--fill))] mb-4 text-sm text-[hsl(var(--fg-2))]">
              Health Connect integration coming soon
            </div>
          )}

          <div className="space-y-2">
            {visibleIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-3"
              >
                <span className="text-2xl">{integration.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{integration.name}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">
                    {integration.status === 'connected' && 'Connected'}
                    {integration.status === 'coming_soon' && 'Coming soon'}
                  </p>
                </div>
                {integration.status === 'connected' ? (
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]">
                    Coming 2026
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
