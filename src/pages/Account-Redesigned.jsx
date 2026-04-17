import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  Mail,
  Bell,
  Zap,
  Users,
  Database,
  Globe,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

function AccountRedesigned() {
  const { user, logout } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const { t } = useT();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success(t('account.logged_out'));
      navigate(ROUTES.auth);
    } catch (error) {
      toast.error(t('account.logout_error'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleManageSubscription = () => {
    // Open native subscription management
    if (window.cordova || window.Capacitor) {
      // Native app - open app store
      // This would be platform-specific
      toast.info(t('account.open_app_store'));
    } else {
      // Web - open billing portal
      navigate(ROUTES.billing);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[hsl(var(--card))]/80 backdrop-blur-md border-b border-[hsl(var(--border))/0.5] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">
            {t('account.title')}
          </h1>
          <Link
            to={ROUTES.today}
            className="text-sm text-[hsl(var(--brand))] hover:text-[hsl(var(--brand)/0.8)]"
          >
            {t('common.back_to_today')}
          </Link>
        </div>
      </header>

      <main className="px-4 py-4 pb-20">
        {subscriptionLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--fg))/30 border-t-[hsl(var(--fg))]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Identity Card - Linear reference */}
            <div className="bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--brand))/0.1]">
                  <User className="h-8 w-8 text-[hsl(var(--brand))]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[hsl(var(--fg))] mb-1">
                    {user?.full_name || t('account.anonymous_user')}
                  </h2>
                  <p className="text-[hsl(var(--fg-3))]">
                    {user?.email || t('account.no_email')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subscription Status */}
                <div className="bg-[hsl(var(--fill-secondary))] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="h-5 w-5 text-[hsl(var(--ok))]" />
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.subscription')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {subscription?.status === 'active' 
                          ? t('account.active_subscription')
                          : t('account.inactive_subscription')
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-[hsl(var(--fg))] mb-1">
                      {subscription?.plan?.name || t('account.no_plan')}
                    </p>
                    {subscription?.renews_at && (
                      <p className="text-sm text-[hsl(var(--fg-3))]">
                        {t('account.renews_on')} {new Date(subscription.renews_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleManageSubscription}
                    className="w-full flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--card-hi))] transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.manage_subscription')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {t('account.billing_owner')} {user?.email}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Navigation - Things 3 reference */}
            <div className="bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))]">
              <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-4">
                {t('account.settings')}
              </h3>
              
              <div className="space-y-2">
                <Link
                  to={ROUTES.settings}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--card-hi))] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-[hsl(var(--fg-2))]" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.app_settings')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {t('account.preferences_notifications')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                </Link>

                <Link
                  to={ROUTES.notificationSettings}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--card-hi))] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-[hsl(var(--fg-2))]" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.notifications')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {t('account.push_email_settings')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                </Link>

                <Link
                  to={ROUTES.export}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--card-hi))] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-[hsl(var(--fg-2))]" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.data_export')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {t('account.download_your_data')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                </Link>

                <Link
                  to={ROUTES.social}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--card-hi))] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-[hsl(var(--fg-2))]" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.social_sharing')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {t('account.connect_share_progress')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                </Link>

                <Link
                  to={ROUTES.help}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--card-hi))] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-[hsl(var(--fg-2))]" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.help_support')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {t('account.faq_contact')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                </Link>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--err))/0.2]">
              <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-4">
                {t('account.danger_zone')}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {/* TODO: Delete account */}}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--err))/0.3] p-4 hover:bg-[hsl(var(--err))/0.1] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-[hsl(var(--err))]" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {t('account.delete_account')}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {t('account.permanently_delete')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--err))]" />
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--card-hi))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--fg))/30 border-t-[hsl(var(--fg))]" />
                ) : (
                  <LogOut className="h-5 w-5 text-[hsl(var(--fg-2))]" />
                )}
                <span className="text-sm font-medium text-[hsl(var(--fg))]">
                  {t('account.log_out')}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AccountRedesigned;
