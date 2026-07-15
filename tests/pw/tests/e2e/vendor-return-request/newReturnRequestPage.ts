import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, ROW_ACTIONS_BTN, PHP_FATAL, DATA_ROW_ANY, DATA_ROW_SETTLED, SKELETON_ANY, actionMenuItem as dvActionMenuItem, statusTab as dvStatusTab, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal, parseTabCount } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React Return Request (RMA) surface (Dokan Pro).
// Surfaces:
//   /dashboard/new/#/return-request       → DataViews list (no search box)
//                                           (dokan-pro/modules/rma/src/js/vendor-dashboard/
//                                            components/RequestsList.tsx)
//   /dashboard/new/#/return-request/:id    → Order + Status + Conversations cards
//                                           (.../components/Request/SingleDetails.tsx)
// Tabs come from statuses-filter: "All" + only non-zero statuses ("New (1)", …).
// The Details cell renders "#<id>" as a clickable <span role="button">. Row actions:
// View / Delete (destructive DokanModal). Status change is a "Change Status" select +
// Update. Refund/Coupon are DokanModals with masked DokanPriceInput amount fields.
// Data lives in custom tables (wp_dokan_rma_*), cache-invalidated only via the module
// actions → seed/mutate via REST, never raw SQL. Behavioral oracles REST-gate mutations.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 (shared DataViews primitives from @utils/dataViews).
// ============================================
export const newReturnRequestSelectors = {
    reactRoot: REACT_ROOT,

    // ---- List ----
    wrapper: '.dokan-rma-wrapper',
    listContainer: '#dokan-rma-requests-data-view',
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    tab: dvStatusTab,
    tabAll: dvStatusTab('All'),
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    deleteConfirmButton: 'button:has-text("Yes, Continue"), button:has-text("Continue"), [data-slot="alert-dialog-action"]',
    emptyState: 'text=/no data found/i',
    successToast: 'div[role="status"]',

    // ---- Details ----
    singleWrapper: '.dokan-rma-single-request',
    orderCardTitle: 'text=/^Details$/',
    statusCardTitle: 'text=/^Status$/',
    conversationsCardTitle: 'text=/^Conversations$/',
    changeStatusSelect: 'text=/Change Status/i',
    updateStatusButton: 'button:has-text("Update")',
    messageTextarea: 'textarea[placeholder="Type your message here"]',
    sendMessageButton: 'button:has-text("Send Message")',
    conversationItem: 'ul li',
    notFoundHeading: 'text=/Return Request Not Available/i',
    returnToListButton: 'button:has-text("Return to List"), a:has-text("Return to List")',

    // ---- Refund modal ----
    sendRefundButton: 'button:has-text("Send Refund")',
    refundTotalInput: '#refund_total, input[name="refund_total"]',
    pendingRefundAlert: 'text=/Already send refund request|Wait for admin approval/i',

    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    listRest: /dokan\/v[0-9]+\/rma\/warranty-requests\b/i,
    conversationsRest: /dokan\/v[0-9]+\/rma\/warranty-requests\/\d+\/conversations/i,
    refundRest: /dokan\/v[0-9]+\/rma\/warranty-requests\/\d+\/send-refund/i,
} as const;

export type RmaStatus = 'new' | 'processing' | 'completed' | 'rejected';

// ============================================
// PAGE OBJECT — new React vendor Return Request (RMA) — Pro.
// ============================================
export class NewReturnRequestPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/return-request');
    detailUrl(id: string | number): string {
        return toPath(`dashboard/new/#/return-request/${id}`);
    }

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get allTab(): Locator {
        return this.page.locator(newReturnRequestSelectors.tabAll).first();
    }
    tab(label: string): Locator {
        return this.page.locator(newReturnRequestSelectors.tab(label)).first();
    }
    get settledRows(): Locator {
        return this.page.locator(newReturnRequestSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newReturnRequestSelectors.skeleton);
    }
    get columnHeaders(): Locator {
        return this.page.locator(newReturnRequestSelectors.columnHeader);
    }
    get messageTextarea(): Locator {
        return this.page.locator(newReturnRequestSelectors.messageTextarea).first();
    }
    get sendMessageButton(): Locator {
        return this.page.locator(newReturnRequestSelectors.sendMessageButton).first();
    }
    get updateStatusButton(): Locator {
        return this.page.locator(newReturnRequestSelectors.updateStatusButton).first();
    }
    get notFoundHeading(): Locator {
        return this.page.locator(newReturnRequestSelectors.notFoundHeading).first();
    }
    rowsWithText(text: string): Locator {
        return this.page.locator(newReturnRequestSelectors.dataRow).filter({ hasText: text });
    }

    // ---- Navigation ----
    async gotoList(): Promise<void> {
        await this.page.goto(this.listUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async gotoDetails(id: string | number): Promise<void> {
        await this.page.goto(this.detailUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .locator(newReturnRequestSelectors.emptyState)
                        .first()
                        .isVisible()
                        .catch(() => false)
                )
                    return;
                if (await this.allTab.isVisible().catch(() => false)) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- List reads ----
    async columnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim());
    }

    async getTabCount(label: string): Promise<number> {
        return parseTabCount(
            await this.tab(label)
                .textContent()
                .catch(() => ''),
        );
    }

    async tabVisible(label: string): Promise<boolean> {
        return await this.tab(label)
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    /** Click a status tab (label as rendered, e.g. "Processing"), gate on the refetch. */
    async selectTab(label: string): Promise<void> {
        const tab = this.tab(label);
        await tab.waitFor({ state: 'visible', timeout: 15000 });
        const refetch = this.page.waitForResponse(r => newReturnRequestSelectors.listRest.test(r.url()) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await tab.click();
        await refetch;
        await this.waitForSettle();
    }

    /** Open a request's details by clicking its "#<id>" cell. */
    async openRequest(id: string | number): Promise<void> {
        const cell = this.page.getByRole('button', { name: new RegExp(`^#${id}\\b`) }).first();
        const target = (await cell.isVisible().catch(() => false)) ? cell : this.page.getByText(`#${id}`, { exact: false }).first();
        await Promise.all([this.page.waitForURL(/#\/return-request\/\d+/, { timeout: 15000 }).catch(() => undefined), target.click()]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ---- Details reads ----
    async detailHasText(text: string): Promise<boolean> {
        const root = this.page.locator(newReturnRequestSelectors.singleWrapper).first();
        await root.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
        const start = Date.now();
        while (Date.now() - start < 12000) {
            const body = await root.innerText().catch(() => '');
            if (body.includes(text)) return true;
            await this.page.waitForTimeout(300);
        }
        return false;
    }

    async waitForDetailReady(): Promise<void> {
        await this.page.locator(newReturnRequestSelectors.singleWrapper).first().waitFor({ state: 'visible', timeout: 20000 });
    }

    // ---- Details actions ----
    async sendMessage(message: string): Promise<void> {
        await this.messageTextarea.waitFor({ state: 'visible', timeout: 15000 });
        await this.messageTextarea.fill(message);
        await Promise.all([this.page.waitForResponse(r => newReturnRequestSelectors.conversationsRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), this.sendMessageButton.click()]);
        await this.page.waitForTimeout(800);
    }

    /** Change status via the "Change Status" select + Update; gate on the PUT. */
    async updateStatus(label: string): Promise<void> {
        await this.waitForDetailReady();
        const select = this.page.locator(newReturnRequestSelectors.changeStatusSelect).first();
        await select.click();
        const option = this.page
            .locator('.react-select__option, [role="option"], option')
            .filter({ hasText: new RegExp(`^${label}$`, 'i') })
            .first();
        if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
            await option.click();
        } else {
            // Native <select> fallback.
            await this.page
                .locator('select')
                .filter({ has: this.page.locator(`option:has-text("${label}")`) })
                .first()
                .selectOption({ label })
                .catch(() => undefined);
        }
        await Promise.all([this.page.waitForResponse(r => newReturnRequestSelectors.listRest.test(r.url()) && (r.request().method() === 'PUT' || r.request().method() === 'POST'), { timeout: 20000 }).catch(() => undefined), this.updateStatusButton.click()]);
        await this.page.waitForTimeout(800);
    }

    /** Open the Send Refund modal, fill the (masked) amount, and submit; gate on the POST. */
    async sendRefund(amount: string): Promise<void> {
        const trigger = this.page.locator(newReturnRequestSelectors.sendRefundButton).first();
        await trigger.waitFor({ state: 'visible', timeout: 15000 });
        await trigger.click();
        const amountInput = this.page.locator(newReturnRequestSelectors.refundTotalInput).first();
        await amountInput.waitFor({ state: 'visible', timeout: 10000 });
        await amountInput.click();
        await amountInput.fill('');
        await amountInput.pressSequentially(amount, { delay: 80 });
        await this.page.waitForTimeout(900);
        // The modal's own "Send Refund" is the last such button (the card one opened it).
        const submit = this.page.locator(newReturnRequestSelectors.sendRefundButton).last();
        await Promise.all([this.page.waitForResponse(r => newReturnRequestSelectors.refundRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), submit.click()]);
        await this.page.waitForTimeout(800);
    }

    async pendingRefundAlertVisible(): Promise<boolean> {
        return await this.page
            .locator(newReturnRequestSelectors.pendingRefundAlert)
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    // ---- Row delete ----
    async deleteRequest(marker: string): Promise<void> {
        const row = this.rowsWithText(marker).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const del = this.page.locator(newReturnRequestSelectors.actionMenuItem('Delete')).first();
        await del.waitFor({ state: 'visible', timeout: 8000 });
        await del.click();
        // TWO-LAYER confirm: (1) plugin-ui destructive alertdialog ("Are you sure?
        // This action cannot be undone." — Cancel / Delete), then (2) the module's
        // own DokanModal ("Delete <Type> Request … Are you sure you want to
        // continue?" — Cancel / "Yes, Delete") which fires the actual DELETE.
        const alert = this.page.getByRole('alertdialog').first();
        await alert.waitFor({ state: 'visible', timeout: 8000 });
        await alert.getByRole('button', { name: 'Delete', exact: true }).first().click();
        const yesDelete = this.page.getByRole('button', { name: /^Yes,\s*Delete$/i }).first();
        await yesDelete.waitFor({ state: 'visible', timeout: 8000 });
        await Promise.all([this.page.waitForResponse(r => newReturnRequestSelectors.listRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 20000 }).catch(() => undefined), yesDelete.click()]);
        await this.page.waitForTimeout(1000);
        await this.waitForSettle();
    }
}
