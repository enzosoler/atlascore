import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Bug, Zap, Shield } from 'lucide-react';

const UPDATES = [
  {
    version: '2.5.0',
    date: 'January 2024',
    highlights: ['New Progress Photo Comparison', 'Improved Nutrition Logging', 'Dark Mode Improvements'],
    type: 'feature',
  },
  {
    version: '2.4.0',
    date: 'December 2023',
    highlights: ['Lab Results Integration', 'Workout Templates', 'Bug Fixes'],
    type: 'feature',
  },
  {
    version: '2.3.5',
    date: 'November 2023',
    highlights: ['Performance Improvements', 'Security Updates'],
    type: 'fix',
  },
];

export default function Changelog() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">What's New</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--accent-primary))]/20 to-[hsl(var(--accent-secondary))]/20 border border-[hsl(var(--accent-primary))]/30 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <span className="font-semibold">Latest Version</span>
            </div>
            <p className="text-2xl font-bold">v2.5.0</p>
            <p className="text-sm text-[hsl(var(--fg-2))]">Released January 2024</p>
          </div>

          <div className="space-y-4">
            {UPDATES.map((update, i) => (
              <div key={i} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {update.type === 'feature' ? (
                      <Zap className="w-4 h-4 text-yellow-500" />
                    ) : update.type === 'fix' ? (
                      <Bug className="w-4 h-4 text-green-500" />
                    ) : (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="font-semibold">v{update.version}</span>
                  </div>
                  <span className="text-sm text-[hsl(var(--fg-3))]">{update.date}</span>
                </div>
                <ul className="space-y-1">
                  {update.highlights.map((highlight, j) => (
                    <li key={j} className="text-sm text-[hsl(var(--fg-2))] flex items-start gap-2">
                      <span className="text-[hsl(var(--accent-primary))]">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
