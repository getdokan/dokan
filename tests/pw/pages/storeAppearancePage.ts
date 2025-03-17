import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

// selectors
const singleStoreCustomer = selector.customer.cSingleStore;

export class StoreAppearancePage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async gotoSingleStore(storeName: string): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), { waitUntil: 'networkidle' }, true);
    }

    // view store map on store sidebar
    async viewStoreMapOnStoreSidebar(status: 'enable' | 'disable', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        if (status === 'enable') {
            await this.toBeVisible(singleStoreCustomer.storeMap.storeMap);
        } else {
            await this.notToBeVisible(singleStoreCustomer.storeMap.storeMap);
        }
    }

    // view map api source
    async viewMapAPISource(api: 'Google Maps' | 'Mapbox', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        if (api === 'Google Maps') {
            await this.multipleElementVisible([singleStoreCustomer.storeMap.storeMap, singleStoreCustomer.storeMap.googleMap]);
        } else {
            await this.multipleElementVisible([singleStoreCustomer.storeMap.storeMap, singleStoreCustomer.storeMap.mapbox]);
        }
    }

    // set Google reCAPTCHA
    async viewGoogleRecaptcha(status: 'enable' | 'disable', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        if (status === 'enable') {
            await this.toBeVisible(singleStoreCustomer.googleRecaptcha);
        } else {
            await this.notToBeVisible(singleStoreCustomer.googleRecaptcha);
        }
    }

    // view store contact form on store sidebar
    async viewStoreContactFormOnStoreSidebar(status: 'enable' | 'disable', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        if (status === 'enable') {
            await this.toBeVisible(singleStoreCustomer.storeContactForm.storeContactForm);
        } else {
            await this.notToBeVisible(singleStoreCustomer.storeContactForm.storeContactForm);
        }
    }

    // view store header template
    async viewStoreHeaderTemplate(template: 'default' | 'layout1' | 'layout2' | 'layout3', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        await this.toHaveClass(singleStoreCustomer.storeProfile.storeProfileInfoBox, `profile-info-box profile-layout-${template}`);
    }

    // view store open-close time on store sidebar
    async viewStoreOpenCloseTimeOnStoreSidebar(status: 'enable' | 'disable', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        if (status === 'enable') {
            await this.toBeVisible(singleStoreCustomer.storeOpenCloseTime);
        } else {
            await this.notToBeVisible(singleStoreCustomer.storeOpenCloseTime);
        }
    }

    // set banner size
    async setBannerSize(bannerSize: { width: string; height: string }): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        await this.toContainText(selector.vendor.vStoreSettings.bannerHelpText, `${bannerSize.width}x${bannerSize.height}`);
        //todo: add more assertion
    }

    // view store sidebar from theme
    async viewStoreSideBarFromTheme(status: 'enable' | 'disable', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        if (status === 'enable') {
            await this.toBeVisible(singleStoreCustomer.dokanStoreSideBar);
        } else {
            await this.notToBeVisible(singleStoreCustomer.dokanStoreSideBar);
            // todo: add more assertions
        }
    }

    // view vendor info on single store page
    async viewVendorInfoOnSingleStorePage(status: 'enable' | 'disable', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        const vendorInfo = [singleStoreCustomer.storeProfile.storeAddress, singleStoreCustomer.storeProfile.storePhone, singleStoreCustomer.storeProfile.storeEmail];
        if (status === 'enable') {
            await this.multipleElementVisible(vendorInfo);
        } else {
            await this.multipleElementNotVisible(vendorInfo);
        }
    }

    // view Font Awesome library icons on vendor dashboard
    async viewFontAwesomeLibrary(status: 'enable' | 'disable', storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        if (status === 'enable') {
            await this.toExists(singleStoreCustomer.dokanFontAwesomeLibrary);
        } else {
            await this.notToExists(singleStoreCustomer.dokanFontAwesomeLibrary);
        }
    }
}
