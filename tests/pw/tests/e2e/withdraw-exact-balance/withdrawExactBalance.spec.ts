import { Page, test } from '@utils/test';
import { WithdrawExactBalancePage, api, data } from './withdrawExactBalancePage';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// Regression coverage for fix/withdraw-approval-exact-fractional-balance:
//   - Manager::is_valid_approval_request — a withdrawal of EXACTLY the vendor balance must
//     not be rejected by IEEE-754 float drift (compared in integer cents now).
//   - Hooks::update_vendor_balance — approving that withdrawal must insert the offsetting
//     credit row so the balance lands on zero (instead of silently skipping it).
//   - UI: the withdraw-page toaster must sit above the modal backdrop (z-index 100001).
test.describe('Withdraw exact fractional balance functionality', () => {
    let vendor: WithdrawExactBalancePage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        await api.init();
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new WithdrawExactBalancePage(vPage);

        await vendor.enablePaypalForVendor();
    });

    test.beforeEach(async () => {
        // Start each scenario from a clean, known fractional balance with no pending request.
        await vendor.clearPendingWithdraws();
        await vendor.cleanupSeed();
        await vendor.topUpToFractionalBalance(data.targetBalance);
    });

    test.afterAll(async () => {
        // Cancel leftover requests but keep the last seed row so the offsetting approval
        // credit doesn't leave the shared vendor with a negative balance.
        await vendor?.clearPendingWithdraws();
        await vPage?.close();
        await api.dispose();
    });

    test.describe('happy paths', () => {
        test('vendor can request a withdrawal of exactly their balance (REST)', { tag: ['@lite', '@vendor'] }, async () => {
            await vendor.requestExactBalanceWithdraw();
        });

        test('admin approving an exact-balance withdrawal zeroes the vendor balance', { tag: ['@lite', '@admin'] }, async () => {
            const withdrawId = await vendor.requestExactBalanceWithdraw();
            await vendor.approveWithdraw(withdrawId);
            await vendor.expectBalanceCleared();
        });

        test('vendor can submit an exact-balance request through the React UI', { tag: ['@lite', '@vendor'] }, async () => {
            await vendor.requestExactBalanceViaUi();
        });
    });

    test.describe('edge cases', () => {
        test('withdraw-page toaster renders above the modal backdrop', { tag: ['@lite', '@vendor', '@visual'] }, async () => {
            await vendor.expectToasterAboveModalBackdrop();
        });
    });

    test.describe('negative cases', () => {
        test('a rejection toast stays visible above the dimming modal backdrop', { tag: ['@lite', '@vendor'] }, async () => {
            await vendor.expectRejectionToastVisibleOverModal();
        });
    });
});
