#!/usr/bin/env node
/*
 * Generates tests/pw/utils/shard-labels.json by running getShardSpecs.js for
 * each shard, extracting the dominant feature (longest spec by ms), and
 * producing a human-readable label for the GitHub Actions sidebar.
 *
 * The labels are consumed by .github/workflows/e2e_api_tests.yml via a matrix
 * `include:` block. Whenever shard-durations.json is refreshed, re-run this
 * script and commit the new shard-labels.json so the sidebar stays accurate:
 *
 *   npm run refresh-shard-labels
 *
 * The script also prints a copy-paste-ready YAML snippet to stdout for the
 * matrix include block, so maintainers can sync the workflow in one step.
 *
 * Usage: node generateShardLabels.js [shardTotal]    (default: 12)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const shardTotal = parseInt(process.argv[2] || process.env.SHARD_TOTAL || '12', 10);
const pwRoot = path.resolve(__dirname, '..');
const baselinePath = path.join(__dirname, 'shard-durations.json');
const getShardSpecsPath = path.join(__dirname, 'getShardSpecs.js');
const outputPath = path.join(__dirname, 'shard-labels.json');

if (!fs.existsSync(baselinePath)) {
    console.error(`Missing baseline: ${baselinePath}`);
    console.error('Refresh it first via the merge-reports shard-durations-baseline artifact.');
    process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const baselineByFile = new Map();
for (const entry of baseline.specs || []) {
    baselineByFile.set(entry.file, entry.ms || 0);
}

// Acronyms that should stay uppercase in human-readable titles.
const ACRONYMS = new Set(['eu', 'seo', 'api', 'pdf', 'sms', 'qa', 'spmv']);

function toTitle(kebab) {
    return kebab
        .split('-')
        .map(w => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
        .join(' ');
}

const shards = [];

for (let i = 1; i <= shardTotal; i++) {
    // Call the existing bin-packer as a subprocess so this script stays in
    // lockstep with the algorithm CI actually uses. Performance doesn't matter
    // (runs once per baseline refresh).
    const out = execFileSync('node', [getShardSpecsPath, String(i), String(shardTotal)], {
        encoding: 'utf8',
        cwd: pwRoot,
    });

    const specs = out.trim().split('\n').filter(Boolean);

    let dominantSpec = null;
    let dominantMs = 0;
    let totalMs = 0;
    const features = new Set();

    for (const fullPath of specs) {
        // fullPath like 'tests/e2e/withdraws/withdraws.spec.ts'
        const rel = fullPath.replace(/^tests\/e2e\//, '');
        const dir = rel.split('/')[0];
        features.add(dir);

        const ms = baselineByFile.get(rel) || 0;
        totalMs += ms;
        if (ms > dominantMs) {
            dominantMs = ms;
            dominantSpec = rel;
        }
    }

    const dominantDir = dominantSpec ? dominantSpec.split('/')[0] : 'misc';
    const label = toTitle(dominantDir);

    shards.push({
        shardIndex: i,
        shardTotal,
        label,
        dominantSpec,
        dominantMs,
        totalMs,
        specCount: specs.length,
        featureCount: features.size,
        features: [...features].sort(),
    });
}

fs.writeFileSync(
    outputPath,
    JSON.stringify(
        {
            generatedAt: new Date().toISOString(),
            baselineGeneratedAt: baseline.generatedAt || null,
            shardTotal,
            shards,
        },
        null,
        2,
    ) + '\n',
    'utf8',
);

// Print a copy-paste-ready YAML snippet to stdout for the workflow matrix.
console.log('# Generated matrix include block — paste into');
console.log('# .github/workflows/e2e_api_tests.yml under jobs.e2e_tests.strategy.matrix.include:');
console.log('');
for (const s of shards) {
    const idxStr = String(s.shardIndex).padStart(2, ' ');
    console.log(`            - { shardIndex: ${idxStr}, shardTotal: ${s.shardTotal}, label: "${s.label}" }`);
}
console.log('');
console.log(`Labels written to: ${path.relative(process.cwd(), outputPath)}`);
