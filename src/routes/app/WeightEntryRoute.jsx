import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';
import { createMeasurement } from '@/services/bodyProgressService';
import S6_Weight_B from '@/redesign/v3/screens/S6_Weight_B.jsx';

export default function WeightEntryRoute() {
  const navigate = useNavigate();
  const t = useT();
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <S6_Weight_B
      dark={theme === 'dark'}
      onBack={() => navigate(-1)}
      onSave={async (entry) => {
        try {
          await createMeasurement(user.id, {
            weight: entry.weight,
            date: entry.when || new Date().toISOString(),
          });
          toast.success(t('body.routeToasts.weightLoggedTitle'), {
            description: t('body.routeToasts.weightLoggedBody'),
            action: {
              label: t('body.routeToasts.viewHistory'),
              onClick: () => navigate('/app/body/composition'),
            },
          });
          navigate('/app/body');
        } catch (err) {
          toast.error(t('body.routeToasts.weightSaveFailed'), {
            description: err?.message || t('common.tryAgain'),
          });
        }
      }}
      onViewHistory={() => navigate('/app/body/composition')}
    />
  );
}
