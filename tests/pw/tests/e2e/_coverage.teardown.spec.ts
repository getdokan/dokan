import { test as teardown } from '@playwright/test';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;
let executed_tests: string[] = [];

let totalProductFeatures = 0;
let coveredProductFeatures = 0;
let totalPageFeatures = 0;
let coveredPageFeatures = 0;
const coveredFeatures: string[] = [];
const uncoveredFeatures: string[] = [];

teardown.describe('get e2e test coverage', () => {
    const feature_map = 'feature-map/feature-map.yml';
    const outputFile = 'playwright-report/e2e/coverage-report/coverage.json';
    const testReport = 'playwright-report/e2e/summary-report/results.json';

    teardown('get coverage', { tag: ['@lite'] }, async () => {
        executed_tests = (helpers.readJson(testReport))?.tests;
        getCoverage(feature_map, outputFile);
    });
});

function getCoverage(filePath: string, outputFile?: string) {
    const obj = yaml.load(fs.readFileSync(filePath, { encoding: 'utf-8' }));
    const pages = JSON.parse(JSON.stringify(obj, null, 2));
    const coverageReport: {
        [key: string]: any | { [key: string]: any };
    } = {
        total_features: 0,
        total_covered_features: 0,
        coverage: '',
        page_coverage: {},
        covered_features: [],
        uncovered_features: [],
    };

    pages.forEach((page: any) => {
        iterateThroughFeature(page.features);
        const pageCoverage = Math.round((coveredPageFeatures / totalPageFeatures) * 100 * 100) / 100;
        if (!isNaN(pageCoverage)) {
            coverageReport.page_coverage[page.page] = pageCoverage;
        }

        // resetting count for the current page
        totalPageFeatures = 0;
        coveredPageFeatures = 0;
    });

    const totalCoverage = Math.round((coveredProductFeatures / totalProductFeatures) * 100 * 100) / 100;
    coverageReport.total_features = totalProductFeatures;
    coverageReport.total_covered_features = coveredProductFeatures;
    coverageReport.coverage = totalCoverage + '%';
    coverageReport.covered_features = coveredFeatures;
    coverageReport.uncovered_features = uncoveredFeatures;

    if (outputFile) {
        if (!fs.existsSync(path.dirname(outputFile))) {
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        }
        fs.writeFileSync(outputFile, JSON.stringify(coverageReport));
    } else {
        console.log('\n total features:', totalProductFeatures);
        console.log('\n total covered features:', coveredProductFeatures);
        console.log('\n total coverage:', totalCoverage + '%');
        console.log('\n page coverage:', coverageReport.page_coverage);
        console.log('\n covered features:', coveredFeatures);
        console.log('\n uncovered features:', uncoveredFeatures);
    }
}

function iterateThroughFeature(feature: any) {
    Object.entries(feature).forEach(([key, value]) => {
        if (typeof value === 'object') {
            iterateThroughFeature(feature[key]);
        } else {
            if (!DOKAN_PRO && !key.includes('[lite]')) {
                return;
            }
            totalPageFeatures++;
            totalProductFeatures++;
            key = key.replace(' [lite]', '');
            if (value && executed_tests.includes(key)) {
                coveredPageFeatures++;
                coveredProductFeatures++;
                coveredFeatures.push(key);
            } else {
                uncoveredFeatures.push(key);
            }
        }
    });
}
