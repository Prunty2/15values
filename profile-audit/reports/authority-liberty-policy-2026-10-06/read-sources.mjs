// Focused retrieval of each subject's retained Authority–Liberty evidence.
// Retrieval is evidence access, not verification of every claim or citation.
import { readFileSync, writeFileSync } from 'node:fs';
const directory = new URL('./', import.meta.url);
const contexts = JSON.parse(readFileSync(new URL('retained-context.json', directory)));
const selected = contexts.flatMap(context => {
  const ids = new Set(context.axis.answers.flatMap(answer => answer.sources));
  const relevant = context.sources.filter(source => ids.has(source.id));
  const ranked = relevant.sort((a, b) => {
    const rank = source => /wikipedia/.test(source.url) ? 3 : /vaccin|health|hate|speech|constitution|rights|police|manifesto|primary|libert/i.test(source.title + ' ' + source.id) ? 0 : 1;
    return rank(a) - rank(b);
  });
  const choices = ranked.slice(0, 3);
  if (!choices.length) throw new Error('No retained sources for ' + context.id);
  return choices.map(source => ({ key: context.catalogue + '/' + context.id, source }));
});
const retrieved = new Map();
const results = [];
let next = 0;
const clean = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim();
async function retrieve(source) {
  try {
    const response = await fetch(source.url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': '15Values focused evidence review' } });
    if (!response.ok) return { status: response.status, error: 'HTTP retrieval failed' };
    const type = response.headers.get('content-type') ?? '';
    if (/pdf/.test(type)) return { status: response.status, error: 'PDF requires separate text reading; HTTP access alone is not evidence review' };
    const text = clean(await response.text());
    if (text.length < 800 || /just a moment|enable javascript and cookies|access denied|verify you are human/i.test(text.slice(0, 1500))) return { status: response.status, error: 'Unavailable or access challenge; no source review claimed' };
    const patterns = [/bulk.{0,80}(?:communication|surveillance)|mass surveillance|privacy|surveillance/gi, /freedom of association|civic association|civil libert|due process|habeas corpus|arbitrary (?:arrest|detention)/gi, /warrant|unreasonable search|identity card|identification (?:document|paper)|freedom of assembly|peaceful assembly/gi];
    const snippets = patterns.flatMap(pattern => {
      const matches = [...text.matchAll(pattern)].filter(match => !/privacy policy|cookie|website|data protection notice/i.test(text.slice(Math.max(0, match.index - 50), match.index + 160)));
      return matches.slice(0, 2).map(match => text.slice(Math.max(0, match.index - 100), match.index + 430));
    });
    return { status: response.status, finalUrl: response.url, accessed: '2026-10-06', characters: text.length, snippets: [...new Set(snippets)].slice(0, 4), limitation: 'Selected passages only; no comprehensive new period or source verification. No match may mean this source has little exact-mechanism evidence.' };
  } catch (error) { return { error: String(error) }; }
}
async function worker() {
  while (next < selected.length) {
    const item = selected[next++];
    if (!retrieved.has(item.source.url)) retrieved.set(item.source.url, retrieve(item.source));
    const result = await retrieved.get(item.source.url);
    results.push({ ...item, retrieval: result });
    if (results.length % 40 === 0) {
      writeFileSync(new URL('source-retrieval.json', directory), JSON.stringify(results, null, 2) + '\n');
      console.log('Retrieved or recorded access limitations for ' + results.length + '/' + selected.length + ' subject-source references.');
    }
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
results.sort((a, b) => a.key.localeCompare(b.key) || a.source.id.localeCompare(b.source.id));
writeFileSync(new URL('source-retrieval.json', directory), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify({ references: results.length, subjects: new Set(results.map(r => r.key)).size, readWithPassages: results.filter(r => r.retrieval.snippets?.length).length, limitations: results.filter(r => r.retrieval.error).length }));
