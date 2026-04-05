import React from 'react';

const DEFAULT_TITLE = 'atlas.core';
const DEFAULT_DESCRIPTION =
  'atlas.core is the performance operating system for training, nutrition, measurements, and real-world progress.';
const DEFAULT_ROBOTS = 'index,follow';
const DEFAULT_OG_IMAGE = '/branding/dark/icon-512.png';

function upsertMeta({ name, property, content }) {
  if (!content) return;

  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    if (name) {
      element.setAttribute('name', name);
    }
    if (property) {
      element.setAttribute('property', property);
    }
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function removeMeta(selector) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.remove();
  }
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function buildCanonicalUrl(canonicalPath) {
  if (typeof window === 'undefined') return canonicalPath || '/';
  return new URL(canonicalPath || window.location.pathname, window.location.origin).toString();
}

export default function PublicMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  robots = DEFAULT_ROBOTS,
  type = 'website',
  publishedTime,
  ogImage,
}) {
  React.useEffect(() => {
    const canonicalUrl = buildCanonicalUrl(canonicalPath);
    const imageUrl = ogImage || DEFAULT_OG_IMAGE;

    document.title = title;
    upsertMeta({ name: 'description', content: description });
    upsertMeta({ name: 'robots', content: robots });
    upsertMeta({ property: 'og:site_name', content: DEFAULT_TITLE });
    upsertMeta({ property: 'og:type', content: type });
    upsertMeta({ property: 'og:title', content: title });
    upsertMeta({ property: 'og:description', content: description });
    upsertMeta({ property: 'og:url', content: canonicalUrl });
    upsertMeta({ property: 'og:image', content: imageUrl });
    upsertMeta({ name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta({ name: 'twitter:title', content: title });
    upsertMeta({ name: 'twitter:description', content: description });
    upsertMeta({ name: 'twitter:image', content: imageUrl });
    upsertCanonical(canonicalUrl);

    if (publishedTime) {
      upsertMeta({ property: 'article:published_time', content: publishedTime });
    } else {
      removeMeta('meta[property="article:published_time"]');
    }
  }, [canonicalPath, description, publishedTime, robots, title, type]);

  return null;
}
