import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S46_Protocol_Form from '../screens/S46_Protocol_Form.jsx';
import { createProtocol, getProtocol, updateProtocol } from '@/services/protocolService.js';

function inferCategory(meta) {
  const value = String(meta || '').toUpperCase();
  if (value.includes('PEPTIDE')) return 'peptide';
  if (value.includes('HORMONE')) return 'hormone';
  if (value.includes('VITAMIN')) return 'vitamin';
  return 'supplement';
}

function buildInitialSubstance(locationState, protocol) {
  const picked = locationState?.pickedSubstance;
  if (picked) return picked;
  const template = locationState?.template;
  if (template) return { name: template.name, meta: template.meta };
  if (protocol?.name) {
    return {
      name: protocol.name,
      meta: [protocol.category, protocol.route].filter(Boolean).join(' · ').toUpperCase(),
    };
  }
  return undefined;
}

export default function V3ProtocolForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [protocol, setProtocol] = React.useState(null);
  const isEditing = Boolean(id);

  React.useEffect(() => {
    let cancelled = false;

    async function loadProtocol() {
      if (!isEditing || !id) return;
      const data = await getProtocol(id);
      if (!cancelled) setProtocol(data);
    }

    loadProtocol();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  const initialSubstance = useMemo(
    () => buildInitialSubstance(location.state, protocol),
    [location.state, protocol]
  );

  return (
    <S46_Protocol_Form
      dark={theme === 'dark'}
      initialSubstance={initialSubstance}
      onSave={async (values) => {
        if (!user?.id) {
          toast.error('You need to be signed in to save a protocol.');
          return;
        }

        const payload = {
          name: values.substance,
          category: inferCategory(initialSubstance?.meta),
          dose_amount: values.dose,
          dose_unit: values.doseUnit,
          route: initialSubstance?.meta?.split(' · ')[1]?.toLowerCase() || null,
          schedule_type: values.cadenceMode === 'Daily' ? 'interval' : 'weekdays',
          schedule_weekdays: values.cadenceMode === 'Days' ? values.selectedDays : null,
          schedule_interval_days: values.cadenceMode === 'Daily' ? 1 : null,
          notes: values.notes || null,
          reminder_time: values.time || null,
        };

        try {
          if (isEditing && id) {
            await updateProtocol(id, payload);
            toast.success('Protocol updated.');
          } else {
            await createProtocol(user.id, payload);
            toast.success('Protocol created.');
          }
          navigate('/app/protocols');
        } catch (error) {
          console.error('[V3ProtocolForm] save error:', error);
          toast.error('Could not save protocol.');
        }
      }}
      onCancel={() => navigate(-1)}
      onOpenPicker={() => navigate('/app/protocols/substances', {
        state: { returnTo: isEditing && id ? `/app/protocols/${id}/edit` : '/app/protocols/new' },
      })}
      showTabBar={false}
    />
  );
}
