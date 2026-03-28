import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Share2, Bell, FileText } from 'lucide-react';

const PRIVACY_SECTIONS = [
  {
    icon: Lock,
    title: 'Account Security',
    items: [
      { label: 'Two-Factor Authentication', value: 'Enabled', toggle: true, active: true },
      { label: 'Change Password', value: '', action: true },
      { label: 'Active Sessions', value: '3 devices', action: true },
    ],
  },
  {
    icon: Eye,
    title: 'Visibility',
    items: [
      { label: 'Profile Visibility', value: 'Public', toggle: false, action: true },
      { label: 'Show Activity Status', value: '', toggle: true, active: true },
      { label: 'Allow Search by Email', value: '', toggle: true, active: false },
    ],
  },
  {
    icon: Share2,
    title: 'Data Sharing',
    items: [
      { label: 'Share Data with Partners', value: '', toggle: true, active: false },
      { label: 'Analytics & Improvement', value: '', toggle: true, active: true },
      { label: 'Download My Data', value: '', action: true },
    ],
  },
];

export default function PrivacyScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Privacy</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <span className="font-medium">Privacy Protection</span>
            </div>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              Your health data is encrypted and stored securely. We never sell your personal information.
            </p>
          </div>

          {PRIVACY_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                <h2 className="text-sm font-semibold text-[hsl(var(--fg-3))]">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
                {section.items.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-4 hover:bg-[hsl(var(--fill))] transition-colors border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <span className="text-sm">{item.label}</span>
                    {item.toggle ? (
                      <div className={`w-11 h-6 rounded-full relative transition-colors ${
                        item.active ? 'bg-[hsl(var(--accent-primary))]' : 'bg-[hsl(var(--border))]'
                      }`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          item.active ? 'left-6' : 'left-1'
                        }`} />
                      </div>
                    ) : (
                      <span className="text-sm text-[hsl(var(--fg-2))]">{item.value || '>'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 p-4 rounded-xl border border-[hsl(var(--border))] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Request Data Deletion</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
