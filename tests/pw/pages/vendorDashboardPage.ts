import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

// selectors
const vendorDashboard = selector.vendor.vDashboard;

export class VendorDashboardPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor dashboard

    // vendor dashboard render properly
    async vendorDashboardRenderProperly(link?: string) {
        if (link) {
            await this.goto(link);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
        }

        // at a glance elements are visible
        await this.multipleElementVisible(vendorDashboard.atAGlance);

        // graph elements are visible
        await this.multipleElementVisible(vendorDashboard.graph);

        // orders elements are visible
        await this.multipleElementVisible(vendorDashboard.orders);

        // products elements are visible
        await this.multipleElementVisible(vendorDashboard.products);

        if (DOKAN_PRO) {
            // profile progress elements are visible
            await this.multipleElementVisible(vendorDashboard.profileProgress);

            // reviews elements are visible
            await this.multipleElementVisible(vendorDashboard.reviews);

            // announcement elements are visible
            await this.multipleElementVisible(vendorDashboard.announcement);
        }
    }

    // vendor dashboard menus render properly
    async vendorDashboardMenusRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);

        await this.toBeVisible(vendorDashboard.menus.menus);

        // menus elements are visible
        if (DOKAN_PRO) {
            const { inbox, subscription, wepos, ...menus } = vendorDashboard.menus.primary;
            await this.multipleElementVisible(menus);
        } else {
            await this.toBeVisible(vendorDashboard.menus.primary.dashboard);
            await this.toBeVisible(vendorDashboard.menus.primary.products);
            await this.toBeVisible(vendorDashboard.menus.primary.orders);
            await this.toBeVisible(vendorDashboard.menus.primary.withdraw);
            await this.toBeVisible(vendorDashboard.menus.primary.reverseWithdrawal);
            await this.toBeVisible(vendorDashboard.menus.primary.settings);
            await this.toBeVisible(vendorDashboard.menus.primary.visitStore);
            await this.toBeVisible(vendorDashboard.menus.primary.editAccount);
        }
    }
}
