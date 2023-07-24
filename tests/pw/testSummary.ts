// import * as core from '@actions/core'
// require('dotenv').config();
const convert = require('xml-js');
const fs = require('fs');
const { SHA, PR_NUMBER } = process.env;

const readEnvInfo = fs.readFileSync('./tests/pw/systemInfo.json', 'utf8');
const envInfo = JSON.parse(readEnvInfo);

const apiTestResultFile = './tests/pw/playwright-report/api/junit-report/api-results.xml';
const e2eTestResultFile = './tests/pw/playwright-report/e2e/junit-report/e2e-results.xml';

const getFormattedDuration = ( time) => {
	time =  Number(time) * 1000;
	// const min = Math.floor( time / 1000 / 60 );
	// const sec = Math.floor( ( time / 1000 ) % 60 );
	// return `${ min }m ${ (sec < 10 ? '0' : '') + sec }s`;
	const date = new Date(time);
	return `${date.getMinutes()}m ${date.getSeconds()}s`;
	// return `${date.getMinutes()}.${date.getSeconds()}s`;
};

const getTestResult = (suiteName, filePath) => {
	if (fs.existsSync(filePath)) {
		const xmlFile = fs.readFileSync(filePath, 'utf8');
		const jsonData = JSON.parse(convert.xml2json(xmlFile, { compact: true, spaces: 2 }));
		const testResult = jsonData.testsuites._attributes;
		const testSummary = [suiteName, testResult.tests, String( testResult.tests - testResult.skipped - testResult.failures ), testResult.failures, testResult.skipped, getFormattedDuration(testResult.time)];
		return testSummary;}
	else {
		return [];
	}
};

const addSummaryHeadingAndTable = ( core ) => {
	const tableHeader =   [
		{ data: 'Test  :test_tube:', header: true },
		{ data: 'Total  :bar_chart:', header: true },
		{ data: 'Passed  :white_check_mark:', header: true },
		{ data: 'Failed  :rotating_light:', header: true },
		// { data: 'Flaky :construction:', header: true }, //TODO: add flaky tests
		{ data: 'Skipped  :next_track_button:', header: true },
		{ data: 'Duration  :alarm_clock:', header: true },
	];
	const apiTesResult = getTestResult('API Tests', apiTestResultFile);
	const e2eTesResult = getTestResult('E2E Tests', e2eTestResultFile);
	core.summary
		.addHeading( 'Tests Summary' )
		.addRaw( `Commit SHA: ${ SHA }` )
		.addBreak()
		.addBreak()
		.addTable( [tableHeader, apiTesResult, e2eTesResult] );
};

const addList = ( core ) => {
	const pluginList = core.summary.addList(envInfo.activePlugins).stringify();
	core.summary.clear();
	const pluginDetails =  core.summary.addDetails('Plugins: ', pluginList).stringify();
	core.summary.clear();
	return core.summary.addList([envInfo.wpVersion, envInfo.phpVersion, envInfo.mysqlVersion,  String(envInfo.wpDebugMode), envInfo.theme, pluginDetails ]).stringify();
};

const addSummaryFooter = ( core, list) => {
	core.summary
		.addBreak()
		.addDetails('Test Environment Details: ', list);
};

module.exports = async ( { github, context, core } ) => {
	const plugins = addList(core);
	await core.summary.clear();
	addSummaryHeadingAndTable( core );
	addSummaryFooter( core, plugins );
	const summary = core.summary.stringify();
	await core.summary.write();
	return summary;
};
