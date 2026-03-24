import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

export default function AppleAuth() {
  const navigate = useNavigate();

  const handleAppleSignIn = async () => {
    // Apple Sign In implementation
    console.log('Apple Sign In triggered');
  };

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
          className="text-center"
        >
          <Apple className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Sign in with Apple</h1>
          <p className="text-[hsl(var(--fg-2))] mb-6">
            Use your Apple ID to sign in securely
          </p>

          <Button onClick={handleAppleSignIn} className="w-full bg-black hover:bg-gray-900">
            <Apple className="w-4 h-4 mr-2" />
            Continue with Apple
          </Button>

          <p className="text-xs text-[hsl(var(--fg-3))] mt-4">
            Your Apple ID information will not be shared with third parties.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
