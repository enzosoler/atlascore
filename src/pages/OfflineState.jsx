import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflineState() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm"
      >
        <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-10 h-10 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">You're offline</h3>
        <p className="text-sm text-[hsl(var(--fg-2))] mb-6">
          Please check your internet connection and try again.
        </p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </motion.div>
    </div>
  );
}
