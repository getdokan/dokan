import { test as teardown, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { helpers } from '@utils/helpers';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// todo: update coverage logic to get coverage from only running tests

teardown.describe('get api test coverage', () => {
    const outputFile = 'playwright-report/api/coverage-report/coverage.json';
    let apiUtils: ApiUtils;

    teardown.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    teardown.afterAll(async () => {
        await apiUtils.dispose();
    });

    teardown('get coverage', { tag: ['@lite'] }, async () => {
        const endpoints = [endPoints.getAllDokanEndpointsAdmin, endPoints.getAllDokanEndpointsV1, endPoints.getAllDokanEndpointsV2];
        const allRoutes: string[] = [];
        const allRouteObjValues = [];
        for (const endpoint of endpoints) {
            const [, responseBody] = await apiUtils.get(endpoint);
            allRoutes.push(...Object.keys(responseBody.routes));
            allRouteObjValues.push(...Object.values(responseBody.routes));
        }
        const allRouteMethods: string[][] = allRouteObjValues.map((route: any) => route.methods);
        let coverageArray = allRouteMethods.flatMap((methods, i) => methods.map(method => `${method} ${allRoutes[i]}`));
        coverageArray = [...new Set(coverageArray)];
        coverageArray = coverageArray.filter(e => !e.includes('PATCH'));
        // console.log(coverageArray);
        // console.log(coverageArray.length);
        getCoverage(coverageArray, outputFile);
    });
});

function getCoverage(coverageArray: any[], outputFile?: string) {
    const coverageReport: any = {
        total_endpoints: 0,
        covered_endpoints: 0,
        coverage: '',
        covered_EndpointsList: [],
        uncovered_EndpointsList: [],
    };

    const totalEndPoints = coverageArray.length;
    let coveredEndPoints = 0;
    const coveredEndPointsList: string[] = [];
    const uncoveredEndpointsList: string[] = [];
    // Iterates through the coverageArray to grep each file in the test directory looking for matches
    for (const route of coverageArray) {
        const pattern = `COVERAGE_TAG: ${helpers.escapeRegex(route)}$`;
        const output = execSync(`grep -irl -E '${pattern}' tests/api | cat  `, { encoding: 'utf-8' });
        if (output.toString() != '') {
            coveredEndPoints += 1;
            coveredEndPointsList.push(route);
        } else {
            uncoveredEndpointsList.push(route);
        }
    }
    const percentCovered = ((coveredEndPoints / totalEndPoints) * 100).toFixed(2) + '%';

    if (outputFile) {
        coverageReport.total_endpoints = totalEndPoints;
        coverageReport.covered_endpoints = coveredEndPoints;
        coverageReport.coverage = percentCovered;
        coverageReport.covered_EndpointsList = coveredEndPointsList;
        coverageReport.uncovered_EndpointsList = uncoveredEndpointsList;
        if (!fs.existsSync(path.dirname(outputFile))) {
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        }
        fs.writeFileSync(outputFile, JSON.stringify(coverageReport));
    } else {
        console.log('Covered Endpoints List: ', coveredEndPointsList);
        console.log('Uncovered Endpoints List: ', uncoveredEndpointsList);
        console.log('Total Endpoints: ' + totalEndPoints);
        console.log('Covered Endpoints: ' + coveredEndPoints);
        console.log('Coverage: ' + percentCovered + '%');
    }
}
