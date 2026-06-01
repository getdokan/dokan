import { Page, expect, request, APIRequestContext } from '@utils/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';

const { VENDOR_ID, DB_PREFIX } = process.env;

// The custom Dokan ledger table that `dokan_get_seller_balance()` reads from.
// `dbUtils` joins prefix + table with an underscore, e.g. `wp_dokan_vendor_balance`.
const BALANCE_TABLE = `${DB_PREFIX}_dokan_vendor_balance`;

// A sentinel we tag our seeded debit rows with so the suite can clean up after itself
// without touching real ledger rows created by other tests.
const SEED_NOTE = 'pw-exact-balance-seed';

// SELECTORS ------------------------------------------------------
export const selectors = {
    dashboardRoot: '#dokan-vendor-dashboard-root',
    withdrawWrapper: '.dokan-withdraw-wrapper',
    amountInput: '#withdraw-amount',
    // DokanToaster is mounted with containerClassName="dokan-toaster" (see src/layout/index.tsx).
    toaster: '.dokan-toaster',
    // react-hot-toast renders each toast inside the container with role=status.
    toast: '.dokan-toaster [role="status"]',
};

// TEST DATA ------------------------------------------------------
export const data = {
    // Target fractional balance for each scenario. The cents value (× 100) is exact but the
    // amount is the kind of fractional figure that drifts when summed/rounded as a float.
    // Must stay above the seeded withdraw limit (10) so it clears the minimum-withdraw check.
    targetBalance: 23.45,
};

// API CLIENT (used by spec.beforeAll) ----------------------------
export const api = {
    ctx: null as APIRequestContext | null,
    utils: null as ApiUtils | null,

    async init(): Promise<void> {
        this.ctx = await request.newContext();
        this.utils = new ApiUtils(this.ctx);
    },

    async dispose(): Promise<void> {
        await this.ctx?.dispose();
        this.ctx = null;
        this.utils = null;
    },
};

export class WithdrawExactBalancePage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ---- REST / DB seeding helpers -----------------------------

    /**
     * Make `paypal` an active withdraw method for the vendor. `is_valid_approval_request()`
     * rejects any method that isn't in `dokan_get_seller_active_withdraw_methods()`, which is
     * derived from the vendor's saved paypal/bank/skrill payment details.
     */
    async enablePaypalForVendor(): Promise<void> {
        await dbUtils.updateUserMeta(
            VENDOR_ID as string,
            'dokan_profile_settings',
            { payment: { paypal: { email: 'paypal-vendor@example.com' } } },
            true
        );
    }

    /**
     * Cancel any leftover pending withdraw so a fresh request isn't blocked by the
     * "you already have a pending request" guard. Cancelling also busts the balance cache.
     */
    async clearPendingWithdraws(): Promise<void> {
        const utils = api.utils as ApiUtils;
        let withdrawId = await utils.getWithdrawId(payloads.vendorAuth);
        while (withdrawId) {
            await utils.cancelWithdraw(withdrawId, payloads.vendorAuth);
            withdrawId = await utils.getWithdrawId(payloads.vendorAuth);
        }
    }

    /**
     * Bring the vendor's balance up to `target` by inserting a completed-order earning
     * (debit column) for the shortfall. Dated well in the past (400 days) so it always falls
     * inside the withdraw-threshold window. Topping up the *difference* keeps the balance at
     * `target` even when earlier tests left offsetting approval-credit rows behind.
     */
    async topUpToFractionalBalance(target: number): Promise<void> {
        const current = await this.getVendorBalance();
        const needed = Math.round((target - current) * 100) / 100;
        if (needed < 0.01) {
            return;
        }

        const past = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
        const stamp = past.toISOString().slice(0, 19).replace('T', ' ');
        await dbUtils.dbQuery(
            `INSERT INTO \`${BALANCE_TABLE}\`
                (vendor_id, trn_id, trn_type, perticulars, debit, credit, status, trn_date, balance_date)
             VALUES (?, ?, 'dokan_orders', ?, ?, 0, 'wc-completed', ?, ?)`,
            [VENDOR_ID, 0, SEED_NOTE, needed, stamp, stamp]
        );
    }

    /** Remove only the rows this suite seeded. */
    async cleanupSeed(): Promise<void> {
        await dbUtils.dbQuery(`DELETE FROM \`${BALANCE_TABLE}\` WHERE vendor_id = ? AND perticulars = ?`, [VENDOR_ID, SEED_NOTE]);
    }

    /** Read the vendor's live balance straight from the balance endpoint. */
    async getVendorBalance(): Promise<number> {
        const utils = api.utils as ApiUtils;
        const [, body] = await utils.get(endPoints.getBalanceDetails, { headers: payloads.vendorAuth });
        return Number(body.current_balance);
    }

    /**
     * Vendor requests a withdrawal of EXACTLY their current balance via REST.
     * Asserts the request is accepted (201) and is NOT rejected with the
     * `dokan_withdraw_not_enough_balance` error that float drift used to trigger.
     * Returns the created withdraw id.
     */
    async requestExactBalanceWithdraw(): Promise<string> {
        const utils = api.utils as ApiUtils;
        const balance = await this.getVendorBalance();
        expect(balance, 'seeded balance should be positive').toBeGreaterThan(0);

        const [response, body] = await utils.post(
            endPoints.createWithdraw,
            { data: { amount: String(balance), method: 'paypal', notes: 'exact balance' }, headers: payloads.vendorAuth },
            false
        );

        expect(body?.code, `withdraw of exact balance ${balance} must not be rejected`).not.toBe('dokan_withdraw_not_enough_balance');
        expect(response.ok(), `expected 2xx, got ${response.status()}: ${JSON.stringify(body)}`).toBeTruthy();
        return String(body.id);
    }

    /** Admin approves the withdraw; asserts it isn't falsely rejected for balance. */
    async approveWithdraw(withdrawId: string): Promise<void> {
        const utils = api.utils as ApiUtils;
        const [response, body] = await utils.put(
            endPoints.updateWithdraw(withdrawId),
            { data: { status: 'approved' }, headers: payloads.adminAuth },
            false
        );
        expect(response.ok(), `approval failed: ${JSON.stringify(body)}`).toBeTruthy();
    }

    /** After approving a full-balance withdrawal the offsetting credit row must zero the balance. */
    async expectBalanceCleared(): Promise<void> {
        const balance = await this.getVendorBalance();
        expect(Math.abs(balance), `balance should be ~0 after approval, got ${balance}`).toBeLessThan(0.01);
    }

    // ---- UI helpers --------------------------------------------

    async gotoWithdraw(): Promise<void> {
        await this.page.goto(toPath('dashboard/new/#/withdraw'));
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(selectors.dashboardRoot).waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.page.locator(selectors.withdrawWrapper).first()).toBeVisible({ timeout: 30000 });
    }

    async openRequestModal(): Promise<void> {
        await this.page.getByRole('button', { name: /request withdraw/i }).first().click();
        await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    }

    /**
     * UI counterpart of the regression: enter the full balance and submit. The success
     * toast (not an "insufficient/enough balance" error) confirms the create path accepts it.
     */
    async requestExactBalanceViaUi(): Promise<void> {
        await this.gotoWithdraw();
        const balance = await this.getVendorBalance();
        await this.openRequestModal();

        await this.page.locator(selectors.amountInput).fill(String(balance));
        // DokanPriceInput debounces the change (500ms) before the charge recalculates.
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('button', { name: /submit request/i }).click();

        const toast = this.page.locator(selectors.toaster);
        await expect(toast).toContainText(/withdraw request created/i, { timeout: 15000 });
        await expect(toast).not.toContainText(/enough balance|sufficient balance/i);
    }

    /**
     * Regression for the toaster z-index fix: on the withdraw page the toaster must sit above
     * the modal backdrop (the PR raises it to 100001 via `body:has(.dokan-withdraw-wrapper) .dokan-toaster`).
     */
    async expectToasterAboveModalBackdrop(): Promise<void> {
        await this.gotoWithdraw();
        await this.page.locator(selectors.toaster).waitFor({ state: 'attached', timeout: 15000 });

        const toasterZ = await this.page
            .locator(selectors.toaster)
            .evaluate((el) => Number(window.getComputedStyle(el).zIndex));

        expect(toasterZ, 'toaster must be raised above the modal backdrop').toBeGreaterThanOrEqual(100001);
    }

    /**
     * The actual user-facing scenario from the PR: an error toast raised while the modal is
     * open must remain visible above the dimming backdrop. We provoke a deterministic
     * validation error — submitting with an empty amount toasts "Withdraw amount is required"
     * while the form (and submit button) are still visible — and assert the toast renders on top.
     */
    async expectRejectionToastVisibleOverModal(): Promise<void> {
        await this.gotoWithdraw();
        await this.openRequestModal();

        // Leave the amount empty and submit to trigger the in-modal validation toast.
        await this.page.getByRole('button', { name: /submit request/i }).click();

        const toast = this.page.locator(selectors.toast).first();
        await expect(toast).toBeVisible({ timeout: 15000 });
        await expect(this.page.locator(selectors.toaster)).toContainText(/amount is required/i);
        // A visible toast whose nearest positioned container is the raised `.dokan-toaster`
        // confirms it isn't trapped beneath the backdrop.
        const onTop = await toast.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            return !!topEl && (el === topEl || el.contains(topEl) || topEl.closest('.dokan-toaster') !== null);
        });
        expect(onTop, 'rejection toast should not be covered by the modal backdrop').toBeTruthy();
    }
}
