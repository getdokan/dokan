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
    // Flaky tests pass on retry, so the suite did not fail. The Flaky
    // column already shows the count; keep the Status column clean.
    return '🟢 Passed';
};

const passRate = result => {
    if (!result) return '—';
    const ran = num(result.passed) + num(result.failed) + num(result.flaky);
    if (ran === 0) return '—';
    return `${((num(result.passed) / ran) * 100).toFixed(1)}%`;
};

const cell = value => ({ data: String(value ?? '—') });
const headerCell = label => ({ data: label, header: true });

const buildSuiteRow = (suiteName, result, coverage) => {
    if (!result) return null;
    return [
        cell(`**${suiteName}**`),
        cell(verdictBadge(result)),
        cell(num(result.total_tests).toLocaleString()),
        cell(`✅ ${num(result.passed).toLocaleString()}`),
        cell(num(result.failed) > 0 ? `❌ ${num(result.failed).toLocaleString()}` : `0`),
        cell(num(result.flaky) > 0 ? `⚠️ ${num(result.flaky).toLocaleString()}` : `0`),
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

    core.summary.addHeading('🧪 Playwright Test Report', 1);

    const metaRows = [
        SHA ? `**Commit:** [\`${shortSha}\`](${commitUrl})` : '',
        branch ? `**Branch:** \`${branch}\`` : '',
        PR_NUMBER ? `**PR:** [#${PR_NUMBER}](${prUrl})` : '',
        runUrl ? `**Run:** [view logs](${runUrl})` : '',
    ].filter(Boolean);

    if (metaRows.length) {
        core.summary.addRaw(metaRows.join(' &nbsp;·&nbsp; ')).addEOL().addEOL();
    }
};

const buildOverallBanner = (core, results) => {
    const totals = results.reduce(
        (acc, r) => {
            if (!r) return acc;
            acc.total += num(r.total_tests);
            acc.passed += num(r.passed);
            acc.failed += num(r.failed);
            acc.flaky += num(r.flaky);
            acc.skipped += num(r.skipped);
            return acc;
        },
        { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0 },
    );

    const status = totals.failed > 0 ? '🔴 **Failed**' : '🟢 **Passed**';
    const flakyNote = totals.flaky > 0 && totals.failed === 0 ? ` &nbsp;·&nbsp; ⚠️ ${totals.flaky} flaky (passed on retry)` : '';
    const ran = totals.passed + totals.failed + totals.flaky;
    const rate = ran === 0 ? '—' : `${((totals.passed / ran) * 100).toFixed(1)}%`;

    core.summary.addRaw(`> ${status} &nbsp;·&nbsp; **${totals.passed.toLocaleString()} / ${totals.total.toLocaleString()}** tests passed &nbsp;·&nbsp; pass rate **${rate}**${flakyNote}`).addEOL().addEOL();
};

const buildSuiteTable = (core, rows) => {
    const header = [
        headerCell('Suite'),
        headerCell('Status'),
        headerCell('Total'),
        headerCell('Passed'),
        headerCell('Failed'),
        headerCell('Flaky'),
        headerCell('Skipped'),
        headerCell('Pass rate'),
        headerCell('Duration'),
        headerCell('Coverage'),
    ];
    core.summary.addTable([header, ...rows.filter(Boolean)]);
};

const buildFailedAndFlakyDetails = (core, results) => {
    const lines = [];
    results.forEach(r => {
        if (!r) return;
        if (r.failed_tests && r.failed_tests.length) {
            lines.push(`<details><summary>❌ <strong>Failed in ${r.suite_name || 'Suite'}</strong> (${r.failed_tests.length})</summary>\n\n${r.failed_tests.map(t => `- ${t}`).join('\n')}\n\n</details>`);
        }
        if (r.flaky_tests && r.flaky_tests.length) {
            lines.push(`<details><summary>⚠️ <strong>Flaky in ${r.suite_name || 'Suite'}</strong> (${r.flaky_tests.length})</summary>\n\n${r.flaky_tests.map(t => `- ${t}`).join('\n')}\n\n</details>`);
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
    buildFailedAndFlakyDetails(core, [apiResult, e2eResult]);
    buildEnvironmentDetails(core);

    const out = core.summary.stringify();
    await core.summary.write();
    return out;
};
