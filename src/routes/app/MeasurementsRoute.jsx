import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';
import { createMeasurement } from '@/services/bodyProgressService';
import S17_Measurements_Entry from '@/redesign/v3/screens/S17_Measurements_Entry.jsx';

export default function MeasurementsRoute() {
  const navigate = useNavigate();
  const t = useT();
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <S17_Measurements_Entry
      dark={theme === 'dark'}
      onClose={() => navigate(-1)}
      onSave={async (measurements) => {
        try {
          await createMeasurement(user.id, measurements);
          toast.success(t('body.routeToasts.measurementsSaved'));
          navigate('/app/body');
        } catch (err) {
          toast.error(t('body.routeToasts.measurementsSaveFailed'), {
            description: err?.message || t('common.tryAgain'),
          });
        }
      }}
    />
  );
}
