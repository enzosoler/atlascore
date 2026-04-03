import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useT } from '@/lib/i18nContext';
import { toast } from 'sonner';

export default function RestorePurchases() {
  const navigate = useNavigate();
  const { restore } = useSubscription();
  const t = useT();
  const [restoring, setRestoring] = useState(false);
  const [restored, setRestored] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const isActive = await restore();
      if (isActive) {
        setRestored(true);
        toast.success(t('restore.success'));
      } else {
        toast.error(t('restore.noPurchases'));
      }
    } catch {
      toast.error(t('restore.error'));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{t('restore.title')}</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--fill))] flex items-center justify-center mx-auto mb-4">
            {restored
              ? <CheckCircle2 className="w-8 h-8 text-[hsl(var(--ok))]" />
              : <RefreshCw className="w-8 h-8 text-[hsl(var(--brand))]" />
            }
          </div>

          <h2 className="text-xl font-bold mb-2">
            {restored ? t('restore.restoredTitle') : t('restore.heading')}
          </h2>
          <p className="text-[hsl(var(--fg-2))] mb-6">
            {restored ? t('restore.restoredDesc') : t('restore.description')}
          </p>

          {!restored && (
            <Button onClick={handleRestore} disabled={restoring} className="w-full mb-4">
              {restoring
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('restore.restoring')}</>
                : <><RefreshCw className="w-4 h-4 mr-2" /> {t('restore.button')}</>
              }
            </Button>
          )}

          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] text-left">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[hsl(var(--fg-3))] shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">{t('restore.helpTitle')}</p>
                <p className="text-[hsl(var(--fg-2))]">{t('restore.helpDesc')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
