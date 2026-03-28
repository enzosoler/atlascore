import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor, Check } from 'lucide-react';

const THEMES = [
  { id: 'system', label: 'System', icon: Monitor, desc: 'Follow device settings' },
  { id: 'light', label: 'Light', icon: Sun, desc: 'Always light mode' },
  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Always dark mode' },
];

export default function ThemeScreen() {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = React.useState('dark');

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Appearance</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-sm font-semibold text-[hsl(var(--fg-3))] mb-3">
            Theme
          </h2>
          <div className="space-y-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                  activeTheme === theme.id
                    ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-h))]'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeTheme === theme.id ? 'bg-[hsl(var(--accent-primary))]/20' : 'bg-[hsl(var(--fill))]'}`}>
                  <theme.icon className={`w-5 h-5 ${activeTheme === theme.id ? 'text-[hsl(var(--accent-primary))]' : ''}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{theme.label}</p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{theme.desc}</p>
                </div>
                {activeTheme === theme.id && <Check className="w-5 h-5 text-[hsl(var(--accent-primary))]" />}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <h3 className="font-medium mb-2">Preview</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-[hsl(var(--bg))] border border-[hsl(var(--border))]">
                <div className="w-full h-2 rounded bg-[hsl(var(--accent-primary))] mb-2" />
                <div className="w-3/4 h-2 rounded bg-[hsl(var(--fg-3))]" />
              </div>
              <div className="p-3 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <div className="w-full h-2 rounded bg-[hsl(var(--accent-primary))] mb-2" />
                <div className="w-3/4 h-2 rounded bg-[hsl(var(--fg-3))]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
