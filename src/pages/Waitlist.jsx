import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Mail, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Waitlist() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    setJoined(true);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Join Waitlist</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {joined ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're on the List!</h2>
              <p className="text-[hsl(var(--fg-2))] mb-6">
                We'll notify you as soon as this feature becomes available.
              </p>
              <Button onClick={() => navigate('/today')}>Back to App</Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                <p className="text-[hsl(var(--fg-2))]">
                  This feature is currently in development. Join the waitlist to get early access.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                  <span className="font-medium">Expected Launch</span>
                </div>
                <p className="text-sm text-[hsl(var(--fg-2))]">Coming soon — Join the waitlist for early access</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--fg-3))]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleJoin} disabled={!email.trim()} className="w-full">
                  Join Waitlist
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
