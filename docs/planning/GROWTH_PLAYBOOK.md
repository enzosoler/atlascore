# Atlas Core — Growth Playbook

> Based on the Loic/Starter Story playbook (transcript 1) and the Resum/$3M MRR app teardown (transcript 2).

---

## 1. Core Viral Feature — Pick One and Lead With It

Both transcripts agree on this: start with ONE feature that is inherently shareable, solves a real pain, and hooks users emotionally. Build everything else later.

**Atlas Core's core viral feature recommendation: Progress Photos + AI Insights**

Here's the pitch: athletes already take progress photos, but they're scattered across camera rolls and have no context. Atlas Core connects progress photos with body measurements, nutrition data, and AI analysis in one timeline. The result is something nobody else offers in the Brazilian market at this price point — a full-body transformation story told by data.

**Why this feature is viral-ready:**
- It's visual. Creators on Instagram and TikTok can show a before/after transformation with the Atlas Core interface visible, naturally weaving the product into the content.
- It's emotional. Body transformation is one of the most engaging content categories on social media.
- It creates a "wow moment" fast — the first time a user sees their progress photo next to their weight/BF% chart, they feel the app working.
- It's shareable. Users will screenshot and post their dashboards.

**What to de-emphasize in marketing (not in product):**
The app already has excellent depth — workouts, lab exams, clinician access, AI coach. But leading marketing with all of these at once dilutes the message. Pick Progress Photos + AI Insights as the hook that gets users in the door, then let the depth retain them.

---

## 2. Creator Distribution Playbook (Loic's System)

More than 60% of new customers for successful SaaS apps come from YouTube. The model is: pay creators to demonstrate the product, validate organic content, then scale with paid ads.

### Step 1 — Find the Right Creators

Search YouTube and TikTok for keywords your audience already consumes:
- "treino em casa", "dieta cutting", "antes e depois academia"
- "montar plano de treino", "exame de sangue atleta"
- "rotina de atleta natural", "fisiculturismo natural Brasil"
- Coach/nutritionist channels that show client transformations

Look at what your competitors (Treinow, MyFitnessPal PT accounts, personal trainers) are already doing and who they sponsor.

**Two metrics to filter creators:**
1. Engagement rate = views ÷ followers. Aim for 10%+.
2. Minimum 100 comments per video (shows real community, not passive views).
3. Did they promote any brand 3+ times? If yes, that brand made money with them.

### Step 2 — Outreach System

Run a 7-email sequence per creator with different angles:
- Email 1: Personal intro, why you chose them specifically.
- Email 2: Show the product and the transformation angle.
- Email 3: Social proof — another creator's results or user testimonials.
- Email 4: Concrete offer with commission breakdown.
- Email 5: Urgency — limited partnership spots.
- Emails 6–7: Follow-up variations.

Also blast on Instagram DM and Twitter/X.

### Step 3 — Deal Structure

Always open 30% below your real budget. Offer two packages:

**Package A (lower risk for Atlas Core):** Higher upfront fee, lower commission per conversion. Good for large creators where you want predictable exposure.

**Package B (higher risk, higher upside):** Low or no upfront, high commission. Good for micro-creators who believe in the product and want to earn from performance.

Start with a single test video. Check conversion rate after 30 days. If break-even or better, negotiate a 3–4 video package with a per-video discount.

### Step 4 — Creator as Co-Founder (Advanced)

For the 1–2 creators who perform extremely well, consider an equity conversation. Benefits per Loic:
1. **De-risks distribution** — a creator co-founder guarantees a minimum of ~10K MRR from day one via their audience.
2. **Product insights** — they're using the app live with their audience. Their community feedback becomes your product roadmap.
3. **Marketing iteration loop** — they can ship script variations, pricing tests, and funnel experiments fast, for free, because they're invested.

The ideal Atlas Core creator co-founder is a Brazilian personal trainer or nutritionist with 50K–500K YouTube subscribers who coaches clients online. They would use Atlas Core live in their workflow and show their audience exactly how they track client progress.

---

## 3. Content Strategy — From Organic to Paid

### The Flywheel (Resum playbook)

1. **Recruit creators** — micro (10K–100K) and mid-size (100K–500K) in the fitness/health space.
2. **Post organic content on TikTok + Instagram** — short videos showing progress photos, AI insights, lab exam imports, or a "day in the life of an athlete using Atlas Core."
3. **Validate winners** — content that gets 100K+ views or strong engagement.
4. **Upload winners to paid ads** — take the organic hits and run them as Facebook/Instagram ads. This is exactly what Resum does with 520+ active ads.
5. **Scale to international** — once the model works in Brazil, repeat in PT/MZ or Spanish-speaking LatAm.

### Content angles that work for Atlas Core

- "Eu trackeio tudo no mesmo app" — showing the full dashboard in a real athlete's routine.
- "Meu coach agora usa esse app para acompanhar meus exames e treino" — coach + athlete pair using the platform.
- "Transformação 90 dias — meus dados reais" — before/after progress photos inside the app's timeline.
- "O Atlas AI deu essa análise sobre meu exame de sangue" — AI feature demo, educates while selling.

### Business page presence

Maintain an official @atlascore.app profile on TikTok and Instagram even if views are modest. Per the Resum teardown, this builds social proof when users who saw a creator's video come to check out the product. They see a live, active brand page and it validates their interest.

---

## 4. Onboarding & Paywall Conversion (Implemented)

The following have been implemented in `src/pages/Onboarding.jsx`:

### "Where did you hear about us?" (Step 1)
Collects the acquisition channel (Instagram/TikTok, YouTube, Google, Recommendation, Coach/Nutritionist, Other) and stores it in Supabase user metadata. This data feeds retargeting campaigns — you know which channel drove each user, so you can double down on what works and cut what doesn't.

### Paywall Priming Screen (after Step 3, before setup)
Directly modeled on the Resum app teardown. The screen:
- Explains the 7-day free trial timeline (Today → Day 5 reminder → Day 7 end)
- Highlights the annual plan savings to prime users for LTV conversion
- Shows social proof (rating + quote)
- Has a clear "Start free trial" CTA with "no credit card" reassurance

This is not the actual paywall — it's a trust-building screen that runs before the setup generation animation. It educates users about the trial *before* they see the app, making them far more likely to convert at the end of their trial.

### Annual Plan Push
The priming screen surfaces the annual plan's discount (up to 40%) before users even enter the app. Per the Resum playbook, pushing annual plans early maximizes LTV and gives you the budget to fund paid ads.

---

## 5. Metrics to Track (Milestone-Based Decisions)

Per Loic's advice: don't get emotionally attached. Use simple milestones as the only source of truth.

| Milestone | Target | Action if not hit |
|-----------|--------|-------------------|
| 7-day trial-to-paid conversion | >15% | Revise paywall priming, test pricing |
| First creator video | Break-even in 30 days | Do not extend partnership |
| 3-video creator package | 2× ROAS | Scale to 10+ creators |
| MRR from creator channel | >60% of new MRR | Continue doubling creator budget |
| Organic content viral hit | 100K+ views | Upload to paid ads immediately |

---

## 6. If Starting Over — The Minimum Viable Launch

Per both transcripts, the right sequence is:

1. **Validate the hook** — post 5–10 short videos showing the progress photo + AI insight feature. Measure saves and DMs asking "what app is this?"
2. **Recruit one creator co-founder** — a fitness coach with 50K+ YouTube subscribers in Brazil who believes in the product.
3. **Launch the paywall-optimized onboarding** — the one now implemented in this repo.
4. **Run one test creator video** — observe 30-day conversion. If break-even, negotiate a 3-video package.
5. **Take the best video and run it as a paid ad** — start at R$50/day, scale on ROAS.
6. **Reinvest into product** — use revenue to build the features that your paying users actually ask for, not the ones that seem cool.
