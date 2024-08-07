import { Page } from '@playwright/test';
import { WpPage } from '@pages/wpPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { installWp } from '@utils/interfaces';

export class LocalSetupPage extends WpPage {
    constructor(page: Page) {
        super(page);
    }

    //  local site setup

    // setup wordpress
    async setupWp(siteData: installWp) {
        await this.goto(data.subUrls.backend.setupWP);
        const alreadyInstalledIsVisible = await this.isVisible(selector.backend.alreadyInstalled);
        if (alreadyInstalledIsVisible) {
            return;
        }
        await this.clickAndWaitForLoadState(selector.backend.languageContinue);
        const letsGoIsVisible = await this.isVisible(selector.backend.letsGo);

        if (letsGoIsVisible) {
            await this.clickAndWaitForLoadState(selector.backend.letsGo);
            await this.fill(selector.backend.dbName, siteData.dbInfo.dbName);
            await this.fill(selector.backend.dbUserName, siteData.dbInfo.dbUserName);
            await this.fill(selector.backend.dbPassword, siteData.dbInfo.dbPassword);
            await this.fill(selector.backend.dbHost, siteData.dbInfo.dbHost);
            await this.fill(selector.backend.dbTablePrefix, siteData.dbInfo.dbTablePrefix);
            await this.clickAndWaitForLoadState(selector.backend.submit);
            await this.clickAndWaitForLoadState(selector.backend.runTheInstallation);
        } else {
            await this.fill(selector.backend.siteTitle, siteData.siteInfo.title);
            await this.fill(selector.backend.adminUserName, siteData.siteInfo.admin);
            await this.fill(selector.backend.adminPassword, siteData.siteInfo.password);
            await this.fill(selector.backend.adminEmail, siteData.siteInfo.email);
            await this.clickAndWaitForLoadState(selector.backend.installWp);
            await this.clickAndWaitForLoadState(selector.backend.successLoginIn);
        }
    }
}
