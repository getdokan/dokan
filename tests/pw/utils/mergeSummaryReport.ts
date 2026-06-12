// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
const path = require('path');

const { REPORT_TYPE } = process.env;
console.log(REPORT_TYPE);

interface TestReport {
    suite_name: string;
    total_tests: number;
    passed: number;
    failed: number;
    flaky: number;
    skipped: number;
    suite_duration: number;
    suite_duration_formatted?: string;
    all_suite_durations: number[];
    merged_reports?: number;
    expected_reports?: number | null;
    missing_reports?: number;
    tests: string[];
    passed_tests: string[];
    failed_tests: string[];
    flaky_tests: string[];
    skipped_tests: string[];
}

// Helper function to format duration
const getFormattedDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    return `${hours < 1 ? '' : hours + 'h '}${minutes < 1 ? '' : minutes + 'm '}${seconds < 1 ? '' : seconds + 's'}`;
};

// Main function to merge reports
const mergeReports = (reportPaths: string[]): TestReport => {
    const mergedReport: TestReport = {
        suite_name: '',
        total_tests: 0,
        passed: 0,
        failed: 0,
        flaky: 0,
        skipped: 0,
        suite_duration: 0,
        suite_duration_formatted: '',
        all_suite_durations: [],
        tests: [],
        passed_tests: [],
        failed_tests: [],
        flaky_tests: [],
        skipped_tests: [],
    };

    reportPaths.forEach(reportPath => {
        const report: TestReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

        mergedReport.all_suite_durations.push(report.suite_duration);

        // Sum the per-shard counts directly. The previous implementation
        // derived totals from `[...new Set(tests)].length`, which collapsed
        // unrelated tests that happened to share a `test.title` (many specs
        // re-use generic titles like `Test Case 1`, `Test Case 2`, ...) and
        // reported ~70 e2e tests instead of ~1133.
        mergedReport.total_tests += report.total_tests || 0;
        mergedReport.passed += report.passed || 0;
        mergedReport.failed += report.failed || 0;
        mergedReport.flaky += report.flaky || 0;
        mergedReport.skipped += report.skipped || 0;

        // Keep the title arrays for reference / drilldown. Don't dedupe —
        // duplicate titles across files are real distinct tests.
        mergedReport.tests.push(...report.tests);
        mergedReport.passed_tests.push(...report.passed_tests);
        mergedReport.failed_tests.push(...report.failed_tests);
        mergedReport.flaky_tests.push(...report.flaky_tests);
        mergedReport.skipped_tests.push(...report.skipped_tests);
    });

    mergedReport.tests.sort();
    mergedReport.passed_tests.sort();
    mergedReport.failed_tests.sort();
    mergedReport.flaky_tests.sort();
    mergedReport.skipped_tests.sort();

    mergedReport.suite_duration = Math.max(...mergedReport.all_suite_durations);

    // Format the suite duration
    mergedReport.suite_duration_formatted = getFormattedDuration(mergedReport.suite_duration);

    return mergedReport;
};

// Main script execution
const reportsFolder = './all-reports';
const reportPaths: string[] = [];

// Collect all reports.json files
const findReports = (dir: string): void => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        // console.log(`Checking: ${fullPath} (${isDirectory ? 'Directory' : 'File'})`);
        if (isDirectory) {
            findReports(fullPath); // Recurse into all directories
        } else if (file === 'results.json') {
            // Only consume summaries from this suite's own shard artifacts
            // (all-reports/test-artifact-<REPORT_TYPE>*). Matching any path that
            // contains the report type is not enough: every job (including the
            // api job) runs the site/auth/env setup projects via
            // playwright.config.ts, whose summary reporter writes to
            // playwright-report/e2e/summary-report/results.json. The e2e shard
            // run overwrites that file, but the api job never does — so its
            // setup-run summary ships inside test-artifact-api and used to be
            // merged as a 13th e2e shard, inflating the merged totals.
            if (fullPath.includes(`test-artifact-${REPORT_TYPE}`) && fullPath.includes(`${path.sep}${REPORT_TYPE}${path.sep}`)) {
                console.log(`Matched file: ${fullPath}`);
                reportPaths.push(fullPath);
            }
        }
    });
};

findReports(reportsFolder);

if (reportPaths.length === 0) {
    console.error('No results.json files found in artifacts.');
    process.exit(1);
}

// Detect shards that never reported. Every shard writes
// playwright/shard-features.json (with shardTotal) BEFORE its tests start,
// and results.json only AFTER they finish — so when a shard job dies early
// (e.g. wp-env never starts), the surviving manifests still tell us how many
// reports to expect. Without this check a dead shard silently shrinks the
// merged totals while the report stays green.
const findExpectedShards = (dir: string): number => {
    let expected = 0;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            expected = Math.max(expected, findExpectedShards(fullPath));
        } else if (file === 'shard-features.json' && fullPath.includes(`test-artifact-${REPORT_TYPE}`)) {
            try {
                const manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                expected = Math.max(expected, Number(manifest.shardTotal) || 0);
            } catch (e) {
                console.warn(`Could not parse ${fullPath}: ${e.message}`);
            }
        }
    });
    return expected;
};
const expectedReports = findExpectedShards(reportsFolder) || Number(process.env.EXPECTED_SHARDS) || 0;

// Merge reports
const mergedReport = mergeReports(reportPaths);
mergedReport.merged_reports = reportPaths.length;
mergedReport.expected_reports = expectedReports > 0 ? expectedReports : null;
mergedReport.missing_reports = expectedReports > 0 ? Math.max(0, expectedReports - reportPaths.length) : 0;
if (mergedReport.missing_reports > 0) {
    console.warn(`WARNING: only ${reportPaths.length} of ${expectedReports} ${REPORT_TYPE} shard reports found — merged totals under-count the suite.`);
}

// Save the merged report
const outputPath = './all-reports/merged-summary.json';
fs.writeFileSync(outputPath, JSON.stringify(mergedReport, null, 2), 'utf8');

console.log(`Merged summary report saved to ${outputPath}`);
