import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// SELECTORS — verified against the live Dokan 5.0.0 React render.
// Surfaces:
//   /dashboard/new/#/withdraw          → balance summary + payment widgets
//                                        (src/dashboard/withdraw/Balance.tsx)
//   /dashboard/new/#/withdraw-requests → DataViews list with status tabs
//                                        (src/dashboard/withdraw/WithdrawRequests.tsx)
// The "Request Withdraw" button opens a DokanModal (RequestWithdrawBtn.tsx). Its
// amount field is a DokanPriceInput labelled "Withdraw amount" — the underlying
// MaskedInput renders the real <input> with id="withdraw-amount" (verified in
// PriceInput.tsx + the dokan-ui bundle: `id: props.input?.id ?? r`), so both
// `#withdraw-amount` and a label-based locator resolve. The modal form ONLY
// renders when the vendor has at least one payment method configured (the spec
// seeds PayPal via REST in beforeAll); otherwise a "No payment methods found"
// warning replaces the form. Submit button reads "Submit request".
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 (folders never import each other).
// ============================================
export const newWithdrawSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',

    // ---- Balance summary (/withdraw) ----
    balanceHeading: 'text=/^Balance$/',
    yourBalance: 'text=/Your Balance:/i',
    minimumWithdraw: 'text=/Minimum Withdraw Amount:/i',
    requestWithdrawButton: 'button:has-text("Request Withdraw")',
    viewPaymentsButton: 'button:has-text("View Payments")',
    editScheduleButton: 'button:has-text("Edit schedule")',
    // Generic widget marker used to assert the summary mounted.
    balanceWidgetText: 'text=/balance|minimum withdraw/i',

    // ---- Withdraw requests DataViews (/withdraw-requests) ----
    backButton: 'button:has-text("Back")',
    tabPending: 'button:has-text("Pending Requests")',
    tabApproved: 'button:has-text("Approved Requests")',
    tabCancelled: 'button:has-text("Cancelled Requests")',
    // DataViews table (same unified component used by orders / reverse-withdrawal).
    dataViewsTable: 'table.dataviews-view-table, table',
    dataRow: 'table.dataviews-view-table tbody tr, table tbody tr',
    addFilterButton: 'button:has-text("Add Filter")',
    resetButton: 'button:has-text("Reset")',
    // The Add Filter / Reset controls live in a panel that DataViews keeps hidden
    // until the funnel icon button (title="Filter") toggles it open. Same pattern
    // as the reverse-withdrawal DataViews surface.
    filterIconButton: 'button[title="Filter"]',
    // Per-row 3-dot actions button (scoped to tbody — the toolbar also has one).
    rowActionsBtn: "//tbody//tr//button[@aria-label='Actions']",
    actionMenuItem: (label: string) => `//*[@role='menuitem'][normalize-space()='${label}']`,
    emptyState: 'text=/no data found|no items|no requests|nothing to show/i',

    // ---- Request Withdraw modal (DokanModal) ----
    modalTitle: 'text=/Send Withdraw Request/i',
    // MaskedInput inside the "Withdraw amount" field renders the real input with
    // id="withdraw-amount"; matching by id OR name keeps it resilient to markup.
    amountInput: '#withdraw-amount, input[name="withdraw-amount"]',
    submitRequestButton: 'button:has-text("Submit request")',
    modalCloseButton: 'button:has-text("Close")',
    pendingNotice: 'text=/already have pending withdraw request/i',
    insufficientBalanceNotice: "text=/don't have sufficient balance/i",

    // ---- Confirm dialog for the destructive "Cancel" row action ----
    confirmCancelButton: 'button:has-text("Cancel Withdraw")',

    // ---- Toasts ----
    successToast: 'div[role="status"]',
    createdToast: 'text=/Withdraw request created|Request cancelled successfully/i',

    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

export type WithdrawTab = 'pending' | 'approved' | 'cancelled';

// ============================================
// PAGE OBJECT — new React Withdraw (Dokan 5.0.0+) — Lite feature.
// Covers BOTH the balance summary route and the requests DataViews route.
// ============================================
export class NewWithdrawPage {
    readonly page: Page;
    readonly withdrawUrl = toPath('dashboard/new/#/withdraw');
    readonly requestsUrl = toPath('dashboard/new/#/withdraw-requests');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get yourBalance(): Locator { return this.page.locator(newWithdrawSelectors.yourBalance).first(); }
    get minimumWithdraw(): Locator { return this.page.locator(newWithdrawSelectors.minimumWithdraw).first(); }
    get requestWithdrawButton(): Locator { return this.page.locator(newWithdrawSelectors.requestWithdrawButton).first(); }
    get viewPaymentsButton(): Locator { return this.page.locator(newWithdrawSelectors.viewPaymentsButton).first(); }
    get editScheduleButton(): Locator { return this.page.locator(newWithdrawSelectors.editScheduleButton).first(); }
    get balanceWidget(): Locator { return this.page.locator(newWithdrawSelectors.balanceWidgetText).first(); }

    get tabPending(): Locator { return this.page.locator(newWithdrawSelectors.tabPending).first(); }
    get tabApproved(): Locator { return this.page.locator(newWithdrawSelectors.tabApproved).first(); }
    get tabCancelled(): Locator { return this.page.locator(newWithdrawSelectors.tabCancelled).first(); }
    get backButton(): Locator { return this.page.locator(newWithdrawSelectors.backButton).first(); }
    get addFilterButton(): Locator { return this.page.locator(newWithdrawSelectors.addFilterButton).first(); }
    get resetButton(): Locator { return this.page.locator(newWithdrawSelectors.resetButton).first(); }
    get filterIconButton(): Locator { return this.page.locator(newWithdrawSelectors.filterIconButton).first(); }

    get modalTitle(): Locator { return this.page.locator(newWithdrawSelectors.modalTitle).first(); }
    get amountInput(): Locator { return this.page.locator(newWithdrawSelectors.amountInput).first(); }
    get submitRequestButton(): Locator { return this.page.locator(newWithdrawSelectors.submitRequestButton).first(); }
    get modalCloseButton(): Locator { return this.page.locator(newWithdrawSelectors.modalCloseButton).first(); }
    get pendingNotice(): Locator { return this.page.locator(newWithdrawSelectors.pendingNotice).first(); }
    get insufficientBalanceNotice(): Locator { return this.page.locator(newWithdrawSelectors.insufficientBalanceNotice).first(); }

    // ---- Navigation ----
    async gotoWithdraw(): Promise<void> {
        await this.page.goto(this.withdrawUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForRootReady();
        // Balance card resolves the loader once the balance fetch returns.
        await this.balanceWidget.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
    }

    async gotoRequests(): Promise<void> {
        await this.page.goto(this.requestsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForRootReady();
        await this.waitForListReady();
    }

    async waitForRootReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newWithdrawSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
    }

    /** List is ready when the react root is visible AND (>=1 row OR an empty
     *  state OR the status tabs) is present — poll up to ~15s. */
    async waitForListReady(): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const rows = await this.page.locator(newWithdrawSelectors.dataRow).count();
            if (rows > 0) return;
            const empty = await this.page.locator(newWithdrawSelectors.emptyState).count();
            if (empty > 0) return;
            const tabs = await this.tabPending.isVisible().catch(() => false);
            if (tabs) return;
            await this.page.waitForTimeout(250);
        }
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newWithdrawSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Balance summary reads ----
    async getBalanceText(): Promise<string> {
        await this.yourBalance.waitFor({ state: 'visible', timeout: 15000 });
        // The label and the value live in sibling spans inside one row.
        return (await this.yourBalance.locator('xpath=..').innerText()).trim();
    }

    async getMinimumText(): Promise<string> {
        await this.minimumWithdraw.waitFor({ state: 'visible', timeout: 15000 });
        return (await this.minimumWithdraw.locator('xpath=..').innerText()).trim();
    }

    // ---- DataViews list reads ----
    async getRowCount(): Promise<number> {
        return await this.page.locator(newWithdrawSelectors.dataRow).count();
    }

    /** Click a status tab (Pending/Approved/Cancelled) and wait for the refetch. */
    async selectTab(tab: WithdrawTab): Promise<void> {
        const locator = tab === 'pending' ? this.tabPending : tab === 'approved' ? this.tabApproved : this.tabCancelled;
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        await locator.click();
        // DataViews clears data then refetches; give the request time to settle.
        await this.page.waitForTimeout(1000);
        await this.waitForListReady();
    }

    async tabsAreVisible(): Promise<boolean> {
        const pending = await this.tabPending.isVisible().catch(() => false);
        const approved = await this.tabApproved.isVisible().catch(() => false);
        const cancelled = await this.tabCancelled.isVisible().catch(() => false);
        return pending && approved && cancelled;
    }

    /**
     * Open the filter row. The Add Filter / Reset controls live in a panel that
     * DataViews keeps hidden (display:none) until the funnel icon
     * (button[title="Filter"]) toggles it into view. Idempotent: if Reset is
     * already visible the panel is open, so we don't click the funnel again
     * (which would toggle it back closed). Mirrors new-reverse-withdraw.
     */
    async openFilterPanel(): Promise<void> {
        if (await this.resetButton.isVisible().catch(() => false)) return;
        const funnel = this.filterIconButton;
        if (await funnel.isVisible().catch(() => false)) {
            await funnel.click();
            await this.resetButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        }
    }

    async hasFilterControls(): Promise<boolean> {
        await this.openFilterPanel();
        const addFilter = await this.addFilterButton.isVisible().catch(() => false);
        const reset = await this.resetButton.isVisible().catch(() => false);
        const funnel = await this.filterIconButton.isVisible().catch(() => false);
        // Either the expanded controls are present, or at minimum the funnel
        // affordance that opens them exists on the surface.
        return (addFilter && reset) || funnel;
    }

    // ---- Request Withdraw modal ----
    /** Open the Request Withdraw modal (works from either route). */
    async openRequestModal(): Promise<void> {
        const btn = this.requestWithdrawButton;
        await btn.waitFor({ state: 'visible', timeout: 15000 });
        await btn.click();
        await this.modalTitle.waitFor({ state: 'visible', timeout: 10000 });
    }

    async requestWithdrawButtonVisible(): Promise<boolean> {
        return await this.requestWithdrawButton.isVisible().catch(() => false);
    }

    /** Fill the amount and submit a withdraw request. Waits for the POST to the
     *  withdraw REST endpoint to actually return before resolving.
     *
     *  The amount field is a cleave.js MaskedInput (DokanPriceInput). A bare
     *  Locator.fill() sets the DOM value programmatically but does NOT make
     *  cleave re-run its mask handler / fire the React onChange, so the
     *  component's `withdrawAmount` state stays '' and handleCreateWithdraw
     *  early-returns with a "Withdraw amount is required" toast (no POST ever
     *  fires — the exact failure we saw). Typing character-by-character with
     *  pressSequentially emits real keydown/input events per char so the mask
     *  fires onChange, which (after the 500ms debounce) commits the amount into
     *  React state. Same approach the commission/products price inputs use.
     *  The Withdraw method <SearchableSelect> is auto-preselected on modal open
     *  (useEffect picks the saved default or the first active method — PayPal,
     *  seeded in beforeAll), so no method click is needed. */
    async submitWithdrawRequest(amount: string): Promise<void> {
        await this.amountInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.amountInput.click();
        await this.amountInput.fill('');
        await this.amountInput.pressSequentially(amount, { delay: 80 });
        await this.amountInput.blur();
        // setWithdrawAmount runs only after the 500ms onChange debounce; wait it
        // out (plus the React re-render that enables the Submit button) before
        // clicking, otherwise the click reads a stale empty amount.
        await this.page.waitForTimeout(900);
        const submit = this.submitRequestButton;
        await submit.waitFor({ state: 'visible', timeout: 10000 });
        await submit.scrollIntoViewIfNeeded().catch(() => undefined);
        // Wait for the create POST to actually return (not just be issued) so the
        // request is persisted before the caller navigates to the requests list.
        const [response] = await Promise.all([
            this.page
                .waitForResponse(
                    r => /dokan\/v[0-9]\/withdraw\b/i.test(r.url()) && r.request().method() === 'POST',
                    { timeout: 20000 },
                )
                .catch(() => undefined),
            submit.click(),
        ]);
        // If the POST fired, give DokanModal's 300ms-debounced confirm + the
        // optimistic close a moment; the success toast confirms completion.
        if (response) {
            await this.page.waitForTimeout(500);
        }
        // Success toast or the modal closing both indicate completion.
        await this.page.locator(newWithdrawSelectors.successToast).first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
    }

    /** True if the modal blocks a new request (pending exists OR no balance). */
    async requestIsBlocked(): Promise<boolean> {
        const pending = await this.pendingNotice.isVisible({ timeout: 5000 }).catch(() => false);
        const insufficient = await this.insufficientBalanceNotice.isVisible({ timeout: 1000 }).catch(() => false);
        // When blocked, the "Submit request" button is NOT rendered.
        const submitGone = !(await this.submitRequestButton.isVisible({ timeout: 1000 }).catch(() => false));
        return pending || insufficient || submitGone;
    }

    async closeModal(): Promise<void> {
        if (await this.modalCloseButton.isVisible().catch(() => false)) {
            await this.modalCloseButton.click();
            await this.modalTitle.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
        }
    }

    // ---- Cancel a pending request (row action on the Pending tab) ----
    async cancelFirstPendingRequest(): Promise<void> {
        await this.selectTab('pending');
        const actions = this.page.locator(newWithdrawSelectors.rowActionsBtn);
        await actions.first().waitFor({ state: 'visible', timeout: 15000 });
        await actions.first().click();
        const cancelItem = this.page.locator(newWithdrawSelectors.actionMenuItem('Cancel')).first();
        await cancelItem.waitFor({ state: 'visible', timeout: 8000 });
        await cancelItem.click();
        // Destructive action opens a confirm dialog with "Cancel Withdraw".
        const confirm = this.page.locator(newWithdrawSelectors.confirmCancelButton).first();
        await confirm.waitFor({ state: 'visible', timeout: 8000 });
        await Promise.all([
            this.page.waitForResponse(r => /dokan\/v[0-9]\/withdraw/i.test(r.url()) && (r.request().method() === 'PUT' || r.request().method() === 'POST'), { timeout: 15000 }).catch(() => undefined),
            confirm.click(),
        ]);
        await this.page.waitForTimeout(1000);
        await this.waitForListReady();
    }
}
