import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  History,
  Info,
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AppContainer,
  Card,
  Section,
} from '@/components/shared/AppContainer';
import {
  EmptyState,
  PageShell,
  PrimaryButton,
  SecondaryButton,
} from '@/components/shared/StablePage';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';
import * as labService from '@/services/labExamService';

// --- Components ---

const StatusBadge = ({ status, t }) => {
  const configs = {
    normal: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: t('pages.lab_exams.status.normal') },
    low: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: t('pages.lab_exams.status.low') },
    high: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', label: t('pages.lab_exams.status.high') },
    critical: { color: 'bg-red-500/10 text-red-600 border-red-500/20', label: t('pages.lab_exams.status.critical') },
  };

  const config = configs[status] || configs.normal;

  return (
    <Badge variant="outline" className={cn('font-medium capitalize', config.color)}>
      {config.label}
    </Badge>
  );
};

const ExamRow = ({ exam, onClick, onDelete, t }) => {
  const abnormalCount = exam.markers?.filter(m => m.status !== 'normal').length || 0;

  return (
    <div
      onClick={() => onClick(exam)}
      className="group flex items-center justify-between p-4 hover:bg-[hsl(var(--fill))] transition-colors cursor-pointer border-b border-[hsl(var(--separator))] last:border-0"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-2 h-2 rounded-full",
          abnormalCount > 0 ? "bg-orange-500" : "bg-green-500"
        )} />
        <div>
          <h4 className="font-medium text-[hsl(var(--fg))]">{exam.panel_name}</h4>
          <p className="text-sm text-[hsl(var(--fg-2))]">{new Date(exam.exam_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-[hsl(var(--fg))]">{exam.markers?.length || 0} markers</p>
          {abnormalCount > 0 && (
            <p className="text-xs text-orange-600">{abnormalCount} abnormal</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(exam.id);
          }}
          className="p-2 text-[hsl(var(--fg-3))] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
        <ChevronRight size={16} className="text-[hsl(var(--fg-3))]" />
      </div>
    </div>
  );
};

const MarkerTable = ({ markers, t }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(var(--separator))] bg-[hsl(var(--card))]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[hsl(var(--separator))] text-[hsl(var(--fg-2))] font-medium">
          <tr>
            <th className="px-4 py-3">Marker</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Ref. Range</th>
            <th className="px-4 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--separator))]">
          {markers.map((marker, idx) => (
            <tr key={idx} className="hover:bg-[hsl(var(--fill))] transition-colors">
              <td className="px-4 py-3 font-medium text-[hsl(var(--fg))]">{marker.name}</td>
              <td className="px-4 py-3 text-[hsl(var(--fg-2))]">
                {marker.value} <span className="text-[hsl(var(--fg-3))] text-xs">{marker.unit}</span>
              </td>
              <td className="px-4 py-3 text-[hsl(var(--fg-3))] font-mono text-xs">{marker.ref_range || '-'}</td>
              <td className="px-4 py-3 text-right">
                <StatusBadge status={marker.status} t={t} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Page ---

export default function LabExams() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedExam, setSelectedExam] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Queries
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['lab_exams', user?.id],
    queryFn: () => labService.listExams(user?.id),
    enabled: !!user?.id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => labService.createExam(user?.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['lab_exams']);
      setIsAddDialogOpen(false);
      toast.success(t('pages.lab_exams.notifications.save_success'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => labService.deleteExam(user?.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lab_exams']);
      toast.success(t('pages.lab_exams.notifications.delete_success'));
    },
  });

  // Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const data = await labService.extractExamFromFile(file);
      // Pre-fill form or show preview
      // For now, let's just create it directly for the demo feel
      await createMutation.mutateAsync({
        panel_name: data.panel_name || file.name.split('.')[0],
        exam_date: data.exam_date || new Date().toISOString().split('T')[0],
        markers: data.markers || [],
      });
    } catch (err) {
      toast.error("Failed to extract data from PDF");
    } finally {
      setIsExtracting(false);
    }
  };

  const stats = useMemo(() => {
    const total = exams.length;
    const abnormal = exams.reduce((acc, exam) => {
      const hasAbnormal = exam.markers?.some(m => m.status !== 'normal');
      return acc + (hasAbnormal ? 1 : 0);
    }, 0);
    return { total, abnormal };
  }, [exams]);

  return (
    <PageShell title={t('pages.lab_exams.title')}>
      <AppContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Stats & List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 flex flex-col justify-center items-center text-center">
                <p className="text-xs font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider mb-1">Total Exams</p>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">{stats.total}</p>
              </Card>
              <Card className="p-4 flex flex-col justify-center items-center text-center">
                <p className="text-xs font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider mb-1">Abnormal</p>
                <p className="text-2xl font-bold text-orange-600">{stats.abnormal}</p>
              </Card>
              <Card className="p-4 flex flex-col justify-center items-center text-center">
                <p className="text-xs font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider mb-1">Latest</p>
                <p className="text-sm font-bold text-[hsl(var(--fg))]">
                  {exams[0] ? new Date(exams[0].exam_date).toLocaleDateString() : '-'}
                </p>
              </Card>
              <div className="flex items-center justify-center">
                <PrimaryButton
                  onClick={() => setIsAddDialogOpen(true)}
                  className="w-full h-full py-4"
                >
                  <Plus size={20} className="mr-2" />
                  {t('pages.lab_exams.add_panel')}
                </PrimaryButton>
              </div>
            </div>

            {/* Exam List */}
            <Section title={t('pages.lab_exams.history')}>
              <Card className="overflow-hidden divide-y divide-[hsl(var(--separator))]">
                {isLoading ? (
                  <div className="p-8 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : exams.length > 0 ? (
                  exams.map(exam => (
                    <ExamRow
                      key={exam.id}
                      exam={exam}
                      onClick={setSelectedExam}
                      onDelete={deleteMutation.mutate}
                      t={t}
                    />
                  ))
                ) : (
                  <EmptyState
                    title={t('pages.lab_exams.title')}
                    description={t('pages.lab_exams.empty_state')}
                    icon={FileText}
                  />
                )}
              </Card>
            </Section>
          </div>

          {/* Right Column: Detail View */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {selectedExam ? (
                <motion.div
                  key={selectedExam.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[hsl(var(--fg))]">{selectedExam.panel_name}</h3>
                    <button
                      onClick={() => setSelectedExam(null)}
                      className="p-2 text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--fg-2))]">
                    <Calendar size={14} />
                    {new Date(selectedExam.exam_date).toLocaleDateString()}
                  </div>

                  <Section title="Markers">
                    <div className="space-y-3">
                      {selectedExam.markers?.map((marker, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--fill))] border border-[hsl(var(--separator))]">
                          <div>
                            <p className="text-sm font-medium text-[hsl(var(--fg))]">{marker.name}</p>
                            <p className="text-xs text-[hsl(var(--fg-2))]">{marker.ref_range || 'No ref range'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[hsl(var(--fg))]">
                              {marker.value} <span className="text-[10px] font-normal text-[hsl(var(--fg-2))]">{marker.unit}</span>
                            </p>
                            <p className={cn(
                              "text-[10px] font-bold uppercase tracking-tighter",
                              marker.status === 'normal' ? "text-green-600" : "text-orange-600"
                            )}>
                              {marker.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {selectedExam.notes && (
                    <Section title="Notes">
                      <p className="text-sm text-[hsl(var(--fg-2))] bg-[hsl(var(--fill))] p-4 rounded-xl border border-[hsl(var(--separator))] italic">
                        "{selectedExam.notes}"
                      </p>
                    </Section>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[hsl(var(--separator))] rounded-3xl">
                  <div className="w-12 h-12 rounded-full bg-[hsl(var(--fill))] flex items-center justify-center mb-4">
                    <Info size={24} className="text-[hsl(var(--fg-3))]" />
                  </div>
                  <p className="text-sm text-[hsl(var(--fg-2))]">Select an exam to view details and markers</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AppContainer>

      {/* Add Exam Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[hsl(var(--bg))] border-[hsl(var(--separator))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--fg))]">{t('pages.lab_exams.add_panel')}</DialogTitle>
            <DialogDescription className="text-[hsl(var(--fg-2))]">
              Upload a PDF or enter details manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Upload Area */}
            <div className="relative group">
              <input
                type="file"
                onChange={handleFileUpload}
                accept="application/pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isExtracting}
              />
              <div className={cn(
                "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all",
                isExtracting ? "border-[hsl(var(--separator))] bg-[hsl(var(--fill))]" : "border-[hsl(var(--separator))] group-hover:border-[hsl(var(--separator-strong))] group-hover:bg-[hsl(var(--fill))]"
              )}>
                {isExtracting ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[hsl(var(--fg-2))] animate-spin mb-4" />
                    <p className="text-sm font-medium text-[hsl(var(--fg))]">Extracting data...</p>
                    <p className="text-xs text-[hsl(var(--fg-2))] mt-1">This takes a few seconds</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--fill))] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-[hsl(var(--fg-2))]" />
                    </div>
                    <p className="text-sm font-medium text-[hsl(var(--fg))]">Import PDF or Image</p>
                    <p className="text-xs text-[hsl(var(--fg-2))] mt-1">We'll extract markers automatically</p>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[hsl(var(--separator))]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[hsl(var(--bg))] px-2 text-[hsl(var(--fg-3))]">Or manual entry</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider">Panel Name</label>
                <Input placeholder="e.g. CBC, Lipid Panel" className="bg-[hsl(var(--fill))] border-[hsl(var(--separator))] text-[hsl(var(--fg))]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider">Date</label>
                <Input type="date" className="bg-[hsl(var(--fill))] border-[hsl(var(--separator))] text-[hsl(var(--fg))]" />
              </div>
            </div>

            <PrimaryButton className="w-full" disabled={isExtracting}>
              Save Manual Entry
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
