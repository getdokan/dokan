import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import qs from 'qs'
import playwrightApiMatchers from 'odottaa';
expect.extend(playwrightApiMatchers);

let apiUtils: any

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.skip(' api test', () => {


    test('a test ', async ({ request }) => {

        let a = {
            x: 'abc',
            y: 123,
            z: true,  
        }

        expect(a).toContainJSON(a)
  
    });
});
