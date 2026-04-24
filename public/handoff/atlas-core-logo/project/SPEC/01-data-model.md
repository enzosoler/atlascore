# 01 · Data Model

**What this is:** the entities the app reads and writes. Written as
TypeScript-flavored pseudocode; a real build should lift these into
Zod/Prisma/Drizzle schemas with proper validators.

**Conventions**
- `Id<T>` = branded string UUID
- `ISO` = ISO-8601 timestamp string
- `Date` = `YYYY-MM-DD` string (timezone-local)
- fields suffixed `?` are nullable
- `@owner` comment marks who the source-of-truth is (device vs server)

---

## Identity

```ts
type User = {
  id: Id<User>;
  email: string;
  handle: string;             // unique, lowercase, public on S33/S76
  displayName: string;
  avatarUrl?: string;
  createdAt: ISO;
  tz: string;                 // IANA
  units: "imperial" | "metric";
  // @owner: server
};

type Profile = {              // biometric baseline — S7
  userId: Id<User>;
  sex: "male" | "female" | "other";
  dob: Date;                  // derives age
  heightCm: number;
  goal: "lose" | "recomp" | "maintain" | "build";   // S8
  activityLevel: 1 | 2 | 3 | 4 | 5;                 // S9
  trainingStyle?: "powerlifting" | "hypertrophy" | "hybrid" | "athletic"; // S58
  trainingFrequency?: number; // 1–7, S58
  habits: HabitKey[];         // ≥3, S59
  constraints?: {
    injuries: string[];
    avoidances: string[];
    notes?: string;
  };                          // S60
  // @owner: server
};

type HabitKey = "sleep_7h" | "hydration" | "steps_8k" | "protein_target"
              | "no_alcohol" | "mindfulness";

type Entitlements = {
  plan: "free" | "pro_monthly" | "pro_annual" | "sponsored";
  trialEndsAt?: ISO;
  features: {
    coach: boolean;
    labs: boolean;
    protocols: boolean;       // toggles 6th tab (S43)
    crew: boolean;
  };
  sponsorId?: Id<Sponsor>;    // S75
  // @owner: server
};
```

## Training

```ts
type Program = {              // S24/S25/S80/S81
  id: Id<Program>;
  name: string;               // "5/3/1 BBB"
  weeks: number;              // block length
  daysPerWeek: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  goalMatch: Profile["goal"][];
  progression: ProgressionModel;
  schedule: ProgramDay[];     // cycle of N days
};

type ProgramDay = {
  dayIndex: number;
  name: string;               // "Bench + Accessories"
  lifts: ProgramLift[];
};

type ProgramLift = {
  exerciseId: Id<Exercise>;
  sets: number;
  reps: string;               // "5" or "3,3,3,3+" or "8-12"
  intensity?: { pct1rm?: number; rpe?: number };
};

type Exercise = {             // S27
  id: Id<Exercise>;
  name: string;
  pattern: "squat" | "hinge" | "push" | "pull" | "carry" | "lunge" | "core" | "accessory";
  siblings: Id<Exercise>[];   // same-pattern swaps
  cues: string[];
  // @owner: server (global catalog)
};

type PlannedSession = {       // calendar entries, S26
  id: Id<PlannedSession>;
  userId: Id<User>;
  programId?: Id<Program>;
  date: Date;
  status: "planned" | "completed" | "skipped" | "rescheduled";
  lifts: ProgramLift[];       // frozen at schedule time
};

type LoggedSession = {        // S3 active, S55 read-only
  id: Id<LoggedSession>;
  userId: Id<User>;
  plannedId?: Id<PlannedSession>;
  startedAt: ISO;
  endedAt?: ISO;
  locationHint?: string;
  sets: Set[];
  perceivedExertion?: number; // 1–10
  notes?: string;
  // @owner: device until endedAt, then server
};

type Set = {
  id: Id<Set>;
  exerciseId: Id<Exercise>;
  orderInSession: number;
  reps: number;
  weight: number;             // in user's units
  rpe?: number;               // 1–10
  restSeconds?: number;       // auto from timer
  isWarmup: boolean;
  failed: boolean;
  isPR?: PRKind;              // computed at write-time, stamped on row
};

type PRKind = "1rm" | "e1rm" | "volume" | "reps_at_weight";

type PR = {                   // S20/S95 — derived but persisted for cheap reads
  id: Id<PR>;
  userId: Id<User>;
  exerciseId: Id<Exercise>;
  kind: PRKind;
  value: number;              // lbs for weight, reps for reps
  setId: Id<Set>;
  occurredAt: ISO;
  previousValue?: number;
};
```

## Nutrition

```ts
type NutritionTargets = {     // S52, derived from Profile but editable
  userId: Id<User>;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: "derived" | "user" | "coach";
  updatedAt: ISO;
};

type Food = {                 // catalog (global) — S98 search
  id: Id<Food>;
  name: string;
  brand?: string;
  barcode?: string;           // S32
  servingSizeG: number;
  macrosPer100g: Macros;
  verified: boolean;
  // @owner: server
};

type Macros = { kcal: number; proteinG: number; carbsG: number; fatG: number };

type MealLog = {              // S51 rows, S38 detail
  id: Id<MealLog>;
  userId: Id<User>;
  date: Date;
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  loggedAt: ISO;
  items: MealItem[];
  source: "manual" | "barcode" | "photo" | "voice" | "recipe";
  confidence?: number;        // 0–1 for non-manual sources
  // @owner: device until confirmed, server after
};

type MealItem = {
  foodId?: Id<Food>;
  recipeId?: Id<Recipe>;
  label: string;              // denormalized
  grams: number;
  macros: Macros;             // cached
};

type Recipe = {               // S39, S82, S99
  id: Id<Recipe>;
  userId: Id<User>;
  name: string;
  items: MealItem[];
  servings: number;
  isTemplate: boolean;        // appears in S99 meal plans
};

type WaterLog = {             // S53
  id: Id<WaterLog>;
  userId: Id<User>;
  date: Date;
  entries: { loggedAt: ISO; ml: number }[];
};
```

## Body

```ts
type Weight = {               // S6, S101
  id: Id<Weight>;
  userId: Id<User>;
  date: Date;
  value: number;              // in user's units
  source: "manual" | "scale" | "healthkit";
};

type Measurement = {          // S17
  id: Id<Measurement>;
  userId: Id<User>;
  date: Date;
  site: "waist" | "hip" | "chest" | "arm_l" | "arm_r" | "thigh_l" | "thigh_r" | "neck";
  valueCm: number;
};

type Composition = {          // S14, S56
  userId: Id<User>;
  date: Date;
  bodyFatPct?: number;
  leanMassKg?: number;
  source: "dexa" | "bia" | "navy" | "estimate";
};

type ProgressPhoto = {        // S18, S107
  id: Id<ProgressPhoto>;
  userId: Id<User>;
  date: Date;
  angle: "front" | "side" | "back";
  localUri: string;           // @owner: device by default
  serverUri?: string;         // only if user opts in
  onDevice: boolean;
};

type BodyCheckin = {          // S100
  id: Id<BodyCheckin>;
  userId: Id<User>;
  date: Date;
  answers: {
    sleep?: "poor" | "ok" | "great";
    soreness?: "none" | "mild" | "high";
    energy?: "low" | "ok" | "high";
    stress?: "low" | "ok" | "high";
  };
};
```

## Biology (labs)

```ts
type LabPanel = {             // S15
  id: Id<LabPanel>;
  userId: Id<User>;
  drawnOn: Date;
  source: "upload" | "photo" | "requested";
  provider?: string;
  markers: LabMarker[];
  uploadedAt: ISO;
};

type LabMarker = {            // S16, S78
  id: Id<LabMarker>;
  panelId: Id<LabPanel>;
  code: string;               // e.g. "apoB"
  name: string;
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
  optimalLow?: number;
  optimalHigh?: number;
  flag: "optimal" | "low" | "elevated" | "high";
  note?: string;
};
```

## Sleep & readiness

```ts
type SleepNight = {           // S31
  userId: Id<User>;
  date: Date;                 // the wake date
  score: number;              // 0–100
  totalMin: number;
  stages: {
    deepMin: number; lightMin: number; remMin: number; awakeMin: number;
  };
  hrv?: number;
  rhr?: number;
  respRate?: number;
  tempDelta?: number;
  source: "ring" | "watch" | "healthkit" | "manual";
};

type Readiness = {            // S2 ring, computed daily
  userId: Id<User>;
  date: Date;
  score: number;              // 0–100
  inputs: {
    sleep?: number; hrv?: number; rhr?: number;
    soreness?: number; energy?: number;
  };
  trend7d: number[];          // 7-day strip
};
```

## Protocols

```ts
type Substance = {            // S47 picker catalog
  id: Id<Substance>;
  name: string;
  category: "peptide" | "vitamin" | "mineral" | "amino" | "herb"
          | "nootropic" | "hormone" | "pharma" | "other";
  defaultUnit: "mg" | "mcg" | "iu" | "g" | "ml";
  // @owner: server (global)
};

type Protocol = {             // S43 list, S45 detail, S46 form
  id: Id<Protocol>;
  userId: Id<User>;
  substanceId: Id<Substance>;
  nickname?: string;
  dose: number;
  unit: Substance["defaultUnit"];
  cadence: ProtocolCadence;
  cycle?: { onDays: number; offDays: number };
  startedAt: Date;
  endedAt?: Date;
  status: "active" | "paused" | "ended";
  notes?: string;
};

type ProtocolCadence =
  | { kind: "daily" }
  | { kind: "weekly"; daysOfWeek: (0|1|2|3|4|5|6)[] }
  | { kind: "interval"; everyNDays: number }
  | { kind: "custom"; dates: Date[] };

type DoseLog = {              // S48
  id: Id<DoseLog>;
  protocolId: Id<Protocol>;
  scheduledFor: ISO;
  status: "taken" | "skipped" | "adjusted";
  takenAt?: ISO;
  actualDose?: number;        // when adjusted
  site?: string;              // injection site
  reason?: string;            // when skipped/adjusted
  notes?: string;
};
```

## Coach

```ts
type CoachThread = {          // S12, S97
  id: Id<CoachThread>;
  userId: Id<User>;
  messages: CoachMessage[];
  unreadCount: number;
};

type CoachMessage = {
  id: Id<CoachMessage>;
  role: "user" | "coach";     // "coach" = AI (or human, see source)
  source: "ai" | "human";
  text: string;
  attachments?: CoachCard[];
  createdAt: ISO;
};

type CoachCard =              // inline suggestion cards
  | { kind: "swap_lift"; from: Id<Exercise>; to: Id<Exercise>; reason: string }
  | { kind: "adjust_calories"; delta: number; reason: string }
  | { kind: "rest_day"; reason: string }
  | { kind: "lab_callout"; markerId: Id<LabMarker> };

type Insight = {              // S57 single, S96 digest
  id: Id<Insight>;
  userId: Id<User>;
  kind: "hrv_drift" | "plateau" | "recovery_win" | "adherence" | "pr_window" | "lab_change";
  title: string;
  body: string;
  factors: string[];          // numbered list on S57
  recommendation?: string;
  appliesToPlan?: boolean;    // if true, S57 "apply" writes a plan change
  publishedAt: ISO;
  readAt?: ISO;
};

type Brief = {                // S13 morning brief
  userId: Id<User>;
  date: Date;
  readinessScore: number;
  threeMoves: { label: string; route: string }[];
  signal14d: number[];
};
```

## Social

```ts
type Crew = {                 // S28
  id: Id<Crew>;
  name: string;
  members: Id<User>[];
  isOptIn: true;              // always explicitly joined
};

type CrewStat = {             // per-member weekly roll-up
  crewId: Id<Crew>;
  userId: Id<User>;
  weekStart: Date;
  tonnage: number;
  prsCount: number;
  adherence: number;          // 0–1
};

type Invite = {               // S74
  code: string;               // short, shareable
  fromUserId: Id<User>;
  claimedByUserId?: Id<User>;
  rewards: { inviterDays: number; inviteeDays: number };
};
```

## Platform / billing / integrations

```ts
type Subscription = {         // S105
  userId: Id<User>;
  stripeSubId?: string;
  status: "trialing" | "active" | "past_due" | "canceled";
  currentPeriodEnd: ISO;
  cancelAtPeriodEnd: boolean;
  plan: Entitlements["plan"];
};

type PaymentMethod = {        // S40
  last4: string;
  brand: string;
  expMonth: number; expYear: number;
};

type Integration = {          // S64
  userId: Id<User>;
  provider: "healthkit" | "whoop" | "oura" | "garmin"
          | "apple_watch" | "fitbit" | "scale" | "cgm";
  status: "connected" | "error" | "disconnected";
  lastSyncAt?: ISO;
  scopes: string[];           // which data categories user authorized
};

type NotificationPref = {     // S22
  userId: Id<User>;
  morningBrief: boolean;
  prWindow: boolean;
  fuelNudges: boolean;
  labResults: boolean;
  sleepSummary: boolean;
  crewActivity: boolean;
  quietHours?: { start: string; end: string };  // "22:00"–"06:00"
};

type Session = {              // auth session
  id: Id<Session>;
  userId: Id<User>;
  createdAt: ISO;
  expiresAt: ISO;
  deviceName: string;
  lastSeenAt: ISO;
};

type MagicCode = {            // S87/S88
  email: string;
  codeHash: string;           // 6-digit hashed
  expiresAt: ISO;             // 10 min
  attempts: number;           // 5 max
};
```

## Coach-side (S68–S71, coach web app)

```ts
type CoachAssignment = {
  coachId: Id<User>;          // staff user
  athleteId: Id<User>;
  since: Date;
};

type CoachFlag = {            // S68 flag column
  athleteId: Id<User>;
  kind: "churn_risk" | "pr_window" | "labs_flagged" | "plateau" | "missed_3d";
  severity: 1 | 2 | 3;
  raisedAt: ISO;
  acknowledgedAt?: ISO;
};

type Intervention = {         // S71 output
  id: Id<Intervention>;
  coachId: Id<User>;
  athleteId: Id<User>;
  triggers: string[];         // "HRV drift 14d", "volume -22%"
  change: {
    kind: "plan_adjust" | "rest_day" | "deload" | "nutrition_shift" | "note";
    scope: "this_week" | "next_block" | "one_off";
    details: string;
  };
  message: { tone: "check_in" | "directive" | "celebrate"; body: string };
  sentAt?: ISO;
};
```

---

## Key derived values (compute, don't store raw)

| Value | Formula / source | Surfaces on |
|---|---|---|
| Age | today − `Profile.dob` | internal |
| BMR | Mifflin-St Jeor from Profile | S10, S52 |
| TDEE | BMR × activity multiplier | S10, S52 |
| Default macros | from goal + TDEE | S10, S52 |
| e1RM | Epley: `w × (1 + r/30)` | S55, S20 |
| Today's readiness | weighted HRV/RHR/sleep/soreness | S2, S13 |
| Today's doses due | Protocol.cadence → ISO[] | S43, S50 |
| Adherence % | dosesTaken / dosesScheduled (rolling 30d) | S43, S45, S94 |
| PR | set with max(kind-value) for exerciseId | S20, S95 |

## Privacy classifications (drives server-sync opt-in)

| Class | Examples | Default |
|---|---|---|
| **device-only** | progress photos, raw check-in notes | stay on device |
| **opt-in sync** | weight, measurements, labs, protocols | ask at S11, individually toggleable in S64 |
| **always sync** | training logs, nutrition logs, PR rows | needed for coach + crew |
| **public** | handle, displayName, PRs (if user chose) | shown on S33/S76 |
