import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Bell, MapPin, Camera, Check, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { notificationService } from '@/services/notificationService';
import { useT } from '@/lib/i18nContext';

const IS_NATIVE = Capacitor.isNativePlatform();

// Permission status for a single permission item.
// 'idle' | 'granted' | 'denied'
const IDLE = 'idle';
const GRANTED = 'granted';
const DENIED = 'denied';

export default function PermissionsScreen() {
  const navigate = useNavigate();
  const t = useT();

  const [notifStatus, setNotifStatus] = useState(IDLE);
  const [requesting, setRequesting] = useState(false);

  // On mount, check if notification permission was already decided.
  useEffect(() => {
    notificationService.checkPermissions().then((status) => {
      if (status === 'granted') setNotifStatus(GRANTED);
      if (status === 'denied')  setNotifStatus(DENIED);
    });
  }, []);

  const handleRequestNotifications = async () => {
    if (requesting || notifStatus === GRANTED) return;
    setRequesting(true);
    try {
      const result = await notificationService.requestPermissions();
      setNotifStatus(result === 'granted' ? GRANTED : DENIED);
    } finally {
      setRequesting(false);
    }
  };

  const handleContinue = () => {
    navigate('/onboarding/goal-selection');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex items-center justify-between p-4">
        <AtlasCoreLogoSVG width={32} height={16} />
        <button
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {t('permissions.title')}
            </h1>
            <p className="text-[hsl(var(--fg-2))] text-[15px]">
              {t('permissions.subtitle')}
            </p>
          </div>

          {/* Notifications permission */}
          <button
            onClick={handleRequestNotifications}
            disabled={requesting || notifStatus === GRANTED}
            className={[
              'w-full p-4 rounded-xl border flex items-center gap-4 transition-colors text-left',
              notifStatus === GRANTED
                ? 'border-[hsl(var(--brand)/0.6)] bg-[hsl(var(--brand)/0.06)]'
                : notifStatus === DENIED
                ? 'border-[hsl(var(--err)/0.4)] bg-[hsl(var(--err)/0.05)]'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] active:bg-[hsl(var(--fill)/0.6)]',
            ].join(' ')}
          >
            <div className={[
              'p-2 rounded-lg shrink-0',
              notifStatus === GRANTED ? 'bg-[hsl(var(--brand)/0.12)]' : 'bg-[hsl(var(--fill))]',
            ].join(' ')}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] tracking-[-0.01em]">
                {t('permissions.notifications.title')}
              </p>
              <p className="text-[13px] text-[hsl(var(--fg-2))] mt-0.5 leading-4">
                {notifStatus === DENIED
                  ? t('permissions.notifications.denied')
                  : t('permissions.notifications.desc')}
              </p>
            </div>
            {notifStatus === GRANTED && (
              <Check className="w-5 h-5 text-[hsl(var(--brand))] shrink-0" strokeWidth={2.5} />
            )}
            {notifStatus === DENIED && (
              <X className="w-5 h-5 text-[hsl(var(--err))] shrink-0" strokeWidth={2} />
            )}
          </button>

          {/* Camera and Location are handled by native prompts on first use.
              Only notification permission is requested explicitly here because
              it requires an upfront user decision before the OS prompt appears. */}
          <div className="space-y-2">
            {[
              { icon: Camera, titleKey: 'permissions.camera.title', descKey: 'permissions.camera.desc' },
              { icon: MapPin,  titleKey: 'permissions.location.title', descKey: 'permissions.location.desc' },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="w-full p-4 rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.5)] flex items-center gap-4"
              >
                <div className="p-2 rounded-lg bg-[hsl(var(--fill))] shrink-0">
                  <Icon className="w-5 h-5 text-[hsl(var(--fg-2))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] tracking-[-0.01em] text-[hsl(var(--fg-2))]">
                    {t(titleKey)}
                  </p>
                  <p className="text-[13px] text-[hsl(var(--fg-3))] mt-0.5 leading-4">
                    {t(descKey)}
                  </p>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] shrink-0">
                  {t('permissions.onFirstUse')}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            className="w-full"
          >
            {t('common.continue')}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <p className="text-center text-[13px] text-[hsl(var(--fg-3))]">
            {t('permissions.changeInSettings')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
