import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { id: 'pt', label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { id: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { id: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { id: 'it', label: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { id: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { id: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
];

export default function LanguageScreen() {
  const navigate = useNavigate();
  const [activeLanguage, setActiveLanguage] = React.useState('en');

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Language</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[hsl(var(--fg-3))]" />
            <h2 className="text-sm font-semibold text-[hsl(var(--fg-3))] uppercase tracking-wider">
              Select Language
            </h2>
          </div>
          <div className="space-y-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLanguage(lang.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[hsl(var(--fill))] transition-colors border-b border-[hsl(var(--border))] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{lang.label}</p>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{lang.native}</p>
                  </div>
                </div>
                {activeLanguage === lang.id && <Check className="w-5 h-5 text-[hsl(var(--accent-primary))]" />}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
