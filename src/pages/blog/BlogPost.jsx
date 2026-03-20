import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PublicSiteShell, {
  PublicLanguageSwitcher,
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import BlogPostLayout from '@/components/content/BlogPostLayout';
import { Button } from '@/components/ui/button';
import { BLOG_POSTS, getPostBySlug, getLocalizedPost, getLocalizedContent } from '@/lib/blogPosts';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18nContext';

function BlogActions({ isPt }) {
  return (
    <>
      <PublicLanguageSwitcher />
      <Link
        to={`${ROUTES.auth}?mode=login`}
        className="atlas-button atlas-button-secondary h-9 rounded-full px-4 text-[13px]"
      >
        {isPt ? 'Entrar' : 'Log in'}
      </Link>
      <Link
        to={`${ROUTES.auth}?mode=signup`}
        className="atlas-button atlas-button-primary h-9 rounded-full px-4 text-[13px]"
      >
        {isPt ? 'Começar' : 'Get started'}
      </Link>
    </>
  );
}

function RelatedPostCard({ post, locale }) {
  const localized = getLocalizedPost(post, locale);
  return (
    <Link
      to={`${ROUTES.blog}/${post.slug}`}
      className="atlas-card flex h-full flex-col gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
        {localized.category}
      </p>
      <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.025em] text-[hsl(var(--fg))]">
        {localized.title}
      </h3>
      <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{localized.excerpt}</p>
    </Link>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const { locale } = useI18n();
  const isPt = locale === 'pt-BR';
  
  const rawPost = getPostBySlug(slug);
  const post = getLocalizedPost(rawPost, locale);
  const markdown = getLocalizedContent(slug, locale);

  const relatedPosts = React.useMemo(
    () => BLOG_POSTS.filter((entry) => entry.slug !== slug).slice(0, 3),
    [slug]
  );

  const ui = isPt ? {
    notFoundTitle: 'Post não encontrado.',
    notFoundDesc: 'Este artigo não existe mais ou a URL está incorreta.',
    backToBlog: 'Voltar para o blog',
    moreFromBlog: 'Mais do blog',
    moreTitle: 'Continue explorando o conhecimento público.',
    moreDesc: 'Mais textos práticos sobre treino, nutrição, sistemas e progresso mensurável.',
    home: 'Início',
    pricing: 'Planos',
    help: 'Ajuda'
  } : {
    notFoundTitle: 'Post not found.',
    notFoundDesc: 'That article does not exist anymore or the URL is incorrect.',
    backToBlog: 'Back to blog',
    moreFromBlog: 'More from the blog',
    moreTitle: 'Keep exploring the public knowledge layer.',
    moreDesc: 'More practical writing on training, nutrition, systems, and measurable progress.',
    home: 'Home',
    pricing: 'Pricing',
    help: 'Help'
  };

  if (!post || !markdown) {
    return (
      <PublicSiteShell
        navLinks={[
          { href: ROUTES.home, label: ui.home },
          { href: ROUTES.blog, label: 'Blog' },
          { href: ROUTES.pricing, label: ui.pricing },
        ]}
        actions={<BlogActions isPt={isPt} />}
      >
        <PublicMetadata
          title="Blog Post Not Found — Atlas Core"
          description="The requested Atlas Core blog post could not be found."
          canonicalPath={ROUTES.blog}
          robots="noindex,nofollow"
        />

        <section className="mx-auto max-w-4xl px-5 pb-8 pt-12 lg:px-8 lg:pt-16">
          <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
            <PublicSectionHeader
              eyebrow="Blog"
              title={ui.notFoundTitle}
              description={ui.notFoundDesc}
              align="center"
            />
            <div className="mt-8 flex justify-center">
              <Button asChild>
                <Link to={ROUTES.blog}>{ui.backToBlog}</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicSiteShell>
    );
  }

  return (
    <PublicSiteShell
      navLinks={[
        { href: ROUTES.home, label: ui.home },
        { href: ROUTES.blog, label: 'Blog' },
        { href: ROUTES.pricing, label: ui.pricing },
        { href: ROUTES.help, label: ui.help },
      ]}
      actions={<BlogActions isPt={isPt} />}
    >
      <PublicMetadata
        title={`${post.title} — Atlas Core`}
        description={post.excerpt}
        canonicalPath={`${ROUTES.blog}/${post.slug}`}
        type="article"
        publishedTime={`${post.publishedAt}T12:00:00Z`}
      />

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8 lg:pb-14 lg:pt-10">
        <BlogPostLayout
          title={post.title}
          excerpt={post.excerpt}
          publishedAt={post.publishedAt}
          readingTime={post.readingTime}
          author={post.author}
          breadcrumb={{ href: ROUTES.blog, label: ui.backToBlog }}
          eyebrow={post.category}
        >
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </BlogPostLayout>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
        <PublicSectionHeader
          eyebrow={ui.moreFromBlog}
          title={ui.moreTitle}
          description={ui.moreDesc}
          className="mb-8"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {relatedPosts.map((relatedPost) => (
            <RelatedPostCard key={relatedPost.slug} post={relatedPost} locale={locale} />
          ))}
        </div>
      </section>
    </PublicSiteShell>
  );
}
