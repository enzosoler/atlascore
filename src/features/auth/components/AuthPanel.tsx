import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Mail, Loader2 } from 'lucide-react';

interface AuthPanelProps {
  mode: 'login' | 'signup';
  onBack: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ mode, onBack, onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-6 md:p-8 bg-base-gray-900/50 backdrop-blur-xl border border-base-gray-800 rounded-3xl shadow-2xl">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-base-gray-400 hover:text-base-white hover:bg-base-gray-800 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="ml-2 text-xl font-semibold text-base-white capitalize">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-base-gray-400">
            Email address
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-gray-500 group-focus-within:text-brand-gold transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 bg-base-black/50 border-base-gray-800 focus:border-brand-gold/50"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" title="Password must be at least 6 characters" className="text-sm font-medium text-base-gray-400">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-base-black/50 border-base-gray-800 focus:border-brand-gold/50"
            required
            minLength={6}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-base-gray-500">
        <p>
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-base-white hover:underline">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="text-base-white hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};
