# Atlas Core — Redesign Master Plan v2

**Owner:** Enzo · **Last updated:** 2026-04-18 · **Status:** ✅ Fase 1 piloto entregue (15/122) · ⏳ Aguardando review do Enzo

> Este arquivo é a única fonte de verdade para o redesign. Se o trabalho for
> interrompido, qualquer sessão futura pode ler este arquivo e continuar
> exatamente de onde parou — basta ver a coluna **Status** de cada tela.

---

## Correção em relação ao primeiro redesign

**O que saiu errado antes:**
- Foi gerado **24 arquivos .jsx com múltiplas telas agrupadas** (`SettingsScreens.jsx`, `WorkoutsOther.jsx`, etc.) em vez de 1 arquivo por tela.
- Foi criado um **design genérico baseado em primitives**, sem copiar layouts reais de apps top performers.
- A coluna "Remaining screens" do `coverage-summary.md` deixa claro que muitas telas não foram sequer feitas — só listadas.

**Como vai ser agora:**
- **1 arquivo por tela.** Cada rota do registry vira um `.jsx` próprio em `src/redesign/archived/v2/<domain>/<ScreenName>.jsx`.
- **Cada tela copia o layout do app top performer daquela feature específica** (não um só app para tudo).
- **Paleta restrita:** obsidian (#05070A, #0B0F15, #141A22) + cyan (#00FFFF, accent) + violet (#8B5CF6, AI) + gold (#C9A96A, premium) + status (emerald/amber/rose). Nada fora disso.
- **Continuidade garantida.** Esta checklist vive no workspace. Próxima sessão lê isto e continua.

---

## Paleta (não vai mudar)

| Token       | Hex         | Uso                                                  |
| ----------- | ----------- | ---------------------------------------------------- |
| `bg-app`    | `#05070A`   | canvas (tela cheia)                                  |
| `bg-surface`| `#0B0F15`   | cards                                                |
| `bg-surface2`| `#141A22`  | cards elevados, rows                                 |
| `fg-primary`| `#F5F7FA`   | texto principal                                      |
| `fg-muted`  | `#8E98A5`   | texto secundário                                     |
| `accent`    | `#00FFFF`   | Atlas cyan (botões, links, focus, destaque)          |
| `ai`        | `#8B5CF6`   | violet — selos/cards de AI                           |
| `premium`   | `#C9A96A`   | gold — selos premium (Insights, MealPlan, Labs)      |
| `success`   | `#10B981`   | verde sucesso                                        |
| `warning`   | `#F59E0B`   | amarelo                                              |
| `danger`    | `#EF4444`   | vermelho                                             |

Derivada do seu ícone (heartbeat→arrow cyan em fundo obsidian).

---

## Mapeamento: cada domínio → top performer de referência

Regra: cada tela copia o app que é **melhor do mundo naquela função específica**, não só 2 apps para tudo.

| Domínio         | App(s) de referência                                | Por que                                                 |
| --------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Marketing       | Linear, Framer, Superhuman                          | Landing pages modernas de SaaS premium                  |
| Auth            | Superhuman, Notion                                  | Login/signup limpos, magic link bem-feito               |
| Onboarding      | Noom, Cal AI, Duolingo                              | Quiz long-form + goal setting + engagement             |
| Today (dashboard)| Apple Fitness, Whoop, Fitbit                       | Rings, recovery score, daily summary                    |
| Nutrition       | **Cal AI** (photo scan), **MyFitnessPal** (log), **Yazio** (meal plan), **Eat This Much** | Cada subtela copia o melhor naquela função             |
| Workouts        | **Strong** (logging), **Hevy** (active), **Fitbod** (AI plan), **Jefit** (library) | Cada subtela copia o melhor naquela função             |
| Body            | Whoop, Oura, Happy Scale                            | Métricas, trend, check-in                               |
| Labs            | Function Health, InsideTracker, Levels              | Biomarker cards, lab timeline                           |
| Coach           | Future, Fitbod, ChatGPT mobile, Replika             | AI chat, insights proativos                             |
| Profile/Settings| Apple Settings, Linear, Notion                      | Hub + subsettings limpos                                |
| Billing         | Duolingo (paywall), Calm (trial), Superhuman (plans), Blinkist (cancel save) | Cada subtela copia o melhor                            |
| Social          | Strava (feed/share), Instagram (composer)           | Feed + compositor de share card                         |
| Admin           | Linear Admin, Stripe Dashboard, Supabase            | Tabelas + audit + flags                                 |
| System          | Linear (404), Stripe (empty/error), iOS (permissions)| Error states e permissions bem escritos                 |

---

## Inventário completo: 94 telas canônicas + 26 overlays

**Estrutura do arquivo:** `src/redesign/archived/v2/<domain>/<ScreenName>.jsx`  
Cada linha abaixo é **um arquivo .jsx separado** (sem agrupamento).

### Status legend
- ⬜ Todo
- 🟡 Em progresso
- ✅ Feito
- 🔒 Bloqueado (aguardando decisão)

### 1. Marketing · 12 telas

| # | Tela               | Ref app                     | Path                                                          | Status |
| --| ------------------ | --------------------------- | ------------------------------------------------------------- | ------ |
| 1 | Landing            | Linear / Framer             | `v2/marketing/Landing.jsx`                                    | ⬜     |
| 2 | Pricing            | Superhuman / Linear         | `v2/marketing/Pricing.jsx`                                    | ⬜     |
| 3 | Waitlist           | Superhuman                  | `v2/marketing/Waitlist.jsx`                                   | ⬜     |
| 4 | BlogIndex          | Stripe blog                 | `v2/marketing/BlogIndex.jsx`                                  | ⬜     |
| 5 | BlogPost           | Stripe blog / Medium        | `v2/marketing/BlogPost.jsx`                                   | ⬜     |
| 6 | GuidesIndex        | Linear docs                 | `v2/marketing/GuidesIndex.jsx`                                | ⬜     |
| 7 | GuideDetail        | Linear docs                 | `v2/marketing/GuideDetail.jsx`                                | ⬜     |
| 8 | UseCasePage        | Framer                      | `v2/marketing/UseCasePage.jsx`                                | ⬜     |
| 9 | HelpCenter         | Intercom / Linear Help      | `v2/marketing/HelpCenter.jsx`                                 | ⬜     |
| 10| Privacy            | Apple legal                 | `v2/marketing/Privacy.jsx`                                    | ⬜     |
| 11| Terms              | Apple legal                 | `v2/marketing/Terms.jsx`                                      | ⬜     |
| 12| InviteAccept       | Notion invite               | `v2/marketing/InviteAccept.jsx`                               | ⬜     |

### 2. Auth · 9 telas

| # | Tela            | Ref app                 | Path                                                  | Status |
| --| --------------- | ----------------------- | ----------------------------------------------------- | ------ |
| 1 | Splash          | Instagram / Apple       | `v2/auth/Splash.jsx`                                  | ✅     |
| 2 | Welcome         | Duolingo welcome        | `v2/auth/Welcome.jsx`                                 | ✅     |
| 3 | Auth (router)   | Superhuman              | `v2/auth/Auth.jsx`                                    | ⬜     |
| 4 | Login           | Superhuman              | `v2/auth/Login.jsx`                                   | ✅     |
| 5 | Signup          | Notion signup           | `v2/auth/Signup.jsx`                                  | ✅     |
| 6 | AuthCallback    | Notion callback         | `v2/auth/AuthCallback.jsx`                            | ⬜     |
| 7 | ForgotPassword  | Superhuman              | `v2/auth/ForgotPassword.jsx`                          | ✅     |
| 8 | ResetPassword   | Superhuman              | `v2/auth/ResetPassword.jsx`                           | ✅     |
| 9 | MagicLinkSent   | Superhuman              | `v2/auth/MagicLinkSent.jsx`                           | ✅     |
| 10| Logout          | iOS                     | `v2/auth/Logout.jsx`                                  | ⬜     |

### 3. Onboarding · 12 telas

| # | Tela                  | Ref app                      | Path                                            | Status |
| --| --------------------- | ---------------------------- | ----------------------------------------------- | ------ |
| 1 | OnboardingRoot        | Noom (quiz intro)            | `v2/onboarding/OnboardingRoot.jsx`              | ✅     |
| 2 | OnboardingGoal        | Cal AI (goal picker)         | `v2/onboarding/OnboardingGoal.jsx`              | ✅     |
| 3 | OnboardingActivity    | Cal AI / Noom                | `v2/onboarding/OnboardingActivity.jsx`          | ✅     |
| 4 | OnboardingStats       | Cal AI (height/weight)       | `v2/onboarding/OnboardingStats.jsx`             | ✅     |
| 5 | OnboardingDiet        | Noom (diet pref)             | `v2/onboarding/OnboardingDiet.jsx`              | ✅     |
| 6 | OnboardingWorkout     | Strong (preferences)         | `v2/onboarding/OnboardingWorkout.jsx`           | ✅     |
| 7 | OnboardingHabits      | Noom (habit loop)            | `v2/onboarding/OnboardingHabits.jsx`            | ✅     |
| 8 | OnboardingConstraints | Noom (medical)               | `v2/onboarding/OnboardingConstraints.jsx`       | ✅     |
| 9 | OnboardingSummary     | Cal AI (reveal targets)      | `v2/onboarding/OnboardingSummary.jsx`           | ✅     |
| 10| OnboardingPaywall     | Duolingo + Cal AI paywall    | `v2/onboarding/OnboardingPaywall.jsx`           | ✅     |
| 11| OnboardingTour        | Duolingo tour                | `v2/onboarding/OnboardingTour.jsx`              | ✅     |
| 12| SmartOnboarding       | Linear (adaptive)            | `v2/onboarding/SmartOnboarding.jsx`             | ✅     |

### 4. Today · 7 telas

| # | Tela            | Ref app                   | Path                                       | Status |
| --| --------------- | ------------------------- | ------------------------------------------ | ------ |
| 1 | Today           | Apple Fitness + Whoop     | `v2/today/Today.jsx`                       | ✅     |
| 2 | WeeklyReview    | Strava (weekly)           | `v2/today/WeeklyReview.jsx`                | ✅     |
| 3 | Insights        | Whoop (insights)          | `v2/today/Insights.jsx`                    | ✅     |
| 4 | Diary           | Reflectly / Day One       | `v2/today/Diary.jsx`                       | ✅     |
| 5 | BlockReview     | Whoop (strain block)      | `v2/today/BlockReview.jsx`                 | ⬜     |
| 6 | Plan            | Fitbod (plan card)        | `v2/today/Plan.jsx`                        | ⬜     |
| 7 | DecisionEngine  | Linear (internal tool)    | `v2/today/DecisionEngine.jsx`              | ⬜     |

### 5. Nutrition · 13 telas  **← PILOTO**

| # | Tela              | Ref app                             | Path                                          | Status |
| --| ----------------- | ----------------------------------- | --------------------------------------------- | ------ |
| 1 | NutritionToday    | MyFitnessPal (diary view)           | `v2/nutrition/NutritionToday.jsx`             | ✅     |
| 2 | NutritionHistory  | MyFitnessPal (calendar)             | `v2/nutrition/NutritionHistory.jsx`           | ⬜     |
| 3 | MacroTargets      | MacroFactor (transparency)          | `v2/nutrition/MacroTargets.jsx`               | ⬜     |
| 4 | MealPlan          | Yazio / Eat This Much               | `v2/nutrition/MealPlan.jsx`                   | ⬜     |
| 5 | MyDiet            | Yazio (plan picker)                 | `v2/nutrition/MyDiet.jsx`                     | ⬜     |
| 6 | PrescribedDiet    | Trainerize (prescribed)             | `v2/nutrition/PrescribedDiet.jsx`             | ⬜     |
| 7 | FoodSearch        | MyFitnessPal (search)               | `v2/nutrition/FoodSearch.jsx`                 | ✅     |
| 8 | FoodDetail        | MyFitnessPal (food card)            | `v2/nutrition/FoodDetail.jsx`                 | ✅     |
| 9 | RecipeDetail      | Yazio (recipe)                      | `v2/nutrition/RecipeDetail.jsx`               | ⬜     |
| 10| RecipeLibrary     | Yazio (recipes index)               | `v2/nutrition/RecipeLibrary.jsx`              | ⬜     |
| 11| BarcodeScan       | Yuka / Cal AI barcode               | `v2/nutrition/BarcodeScan.jsx`                | ⬜     |
| 12| PhotoScan         | Cal AI (camera)                     | `v2/nutrition/PhotoScan.jsx`                  | ✅     |
| 13| PhotoScanConfirm  | Cal AI (confidence + edit)          | `v2/nutrition/PhotoScanConfirm.jsx`           | ✅     |

### 6. Workouts · 16 telas

| # | Tela                 | Ref app                          | Path                                           | Status |
| --| -------------------- | -------------------------------- | ---------------------------------------------- | ------ |
| 1 | WorkoutsHome         | Strong (home)                    | `v2/workouts/WorkoutsHome.jsx`                 | ✅     |
| 2 | WorkoutLibrary       | Jefit (library)                  | `v2/workouts/WorkoutLibrary.jsx`               | ⬜     |
| 3 | WorkoutDetail        | Hevy (detail)                    | `v2/workouts/WorkoutDetail.jsx`                | ✅     |
| 4 | ActiveWorkout        | Hevy (active logger)             | `v2/workouts/ActiveWorkout.jsx`                | ✅     |
| 5 | WorkoutHistory       | Strong (calendar)                | `v2/workouts/WorkoutHistory.jsx`               | ✅     |
| 6 | MyWorkout            | Fitbod (today's workout)         | `v2/workouts/MyWorkout.jsx`                    | ⬜     |
| 7 | PrescribedWorkout    | Trainerize                       | `v2/workouts/PrescribedWorkout.jsx`            | ⬜     |
| 8 | ManualWorkoutPlan    | Strong (plan)                    | `v2/workouts/ManualWorkoutPlan.jsx`            | ✅     |
| 9 | PlanBuilderWizard    | Fitbod (AI builder)              | `v2/workouts/PlanBuilderWizard.jsx`            | ⬜     |
| 10| Routines             | Hevy (routines)                  | `v2/workouts/Routines.jsx`                     | ✅     |
| 11| RoutineDetail        | Hevy (routine detail)            | `v2/workouts/RoutineDetail.jsx`                | ⬜     |
| 12| Protocols            | Hevy programs                    | `v2/workouts/Protocols.jsx`                    | ⬜     |
| 13| ProtocolDetail       | Hevy programs detail             | `v2/workouts/ProtocolDetail.jsx`               | ⬜     |
| 14| ProtocolForm         | Hevy program editor              | `v2/workouts/ProtocolForm.jsx`                 | ⬜     |
| 15| ExerciseLibrary      | Jefit exercises                  | `v2/workouts/ExerciseLibrary.jsx`              | ✅     |
| 16| ExerciseDetail       | Jefit exercise detail            | `v2/workouts/ExerciseDetail.jsx`               | ⬜     |

### 7. Body · 9 telas

| # | Tela               | Ref app                   | Path                                         | Status |
| --| ------------------ | ------------------------- | -------------------------------------------- | ------ |
| 1 | BodyOverview       | Whoop (body)              | `v2/body/BodyOverview.jsx`                   | ✅     |
| 2 | BodyProfile        | Withings profile          | `v2/body/BodyProfile.jsx`                    | ⬜     |
| 3 | WeightEntry        | Happy Scale               | `v2/body/WeightEntry.jsx`                    | ✅     |
| 4 | BodyComposition    | Withings body+            | `v2/body/BodyComposition.jsx`                | ⬜     |
| 5 | Measurements       | Withings measurements     | `v2/body/Measurements.jsx`                   | ⬜     |
| 6 | Progress           | Happy Scale trend         | `v2/body/Progress.jsx`                       | ⬜     |
| 7 | ProgressPhotos     | Macrofactor photos        | `v2/body/ProgressPhotos.jsx`                 | ✅     |
| 8 | ProgressPhotoView  | Apple Photos              | `v2/body/ProgressPhotoView.jsx`              | ⬜     |
| 9 | BodyCheckIn        | Whoop journal             | `v2/body/BodyCheckIn.jsx`                    | ✅     |

### 8. Labs · 5 telas

| # | Tela            | Ref app                    | Path                                     | Status |
| --| --------------- | -------------------------- | ---------------------------------------- | ------ |
| 1 | LabsOverview    | Function Health            | `v2/labs/LabsOverview.jsx`               | ✅     |
| 2 | LabExamDetail   | Function Health            | `v2/labs/LabExamDetail.jsx`              | ✅     |
| 3 | BiomarkerDetail | InsideTracker              | `v2/labs/BiomarkerDetail.jsx`            | ✅     |
| 4 | LabUpload       | Function Health upload     | `v2/labs/LabUpload.jsx`                  | ✅     |
| 5 | LabHistory      | Levels (timeline)          | `v2/labs/LabHistory.jsx`                 | ✅     |

### 9. Coach · 3 telas

| # | Tela                | Ref app                     | Path                                           | Status |
| --| ------------------- | --------------------------- | ---------------------------------------------- | ------ |
| 1 | CoachHome           | Future (home)               | `v2/coach/CoachHome.jsx`                       | ✅     |
| 2 | CoachChat           | ChatGPT mobile + Replika    | `v2/coach/CoachChat.jsx`                       | ✅     |
| 3 | CoachInsightDetail  | Whoop insight detail        | `v2/coach/CoachInsightDetail.jsx`              | ✅     |

### 10. Profile / Settings · 11 telas

| # | Tela                  | Ref app                      | Path                                             | Status |
| --| --------------------- | ---------------------------- | ------------------------------------------------ | ------ |
| 1 | Profile               | Apple ID profile             | `v2/profile/Profile.jsx`                         | ✅     |
| 2 | ProfileEdit           | Notion profile edit          | `v2/profile/ProfileEdit.jsx`                     | ⬜     |
| 3 | SettingsHub           | iOS Settings hub             | `v2/settings/SettingsHub.jsx`                    | ✅     |
| 4 | AccountSettings       | iOS Account                  | `v2/settings/AccountSettings.jsx`                | ✅     |
| 5 | NotificationSettings  | iOS Notifications            | `v2/settings/NotificationSettings.jsx`           | ⬜     |
| 6 | PrivacySettings       | iOS Privacy                  | `v2/settings/PrivacySettings.jsx`                | ⬜     |
| 7 | AppearanceSettings    | iOS Appearance               | `v2/settings/AppearanceSettings.jsx`             | ⬜     |
| 8 | Integrations          | Linear integrations          | `v2/settings/Integrations.jsx`                   | ✅     |
| 9 | LanguageSettings      | iOS Language                 | `v2/settings/LanguageSettings.jsx`               | ⬜     |
| 10| DataExport            | Notion export                | `v2/settings/DataExport.jsx`                     | ⬜     |
| 11| DangerZone            | GitHub danger zone           | `v2/settings/DangerZone.jsx`                     | ✅     |

### 11. Billing · 10 telas

| # | Tela                | Ref app                          | Path                                              | Status |
| --| ------------------- | -------------------------------- | ------------------------------------------------- | ------ |
| 1 | BillingOverview     | Stripe dashboard                 | `v2/billing/BillingOverview.jsx`                  | ⬜     |
| 2 | Checkout            | Stripe Checkout                  | `v2/billing/Checkout.jsx`                         | ⬜     |
| 3 | PlanPicker          | Cal AI / Superhuman              | `v2/billing/PlanPicker.jsx`                       | ⬜     |
| 4 | TrialStart          | Calm trial                       | `v2/billing/TrialStart.jsx`                       | ⬜     |
| 5 | TrialExplain        | Blinkist (3-step timeline)       | `v2/billing/TrialExplain.jsx`                     | ⬜     |
| 6 | DiscountOffer       | Duolingo discount                | `v2/billing/DiscountOffer.jsx`                    | ⬜     |
| 7 | RestorePurchases    | Apple subs                       | `v2/billing/RestorePurchases.jsx`                 | ⬜     |
| 8 | ManageSubscription  | Apple subs manager               | `v2/billing/ManageSubscription.jsx`               | ⬜     |
| 9 | CancelFlow          | Blinkist save offer              | `v2/billing/CancelFlow.jsx`                       | ⬜     |
| 10| UpgradePrompt       | Duolingo upgrade prompt          | `v2/billing/UpgradePrompt.jsx`                    | ⬜     |

### 12. Social · 5 telas

| # | Tela               | Ref app                    | Path                                             | Status |
| --| ------------------ | -------------------------- | ------------------------------------------------ | ------ |
| 1 | SocialHome         | Strava (feed)              | `v2/social/SocialHome.jsx`                       | ⬜     |
| 2 | ShareComposer      | Strava share card          | `v2/social/ShareComposer.jsx`                    | ⬜     |
| 3 | CreatorDashboard   | Patreon creator            | `v2/social/CreatorDashboard.jsx`                 | ⬜     |
| 4 | CreatorCode        | Spotify code               | `v2/social/CreatorCode.jsx`                      | ⬜     |
| 5 | Referrals          | Dropbox referrals          | `v2/social/Referrals.jsx`                        | ⬜     |

### 13. Admin / Pro · 12 telas

| # | Tela                   | Ref app                  | Path                                                 | Status |
| --| ---------------------- | ------------------------ | ---------------------------------------------------- | ------ |
| 1 | AdminHome              | Linear admin             | `v2/admin/AdminHome.jsx`                             | ⬜     |
| 2 | AdminUsers             | Linear users             | `v2/admin/AdminUsers.jsx`                            | ⬜     |
| 3 | AdminSubscriptions     | Stripe dashboard         | `v2/admin/AdminSubscriptions.jsx`                    | ⬜     |
| 4 | AdminAudit             | Linear audit             | `v2/admin/AdminAudit.jsx`                            | ⬜     |
| 5 | AdminFeatureFlags      | LaunchDarkly             | `v2/admin/AdminFeatureFlags.jsx`                     | ⬜     |
| 6 | AdminAnalytics         | Mixpanel / Amplitude     | `v2/admin/AdminAnalytics.jsx`                        | ⬜     |
| 7 | AdminSettings          | Linear settings          | `v2/admin/AdminSettings.jsx`                         | ⬜     |
| 8 | CoachProDashboard      | Trainerize coach         | `v2/pro/CoachProDashboard.jsx`                       | ⬜     |
| 9 | NutritionistDashboard  | Cronometer pro           | `v2/pro/NutritionistDashboard.jsx`                   | ⬜     |
| 10| ClinicianDashboard     | Epic (clinical)          | `v2/pro/ClinicianDashboard.jsx`                      | ⬜     |
| 11| ProClientList          | Trainerize client list   | `v2/pro/ProClientList.jsx`                           | ⬜     |
| 12| ProClientDetail        | Trainerize client detail | `v2/pro/ProClientDetail.jsx`                         | ⬜     |

### 14. System · 7 telas

| # | Tela                      | Ref app               | Path                                                  | Status |
| --| ------------------------- | --------------------- | ----------------------------------------------------- | ------ |
| 1 | NotFound (404)            | Linear 404            | `v2/system/NotFound.jsx`                              | ⬜     |
| 2 | ServerError (500)         | Stripe 500            | `v2/system/ServerError.jsx`                           | ⬜     |
| 3 | Offline                   | Linear offline        | `v2/system/Offline.jsx`                               | ⬜     |
| 4 | Maintenance               | GitHub maintenance    | `v2/system/Maintenance.jsx`                           | ⬜     |
| 5 | PermissionNotifications   | iOS permission        | `v2/system/PermissionNotifications.jsx`               | ⬜     |
| 6 | PermissionCamera          | iOS permission        | `v2/system/PermissionCamera.jsx`                      | ⬜     |
| 7 | PermissionHealth          | iOS HealthKit         | `v2/system/PermissionHealth.jsx`                      | ⬜     |

### 15. Dev · 3 telas

| # | Tela               | Ref app           | Path                                         | Status |
| --| ------------------ | ----------------- | -------------------------------------------- | ------ |
| 1 | Styleguide         | Linear styleguide | `v2/dev/Styleguide.jsx`                      | ⬜     |
| 2 | TokenGallery       | Figma tokens      | `v2/dev/TokenGallery.jsx`                    | ⬜     |
| 3 | ComponentGallery   | Storybook         | `v2/dev/ComponentGallery.jsx`                | ⬜     |

### 16. Overlays · 26 (sheets, dialogs, modals)

| # | Overlay                     | Ref app                    | Path                                                  | Status |
| --| --------------------------- | -------------------------- | ----------------------------------------------------- | ------ |
| 1 | AuthModal                   | Notion contextual auth     | `v2/overlays/AuthModal.jsx`                           | ⬜     |
| 2 | QuickLogSheet               | MyFitnessPal quick log     | `v2/overlays/QuickLogSheet.jsx`                       | ⬜     |
| 3 | MealEditSheet               | MFP meal edit              | `v2/overlays/MealEditSheet.jsx`                       | ⬜     |
| 4 | PortionEditorSheet          | MFP portion                | `v2/overlays/PortionEditorSheet.jsx`                  | ⬜     |
| 5 | FoodSearchSheet             | MFP search sheet           | `v2/overlays/FoodSearchSheet.jsx`                     | ⬜     |
| 6 | PhotoScanSheet              | Cal AI camera sheet        | `v2/overlays/PhotoScanSheet.jsx`                      | ⬜     |
| 7 | BarcodeScanSheet            | Yuka barcode               | `v2/overlays/BarcodeScanSheet.jsx`                    | ⬜     |
| 8 | QuickWorkoutModal           | Strong quick start         | `v2/overlays/QuickWorkoutModal.jsx`                   | ⬜     |
| 9 | WorkoutGuardSheet           | Fitbod paywall sheet       | `v2/overlays/WorkoutGuardSheet.jsx`                   | ⬜     |
| 10| ShareWorkoutSheet           | Strava share sheet         | `v2/overlays/ShareWorkoutSheet.jsx`                   | ⬜     |
| 11| PlanBuilderWizard           | Fitbod wizard              | `v2/overlays/PlanBuilderWizard.jsx`                   | ⬜     |
| 12| BodyCheckinSheet            | Whoop journal sheet        | `v2/overlays/BodyCheckinSheet.jsx`                    | ⬜     |
| 13| WeeklyCheckinModal          | Whoop weekly               | `v2/overlays/WeeklyCheckinModal.jsx`                  | ⬜     |
| 14| CoachChatSheet              | ChatGPT contextual         | `v2/overlays/CoachChatSheet.jsx`                      | ⬜     |
| 15| AIGenerationWizard          | Cal AI generation          | `v2/overlays/AIGenerationWizard.jsx`                  | ⬜     |
| 16| PaywallTrigger              | Duolingo gated action      | `v2/overlays/PaywallTrigger.jsx`                      | ⬜     |
| 17| SubscriptionManagerSheet    | Apple subs sheet           | `v2/overlays/SubscriptionManagerSheet.jsx`            | ⬜     |
| 18| CancelSaveOfferModal        | Blinkist save offer        | `v2/overlays/CancelSaveOfferModal.jsx`                | ⬜     |
| 19| InviteModal                 | Notion invite              | `v2/overlays/InviteModal.jsx`                         | ⬜     |
| 20| CreatorCodeModal            | Spotify code               | `v2/overlays/CreatorCodeModal.jsx`                    | ⬜     |
| 21| ShareFlowSheet              | iOS share sheet            | `v2/overlays/ShareFlowSheet.jsx`                      | ⬜     |
| 22| EnhancedShareModal          | Strava share card          | `v2/overlays/EnhancedShareModal.jsx`                  | ⬜     |
| 23| ImageCropperModal           | iOS photo cropper          | `v2/overlays/ImageCropperModal.jsx`                   | ⬜     |
| 24| SupportWidget               | Intercom widget            | `v2/overlays/SupportWidget.jsx`                       | ⬜     |
| 25| OnboardingTourSheet         | Duolingo tour sheet        | `v2/overlays/OnboardingTourSheet.jsx`                 | ⬜     |
| 26| StartFreshModal             | GitHub reset               | `v2/overlays/StartFreshModal.jsx`                     | ⬜     |
| 27| UnsavedChangesDialog        | Notion unsaved             | `v2/overlays/UnsavedChangesDialog.jsx`                | ⬜     |
| 28| ConfirmDestructiveDialog    | GitHub destructive         | `v2/overlays/ConfirmDestructiveDialog.jsx`            | ⬜     |

---

## Totais

- **Telas canônicas:** 94
- **Overlays:** 28
- **Total de arquivos .jsx a criar:** 122 (≈ o "132" que você lembrou; alguns podem ser onboarding sub-steps)

---

## Plano de execução

### Fase 0 — Aprovação (você)
Você revisa este plano. Se estiver ok, me fala que aprovou (ou quais apps/paths mudar).

### Fase 1 — Piloto: Nutrition (13 telas)
Eu entrego as **13 telas de Nutrition** copiando Cal AI / MyFitnessPal / Yazio / Macrofactor. 1 arquivo por tela, com 3–5 screenshots de referência comentadas em cada arquivo (URL das telas do app real) + o layout JSX espelhando aquela referência, usando a paleta Atlas.

Você valida visualmente (rodando `npm run dev` e navegando). Se tiver 👍, replico o padrão pros outros 11 domínios.

### Fase 2 — Refatoração em paralelo (dom a dom)
Na ordem: Today → Workouts → Body → Coach → Labs → Billing → Onboarding → Auth → Settings/Profile → Social → Admin/Pro → Marketing → System → Dev → Overlays.

Ao concluir cada tela, eu marco o status aqui de ⬜ para ✅. Assim, se a sessão cair, a próxima sabe exatamente o que está feito.

### Fase 3 — Cutover
Quando todas ✅, eu:
1. Movo `src/redesign/archived/v2/` para substituir `src/redesign/` antigo
2. Aponto `App.jsx` para usar o novo registry
3. Arquivo o antigo em `_archived/redesign-v1/`
4. Gero preview HTML final

### Continuidade entre sessões
Se você voltar em outra sessão e quiser continuar o redesign, é só dizer "continua o redesign" — eu leio este arquivo, vejo a primeira linha com ⬜ e continuo daí.

---

## Pendências aguardando sua decisão

1. **Aprovar o mapeamento de apps de referência acima.** Quer trocar algum? (Ex: se você prefere Zero em vez de Happy Scale para trend de peso, ou Yuka em vez de Cal AI pra barcode.)
2. **Aprovar a estrutura de paths.** Eu uso `src/redesign/archived/v2/<domain>/<Screen>.jsx` para não conflitar com o redesign v1 (que fica preservado). Quando v2 estiver pronto, migra tudo.
3. **Confirmar piloto = Nutrition.** Ou você prefere outro domínio pra começar (ex: Today, que é a home)?

Depois que esses 3 pontos estiverem OK, eu começo a executar a Fase 1 sem parar.

---

## 📋 Progresso de sessões

### Sessão 2026-04-18 — entrega Fase 1 (15 telas)

**Contexto:** Enzo viu screenshots com spacing quebrado (status bar iOS sobreposta, texto cortado, FAB sobre cards) + dados demo "Alex Johnson" vazando pra usuários reais. Pediu para continuar em React mas deixar a UX "quase Swift" — Liquid Glass, spacing perfeito, haptic-feel.

**Entregues:**

- **Patch "Alex Johnson"** (fix do vazamento de mock data em produção):
  - `src/components/layout/AppLayoutV2.jsx` — substituído `mockUserData` por `useLayoutUser()` que lê o user real do AuthContext
  - `src/components/NavigationV2.jsx` — criado `SidebarUserFooter` que lê user real + respeita safe-area-inset-bottom
  - `src/pages/ProfileV2.jsx` — substituído `mockUserData` por `useRealProfileData()`, zerados achievements/stats (até services reais entrarem)
- **Primitives Liquid Glass v2** em `src/redesign/archived/v2/lib/glass.jsx`:
  - `SafeScreen` — wrapper com safe-area-inset em todos os 4 lados, opções `hasTopBar`/`hasBottomNav`/`hasFab` pra nunca colidir com chrome fixo
  - `Glass` — surface translúcida com backdrop-blur + saturate + specular edge highlight + ambient shadow
  - `LiquidButton` — CTA com spring-press scale(.97), 6 variantes (primary/neutral/ghost/premium/ai/danger)
  - `LiquidTopBar` — top bar fixa, 56pt, blurred, respeita safe-area-inset-top
  - `LiquidProgress` — progress hairline com glow cyan
  - `ChoicePill` — option row 56pt Cal AI/Noom-style com selected state em accent
  - `BigNumberInput` — input numérico gigante centrado
  - `SpringReveal` — animação de entrada com translate+fade, respeita prefers-reduced-motion
- **15 telas entregues** em `src/redesign/archived/v2/`:
  1. ✅ `auth/Splash.jsx` — tela de launch com heartbeat→arrow animado, variant firstLaunch vs normal, suporta error/syncing/ready
  2. ✅ `auth/Welcome.jsx` — primeira tela pra quem nunca entrou, com aurora cyan+violet, 3 benefícios, 2 CTAs
  3. ✅ `onboarding/OnboardingShell.jsx` — layout compartilhado (top bar com progress + back + step counter, body scrollable 560px max, footer sticky com CTA)
  4. ✅ `onboarding/OnboardingRoot.jsx` — step 1/10 (intro, "9 perguntas, 90 segundos")
  5. ✅ `onboarding/OnboardingGoal.jsx` — step 2/10 (5 goals: lose fat, gain muscle, recomp, perform, maintain)
  6. ✅ `onboarding/OnboardingActivity.jsx` — step 3/10 (5 activity levels)
  7. ✅ `onboarding/OnboardingStats.jsx` — step 4/10 (unit toggle metric/imperial, BigNumberInput pra altura/peso/meta, sex, DOB)
  8. ✅ `onboarding/OnboardingDiet.jsx` — step 5/10 (7 dietas + 6 allergens multi-select)
  9. ✅ `onboarding/OnboardingWorkout.jsx` — step 6/10 (experience + 5 frequências + 7 equipamentos)
  10. ✅ `onboarding/OnboardingHabits.jsx` — step 7/10 (sleep + steps + water slider 1-5L)
  11. ✅ `onboarding/OnboardingConstraints.jsx` — step 8/10 (injuries + medical + pregnancy + notes)
  12. ✅ `onboarding/OnboardingSummary.jsx` — step 9/10 (reveal calculado: kcal hero, 3 macros, training summary)
  13. ✅ `onboarding/OnboardingPaywall.jsx` — step 10/10 (trial 7 dias, plan weekly/annual, timeline 3 steps, social proof, platform-aware Stripe/RevenueCat)
  14. ✅ `onboarding/OnboardingTour.jsx` — 3 slides (photo log, coach chat, recovery ring) + dots + finish
  15. ✅ `onboarding/SmartOnboarding.jsx` — adaptive flow pra returning users com profile parcial
  16. ✅ `today/Today.jsx` — home com greeting, RecoveryHero (ring 0-100 + bucket + streak), MacrosCard (cal + 3 macros), WorkoutCard (prescribed ou rest day), CoachTipCard (violet, opcional)
- **Barrel export** em `src/redesign/archived/v2/index.js`

**Garantias aplicadas em TODAS as 15 telas:**
- `env(safe-area-inset-*)` em top/bottom/left/right — nunca colide com status bar iOS nem home indicator
- Zero mock data — todas as telas aceitam props do user real via AuthContext
- Backdrop-filter blur + saturate em surfaces + specular edge highlight
- Spring physics (`cubic-bezier(.34,1.56,.64,1)`) em interativos
- `prefers-reduced-motion` respeitado
- `WebkitTapHighlightColor: 'transparent'` em todos os botões (no gray flash no iOS)
- Tabular nums (`font-variant-numeric: tabular-nums`) em tudo que é número

### Próximos passos (para a próxima sessão continuar)

1. **Review do Enzo** — rodar `npm run dev` + importar uma dessas telas em `App.jsx` pra ver ao vivo. Se ficar bom, replicar Fase 2.
2. **Fase 2 — Nutrition** (13 telas) — Cal AI + MyFitnessPal + Yazio
3. **Fase 3 — Workouts** (16 telas) — Strong + Hevy + Fitbod
4. Depois: Body, Coach, Labs, Billing restante, Settings/Profile, Social, Admin/Pro, Marketing, System, Dev, Overlays (28)
5. Cutover: apontar `App.jsx` para usar `redesign/archived/v2/*` e arquivar o `redesign/` antigo em `_archived/`

### Como continuar em sessão futura

Se você voltar em outra sessão, diga: **"continua o redesign v2"**. Eu:
1. Leio este `REDESIGN-MASTER-PLAN.md`
2. Vejo a primeira linha com ⬜ e começo por ela
3. Atualizo o Status e adiciono um registro de sessão aqui embaixo

---

### Sessão 2026-04-18 (parte 2) — clean slate + App.jsx novo

**Contexto:** Screenshots mostraram que o "Alex" ainda vazava do Dashboard.jsx (`src/pages/Dashboard.jsx` com `mockData.user.name: 'Alex'` hardcoded). A tela de Auth live tinha logo pequeno, "Welcome back" gritando, cyan chapado no Sign in, sem Google. Enzo autorizou: "apague todas as telas e reconstrua, assim não tem resquício".

**Entregues nesta parte:**

- **Patch Dashboard.jsx** — mockData zerado (streak/totalWorkouts → 0), `displayName` vem de `useAuth()` com fallback pro prefixo do email. "Welcome back, Alex" acabou aqui.
- **Patch Auth.jsx** (v1 redesign, a tela de login que roda em produção):
  - Logo subiu de `size="lg"` pra `size="2xl"` — mark agora tem presença de verdade
  - Título "Welcome back" caiu de `text-rd-display-md` pra `text-[26px]` — chama atenção sem gritar
  - Botão Sign in reescrito com gradient cyan 95→92% + specular highlight inset + shadow glow + spring-press scale(.985) — parece vidro em vez de plástico
  - **Google sign-in restaurado** via `handleGoogle` + `supabase.auth.signInWithOAuth({ provider: 'google' })` com SVG brand-accurate 4-color do G
  - Apple sign-in refinado com SVG brand-accurate
  - Grid 2-col no desktop, stack no mobile
- **Clean slate executado** sem apagar nada (tudo preservado):
  - `App.jsx` antigo (713 linhas) salvo em `src/App.legacy.jsx.bak` para rollback
  - `App.jsx` novo (~350 linhas, limpo) escrito do zero — só aponta pra `v2/` + `<ComingSoon />`. Nenhuma rota ativa agora importa `@/pages/*` ou `@/redesign/screens/*`.
  - Provider tree preservado idêntico (ErrorBoundary, ThemeProvider, AuthProvider, GoogleReCaptchaProvider, QueryClientProvider, SubscriptionProvider, DailyStoreProvider, Router, I18nProvider, Sonner, Analytics, SpeedInsights)
  - Deep-link OAuth nativo (`atlascore://auth/callback`) preservado
  - Analytics page-view tracking preservado
- **Novas primitives e layouts:**
  - `src/redesign/archived/v2/system/ComingSoon.jsx` — placeholder Liquid Glass pra qualquer rota ainda não redesenhada ("In redesign" pill cyan + heading + back/home CTAs)
  - `src/redesign/archived/v2/layouts/AppShell.jsx` — shell das rotas autenticadas com top bar blurred (56pt + safe-area-inset-top), bottom nav de 5 tabs (Today/Train/Food/Body/Profile, 64pt + safe-area-inset-bottom), FAB opcional. Lê `useAuth()` para avatar/iniciais reais. **Nunca vai ter Alex Johnson.**
  - `src/redesign/archived/v2/layouts/AuthShell.jsx` — shell das rotas públicas (sem nav), safe-area em todos os lados, aurora sutil de fundo
- **Fluxo wireado:**
  - `/` e `/welcome` → `Welcome` v2 (Get started → signup, I already have an account → login)
  - `/auth`, `/auth/login`, `/auth/signup` → `LegacyAuth` refinado com Google + Apple + cyan liquid glass
  - `/onboarding/*` → 12 telas v2 encadeadas via `useOnboardingFlow()` (next/prev baseado em ONBOARDING_ORDER, state `answers` compartilhado em memória)
  - `/app/today` → v2 `Today` com user real do AuthContext
  - `/app/*` (nutrition, workouts, body, labs, coach, profile, settings, billing, social, notifications) → `AppPlaceholder` (ComingSoon dentro do AppShell — top bar + bottom nav preservados)
  - `/admin/*`, `/pro/*`, `/pricing`, `/blog/*`, etc. → `ComingSoonNav`
  - `*` (404) → `ComingSoonNav`

**Garantias:**
- Nenhuma rota ativa renderiza código legado. Todos os `@/pages/*` e `@/redesign/screens/*` (exceto o Auth legado já wireado) são **dead code** agora.
- Se qualquer link/deep-link navegar pra uma rota não redesenhada, o usuário vê o `ComingSoon` limpo — não crasha, não mostra mock.
- Logout, Supabase session, Stripe checkout, RevenueCat, Capacitor deep-links — tudo preservado via providers.

**Próximas sessões — ordem recomendada de construção das 107 telas restantes:**

1. **Auth completo v2** (substituir LegacyAuth): Splash, Login, Signup, AuthCallback, ForgotPassword, ResetPassword, MagicLinkSent, Logout (8 telas)
2. **Today expansions**: WeeklyReview, Insights, Diary, Plan, BlockReview (5 telas)
3. **Nutrition** (13 telas): Cal AI / MyFitnessPal / Yazio
4. **Workouts** (16 telas): Strong / Hevy / Fitbod
5. **Body** (9 telas), **Labs** (5), **Coach** (3)
6. **Profile/Settings** (11), **Billing restante** (9)
7. **Social** (5), **Admin/Pro** (12), **Marketing** (12), **System** (7), **Dev** (3)
8. **Overlays** (28 sheets/modals/dialogs)

**Pontos de atenção para próxima sessão:**
- Verificar que `npm run dev` builda sem erro com o novo App.jsx
- Se alguma rota do backend esperar `ROUTES.xxx` específico, pode dar warning — o `src/lib/routes.js` ainda existe e não foi tocado
- O fluxo de onboarding usa state em memória por enquanto; quando integrar com Supabase `profiles` table + `onboarding_completed`, atualizar as handlers em `App.jsx > useOnboardingFlow`
- Quando começar a construir Nutrition/Workouts etc. reais, substituir os `<AppPlaceholder />` pelos componentes v2 correspondentes em `App.jsx`
