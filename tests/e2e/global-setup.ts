// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { BasePage } from "./pages/basePage";
import { data } from './utils/testData';
import { selector } from './pages/selectors';

async function globalSetup(config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://dokan1.test/wp-admin');

    await page.fill(selector.backend.email, 'admin')
    await page.fill(selector.backend.password, '01dokan01')
    await page.click(selector.backend.login)
    // Save signed-in state to 'storageState.json'.
    await page.context().storageState({ path: 'storageState.json' });
    await browser.close();
}

export default globalSetup;