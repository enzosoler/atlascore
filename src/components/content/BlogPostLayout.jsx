import React from 'react';
import { ArrowLeft, CalendarDays, Clock3, User } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatPublishedDate(date) {
  if (!date) return '--';

  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function MetaItem({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))]">
      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
      <span>{children}</span>
    </div>
  );
}

export default function BlogPostLayout({
  title,
  excerpt,
  publishedAt,
  readingTime,
  author,
  breadcrumb,
  children,
}) {
  return (
    <div className="atlas-page-shell">
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-6 lg:px-8 lg:py-10">
        <section className="atlas-page-header relative overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(var(--brand)/0.08)] to-transparent" />

          <div className="relative space-y-5">
            {breadcrumb?.href ? (
              <Link
                to={breadcrumb.href}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
                {breadcrumb.label || 'Voltar'}
              </Link>
            ) : null}

            <div className="space-y-4">
              <p className="atlas-overline">Guide</p>
              <div className="space-y-3">
                <h1 className="atlas-display-title">{title}</h1>
                {excerpt ? (
                  <p className="max-w-2xl text-[15px] leading-7 text-[hsl(var(--fg-2))] lg:text-[16px]">
                    {excerpt}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {publishedAt ? (
                <MetaItem icon={CalendarDays}>{formatPublishedDate(publishedAt)}</MetaItem>
              ) : null}
              {readingTime ? <MetaItem icon={Clock3}>{readingTime} min de leitura</MetaItem> : null}
              {author ? <MetaItem icon={User}>{author}</MetaItem> : null}
            </div>
          </div>
        </section>

        <article className="atlas-card px-6 py-8 lg:px-10 lg:py-10">
          <div
            className="
              text-[15px] leading-8 text-[hsl(var(--fg-2))]
              [&>h2]:mt-10 [&>h2]:text-[1.4rem] [&>h2]:font-semibold [&>h2]:tracking-[-0.04em] [&>h2]:text-[hsl(var(--fg))]
              [&>h2:first-child]:mt-0
              [&>h3]:mt-7 [&>h3]:text-[1.05rem] [&>h3]:font-semibold [&>h3]:tracking-[-0.025em] [&>h3]:text-[hsl(var(--fg))]
              [&>p]:mt-4
              [&>ul]:mt-4 [&>ul]:space-y-2 [&>ul]:pl-5
              [&>ol]:mt-4 [&>ol]:space-y-2 [&>ol]:pl-5
              [&>blockquote]:mt-8 [&>blockquote]:rounded-[24px] [&>blockquote]:border [&>blockquote]:border-[hsl(var(--border)/0.82)] [&>blockquote]:bg-[hsl(var(--fill)/0.55)] [&>blockquote]:px-5 [&>blockquote]:py-4 [&>blockquote]:text-[hsl(var(--fg))]
              [&_strong]:font-semibold [&_strong]:text-[hsl(var(--fg))]
              [&_a]:text-[hsl(var(--brand))] [&_a]:underline-offset-4 hover:[&_a]:underline
              [&_li]:text-[15px] [&_li]:leading-8
            "
          >
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
