# Teardown 20 — Lab Results

**Surface:** Lab results upload, marker review, and longitudinal lab history for athlete health tracking.
**Atlas file(s):** [src/pages/LabExams.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/LabExams.jsx:1), [src/services/labExamService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/services/labExamService.js:1), [supabase/functions/parse-lab-pdf/index.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/parse-lab-pdf/index.ts:1), [supabase/migrations/20260325200000_create_lab_exams_v2.sql](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/migrations/20260325200000_create_lab_exams_v2.sql:1), [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:477), [src/lib/routes.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/routes.js:1)
**Reference apps:** Function Health (primary), InsideTracker (secondary)
**Audience tension:** High — serious users want a credible biomarker record with clear ranges and trends, while general users need a low-friction upload flow that does not feel like a clinical charting tool.

---

## Why this screen matters

Lab results are one of the highest-trust surfaces in Atlas. If a user uploads a report, they are asking the app to interpret something personal, technical, and potentially consequential. That makes this screen less about visual polish and more about whether Atlas can turn a PDF or image into a coherent health story without making the user feel lost.

The retention and revenue stakes are real. A good lab surface gives the product a reason to exist between workouts and meals: it ties training and nutrition to outcomes the user can actually verify. A broken one is worse than an empty state, because it promises intelligence, then delivers a sketchy preview, a dead button, or an analysis that looks authoritative but is not grounded in a real review loop.

World-class here means the user can upload a result, verify the extracted markers, see what changed over time, and understand what matters without doing detective work. Broken means the app either stops at “upload complete,” buries the original file, or presents example insights as if they were the user’s real analysis. This surface needs trust first, aesthetics second.

---

## Reference app 1 — Function Health (primary)

Function Health is the better primary reference because it frames labs as a longitudinal health system, not a one-off import. Its public flow emphasizes large test breadth, clinician-reviewed results, downloadable/shareable output, and repeating tests over time, which is the right mental model for Atlas’s serious-user segment. See Function’s [How it works](https://www.functionhealth.com/how-it-works), [What we test](https://www.functionhealth.com/our-tests), and [About](https://www.functionhealth.com/about).

### What Function Health does that works

1. **Makes breadth feel intentional.** Function leads with the idea that testing is comprehensive across heart, hormones, kidneys, liver, thyroid, and more. That works because the user immediately understands that this is not a single-marker toy; it is a system for seeing the body in context. Atlas should borrow that framing by making panels and marker groups feel like a structured record, not a flat list.

2. **Connects testing to action.** The public flow does not stop at “here are your results”; it positions results as something clinicians review and turn into next steps. That matters because a lab result without a next step is just anxiety with better typography. Atlas should make the recommendation layer feel like a consequence of the data, not decorative AI copy.

3. **Treats retesting as part of the product.** Function explicitly frames health as a pattern and encourages repeating tests over months, not chasing a single snapshot. That is exactly the posture Atlas needs for lab history: the value is not one abnormal marker, but the trend that emerges when the user compares panels over time.

4. **Uses a premium, clinical tone without being sterile.** The language is confident and health-literate, but it still reads as a consumer product. That balance matters because Atlas has to satisfy serious users without making the experience feel like a hospital portal.

5. **Keeps results shareable and reviewable.** The product promise includes downloading and sharing results, which reinforces ownership and legitimacy. For Atlas, that implies a strong export/share path and a durable original file record, not just extracted fields.

### What Function Health does that you shouldn't copy

1. **Do not copy the test-breadth marketing language too literally.** Function can lead with hundreds of biomarkers because the subscription is the product. Atlas is a fitness operating system first, so lab results should support training and recovery, not become a standalone “we test everything” promise.

2. **Do not over-rotate into clinician authority.** Function can lean on clinician review as a trust anchor. Atlas should stay careful not to imply medical diagnosis or create the impression that every result is professionally interpreted in a regulated clinical workflow.

3. **Do not make the surface feel acquisition-heavy.** Function’s public pages are designed to sell a testing program. Atlas should use the same confidence but not the same sales-first structure; in-product lab results should feel like ownership of data, not a pitch.

---

## Reference app 2 — InsideTracker (secondary)

InsideTracker adds the most useful practical patterns for Atlas: upload past lab results, review extracted data before submitting, and turn biomarker values into “optimal” ranges plus action plans. Its support and product pages explicitly describe PDF/PNG/JPEG upload, manual entry or human review, and an analysis/recommendation layer, which is a strong match for Atlas’s ingestion flow. See InsideTracker’s [blood results upload](https://info.insidetracker.com/blood-results-upload) and [support article on uploading past lab results](https://support.insidetracker.com/en-US/how-do-i-upload-past-lab-results-to-insidetracker-288819).

### What InsideTracker does that works

1. **Makes upload feel operational.** InsideTracker tells the user exactly what files work and what happens next. That reduces uncertainty at the point of upload, which is where Atlas currently needs the most reassurance.

2. **Builds a review step into trust.** The upload flow includes a chance to verify extracted information before submit. That is the right pattern for medical-ish data because OCR and LLM extraction can be wrong in ways users will notice immediately.

3. **Distinguishes normal from optimal.** InsideTracker’s value is not only “is this in range,” but “is this in your target zone.” That distinction is important for Atlas because athletes care about performance-biased targets, not just generic lab normality.

4. **Pairs markers with action plans.** The product story is stronger when biomarker status leads to nutrition, exercise, supplement, and lifestyle guidance. Atlas should steal that structure, even if the actual recommendations are simpler at first.

5. **Keeps history visible.** InsideTracker’s experience is built around seeing blood data over time, not just a latest scan. That reinforces the exact longitudinal behavior Atlas wants from serious users.

### What InsideTracker does that you shouldn't copy

1. **Do not copy the “bloodwork portal” vibe.** InsideTracker is comfortable being a specialized diagnostics experience. Atlas needs to feel broader and more integrated with workouts, nutrition, and progress, not like a lab vendor wrapped in a mobile app.

2. **Do not assume every user wants a medical-optimal framing.** InsideTracker’s audience is already self-selected for bloodwork optimization. Atlas has to serve people who may only want a simple “what matters here?” answer and not a full biomarker education journey.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** The surface is a real routed page at `/LabExams`, mounted behind `EntitlementGate` in [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:477) and exposed through the route map in [src/lib/routes.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/routes.js:1). It is also linked from progress as a quick jump surface, so it is not hidden. The page itself uses a desktop two-column layout: upload/history on the left, selected analysis on the right.
- **Key interactions:** Users can open the upload dialog, import a PDF or image, trigger OCR extraction, create a lab exam record, select a past exam, and delete an exam. The create flow is the only fully wired path; manual marker entry and AI Q&A are present but stubbed with toast messages, not real flows.
- **Visual approach:** The page is polished and premium-looking: a gradient hero, bright brand and emerald accents, dense cards, pill badges, and a responsive split-pane layout. It reads more like a product marketing surface than a clinical portal, which is good for approachability but can blur trust if the data quality is not obvious.
- **Known issues from code reading:** The page contains hardcoded example markers, insights, and recommendations that show whenever no exam is selected, so the default state is a preview rather than a true empty state. `MarkerTrend` is defined but not used, `onDelete` is passed into `ExamRow` but there is no visible delete control in the row, `uploadLabFile` exists in the service but is not called, and `generateExamInsights` exists but is not wired into the page. The upload flow also does not persist the source file path even though the database model supports `source_file`.
- **Gaps relative to the reference app:** Atlas can ingest and store extracted markers, but it does not yet offer a real extraction review step, a visible original-file trail, a true longitudinal trends view, or a trustworthy “normal vs optimal” framing. Compared with Function Health and InsideTracker, it feels like the start of a lab system rather than a finished lab product.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Upload-first explainer.** Keep the hero, but make it answer “what happens when I upload?” in one line and one primary button. Atlas already has this shape; the work is in tightening the promise so the user knows they are entering a review flow, not just a file-picker. Effort: 4-8 hours.

2. **Desktop split-pane review.** The current list/detail layout is the right skeleton for this surface. Steal the idea of keeping history on the left and a selected exam on the right, but make the right pane earn its space with real review actions and chart context. Effort: 1 day.

3. **Status-at-a-glance badges.** The marker rows already use low/high/critical/normal status. Keep that pattern and make it more legible by adding stronger grouping and tighter visual hierarchy around “needs attention” versus “normal.” Effort: 4-8 hours.

4. **Review-before-trust.** Borrow InsideTracker’s approach of making extraction something the user verifies before it becomes part of history. This is the fastest trust win for a lab surface because it addresses OCR/LLM error directly. Effort: 1-2 days.

5. **Persistent original record.** Keep the uploaded file attached to the exam record and storage object, not just the parsed markers. This makes the surface feel durable and audit-friendly, which matters a lot for medical-ish data. Effort: 1 day.

### 🟡 Steal soon — medium impact, medium effort

1. **Marker timeline by biomarker.** Let the user open a marker and see how that specific biomarker changed across exams, not just how one panel looked on one day. That is where lab results start becoming useful, because trends are what people actually act on. Effort: 2-4 days.

2. **Reference-zone framing.** Add a visual distinction between “in range,” “optimal,” and “out of range” when the underlying data supports it. This is the InsideTracker lesson that gives the surface more intelligence without requiring a full clinician workflow. Effort: 2-3 days.

3. **Post-upload verification screen.** Show extracted markers, allow corrections, and only then save the final record. This is more work than a direct save, but it prevents the most common trust failure in OCR-heavy health tools. Effort: 2-4 days.

4. **Inline source metadata.** Display the original file name, import date, and extraction status in the exam header. That is a small UI change with a big credibility payoff because users can see where the data came from. Effort: 4-8 hours.

### 🔴 Consider carefully — high effort or audience-dependent

1. **AI Q&A per result.** A conversational layer over a lab exam can be useful, but only if the answers are constrained and medically careful. It is better to ship a narrow, deterministic explanation layer first than to create a free-form question box that sounds smart and can drift. Effort: 2-5 days.

2. **Manual entry wizard.** This is valuable for power users, but the product needs to decide whether Atlas wants to be a file-upload-first app or a data-entry-first app. If both are first-class, the surface gets heavier very quickly. Effort: 2-4 days.

3. **Clinician-share mode.** Sharing labs with coaches or clinicians is powerful, but it belongs in a separate permissioned flow, not inside the core user review surface. That is a product decision, not just a UI decision. Effort: 2-4 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Medical trust vs fitness tone.** Labs are inherently clinical, but Atlas is not a hospital portal. The current hero styling pushes toward a polished consumer feel, while the data itself needs caution and credibility. *Resolution:* keep the visual system premium and approachable, but move trust into explicit source, range, and verification cues rather than into softer copy.

**Tension 2 — Fast upload vs accurate review.** A single-click import is appealing, but auto-saving parsed markers without verification is exactly where users lose confidence. *Resolution:* make upload fast, but require a review step before a record becomes permanent.

**Tension 3 — Broad audience vs serious optimizer depth.** Some users want a simple “is this fine?” answer; others want dense biomarker history and trend analysis. *Resolution:* make the default view simple, then progressively reveal per-marker history and deeper interpretation only after the user selects a panel or biomarker.

**Tension 4 — One-off result vs longitudinal history.** Lab results are easy to design as isolated cards, but that misses the actual value of repeated testing. *Resolution:* design the default state around the archive and the trend relationship, not around the newest PDF.

---

## Specific changes to make (actionable list)

1. **Add a post-extraction review step before saving a lab exam.**
   Files to touch: `src/pages/LabExams.jsx`, `src/services/labExamService.js`.
   Effort: 2-4 days.
   Dependency: none.

2. **Persist the uploaded source file path on create and show it in the exam header.**
   Files to touch: `src/pages/LabExams.jsx`, `src/services/labExamService.js`.
   Effort: 1 day.
   Dependency: 1.

3. **Replace the example preview panel with a real empty state when no exam is selected.**
   Files to touch: `src/pages/LabExams.jsx`.
   Effort: 4-8 hours.
   Dependency: none.

4. **Expose a real delete control in each exam row or remove the dead delete path.**
   Files to touch: `src/pages/LabExams.jsx`, `src/services/labExamService.js`.
   Effort: 4-8 hours.
   Dependency: none.

5. **Wire manual marker entry or explicitly disable it with a clearer non-actionable state.**
   Files to touch: `src/pages/LabExams.jsx`, `src/services/labExamService.js`.
   Effort: 1-2 days.
   Dependency: 1.

6. **Wire `generateExamInsights` into the selected-exam panel or remove the dead service function.**
   Files to touch: `src/services/labExamService.js`, `src/pages/LabExams.jsx`.
   Effort: 1-2 days.
   Dependency: none.

7. **Localize all visible lab-results copy instead of mixing i18n with hardcoded English strings.**
   Files to touch: `src/pages/LabExams.jsx`, `src/lib/translations/en-US.json`, `src/lib/translations/pt-BR.json`, `src/i18n/messages/en.json`, `src/i18n/messages/pt-BR.json`.
   Effort: 1-2 days.
   Dependency: none.

8. **Add per-marker history across exams so the right pane can show a biomarker trend, not just one-panel detail.**
   Files to touch: `src/pages/LabExams.jsx`, `src/services/labExamService.js`, `supabase/migrations/20260325200000_create_lab_exams_v2.sql` if indexing or schema support is needed.
   Effort: 2-4 days.
   Dependency: 2.

9. **Render reference-range context more explicitly, including optimal vs abnormal if the data model supports it.**
   Files to touch: `src/pages/LabExams.jsx`, `src/services/labExamService.js`.
   Effort: 1-2 days.
   Dependency: 8.

10. **Replace the hardcoded preview markers with fetched exam data for the selected panel.**
    Files to touch: `src/pages/LabExams.jsx`.
    Effort: 1 day.
    Dependency: 3.

11. **Surface upload status and freshness metadata in the list and detail view.**
    Files to touch: `src/pages/LabExams.jsx`, `src/services/labExamService.js`.
    Effort: 4-8 hours.
    Dependency: 2.

12. **Add a mobile-first bottom sheet or stacked detail view so the split-pane design stays usable on small screens.**
    Files to touch: `src/pages/LabExams.jsx`.
    Effort: 1-2 days.
    Dependency: none.

Total effort: roughly 2-3 weeks if the team builds the review, trend, and localization pieces properly. The biggest quality jump will come from items 1, 2, 3, 6, and 8 because they change trust, continuity, and readability at the same time.

---

## What NOT to do

1. Do **not** let the surface stay as a polished preview with example markers while the real exam is buried behind upload.
2. Do **not** copy Function Health’s clinical confidence without adding Atlas-specific context about training, nutrition, and recovery.
3. Do **not** ship a free-form AI explanation layer before the extraction and review path is trustworthy.
4. Do **not** make manual entry the primary fallback unless Atlas is deliberately becoming a data-entry product.
5. Do **not** hide the original uploaded file after parsing; users need a durable source of truth.
6. Do **not** overbuild the view into a full medical chart before the basic panel/history loop is strong.

---

## The single highest-leverage thing

Add a review-before-save step that keeps the uploaded file, the extracted markers, and the final exam record visibly connected. That one change turns the surface from “upload a PDF and hope” into a trustworthy lab workflow, which is the real differentiator here. It also unlocks the rest of the product: once the data is verified and durable, trends, recommendations, sharing, and coach-facing views all become believable instead of decorative.

**File status:** Draft 1. To be revised after implementation against reality.
