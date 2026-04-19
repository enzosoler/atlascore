/**
 * Overlays — dialogs, sheets, wizards, full-screen modals.
 * All take { open, onClose } to match Sheet/Dialog/FullScreenModal API.
 */
import React, { useState } from 'react';
export { ResetAccountDialog } from './ResetAccountDialog';
import { Sheet, Dialog, FullScreenModal, Button, Input, Badge, Switch, SearchInput, ListRow, Chip } from '../ui';
import { QuickAddSheet as NutritionQuickAdd, FoodSearchPanel, PhotoScanConfirm, SaveOfferCard, ShareCardPreview, CreatorCodeEntry, BodyCheckIn as BodyCheckInCard, CoachMessage, CoachComposer } from '../modules';
import { mockMeals, mockPlans, mockCoachMessages } from '../lib/mock-data';

// ── Auth modal (contextual sign-in) ─────────────────────────────────────────
export function AuthModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} title="Sign in to continue" description="Your data stays yours.">
      <div className="space-y-3">
        <Input label="Email" type="email" size="lg" />
        <Input label="Password" type="password" size="lg" />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button intent="ghost" onClick={onClose}>Cancel</Button>
        <Button intent="primary">Sign in</Button>
      </div>
    </Dialog>
  );
}

// ── Quick log sheet ─────────────────────────────────────────────────────────
export function QuickLogSheet({ open, onClose, onPickMode }) {
  return <NutritionQuickAdd open={open} onClose={onClose} onPickMode={onPickMode} />;
}

// ── Meal edit ───────────────────────────────────────────────────────────────
export function MealEditSheet({ open, onClose, item }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" title="Edit food" footer={
      <div className="flex gap-2"><Button intent="ghost" onClick={onClose} block>Cancel</Button><Button intent="primary" block>Save</Button></div>
    }>
      <div className="space-y-3">
        <Input label="Food"   defaultValue={item?.name ?? 'Grilled chicken'} />
        <Input label="Portion" defaultValue={item?.portion ?? '150 g'} />
        <div className="grid grid-cols-4 gap-2">
          <Input label="kcal" defaultValue={item?.kcal ?? 247} />
          <Input label="P"    defaultValue={item?.protein ?? 48} />
          <Input label="C"    defaultValue={item?.carbs ?? 0} />
          <Input label="F"    defaultValue={item?.fat ?? 5} />
        </div>
      </div>
    </Sheet>
  );
}

// ── Portion editor ──────────────────────────────────────────────────────────
export function PortionEditorSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" title="Adjust portion" size="sm">
      <div className="space-y-3">
        <Input label="Amount" type="number" defaultValue="150" trailing="g" />
      </div>
    </Sheet>
  );
}

// ── Food search ─────────────────────────────────────────────────────────────
export function FoodSearchSheet({ open, onClose }) {
  const [q, setQ] = useState('');
  const pool = mockMeals.flatMap((m) => m.items);
  const results = q ? pool.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="full" title="Add food">
      <FoodSearchPanel query={q} onQueryChange={setQ} recents={pool.slice(0, 5)} results={results} onPick={() => onClose?.()} />
    </Sheet>
  );
}

// ── Photo scan (native capture) ─────────────────────────────────────────────
export function PhotoScanSheet({ open, onClose }) {
  const [stage, setStage] = useState('capture'); // capture | review
  return (
    <FullScreenModal open={open} onClose={onClose} title="Scan meal">
      {stage === 'capture' ? (
        <div className="relative h-[calc(100vh-56px)] bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[70%] aspect-square rounded-rd-card border-2 border-rd-accent/60" />
          </div>
          <div className="absolute bottom-8 inset-x-0 flex justify-center">
            <button onClick={() => setStage('review')} aria-label="Capture" className="h-16 w-16 rounded-full border-4 border-white/80 bg-white/20 active:bg-white/40" />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[560px] p-4 pb-24">
          <PhotoScanConfirm
            image={null}
            items={[
              { id: '1', name: 'Grilled chicken',  portion: '150 g', kcal: 247, confidence: 0.94 },
              { id: '2', name: 'Brown rice',       portion: '1 cup', kcal: 216, confidence: 0.83 },
            ]}
            overallConfidence={0.88}
            onConfirm={onClose}
            onRetake={() => setStage('capture')}
          />
        </div>
      )}
    </FullScreenModal>
  );
}

// ── Barcode scan ────────────────────────────────────────────────────────────
export function BarcodeScanSheet({ open, onClose }) {
  return (
    <FullScreenModal open={open} onClose={onClose} title="Scan barcode">
      <div className="relative h-[calc(100vh-56px)] bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[70%] aspect-[2/1] rounded-rd-card border-2 border-rd-accent/60" />
        </div>
      </div>
    </FullScreenModal>
  );
}

// ── Quick workout ───────────────────────────────────────────────────────────
export function QuickWorkoutModal({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="md" title="Quick workout"
      footer={<Button intent="primary" size="lg" block>Start now</Button>}>
      <p className="text-[14px] text-rd-fg-secondary">Pick a quick session based on what you have:</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {['Full body 30 min','Push 25 min','Pull 25 min','Legs 35 min'].map((x) => (
          <button key={x} className="rounded-rd-card border border-rd-border bg-rd-surface-2 p-3 text-left text-[14px] text-rd-fg hover:border-rd-border-strong">{x}</button>
        ))}
      </div>
    </Sheet>
  );
}

// ── Workout guard (paywall trigger) ─────────────────────────────────────────
export function WorkoutGuardSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="sm" title="Pro feature">
      <p className="text-[14px] text-rd-fg-secondary">This plan is available on Pro. Start a free trial to unlock.</p>
      <div className="mt-4 flex gap-2">
        <Button intent="ghost" onClick={onClose} block>Not now</Button>
        <Button intent="premium" block>Start free trial</Button>
      </div>
    </Sheet>
  );
}

// ── Share workout ───────────────────────────────────────────────────────────
export function ShareWorkoutSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="lg" title="Share workout">
      <ShareCardPreview title="Upper Body — Push" stats={[
        { label: 'Duration', value: '54 min' },
        { label: 'Volume',   value: '7,240 kg' },
        { label: 'PRs',      value: '1' },
      ]} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button intent="primary" size="lg">Share</Button>
        <Button intent="secondary" size="lg">Save image</Button>
      </div>
    </Sheet>
  );
}

// ── Plan builder wizard ─────────────────────────────────────────────────────
export function PlanBuilderWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  return (
    <FullScreenModal open={open} onClose={onClose} title="Plan builder">
      <div className="mx-auto max-w-[560px] p-6">
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Step {step} of 4</p>
        <h2 className="mt-1 text-rd-h2 text-rd-fg">{[
          'How many days a week?',
          'Which split do you prefer?',
          'Equipment available?',
          'Session length?',
        ][step - 1]}</h2>
        <div className="mt-6">
          <Button intent="primary" size="xl" block onClick={() => step < 4 ? setStep(step + 1) : onClose?.()}>
            {step < 4 ? 'Next' : 'Build my plan'}
          </Button>
        </div>
      </div>
    </FullScreenModal>
  );
}

// ── Body check-in ───────────────────────────────────────────────────────────
export function BodyCheckinSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="lg" title="Weekly check-in"
      footer={<Button intent="primary" size="lg" block>Complete</Button>}>
      <p className="text-[14px] text-rd-fg-secondary">Your weekly pulse — weight, photos, and how you\'re feeling.</p>
      <Input label="Weight" type="number" trailing="kg" defaultValue="82.1" className="mt-3" />
    </Sheet>
  );
}

// ── Weekly check-in ─────────────────────────────────────────────────────────
export function WeeklyCheckinModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} title="How was your week?" size="md">
      <div className="flex gap-2">
        {['Great','Good','OK','Off','Rough'].map((w) => (
          <button key={w} className="flex-1 h-12 rounded-rd-control border border-rd-border bg-rd-surface hover:border-rd-border-strong text-[13px]">{w}</button>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button intent="ghost" onClick={onClose}>Skip</Button>
        <Button intent="primary">Save</Button>
      </div>
    </Dialog>
  );
}

// ── Coach chat sheet ────────────────────────────────────────────────────────
export function CoachChatSheet({ open, onClose }) {
  const [input, setInput] = useState('');
  return (
    <Sheet open={open} onClose={onClose} side="right" size="lg" title="Coach">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {mockCoachMessages.map((m) => <CoachMessage key={m.id} message={m} />)}
        </div>
        <div className="-mx-5 -mb-4">
          <CoachComposer value={input} onChange={setInput} onSend={() => setInput('')} suggestions={['Plan my day']} />
        </div>
      </div>
    </Sheet>
  );
}

// ── AI generation wizard ────────────────────────────────────────────────────
export function AIGenerationWizard({ open, onClose, kind = 'meal' }) {
  return (
    <FullScreenModal open={open} onClose={onClose} title={kind === 'meal' ? 'Generate meal' : 'Generate plan'}>
      <div className="mx-auto max-w-[560px] p-6">
        <Input label="What do you want?" placeholder={kind === 'meal' ? 'High-protein dinner under 600 kcal' : '4-day upper/lower plan, 45 min sessions'} size="lg" />
        <Button intent="ai" size="xl" block className="mt-4">Generate</Button>
        <p className="mt-3 text-[12px] text-rd-fg-muted">You'll review and confirm before anything is saved.</p>
      </div>
    </FullScreenModal>
  );
}

// ── Paywall trigger ─────────────────────────────────────────────────────────
export function PaywallTrigger({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="md" title="Unlock Pro">
      <p className="text-[14px] text-rd-fg-secondary">Meal plans, labs, and adaptive training are in Pro. Try free for 7 days.</p>
      <div className="mt-4 flex gap-2">
        <Button intent="ghost" onClick={onClose} block>Not now</Button>
        <Button intent="premium" block>Start trial</Button>
      </div>
    </Sheet>
  );
}

// ── Subscription manager ────────────────────────────────────────────────────
export function SubscriptionManagerSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="right" size="md" title="Manage subscription">
      <div className="space-y-3">
        <Button intent="secondary" size="lg" block>Change plan</Button>
        <Button intent="secondary" size="lg" block>Update payment</Button>
        <Button intent="danger" tone="soft" size="lg" block>Cancel</Button>
      </div>
      <p className="mt-4 text-[12px] text-rd-fg-muted">On iOS, we\'ll deep-link to your subscription settings.</p>
    </Sheet>
  );
}

// ── Invite modal ────────────────────────────────────────────────────────────
export function InviteModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} title="Invite a friend" description="They get 10% off. You get $2/mo when they subscribe.">
      <Input label="Their email" type="email" size="lg" />
      <div className="mt-4 flex justify-end gap-2">
        <Button intent="ghost" onClick={onClose}>Cancel</Button>
        <Button intent="primary">Send invite</Button>
      </div>
    </Dialog>
  );
}

// ── Creator code ────────────────────────────────────────────────────────────
export function CreatorCodeModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} title="Apply creator code">
      <CreatorCodeEntry code="HUBERMAN" onApply={onClose} />
    </Dialog>
  );
}

// ── Generic share flow ──────────────────────────────────────────────────────
export function ShareFlowSheet({ open, onClose, title = 'Share' }) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="md" title={title}>
      <div className="grid grid-cols-4 gap-3">
        {['Messages','Mail','Instagram','More'].map((x) => (
          <button key={x} className="flex flex-col items-center gap-2 py-3">
            <span className="h-10 w-10 rounded-full bg-rd-surface-2" />
            <span className="text-[11px] text-rd-fg-secondary">{x}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

// ── Enhanced (branded) share ────────────────────────────────────────────────
export function EnhancedShareModal({ open, onClose }) {
  return (
    <FullScreenModal open={open} onClose={onClose} title="Share">
      <div className="mx-auto max-w-[420px] p-6">
        <ShareCardPreview title="23-day streak" stats={[
          { label: 'Streak', value: '23' }, { label: 'Workouts', value: '14' }, { label: 'Weight', value: '-1.2 kg' },
        ]} />
      </div>
    </FullScreenModal>
  );
}

// ── Image cropper ───────────────────────────────────────────────────────────
export function ImageCropperModal({ open, onClose }) {
  return (
    <FullScreenModal open={open} onClose={onClose} title="Adjust photo">
      <div className="relative h-[calc(100vh-56px)] bg-black flex items-center justify-center">
        <div className="aspect-square w-[80%] max-w-md border-2 border-white/70 bg-rd-surface-2" />
      </div>
    </FullScreenModal>
  );
}

// ── Support widget ──────────────────────────────────────────────────────────
export function SupportWidget({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} side="right" size="md" title="Help">
      <SearchInput placeholder="Search articles..." />
      <div className="mt-3 divide-y divide-rd-border rounded-rd-card border border-rd-border bg-rd-surface">
        {['How does the trial work?','Cancel on iOS','Sync Apple Health','Update macro targets'].map((q) => (
          <ListRow key={q} title={q} trailing={<span className="text-rd-fg-muted">›</span>} onClick={() => {}} />
        ))}
      </div>
    </Sheet>
  );
}

// ── Onboarding tour ─────────────────────────────────────────────────────────
export function OnboardingTourSheet({ open, onClose }) {
  const [step, setStep] = useState(0);
  const stops = [
    { title: 'Today', body: 'Your daily command center. Readiness, tasks, targets — at a glance.' },
    { title: 'Log fast', body: 'Tap the + anywhere to log food, weight, or start a workout.' },
    { title: 'Coach has your back', body: 'Open chat anytime. Coach watches the whole picture.' },
  ];
  const s = stops[step];
  return (
    <Dialog open={open} onClose={onClose} title={s.title}>
      <p className="text-[14px] text-rd-fg-secondary">{s.body}</p>
      <div className="mt-4 flex justify-between">
        <span className="text-[12px] text-rd-fg-muted rd-tnum">{step + 1} / {stops.length}</span>
        <Button intent="primary" size="sm" onClick={() => step < stops.length - 1 ? setStep(step + 1) : onClose?.()}>
          {step < stops.length - 1 ? 'Next' : 'Done'}
        </Button>
      </div>
    </Dialog>
  );
}

// ── Start fresh ─────────────────────────────────────────────────────────────
export function StartFreshModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} title="Reset onboarding?" description="We'll re-run the questions. Your existing logs stay.">
      <div className="flex justify-end gap-2">
        <Button intent="ghost" onClick={onClose}>Cancel</Button>
        <Button intent="danger">Reset</Button>
      </div>
    </Dialog>
  );
}

// ── Unsaved changes ─────────────────────────────────────────────────────────
export function UnsavedChangesDialog({ open, onDiscard, onKeep }) {
  return (
    <Dialog open={open} title="Discard changes?" description="You have unsaved edits.">
      <div className="flex justify-end gap-2">
        <Button intent="ghost" onClick={onKeep}>Keep editing</Button>
        <Button intent="danger" onClick={onDiscard}>Discard</Button>
      </div>
    </Dialog>
  );
}

// ── Confirm destructive ─────────────────────────────────────────────────────
export function ConfirmDestructiveDialog({ open, onClose, onConfirm, title = 'Are you sure?', description }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button intent="ghost" onClick={onClose}>Cancel</Button>
        <Button intent="danger" onClick={onConfirm}>Confirm</Button>
      </div>
    </Dialog>
  );
}

// ── Cancellation save-offer ─────────────────────────────────────────────────
export function CancelSaveOfferModal({ open, onClose, onAccept, onDecline }) {
  return (
    <FullScreenModal open={open} onClose={onClose} title="Before you go">
      <div className="mx-auto max-w-[560px] p-6 space-y-4">
        <SaveOfferCard onAccept={onAccept} onDecline={onDecline} />
        <Button intent="ghost" size="md" block onClick={onDecline}>Continue cancelling</Button>
      </div>
    </FullScreenModal>
  );
}
