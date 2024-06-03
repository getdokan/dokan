import { test, Page } from '@playwright/test';
import { ColorsPage } from '@pages/colorsPage';
import { data } from '@utils/testData';

test.describe('Color scheme customizer test', () => {
    let admin: ColorsPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ColorsPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can switch predefined color palette', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addColorPalette(data.dokanSettings.colors.predefinedPalette.tree, data.dokanSettings.colors.paletteValues.tree, 'predefined');
    });

    test('admin can add custom color palette', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addColorPalette('custom', data.dokanSettings.colors.paletteValues.custom, 'custom');
    });

    test('admin can update custom color palette', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addColorPalette('custom', data.dokanSettings.colors.paletteValues.custom2, 'custom');
    });
});
