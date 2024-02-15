import { test, request, Page } from '@playwright/test';
import { ProductAddonsPage } from '@pages/productAddonsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';

const { VENDOR_ID } = process.env;

test.describe('Product addon functionality test', () => {
    let vendor: ProductAddonsPage;
    let vPage: Page;
    let addonName: string;
    let addonFieldTitle: string;
    let apiUtils: ApiUtils;

    async function createVendorProductAddon(): Promise<[string, string, string]> {
        const [, addonId, addonName, addonFieldTitle] = await apiUtils.createProductAddon(payloads.createProductAddons(), payloads.adminAuth);
        await dbUtils.updateCell(addonId, VENDOR_ID);
        return [addonId, addonName, addonFieldTitle];
    }

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductAddonsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, addonName, addonFieldTitle] = await createVendorProductAddon();
    });

    test.afterAll(async () => {
        await apiUtils.deleteAllProductAddons(payloads.adminAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    test('vendor product addons menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorProductAddonsSettingsRenderProperly();
    });

    test('vendor can add addons @pro @v', async () => {
        await vendor.addAddon({ ...data.vendor.addon, name: data.vendor.addon.randomName() });
    });

    test('vendor can edit addon @pro @v', async () => {
        await vendor.editAddon({ ...data.vendor.addon, name: addonName, titleRequired: addonFieldTitle });
    });

    test('vendor can delete addon @pro @v', async () => {
        const [, addonName] = await createVendorProductAddon();
        await vendor.deleteAddon({ ...data.vendor.addon, name: addonName });
    });
});
