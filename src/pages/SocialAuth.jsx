import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

export default function SocialAuth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex items-center gap-2 p-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <AtlasCoreLogoSVG width={32} height={16} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">Sign in</h1>
          <p className="text-[hsl(var(--fg-2))] mb-6">Choose how you want to continue</p>

          <div className="space-y-3">
            <GoogleSignInButton />

            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => navigate('/auth/apple')}
            >
              <Apple className="w-4 h-4" />
              Continue with Apple
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[hsl(var(--bg))] text-[hsl(var(--fg-3))]">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => navigate('/auth/email')}
            >
              <Mail className="w-4 h-4" />
              Continue with Email
            </Button>
          </div>

          <p className="text-center mt-6 text-xs text-[hsl(var(--fg-3))]">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
