import { readFileSync, writeFileSync } from 'node:fs';
const axes = JSON.parse(readFileSync(new URL('../src/data/axes.v2.json', import.meta.url))).axes;
const questions = axes.flatMap(axis => {
  const source = readFileSync(new URL(`../../docs/questions/${axis.id}.md`, import.meta.url), 'utf8');
  const directions = [...source.matchAll(/^- ([^:]+): ([\d, ]+)\./gm)];
  if (directions.length !== 2) throw new Error(`Missing directions: ${axis.id}`);
  const left = new Set(directions[0][2].split(',').map(Number));
  const right = new Set(directions[1][2].split(',').map(Number));
  const entries = [...source.matchAll(/^(\d+)\. (.+)$/gm)];
  if (entries.length !== 16 || left.size !== 8 || right.size !== 8) throw new Error(`Unbalanced bank: ${axis.id}`);
  return entries.map(([, number, text]) => {
    const priority = Number(number);
    if (left.has(priority) === right.has(priority)) throw new Error(`Ambiguous direction: ${axis.id} ${priority}`);
    return { id: `${axis.id}-${number.padStart(2, '0')}`, axisId: axis.id, priority, agreePole: left.has(priority) ? 'left' : 'right', text, status: source.includes('Status: Draft.') ? 'draft' : 'agreed' };
  });
});
const bank = { version: '4.0.0', status: 'development', questions };
const content = `${JSON.stringify(bank, null, 2)}\n`;
const file = new URL('../src/data/questions.v4.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(file, 'utf8') !== content) throw new Error('Question JSON differs from the source documents. Run npm run questions:sync and review the version.');
} else writeFileSync(file, content);
console.log(`${questions.length} questions ${process.argv.includes('--check') ? 'verified' : 'synced'} across ${axes.length} axes.`);
