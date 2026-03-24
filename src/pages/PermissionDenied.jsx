import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PermissionDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-sm text-[hsl(var(--fg-2))] mb-6">
          You don't have permission to access this feature. Please check your subscription or contact support.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/settings/subscription')}>
            <Settings className="w-4 h-4 mr-2" />
            View Plans
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
