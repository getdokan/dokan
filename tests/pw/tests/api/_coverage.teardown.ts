import { test, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { helpers } from '@utils/helpers';
import { execSync } from 'child_process';

test.describe('get api test coverage', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get coverage', async () => {
        const [, responseBody1] = await apiUtils.get(endPoints.getAllDokanEndpointsAdmin);
        const [, responseBody2] = await apiUtils.get(endPoints.getAllDokanEndpointsV1);
        const [, responseBody3] = await apiUtils.get(endPoints.getAllDokanEndpointsV2);
        const allRoutes = [...Object.keys(responseBody1.routes), ...Object.keys(responseBody2.routes), ...Object.keys(responseBody3.routes)];
        // const allRoutes = [ ...Object.keys(responseBody3.routes)];
        const allRouteObjValues = [...Object.values(responseBody1.routes), ...Object.values(responseBody2.routes), ...Object.values(responseBody3.routes)];
        // const allRouteObjValues = [ ...Object.values(responseBody3.routes)];
        const allRouteMethods: string[][] = allRouteObjValues.map(route => route.methods);
        // console.log(allRoutes);
        // console.log(allRouteMethods);
        let coverageArray = allRouteMethods.flatMap((methods, i) => methods.map(method => `${method} ${allRoutes[i]}`));
        coverageArray = [...new Set(coverageArray)];
        coverageArray = coverageArray.filter(e => !e.includes('PATCH'));
        // console.log(coverageArray);
        console.log(coverageArray.length);
        getCoverage(coverageArray);
    });
});

function getCoverage(coverageArray: any[]) {
    const totalEndPoints = coverageArray.length;
    let coveredEndPoints = 0;
    const nonCoveredEndpoints: string[] = [];
    //Iterates through the coverageArray to grep each file in the test directory looking for matches
    for (const route of coverageArray) {
        const pattern = `COVERAGE_TAG: ${helpers.escapeRegex(route)}$`;
        const output = execSync(`grep -irl -E '${pattern}' tests/api | cat  `, { encoding: 'utf-8' });
        // console.log('route: ', pattern);
        // console.log('grep_Output: ', output);
        if (output.toString() != '') {
            coveredEndPoints += 1;
        } else {
            console.log(`Endpoint with no coverage: ${route}`);
            nonCoveredEndpoints.push(route);
        }
    }

    const percentCovered = ((coveredEndPoints / totalEndPoints) * 100).toFixed(2);
    console.log('Total Endpoints: ' + totalEndPoints);
    console.log('Covered Endpoints: ' + coveredEndPoints);
    console.log('Coverage: ' + percentCovered + '%');
}
