import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, CalendarDays, Tag } from 'lucide-react';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { BLOG_POSTS, getLocalizedPost } from '@/lib/blogPosts';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18nContext';

function formatDate(dateStr, locale) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function CategoryPill({ category }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.6)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--fg-2))]">
      <Tag className="h-3 w-3" strokeWidth={1.9} />
      {category}
    </span>
  );
}

function FeaturedPostCard({ post, locale }) {
  const localized = getLocalizedPost(post, locale);

  return (
    <Link
      to={`${ROUTES.blog}/${post.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--border)/0.7)] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--fill)/0.3)] p-6 transition-all duration-300 hover:shadow-[var(--shadow-lg)] lg:p-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[hsl(var(--tint)/0.08)] to-transparent" />
      
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--tint))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Featured
            </span>
            <CategoryPill category={localized.category} />
            <div className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--fg-3))]">
              <Clock3 className="h-3 w-3" strokeWidth={1.9} />
              <span>{post.readingTime} min read</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.025em] text-[hsl(var(--fg))] transition-colors group-hover:text-[hsl(var(--tint))] lg:text-[26px]">
              {localized.title}
            </h2>
            <p className="max-w-2xl text-[15px] leading-7 text-[hsl(var(--fg-2))]">
              {localized.excerpt}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--tint))]">
              Read article
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </span>
            <span className="text-[12px] text-[hsl(var(--fg-3))]">
              <CalendarDays className="mr-1 inline h-3 w-3" strokeWidth={1.9} />
              {formatDate(post.publishedAt, locale)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post, locale }) {
  const localized = getLocalizedPost(post, locale);

  return (
    <Link
      to={`${ROUTES.blog}/${post.slug}`}
      className="group atlas-card flex flex-col gap-4 p-5 transition-all duration-200 hover:shadow-[var(--shadow-md)] lg:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryPill category={localized.category} />
        <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--fg-3))]">
          <Clock3 className="h-3 w-3" strokeWidth={1.9} />
          <span>{post.readingTime} min read</span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-[16px] font-semibold leading-snug tracking-[-0.025em] text-[hsl(var(--fg))] transition-colors group-hover:text-[hsl(var(--tint))] lg:text-[17px]">
          {localized.title}
        </h2>
        <p className="text-[13.5px] leading-6 text-[hsl(var(--fg-2))] line-clamp-2">
          {localized.excerpt}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--fg-3))]">
          <CalendarDays className="h-3 w-3" strokeWidth={1.9} />
          <span>{formatDate(post.publishedAt, locale)}</span>
        </div>
        <span className="flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--tint))] opacity-0 transition-opacity group-hover:opacity-100">
          Read
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const { locale, t } = useI18n();
  const [activeCategory, setActiveCategory] = React.useState('All');

  const localizedPosts = BLOG_POSTS.map(p => getLocalizedPost(p, locale));
  const categories = ['All', ...Array.from(new Set(localizedPosts.map((p) => p.category)))];

  const filtered =
    activeCategory === 'All'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => {
          const loc = getLocalizedPost(p, locale);
          return loc.category === activeCategory;
        });

  const featuredPost = BLOG_POSTS.find(p => p.featured);
  const regularPosts = filtered.filter(p => p.slug !== featuredPost?.slug);

  const ui = {
    title: 'Insights for athletes\nwho track seriously.',
    description: 'Practical guides on training, nutrition, and building systems that actually produce results — not motivation, not hype.',
    noPosts: 'No posts in this category yet.',
    all: 'All'
  };

  return (
    <PublicSiteShell
      navLinks={[
        { href: ROUTES.home, label: 'Home' },
        { href: ROUTES.blog, label: 'Blog' },
        { href: ROUTES.pricing, label: 'Pricing' },
        { href: ROUTES.help, label: 'Help' },
      ]}
      actions={
        <>
          <Link
            to={`${ROUTES.auth}?mode=login`}
            className="atlas-button atlas-button-secondary h-9 rounded-full px-4 text-[13px]"
          >
            Log in
          </Link>
          <Link
            to={`${ROUTES.auth}?mode=signup`}
            className="atlas-button atlas-button-primary h-9 rounded-full px-4 text-[13px]"
          >
            Get started
          </Link>
        </>
      }
    >
      <PublicMetadata
        title={`Blog — Atlas Core`}
        description={ui.description}
        canonicalPath={ROUTES.blog}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 lg:px-8 lg:pb-14 lg:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="atlas-overline justify-center">Blog</p>
          <h1 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(2rem,1.4rem+1.2vw,3rem)]">
            {ui.title}
          </h1>
          <p className="atlas-public-copy mx-auto mt-4 max-w-2xl">
            {ui.description}
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && activeCategory === 'All' && (
        <section className="mx-auto max-w-6xl px-5 pb-8 lg:px-8">
          <FeaturedPostCard post={featuredPost} locale={locale} />
        </section>
      )}

      {/* Category filter */}
      <section className="mx-auto max-w-6xl px-5 pb-8 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                activeCategory === cat
                  ? 'border-[hsl(var(--tint))] bg-[hsl(var(--tint))] text-white'
                  : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))] hover:border-[hsl(var(--tint)/0.5)] hover:text-[hsl(var(--fg))]'
              }`}
            >
              {cat === 'All' ? ui.all : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Post grid */}
      <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(activeCategory === 'All' ? regularPosts : filtered).map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-[14px] text-[hsl(var(--fg-3))]">
            {ui.noPosts}
          </p>
        )}
      </section>
    </PublicSiteShell>
  );
}
