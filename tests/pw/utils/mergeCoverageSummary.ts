// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
const path = require('path');

const { REPORT_TYPE } = process.env;

interface CoverageReport {
    total_features: number;
    total_covered_features: number;
    coverage: string;
    page_coverage: Record<string, number>;
    covered_features: string[];
    uncovered_features: string[];
}

// Helper function to merge page coverage
const mergePageCoverage = (existing: Record<string, number>, newCoverage: Record<string, number>): Record<string, number> => {
    const merged: Record<string, number> = { ...existing };
    for (const page in newCoverage) {
        merged[page] = Math.round(((merged[page] ?? 0) + newCoverage[page]) * 100) / 100;
    }
    return merged;
};

// Main function to merge coverage files
const mergeCoverageReports = (reportPaths: string[]): CoverageReport => {
    const mergedReport: CoverageReport = {
        total_features: 0,
        total_covered_features: 0,
        coverage: '0',
        page_coverage: {},
        covered_features: [],
        uncovered_features: [],
    };

    reportPaths.forEach(reportPath => {
        const report: CoverageReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

        // Merge page coverage
        mergedReport.page_coverage = mergePageCoverage(mergedReport.page_coverage, report.page_coverage);

        // Append features (deduplication and sorting will be handled separately)
        mergedReport.covered_features.push(...report.covered_features);
        mergedReport.uncovered_features.push(...report.uncovered_features);
    });

    // Deduplicate and sort features after all reports are merged
    mergedReport.covered_features = [...new Set(mergedReport.covered_features)].sort();
    mergedReport.uncovered_features = [...new Set(mergedReport.uncovered_features)].filter(feature => !mergedReport.covered_features.includes(feature)).sort();

    mergedReport.total_features = mergedReport.covered_features.length + mergedReport.uncovered_features.length;
    mergedReport.total_covered_features = mergedReport.covered_features.length;

    // Recalculate overall coverage percentage
    mergedReport.coverage = ((mergedReport.total_covered_features / mergedReport.total_features) * 100).toFixed(2) + '%';

    return mergedReport;
};

// Main script execution
const reportsFolder = './all-reports'; // Update to your artifacts folder location
const reportPaths: string[] = [];

// Collect all coverage.json files
const findReports = (dir: string): void => {
    // console.log(`Scanning directory: ${dir}`);
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        // console.log(`Checking: ${fullPath} (${isDirectory ? 'Directory' : 'File'})`);
        if (isDirectory) {
            findReports(fullPath); // Recurse into all directories
        } else if (file === 'coverage.json') {
            // Push the file path if it matches REPORT_TYPE
            if (fullPath.includes(`${path.sep}${REPORT_TYPE}${path.sep}`)) {
                console.log(`Matched file: ${fullPath}`);
                reportPaths.push(fullPath);
            }
        }
    });
};

findReports(reportsFolder);

if (reportPaths.length === 0) {
    console.error('No coverage.json files found in artifacts.');
    process.exit(1);
}

// Merge reports
const mergedCoverage = mergeCoverageReports(reportPaths);

// Save the merged coverage report
const outputPath = './all-reports/merged-coverage.json';
fs.writeFileSync(outputPath, JSON.stringify(mergedCoverage, null, 2), 'utf8');

console.log(`Merged coverage report saved to ${outputPath}`);
