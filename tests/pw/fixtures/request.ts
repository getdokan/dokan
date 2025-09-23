import { test as base } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';

type apiUtils = {
    apiUtils: ApiUtils;
};

export const test = base.extend<apiUtils>({
    apiUtils: async ({ request }, use) => {
        await use(new ApiUtils(request));
    },
});

export { expect } from '@playwright/test';
