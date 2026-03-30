import MobileSheet from '@/components/shared/MobileSheet';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18nContext';

export default function WorkoutGuardSheet({ open, onResume, onEnd }) {
  const { t } = useI18n();

  return (
    <MobileSheet
      open={open}
      onOpenChange={(o) => { if (!o) onResume(); }}
      title={t('workoutExecution.guardSheet.title')}
      description={t('workoutExecution.guardSheet.description')}
    >
      <MobileSheet.Body>
        <div className="space-y-3">
          <Button className="h-12 w-full rounded-[12px]" onClick={onResume}>
            {t('workoutExecution.guardSheet.resume')}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-[12px] text-[hsl(var(--err))] border-[hsl(var(--err)/0.3)] hover:bg-[hsl(var(--err)/0.05)]"
            onClick={onEnd}
          >
            {t('workoutExecution.guardSheet.end')}
          </Button>
        </div>
      </MobileSheet.Body>
    </MobileSheet>
  );
}
