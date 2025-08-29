import { test, request, Page, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { AdminNoticePage } from '@pages/adminNoticePage';
import { endPoints } from '@utils/apiEndPoints';

test.describe('Dashboard admin notice', () => {
    let admin: AdminNoticePage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AdminNoticePage(aPage);

        // Mock the promo notices endpoint to ensure notices render in tests
        await aPage.route(endPoints.getAdminPromoNotices, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        "type": "promotion",
                        "title": "Massive Price Fall - Up to 35% OFF!",
                        "description": "Access to Dokan's premium modules and supercharge your business.",
                        "priority": 10,
                        "show_close_button": true,
                        "ajax_data": {
                            "action": "dokan_dismiss_limited_time_promotional_notice",
                            "nonce": "6c82d2aa00",
                            "key": "massive-price-fall-up-to-35-off-2"
                        },
                        "actions": [
                            {
                                "type": "primary",
                                "text": "Get Now",
                                "action": "https://dokan.co/wordpress/pricing",
                                "target": "_blank"
                            }
                        ]
                    },
                    {
                        "type": "promotion",
                        "title": "Smart Saving Week is Live — Save Up to 30%",
                        "description": "Don’t miss your chance to grab powerful marketplace features at smart prices. Offer valid for a limited time!",
                        "priority": 10,
                        "show_close_button": true,
                        "ajax_data": {
                            "action": "dokan_dismiss_limited_time_promotional_notice",
                            "nonce": "6c82d2aa00",
                            "key": "smart-saving-week-is-live-save-up-to-30"
                        },
                        "actions": [
                            {
                                "type": "primary",
                                "text": "Upgrade Now",
                                "action": "https://dokan.co/wordpress/pricing/",
                                "target": "_blank"
                            }
                        ]
                    }
                ])
            });
        });

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    // admin
    test('admin can view Dokan dashboard', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminDashboardRenderProperly();
    });

    test('multiple promo notices are available and count matches', { tag: ['@lite', '@admin'] }, async () => {
        await admin.adminDashboardRenderProperly();
        await admin.expectTotalNotices(2);
    });

    test('a promo notice is visible and has a title', { tag: ['@lite', '@admin'] }, async () => {
        await admin.adminDashboardRenderProperly();
        const title = await admin.getVisibleNoticeTitle();
        expect(title).toBeTruthy();
    });
});
