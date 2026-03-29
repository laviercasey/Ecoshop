import { useEffect } from 'react';

interface SeoParams {
  title: string;
  description?: string;
  suffix?: string;
  ogImage?: string;
}

const DEFAULT_SUFFIX = 'EcoShop';

function setMetaTag(attr: 'name' | 'property', key: string, content: string | undefined) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function useSeo({ title, description, suffix = DEFAULT_SUFFIX, ogImage }: SeoParams) {
  useEffect(() => {
    const fullTitle = suffix ? `${title} — ${suffix}` : title;

    document.title = fullTitle;

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', window.location.href);
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
    }
  }, [title, description, suffix, ogImage]);
}
