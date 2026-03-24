import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { formatWeight, getWeightUnit, toKilograms, isImperial } from '@/lib/units';
import { 
  X, 
  Dumbbell, 
  Apple, 
  FileText, 
  Camera, 
  Plus, 
  Pill, 
  StickyNote,
  ChevronRight,
  Loader2
} from 'lucide-react';

const QUICK_ACTIONS = [
  { 
    id: 'weight',
    icon: FileText, 
    label: 'Quick Weight', 
    desc: 'Log weight now', 
    tone: 'orange',
    hasInput: true 
  },
  { 
    id: 'protocol',
    icon: Pill, 
    label: 'Log Dose', 
    desc: 'Track supplement', 
    tone: 'teal' 
  },
  { 
    id: 'note',
    icon: StickyNote, 
    label: 'Quick Note', 
    desc: 'Add observation', 
    tone: 'blue',
    hasInput: true 
  },
];

const NAV_ACTIONS = [
  { icon: Dumbbell, label: 'Log Workout', desc: 'Record your training', tone: 'orange', path: '/workouts' },
  { icon: Apple, label: 'Log Meal', desc: 'Track nutrition', tone: 'teal', path: '/nutrition' },
  { icon: FileText, label: 'Measurements', desc: 'Full body metrics', tone: 'brand', path: '/measurements' },
  { icon: Camera, label: 'Progress Photo', desc: 'Capture your journey', tone: 'accent', path: '/progress-photos' },
];

const toneStyles = {
  brand: 'bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]',
  teal: 'bg-[hsl(var(--accent-secondary)/0.15)] text-[hsl(var(--accent-secondary))]',
  orange: 'bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]',
  accent: 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]',
  blue: 'bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]',
};

export default function CreateAction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [protocols, setProtocols] = useState([]);
  const [loadingProtocols, setLoadingProtocols] = useState(false);

  // Fetch active protocols when dose action is selected
  React.useEffect(() => {
    if (activeQuickAction === 'protocol' && user) {
      setLoadingProtocols(true);
      supabase
        .from('protocols')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          setProtocols(data || []);
          setLoadingProtocols(false);
        });
    }
  }, [activeQuickAction, user]);

  const handleQuickWeight = async () => {
    if (!weightInput || !user) return;
    
    setSaving(true);
    const weightKg = toKilograms(parseFloat(weightInput), { unit_system: isImperial({}) ? 'imperial' : 'metric' });
    
    const { error } = await supabase.from('measurements').insert({
      user_id: user.id,
      weight: weightKg,
      date: new Date().toISOString().split('T')[0],
      source: 'quick_log',
    });
    
    setSaving(false);
    if (!error) {
      navigate(-1);
    }
  };

  const handleQuickNote = async () => {
    if (!noteInput.trim() || !user) return;
    
    setSaving(true);
    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      content: noteInput.trim(),
      created_at: new Date().toISOString(),
    });
    
    setSaving(false);
    if (!error) {
      navigate(-1);
    }
  };

  const handleLogDose = async (protocolId) => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase.from('protocol_logs').insert({
      user_id: user.id,
      protocol_id: protocolId,
      taken_at: new Date().toISOString(),
    });
    
    setSaving(false);
    if (!error) {
      navigate(-1);
    }
  };

  const weightUnit = getWeightUnit({ unit_system: 'metric' });

  return (
    <div className="min-h-screen bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        className="bg-[hsl(var(--bg))] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">What would you like to log?</h2>
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Row */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] mb-3">
            Quick Log
          </p>
          <div className="flex gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveQuickAction(action.id)}
                className="flex-1 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-center hover:border-[hsl(var(--border-h))] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${toneStyles[action.tone]}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <p className="font-medium text-[12px]">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Action Input Forms */}
        <AnimatePresence>
          {activeQuickAction === 'weight' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <label className="text-[12px] font-medium text-[hsl(var(--fg-2))] mb-2 block">
                Weight ({weightUnit})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder={`e.g. ${isImperial({}) ? '185' : '84'}`}
                  className="flex-1 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-sm focus:outline-none focus:border-[hsl(var(--accent-secondary))]"
                  autoFocus
                />
                <button
                  onClick={handleQuickWeight}
                  disabled={!weightInput || saving}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--accent-secondary))] text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </motion.div>
          )}

          {activeQuickAction === 'note' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <label className="text-[12px] font-medium text-[hsl(var(--fg-2))] mb-2 block">
                Quick Note
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="How are you feeling?"
                  className="flex-1 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-sm focus:outline-none focus:border-[hsl(var(--accent-secondary))]"
                  autoFocus
                />
                <button
                  onClick={handleQuickNote}
                  disabled={!noteInput.trim() || saving}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--accent-secondary))] text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </motion.div>
          )}

          {activeQuickAction === 'protocol' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
            >
              <div className="p-3 border-b border-[hsl(var(--border))]">
                <p className="text-[12px] font-medium text-[hsl(var(--fg-2))]">
                  Select protocol to log
                </p>
              </div>
              {loadingProtocols ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--fg-3))]" />
                </div>
              ) : protocols.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-[13px] text-[hsl(var(--fg-2))]">No active protocols</p>
                  <button
                    onClick={() => navigate('/protocols')}
                    className="mt-2 text-[12px] text-[hsl(var(--accent-secondary))] font-medium"
                  >
                    Create one →
                  </button>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {protocols.map((protocol) => (
                    <button
                      key={protocol.id}
                      onClick={() => handleLogDose(protocol.id)}
                      disabled={saving}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[hsl(var(--fill))] border-b border-[hsl(var(--border)/0.5)] last:border-0"
                    >
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-[hsl(var(--fg))]">
                          {protocol.substance_name}
                        </p>
                        <p className="text-[11px] text-[hsl(var(--fg-3))]">
                          {protocol.dose}{protocol.unit} · {protocol.frequency}
                        </p>
                      </div>
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--fg-3))]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation Actions */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] mb-3">
            Full Entry
          </p>
          <div className="grid grid-cols-2 gap-3">
            {NAV_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left hover:border-[hsl(var(--border-h))] transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${toneStyles[action.tone]}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-[hsl(var(--fg-2))]">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button className="w-full mt-4 p-4 rounded-xl border border-dashed border-[hsl(var(--border))] flex items-center justify-center gap-2 text-[hsl(var(--fg-2))] hover:border-[hsl(var(--border-h))] transition-colors">
          <Plus className="w-5 h-5" />
          <span className="text-sm">Custom Entry</span>
        </button>
      </motion.div>
    </div>
  );
}
