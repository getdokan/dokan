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
    let categoryName: string;
    let apiUtils: ApiUtils;

    // create product addon
    async function createVendorProductAddon(): Promise<[string, string, string, string]> {
        const [, categoryId, categoryName] = await apiUtils.createCategory(payloads.createCategoryRandom(), payloads.adminAuth);
        const [, addonId, addonName, addonFieldTitle] = await apiUtils.createProductAddon({ ...payloads.createProductAddons(), restrict_to_categories: [categoryId] }, payloads.adminAuth);
        await dbUtils.updateCell(addonId, VENDOR_ID);
        return [addonId, addonName, addonFieldTitle, categoryName];
    }

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductAddonsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, addonName, addonFieldTitle, categoryName] = await createVendorProductAddon();
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
        await vendor.addAddon({ ...data.vendor.addon(), category: categoryName });
    });

    test('vendor can edit addon @pro @v', async () => {
        await vendor.editAddon({ ...data.vendor.addon(), name: addonName, title: addonFieldTitle });
    });

    test('vendor can delete addon @pro @v', async () => {
        const [, addonName] = await createVendorProductAddon();
        await vendor.deleteAddon({ ...data.vendor.addon(), name: addonName });
    });
});
