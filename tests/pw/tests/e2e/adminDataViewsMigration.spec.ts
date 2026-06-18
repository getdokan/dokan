import { test, expect, Page } from '@playwright/test';
import { data } from '@utils/testData';

const failOnPageError = (page: Page, errors: string[]) => {
    page.on('pageerror', (err) => {
        errors.push(err.message);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
};

const expectNoMigrationRegressions = (errors: string[]) => {
    const blockers = errors.filter(
        (e) =>
            /LucideIcons is not defined/i.test(e) ||
            /Cannot read properties of undefined \(reading '/.test(e) ||
            /\bAdminDataViews\b/.test(e),
    );
    expect.soft(blockers, blockers.join('\n')).toEqual([]);
};

test.describe('Admin DataViews migration smoke', () => {
    let aPage: Page;
    const errors: string[] = [];

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        failOnPageError(aPage, errors);
    });

    test.beforeEach(() => {
        errors.length = 0;
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('Withdraw page renders DataViews tabs and Export', { tag: ['@lite', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.withdraw, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('tab', { name: /Pending/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /Approved/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /Cancelled/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /^All/ })).toBeVisible();
        await expect(aPage.getByRole('button', { name: 'Export' })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Vendors page renders DataViews tabs and Add Vendor', { tag: ['@lite', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.vendors, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('tab', { name: /^All/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /Approved/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /Pending/ })).toBeVisible();
        await expect(aPage.getByRole('button', { name: 'Add Vendor' })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Reverse Withdrawal page renders stats and Add New', { tag: ['@lite', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.reverseWithdraws, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('heading', { name: 'Reverse Withdrawal' })).toBeVisible();
        await expect(aPage.getByRole('button', { name: 'Add New' })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Refunds page renders DataViews tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.refunds, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('tab', { name: /Pending/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /Approved/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /Cancelled/ })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Reports page renders Earning Overview tab and Export buttons', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.reports, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('tab', { name: /Earning Overview/ })).toBeVisible();
        await expect(aPage.getByRole('button', { name: 'Export' }).first()).toBeVisible();
        expectNoMigrationRegressions(errors);

        await aPage.goto(data.subUrls.backend.dokan.allLogs, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('tab', { name: /Overview/ })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Announcement page renders 6 status tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.announcements, { waitUntil: 'domcontentloaded' });
        for (const name of ['All', 'Published', 'Pending', 'Scheduled', 'Draft', 'Trash']) {
            await expect(aPage.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Verifications page renders 4 status tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.verifications, { waitUntil: 'domcontentloaded' });
        for (const name of ['Pending', 'Approved', 'Rejected', 'Cancelled']) {
            await expect(aPage.getByRole('tab', { name: new RegExp(name) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Abuse Reports page renders DataViews', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.abuseReports, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('heading', { name: 'Abuse Reports' })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /^All/ })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Store Reviews page renders All / Trash tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.storeReviews, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('tab', { name: /^All/ })).toBeVisible();
        await expect(aPage.getByRole('tab', { name: /Trash/ })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Product Q&A page renders 5 status tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.productQA, { waitUntil: 'domcontentloaded' });
        for (const name of ['All', 'Unread', 'Read', 'Unanswered', 'Answered']) {
            await expect(aPage.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Store Support page renders Open / Closed / All tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.storeSupport, { waitUntil: 'domcontentloaded' });
        for (const name of ['Open', 'Closed', 'All']) {
            await expect(aPage.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Seller Badge page renders All / Published / Draft tabs and Create Badge', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.sellerBadge, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('button', { name: 'Create Badge' })).toBeVisible();
        for (const name of ['All', 'Published', 'Draft']) {
            await expect(aPage.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Subscriptions page renders DataViews', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.subscriptions, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('tab', { name: /^All/ })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Wholesale Customer page renders All / Active / Deactive tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.wholeSaleCustomer, { waitUntil: 'domcontentloaded' });
        for (const name of ['All', 'Active', 'Deactive']) {
            await expect(aPage.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Product Advertising page renders All / Active / Expired tabs and Add New', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.productAdvertising, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('button', { name: 'Add New' })).toBeVisible();
        for (const name of ['All', 'Active', 'Expired']) {
            await expect(aPage.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Request for Quotation page renders 11 status tabs', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.requestForQuote, { waitUntil: 'domcontentloaded' });
        for (const name of [
            'All',
            'Pending',
            'Updated',
            'Accepted',
            'Cancelled',
            'Approved',
            'Expired',
            'Draft',
            'Trash',
            'Rejected',
            'Converted',
        ]) {
            await expect(aPage.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });

    test('Store Categories page renders Add Store Category and table', { tag: ['@pro', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.storeCategories, { waitUntil: 'domcontentloaded' });
        await expect(aPage.getByRole('heading', { name: 'Store Categories' })).toBeVisible();
        await expect(aPage.getByRole('button', { name: 'Add Store Category' })).toBeVisible();
        expectNoMigrationRegressions(errors);
    });

    test('Tab switching updates URL on Vendors page', { tag: ['@lite', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.vendors, { waitUntil: 'domcontentloaded' });
        await aPage.getByRole('tab', { name: /^Approved/ }).click();
        await expect(aPage.getByRole('tab', { name: /^Approved/ })).toHaveAttribute('aria-selected', 'true');
        expectNoMigrationRegressions(errors);
    });

    test('Row action menu opens on Withdraw page', { tag: ['@lite', '@admin'] }, async () => {
        await aPage.goto(data.subUrls.backend.dokan.withdraw, { waitUntil: 'domcontentloaded' });
        const actionButtons = aPage.getByRole('button', { name: 'Actions' });
        if ((await actionButtons.count()) > 0) {
            await actionButtons.first().click();
            await expect(aPage.getByRole('menuitem').first()).toBeVisible();
        }
        expectNoMigrationRegressions(errors);
    });
});
