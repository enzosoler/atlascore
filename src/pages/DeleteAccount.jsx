import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState(1);

  const handleDelete = () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Delete account logic
      console.log('Account deleted');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Delete Account</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-500">Warning</span>
            </div>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              This action is permanent and cannot be undone. All your data, including workouts, progress photos, and measurements will be permanently deleted.
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="font-medium">What will be deleted:</h2>
              <ul className="space-y-2 text-sm text-[hsl(var(--fg-2))]">
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  All workout history and routines
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  Nutrition logs and meal plans
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  Progress photos and measurements
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  Account profile and settings
                </li>
              </ul>
              <Button variant="destructive" onClick={handleDelete} className="w-full mt-4">
                <Trash2 className="w-4 h-4 mr-2" />
                Continue to Delete
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(var(--fg-2))]">
                To confirm deletion, type <strong className="text-[hsl(var(--fg))]">DELETE</strong> below:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE'}
                className="w-full"
              >
                Permanently Delete Account
              </Button>
              <button
                onClick={() => setStep(1)}
                className="w-full text-sm text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] py-2"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
