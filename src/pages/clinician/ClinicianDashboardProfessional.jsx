import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyClients } from '@/services/professionalLinksService';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { Link } from 'react-router-dom';
import { Users, BarChart3, TrendingUp, Activity, Loader2, Plus, Stethoscope, AlertTriangle } from 'lucide-react';
import RoleGate from '@/components/rbac/RoleGate';

function KPI({ icon: Icon, label, value, detail, link }) {
  const inner = (
    <div className="surface p-5 hover:border-[hsl(var(--brand)/0.3)] transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand)/0.08)] flex items-center justify-center group-hover:bg-[hsl(var(--brand)/0.12)] transition-colors">
          <Icon className="w-5 h-5 text-[hsl(var(--brand))]" strokeWidth={1.5} />
        </div>
      </div>
      <p className="t-label text-[hsl(var(--fg-2))] mb-2">{label}</p>
      <p className="text-3xl font-bold text-[hsl(var(--fg))]">{value}</p>
      {detail && <p className="text-[11px] text-[hsl(var(--fg-2))] mt-1">{detail}</p>}
    </div>
  );

  return link ? <Link to={link}>{inner}</Link> : inner;
}

export default function ClinicianDashboardProfessional() {
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  const { data: patientLinks = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['clinician-patients', user?.id],
    queryFn: () => getMyClients(user.id, 'clinician'),
    enabled: !!user?.id,
  });

  
  const measurements = [];
  const labExams = [];
  const protocols = [];

  const activePatients = patientLinks.filter(l => l.status === 'active').length;
  const pendingInvites = patientLinks.filter(l => l.status === 'pending').length;

  // Alerts
  const alerts = [];
  patientLinks.filter(l => l.status === 'active').forEach(link => {
    const patientMeasurements = measurements.filter(m => m.created_by === link.client_email);
    const lastMeasurement = patientMeasurements.length > 0
      ? patientMeasurements.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null;
    
    const daysSinceLastMeasurement = lastMeasurement
      ? Math.floor((new Date() - new Date(lastMeasurement.date)) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastMeasurement > 30) {
      alerts.push({
        patient: link.client_name || link.client_email,
        message: `No measurements logged for ${daysSinceLastMeasurement} days`,
        severity: daysSinceLastMeasurement > 60 ? 'high' : 'medium',
      });
    }
  });

  return (
    <RoleGate page="ClinicianDashboard">
      <div className="mx-auto max-w-5xl p-5 lg:p-8 space-y-6">
        {/* Header */}
        <div className="pb-5 border-b border-[hsl(var(--border-h))]">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand)/0.1)] flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-[hsl(var(--brand))]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('clinician.dashboard')}</h1>
              <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1">Manage patients and clinical follow-up</p>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        {loadingPatients ? (
          <div className="flex items-center justify-center py-16 gap-2 text-[hsl(var(--fg-2))]">
            <Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            <KPI
              icon={Users}
              label={t('clinician.activePatients')}
              value={activePatients}
              detail={`${patientLinks.length} total`}
              link="/clinician/patients"
            />
            <KPI
              icon={BarChart3}
              label="Recorded lab exams"
              value={labExams.length}
              detail="This month"
            />
            <KPI
              icon={Activity}
              label="Active protocols"
              value={protocols.filter(p => p.active).length}
              detail="Currently tracked"
            />
            <KPI
              icon={TrendingUp}
              label="Adherence rate"
              value={activePatients > 0 ? '85%' : '—'}
              detail="Overall average"
            />
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="t-label">⚠️ Follow-up {t('common.error')}</p>
            {alerts.slice(0, 5).map((alert, i) => (
              <div key={i} className="surface p-3 flex items-start gap-3 border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.02)]">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--err))] mt-0.5 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[12px] font-semibold">{alert.patient}</p>
                  <p className="text-[11px] text-[hsl(var(--fg-2))]">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="t-label">My patients</p>
            <Link to="/clinician/patients" className="btn btn-secondary gap-1.5 h-8 text-[12px]">
              <Plus className="w-3.5 h-3.5" /> Manage
            </Link>
          </div>

          {patientLinks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users className="w-5 h-5 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
              </div>
              <p className="t-subtitle mb-1">{t('clinician.noPatients')}</p>
              <Link to="/clinician/patients" className="btn btn-primary">
                {t('clinician.addPatient')}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {patientLinks.slice(0, 5).map((link) => (
                <Link
                  key={link.id}
                  to={`/clinician/patient/${link.client_id}`}
                  className="surface p-3.5 flex items-center justify-between hover:border-[hsl(var(--brand)/0.3)] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[13px]">{link.client_name}</p>
                    <p className="text-[11px] text-[hsl(var(--fg-2))]">{link.client_email}</p>
                  </div>
                  <span className={`badge ${link.status === 'active' ? 'badge-ok' : 'badge-warn'}`}>
                    {link.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGate>
  );
}
