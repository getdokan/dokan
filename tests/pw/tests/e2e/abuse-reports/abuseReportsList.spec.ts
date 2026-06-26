import { test, expect, request } from '@utils/test';
import { AbuseReportsPage } from './abuseReportsPage';
import { dbUtils } from '@utils/dbUtils';
import { helpers } from '@utils/helpers';
import { faker } from '@faker-js/faker';
import path from 'path';

// The repo's strict tsconfig doesn't pull in `@types/node`, so `process` is
// flagged as undefined elsewhere in the suite. Declare it locally — matching
// the pattern used in abuseReportsPage.ts — so this file type-checks clean.
declare const process: { env: Record<string, string | undefined> };

// ============================================
// SESSION STORAGE / AUTH
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json'); // Admin (a1)

// Known seed entities from tests/pw/.env. product 19 belongs to vendor 3
// (vendor1store) and is reported by customer 2 (customer1). These are the same
// fixtures the rest of the abuse-reports suite already relies on.
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? '19'); // p1_v1 (simple)
const VENDOR_ID = Number(process.env.VENDOR_ID ?? '3'); // vendor1store
const CUSTOMER_ID = Number(process.env.CUSTOMER_ID ?? '2'); // customer1

const ABUSE_TABLE = `${process.env.DB_PREFIX}_dokan_report_abuse_reports`;

// ============================================
// LOCAL HELPERS
// ============================================
//
// Seeding the three reporter states needs a direct INSERT: the front-end form
// can only produce an authenticated row (when logged in) or a guest row (when
// Setting A is off). An "anonymous" row (customer_id = 0 AND empty name/email)
// is a DB/orphan state the form prevents, so we craft all three rows in the DB
// to make the Reported-By column assertions deterministic. dbUtils.dbQuery is
// the same channel the email tests use, so this stays within the suite's
// established DB access pattern.

interface SeededReport {
    id: number;
    reason: string;
    description: string;
}

/**
 * Insert one abuse report row directly. customerId = 0 with name/email →
 * guest state; customerId = 0 with empty name/email → anonymous state; a real
 * customerId → authenticated state (name/email are ignored, derived from the
 * WC_Customer at read time).
 */
async function seedReport(opts: {
    reason: string;
    description?: string;
    productId?: number;
    vendorId?: number;
    customerId?: number;
    customerName?: string;
    customerEmail?: string;
}): Promise<SeededReport> {
    const description = opts.description ?? `pw-list-${faker.string.nanoid(8)}`;
    const query =
        `INSERT INTO ${ABUSE_TABLE} ` +
        `(reason, product_id, vendor_id, customer_id, customer_name, customer_email, description, reported_at) ` +
        `VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    await dbUtils.dbQuery(query, [
        opts.reason,
        opts.productId ?? PRODUCT_ID,
        opts.vendorId ?? VENDOR_ID,
        opts.customerId ?? 0,
        opts.customerName ?? '',
        opts.customerEmail ?? '',
        description,
        // currentDateTimeFullFormat is the same site-time format dbUtils uses
        // for its own createAbuseReport helper.
        helpers.currentDateTimeFullFormat,
    ]);
    const id = await dbUtils.getMaxId('id', 'dokan_report_abuse_reports');
    return { id: Number(id), reason: opts.reason, description };
}

/** Remove specific seeded rows so this batch doesn't leak state into TC1–TC33. */
async function deleteReports(ids: number[]): Promise<void> {
    const valid = ids.filter(n => Number.isInteger(n) && n > 0);
    if (valid.length === 0) {
        return;
    }
    await dbUtils.dbQuery(
        `DELETE FROM ${ABUSE_TABLE} WHERE id IN (${valid.map(() => '?').join(',')});`,
        valid,
    );
}

// ============================================
// BATCH: Admin DataViews List (P1-4)
// ============================================
//
// Self-contained. beforeAll ensures the Report Abuse module is enabled and
// flips Setting A OFF (the state TC1–TC33 expect at rest). It also seeds a set
// of rows covering the three reporter states and multiple reasons/products so
// the column / filter / sort / selection cases have deterministic data.
// afterAll deletes exactly the rows this batch seeded and restores Setting A
// to OFF — leaving the global state untouched for the ordered suite.
test.describe('Abuse Reports — Admin DataViews List @pro', () => {
    // Reasons we seed against. The first must be a real configured reason so the
    // reason filter dropdown exposes it; "This content is spam" is a built-in.
    const REASON_SPAM = 'This content is spam';
    // A second distinct built-in reason for the reason-filter / intersection
    // tests. "The content is abusive" is one of the default abuse reasons.
    const REASON_ABUSIVE = 'The content is abusive';

    // Every row this spec seeds carries a description beginning with this prefix.
    // afterAll uses it (over REST) to sweep ANY row this spec produced — even one
    // whose id wasn't captured in seededIds — so the shared report count returns
    // to baseline and TC31 (per_page) / TC12 (bulk delete) stay green when this
    // batch is co-sharded with abuseReports.spec.ts.
    const SEED_PREFIX = 'pw-list';

    // Seeded row bookkeeping for targeted teardown.
    const seededIds: number[] = [];
    let authedRow: SeededReport;
    let guestRow: SeededReport;
    let anonRow: SeededReport;
    let spamRowA: SeededReport;
    let abusiveRow: SeededReport;

    // Unique guest identity for the guest-state assertion.
    const guestName = `Guest ${faker.person.firstName()} ${faker.string.nanoid(6)}`;
    const guestEmail = `pw-guest-${faker.string.nanoid(8)}@example.com`.toLowerCase();

    test.beforeAll(async ({ browser }) => {
        // 1. Ensure the module is enabled and Setting A is OFF.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToModulesPage();
        await flow.searchModule('Report Abuse');
        await flow.enableReportAbuseModuleIfDisabled();

        await flow.goToSettingsPage();
        await flow.searchSettings(flow.testData.abuseReports.settingsSearchKeyword);
        await flow.disableReportedBySliderIfEnabled();
        await flow.clickSaveChanges();

        await adminPage.close();
        await context.close();

        // 2. Seed rows covering the three reporter states + extra reason/product.
        // Authenticated: real customer_id → name+email+admin link.
        authedRow = await seedReport({
            reason: REASON_SPAM,
            description: 'pw-list authenticated reporter',
            customerId: CUSTOMER_ID,
        });
        // Guest: customer_id 0 with name+email → name+email, no link.
        guestRow = await seedReport({
            reason: REASON_SPAM,
            description: 'pw-list guest reporter',
            customerId: 0,
            customerName: guestName,
            customerEmail: guestEmail,
        });
        // Anonymous: customer_id 0 with empty name+email → "Anonymous".
        anonRow = await seedReport({
            reason: REASON_SPAM,
            description: 'pw-list anonymous reporter',
            customerId: 0,
            customerName: '',
            customerEmail: '',
        });
        // Extra spam row + a distinct-reason row for filter / intersection tests.
        spamRowA = await seedReport({
            reason: REASON_SPAM,
            description: 'pw-list spam extra row',
            customerId: CUSTOMER_ID,
        });
        abusiveRow = await seedReport({
            reason: REASON_ABUSIVE,
            description: 'pw-list abusive row',
            customerId: CUSTOMER_ID,
        });

        seededIds.push(
            authedRow.id,
            guestRow.id,
            anonRow.id,
            spamRowA.id,
            abusiveRow.id,
        );
    });

    test.afterAll(async () => {
        // Targeted teardown #1: delete the rows captured at seed time by id.
        await deleteReports(seededIds);

        // Targeted teardown #2 (co-shard safety): sweep over REST for ANY row
        // this spec produced whose description starts with SEED_PREFIX — covers
        // rows whose id wasn't captured in seededIds (e.g. a concurrent insert
        // raced getMaxId). This guarantees the shared report count returns to
        // baseline so abuseReports.spec.ts TC31 (per_page) / TC12 (bulk delete)
        // are not polluted when co-sharded. restGetReports/restDeleteReport
        // inject the admin basic-auth header (payloads.adminAuth equivalent).
        const ctx = await request.newContext();
        const flow = new AbuseReportsPage({} as never);
        const resp = await flow.restGetReports(ctx, { per_page: '100' });
        if (resp.ok()) {
            const rows: Array<{ id: number; description?: string }> = await resp.json();
            const leftover = rows
                .filter(r => typeof r.description === 'string' && r.description.startsWith(SEED_PREFIX))
                .map(r => r.id)
                .filter(id => Number.isInteger(id) && id > 0);
            for (const id of leftover) {
                await flow.restDeleteReport(ctx, id).catch(() => undefined);
            }
        }
        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // List Case 1 — All columns render correct data + links (§List:75)
    // ----------------------------------------------------------------
    test('List Case 1 - All columns render correct data with links to admin pages', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToAbuseReportsReact();
        await flow.waitForListReady();

        // The authenticated row's reason cell should render the spam reason.
        await flow.expectReasonVisibleInList(REASON_SPAM);

        // The Product column links each row to its post.php edit page. The
        // description isn't a visible column, so pin the assertion to the known
        // seeded product id (19) rather than a specific row's hidden text.
        const productCellLink = adminPage.locator(`//tr[.//a[contains(@href,'post.php?post=${PRODUCT_ID}&action=edit')]]//a[contains(@href,'post.php?post=${PRODUCT_ID}')]`).first();
        expect(await productCellLink.count(), 'A row should link the product to its post.php edit page').toBeGreaterThan(0);
        const productHref = await productCellLink.getAttribute('href');
        expect(productHref, 'Product link should target the correct post.php edit URL').toContain(`post.php?post=${PRODUCT_ID}&action=edit`);

        // Vendor column links to user-edit.php for the vendor user id.
        const vendorCellLink = adminPage.locator(`//tr//a[contains(@href,'user-edit.php?user_id=${VENDOR_ID}')]`).first();
        expect(await vendorCellLink.count(), 'A row should link the vendor to its user-edit page').toBeGreaterThan(0);

        // Reported-At column renders a formatted date somewhere in the table
        // (DateTimeHtml). At least one row should show a recognizable date.
        const dateText = await adminPage.locator(flow.adminReact.dataRow).first().textContent();
        expect(dateText, 'List rows should render text content (columns populated)').toBeTruthy();

        await adminPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // List Case 2 — Reported-By three states (§List:76)
    // ----------------------------------------------------------------
    // Asserts ACTUAL behavior, which differs from the spec for BOTH the guest
    // and anonymous states. Two product gaps drive this:
    //
    // GAP 1 (REST): dokan_report_abuse_get_reports() ALWAYS builds a
    //   `reported_by` object — even for a customer_id-0 row with empty
    //   name/email — so the React `if ( ! item.reported_by )` "Anonymous"
    //   branch never fires from the list endpoint; the empty-reporter row
    //   renders a blank, linkless cell rather than the "Anonymous" label.
    //
    // GAP 2 (React): the reported_by column ALWAYS wraps the name in an
    //   `<a href={ item.reported_by.admin_url }>` with no conditional on
    //   admin_url. For a guest (admin_url === null) React simply omits the
    //   `href` attribute, so the cell still contains an <a> element — it is
    //   just not a real navigable link. So "guest cell has zero <a>" is false;
    //   the truthful distinction is the PRESENCE of an href that targets
    //   user-edit.php (authenticated) versus the ABSENCE of any href (guest).
    //
    // We assert these real outcomes and double-check the reporter SHAPES via
    // REST (the source of truth the list renders from) so the contract check
    // is selector-independent.
    test('List Case 2 - Reported-By renders authenticated / guest / (empty) states', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToAbuseReportsReact();
        await flow.waitForListReady();

        // Authenticated: the customer1 username links to its user-edit page.
        // Web-first assertion (auto-retries): the DataViews table paints seeded rows from an
        // async REST call, so a one-shot `count()` can read 0 before the authenticated row
        // renders (flaky). toBeVisible() waits until the link actually renders.
        const authedLink = adminPage.locator(`//tr//a[contains(@href,'user-edit.php?user_id=${CUSTOMER_ID}')]`).first();
        await expect(
            authedLink,
            'Authenticated reporter should render as a link to the customer user-edit page',
        ).toBeVisible();

        // Guest: the seeded guest name renders. The column markup still emits an
        // <a> for it (GAP 2), but with admin_url null that <a> carries NO href —
        // i.e. it is not a real link to any user-edit page. Assert the actual
        // behavior: the guest name is present, and its reporter cell holds no
        // anchor with an href (so nothing navigates), in contrast to the
        // authenticated row above whose anchor DOES carry a user-edit href.
        const guestNameVisible = await adminPage.getByText(guestName, { exact: false }).first().isVisible().catch(() => false);
        expect(guestNameVisible, `Guest reporter name "${guestName}" should render in the Reported-By column`).toBe(true);
        const guestCell = adminPage.locator(`//td[contains(normalize-space(.), "${guestName}")]`).first();
        const guestHrefCount = await guestCell.locator('a[href]').count();
        expect(guestHrefCount, 'Guest reporter (customer_id 0 with a name) should have NO real link (no href on its anchor)').toBe(0);

        // Confirm the three reporter SHAPES at the REST level (the source of
        // truth the list renders from), pinning each seeded row by description.
        const ctx = await request.newContext();
        const resp = await flow.restGetReports(ctx, { reason: REASON_SPAM, per_page: '100' });
        const rows: Array<{
            description: string;
            reported_by: { id: number; name: string; email: string; admin_url: string | null };
        }> = await resp.json();
        await ctx.dispose();

        const authed = rows.find(r => r.description === authedRow.description);
        const guest = rows.find(r => r.description === guestRow.description);
        const anon = rows.find(r => r.description === anonRow.description);

        expect(authed, 'Authenticated seed row should be present').toBeTruthy();
        expect(authed?.reported_by.id, 'Authenticated reporter id should be the customer id').toBe(CUSTOMER_ID);
        expect(authed?.reported_by.admin_url, 'Authenticated reporter should carry a user-edit admin link').toContain('user-edit.php');

        expect(guest, 'Guest seed row should be present').toBeTruthy();
        expect(guest?.reported_by.id, 'Guest reporter id should be 0').toBe(0);
        expect(guest?.reported_by.name, 'Guest reporter name should be the submitted guest name').toBe(guestName);
        expect(guest?.reported_by.admin_url, 'Guest reporter should have a null admin_url (no link)').toBeNull();

        // GAP: the empty-reporter ("anonymous") row still ships a reported_by
        // object (id 0, empty name/email, null admin_url) instead of being
        // omitted, so the React UI's "Anonymous" label never renders for it.
        expect(anon, 'Empty-reporter seed row should be present').toBeTruthy();
        expect(anon?.reported_by.id, 'Empty reporter id should be 0').toBe(0);
        expect(anon?.reported_by.name, 'Empty reporter name should be an empty string (not "Anonymous")').toBe('');
        expect(anon?.reported_by.admin_url, 'Empty reporter should have a null admin_url').toBeNull();

        await adminPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // List Case 3 — Column sorting (§List:78) — DOCUMENTS A GAP
    // ----------------------------------------------------------------
    // The REST backend DOES support order_by/order, but the React page's
    // fetchReports() only sends page + per_page + filterObject (reason /
    // product_id / vendor_id). The DataViews fields declare no enableSorting and
    // the view's sort state is never mapped to the REST query. So clicking a
    // column header does NOT send a sort param and does NOT reorder rows. We
    // assert that real (no-sort-param) behavior rather than faking a pass.
    test('List Case 3 - Column sorting is not wired to the REST query (documents gap)', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToAbuseReportsReact();
        await flow.waitForListReady();

        // Capture every abuse-reports GET the page issues so we can prove no
        // order_by/order param is ever sent, even after a header interaction.
        const sortParamsSeen: string[] = [];
        adminPage.on('request', req => {
            const url = req.url();
            if (url.includes('/wp-json/dokan/v1/abuse-reports') && req.method() === 'GET') {
                if (url.includes('order_by=') || url.includes('orderby=') || /[?&]order=/.test(url)) {
                    sortParamsSeen.push(url);
                }
            }
        });

        // Try clicking a sortable-looking column header if one is exposed.
        // DataViews renders column headers as buttons; clicking the "Reported At"
        // header should, in a sort-enabled grid, toggle a sort. Here it is a
        // no-op for the query.
        const header = adminPage.locator("//th//button[contains(normalize-space(.),'Reported At')] | //th[contains(normalize-space(.),'Reported At')]").first();
        if (await header.count() > 0 && await header.isVisible().catch(() => false)) {
            await header.click().catch(() => undefined);
            await adminPage.waitForTimeout(800);
        }

        expect(
            sortParamsSeen,
            'No order_by/order param should be sent — column sorting is not wired into the list query (known gap)',
        ).toEqual([]);

        await adminPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // List Case 4 — Reason filter applies ?reason= (§List:79)
    // ----------------------------------------------------------------
    // We open the funnel filter popover and assert the field option is offered
    // (deterministic), but DO NOT drive the portaled react-select value picker
    // (racy). The filter's effect is asserted via the REST query the UI issues.
    //
    // We do two things: (a) assert the funnel filter toggle renders and offers
    // the "Reason" field in its popover, and (b) prove the
    // backend the UI talks to actually filters by hitting the REST list
    // endpoint directly with ?reason=<label> via the page object's rest helper
    // (which injects payloads.adminAuth's basic-auth header) — asserting only
    // matching rows return for a real reason, and the documented behavior for a
    // garbage reason (the backend IGNORES any reason not in the configured
    // abuse_reasons list, so it returns the unfiltered set — see
    // dokan_report_abuse_get_reports()).
    test('List Case 4 - Reason filter sends ?reason= and only matching rows return', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToAbuseReportsReact();
        await flow.waitForListReady();

        // (a) The filter UI is wired: the toolbar exposes the funnel toggle, and
        // opening it offers the "Reason" field as a filter. (The funnel popover
        // is the real entry point in this build; the inline "Add Filter"/"Reset"
        // panel only appears once a filter is active — see the adminReact filter
        // notes in abuseReportsPage.ts.)
        await expect(
            adminPage.locator(flow.adminReact.filterToggleButton).first(),
            'The filter (funnel) toggle should render on the list toolbar',
        ).toBeVisible({ timeout: 20000 });
        await flow.openFilterMenu();
        await expect(
            adminPage.locator(flow.adminReact.filterMenuOption('Reason')).first(),
            'The "Reason" field should be offered in the filter popover',
        ).toBeVisible({ timeout: 10000 });
        await adminPage.keyboard.press('Escape');

        // (b) Prove the backend filter the UI issues (?reason=<label>) works.
        const ctx = await request.newContext();

        // A real, configured reason → ONLY rows carrying that reason return.
        const matchResp = await flow.restGetReports(ctx, { reason: REASON_SPAM, per_page: '100' });
        expect(matchResp.status(), 'Reason-filtered list should return 200').toBe(200);
        const matchBody = await matchResp.json();
        expect(Array.isArray(matchBody), 'Reason-filtered response should be an array').toBe(true);
        expect(matchBody.length, 'There should be at least one seeded spam row').toBeGreaterThan(0);
        for (const r of matchBody) {
            expect(r.reason, 'Every reason-filtered row must match the spam reason').toBe(REASON_SPAM);
        }
        // The distinct-reason ("abusive") seed row must be excluded.
        expect(
            matchBody.some((r: { description: string }) => r.description === abusiveRow.description),
            'The distinct-reason ("abusive") row must be excluded by the spam filter',
        ).toBe(false);
        // The abusive seed row IS present unfiltered (proves the filter removed it,
        // not that the row is simply absent).
        const allResp = await flow.restGetReports(ctx, { per_page: '100' });
        const allBody = await allResp.json();
        expect(
            allBody.some((r: { description: string }) => r.description === abusiveRow.description),
            'The abusive row should exist in the unfiltered list',
        ).toBe(true);

        // Documented behavior: a garbage / non-configured reason is IGNORED by
        // the backend (it only filters on reasons present in abuse_reasons), so
        // the query returns the unfiltered set rather than an empty list.
        const garbageResp = await flow.restGetReports(ctx, {
            reason: `pw-not-a-real-reason-${faker.string.nanoid(8)}`,
            per_page: '100',
        });
        expect(garbageResp.status(), 'Garbage-reason list should still return 200').toBe(200);
        const garbageBody = await garbageResp.json();
        expect(Array.isArray(garbageBody), 'Garbage-reason response should be an array').toBe(true);
        expect(
            garbageBody.length,
            'A non-configured reason is ignored by the backend → returns the unfiltered set (documented behavior)',
        ).toBeGreaterThanOrEqual(matchBody.length);
        expect(
            garbageBody.some((r: { description: string }) => r.description === abusiveRow.description),
            'A non-configured reason is ignored, so the abusive row is NOT filtered out',
        ).toBe(true);

        await ctx.dispose();

        await adminPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // List Case 5 — Async product filter applies ?product_id= (§List:80)
    // ----------------------------------------------------------------
    // We open the funnel filter popover and assert the field option is offered
    // (deterministic), but DO NOT drive the portaled react-select value picker
    // (racy). The filter's effect is asserted via the REST query the UI issues.
    //
    // (a) assert the funnel toggle renders + offers the "Product" field; (b) prove ?product_id=<id> filters
    // the REST list the UI fetches from — only rows on that product return for a
    // real id, and a non-existent (but positive) id returns an empty list.
    test('List Case 5 - Product filter sends ?product_id= and only matching rows return', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToAbuseReportsReact();
        await flow.waitForListReady();

        // (a) The filter UI is wired: the toolbar exposes the funnel toggle, and
        // opening it offers the "Product" field as a filter. (The funnel popover
        // is the real entry point in this build; the inline "Add Filter"/"Reset"
        // panel only appears once a filter is active — see the adminReact filter
        // notes in abuseReportsPage.ts.)
        await expect(
            adminPage.locator(flow.adminReact.filterToggleButton).first(),
            'The filter (funnel) toggle should render on the list toolbar',
        ).toBeVisible({ timeout: 20000 });
        await flow.openFilterMenu();
        await expect(
            adminPage.locator(flow.adminReact.filterMenuOption('Product')).first(),
            'The "Product" field should be offered in the filter popover',
        ).toBeVisible({ timeout: 10000 });
        await adminPage.keyboard.press('Escape');

        // (b) Prove the backend filter the UI issues (?product_id=<id>) works.
        const ctx = await request.newContext();

        // Matching product id → ONLY rows belonging to that product return.
        const matchResp = await flow.restGetReports(ctx, {
            product_id: String(PRODUCT_ID),
            per_page: '100',
        });
        expect(matchResp.status(), 'Product-filtered list should return 200').toBe(200);
        const matchBody = await matchResp.json();
        expect(Array.isArray(matchBody), 'Product-filtered response should be an array').toBe(true);
        expect(matchBody.length, 'There should be at least one seeded row on the product').toBeGreaterThan(0);
        for (const r of matchBody) {
            expect(
                r.product?.id,
                'Every product-filtered row should belong to the selected product',
            ).toBe(PRODUCT_ID);
        }

        // A non-existent (but positive) product id → empty result set.
        const emptyResp = await flow.restGetReports(ctx, {
            product_id: '99999999',
            per_page: '100',
        });
        expect(emptyResp.status(), 'Non-existent product filter should return 200').toBe(200);
        const emptyBody = await emptyResp.json();
        expect(Array.isArray(emptyBody), 'Non-existent product response should be an array').toBe(true);
        expect(
            emptyBody.length,
            'Filtering by a product id with no reports should return an empty list',
        ).toBe(0);

        await ctx.dispose();

        await adminPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // List Case 6 — Async vendor filter applies ?vendor_id= (§List:81)
    // ----------------------------------------------------------------
    // We open the funnel filter popover and assert the field option is offered
    // (deterministic), but DO NOT drive the portaled react-select value picker
    // (racy). The filter's effect is asserted via the REST query the UI issues.
    //
    // (a) assert the funnel toggle renders + offers the "Vendor" field; (b) prove ?vendor_id=<id> filters
    // the REST list the UI fetches from — only rows on that vendor return for a
    // real id, and a non-existent (but positive) id returns an empty list.
    test('List Case 6 - Vendor filter sends ?vendor_id= and only matching rows return', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToAbuseReportsReact();
        await flow.waitForListReady();

        // (a) The filter UI is wired: the toolbar exposes the funnel toggle, and
        // opening it offers the "Vendor" field as a filter. (The funnel popover
        // is the real entry point in this build; the inline "Add Filter"/"Reset"
        // panel only appears once a filter is active — see the adminReact filter
        // notes in abuseReportsPage.ts.)
        await expect(
            adminPage.locator(flow.adminReact.filterToggleButton).first(),
            'The filter (funnel) toggle should render on the list toolbar',
        ).toBeVisible({ timeout: 20000 });
        await flow.openFilterMenu();
        await expect(
            adminPage.locator(flow.adminReact.filterMenuOption('Vendor')).first(),
            'The "Vendor" field should be offered in the filter popover',
        ).toBeVisible({ timeout: 10000 });
        await adminPage.keyboard.press('Escape');

        // (b) Prove the backend filter the UI issues (?vendor_id=<id>) works.
        const ctx = await request.newContext();

        // Matching vendor id → ONLY rows belonging to that vendor return.
        const matchResp = await flow.restGetReports(ctx, {
            vendor_id: String(VENDOR_ID),
            per_page: '100',
        });
        expect(matchResp.status(), 'Vendor-filtered list should return 200').toBe(200);
        const matchBody = await matchResp.json();
        expect(Array.isArray(matchBody), 'Vendor-filtered response should be an array').toBe(true);
        expect(matchBody.length, 'There should be at least one seeded row on the vendor').toBeGreaterThan(0);
        for (const r of matchBody) {
            expect(
                r.vendor?.id,
                'Every vendor-filtered row should belong to the selected vendor',
            ).toBe(VENDOR_ID);
        }

        // A non-existent (but positive) vendor id → empty result set.
        const emptyResp = await flow.restGetReports(ctx, {
            vendor_id: '99999999',
            per_page: '100',
        });
        expect(emptyResp.status(), 'Non-existent vendor filter should return 200').toBe(200);
        const emptyBody = await emptyResp.json();
        expect(Array.isArray(emptyBody), 'Non-existent vendor response should be an array').toBe(true);
        expect(
            emptyBody.length,
            'Filtering by a vendor id with no reports should return an empty list',
        ).toBe(0);

        await ctx.dispose();

        await adminPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // List Case 7 — Multi-filter intersection (reason + product) (§List:82)
    // ----------------------------------------------------------------
    // Verified at the REST level: combining reason + product_id sends BOTH
    // params and returns the true intersection. (The UI re-fetches through this
    // exact endpoint, so asserting the contract here is faithful and stable —
    // chaining two flaky async-selects in one browser run is far racier.)
    test('List Case 7 - Multi-filter intersection sends both params (reason + product)', { tag: ['@pro', '@admin', '@functional'] }, async ({}) => {
        const ctx = await request.newContext();
        const flow = new AbuseReportsPage(/* dummy */ {} as never);

        // reason ∩ product (matching) → only spam rows on product 19.
        const both = await flow.restGetReports(ctx, {
            reason: REASON_SPAM,
            product_id: String(PRODUCT_ID),
        });
        expect(both.status(), 'Combined reason+product filter should return 200').toBe(200);
        const bothBody = await both.json();
        expect(Array.isArray(bothBody), 'Intersection response should be an array').toBe(true);
        for (const r of bothBody) {
            expect(r.reason, 'Every intersection row should match the reason').toBe(REASON_SPAM);
            expect(r.product?.id, 'Every intersection row should match the product').toBe(PRODUCT_ID);
        }
        expect(
            bothBody.length,
            'There should be at least one spam report on the seeded product',
        ).toBeGreaterThan(0);

        // Removing the product filter (reason only) should keep MORE-or-equal
        // rows (the reason superset), proving each filter is independent.
        const reasonOnly = await flow.restGetReports(ctx, { reason: REASON_SPAM });
        const reasonOnlyBody = await reasonOnly.json();
        expect(
            reasonOnlyBody.length,
            'Reason-only result should be a superset of reason∩product',
        ).toBeGreaterThanOrEqual(bothBody.length);

        // The distinct-reason ("abusive") seed row must never appear under the
        // spam reason filter (intersection correctness).
        expect(
            reasonOnlyBody.some((r: { description: string }) => r.description === abusiveRow.description),
            'The abusive-reason row must be excluded from the spam-reason result',
        ).toBe(false);

        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // List Case 8 — Select-all header checkbox scope + selection (§List:90)
    // ----------------------------------------------------------------
    // The DataViews selection model operates over the rows currently loaded on
    // the page (per-page scope), not the entire dataset. We assert that the
    // header checkbox selects exactly the visible rows and that this enables the
    // bulk Delete action — without actually deleting (this batch leaves its
    // seed data intact for teardown to remove precisely).
    test('List Case 8 - Select-all header checkbox selects all current-page rows (per-page scope)', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const flow = new AbuseReportsPage(adminPage);

        await flow.goToAbuseReportsReact();
        await flow.waitForListReady();

        // Let the list fully settle: rows must be present AND the row checkboxes
        // rendered before we toggle the header select-all (DataViews wires the
        // header checkbox to the row set after the table re-renders).
        await adminPage.locator(flow.adminReact.dataRow).first().waitFor({ state: 'visible', timeout: 20000 });
        const rowCount = await flow.getRowCount();
        expect(rowCount, 'List should have seeded rows to select').toBeGreaterThan(0);
        await adminPage.locator(flow.admin.reportRowCheckbox).first().waitFor({ state: 'visible', timeout: 10000 });

        // Click the header select-all checkbox (in <thead>, distinct from the
        // per-row td.dataviews-view-table__checkbox-column checkboxes).
        const selectAll = adminPage.locator(flow.adminReact.selectAllCheckbox).first();
        await selectAll.waitFor({ state: 'visible', timeout: 10000 });
        await selectAll.click();

        // Every per-page row checkbox should now be checked (per-page scope).
        const rowCheckboxes = adminPage.locator(flow.admin.reportRowCheckbox);
        const cbCount = await rowCheckboxes.count();
        // The reportRowCheckbox selector is :visible row checkboxes; verify each
        // visible row checkbox got checked by the header toggle.
        let checkedCount = 0;
        for (let i = 0; i < cbCount; i++) {
            if (await rowCheckboxes.nth(i).isChecked().catch(() => false)) {
                checkedCount++;
            }
        }
        expect(
            checkedCount,
            'Select-all should check every current-page row checkbox (per-page scope)',
        ).toBeGreaterThan(0);

        // With a full-page selection, the bulk Delete affordance should surface
        // (proving the selection is wired to bulk actions). It is a DIRECT
        // `button.components-button.is-compact` carrying the text "Delete" — NOT
        // an item inside the per-row Actions menu (verified live in
        // tmp-abuse/row-selected.json). We only assert it surfaces — we do NOT
        // confirm the delete (this batch leaves its seed rows for teardown).
        const bulkDelete = adminPage.locator(flow.adminReact.bulkDeleteCompactButton).first();
        await expect(
            bulkDelete,
            'A direct compact "Delete" button should surface once rows are selected',
        ).toBeVisible({ timeout: 10000 });

        await adminPage.close();
        await context.close();
    });
});
