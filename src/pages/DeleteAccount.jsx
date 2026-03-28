import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18nContext';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const t = useT();
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
        <h1 className="text-lg font-semibold">{t('deleteAccount.title')}</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-500">{t('deleteAccount.warning')}</span>
            </div>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              {t('deleteAccount.warningDesc')}
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="font-medium">{t('deleteAccount.whatGetsDeleted')}</h2>
              <ul className="space-y-2 text-sm text-[hsl(var(--fg-2))]">
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  {t('deleteAccount.item.workouts')}
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  {t('deleteAccount.item.nutrition')}
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  {t('deleteAccount.item.photos')}
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  {t('deleteAccount.item.profileSettings')}
                </li>
              </ul>
              <Button variant="destructive" onClick={handleDelete} className="w-full mt-4">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('deleteAccount.continueBtn')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(var(--fg-2))]">
                {t('deleteAccount.typeToConfirmPrefix')} <strong className="text-[hsl(var(--fg))]">DELETE</strong> {t('deleteAccount.typeToConfirmSuffix')}
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t('deleteAccount.inputPlaceholder')}
              />
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE'}
                className="w-full"
              >
                {t('deleteAccount.permanentlyDeleteBtn')}
              </Button>
              <button
                onClick={() => setStep(1)}
                className="w-full text-sm text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] py-2"
              >
                {t('deleteAccount.cancel')}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
