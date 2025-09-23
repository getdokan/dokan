import { test, Page, request } from '@playwright/test';
import { ColorsPage } from '@pages/colorsPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';

test.describe('Color scheme customizer test', () => {
    let admin: ColorsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ColorsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.colors, dbData.dokan.colorsSettings);
        await apiUtils.activateModules(payloads.moduleIds.colorSchemeCustomizer, payloads.adminAuth);
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin can enable color scheme customizer module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableColorSchemeCustomizerModule();
    });

    test('admin can switch predefined color palette', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'need to fix');
        await admin.addColorPalette(data.dokanSettings.colors.predefinedPalette.tree, data.dokanSettings.colors.paletteValues.tree, 'predefined');
    });

    test('admin can add custom color palette', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addColorPalette('custom', data.dokanSettings.colors.paletteValues.custom, 'custom');
    });

    test('admin can update custom color palette', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addColorPalette('custom', data.dokanSettings.colors.paletteValues.custom2, 'custom');
    });

    test('admin can disable color scheme customizer module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.colorSchemeCustomizer, payloads.adminAuth);
        await admin.disableColorSchemeCustomizerModule();
    });
});
