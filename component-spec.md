atlas.core — Component Spec (v1)
1. Rule of composition
Every screen must be built from a small, repeatable set of primitives.
Do not invent one-off layouts unless absolutely necessary.
Preferred structure:


ScreenShell


TopBar


HeroBlock


MetricCard


InsightCard


ActionCard


SectionBlock


ListRow


BottomNav



2. ScreenShell
Purpose:


base screen wrapper


enforces width, padding, spacing, background


Rules:


background: black


width: full mobile frame


horizontal padding: 20px


top padding: 16–24px


bottom padding: enough to clear nav


vertical gap between major sections: 24px


Never:


custom per-screen shell


inconsistent edge spacing



3. TopBar
Purpose:


top identity + contextual controls


Allowed contents:


back button OR brand


optional small context pill


optional overflow menu


Rules:


single horizontal row


left aligned title or brand


right aligned utilities


no giant headers floating without anchor


Use for:


Today


Body


Nutrition


Profile


Workout detail



4. HeroBlock
Purpose:


highest-priority state on the screen


Examples:


readiness


body signal


daily plan


system state


current trajectory


Structure:


eyebrow / micro-label


dominant number or headline


one sentence interpretation


optional ring / sparkline / status mark


Rules:


one hero per screen


must be the strongest visual object


must explain what matters now


must not feel decorative


Never:


stack multiple hero-like cards


use yellow background


use beige/light surface



5. MetricCard
Purpose:


concise data block


Examples:


calories


protein


body weight


plan match


PR count


Structure:


label


value


optional delta / status


Rules:


dark card only


small and dense


number dominant


muted label


optional accent only on key value or active state


Use in:


grids of 2–4


secondary to the hero



6. InsightCard
Purpose:


system interpretation layer


This is one of the most important components in atlas.core.
Examples:


“Sleep dipped mid-week”


“Recovery is limiting output”


“Protein consistency is improving”


Structure:


insight type (positive / warning / info)


short title


one explanatory paragraph


optional CTA


Rules:


always causal


should feel like system intelligence


not generic advice


concise, precise, directive


Never:


motivational fluff


coaching tone


vague recommendations



7. ActionCard
Purpose:


direct next step


Examples:


start workout


log first meal


add checkpoint


review protocol


Structure:


action title


short context


CTA or tap target


Rules:


must answer “what do I do next?”


can be checklist style


can include completion state


primary action may use accent



8. SectionBlock
Purpose:


groups related content


Structure:


section label/title


optional right-side action


content below


Rules:


clear separation from previous section


consistent top margin


same title treatment across screens


Examples:


Recent


Measurements


Today’s actions


Signal trend


Pending actions



9. ListRow
Purpose:


repeated items in feeds, history, settings, recent activity


Structure:


left: title + subtext


right: value / chevron / status


Rules:


consistent height


subtle separators


no random card/list mixing inside same section


no oversized paddings


Use for:


recent actions


workout history


settings rows


activity log


lab panels



10. BottomNav
Purpose:


global app spine


Tabs:


Today


Train


Eat


Body


You


Rules:


always visually consistent


active state = yellow only


inactive = muted


no blue


no style drift screen to screen



11. Special components
11.1 Sparkline / TrendStrip
Use for:


trajectory


body trend


readiness drift


composition history


Rules:


minimal


no heavy chart chrome


chart supports interpretation, not decoration


11.2 StatusPill
Use for:


stable


active


low readiness


latest


connected


Rules:


small


quiet


accent only when meaningful


11.3 Modal
Use for:


destructive confirmation


workout cancel


critical action confirmation


Rules:


dark only


centered


one strong primary + one secondary action


no blue confirm buttons



12. Canonical screen patterns
Pattern A — State screen
Used for:


Today


Body


Nutrition


Profile summary


Structure:


TopBar


HeroBlock


1–2 SectionBlocks


BottomNav


Pattern B — Flow step
Used for:


onboarding


setup


confirmation


Structure:


progress header


one question / one state


selectable cards or system reflection


pinned bottom CTA


Pattern C — Execution screen
Used for:


active workout


focus mode


live logging


Structure:


compact top context


active task block


repeated logging rows


pinned action footer


Pattern D — History/detail screen
Used for:


workout detail


body history


labs


recent logs


Structure:


TopBar


summary block


SectionBlocks with ListRows



13. Visual hierarchy rules
Each screen must have:


primary state


secondary interpretation


actionable next step


If a screen only displays data, it is incomplete.
If a screen only shows CTA without context, it is incomplete.

14. What Codex must never do


invent a new card style for one screen


create light/beige surfaces


create blue CTAs


mix centered and left-aligned blocks randomly


use multiple hero blocks competing on the same screen


make every section look equally important



15. Definition of a valid atlas.core screen
A screen is valid only if:


it uses approved primitives


it respects the design system


hierarchy is clear


the system intelligence layer is visible


the next action is obvious



16. Build order for any new screen
When generating a screen, always decide in this order:


What is the primary state?


What insight does the system provide?


What is the next action?


Which approved pattern fits?


Which primitives compose it?


Only then generate the JSX.
