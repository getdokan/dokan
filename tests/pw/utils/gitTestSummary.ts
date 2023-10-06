const fs = require('fs');
const { SHA, PR_NUMBER, SYSTEM_INFO, API_TEST_RESULT, E2E_TEST_RESULT } = process.env;

const replace = obj => Object.keys(obj).forEach(key => (typeof obj[key] == 'object' ? replace(obj[key]) : (obj[key] = String(obj[key]))));
const readFile = filePath => (fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : false);
const getTestResult = (suiteName, filePath) => {
        const testResult = readFile(filePath);
        if (!testResult) {
            return [];
        }
        replace(testResult);
        const testSummary = [suiteName, testResult.total_tests, testResult.passed, testResult.failed, testResult.flaky, testResult.skipped, testResult.suite_duration_formatted];
        return testSummary;
};

const addSummaryHeadingAndTable = core => {
    const tableHeader = [
        { data: 'Test  :test_tube:', header: true },
        { data: 'Total  :bar_chart:', header: true },
        { data: 'Passed  :white_check_mark:', header: true },
        { data: 'Failed  :rotating_light:', header: true },
        { data: 'Flaky :construction:', header: true },
        { data: 'Skipped  :next_track_button:', header: true },
        { data: 'Duration  :alarm_clock:', header: true },
    ];
    const apiTesResult = getTestResult('API Tests', API_TEST_RESULT);
    const e2eTesResult = getTestResult('E2E Tests', E2E_TEST_RESULT);
    core.summary.addHeading('Tests Summary').addRaw(`Commit SHA: ${SHA}`).addBreak().addBreak().addTable([tableHeader, apiTesResult, e2eTesResult]);
};

const addList = core => {
    const envInfo = readFile(SYSTEM_INFO);
    if (!envInfo) {
        return false;
    }
    const pluginList = core.summary.addList(envInfo.activePlugins).stringify();
    core.summary.clear();
    const pluginDetails = core.summary.addDetails('Plugins: ', pluginList).stringify();
    core.summary.clear();
    return core.summary.addList([envInfo.wpVersion, envInfo.phpVersion, envInfo.mysqlVersion, String(envInfo.wpDebugMode), envInfo.theme, pluginDetails]).stringify();
};

const addSummaryFooter = (core, list) => {
    core.summary.addBreak().addDetails('Test Environment Details: ', list);
};

module.exports = async ({ github, context, core }) => {
    const plugins = addList(core);
    await core.summary.clear();
    addSummaryHeadingAndTable(core);
    plugins && addSummaryFooter(core, plugins);
    const summary = core.summary.stringify();
    await core.summary.write();
    return summary;
};
