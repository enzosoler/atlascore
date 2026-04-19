import React, { useState } from 'react';
import { AppShell, DetailShell, FullScreenShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, Badge, Input, SectionHeader, EmptyState, LockedState, PermissionRequest } from '../../ui';
import { FoodSearchPanel, MacroTargetsExplainer, PhotoScanConfirm, FoodRow } from '../../modules';
import { mockMeals } from '../../lib/mock-data';

const allFoods = mockMeals.flatMap((m) => m.items);

export function FoodSearch() {
  const [q, setQ] = useState('');
  const results = q ? allFoods.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <FullScreenShell
      topChrome={<PageHeader title="Add food" back={() => {}} />}
    >
      <FoodSearchPanel query={q} onQueryChange={setQ} recents={allFoods.slice(0, 4)} results={results} onPick={() => {}} />
    </FullScreenShell>
  );
}

export function FoodDetail() {
  return (
    <DetailShell title="Grilled chicken bowl" back={() => {}} stickyFooter={[<Button intent="primary" size="lg" block key="s">Save to lunch</Button>]}>
      <Card>
        <CardBody>
          <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Per serving</p>
          <p className="mt-2 text-rd-metric-xl text-rd-fg rd-tnum">640 <span className="text-[14px] font-normal text-rd-fg-muted">kcal</span></p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[['Protein','62','g'],['Carbs','70','g'],['Fat','14','g']].map(([l, v, u]) => (
              <div key={l}>
                <p className="text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{l}</p>
                <p className="mt-0.5 text-rd-metric-md text-rd-fg rd-tnum">{v}<span className="text-[12px] text-rd-fg-muted"> {u}</span></p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      <div className="mt-4 space-y-3">
        <Input label="Serving size" defaultValue="1 bowl" />
        <Input label="Number of servings" type="number" defaultValue="1" />
      </div>
    </DetailShell>
  );
}

export function MacroTargets() {
  return (
    <DetailShell title="Your targets" back={() => {}}>
      <MacroTargetsExplainer bmr={1740} tdee={2700} goalDelta={-250} proteinRule="185 g/day" result={2460} />
      <p className="mt-4 text-[12px] text-rd-fg-muted">
        We recalculate every Sunday using your weekly weight trend. Numbers shift slowly — that\'s on purpose.
      </p>
    </DetailShell>
  );
}

export function MealPlan({ locked = false }) {
  return (
    <AppShell current="nutrition" topBar={<PageHeader title="Meal plan" back={() => {}} />}>
      {locked
        ? <LockedState title="Meal plans are a Pro feature" description="Unlock personalized meal plans adapted weekly." onUpgrade={() => {}} />
        : (
          <div className="space-y-3">
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d) => (
              <Card key={d}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <p className="text-rd-h4 text-rd-fg">{d}</p>
                    <Badge tone="neutral" size="xs">~2,460 kcal</Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-rd-fg-muted">3 meals · 2 snacks · High protein</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
    </AppShell>
  );
}

export function BarcodeScan() {
  const [granted, setGranted] = useState(false);
  if (!granted) {
    return (
      <FullScreenShell>
        <PermissionRequest
          title="Scan barcodes with your camera"
          description="Point your camera at a barcode to auto-fill nutrition facts. We never store camera imagery."
          onGrant={() => setGranted(true)}
          onDecline={() => {}}
        />
      </FullScreenShell>
    );
  }
  return (
    <FullScreenShell topChrome={<PageHeader title="Scan barcode" back={() => {}} />}>
      <div className="relative h-[calc(100vh-56px)] bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[70%] aspect-[2/1] rounded-rd-card border-2 border-rd-accent/60" />
        </div>
        <p className="absolute bottom-8 inset-x-0 text-center text-white/80 text-[13px]">Align the barcode inside the frame</p>
      </div>
    </FullScreenShell>
  );
}

export function PhotoScanConfirmScreen() {
  const items = [
    { id: 'i1', name: 'Grilled chicken',  portion: '150 g',   kcal: 247, confidence: 0.94 },
    { id: 'i2', name: 'Brown rice',       portion: '1 cup',   kcal: 216, confidence: 0.83 },
    { id: 'i3', name: 'Mixed vegetables', portion: '1 cup',   kcal: 90,  confidence: 0.71 },
    { id: 'i4', name: 'Olive oil dressing', portion: '1 tbsp', kcal: 119, confidence: 0.52 },
  ];
  const overall = items.reduce((a, i) => a + i.confidence, 0) / items.length;
  return (
    <DetailShell
      title="Confirm meal"
      back={() => {}}
      stickyFooter={[
        <Button intent="secondary" size="lg" key="r">Retake</Button>,
        <Button intent="primary"   size="lg" key="s" block>Save to lunch</Button>,
      ]}
    >
      <PhotoScanConfirm
        image={null}
        items={items}
        overallConfidence={overall}
        onConfirm={() => {}}
        onEditItem={() => {}}
        onRetake={() => {}}
      />
    </DetailShell>
  );
}

export function NutritionHistory() {
  return (
    <AppShell current="nutrition" topBar={<PageHeader title="History" back={() => {}} />}>
      <EmptyState
        icon={<span>📅</span>}
        title="A week from today"
        description="We\'ll build your weekly trend as you log. Logging 4+ days a week gives the most accurate targets."
        action={<Button intent="primary" size="sm">Log today</Button>}
      />
    </AppShell>
  );
}

export function RecipeLibrary() {
  return (
    <AppShell current="nutrition" topBar={<PageHeader title="Recipes" back={() => {}} />}>
      <div className="grid gap-3 md:grid-cols-2">
        {[1,2,3,4].map((i) => (
          <Card key={i} interactive>
            <div className="aspect-[4/3] w-full bg-rd-surface-2" />
            <CardBody>
              <p className="text-rd-h4 text-rd-fg">Recipe {i}</p>
              <p className="mt-0.5 text-[12px] text-rd-fg-muted">15 min · 420 kcal · 42P / 38C / 10F</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

export function RecipeDetail() {
  return (
    <DetailShell title="Protein oat bowl" back={() => {}}>
      <div className="aspect-[16/10] w-full rounded-rd-card bg-rd-surface-2" />
      <Card className="mt-4">
        <CardBody>
          <p className="text-rd-h3 text-rd-fg">Protein oat bowl</p>
          <p className="mt-1 text-[13px] text-rd-fg-muted">15 min · 420 kcal · Serves 1</p>
          <SectionHeader className="mt-6" title="Ingredients" />
          <ul className="space-y-2 text-[14px] text-rd-fg-secondary">
            {['80 g oats','1 scoop whey','200 ml milk','80 g blueberries','1 tbsp almond butter'].map((x) => <li key={x}>· {x}</li>)}
          </ul>
          <SectionHeader className="mt-6" title="Directions" />
          <ol className="space-y-2 text-[14px] text-rd-fg-secondary list-decimal pl-5">
            <li>Combine oats, milk, and blueberries in a jar.</li>
            <li>Refrigerate overnight.</li>
            <li>Stir in whey and top with almond butter.</li>
          </ol>
        </CardBody>
      </Card>
    </DetailShell>
  );
}

export function MyDiet() {
  return (
    <AppShell current="nutrition" topBar={<PageHeader title="My diet" />}>
      <Card>
        <CardBody>
          <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Current approach</p>
          <p className="mt-1 text-rd-h3 text-rd-fg">High-protein cut</p>
          <p className="mt-2 text-[13px] text-rd-fg-muted">Based on your goal to lose fat while preserving strength.</p>
        </CardBody>
      </Card>
    </AppShell>
  );
}

export function PrescribedDiet() {
  return (
    <DetailShell title="Prescribed diet" back={() => {}}>
      <Card><CardBody>
        <p className="text-rd-h4 text-rd-fg">From Coach Maria</p>
        <p className="mt-1 text-[13px] text-rd-fg-muted">Updated 3 days ago</p>
      </CardBody></Card>
    </DetailShell>
  );
}
