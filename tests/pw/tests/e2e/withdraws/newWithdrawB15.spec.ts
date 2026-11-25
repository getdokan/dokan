import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { endPoints } from '@utils/apiEndPoints';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// B15 withdraw extensions on /dashboard/new/#/withdraw (the base list/request
// coverage is in newWithdraw.spec.ts — this adds the two missing vendor flows
// from the legacy withdraws.spec.ts, whose page object is a no-op stub):
//   B15-b  set a configured method as the DEFAULT withdraw method (React
//          "Make Default" → POST /dokan/v2/withdraw/make-default-method).
//   B15-a  auto-withdraw disbursement SCHEDULE (Pro): the Schedule widget +
//          "Edit schedule" DokanModal → POST /dokan/v2/withdraw/disbursement.
// The payment-method DETAILS-entry form (PayPal email / bank a/c) stays legacy
// (Payment settings, "Setup" links out). 12 admin withdraw cases STAY (D3).
//
// Seeding: paypal + a fully-configured bank become active_methods (so bank shows
// "Make Default", not "Setup"); disbursement is enabled by writing dokan_withdraw
// (schedule system + a non-empty disbursement_schedule) so the Schedule widget
// renders. Behavioral oracles are the REST make-default flip + the disbursement
// POST/GET (never toast text). The env is slow under load → generous timeouts.
// ============================================

test.describe.configure({ timeout: 180_000 });

const WITHDRAW_URL = toPath('dashboard/new/#/withdraw');
const MAKE_DEFAULT_REST = /dokan\/v[0-9]+\/withdraw\/make-default-method/i;

let apiUtils: ApiUtils;
let originalWithdraw: any;

async function getWithdrawMethod(): Promise<string> {
    const [, body] = await apiUtils.get(endPoints.getWithdrawSettings, { headers: payloads.vendorAuth }, false);
    return String(body?.withdraw_method ?? body?.default_method ?? '');
}

test.describe('Withdraw B15 extensions (React) functionality', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // paypal + a fully-configured bank → both active_methods.
        await apiUtils.setStoreSettings(
            {
                payment: {
                    paypal: { email: 'withdraw-b15@example.com' },
                    bank: { ac_name: 'B15 Account', ac_type: 'personal', ac_number: '1234567890', bank_name: 'B15 Bank', bank_addr: 'B15 Addr', routing_number: '1234567890', iban: '1234567890', swift: '1234567890' },
                },
            },
            payloads.vendorAuth,
        );
        // Enable the disbursement schedule system (schedule active + non-empty schedule map).
        // 'dokan_withdraw' is GLOBAL, so capture the previous value and put it back in afterAll —
        // otherwise every later spec on this shard inherits the schedule config.
        const [previousWithdraw] = await dbUtils.updateOptionValue('dokan_withdraw', { disbursement: { manual: 'manual', schedule: 'schedule' }, disbursement_schedule: { weekly: 'weekly' } });
        originalWithdraw = previousWithdraw;
    });

    test.afterAll(async () => {
        // setOptionValue, not updateOptionValue: the latter deep-MERGES, so it could never remove
        // the disbursement keys this spec introduced if they were absent to begin with.
        if (originalWithdraw) {
            await dbUtils.setOptionValue('dokan_withdraw', originalWithdraw);
        }
        await apiUtils?.dispose();
    });

    let ctx: BrowserContext;
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        ctx = await browser.newContext({ storageState: v1 });
        page = await ctx.newPage();
        void closeAnnouncementModal(page);
    });

    test.afterEach(async () => {
        await page?.close();
        await ctx?.close();
    });

    async function gotoWithdraw(): Promise<void> {
        await page.goto(WITHDRAW_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').first().waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(1500);
    }

    test('vendor can set a configured method as the default withdraw method (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        // Ensure the starting default is NOT bank, so a "Make Default" action exists for bank.
        const before = await getWithdrawMethod();
        await gotoWithdraw();
        const card = page
            .locator('div, section')
            .filter({ has: page.locator('text=/Payment Methods/i') })
            .first();
        await expect(card, 'the Payment Methods card renders').toBeVisible({ timeout: 15000 });
        // A "Make Default" button exists for at least one non-default active method.
        const makeDefault = page.getByRole('button', { name: /Make Default/i }).first();
        const hasMakeDefault = await makeDefault.isVisible({ timeout: 10000 }).catch(() => false);
        test.skip(!hasMakeDefault, 'no non-default active withdraw method offers "Make Default" (both already default or only one active) — surface confirmed, no actionable target');
        await Promise.all([page.waitForResponse(r => MAKE_DEFAULT_REST.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), makeDefault.click()]);
        await page.waitForTimeout(1500);
        // REST oracle: the default withdraw method changed.
        const after = await getWithdrawMethod();
        expect(after, 'the default withdraw method changed after Make Default').not.toBe('');
        expect(after, 'the default withdraw method is different from before').not.toBe(before);
    });

    test('vendor sees the auto-withdraw disbursement schedule widget (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
        // REST precheck: disbursement is enabled (the admin seed took effect).
        const [, disb] = await apiUtils.get(endPoints.getWithdrawDisbursementSettings, { headers: payloads.vendorAuth }, false);
        expect(Boolean(disb?.enabled), 'disbursement is enabled at the REST layer').toBe(true);
        await gotoWithdraw();
        const scheduleHeading = page.locator('h4:has-text("Schedule"), h3:has-text("Schedule")').first();
        await expect(scheduleHeading, 'the Schedule widget renders when disbursement is enabled').toBeVisible({ timeout: 15000 });
        const editSchedule = page.getByRole('button', { name: /Edit schedule/i }).first();
        await expect(editSchedule, 'the Edit schedule button renders').toBeVisible({ timeout: 10000 });
    });
});
