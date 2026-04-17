# Progress Photos -- Competitive Teardown & Product Spec

**Date:** 2026-04-17
**Author:** Generated via codebase audit + web research
**Status:** DRAFT -- awaiting product decisions (see Open Questions)

---

## STEP 1 -- Competitive Teardown

### 1. MacroFactor

| Dimension | Detail |
|---|---|
| **Capture flow** | Camera or library via Body Metrics entry. Three pose selectors (front, side, back) embedded in the same screen where you log circumference measurements. |
| **Cropping UX** | Standard OS-level crop; no in-app guided crop. |
| **Storage / privacy** | Photos stored server-side. Privacy toggle prevents support staff from accessing photos. Encrypted in transit. Not shared externally. |
| **Comparison UX** | Gallery View shows two photos from different dates side-by-side. Gallery auto-themes its background/button colors to match the photo in view. Up to 6 body metrics overlaid on each photo card. |
| **Metadata shown** | Date, weight, body fat %, up to 6 circumference metrics selected by user. |
| **Share UX** | Auto-generated before/after comparison card. Save to device, send to friend, or share to social media. Branded card with metrics overlay. |
| **Frequency cadence** | Tied to Body Metrics entries; no explicit weekly prompt. Users add photos whenever they create a body metrics checkpoint. |

**Sources:**
- [MacroFactor Body Metrics announcement](https://macrofactor.com/body-metrics/)
- [MacroFactor Progress Photos page](https://macrofactor.com/progress-photos-and-body-measurement-tracker/)
- [How to create and share before-and-after photos](https://help.macrofactorapp.com/en/articles/351-how-to-create-and-share-before-and-after-photos)
- [MacroFactor Monthly -- May 2023](https://macrofactorapp.com/mm-may-2023/)

### 2. Happy Scale

| Dimension | Detail |
|---|---|
| **Capture flow** | N/A -- Happy Scale is primarily a weight-trend smoothing app. No dedicated progress photo feature found in current version. |
| **Cropping UX** | N/A |
| **Storage / privacy** | N/A |
| **Comparison UX** | Excellent weight-trend charts with 7/30/90/all-time moving averages, milestone highlights, and breakthrough-day badges. No photo comparison. |
| **Metadata shown** | Weight trend, goal progress %, predicted date to goal. |
| **Share UX** | Weight chart screenshots shareable via standard iOS share sheet. |
| **Frequency cadence** | Daily weigh-in nudge; no photo cadence. |

**Key takeaway:** Happy Scale's strength is its weight-trend smoothing math and motivational pacing (mini-goals). Atlas already has weight trend in Progress.jsx. Happy Scale proves photos are not table-stakes for weight-focused apps, but Atlas targets physique athletes who need them.

**Sources:**
- [Happy Scale official site](https://happyscale.com/)
- [Happy Scale App Store](https://apps.apple.com/us/app/happy-scale/id532430574)

### 3. BodySpace (Bodybuilding.com)

| Dimension | Detail |
|---|---|
| **Capture flow** | Upload from library to profile. Profile Picture, Gallery Photos, and Progress Pics as separate categories. No in-app camera guidance. |
| **Cropping UX** | Basic crop on upload; no pose guides. |
| **Storage / privacy** | Server-side storage. Profile can be set to private. Photos are primarily social -- designed to be shared with the BodySpace community. |
| **Comparison UX** | No dedicated slider or side-by-side tool. Photos displayed in a gallery grid on profile. Users manually scroll to compare. |
| **Metadata shown** | Date, optional captions. No body metrics overlay. |
| **Share UX** | Community-centric: photos posted to feed, other users can like/comment. No branded before/after card generator. |
| **Frequency cadence** | No structured cadence. Social motivation drives posting frequency. |

**Key takeaway:** BodySpace is a cautionary example -- social-first without dedicated comparison tools. The community aspect drives engagement but the tooling is weak. Atlas should avoid being purely social and focus on comparison quality.

**Sources:**
- [BodySpace official page](https://shop.bodybuilding.com/pages/bodyspace)
- [Bodybuilding.com help -- adding pictures](https://www.bodybuilding.com/help/pictures.htm)

### 4. Cronometer

| Dimension | Detail |
|---|---|
| **Capture flow** | No dedicated body progress photos feature. Cronometer focuses on nutrition tracking with AI photo food logging (Gold-only). Biometrics tracked numerically only. |
| **Cropping UX** | N/A (food photo AI crop only). |
| **Storage / privacy** | N/A for body photos. |
| **Comparison UX** | Excellent biometric charts for weight, body fat, custom health markers. No photo comparison. |
| **Metadata shown** | Detailed micronutrient and biometric data. |
| **Share UX** | Export reports; no photo sharing. |
| **Frequency cadence** | Daily nutrition logging; no photo cadence. |

**Key takeaway:** Cronometer proves that even best-in-class nutrition apps can skip progress photos entirely. Their strength is data density. For Atlas, this means progress photos are a differentiator versus nutrition-only apps.

**Sources:**
- [Cronometer Features](https://cronometer.com/features/index.html)
- [Cronometer Gold](https://cronometer.com/gold/index.html)

### 5. Cal AI / Fastic

**Cal AI:**
| Dimension | Detail |
|---|---|
| **Capture flow** | Added progress photos in late 2025. Upload from camera/library. |
| **Comparison UX** | Visual timeline tracking with graphs and milestone celebrations. Details limited -- Cal AI was acquired by MyFitnessPal (March 2026) and removed from App Store (April 2026). |
| **Metadata shown** | BMI, body fat, weight alongside photos. |
| **Frequency cadence** | Tied to streak system. |

**Fastic:**
| Dimension | Detail |
|---|---|
| **Capture flow** | No dedicated body progress photos feature. Fastic focuses on intermittent fasting timers and food scanning. |
| **Comparison UX** | Body Status Tracking shows fasting phases (ketosis, fat burning) but no photo comparison. |
| **Frequency cadence** | Fasting-timer driven; no photo cadence. |

**Key takeaway:** Cal AI added photos late and was acquired before maturing the feature. Fastic skips photos entirely. The market has a gap for well-executed progress photos in all-in-one fitness apps.

**Sources:**
- [Cal AI official](https://trackcalai.com/)
- [Fastic official](https://fastic.com/en)
- [Best progress photo apps 2026 -- LocalOneLabs](https://localonelabs.com/pages/blog/best-fitness-progress-photo-apps)

### Best-in-class features from dedicated photo apps (GainFrame, PhotoJourney, Metamorph)

These are not direct competitors but define the ceiling:
- **Ghost overlay / pose guide**: Faint overlay of previous photo while taking new one (PhotoJourney)
- **AI body analysis**: Body fat estimation, muscle definition scoring per segment (GainFrame)
- **Automatic alignment**: ML shoulder/torso/hip detection to normalize scale and position (GainFrame)
- **Timelapse generation**: Stitch photos into video/GIF for social sharing (PhotoJourney, Metamorph)
- **Consistency checking**: Warns if lighting, clothing, or pose differs from baseline (Perfect Match Progress)
- **Comparison modes**: GIF, Slider, Lapse, Collage, up to 20-photo grid (various)

**Sources:**
- [GainFrame](https://gainframe.app/)
- [Best progress photo apps -- GainFrame blog](https://gainframe.app/blog/best-progress-photo-apps/)
- [5 Best Progress Photo Apps for iPhone 2026](https://localonelabs.com/pages/blog/best-fitness-progress-photo-apps)

---

## STEP 2 -- Atlas Core Current Implementation Audit

### File inventory

| File | Purpose |
|---|---|
| `src/pages/ProgressPhotos.jsx` (894 lines) | Main page. Checkpoint-based model: user creates a date checkpoint, then fills 4 pose slots (front/side/back/free pose). Includes: EmptyState, AIInsights (mock), ConsistencyIndicator, ComparisonSlider, Timeline, CheckpointCard, GuideSection, DateWheelPicker, NewCheckpointModal. |
| `src/components/progress/ProgressPhotoCarousel.jsx` (192 lines) | Standalone carousel component used in coach/nutritionist profile views. Sorts by date, shows navigation dots, timeline thumbnails. |
| `src/components/shared/ImageCropper.jsx` (134 lines) | Modal cropper using `react-easy-crop`. Supports pan, zoom, rotate. Fixed 3:4 aspect ratio. Outputs JPEG at 0.92 quality. |
| `src/services/bodyProgressService.js` (472 lines) | Service layer. CRUD for `progress_photos` table. Upload to `progress-photos` Supabase Storage bucket. Signed URL generation (1hr TTL). Fallback to `profiles.profile_data.progress_photos` array if table doesn't exist. |
| `src/lib/entitlements.js` (line 48-53) | `progress_photos` feature: minPlan `pro`, free limit 5 checkpoints, pro unlimited. |
| `src/components/entitlements/PaywallTrigger.jsx` | Contextual paywall shown after first photo upload (trigger: `photo`). Fires once per session. |
| `src/pages/Progress.jsx` | Analytics dashboard. Shows photo thumbnails in a horizontal scroll, links to ProgressPhotos page. |
| `src/components/body/BodyCheckinSheet.jsx` | Quick check-in sheet. "Progress photos" menu item navigates to `/progress-photos`. No inline photo capture. |
| `src/pages/guides/ProgressPhotosGuide.jsx` | Help article. Describes features that partially don't exist yet (overlay comparison, auto-alignment, face-blur export, measurement overlay on photos, timelapse). |
| `scripts/sql/supabase_body_progress.sql` | Reference SQL. Defines `progress_photos` table and storage bucket policies (bucket policies commented out). |
| `supabase/migrations/20260331200000_...sql` | Actual migration. Creates `progress_photos` with columns: id, user_id, photo_url, date, category, notes, created_at. |
| `supabase/migrations/20260401030000_...sql` | Security fix. Ensures RLS enabled on progress_photos, adds per-operation policies + admin policy. |

### Database schema (actual, from migration)

```sql
progress_photos (
  id          uuid PK DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL FK auth.users(id) ON DELETE CASCADE,
  photo_url   text NOT NULL,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  category    text DEFAULT 'front',   -- no CHECK constraint in migration
  notes       text,                   -- exists in migration but NOT used in UI
  created_at  timestamptz NOT NULL DEFAULT now()
)
```

**Note:** The reference SQL in `scripts/sql/` has a stricter schema with `CHECK (category IN ('front','side','back','pose'))` but the actual migration does not enforce this constraint. The `notes` column exists in the DB but is never written to or displayed by the UI.

### Storage architecture

- **Bucket:** `progress-photos` (private, not public)
- **Path pattern:** `{user_id}/{timestamp}-{sanitized-filename}.{ext}`
- **URL format:** Internal references stored as `supabase://progress-photos/{path}`, resolved to signed URLs at read time (1-hour TTL)
- **Upload:** Direct Supabase Storage upload, no upsert, content type from file
- **No thumbnails generated** -- full-size images served everywhere
- **No image compression** -- whatever the user uploads is stored as-is (ImageCropper outputs JPEG 0.92 but raw library picks bypass this)
- **Storage bucket RLS policies are commented out** in the reference SQL. Unclear if they are applied in production.

### Entitlement gating

- Feature key: `progress_photos`
- `minPlan: 'pro'`
- Free users: 5 checkpoint limit (enforced client-side via `planCode === 'free' && allDates.length >= FREE_PHOTO_LIMIT`)
- Pro+: unlimited
- PaywallTrigger fires after first photo upload on free plan
- Route is wrapped in `EntitlementGate` in App.jsx (line 486)

### Comparison UI (what actually exists)

- **ComparisonSlider** (lines 271-325): Drag-to-reveal before/after. Uses CSS `clipPath`. Takes earliest vs latest front-pose photo. Touch + mouse supported. Labels show month/day.
- **Timeline** (lines 328-369): Horizontal scroll of checkpoint thumbnails with date labels and index numbers.
- **No side-by-side grid view**
- **No timelapse/GIF generation**
- **No pose filter** on comparison (always compares front pose of first checkpoint vs front pose of latest)
- **No overlay mode**

### AI Insights (what actually exists)

- `MOCK_INSIGHTS` array (line 58-63): Hardcoded mock data. Always shows same 4 insights regardless of actual photos.
- Not connected to any AI model or image analysis.
- Shows days between latest two checkpoints.

### Identified bugs and issues

1. **No EXIF rotation handling**: `ImageCropper.jsx` uses `react-easy-crop` which handles orientation in most cases, but photos picked from library that bypass the cropper (there is no bypass path currently -- all go through cropper) would have no EXIF correction. The cropper itself does not explicitly strip EXIF from output.
2. **Missing error state for storage bucket**: If the `progress-photos` bucket doesn't exist or has no policies, `uploadToSupabaseStorage` throws a generic error. No specific user-facing message for storage misconfiguration.
3. **Signed URL expiry**: URLs expire after 1 hour. If user leaves tab open > 1 hour, images break silently. No refresh mechanism.
4. **No image size validation**: No max file size check before upload. Users can upload 20MB+ HEIC files.
5. **Client-side-only free limit**: The 5-checkpoint limit is enforced only in the React component (`isAtLimit`). No server-side enforcement via RLS or edge function.
6. **Storage bucket policies commented out**: In `scripts/sql/supabase_body_progress.sql`, the bucket policies are commented out. If not applied separately, any authenticated user could potentially read/write to any path in the bucket.
7. **Guide page describes features that don't exist**: `ProgressPhotosGuide.jsx` mentions overlay comparison, auto-alignment, face-blur, measurement overlay, timelapse video, coach feedback on photos -- none of these are implemented.
8. **`notes` column unused**: Migration creates `notes` column but UI never writes to it.
9. **No `category` CHECK constraint in production migration**: Category column has no enum constraint, allowing arbitrary strings.
10. **ComparisonSlider only compares front pose**: `comparisonData` (line 754-764) always takes `photosByDate(earliest)[0]` and `photosByDate(latest)[0]`, which is the front pose. No way to compare side or back poses.

---

## STEP 3 -- Gap Analysis

| Dimension | Best-in-class (MacroFactor / GainFrame) | Atlas today | Gap | Priority |
|---|---|---|---|---|
| **Pose guide / ghost overlay** | Ghost overlay of previous photo on camera viewfinder (PhotoJourney, GainFrame) | None. Text hints only ("Arms to sides, looking at camera") | No visual guide for consistent photos | P1 |
| **Camera capture** | In-app camera with guided frame | File input only (`<input type="file" accept="image/*">`) -- defers to OS camera/library | Works but no framing guidance | P2 |
| **Cropping** | Standard crop | react-easy-crop with 3:4 ratio, zoom, rotate | Adequate. Missing: auto-crop to body region | P2 |
| **EXIF stripping** | Not documented in competitors, but standard best practice | Not implemented. EXIF (GPS, device info) preserved in stored files | Privacy risk for shared photos | P1 |
| **Image compression / thumbnails** | Implicit (apps control upload pipeline) | None. Full-size images stored and served everywhere. No thumbnails. | Slow gallery load, excess storage cost | P1 |
| **Storage bucket RLS** | Private per-user | Bucket policies commented out in reference SQL; table-level RLS is solid | Potential cross-user access at storage level | P0 |
| **Free-tier enforcement** | Server-side limits | Client-side only (`isAtLimit` in React) | Bypassable via API calls | P1 |
| **Metadata fields** | Weight, body fat, 6+ circumference metrics per photo (MacroFactor) | date, category, photo_url, notes (notes unused). No weight/bf/measurements link. | No body data context alongside photos | P1 |
| **Comparison: slider** | Before/after with metrics overlay (MacroFactor) | Basic slider works. No metrics overlay. Only compares front pose. | Needs pose filter + metrics | P1 |
| **Comparison: side-by-side** | Gallery view with two dates + metrics (MacroFactor) | Not implemented | Missing feature | P1 |
| **Comparison: timelapse** | GIF/video generation (PhotoJourney, Metamorph) | Not implemented | Nice-to-have for sharing | P2 |
| **AI body analysis** | Body fat estimation, muscle definition scoring (GainFrame) | Mock hardcoded insights. Not connected to any AI. | Feature described in UI but fake | P1 |
| **Share card** | Auto-generated branded before/after card (MacroFactor) | Not implemented for photos. Streak share cards exist separately. | Missing feature | P1 |
| **Face blur** | Privacy-blur on shared images (described in Atlas guide, exists in some apps) | Not implemented (Guide claims it exists) | Missing feature, guide is misleading | P2 |
| **Weekly photo prompt** | Tied to check-in (MacroFactor) or streak | ConsistencyIndicator shows days-since-last but no push notification or check-in integration | Passive only, no active prompt | P2 |
| **Check-in integration** | Photos captured as part of body metrics entry (MacroFactor) | BodyCheckinSheet links to separate page. No inline capture. | Friction: user leaves check-in flow | P1 |
| **Coach visibility** | Nutritionist can view if permission granted | `NutritionistClientProfile.jsx` checks `can_view_progress_photos` and shows carousel | Exists but basic -- no coach annotation | P2 |
| **Signed URL refresh** | N/A (native apps use direct auth) | 1-hour TTL, no auto-refresh | Broken images after 1hr in open tab | P1 |
| **Guide accuracy** | N/A | Guide describes 6+ unimplemented features | Misleading users | P0 |

---

## STEP 4 -- Proposed Spec

### 4.1 Capture

- **Camera vs library**: Keep current `<input type="file" accept="image/*" capture>` which lets OS handle camera/library choice. Add `capture="environment"` attribute on mobile to default to camera.
- **Pose overlay / guide**: When in camera mode, show a semi-transparent silhouette outline matching the selected pose (front/side/back). Source outlines from a static SVG set.
- **Ghost overlay (P2)**: After first checkpoint, show faint overlay of the user's previous photo for that pose while capturing a new one. Requires native camera integration (Capacitor Camera plugin) -- not achievable with `<input type="file">`.
- **Consistency aids**: Before saving, show a checklist: "Same time of day? Same lighting? Same clothing? Same distance?" as dismissable tips (show for first 3 checkpoints, then hide).

### 4.2 Crop + Privacy

- **Aspect ratio**: Keep 3:4 (portrait physique standard). Allow switching to 1:1 for social crop.
- **EXIF stripping**: Strip all EXIF metadata (GPS, device, datetime) on the client before upload. Use a lightweight library like `exif-js` or canvas redraw (current `getCroppedBlob` in ImageCropper already redraws to canvas, which strips EXIF -- but only for cropped images).
- **Face blur on share**: When generating share cards, offer a toggle to apply Gaussian blur to the top 20% of the image. Client-side canvas filter.
- **File size limit**: Reject files > 10MB before upload. Show clear error.

### 4.3 Storage

- **Bucket structure**: `progress-photos/{user_id}/{date}/{category}-{timestamp}.jpg`
  - Enables easy per-user cleanup and date-based organization
- **RLS**: Apply the commented-out storage policies. Each user can only read/write within their `{user_id}/` prefix. Verify with integration test.
- **Image size targets**:
  - Full image: max 1200px on longest edge, JPEG 85% quality
  - Thumbnail: 300px on longest edge, JPEG 70% quality
  - Resize on client before upload (canvas downscale)
- **Thumbnail generation**: Generate thumbnail on upload (client-side). Store as `{path}-thumb.jpg`. Use thumbnails in Timeline and gallery grid; full images only in detail view and comparison slider.
- **Signed URL TTL**: Increase to 24 hours. Add a `useEffect` in ProgressPhotos that refreshes URLs when they are within 10 minutes of expiry, or on tab focus.

### 4.4 Metadata

- **Fields to add to `progress_photos` table**:
  - `weight_kg numeric(6,2)` -- auto-filled from closest measurement entry
  - `body_fat_percent numeric(5,2)` -- auto-filled from closest measurement entry
  - `notes text` -- already exists, wire up UI
  - `thumbnail_url text` -- for thumbnail reference
- **Auto-fill from check-in**: When creating a checkpoint, query `measurements` table for same-date entry. If found, pre-populate weight and body_fat. User can override.
- **Display**: Show weight and body_fat badges on each checkpoint card and in comparison views.

### 4.5 Gallery + Compare

- **Timeline**: Keep current horizontal scroll. Add pose filter tabs (All / Front / Side / Back).
- **Before/after slider**: Keep current implementation. Add:
  - Pose selector (front/side/back/free) -- currently hardcoded to front
  - Date picker for before and after (currently hardcoded to earliest vs latest)
  - Metrics overlay badge showing weight delta
- **Side-by-side grid**: New view mode. 2-up layout with matching poses from two selected dates. Show metrics below each photo.
- **Full gallery grid**: All photos in a scrollable grid, filterable by pose and date range.
- **Timelapse (P2)**: Generate animated GIF or video from all photos of one pose, oldest to newest. Use `gif.js` or `canvas` frame capture.

### 4.6 Share

- **Card design**: Reuse the `html2canvas` pattern from `ShareableProofCards.jsx` and `ShareFlow.jsx`. Card layout:
  - Two photos side-by-side (before / after)
  - Date labels below each
  - Weight delta badge
  - Time span ("12 weeks")
  - Atlas Core watermark (subtle, bottom corner)
- **Face blur toggle**: On the share card generation screen, toggle to blur faces before rendering.
- **Privacy**: Share card is generated client-side as a PNG. No server involvement. EXIF stripped.
- **Export options**: Save to device, share via Web Share API (same pattern as `ShareFlow.jsx`).

### 4.7 Cadence

- **Weekly prompt**: Add a "Progress photo" step to the `WeeklyCheckinModal`. If user hasn't taken photos in > 7 days, show a soft prompt: "Want to take a progress photo?" with a camera button that opens inline capture.
- **Check-in integration**: In `BodyCheckinSheet.jsx`, instead of navigating away to `/progress-photos`, open a lightweight inline photo capture sheet (just the 4 pose slots with upload buttons). Save to same backend.
- **Push notification (P2, requires native)**: Weekly push via Capacitor Local Notifications: "Time for your weekly checkpoint. Consistency builds the timeline."

---

## STEP 5 -- Open Questions

1. **Should photos be required as part of the body check-in flow, or remain a separate optional page?** Making it part of check-in increases adoption but adds friction to quick weight logs.

2. **What is the actual state of storage bucket policies in production?** The reference SQL has them commented out. Need to verify in the Supabase dashboard whether per-user folder isolation is enforced at the storage level.

3. **Should the free tier limit be on checkpoints (current: 5 dates) or total photos (e.g., 12 photos = 3 full checkpoints)?** MacroFactor doesn't have a free tier. Current implementation limits by checkpoint count.

4. **Should we invest in a Capacitor Camera plugin for native camera integration?** This unlocks ghost overlay (showing previous photo while capturing) and better EXIF control, but adds native build complexity. The current `<input type="file">` approach works but limits UX.

5. **Should AI insights be real or should the mock section be removed?** Currently showing hardcoded mock insights is misleading. Options: (a) remove until real AI is ready, (b) integrate with an image analysis API (cost implications), (c) use rule-based heuristics from weight/measurement deltas (no vision AI needed).

6. **What should the coach/nutritionist experience be?** Currently coaches can view photos if permission is granted. Should they be able to annotate, request specific poses, or provide feedback directly on photos?

7. **Should the ProgressPhotosGuide.jsx be rewritten to reflect actual features?** It currently describes 6+ unimplemented features (overlay comparison, auto-alignment, face-blur, measurement overlay, timelapse, coach feedback). This creates a trust gap.

8. **Should we enforce the `category` CHECK constraint in the production migration?** The reference SQL has it but the actual migration does not. Adding it retroactively requires verifying no invalid data exists.

9. **What is the target image storage cost budget?** Currently no compression or thumbnails means storage grows fast. A user taking 4 photos weekly at ~3MB each = ~600MB/year. With compression to ~200KB each, that drops to ~40MB/year.

10. **Should progress photos be exportable in the PDF/CSV data export?** The `DataExport.jsx` and `ClientPdfExport.jsx` files exist but it's unclear if photos are included in exports.

11. **Should timelapse/GIF generation be client-side or server-side?** Client-side is simpler (no infra) but limited by device performance. Server-side enables higher quality but requires a processing pipeline.

12. **How should signed URL expiry be handled for offline/PWA scenarios?** If the app is cached offline, 1-hour signed URLs will break. Consider caching images in a service worker with auto-refresh.

---

## Appendix: Key File Paths

| Path | Description |
|---|---|
| `src/pages/ProgressPhotos.jsx` | Main progress photos page |
| `src/components/progress/ProgressPhotoCarousel.jsx` | Carousel component (coach views) |
| `src/components/shared/ImageCropper.jsx` | Crop modal (react-easy-crop) |
| `src/services/bodyProgressService.js` | CRUD + storage service |
| `src/lib/entitlements.js` | Feature gate definitions |
| `src/components/entitlements/PaywallTrigger.jsx` | Post-upload paywall |
| `src/pages/Progress.jsx` | Analytics dashboard (photo thumbnails) |
| `src/components/body/BodyCheckinSheet.jsx` | Check-in sheet (links to photos) |
| `src/pages/guides/ProgressPhotosGuide.jsx` | Help article (describes unbuilt features) |
| `src/components/social/ShareableProofCards.jsx` | Share card pattern to reuse |
| `src/components/social/ShareFlow.jsx` | Share flow pattern to reuse |
| `scripts/sql/supabase_body_progress.sql` | Reference SQL schema |
| `supabase/migrations/20260331200000_ensure_daily_checkins_and_ai_config.sql` | Actual production migration |
| `supabase/migrations/20260401030000_fix_security_rls_and_view.sql` | Security RLS fix |
| `src/pages/nutritionist/NutritionistClientProfile.jsx` | Coach photo visibility |
| `src/components/today/WeeklyCheckinModal.jsx` | Weekly check-in (no photo step) |
