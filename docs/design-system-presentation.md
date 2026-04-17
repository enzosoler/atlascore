# Atlas Core Design System v2.0
## Premium Fitness & Wellness Tracker UI/UX Redesign

---

## Design Philosophy

**Target Aesthetic:** Nike Training Club meets Whoop meets high-end fintech app
- Dark foundation with intentional color usage
- Typography that commands attention
- Every pixel considered, every interaction crafted
- Premium, sharp, modern aesthetic that users want to engage with daily

---

## Color Palette

### Primary Foundation
- **Base Black:** `#0A0A0F` - Near-black with subtle blue hue (not pure black)
- **Surface 1:** `#0D0F14` - Slightly lifted for depth
- **Surface 2:** `#111319` - Card backgrounds
- **Surface 3:** `#1A1D26` - Elevated surfaces

### Primary Accent - Electric Green
- **Main:** `#53E653` - Vibrant, motivating green for primary actions
- **Range:** `#144114` (dark) to `#8BF38B` (light)
- **Usage:** Primary buttons, progress indicators, success states

### Secondary Accent - Icy Blue
- **Main:** `#5599EA` - Cool, professional blue
- **Range:** `#143352` (dark) to `#8DCCF8` (light)  
- **Usage:** Secondary actions, information states, accents

### Semantic Colors
- **Success:** `#10B981` - Completion, achievements
- **Warning:** `#F59E0B` - Caution, attention needed
- **Danger:** `#EF4444` - Destructive actions, errors
- **Info:** `#3B82F6` - Neutral information

### Neutral Grays
- **Text Primary:** `#F9FAFB` - Main content
- **Text Secondary:** `#9CA3AF` - Supporting text
- **Text Muted:** `#6B7280` - Subtle text
- **Borders:** `rgba(255, 255, 255, 0.1)` - Subtle dividers

---

## Typography System

### Font Stack
- **Display:** `Inter` (Google Fonts) - Bold, geometric, modern
- **Body:** `Inter` - Clean, highly readable
- **Fallbacks:** SF Pro Display/Text, system fonts

### Type Scale (Strict Mathematical Progression)
- **Display XS:** 36px - Small headlines
- **Display SM:** 48px - Section headers  
- **Display MD:** 60px - Hero titles
- **Headline LG:** 30px - Large headlines
- **Headline MD:** 24px - Medium headlines
- **Headline SM:** 20px - Small headlines
- **Body LG:** 18px - Large body text
- **Body MD:** 16px - Standard body text
- **Body SM:** 14px - Small body text
- **Caption:** 12px - Meta information

### Font Weights
- **Light:** 300 - Elegant accents
- **Normal:** 400 - Body text
- **Medium:** 500 - Emphasis
- **Semibold:** 600 - Headlines
- **Bold:** 700 - Strong emphasis
- **Extrabold:** 800 - Display only

### Letter Spacing
- **Tight:** -0.025em - Premium headlines
- **Normal:** 0em - Body text
- **Wide:** 0.025em - Labels
- **Wider:** 0.05em - Small text
- **Widest:** 0.1em - Acronyms, badges

---

## Spacing System

### 4px Base Unit (No Magic Numbers)
- **1:** 4px - Micro spacing
- **2:** 8px - Small elements
- **3:** 12px - Compact spacing
- **4:** 16px - Standard spacing
- **5:** 20px - Comfortable spacing
- **6:** 24px - Section spacing
- **8:** 32px - Large spacing
- **10:** 40px - Component spacing
- **12:** 48px - Section breaks
- **16:** 64px - Page spacing
- **20:** 80px - Large sections
- **24:** 96px - Full sections
- **32:** 128px - Hero sections

---

## Border Radius

### Sharp Premium Style (Consistent)
- **XS:** 4px - Small elements
- **SM:** 8px - Buttons, inputs
- **MD:** 12px - Cards, panels
- **LG:** 16px - Large cards
- **XL:** 20px - Modals, sheets
- **2XL:** 24px - Hero elements
- **Full:** 9999px - Pills, avatars

---

## Elevation & Depth

### Subtle Shadows (No Heavy Drop Shadows)
- **XS:** `0 1px 2px rgba(0, 0, 0, 0.05)` - Minimal lift
- **SM:** `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)` - Cards
- **MD:** `0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)` - Elevated cards
- **LG:** `0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)` - Floating elements
- **XL:** `0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)` - Modals

### Accent Glows
- **Primary:** `0 0 20px rgba(83, 230, 83, 0.3)` - Success, achievements
- **Secondary:** `0 0 20px rgba(85, 153, 234, 0.3)` - Information
- **Danger:** `0 0 20px rgba(239, 68, 68, 0.3)` - Errors, warnings

---

## Motion & Animation

### Standard Easing Curve
- **Ease Out:** `cubic-bezier(0.16, 1, 0.3, 1)` - Natural, satisfying
- **Ease In:** `cubic-bezier(0.4, 0, 1, 1)` - Entering elements
- **Ease In Out:** `cubic-bezier(0.4, 0, 0.2, 1)` - Complex transitions

### Standard Durations
- **Fast:** 150ms - Micro interactions
- **Normal:** 250ms - Standard transitions
- **Slow:** 350ms - Complex animations
- **Slower:** 500ms - Page transitions

### Key Animations
- **Fade In:** Smooth appearance
- **Slide Up:** Elements entering from bottom
- **Slide Down:** Elements entering from top
- **Scale In:** Modal/popup appearance
- **Pulse:** Attention states
- **Shimmer:** Loading states

---

## Component Patterns

### Premium Cards
- **Background:** Gradient from surface 1 to surface 0
- **Border:** Subtle white border with 10% opacity
- **Padding:** 24px standard
- **Radius:** 16px consistent
- **Shadow:** Subtle elevation
- **Hover:** Lift 2px + enhanced shadow

### Primary Buttons
- **Height:** 44px (minimum touch target)
- **Background:** Electric green gradient
- **Text:** White, semibold, tight tracking
- **Shadow:** Subtle elevation + glow on hover
- **Active:** Scale to 98% for satisfying press

### Secondary Buttons
- **Background:** Surface level 2
- **Border:** Subtle white border
- **Hover:** Border becomes electric green
- **Text:** Primary white text

### Input Fields
- **Height:** 44px (consistent with buttons)
- **Background:** Surface level 2
- **Border:** Subtle white border
- **Focus:** Electric green border + subtle glow
- **Placeholder:** Muted gray text

### Progress Rings
- **Size:** 48px standard
- **Stroke:** 8px width
- **Background:** Subtle surface color
- **Fill:** Electric green with smooth animation
- **Usage:** Daily goals, workout completion

---

## Iconography

### Single Consistent Set
- **Library:** Lucide React (already in use)
- **Style:** Consistent stroke width (2px standard)
- **Size:** 16px, 20px, 24px standard sizes
- **Color:** Inherits text color or uses accent colors

---

## Screen-Specific Applications

### Dashboard/Home
- **Hero Area:** Large progress metrics with electric green
- **Today's Plan:** Prominent primary action card
- **Quick Actions:** Grid of secondary cards
- **Streak Counter:** Hero element with glow effect

### Workout Logging
- **Active Screen:** High contrast, minimal distractions
- **Set Counters:** Large, easily readable numbers
- **Rest Timers:** Prominent circular progress
- **Input Fields:** Large touch targets, numeric keyboards

### Progress & Stats
- **Charts:** Custom styled with electric green accents
- **PR Highlights:** Glow effects, celebratory animations
- **Timeline:** Visual rhythm with consistent spacing
- **Comparisons:** Side-by-side with subtle divider

### Progress Photos
- **Grid:** Masonry layout with consistent aspect ratios
- **Comparison Slider:** Smooth interaction, clear labels
- **Upload States:** Skeleton loading, not spinners
- **Empty States:** Encouraging, premium illustration

### Profile
- **Avatar:** Circular with electric green accent ring
- **Stats Summary:** Large KPI numbers with animations
- **Settings:** Logical grouping, minimal depth
- **Navigation:** Clear path, no dead ends

---

## Premium Details

### Micro-interactions
- **Press States:** All interactive elements scale to 98%
- **Haptic Feedback:** Key actions (completion, milestones)
- **Number Animations:** Stats count up when appearing
- **Progress Rings:** Smooth fill animations
- **Streak Display:** Hero element with pulse animation

### Loading States
- **Skeleton Screens:** Match layout of loading content
- **Shimmer Effect:** Subtle animation across skeletons
- **Progress Indicators:** Circular progress with brand color

### Empty States
- **Encouraging Copy:** Motivational, clear next steps
- **Premium Illustrations:** Custom, on-brand graphics
- **Clear CTAs:** Obvious primary actions

### Error States
- **Clear Messaging:** Human-readable explanations
- **Retry Actions:** Obvious recovery options
- **Graceful Degradation:** App remains functional

---

## Implementation Plan

### Phase 1: Design System Foundation
1. Apply CSS variables and base styles
2. Update typography and spacing
3. Implement color system
4. Add motion and animations

### Phase 2: Core Components
1. Redesign dashboard/home screen
2. Update navigation and layout
3. Implement premium cards and buttons
4. Add progress rings and metrics

### Phase 3: Feature Screens
1. Redesign workout logging flow
2. Update progress and stats screens
3. Fix and enhance progress photos
4. Redesign profile and settings

### Phase 4: Polish & Details
1. Add micro-interactions and haptics
2. Implement loading and empty states
3. Fix bugs and edge cases
4. Optimize performance

---

## Success Metrics

### User Engagement
- **Daily Open Rate:** Users want to open the app daily
- **Session Duration:** Increased time spent in app
- **Feature Adoption:** Higher usage of logging features

### Visual Quality
- **Premium Feel:** Users comment on improved aesthetics
- **Navigation Ease:** Reduced friction in core flows
- **Delight Factor:** Users enjoy interactions

### Technical Excellence
- **Performance:** Smooth 60fps animations
- **Accessibility:** WCAG AA compliance
- **Consistency:** Design system applied everywhere

---

## Next Steps

1. **Approve Design System:** Confirm color, typography, and spacing choices
2. **Begin Implementation:** Start with Phase 1 foundation
3. **Iterate:** Refine based on user feedback
4. **Launch:** Complete transformation of the app experience

---

**This design system will transform Atlas Core into a premium fitness tracker that users are proud to use and excited to open every day.**
