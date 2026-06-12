import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// Vendors this spec seeds via REST (apiUtils.createStore) so the admin
// vendor-single detail view is deterministic. This is an ADMIN-only spec: every
// vendor/customer precondition is created programmatically, never by driving the
// vendor UI. Names are namespaced "AVS …" so this spec never collides with the
// other admin specs (e.g. adminVendors "AV …") running in parallel.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Vendor single).
export const adminVendorSingleData = {
    // The page subject — a fully-configured vendor (featured, enabled, trusted,
    // payment/social/address/categories, fixed commission) with a published
    // product and a completed order.
    primary: { storeName: 'AVS Detail Store', userLogin: 'avs_detail_vendor', email: 'avs_detail_vendor@example.test' },
    // A fresh vendor with no products/orders/payment/social/address — drives the
    // empty-state, '--' fallback and "No Top Selling Products" edges.
    empty: { storeName: 'AVS Empty Store', userLogin: 'avs_empty_vendor', email: 'avs_empty_vendor@example.test' },
    // A buyer account so the completed order credits a real customer.
    customerEmail: 'avs_buyer@example.test',
    customerLogin: 'avs_buyer',
} as const;

// ============================================
// SELECTORS — verified against
// src/admin/dashboard/pages/vendors-single/ (index.tsx + tab components) and
// the Pro fills in dokan-pro/src/admin/dashboard/. The vendor-single page is a
// React view mounted on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/vendors/:id (HashRouter).
// ============================================
export const adminVendorSingleSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // The Pro app paints the .pui-root shell inside the React root.
    puiRoot: '#dokan-admin-dashboard .pui-root',
    // index.tsx renders SkeletonLoader while (!vendor || isLoading); we treat a
    // visible HeaderNavigation heading as "content painted, not stuck skeleton".
    profileHeading: 'h2:has-text("Vendor Profile")',
    // HeaderNavigation.tsx — ChevronLeft + "Vendors List" back button.
    backToListBtn: 'button:has-text("Vendors List")',
    // InfoCard.tsx labels (h4 text).
    registeredSinceLabel: 'text=/Registered Since:/i',
    contactLabel: 'text=/Contact:/i',
    commissionTypeLabel: 'text=/Commission Type:/i',
    paymentMethodLabel: 'text=/Payment Method:/i',
    socialLinksLabel: 'text=/Social Links:/i',
    noPaymentFallback: 'text=/No Payment Method Added/i',
    noSocialFallback: 'text=/No Social Links Added/i',
    // OverviewTab.tsx — SectionHeading title (note: singular "Top Selling Product").
    topSellingHeading: 'text=/Top Selling Product/i',
    noTopProducts: 'text=/No Top Selling Products/i',
    // ProductCard.tsx — the "Sold" pill.
    productSoldBadge: 'text=/^Sold$/',
    // GeneralTab.tsx — "Profile & Address" pill.
    profileAddressPill: 'text=/Profile & Address/i',
    // WithdrawTab.tsx — Connected / Not Connected badges + no-method alerts.
    connectedBadge: 'text=/^Connected$/',
    notConnectedBadge: 'text=/Not Connected/i',
    noConnectedMethods: 'text=/No connected payment methods found/i',
    noDisconnectedMethods: 'text=/No disconnected payment methods found/i',
    // Pro SendEmail.tsx — data-testid on the trigger button.
    sendEmailBtn: '[data-testid="send-email-btn"]',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Vendor single detail (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors/:id
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// withdraw/send-email FormModal). A spec NEVER calls page.locator directly — it
// goes through this object.
// ============================================
export class AdminVendorSinglePage {
    readonly page: Page;
    readonly listUrl = toPath('wp-admin/admin.php?page=dokan-dashboard#/vendors');

    constructor(page: Page) {
        this.page = page;
    }

    /** The detail route for a specific seller id. */
    url(sellerId: string): string {
        return toPath(`wp-admin/admin.php?page=dokan-dashboard#/vendors/${sellerId}`);
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminVendorSingleSelectors.reactRoot).first();
    }
    get puiRoot(): Locator {
        return this.page.locator(adminVendorSingleSelectors.puiRoot).first();
    }
    get profileHeading(): Locator {
        return this.page.locator(adminVendorSingleSelectors.profileHeading).first();
    }
    get backToListButton(): Locator {
        return this.page.locator(adminVendorSingleSelectors.backToListBtn).first();
    }
    get sendEmailButton(): Locator {
        // The Pro Send-Email control has no data-testid in the rendered DOM — it's a
        // plain <button> labelled "Send Email". Target by role+name.
        return this.page.getByRole('button', { name: /Send Email/i }).first();
    }

    /** The Visit Store button (HeaderNavigation, opens shop_url in a new tab). */
    get visitStoreButton(): Locator {
        return this.page.getByRole('button', { name: /Visit Store/i }).first();
    }

    /** An information tab button (Overview / General / Withdraw) by label. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('button', { name }).filter({ hasText: name }).first();
    }

    /** An InfoCard / GeneralTab label/text by string match. */
    text(value: RegExp | string): Locator {
        return this.page.getByText(value).first();
    }

    /** A heading by accessible name (used for store name in the HeaderCard). */
    storeNameText(name: string): Locator {
        return this.page.getByText(new RegExp(escapeRegExp(name), 'i')).first();
    }

    // ---- Navigation / readiness ----
    /** Cold-load the detail route for a seller id and wait for the view to paint. */
    async goto(sellerId: string): Promise<void> {
        await this.page.goto(this.url(sellerId));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForDetailReady();
    }

    /**
     * Ready when the React root is visible AND the HeaderNavigation heading has
     * painted (i.e. we are past the silent SkeletonLoader that index.tsx renders
     * forever while vendor is falsy).
     */
    async waitForDetailReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.profileHeading.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
    }

    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForDetailReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminVendorSingleSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    /** True when the HeaderNavigation profile heading is visible (not stuck on the skeleton). */
    async isDetailRendered(): Promise<boolean> {
        return await this.profileHeading.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** True when the silent skeleton is showing and no real content has painted. */
    async isStuckOnSkeleton(timeoutMs = 8000): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: timeoutMs }).catch(() => false);
        const headingVisible = await this.profileHeading.isVisible({ timeout: timeoutMs }).catch(() => false);
        return rootVisible && !headingVisible;
    }

    /** 'Enabled' | 'Disabled' | '' as shown by the HeaderCard DokanBadge. */
    async headerBadgeState(): Promise<string> {
        const root = this.reactRoot;
        await root.waitFor({ state: 'visible', timeout: 10000 });
        if (
            await this.page
                .getByText(/^Enabled$/)
                .first()
                .isVisible({ timeout: 5000 })
                .catch(() => false)
        ) {
            return 'Enabled';
        }
        if (
            await this.page
                .getByText(/^Disabled$/)
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false)
        ) {
            return 'Disabled';
        }
        return '';
    }

    async isVisible(selector: string, timeoutMs = 5000): Promise<boolean> {
        return await this.page
            .locator(selector)
            .first()
            .isVisible({ timeout: timeoutMs })
            .catch(() => false);
    }

    async textVisible(value: RegExp | string, timeoutMs = 5000): Promise<boolean> {
        return await this.page
            .getByText(value)
            .first()
            .isVisible({ timeout: timeoutMs })
            .catch(() => false);
    }

    async countOf(selector: string): Promise<number> {
        return await this.page.locator(selector).count();
    }

    // ---- Tabs ----
    /** Switch to an information tab by label and wait for its content to settle. */
    async switchTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(600); // tab content swap.
    }

    /** Ordered list of the information-tab button labels (Overview / General / Withdraw …). */
    async tabLabels(): Promise<string[]> {
        // Tab buttons live in the TabSections nav; read every button whose text
        // is one of the known tab titles, preserving DOM order.
        const known = ['Overview', 'General', 'Withdraw'];
        const labels: string[] = [];
        for (const name of known) {
            const loc = this.page.getByRole('button', { name: new RegExp(`^${escapeRegExp(name)}$`) });
            if ((await loc.count()) > 0) {
                labels.push(name);
            }
        }
        return labels;
    }

    /**
     * True when the active tab carries the active purple style. TabSections sets
     * '!border-[#7047EB] text-[#7047EB]' on the active button (className contains
     * 'text-[#7047EB]').
     */
    async isTabActive(name: RegExp): Promise<boolean> {
        const tab = this.tab(name);
        const cls = (await tab.getAttribute('class').catch(() => '')) || '';
        return /text-\[#7047EB\]/.test(cls);
    }

    // ---- Withdraw tab ----
    /** Switch to Withdraw and wait for the dokan/v1/settings fetch to resolve (skeleton -> rows). */
    async openWithdrawTab(): Promise<void> {
        await this.switchTab(/^Withdraw$/);
        // WithdrawTab GETs dokan/v1/settings then drops the skeleton; the
        // Connected badge is part of the resolved card.
        await this.page
            .locator(adminVendorSingleSelectors.connectedBadge)
            .first()
            .waitFor({ state: 'visible', timeout: 15000 })
            .catch(() => undefined);
    }

    // ---- Pro: Send Email ----
    /** Open the Pro SendEmail modal (data-testid="send-email-btn"). */
    async openSendEmailModal(): Promise<void> {
        await this.sendEmailButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.sendEmailButton.click();
        await this.page
            .getByRole('dialog')
            .first()
            .waitFor({ state: 'visible', timeout: 10000 })
            .catch(() => undefined);
    }

    /** Fill + send an email in the open SendEmail modal; returns when the POST settles. */
    async sendEmail(subject: string, body: string): Promise<void> {
        await this.page.locator('#subject').first().fill(subject);
        await this.page.locator('#body').first().fill(body);
        const sendBtn = this.page.getByRole('button', { name: /^Send$/ }).first();
        await sendBtn.waitFor({ state: 'visible', timeout: 10000 });
        await sendBtn.click();
        await this.page.waitForTimeout(1500); // POST /dokan/v1/stores/:id/email + toast.
    }

    // ---- Navigation actions ----
    /** Click the "Vendors List" back link; resolves on the #/vendors list route. */
    async backToList(): Promise<void> {
        await this.backToListButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.backToListButton.click();
        await this.page.waitForURL(/#\/vendors(\?|$)/, { timeout: 15000 }).catch(() => undefined);
    }

    /** Click the Pen (edit) icon button; resolves on the #/vendors/edit/:id route. */
    async clickEditPen(): Promise<void> {
        // HeaderNavigation renders two tertiary DokanButtons; the second (Pen)
        // has no text. Target the icon-only button next to "Visit Store".
        const penBtn = this.page
            .getByRole('button')
            .filter({ has: this.page.locator('svg.lucide-pen, svg.lucide-pencil') })
            .first();
        await penBtn.waitFor({ state: 'visible', timeout: 10000 });
        await penBtn.click();
        await this.page.waitForURL(/#\/vendors\/edit\/\d+/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin vendor-single UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.profileHeading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
