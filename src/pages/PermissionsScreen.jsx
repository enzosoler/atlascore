import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Bell, MapPin, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const PERMISSIONS = [
  { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Get reminders for workouts and meals', required: true },
  { id: 'location', icon: MapPin, title: 'Location', desc: 'For outdoor activities and local features', required: false },
  { id: 'camera', icon: Camera, title: 'Camera', desc: 'For progress photos and barcode scanning', required: false },
];

export default function PermissionsScreen() {
  const navigate = useNavigate();
  const [granted, setGranted] = useState([]);

  const togglePermission = (id) => {
    setGranted(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    navigate('/onboarding/goal-selection');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex items-center justify-between p-4">
        <AtlasCoreLogoSVG width={32} height={16} />
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">Enable permissions</h1>
          <p className="text-[hsl(var(--fg-2))] mb-6">
            These help us provide a better experience
          </p>

          <div className="space-y-3">
            {PERMISSIONS.map((perm) => (
              <button
                key={perm.id}
                onClick={() => togglePermission(perm.id)}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                  granted.includes(perm.id)
                    ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/10'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                }`}
              >
                <div className={`p-2 rounded-lg ${granted.includes(perm.id) ? 'bg-[hsl(var(--accent-primary))]/20' : 'bg-[hsl(var(--fill))]'}`}>
                  <perm.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{perm.title}</p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{perm.desc}</p>
                </div>
                {granted.includes(perm.id) && <Check className="w-5 h-5 text-[hsl(var(--accent-primary))]" />}
              </button>
            ))}
          </div>

          <Button onClick={handleContinue} className="w-full mt-8">
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <p className="text-center mt-4 text-sm text-[hsl(var(--fg-3))]">
            You can change these later in Settings
          </p>
        </motion.div>
      </div>
    </div>
  );
}
