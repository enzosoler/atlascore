import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SERVICES = [
  { id: 'apple', name: 'Apple Health', icon: 'A', connected: true, color: 'bg-red-500' },
  { id: 'google', name: 'Google Fit', icon: 'G', connected: false, color: 'bg-blue-500' },
  { id: 'garmin', name: 'Garmin', icon: 'G', connected: false, color: 'bg-purple-500' },
  { id: 'fitbit', name: 'Fitbit', icon: 'F', connected: false, color: 'bg-cyan-500' },
  { id: 'myfitnesspal', name: 'MyFitnessPal', icon: 'M', connected: false, color: 'bg-blue-400' },
  { id: 'strava', name: 'Strava', icon: 'S', connected: true, color: 'bg-orange-500' },
];

export default function ConnectedServices() {
  const navigate = useNavigate();

  const toggleConnection = (id) => {
    console.log('Toggle connection for', id);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Connected Services</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <span className="font-medium">Sync Your Data</span>
            </div>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              Connect your favorite fitness apps and wearables to automatically import workouts, activity, and health data.
            </p>
          </div>

          <div className="space-y-3">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-lg ${service.color} flex items-center justify-center text-white font-bold`}>
                  {service.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">
                    {service.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                {service.connected ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <button 
                      onClick={() => toggleConnection(service.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => toggleConnection(service.id)}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
