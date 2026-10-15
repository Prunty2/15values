import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const server = await createServer({ mode: 'production', server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render, metadata, siteUrl } = await server.ssrLoadModule('/src/prerender.tsx');
  const catalogue = JSON.parse(await readFile('public/profiles/catalogue.v1.json', 'utf8'));
  const template = await readFile('dist/index.html', 'utf8');
  if (!template.includes('<div id="root"></div>')) throw new Error('Run npm run build to generate a fresh HTML template before pre-rendering.');
  const routes = new Map(['/', '/quiz', '/ideologies', '/personalities', '/countries', '/credits'].map(route => [route, undefined]));
  const kinds = { ideology: 'ideologies', personality: 'personalities', country: 'countries' };
  for (const profile of catalogue.profiles) if (!profile.withdrawal) routes.set(`/${kinds[profile.catalogue]}/${profile.id}`, profile);
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const urls = [];
  for (const [route, profile] of routes) {
    const data = metadata(route, profile);
    let html = template.replace('<div id="root"></div>', `<div id="root">${render(route, catalogue)}</div>`);
    html = html.replace(/<title>.*?<\/title>/, `<title>${escape(data.title)}</title>`);
    html = html.replace(/<meta (name="(?:description|twitter:title|twitter:description)"|property="(?:og:title|og:description)") content="[^"]*"\s*\/>/g, (_, attr) => `<meta ${attr} content="${escape(attr.includes('title') ? data.title : data.description)}" />`);
    const structured = { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', '@id': siteUrl + '#website', name: '15 Values', alternateName: '15values', url: siteUrl }, { '@type': 'WebPage', name: data.title, description: data.description, url: data.url, isPartOf: { '@id': siteUrl + '#website' } }] };
    html = html.replace('</head>', `<link rel="canonical" href="${escape(data.url)}" /><meta property="og:url" content="${escape(data.url)}" /><meta name="robots" content="index, follow, max-image-preview:large" /><script type="application/ld+json">${JSON.stringify(structured).replaceAll('<', '\\u003c')}</script></head>`);
    const folder = 'dist' + (route === '/' ? '' : route);
    await mkdir(folder, { recursive: true });
    await writeFile(folder + '/index.html', html);
    urls.push(data.url);
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>`);
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
  await writeFile('dist/.nojekyll', '');
  await writeFile('dist/404.html', template.replace('</head>', '<meta name="robots" content="noindex, follow" /></head>'));
  console.log(`Pre-rendered ${routes.size} pages and generated sitemap.`);
} finally { await server.close(); }
