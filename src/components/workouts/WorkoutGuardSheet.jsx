import MobileSheet from '@/components/shared/MobileSheet';
import { Button } from '@/components/ui/button';

export default function WorkoutGuardSheet({ open, onResume, onEnd }) {
  return (
    <MobileSheet
      open={open}
      onOpenChange={(o) => { if (!o) onResume(); }}
      title="Workout in progress"
      description="Your session is still active and all sets are saved."
    >
      <MobileSheet.Body>
        <div className="space-y-3">
          <Button className="h-12 w-full rounded-[12px]" onClick={onResume}>
            Resume Workout
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-[12px] text-[hsl(var(--err))] border-[hsl(var(--err)/0.3)] hover:bg-[hsl(var(--err)/0.05)]"
            onClick={onEnd}
          >
            End Session
          </Button>
        </div>
      </MobileSheet.Body>
    </MobileSheet>
  );
}
