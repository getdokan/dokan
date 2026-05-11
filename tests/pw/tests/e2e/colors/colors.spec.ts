import { test, Page } from '@utils/test';
import { ColorsPage, api, db, colorsData, defaultColorsSettings, colorsOptionName, moduleId } from './colorsPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Color scheme customizer test', () => {
    let admin: ColorsPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        await api.init();

        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ColorsPage(aPage);
    });

    test.afterAll(async () => {
        await db.setOptionValue(colorsOptionName, defaultColorsSettings);
        await api.activateModules(moduleId, api.adminAuth());
        await aPage?.close();
        await api.dispose();
    });

    test('admin can enable color scheme customizer module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableColorSchemeCustomizerModule();
    });

    test('admin can switch predefined color palette', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'need to fix');
        await admin.addColorPalette(colorsData.predefinedPalette.tree, colorsData.paletteValues.tree, 'predefined');
    });

    // Skipped: the Colors tab on the admin Settings page no longer renders the
    // "Custom Color Palette" section (`h3` selector removed from the new React UI).
    // Needs a spec rewrite against the current Color Scheme Customizer module UI.
    test.skip('admin can add custom color palette', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addColorPalette('custom', colorsData.paletteValues.custom, 'custom');
    });

    test.skip('admin can update custom color palette', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addColorPalette('custom', colorsData.paletteValues.custom2, 'custom');
    });

    test('admin can disable color scheme customizer module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(moduleId, api.adminAuth());
        await admin.disableColorSchemeCustomizerModule();
    });
});
