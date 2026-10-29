#!/usr/bin/env node
// Parity ledger: the revamp suite (tests/react) replaces the legacy React-UI tests only when
// every legacy test has a verdict.
//
//   node baseline/parity.mjs           create missing ledgers, report legacy tests with no row or a TODO
//   node baseline/parity.mjs --strict  exit 1 if anything is unresolved (gate before deleting a legacy folder)
//
// Scope: legacy tests tagged @new-ui, every test in new*.spec.ts, and adminSettings/, vendorStoreSettings/.
// Ledger: baseline/parity/<legacy folder>.md, one row per legacy test. Verdicts:
//   PORTED <new file> #id | REWRITTEN <new file> #id (old oracle was vague) | OWNED <file> (precise oracle lives elsewhere)
//   DROPPED <reason> (no risk caught; e.g. "renders", duplicate) | TODO
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const E2E = path.join(HERE, '../tests/e2e');
const LEDGERS = path.join(HERE, 'parity');
const STRICT = process.argv.includes('--strict');

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

// `test('title', { tag: [...] }` on one line, which is the suite's house style.
const TEST_RE = /^\s*test(?:\.(?:skip|fixme|only))?\(\s*(['"`])((?:\\.|(?!\1).)*)\1(.*)$/gm;

const legacy = new Map(); // folder -> [{ file, line, title }]
for (const file of walk(E2E).filter(f => f.endsWith('.spec.ts'))) {
    const rel = path.relative(E2E, file);
    const folder = rel.split(path.sep)[0];
    const wholeFile = /(^|\/)new[A-Z][^/]*\.spec\.ts$/.test(rel) || /^(adminSettings|vendorStoreSettings)\//.test(rel);
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(TEST_RE)) {
        if (!wholeFile && !m[3].includes("'@new-ui'")) continue;
        const line = src.slice(0, m.index).split('\n').length;
        legacy.set(folder, [...(legacy.get(folder) ?? []), { file: rel, line, title: m[2] }]);
    }
}

fs.mkdirSync(LEDGERS, { recursive: true });
let unresolved = 0;
const report = [];
for (const [folder, tests] of [...legacy].sort()) {
    const ledgerFile = path.join(LEDGERS, `${folder}.md`);
    if (!fs.existsSync(ledgerFile)) {
        const rows = tests.map(t => `| ${t.file}:${t.line} | ${t.title.replace(/\|/g, '\\|')} | TODO |`);
        fs.writeFileSync(ledgerFile, [`# Parity: ${folder}`, '', '| Legacy test | Title | Verdict |', '|---|---|---|', ...rows, ''].join('\n'));
    }
    const ledger = fs.readFileSync(ledgerFile, 'utf8');
    const missing = tests.filter(t => !ledger.includes(`| ${t.title.replace(/\|/g, '\\|')} |`));
    const todo = (ledger.match(/\| TODO\b/g) || []).length;
    unresolved += missing.length + todo;
    report.push(`${String(todo + missing.length).padStart(4)} open  ${String(tests.length).padStart(4)} legacy  ${folder}${missing.length ? `  (${missing.length} not in ledger)` : ''}`);
}
console.log(report.join('\n'));
console.log(`\n${unresolved} legacy React tests without a verdict across ${legacy.size} folders.`);
if (STRICT && unresolved) process.exit(1);
