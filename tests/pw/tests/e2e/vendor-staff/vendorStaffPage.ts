import { Page, expect } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { data } from '@utils/testData';

// Real utils wired to the spec's import contract (NOT local no-op stubs):
// the spec imports { VendorStaffPage, ApiUtils, data, payloads } from this file.
export { data };
export { payloads } from '@utils/payloads';
export { ApiUtils } from '@utils/apiUtils';

// Shape returned by data.staff() — used by add/edit staff form flows.
type StaffData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
};

// Co-located selectors, inlined from the pre-refactor selectors.ts groups
// (selector.vendor.vStaff and selector.vendor.vDashboard.menus.primary /
// dashboardDiv). These target the legacy PHP vendor-dashboard staff surface.
export const vendorStaffSelectors = {
    // vendor dashboard (menu presence / dashboard wrap)
    dashboardDiv: 'div.dokan-dashboard-wrap',
    // The vendor's `/dashboard/` menu moved to the React sidebar (`.dokan-frontend-sidebar`).
    // The legacy `ul.dokan-dashboard-menu` is still emitted but hidden, and now uses the same
    // `#products` hash hrefs — so menu-visibility checks must be scoped to the visible sidebar.
    // The sidebar honours staff `dokan_view_*_menu` capabilities (denied menus are omitted),
    // so these selectors still validate permission-based menu visibility for a logged-in staff.
    primaryMenus: {
        dashboard: '.dokan-frontend-sidebar a[href*="Overview"]',
        products: '.dokan-frontend-sidebar a[href*="#products"]',
        orders: '.dokan-frontend-sidebar a[href*="#orders"]',
        coupons: '.dokan-frontend-sidebar a[href*="#coupons"]',
        // Legacy selectors retained for the admin-side disable check (element must be absent/hidden).
        reports: 'ul.dokan-dashboard-menu li.reports a',
        reviews: 'ul.dokan-dashboard-menu li.reviews a',
        withdraw: 'ul.dokan-dashboard-menu li.withdraw a',
        staff: 'ul.dokan-dashboard-menu li.staffs a',
        followers: 'ul.dokan-dashboard-menu li.followers a',
    },

    // vendor staff page
    staffText: '.dokan-staffs-content h1',
    table: {
        vendorStaffTable: '.dokan-table.dokan-table-striped.vendor-staff-table',
        nameColumn: '//th[normalize-space()="Name"]',
        emailColumn: '//th[normalize-space()="Email"]',
        phoneColumn: '//th[normalize-space()="Phone"]',
        registeredDateColumn: '//th[normalize-space()="Registered Date"]',
    },
    noRowsFound: '//div[@class ="dokan-error" and normalize-space()="No staff found"]',
    staffCell: (staffName: string) => `//td//a[contains(text(),"${staffName}")]/..`,

    addStaff: {
        addNewStaff: '.dokan-btn',
        firstName: '#first_name',
        lastName: '#last_name',
        email: '#email',
        phone: '#phone',
        createStaff: '.dokan-btn',
        dokanAlert: '.dokan-alert-danger',
        userAlreadyExists: '//strong[normalize-space()="Sorry, that username already exists!"]',
    },

    editStaff: {
        editStaff: (staffName: string) => `//a[contains(text(), "${staffName}")]/..//span[@class="edit"]//a`,
        password: '#reg_password',
        updateStaff: '//input[@name="staff_creation"]',
    },

    deleteStaff: {
        deleteStaff: (staffName: string) => `//a[contains(text(), "${staffName}")]/..//span[@class="delete"]//a`,
        okDelete: '.swal2-confirm',
        cancelDelete: '.swal2-cancel',
        deleteSuccessMessage: '.dokan-alert.dokan-alert-success',
    },

    managePermission: {
        managePermission: (staffName: string) => `//a[contains(text(), "${staffName}")]/..//span[@class="permission"]//a`,
        overview: {
            viewSalesOverview: '#dokan_view_sales_overview',
            viewSalesReportChart: '#dokan_view_sales_report_chart',
            viewAnnouncement: '#dokan_view_announcement',
            viewOrderReport: '#dokan_view_order_report',
            viewReviewReport: '#dokan_view_review_reports',
            viewProductStatusReport: '#dokan_view_product_status_report',
        },
        order: {
            viewOrder: '#dokan_view_order',
            manageOrder: '#dokan_manage_order',
            manageOrderNote: '#dokan_manage_order_note',
            manageRefund: '#dokan_manage_refund',
            exportOrder: '#dokan_export_order',
        },
        review: {
            viewReviews: '#dokan_view_reviews',
            manageReviews: '#dokan_manage_reviews',
        },
        product: {
            addProduct: '#dokan_add_product',
            editProduct: '#dokan_edit_product',
            deleteProduct: '#dokan_delete_product',
            viewProduct: '#dokan_view_product',
            duplicateProduct: '#dokan_duplicate_product',
            importProduct: '#dokan_import_product',
            exportProduct: '#dokan_export_product',
        },
        storeSupport: {
            manageSupportTicket: '#dokan_manage_support_tickets',
        },
        report: {
            viewOverviewReport: '#dokan_view_overview_report',
            viewDailySalesReport: '#dokan_view_daily_sale_report',
            viewTopSellingReport: '#dokan_view_top_selling_report',
            viewTopEarningReport: '#dokan_view_top_earning_report',
            viewStatementReport: '#dokan_view_statement_report',
        },
        coupon: {
            addCoupon: '#dokan_add_coupon',
            editCoupon: '#dokan_edit_coupon',
            deleteCoupon: '#dokan_delete_coupon',
        },
        withdraw: {
            manageWithdraw: '#dokan_manage_withdraw',
        },
        menu: {
            viewOverviewMenu: '#dokan_view_overview_menu',
            viewProductMenu: '#dokan_view_product_menu',
            viewOrderMenu: '#dokan_view_order_menu',
            viewCouponMenu: '#dokan_view_coupon_menu',
            viewReportMenu: '#dokan_view_report_menu',
            viewReviewMenu: '#dokan_view_review_menu',
            viewWithdrawMenu: '#dokan_view_withdraw_menu',
            viewStoreSettingsMenu: '#dokan_view_store_settings_menu',
            viewPaymentSettingsMenu: '#dokan_view_store_payment_menu',
            viewShippingSettingsMenu: '#dokan_view_store_shipping_menu',
            viewSocialSettingsMenu: '#dokan_view_store_social_menu',
            viewSeoSettingsMenu: '#dokan_view_store_seo_menu',
            viewToolsMenu: '#dokan_view_tools_menu',
            viewVerificationSettingsMenu: '#dokan_view_store_verification_menu',
        },
        updateStaffPermission: '.dokan-btn',
    },
} as const;

export class VendorStaffPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- raw-Playwright ports of the pre-refactor base-class helpers ----

    // gotoUntilNetworkidle(u) / goto(u) -> raw page.goto
    private async goToStaffPage(): Promise<void> {
        await this.page.goto(toPath(data.subUrls.frontend.vDashboard.staff), { waitUntil: 'domcontentloaded' });
    }

    private async goToVendorDashboard(): Promise<void> {
        await this.page.goto(toPath(data.subUrls.frontend.vDashboard.dashboard), { waitUntil: 'domcontentloaded' });
    }

    // isVisible(selector) -> boolean; polls up to `timeout` ms like the base helper
    private async isVisible(selector: string, timeout = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    // multipleElementVisible(group) -> assert every string selector visible (recurse
    // into nested objects, skip functions) — mirrors the base helper.
    private async multipleElementVisible(group: Record<string, unknown>): Promise<void> {
        for (const value of Object.values(group)) {
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else {
                await expect(this.page.locator(value as string)).toBeVisible();
            }
        }
    }

    // multipleElementCheck(group) -> check every checkbox and assert checked
    private async multipleElementCheck(group: Record<string, string>): Promise<void> {
        for (const selector of Object.values(group)) {
            const locator = this.page.locator(selector);
            await locator.check();
            await expect(locator).toBeChecked();
        }
    }

    // clickAndWaitForLoadState(selector)
    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    // clickAndWaitForResponse(subUrl, selector, code)
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    // clickAndWaitForResponseAndLoadState(subUrl, selector, code)
    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([this.page.waitForLoadState('load'), this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        expect(response.status()).toBe(code);
    }

    // pressOnLocatorAndWaitForResponseAndLoadState(subUrl, selector, key, code)
    private async pressOnLocatorAndWaitForResponseAndLoadState(subUrl: string, selector: string, key: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.waitForLoadState('domcontentloaded'), this.page.locator(selector).press(key)]);
    }

    // ---- vendor staff ----

    // enable vendor staff module (admin-side verification via vendor dashboard menu)
    async enableVendorStaffModule(): Promise<void> {
        await this.goToVendorDashboard();
        await expect(this.page.locator(vendorStaffSelectors.primaryMenus.staff)).toBeVisible();
    }

    // disable vendor staff module
    async disableVendorStaffModule(): Promise<void> {
        // vendor dashboard menu no longer shows staff
        await this.goToVendorDashboard();
        await expect(this.page.locator(vendorStaffSelectors.primaryMenus.staff)).toBeHidden();

        // vendor dashboard staff page is no longer reachable
        await this.goToStaffPage();
        await expect(this.page.locator(vendorStaffSelectors.dashboardDiv)).toBeHidden();
    }

    // vendor staff page renders properly
    async vendorStaffRenderProperly(): Promise<void> {
        await this.goToStaffPage();

        // staff heading is visible
        await expect(this.page.locator(vendorStaffSelectors.staffText)).toBeVisible();

        // add new staff button is visible
        await expect(this.page.locator(vendorStaffSelectors.addStaff.addNewStaff)).toBeVisible();

        const noStaff = await this.isVisible(vendorStaffSelectors.noRowsFound);
        if (noStaff) {
            await expect(this.page.locator(vendorStaffSelectors.noRowsFound)).toContainText('No staff found');
            console.log('No staff found on staff page');
        } else {
            // vendor staff table elements are visible
            await this.multipleElementVisible(vendorStaffSelectors.table);
        }
    }

    // fill/update staff form fields
    private async updateStaffFields(staff: StaffData): Promise<void> {
        await this.page.locator(vendorStaffSelectors.addStaff.firstName).fill(staff.firstName);
        await this.page.locator(vendorStaffSelectors.addStaff.lastName).fill(staff.lastName);
        await this.page.locator(vendorStaffSelectors.addStaff.email).fill(staff.email);
        await this.page.locator(vendorStaffSelectors.addStaff.phone).fill(staff.phone);
        const isPasswordVisible = await this.isVisible(vendorStaffSelectors.editStaff.password);
        if (isPasswordVisible) {
            await this.page.locator(vendorStaffSelectors.editStaff.password).fill(staff.password);
        }
    }

    // add new staff
    async addStaff(staff: StaffData): Promise<void> {
        await this.goToStaffPage();
        await this.clickAndWaitForLoadState(vendorStaffSelectors.addStaff.addNewStaff);
        await this.updateStaffFields(staff);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.staff, vendorStaffSelectors.addStaff.createStaff);
        const userAlreadyExists = await this.isVisible(vendorStaffSelectors.addStaff.userAlreadyExists);
        if (userAlreadyExists) {
            console.log('Staff already exists!!');
            return;
        }
        await expect(this.page.locator(vendorStaffSelectors.staffCell(staff.firstName + ' ' + staff.lastName))).toBeVisible();
    }

    // edit staff
    async editStaff(staff: StaffData): Promise<void> {
        await this.goToStaffPage();
        const staffName = staff.firstName + ' ' + staff.lastName;
        await this.page.locator(vendorStaffSelectors.staffCell(staffName)).hover();
        await this.clickAndWaitForLoadState(vendorStaffSelectors.editStaff.editStaff(staffName));
        await this.updateStaffFields(staff);
        await this.pressOnLocatorAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.staff, vendorStaffSelectors.editStaff.updateStaff, data.key.enter);
        await expect(this.page.locator(vendorStaffSelectors.staffCell(staffName))).toBeVisible();
    }

    // delete staff
    async deleteStaff(staffName: string): Promise<void> {
        await this.goToStaffPage();
        await this.page.locator(vendorStaffSelectors.staffCell(staffName)).hover();
        await this.page.locator(vendorStaffSelectors.deleteStaff.deleteStaff(staffName)).click();
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.staff, vendorStaffSelectors.deleteStaff.okDelete, 302);
        await expect(this.page.locator(vendorStaffSelectors.deleteStaff.deleteSuccessMessage)).toContainText('Staff deleted successfully');
    }

    // manage staff permission
    async manageStaffPermission(staffName: string): Promise<void> {
        await this.goToStaffPage();
        await this.page.locator(vendorStaffSelectors.staffCell(staffName)).hover();
        await this.clickAndWaitForLoadState(vendorStaffSelectors.managePermission.managePermission(staffName));

        // manage overview permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.overview);
        // manage order permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.order);
        // manage review permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.review);
        // manage product permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.product);
        // manage booking permission
        // await this.multipleElementCheck(vendorStaffSelectors.managePermission.booking); // todo: add booking module + plugin check
        // manage store support permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.storeSupport);
        // manage report permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.report);
        // manage coupon permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.coupon);
        // manage withdraw permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.withdraw);
        // manage menu permission
        await this.multipleElementCheck(vendorStaffSelectors.managePermission.menu);
        // manage auction permission
        // await this.multipleElementCheck(vendorStaffSelectors.managePermission.auction); // todo: add auction module + plugin check
    }

    // ---- staff (logged in as the created staff account) ----

    // Log in the freshly-created staff via the my-account form. The staff has no
    // storage state, so the fresh sPage context must authenticate through the UI
    // before the permitted vendor-dashboard menus can be asserted.
    async frontendLogin(username: string, password: string): Promise<void> {
        await this.page.goto(toPath('my-account'), { waitUntil: 'domcontentloaded' });
        const userField = this.page.locator('#username');
        if (await userField.isVisible().catch(() => false)) {
            await userField.fill(username);
            await this.page.locator('#password').fill(password);
            await this.page
                .locator('#rememberme')
                .check()
                .catch(() => undefined);
            await this.page.locator('//button[@value="Log in"]').click();
            await this.page.waitForLoadState('load');
            await expect
                .poll(
                    async () => {
                        const cookies = await this.page.context().cookies();
                        return cookies.some(c => c.name.startsWith('wordpress_logged_in_'));
                    },
                    { timeout: 15000 },
                )
                .toBe(true);
        }
    }

    // view permitted menus on the vendor dashboard
    async viewPermittedMenus(menus: string[]): Promise<void> {
        await this.goToVendorDashboard();
        const primaryMenus = vendorStaffSelectors.primaryMenus as Record<string, string | undefined>;
        for (const menu of menus) {
            const menuSelector = primaryMenus[menu];
            if (!menuSelector) {
                throw new Error(`Unknown vendor dashboard primary menu: ${menu}`);
            }
            await expect(this.page.locator(menuSelector)).toBeVisible();
        }
    }
}
