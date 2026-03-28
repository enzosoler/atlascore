import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, Lightbulb, Zap, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 'bug', icon: Bug, label: 'Bug Report', desc: 'Something not working?' },
  { id: 'feature', icon: Lightbulb, label: 'Feature Request', desc: 'Have an idea?' },
  { id: 'other', icon: Zap, label: 'Other', desc: 'General feedback' },
];

export default function ReportProblem() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Report a Problem</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Thank You!</h2>
              <p className="text-[hsl(var(--fg-2))] mb-6">
                Your feedback helps us improve atlas.core.
              </p>
              <Button onClick={() => navigate('/settings')}>
                Back to Settings
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[hsl(var(--fg-2))] mb-4">
                What type of issue are you experiencing?
              </p>
              <div className="space-y-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                      category === cat.id
                        ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-h))]'
                    }`}
                  >
                    <cat.icon className={`w-5 h-5 ${category === cat.id ? 'text-[hsl(var(--accent-primary))]' : ''}`} />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{cat.label}</p>
                      <p className="text-sm text-[hsl(var(--fg-2))]">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    className="w-full h-32 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                  />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!category || !description.trim()} 
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
