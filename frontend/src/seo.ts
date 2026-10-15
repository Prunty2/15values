import type { Profile } from './profiles/types';
export const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://prunty2.github.io/15values/').replace(/\/?$/, '/');
const pages: Record<string, [string, string]> = {
  '': ['15 Values — Free Political Quiz & Ideology Test', 'What is your political ideology? Take the free 15 Values political quiz, explore 15 political axes and compare your views with ideologies, personalities and countries.'],
  quiz: ['Political Ideology Test — Choose Your Quiz | 15 Values', 'Take a free political ideology test with 45, 75, 135 or 240 scored questions. Explore your political values across 15 axes. No account needed.'],
  ideologies: ['Political Ideologies — Explore & Compare | 15 Values', 'Explore political ideology profiles, their assessed views across 15 values, sources and limitations. Compare political ideas with your quiz results.'],
  personalities: ['Political Personalities — Views & Ideology | 15 Values', 'Explore assessed political personalities across 15 axes, with sourced profiles and disclosed limitations. Compare their positions with your political quiz results.'],
  countries: ['Countries — Political Values & Comparisons | 15 Values', 'Explore country institutions and policies across 15 political axes. Read sourced assessments and compare country profiles with your political values.'],
  credits: ['Image Credits | 15 Values', 'Sources, creators and licences for images and typefaces used by the 15 Values political quiz.'],
};
export function metadata(location: string, profile?: Profile) {
  const route = location.split('?')[0].replace(/^\/+|\/+$/g, '');
  const [title, description] = profile ? [`${profile.metadata.name} — Political Values | 15 Values`, profile.metadata.description] : pages[route] || ['Your Political Quiz | 15 Values', 'Your private political quiz and locally saved results.'];
  return { title, description, url: siteUrl + (route ? route + '/' : ''), noindex: profile ? Boolean(profile.withdrawal) : !pages[route] };
}
export function updateMetadata(location: string, profile?: Profile) {
  const data = metadata(location, profile);
  document.title = data.title;
  for (const [key, content] of Object.entries({ description: data.description, robots: data.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large', 'og:title': data.title, 'og:description': data.description, 'og:url': data.url, 'twitter:title': data.title, 'twitter:description': data.description })) {
    const attr = key.startsWith('og:') ? 'property' : 'name';
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!element) { element = document.createElement('meta'); element.setAttribute(attr, key); document.head.append(element); }
    element.content = content;
  }
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = data.url;
  const structured = document.head.querySelector('script[type="application/ld+json"]');
  if (structured) structured.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', '@id': siteUrl + '#website', name: '15 Values', alternateName: '15values', url: siteUrl }, { '@type': 'WebPage', name: data.title, description: data.description, url: data.url, isPartOf: { '@id': siteUrl + '#website' } }] });
}
