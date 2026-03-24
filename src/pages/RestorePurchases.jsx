import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RestorePurchases() {
  const navigate = useNavigate();

  const handleRestore = () => {
    // Restore purchases logic
    console.log('Restoring purchases...');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Restore Purchases</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--fill))] flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-[hsl(var(--accent-primary))]" />
          </div>
          
          <h2 className="text-xl font-bold mb-2">Restore Your Purchases</h2>
          <p className="text-[hsl(var(--fg-2))] mb-6">
            If you've previously purchased Atlas Core Premium, tap below to restore your access.
          </p>

          <Button onClick={handleRestore} className="w-full mb-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restore Purchases
          </Button>

          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] text-left">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[hsl(var(--fg-3))] shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Having trouble?</p>
                <p className="text-[hsl(var(--fg-2))]">
                  Make sure you're signed in with the same Apple ID or Google account used for the original purchase.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>Purchases are linked to your account</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
