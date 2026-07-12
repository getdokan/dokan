// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

const {
    SHA,
    PR_NUMBER,
    SYSTEM_INFO,
    API_TEST_RESULT,
    E2E_TEST_RESULT,
    API_COVERAGE,
    E2E_COVERAGE,
    GITHUB_REPOSITORY,
    GITHUB_RUN_ID,
    GITHUB_REF_NAME,
    GITHUB_SERVER_URL,
} = process.env;

// ----------------------------------------------------------------------------
// data helpers
// ----------------------------------------------------------------------------

const readFile = filePath => (filePath && fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : false);

const getCoverage = filePath => {
    const report = readFile(filePath);
    if (!report || typeof report.coverage === 'undefined') return null;
    // The coverage report stores the value as a string with a "%" suffix
    // (e.g. "74.22%"). Strip it so we can render it consistently.
    const raw = String(report.coverage).replace('%', '').trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
};

const num = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const fmtPct = value => (value === null || value === undefined ? '—' : `${num(value).toFixed(2)}%`);

// ----------------------------------------------------------------------------
// presentation helpers
// ----------------------------------------------------------------------------

const verdictBadge = result => {
    if (!result) return '⚪️ No data';
    if (result.failed > 0) return '🔴 Failed';
    if (num(result.missing_reports) > 0) return '🟠 Incomplete';
    return '🟢 Passed';
};

const passRate = result => {
    if (!result) return '—';
    const ran = num(result.passed) + num(result.failed);
    if (ran === 0) return '—';
    return `${((num(result.passed) / ran) * 100).toFixed(1)}%`;
};

const cell = value => ({ data: String(value ?? '—') });
const headerCell = label => ({ data: label, header: true });

const buildSuiteRow = (suiteName, result, coverage) => {
    if (!result) return null;
    return [
        cell(`<strong>${suiteName}</strong>`),
        cell(verdictBadge(result)),
        cell(num(result.total_tests).toLocaleString()),
        cell(`✅ ${num(result.passed).toLocaleString()}`),
        cell(num(result.failed) > 0 ? `❌ ${num(result.failed).toLocaleString()}` : `0`),
        cell(`⏭️ ${num(result.skipped).toLocaleString()}`),
        cell(passRate(result)),
        cell(result.suite_duration_formatted || '—'),
        cell(fmtPct(coverage)),
    ];
};

// ----------------------------------------------------------------------------
// summary sections
// ----------------------------------------------------------------------------

const buildHeader = core => {
    const branch = GITHUB_REF_NAME || '';
    const repo = GITHUB_REPOSITORY || '';
    const runUrl = GITHUB_RUN_ID && repo ? `${GITHUB_SERVER_URL || 'https://github.com'}/${repo}/actions/runs/${GITHUB_RUN_ID}` : '';
    const prUrl = PR_NUMBER && repo ? `${GITHUB_SERVER_URL || 'https://github.com'}/${repo}/pull/${PR_NUMBER}` : '';
    const shortSha = SHA ? String(SHA).slice(0, 7) : '';
    const commitUrl = SHA && repo ? `${GITHUB_SERVER_URL || 'https://github.com'}/${repo}/commit/${SHA}` : '';

    // GitHub job summaries only render images from a URL (base64/data-URIs are stripped), so the
    // logo is referenced from the repo by a commit-pinned raw URL. Falls back to the emoji locally.
    const assetRef = SHA || process.env.GITHUB_SHA || 'develop';
    const pwLogo = repo
        ? `<img src="https://raw.githubusercontent.com/${repo}/${assetRef}/tests/pw/utils/assets/playwright_logo.png" alt="Playwright" height="28"> `
        : '🧪 ';
    core.summary.addRaw(`<h1>${pwLogo}Playwright Test Report</h1>`).addEOL();

    const metaRows = [
        SHA ? `<strong>Commit:</strong> <a href="${commitUrl}"><code>${shortSha}</code></a>` : '',
        branch ? `<strong>Branch:</strong> <code>${branch}</code>` : '',
        PR_NUMBER ? `<strong>PR:</strong> <a href="${prUrl}">#${PR_NUMBER}</a>` : '',
        runUrl ? `<strong>Run:</strong> <a href="${runUrl}">view logs</a>` : '',
    ].filter(Boolean);

    if (metaRows.length) {
        // Emit HTML, not markdown: this line sits directly under the <h1> HTML
        // block above, so GitHub treats it as raw HTML and would render markdown
        // `**bold**` / `[text](url)` literally. <strong>/<a>/<code> render right.
        core.summary.addRaw(`<p>${metaRows.join(' &nbsp;·&nbsp; ')}</p>`).addEOL().addEOL();
    }
};

const buildOverallBanner = (core, results) => {
    const totals = results.reduce(
        (acc, r) => {
            if (!r) return acc;
            acc.total += num(r.total_tests);
            acc.passed += num(r.passed);
            acc.failed += num(r.failed);
            acc.skipped += num(r.skipped);
            acc.missing += num(r.missing_reports);
            return acc;
        },
        { total: 0, passed: 0, failed: 0, skipped: 0, missing: 0 },
    );

    const status = totals.failed > 0 ? '🔴 <strong>Failed</strong>' : totals.missing > 0 ? '🟠 <strong>Incomplete</strong>' : '🟢 <strong>Passed</strong>';
    const ran = totals.passed + totals.failed;
    const rate = ran === 0 ? '—' : `${((totals.passed / ran) * 100).toFixed(1)}%`;

    // HTML, not markdown (see buildHeader): rendered as a raw-HTML block, so use
    // <strong> — `**` would show literally. Spell the arithmetic out (total =
    // passed + failed + skipped; pass rate is over the tests that ran).
    core.summary
        .addRaw(
            `<blockquote>${status} &nbsp;·&nbsp; <strong>${totals.passed.toLocaleString()} / ${totals.total.toLocaleString()}</strong> tests passed (${totals.failed.toLocaleString()} failed, ${totals.skipped.toLocaleString()} skipped) &nbsp;·&nbsp; pass rate <strong>${rate}</strong> of the ${ran.toLocaleString()} tests run</blockquote>`,
        )
        .addEOL()
        .addEOL();

    // A shard that dies before uploading its results would otherwise just
    // shrink the totals silently — call it out instead of reporting green.
    results.forEach(r => {
        if (!r || num(r.missing_reports) === 0) return;
        core.summary
            .addRaw(
                `<blockquote>⚠️ <strong>${r.suite_name || 'Suite'} results are incomplete:</strong> only ${num(r.merged_reports)} of ${num(r.expected_reports)} shard reports were uploaded — a shard job died before finishing (e.g. environment start failure), so the totals above under-count the suite. Check the failed jobs on this run.</blockquote>`,
            )
            .addEOL()
            .addEOL();
    });
};

const buildSuiteTable = (core, rows) => {
    const header = [
        headerCell('Suite'),
        headerCell('Status'),
        headerCell('Total'),
        headerCell('Passed'),
        headerCell('Failed'),
        headerCell('Skipped'),
        headerCell('Pass rate'),
        headerCell('Duration'),
        headerCell('Coverage'),
    ];
    core.summary.addTable([header, ...rows.filter(Boolean)]);
};

const buildFailedDetails = (core, results) => {
    const lines = [];
    results.forEach(r => {
        if (!r) return;
        if (r.failed_tests && r.failed_tests.length) {
            lines.push(`<details><summary>❌ <strong>Failed in ${r.suite_name || 'Suite'}</strong> (${r.failed_tests.length})</summary>\n\n${r.failed_tests.map(t => `- ${t}`).join('\n')}\n\n</details>`);
        }
    });
    if (lines.length === 0) return;
    core.summary.addRaw(lines.join('\n')).addEOL().addEOL();
};

const buildEnvironmentDetails = (core) => {
    const envInfo = readFile(SYSTEM_INFO);
    if (!envInfo) return;
    const rows = [
        ['OS', envInfo.os],
        ['Browser', envInfo.browser],
        ['WordPress', envInfo.wpVersion],
        ['PHP', envInfo.phpVersion],
        ['MySQL', envInfo.mysqlVersion],
        ['Theme', envInfo.theme],
        ['WP_DEBUG', String(envInfo.wpDebugMode)],
    ].filter(([, v]) => v !== undefined && v !== null && v !== '');

    const envTable = `
| Setting | Value |
|---|---|
${rows.map(([k, v]) => `| ${k} | \`${v}\` |`).join('\n')}
`;

    const plugins = Array.isArray(envInfo.activePlugins) && envInfo.activePlugins.length
        ? `\n\n<details><summary><strong>Active plugins (${envInfo.activePlugins.length})</strong></summary>\n\n${envInfo.activePlugins.map(p => `- ${p}`).join('\n')}\n\n</details>`
        : '';

    core.summary.addRaw(`<details><summary><strong>🛠️ Test environment</strong></summary>\n${envTable}${plugins}\n</details>`).addEOL();
};

// ----------------------------------------------------------------------------
// entrypoint
// ----------------------------------------------------------------------------

module.exports = async ({ github, context, core }) => {
    await core.summary.clear();

    const apiResult = readFile(API_TEST_RESULT) || null;
    const e2eResult = readFile(E2E_TEST_RESULT) || null;
    if (apiResult) apiResult.suite_name = 'API Tests';
    if (e2eResult) e2eResult.suite_name = 'E2E Tests';

    const apiCoverage = getCoverage(API_COVERAGE);
    const e2eCoverage = getCoverage(E2E_COVERAGE);

    buildHeader(core);
    buildOverallBanner(core, [apiResult, e2eResult]);
    buildSuiteTable(core, [
        buildSuiteRow('API Tests', apiResult, apiCoverage),
        buildSuiteRow('E2E Tests', e2eResult, e2eCoverage),
    ]);
    buildFailedDetails(core, [apiResult, e2eResult]);
    buildEnvironmentDetails(core);

    const out = core.summary.stringify();
    await core.summary.write();
    return out;
};
