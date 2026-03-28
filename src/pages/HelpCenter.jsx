import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Dumbbell, Sparkles, Target, Brain, Apple, LineChart, Settings, Zap, Search, HelpCircle, Users, CreditCard } from 'lucide-react';
import GuideCard from '@/components/content/GuideCard';
import PublicSiteShell, { PublicSectionHeader } from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

// Help Center Search Component
function HelpSearch({ guides, onSelect }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredGuides = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return guides.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.excerpt.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 5);
  }, [query, guides]);

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
        <Input
          type="text"
          placeholder="Search guides, features, logging, plans, billing..."
          className="h-14 rounded-2xl border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] pl-12 pr-4 text-[15px] shadow-[var(--shadow-sm)] transition-all focus:border-[hsl(var(--brand)/0.4)] focus:shadow-[var(--shadow-md)]"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
      </div>
      {isOpen && filteredGuides.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] shadow-[var(--shadow-lg)]">
          {filteredGuides.map((guide) => (
            <button
              key={guide.href}
              onClick={() => {
                onSelect(guide.href);
                setQuery('');
                setIsOpen(false);
              }}
              className="flex w-full items-start gap-3 border-b border-[hsl(var(--border)/0.5)] p-4 text-left transition-colors hover:bg-[hsl(var(--fill)/0.5)] last:border-b-0"
            >
              {guide.icon && <guide.icon className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand))]" />}
              <div className="flex-1">
                <p className="text-[14px] font-medium text-[hsl(var(--fg))]">{guide.title}</p>
                <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))] line-clamp-1">{guide.excerpt}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px]">{guide.category}</Badge>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.trim() && filteredGuides.length === 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-lg)]">
          <p className="text-center text-[13px] text-[hsl(var(--fg-2))]">No guides found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

// Badge component for guide metadata
function GuideMeta({ readingTime, badge }) {
  return (
    <div className="flex items-center gap-2">
      {badge && (
        <Badge
          variant={badge === 'AI' ? 'default' : badge === 'New' ? 'success' : 'secondary'}
          className="text-[10px]"
        >
          {badge}
        </Badge>
      )}
      {readingTime && (
        <span className="text-[11px] text-[hsl(var(--fg-3))]">{readingTime} min read</span>
      )}
    </div>
  );
}

// Enhanced Guide Card with badges
function EnhancedGuideCard({ guide }) {
  return (
    <Link
      to={guide.href}
      className="group atlas-card flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--brand)/0.24)] hover:shadow-[var(--shadow-md)] lg:p-6"
    >
      <div className="flex items-start gap-4">
        {guide.icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)] transition-colors group-hover:bg-[hsl(var(--card))]">
            <guide.icon className="h-5 w-5" strokeWidth={1.7} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <GuideMeta readingTime={guide.readingTime} badge={guide.badge} />
          <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">
            {guide.title}
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{guide.excerpt}</p>
        </div>
      </div>
    </Link>
  );
}

// All guides data organized by category
const ALL_GUIDES = [
  // Getting Started
  {
    title: 'How to create your account and start tracking',
    excerpt: 'Complete onboarding, set up your profile, and understand how atlas.core organizes your routine from day one.',
    readingTime: 5,
    icon: BookOpen,
    href: '/guides/getting-started',
    category: 'Getting Started',
    badge: 'Most Read',
    tags: ['onboarding', 'account', 'setup'],
  },
  {
    title: 'How to log your first workout correctly',
    excerpt: 'Step-by-step guide to logging exercises, sets, reps, and load with precision for accurate tracking.',
    readingTime: 8,
    icon: Dumbbell,
    href: '/guides/workout-logging',
    category: 'Getting Started',
    tags: ['logging', 'workout', 'exercises'],
  },
  {
    title: 'How to understand adherence and progress',
    excerpt: 'Learn what was prescribed vs what was done, and how to interpret your training adherence metrics.',
    readingTime: 7,
    icon: Target,
    href: '/guides/plan-vs-execution',
    category: 'Getting Started',
    tags: ['adherence', 'analytics', 'progress'],
  },

  // Plans & AI
  {
    title: 'How to generate today\'s workout with AI',
    excerpt: 'Use AI Workout to create personalized daily sessions based on your plan, recovery, and goals.',
    readingTime: 6,
    icon: Sparkles,
    href: '/guides/ai-workout-generation',
    category: 'Plans & AI',
    badge: 'AI',
    tags: ['ai', 'workout', 'generation', 'daily'],
  },
  {
    title: 'How AI plan building works',
    excerpt: 'Understand how Atlas AI builds periodized training plans adapted to your schedule and goals.',
    readingTime: 8,
    icon: Brain,
    href: '/guides/ai-plan-building',
    category: 'Plans & AI',
    badge: 'AI',
    tags: ['ai', 'plan', 'periodization', 'goals'],
  },
  {
    title: 'How to adjust a plan when your schedule changes',
    excerpt: 'Learn to modify workouts, swap exercises, and adapt your plan when life gets in the way.',
    readingTime: 6,
    icon: Zap,
    href: '/guides/adjusting-plans',
    category: 'Plans & AI',
    tags: ['plan', 'adjust', 'schedule', 'flexibility'],
  },
  {
    title: 'When to use AI vs manual tracking',
    excerpt: 'Understand when AI assistance helps and when manual control gives you better results.',
    readingTime: 5,
    icon: Brain,
    href: '/guides/ai-vs-manual',
    category: 'Plans & AI',
    badge: 'AI',
    tags: ['ai', 'manual', 'tracking', 'comparison'],
  },

  // Progress & Analytics
  {
    title: 'How to compare progress photos over time',
    excerpt: 'Upload, organize, and compare body progress photos to visualize your transformation journey.',
    readingTime: 5,
    icon: LineChart,
    href: '/guides/progress-photos',
    category: 'Progress & Analytics',
    tags: ['photos', 'progress', 'comparison', 'body'],
  },
  {
    title: 'How to export and share your training reports',
    excerpt: 'Generate detailed reports for yourself or share them with coaches and professionals.',
    readingTime: 4,
    icon: LineChart,
    href: '/guides/export-reports',
    category: 'Progress & Analytics',
    tags: ['export', 'reports', 'share', 'coaches'],
  },

  // Nutrition
  {
    title: 'How to track your nutrition and macros',
    excerpt: 'Log meals, track macros, and connect nutrition data with your training for complete insights.',
    readingTime: 7,
    icon: Apple,
    href: '/guides/nutrition-tracking',
    category: 'Nutrition',
    tags: ['nutrition', 'macros', 'meals', 'tracking'],
  },

  // Mobile & Settings
  {
    title: 'How to use Atlas on mobile during workouts',
    excerpt: 'Best practices for logging training on your phone at the gym without friction.',
    readingTime: 4,
    icon: Dumbbell,
    href: '/guides/mobile-workouts',
    category: 'Account & Settings',
    tags: ['mobile', 'gym', 'logging', 'tips'],
  },
  {
    title: 'How to change language and other preferences',
    excerpt: 'Configure your account settings, language preferences, and notification options.',
    readingTime: 3,
    icon: Settings,
    href: '/guides/account-settings',
    category: 'Account & Settings',
    tags: ['settings', 'language', 'preferences'],
  },

  // Coaches / Professionals
  {
    title: 'For Coaches: How to manage client training',
    excerpt: 'Guide for coaches on managing athlete plans, reviewing logs, and sharing feedback.',
    readingTime: 10,
    icon: Users,
    href: '/guides/coach-management',
    category: 'Coaches',
    badge: 'New',
    tags: ['coaches', 'clients', 'management'],
  },
];

// Organize guides by category
const GUIDE_CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started', description: 'Essential guides for new users' },
  { id: 'plans-ai', title: 'Plans & AI', description: 'AI-powered features and plan management' },
  { id: 'progress', title: 'Progress & Analytics', description: 'Tracking and analyzing your results' },
  { id: 'nutrition', title: 'Nutrition', description: 'Meal tracking and macro management' },
  { id: 'account', title: 'Account & Settings', description: 'Mobile usage and preferences' },
  { id: 'coaches', title: 'For Coaches', description: 'Professional tools and workflows' },
];

// Expanded FAQ items
const FAQ_ITEMS = [
  {
    q: 'How much does atlas.core cost?',
    a: 'There is a free plan to get started, plus paid tiers for richer insights, exports, reports, AI features, and professional workflows. See our pricing page for a full comparison.',
  },
  {
    q: 'What\'s included in free vs paid plans?',
    a: 'Free includes basic workout logging and progress tracking. Paid adds AI workout generation, advanced analytics, progress photo comparison, data exports, and coach collaboration features.',
  },
  {
    q: 'Does Atlas use AI to build workouts?',
    a: 'Yes. Atlas AI can generate daily workouts based on your plan, adjust for fatigue, and build complete periodized programs adapted to your goals and schedule.',
  },
  {
    q: 'Can I generate a workout for today?',
    a: 'Absolutely. The AI Workout feature creates personalized daily sessions considering your recent training, recovery status, and plan progression.',
  },
  {
    q: 'Does the product work on mobile?',
    a: 'Yes. atlas.core is designed for both desktop and mobile with the same visual language and navigational clarity. Perfect for logging at the gym.',
  },
  {
    q: 'Can I use Atlas without a coach?',
    a: 'Definitely. Atlas is built for independent athletes who want professional-grade tracking and AI-powered planning without needing a coach.',
  },
  {
    q: 'Can coaches manage clients?',
    a: 'Yes. Coaches can review client logs, create training plans, provide feedback, and collaborate through the platform\'s professional features.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Plans are fully flexible. You can modify workouts, swap exercises, adjust schedules, or completely regenerate your program at any time.',
  },
  {
    q: 'Can I share data with a coach or nutritionist?',
    a: 'Yes. atlas.core keeps your complete training history accessible to both athletes and professionals, without relying on scattered screenshots.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. Paid plans include data exports and detailed reporting while preserving the logic of one connected system for tracking progress.',
  },
  {
    q: 'Does it work for home training?',
    a: 'Atlas adapts to any training environment. AI can generate home-friendly workouts based on available equipment or bodyweight-only options.',
  },
  {
    q: 'Is my progress history preserved?',
    a: 'All your training data, photos, and logs are securely stored and preserved, even if you change subscription plans.',
  },
];

// Quick Start Path component
function QuickStartPath() {
  const steps = [
    { n: 1, text: 'Create account', href: `${ROUTES.auth}?mode=signup` },
    { n: 2, text: 'Log your first workout', href: '/guides/workout-logging' },
    { n: 3, text: 'Understand adherence', href: '/guides/plan-vs-execution' },
    { n: 4, text: 'Generate your first AI workout', href: '/guides/ai-workout-generation' },
  ];

  return (
    <div className="rounded-2xl border border-[hsl(var(--brand)/0.2)] bg-gradient-to-br from-[hsl(var(--brand)/0.08)] to-transparent p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 text-[hsl(var(--brand))]" />
        <h3 className="text-[16px] font-semibold text-[hsl(var(--fg))]">Start Here — Your First Week</h3>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <Link
            key={step.n}
            to={step.href}
            className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-4 transition-all hover:border-[hsl(var(--brand)/0.3)] hover:shadow-[var(--shadow-sm)]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-[13px] font-bold text-white">
              {step.n}
            </span>
            <span className="text-[13px] font-medium text-[hsl(var(--fg))]">{step.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}


export default function HelpCenter() {
  const navigate = useNavigate();

  const guidesByCategory = useMemo(() => {
    return GUIDE_CATEGORIES.map(cat => ({
      ...cat,
      guides: ALL_GUIDES.filter(g => g.category === cat.title),
    })).filter(cat => cat.guides.length > 0);
  }, []);

  return (
    <PublicSiteShell
      navLinks={[
        { href: ROUTES.blog, label: 'Blog' },
        { href: '#guides', label: 'Guides' },
        { href: '#faq', label: 'FAQ' },
      ]}
      actions={(
        <>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to={ROUTES.pricing}>Pricing</Link>
          </Button>
          <Button asChild>
            <Link to={`${ROUTES.auth}?mode=signup`}>Create account</Link>
          </Button>
        </>
      )}
    >
      <PublicMetadata
        title="Help Center — atlas.core"
        description="Comprehensive guides and support for atlas.core. Learn how to track workouts, use AI features, manage nutrition, and get the most from your training."
        canonicalPath={ROUTES.help}
      />

      {/* Hero with Search */}
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-12 lg:px-8 lg:pt-16">
        <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
          <span className="atlas-public-pill">
            <HelpCircle className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
            Help Center
          </span>
          <h1 className="atlas-display-title mt-5 max-w-4xl text-[clamp(2.6rem,2rem+1.6vw,4rem)]">
            Find answers and get more from Atlas.
          </h1>
          <p className="atlas-public-copy mt-4 max-w-2xl">
            Task-oriented guides for tracking, AI features, nutrition, and everything you need to train with clarity.
          </p>

          <div className="mt-8">
            <HelpSearch guides={ALL_GUIDES} onSelect={(href) => navigate(href)} />
          </div>
        </div>
      </section>

      {/* Quick Start Path */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <QuickStartPath />
      </section>

      {/* Guides by Category */}
      <section id="guides" className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <div className="space-y-12">
            {guidesByCategory.map((category, index) => (
              <div
                key={category.id}
                className={cn(
                  'space-y-6',
                  index > 0 && 'border-t border-[hsl(var(--border)/0.76)] pt-10'
                )}
              >
                <PublicSectionHeader
                  eyebrow={category.title}
                  title={category.description}
                />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.guides.map((guide) => (
                    <EnhancedGuideCard key={guide.href} guide={guide} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <PublicSectionHeader
          eyebrow="FAQ"
          title="Questions before you start?"
          description="Direct answers about pricing, AI features, mobile usage, and more."
          align="center"
          className="mb-10"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="atlas-card p-5 lg:p-6">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{item.q}</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
          <p className="atlas-overline justify-center">Ready to start?</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(2.2rem,1.9rem+1.4vw,3.3rem)]">
            Generate your first AI workout today.
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-2xl">
            Create your account and experience AI-powered training that adapts to you. No credit card required to start.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to={`${ROUTES.auth}?mode=signup`}>Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.pricing}>See AI features & pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
