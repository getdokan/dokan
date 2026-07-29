#!/usr/bin/env node
/*
 * Resolves the spec list for a given Playwright shard using a duration baseline.
 *
 * Usage: node getShardSpecs.js <shardIndex> <shardTotal> [--smoke]
 *
 * Strategy:
 *   1. Read tests/pw/utils/shard-durations.json (committed baseline of spec → ms).
 *   2. Discover every *.spec.ts under tests/e2e (so newly-added specs are not lost).
 *   3. With --smoke, keep only specs listed in pr-smoke-specs.json.
 *   4. Greedy bin-pack longest-first into N bins.
 *   5. Print spec paths (one per line, relative to tests/pw) for the requested shard.
 *
 * If the baseline is missing, exits 0 with no output so the workflow can fall
 * back to Playwright's built-in --shard — except in --smoke mode, where falling
 * back would silently run the FULL suite; there we pack the smoke list with
 * equal weights instead.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const cliArgs = process.argv.slice(2);
const smoke = cliArgs.includes('--smoke');
const [shardIndexArg, shardTotalArg] = cliArgs.filter(a => !a.startsWith('--'));
const shardIndex = parseInt(shardIndexArg, 10);
const shardTotal = parseInt(shardTotalArg, 10);
if (!shardIndex || !shardTotal || shardIndex < 1 || shardIndex > shardTotal) {
    console.error(`usage: getShardSpecs.js <shardIndex> <shardTotal>  (got ${shardIndexArg}/${shardTotalArg})`);
    process.exit(2);
}

const pwRoot = path.resolve(__dirname, '..');
const baselinePath = path.join(__dirname, 'shard-durations.json');
const e2eRoot = path.join(pwRoot, 'tests', 'e2e');

if (!fs.existsSync(baselinePath) && !smoke) {
    // No baseline → fall back to alphabetical sharding upstream.
    process.exit(0);
}

const baseline = fs.existsSync(baselinePath)
    ? JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
    : { specs: [] };
const baselineByFile = new Map();
for (const entry of baseline.specs || []) {
    baselineByFile.set(entry.file, entry.ms || 0);
}

// Discover all spec files (so additions are caught even before baseline updates).
function walkSpecs(dir, base = 'tests/e2e') {
    const out = [];
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            out.push(...walkSpecs(full, path.join(base, name)));
        } else if (name.endsWith('.spec.ts')) {
            // Path relative to e2e/ root, matching summaryReporter file paths.
            const rel = path.relative(e2eRoot, full);
            out.push(rel);
        }
    }
    return out;
}

if (!fs.existsSync(e2eRoot)) {
    console.error(`e2e dir not found: ${e2eRoot}`);
    process.exit(0);
}

let specFiles = walkSpecs(e2eRoot).map(f => f.split(path.sep).join('/'));

if (smoke) {
    const smokePath = path.join(__dirname, 'pr-smoke-specs.json');
    if (fs.existsSync(smokePath)) {
        const { include } = JSON.parse(fs.readFileSync(smokePath, 'utf8'));
        specFiles = specFiles.filter(f =>
            include.some(entry => (entry.endsWith('/') ? f.startsWith(entry) : f === entry))
        );
        if (specFiles.length === 0) {
            console.error('pr-smoke-specs.json matched no specs — check the include list');
            process.exit(2);
        }
    } else {
        console.error('pr-smoke-specs.json missing — packing the full suite instead');
    }
}

const allSpecs = specFiles
    .map(file => ({
        file,
        // Default newly-added (unmeasured) specs to the global mean so they
        // don't all stack in a single bin.
        ms: baselineByFile.has(file) ? baselineByFile.get(file) : null,
    }));

const measured = allSpecs.filter(s => s.ms !== null);
const meanMs = measured.length
    ? measured.reduce((a, b) => a + b.ms, 0) / measured.length
    : 0;
for (const s of allSpecs) {
    if (s.ms === null) s.ms = meanMs;
}

// Sort longest-first
allSpecs.sort((a, b) => b.ms - a.ms);

// Greedy bin-pack — assign each spec to the currently-lightest bin.
const bins = Array.from({ length: shardTotal }, () => ({ ms: 0, files: [] }));
for (const spec of allSpecs) {
    bins.sort((a, b) => a.ms - b.ms);
    bins[0].ms += spec.ms;
    bins[0].files.push(spec.file);
}
// After sorting, bins are no longer in original order. Make assignment stable
// by re-sorting deterministically (descending by total ms, then by first file).
bins.sort((a, b) => b.ms - a.ms || a.files[0].localeCompare(b.files[0]));

const myBin = bins[shardIndex - 1];
// Sort files within the bin alphabetically for stable test order in CI logs.
myBin.files.sort();

// Print paths relative to tests/pw, which is what `npx playwright test` expects
// when invoked from tests/pw cwd.
for (const f of myBin.files) {
    console.log(path.posix.join('tests', 'e2e', f.split(path.sep).join('/')));
}
