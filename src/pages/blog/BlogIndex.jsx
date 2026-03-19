import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, CalendarDays, Tag } from 'lucide-react';
import PublicSiteShell, {
  PublicLanguageSwitcher,
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import { BLOG_POSTS } from '@/lib/blogPosts';
import { ROUTES } from '@/lib/routes';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
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

function PostCard({ post }) {
  return (
    <Link
      to={`${ROUTES.blog}/${post.slug}`}
      className="group atlas-card flex flex-col gap-4 p-5 transition-all duration-200 hover:shadow-[var(--shadow-md)] lg:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryPill category={post.category} />
        <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--fg-3))]">
          <Clock3 className="h-3 w-3" strokeWidth={1.9} />
          <span>{post.readingTime} min read</span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-[16px] font-semibold leading-snug tracking-[-0.025em] text-[hsl(var(--fg))] transition-colors group-hover:text-[hsl(var(--tint))] lg:text-[17px]">
          {post.title}
        </h2>
        <p className="text-[13.5px] leading-6 text-[hsl(var(--fg-2))] line-clamp-2">
          {post.excerpt}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--fg-3))]">
          <CalendarDays className="h-3 w-3" strokeWidth={1.9} />
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <span className="flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--tint))] opacity-0 transition-opacity group-hover:opacity-100">
          Read
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

const CATEGORIES = ['All', ...Array.from(new Set(BLOG_POSTS.map((p) => p.category)))];

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = React.useState('All');

  useEffect(() => {
    document.title = 'Blog — Atlas Core';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        'content',
        'Insights on fitness tracking, nutrition, training, and building systems that actually produce results.'
      );
    }
    // Set canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${window.location.origin}/blog`);
  }, []);

  const filtered =
    activeCategory === 'All'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  return (
    <PublicSiteShell
      navLinks={[
        { href: ROUTES.home, label: 'Home' },
        { href: ROUTES.pricing, label: 'Pricing' },
        { href: ROUTES.help, label: 'Help' },
      ]}
      actions={
        <>
          <PublicLanguageSwitcher />
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
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 lg:px-8 lg:pb-14 lg:pt-16">
        <PublicSectionHeader
          eyebrow="Blog"
          title={'Insights for athletes\nwho track seriously.'}
          description="Practical guides on training, nutrition, and building systems that actually produce results — not motivation, not hype."
          align="center"
        />
      </section>

      {/* Category filter */}
      <section className="mx-auto max-w-6xl px-5 pb-8 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
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
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Post grid */}
      <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-[14px] text-[hsl(var(--fg-3))]">
            No posts in this category yet.
          </p>
        )}
      </section>
    </PublicSiteShell>
  );
}
