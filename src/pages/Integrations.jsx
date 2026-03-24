import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INTEGRATIONS = [
  { id: 'health', name: 'Apple Health', status: 'connected', icon: '🍎' },
  { id: 'fitbit', name: 'Fitbit', status: 'available', icon: '⌚' },
  { id: 'garmin', name: 'Garmin', status: 'available', icon: '📍' },
  { id: 'myfitnesspal', name: 'MyFitnessPal', status: 'connected', icon: '🥗' },
  { id: 'strava', name: 'Strava', status: 'available', icon: '🏃' },
  { id: 'whoop', name: 'WHOOP', status: 'coming_soon', icon: '💜' },
];

export default function Integrations() {
  const navigate = useNavigate();

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

          <div className="space-y-2">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.id}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-3"
              >
                <span className="text-2xl">{integration.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{integration.name}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">
                    {integration.status === 'connected' && 'Connected'}
                    {integration.status === 'available' && 'Available to connect'}
                    {integration.status === 'coming_soon' && 'Coming soon'}
                  </p>
                </div>
                {integration.status === 'connected' ? (
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                ) : integration.status === 'available' ? (
                  <Button size="sm" variant="outline">
                    Connect
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]">
                    Soon
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
