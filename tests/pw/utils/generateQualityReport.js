#!/usr/bin/env node
/*
 * Renders the Dokan QA Quality Report HTML by substituting placeholders in
 * tests/pw/utils/quality-report-template.html with merged test/coverage data.
 *
 * Inputs (env, mirrors gitTestSummary.ts):
 *   API_TEST_RESULT       path to api summary results.json
 *   E2E_TEST_RESULT       path to merged e2e summary json
 *   API_COVERAGE          path to api coverage json
 *   E2E_COVERAGE          path to e2e coverage json
 *   ARTIFACTS_DIR         directory containing per-shard test-artifact-* folders
 *   OUTPUT_FILE           where to write the rendered HTML
 *
 *   GITHUB_RUN_ID, GITHUB_HEAD_REF, GITHUB_REF_NAME,
 *   GITHUB_REPOSITORY, GITHUB_SERVER_URL,
 *   PR_NUMBER, SHA            (already wired by the workflow)
 *
 * Missing inputs are tolerated — the corresponding sections render with em-dash
 * placeholders so the report is always produced.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, 'quality-report-template.html');
const OUTPUT_FILE = process.env.OUTPUT_FILE || path.join(process.cwd(), 'qa-report.html');

const readJson = filePath => {
    if (!filePath || !fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.warn(`generateQualityReport: failed to parse ${filePath}: ${e.message}`);
        return null;
    }
};

const num = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const formatDuration = ms => {
    if (!Number.isFinite(ms) || ms <= 0) return '—';
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m || h) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
};

const formatBytes = bytes => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(n >= 100 ? 0 : 1)} ${units[i]}`;
};

const dirSize = dir => {
    let total = 0;
    if (!fs.existsSync(dir)) return 0;
    const stack = [dir];
    while (stack.length) {
        const cur = stack.pop();
        const stat = fs.statSync(cur);
        if (stat.isDirectory()) {
            for (const child of fs.readdirSync(cur)) stack.push(path.join(cur, child));
        } else {
            total += stat.size;
        }
    }
    return total;
};

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[c]));

// ----------------------------------------------------------------------------

const apiResult = readJson(process.env.API_TEST_RESULT);
const e2eResult = readJson(process.env.E2E_TEST_RESULT);
const apiCoverageRaw = readJson(process.env.API_COVERAGE);
const e2eCoverageRaw = readJson(process.env.E2E_COVERAGE);

const suiteShape = report => {
    if (!report) return null;
    const total = num(report.total_tests);
    const passed = num(report.passed);
    const failed = num(report.failed);
    const skipped = num(report.skipped);
    const ran = passed + failed;
    const passRate = ran > 0 ? Math.round((passed / ran) * 1000) / 10 : 0;
    return {
        total,
        passed,
        failed,
        skipped,
        ran,
        passRate,
        durationMs: num(report.suite_duration),
        durationFormatted: report.suite_duration_formatted || formatDuration(report.suite_duration),
    };
};

const coverageShape = (raw) => {
    if (!raw) return { pct: null, total: 0, covered: 0 };
    const pctRaw = String(raw.coverage ?? '').replace('%', '').trim();
    const pct = Number.isFinite(Number(pctRaw)) ? Number(pctRaw) : null;
    return {
        pct,
        total: num(raw.total_features),
        covered: num(raw.total_covered_features),
    };
};

const api = suiteShape(apiResult);
const e2e = suiteShape(e2eResult);
const apiCov = coverageShape(apiCoverageRaw);
const e2eCov = coverageShape(e2eCoverageRaw);

// Aggregate metrics
const totals = {
    total: num(api?.total) + num(e2e?.total),
    passed: num(api?.passed) + num(e2e?.passed),
    failed: num(api?.failed) + num(e2e?.failed),
    skipped: num(api?.skipped) + num(e2e?.skipped),
    durationMs: num(api?.durationMs) + num(e2e?.durationMs),
};
totals.ran = totals.passed + totals.failed;
totals.passRate = totals.ran > 0 ? Math.round((totals.passed / totals.ran) * 1000) / 10 : 0;

// Combined coverage: weight by feature counts when available; else average pct.
let totalCoveragePct = null;
const combinedTotal = apiCov.total + e2eCov.total;
if (combinedTotal > 0) {
    totalCoveragePct = Math.round(((apiCov.covered + e2eCov.covered) / combinedTotal) * 1000) / 10;
} else if (apiCov.pct !== null || e2eCov.pct !== null) {
    const vals = [apiCov.pct, e2eCov.pct].filter(v => v !== null);
    totalCoveragePct = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

const overallFailed = totals.failed > 0;
const overallStatus = overallFailed ? 'failed' : 'passed';

// ----------------------------------------------------------------------------
// Artifacts (best-effort: list immediate subdirs under ARTIFACTS_DIR)

const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR;
const renderArtifacts = () => {
    if (!ARTIFACTS_DIR || !fs.existsSync(ARTIFACTS_DIR)) {
        return '<div class="artifact-item" style="grid-column: 1/-1;"><div class="artifact-info"><div class="artifact-name">No artifacts available</div></div></div>';
    }
    const ignore = new Set(['all-blob-reports', 'html-report']);
    const entries = fs.readdirSync(ARTIFACTS_DIR)
        .map(name => ({ name, full: path.join(ARTIFACTS_DIR, name) }))
        .filter(e => fs.statSync(e.full).isDirectory() && !ignore.has(e.name))
        .sort((a, b) => a.name.localeCompare(b.name));
    if (entries.length === 0) {
        return '<div class="artifact-item" style="grid-column: 1/-1;"><div class="artifact-info"><div class="artifact-name">No artifacts available</div></div></div>';
    }
    return entries.map(e => {
        const size = formatBytes(dirSize(e.full));
        return `            <div class="artifact-item">
                <div class="artifact-icon"><i class="ti ti-folder" aria-hidden="true"></i></div>
                <div class="artifact-info">
                    <div class="artifact-name">${escape(e.name)}</div>
                    <div class="artifact-size">${escape(size)}</div>
                </div>
            </div>`;
    }).join('\n');
};

// ----------------------------------------------------------------------------
// Template substitution

const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || '—';
const sha = (process.env.SHA || process.env.GITHUB_SHA || '').slice(0, 7) || '—';
const prNumber = process.env.PR_NUMBER || '—';
const runId = process.env.GITHUB_RUN_ID || '—';
const today = new Date().toISOString().slice(0, 10);

const fmtPct = v => v === null || v === undefined ? '—' : `${num(v).toFixed(1)}`;
const fmtCount = v => v === null || v === undefined ? '—' : String(num(v));

const placeholders = {
    BRANCH_NAME: branch,
    PR_NUMBER: prNumber,
    COMMIT_HASH: sha,
    DATE: today,
    DURATION: formatDuration(totals.durationMs),
    RUN_ID: runId,

    STATUS_CLASS: overallFailed ? 'failed' : '',
    STATUS_ICON: overallFailed ? '✕' : '✓',
    STATUS_MESSAGE: overallFailed ? 'Tests failed' : 'All tests passed',
    STATUS_DESCRIPTION: overallFailed
        ? `${totals.failed} failure${totals.failed === 1 ? '' : 's'} across the suite`
        : 'Build is green and ready for review',
    PASS_RATE: fmtPct(totals.passRate),

    TOTAL_TESTS: fmtCount(totals.total),
    PASSED_TESTS: fmtCount(totals.passed),
    FAILED_TESTS: fmtCount(totals.failed),
    FAILED_CLASS: totals.failed > 0 ? 'danger' : 'success',
    SKIPPED_TESTS: fmtCount(totals.skipped),
    TOTAL_DURATION: formatDuration(totals.durationMs),
    TOTAL_COVERAGE: fmtPct(totalCoveragePct),

    API_STATUS: api ? (api.failed > 0 ? 'Failed' : 'Passed') : 'No data',
    API_STATUS_CLASS: api && api.failed > 0 ? 'failed' : '',
    API_TOTAL: api ? fmtCount(api.total) : '—',
    API_PASSED: api ? fmtCount(api.passed) : '—',
    API_FAILED: api ? fmtCount(api.failed) : '—',
    API_FAILED_CLASS: api && api.failed > 0 ? 'failed' : '',
    API_SKIPPED: api ? fmtCount(api.skipped) : '—',
    API_DURATION: api ? formatDuration(api.durationMs) : '—',
    API_COVERAGE: fmtPct(apiCov.pct),
    API_PASS_RATE: api ? fmtPct(api.passRate) : '0',
    API_PROGRESS_CLASS: api && api.failed > 0 ? 'failed' : '',
    API_TOTAL_RUN: api ? fmtCount(api.ran) : '—',

    E2E_STATUS: e2e ? (e2e.failed > 0 ? 'Failed' : 'Passed') : 'No data',
    E2E_STATUS_CLASS: e2e && e2e.failed > 0 ? 'failed' : '',
    E2E_TOTAL: e2e ? fmtCount(e2e.total) : '—',
    E2E_PASSED: e2e ? fmtCount(e2e.passed) : '—',
    E2E_FAILED: e2e ? fmtCount(e2e.failed) : '—',
    E2E_FAILED_CLASS: e2e && e2e.failed > 0 ? 'failed' : '',
    E2E_SKIPPED: e2e ? fmtCount(e2e.skipped) : '—',
    E2E_DURATION: e2e ? formatDuration(e2e.durationMs) : '—',
    E2E_COVERAGE: fmtPct(e2eCov.pct),
    E2E_PASS_RATE: e2e ? fmtPct(e2e.passRate) : '0',
    E2E_PROGRESS_CLASS: e2e && e2e.failed > 0 ? 'failed' : '',
    E2E_TOTAL_RUN: e2e ? fmtCount(e2e.ran) : '—',
};

let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
for (const [key, value] of Object.entries(placeholders)) {
    html = html.replaceAll(`{{${key}}}`, escape(value));
}

// Inject artifacts section (the marker comment in the template stays inside the grid)
const artifactsHtml = renderArtifacts();
html = html.replace(
    /<div class="artifacts-grid" id="artifacts-container">[\s\S]*?<\/div>\s*<!-- Footer -->/,
    `<div class="artifacts-grid" id="artifacts-container">\n${artifactsHtml}\n        </div>\n\n        <!-- Footer -->`,
);

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, html);
console.log(`quality report → ${OUTPUT_FILE}`);
console.log(`  ${totals.total} tests | ${totals.passed} passed | ${totals.failed} failed | ${totals.skipped} skipped`);
console.log(`  pass rate ${totals.passRate}% | duration ${formatDuration(totals.durationMs)} | coverage ${totalCoveragePct ?? '—'}%`);

// ----------------------------------------------------------------------------
// Markdown variant for $GITHUB_STEP_SUMMARY (GitHub strips <style>/CSS, so the
// inline-styled HTML can't render there — this companion uses tables, emoji,
// Unicode progress bars, and a Mermaid pie chart that GH does render natively).

const SUMMARY_FILE = process.env.SUMMARY_FILE;
if (SUMMARY_FILE) {
    const RUN_URL = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && runId !== '—'
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${runId}`
        : null;

    const fmtNum = n => Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-US') : '—';
    const bar = (pct, width = 24) => {
        if (!Number.isFinite(pct)) return '`' + '░'.repeat(width) + '`';
        const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * width);
        return '`' + '█'.repeat(filled) + '░'.repeat(width - filled) + '`';
    };

    const statusEmoji = overallFailed ? '🔴' : '🟢';
    const statusHeading = overallFailed ? 'Tests failed' : 'All tests passed';
    const statusDesc = overallFailed
        ? `${totals.failed} failure${totals.failed === 1 ? '' : 's'} across the suite`
        : 'Build is green and ready for review';

    const apiBadge = !api ? '⚪️ No data' : api.failed > 0 ? '🔴 Failed' : '🟢 Passed';
    const e2eBadge = !e2e ? '⚪️ No data' : e2e.failed > 0 ? '🔴 Failed' : '🟢 Passed';

    const apiCovStr = apiCov.pct === null ? '—' : `${apiCov.pct.toFixed(2)}%`;
    const e2eCovStr = e2eCov.pct === null ? '—' : `${e2eCov.pct.toFixed(2)}%`;
    const totalCovStr = totalCoveragePct === null ? '—' : `${totalCoveragePct.toFixed(2)}%`;

    const suiteRow = (s, badge, covStr) => s
        ? `| ${badge} | ${fmtNum(s.total)} | **${fmtNum(s.passed)}** | ${s.failed > 0 ? '**' + fmtNum(s.failed) + '**' : fmtNum(s.failed)} | ${fmtNum(s.skipped)} | ${formatDuration(s.durationMs)} | ${covStr} | ${bar(s.passRate, 16)} ${s.passRate.toFixed(1)}% |`
        : `| ${badge} | — | — | — | — | — | ${covStr} | ${bar(NaN, 16)} — |`;

    const artifactRows = (() => {
        if (!ARTIFACTS_DIR || !fs.existsSync(ARTIFACTS_DIR)) return '_No artifacts available._';
        const ignore = new Set(['all-blob-reports', 'html-report']);
        const entries = fs.readdirSync(ARTIFACTS_DIR)
            .map(name => ({ name, full: path.join(ARTIFACTS_DIR, name) }))
            .filter(e => fs.statSync(e.full).isDirectory() && !ignore.has(e.name))
            .sort((a, b) => a.name.localeCompare(b.name));
        if (!entries.length) return '_No artifacts available._';
        return [
            '| Artifact | Size |',
            '| --- | ---: |',
            ...entries.map(e => `| 📁 \`${e.name}\` | ${formatBytes(dirSize(e.full))} |`),
        ].join('\n');
    })();

    const lines = [];
    lines.push('# 🛡 Dokan QA Quality Report');
    lines.push('');
    lines.push(`> ### ${statusEmoji} ${statusHeading}`);
    lines.push(`> _${statusDesc}_ · **Pass rate: ${totals.passRate.toFixed(1)}%**`);
    lines.push('');
    lines.push('| Branch | PR | Commit | Date | Duration |');
    lines.push('| --- | --- | --- | --- | --- |');
    lines.push(`| \`${branch}\` | ${prNumber === '—' ? '—' : '#' + prNumber} | \`${sha}\` | ${today} | ${formatDuration(totals.durationMs)} |`);
    lines.push('');
    lines.push('## 📊 Key Metrics');
    lines.push('');
    lines.push('| Total | ✅ Passed | ❌ Failed | ⚪️ Skipped | ⏱ Duration | 📈 Coverage |');
    lines.push('| ---: | ---: | ---: | ---: | ---: | ---: |');
    lines.push(`| **${fmtNum(totals.total)}** | **${fmtNum(totals.passed)}** | ${totals.failed > 0 ? '**' + fmtNum(totals.failed) + '**' : fmtNum(totals.failed)} | ${fmtNum(totals.skipped)} | ${formatDuration(totals.durationMs)} | ${totalCovStr} |`);
    lines.push('');

    // Mermaid pie chart of overall outcomes
    if (totals.total > 0) {
        lines.push('```mermaid');
        lines.push('pie showData');
        lines.push('  title Test Outcomes');
        lines.push(`  "Passed" : ${totals.passed}`);
        if (totals.failed > 0) lines.push(`  "Failed" : ${totals.failed}`);
        if (totals.skipped > 0) lines.push(`  "Skipped" : ${totals.skipped}`);
        lines.push('```');
        lines.push('');
    }

    lines.push('## 🧪 Test Suites');
    lines.push('');
    lines.push('| Suite | Total | Passed | Failed | Skipped | Duration | Coverage | Pass Rate |');
    lines.push('| --- | ---: | ---: | ---: | ---: | --- | ---: | --- |');
    lines.push(suiteRow(api, `🔌 **API Tests** · ${apiBadge}`, apiCovStr));
    lines.push(suiteRow(e2e, `🖥 **E2E Tests** · ${e2eBadge}`, e2eCovStr));
    lines.push('');

    lines.push('## 📦 Build Artifacts');
    lines.push('');
    lines.push(artifactRows);
    lines.push('');

    lines.push('---');
    lines.push('');
    const runLink = RUN_URL ? `[\`${runId}\`](${RUN_URL})` : `\`${runId}\``;
    lines.push(`<sub>🛡 Prepared by **Dokan QA Team** · Run ${runLink} · _Full styled HTML report available in the **quality-report** artifact._</sub>`);
    lines.push('');

    fs.mkdirSync(path.dirname(SUMMARY_FILE), { recursive: true });
    fs.writeFileSync(SUMMARY_FILE, lines.join('\n'));
    console.log(`markdown summary → ${SUMMARY_FILE}`);
}
