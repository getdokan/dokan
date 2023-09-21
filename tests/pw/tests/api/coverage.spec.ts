import { test } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
});

test.describe.only('coverage', () => {
    test('get coverage ', async () => {
        // const [, responseBody1] = await apiUtils.get(endPoints.getAllDokanEndpointsV1);
        // const [, responseBody2] = await apiUtils.get(endPoints.getAllDokanEndpointsV2);
        const [, responseBody3] = await apiUtils.get(endPoints.getAllDokanEndpointsAdmin);
        // console.log(responseBody1);
        // console.log(responseBody2);
        console.log(responseBody3);
        const routes = Object.keys(responseBody3.routes);
        const routeValues = Object.values(responseBody3.routes);
        console.log(routes);
        const methods = routeValues.map((o: { id: unknown }) => o.methods.toString());
        console.log(methods);
        const output: string[] = [];
        for (let i = 0; i < routes.length; i++) {
            output[i] = routes[i] + '     ' + methods[i];
            // console.log();
            
        }
        console.log(output);
    });
});
