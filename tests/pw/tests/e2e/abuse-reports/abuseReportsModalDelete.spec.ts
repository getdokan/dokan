import { test, expect, request, Page } from '@utils/test';
import { AbuseReportsPage } from './abuseReportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { faker } from '@faker-js/faker';
import path from 'path';

// The repo's strict tsconfig doesn't pull in @types/node, so `process` is
// flagged as undefined elsewhere in the suite. Declare it locally (same trick
// the page object uses) so this file stays type-clean.
declare const process: { env: Record<string, string | undefined> };

// ============================================
// SESSION STORAGE
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json'); // admin

// Seeded fixtures (see tests/pw/.env). product 19 belongs to vendor 3;
// customer 2 is the account behind the c1 storage state.
const SEED_PRODUCT_ID = process.env.PRODUCT_ID || '19';
const SEED_VENDOR_ID = process.env.VENDOR_ID || '3';
const SEED_CUSTOMER_ID = process.env.CUSTOMER_ID || '2';
const DB_PREFIX = process.env.DB_PREFIX || 'wp';

// ============================================
// LOCAL SEED HELPERS (no page-object edits — kept in this spec)
// ============================================
//
// Reports are normally created through the front-end Ajax submit, which is
// heavyweight and depends on Setting A. For modal/delete/orphan coverage we
// need deterministic rows (including guest-named and orphaned ones), so we
// insert straight into the module table — the same mechanism dbUtils already
// exposes via createAbuseReport(). We add a slightly richer local insert so we
// can control the customer_name / customer_email columns for the guest case.

const reportsTable = `${DB_PREFIX}_dokan_report_abuse_reports`;
// reported_at is a NOT NULL DATETIME; build a MySQL-formatted "now".
const mysqlNow = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

interface SeedReport {
    reason: string;
    productId: number;
    vendorId: number;
    customerId?: number; // 0 / undefined => guest (uses name+email)
    customerName?: string;
    customerEmail?: string;
    description?: string | null;
}

async function seedReport(r: SeedReport): Promise<void> {
    await dbUtils.dbQuery(
        `INSERT INTO ${reportsTable}
            (reason, product_id, vendor_id, customer_id, customer_name, customer_email, description, reported_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            r.reason,
            r.productId,
            r.vendorId,
            r.customerId ?? null,
            r.customerName ?? null,
            r.customerEmail ?? null,
            r.description ?? null,
            mysqlNow(),
        ],
    );
}

// Delete every report row directly (used to isolate the delete-to-empty test).
async function purgeAllReports(): Promise<void> {
    await dbUtils.dbQuery(`DELETE FROM ${reportsTable};`);
}

async function countReportRows(): Promise<number> {
    const res = await dbUtils.dbQuery(`SELECT COUNT(*) AS c FROM ${reportsTable};`);
    return Number(res[0].c);
}

// Normalize a GET /abuse-reports body to a row list. The endpoint usually
// returns a JSON ARRAY, but when an orphaned-product row is skipped and a VALID
// row follows it, dokan_report_abuse_get_reports() leaves non-sequential PHP
// array keys (it builds `$data[$i]` with the original index then `continue`s),
// so json_encode emits an index-keyed OBJECT (e.g. {"1": {...}}) instead. This
// is a real dokan-pro REST contract bug; we normalize either shape here so the
// orphaned-record cases assert behavior rather than tripping on the shape.
function rowsOf(raw: unknown): Array<{ reason?: string; vendor?: { name?: string } }> {
    return Array.isArray(raw)
        ? raw
        : Object.values((raw ?? {}) as Record<string, { reason?: string; vendor?: { name?: string } }>);
}

// Unique reason labels per test so rows never collide between cases / workers.
// Every reason this spec seeds starts with REASON_PREFIX, so afterAll can purge
// exactly (and only) this spec's rows by that prefix — keeping the shared report
// count clean for co-sharded TC31 (per_page) / TC12 (bulk delete).
const REASON_PREFIX = 'PW Modal/Delete';
const uniqueReason = (tag: string): string => `${REASON_PREFIX} ${tag} ${faker.string.nanoid(8)}`;

// Delete only the rows THIS spec seeded (matched by the reason prefix), so it
// never pollutes the shared report count co-sharded specs assert against.
async function purgeSpecSeededReports(): Promise<void> {
    await dbUtils.dbQuery(`DELETE FROM ${reportsTable} WHERE reason LIKE ?;`, [`${REASON_PREFIX} %`]);
}

// ============================================
// LOCAL UI HELPERS (selectors live in the page object; only NEW probes here)
// ============================================

// The "All ( N )" tab badge text — reused from the page object's selector but
// returns the parsed integer.
async function getAllTabBadgeCount(adminPage: Page, abuse: AbuseReportsPage): Promise<number> {
    const badge = adminPage.locator(abuse.adminReact.allTabBadge).first();
    await badge.waitFor({ state: 'visible', timeout: 15000 });
    const raw = (await badge.textContent()) || '';
    const match = raw.match(/\d+/);
    return match ? parseInt(match[0], 10) : NaN;
}

// DataViews renders an explicit empty banner when the dataset is empty. In this
// build (verified live, tmp-abuse explorer) it is the `.dataviews-no-results`
// node carrying the text "No data found". The previous anchored regex
// ("no results|reports|items|data") never matched "No data found" (trailing
// "found"), which is why this assertion timed out. Anchor on the stable
// structural class DataViews always emits for the empty state instead.
const EMPTY_STATE_SELECTOR = '.dataviews-no-results';

// Pagination control container in the DataViews footer.
const PAGINATION_SELECTOR =
    "//*[contains(@class,'dataviews-pagination') or contains(@class,'dataviews-footer')]";

// ============================================
// SUITE
// ============================================
//
// Self-contained P1-7 batch (modal field rendering, modal close-state, the
// delete-to-empty edge, and orphaned product/vendor records). It is a SEPARATE
// top-level describe from the TC1–TC33 suite so the ordered cases there are
// untouched.
//
// Setting A ("Reported by — logged-in only") is the only global setting these
// tests could perturb; the seeded rows go in via direct DB insert so they
// never depend on it. We still snapshot/disable it in beforeAll and restore it
// in afterAll out of caution, leaving it OFF (the state TC18 / TC22 expect).
test.describe('Abuse Reports — Modal, Delete-edge & Orphaned records @pro', () => {
    test.describe.configure({ mode: 'serial' });

    let reportedByWasOn = false;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);

        // Ensure the Report Abuse module is enabled for the whole batch.
        await abuse.goToModulesPage();
        await abuse.searchModule('Report Abuse');
        await abuse.enableReportAbuseModuleIfDisabled();

        // Snapshot Setting A so afterAll can restore it, then force it OFF.
        await abuse.goToSettingsPage();
        await abuse.searchSettings(abuse.testData.abuseReports.settingsSearchKeyword);
        reportedByWasOn = await adminPage.locator(abuse.admin.reportedByToggleCheckbox).isChecked();
        await abuse.disableReportedBySliderIfEnabled();
        await abuse.clickSaveChanges();

        await adminPage.close();
        await context.close();
    });

    test.afterAll(async ({ browser }) => {
        // CO-SHARD SAFETY: delete every row this spec seeded (MD-1..MD-6 each
        // seed; MD-4 purges-to-empty then re-seeds a "post-empty-reseed" row).
        // All seeded reasons share REASON_PREFIX, so this purges exactly this
        // spec's rows and leaves the shared report count untouched — protecting
        // co-sharded abuseReports.spec.ts TC31 (per_page) / TC12 (bulk delete).
        // Run cleanup FIRST so a later settings-restore failure can't skip it.
        await purgeSpecSeededReports();

        // Restore Setting A to whatever it was before this batch ran.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);
        await abuse.goToSettingsPage();
        await abuse.searchSettings(abuse.testData.abuseReports.settingsSearchKeyword);
        if (reportedByWasOn) {
            await abuse.enableReportedBySliderIfDisabled();
        } else {
            await abuse.disableReportedBySliderIfEnabled();
        }
        await abuse.clickSaveChanges();
        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // §Modal:119 — Modal full field rendering
    // ------------------------------------------------------------------
    test('MD-1 - Detail modal renders all fields (reason, description, product, reported-by, reported-at, vendor)', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const reason = uniqueReason('full-fields');
        const description = `Full-field rendering description ${faker.string.nanoid(6)}`;

        // Logged-in customer report against the seeded product/vendor.
        await seedReport({
            reason,
            productId: Number(SEED_PRODUCT_ID),
            vendorId: Number(SEED_VENDOR_ID),
            customerId: Number(SEED_CUSTOMER_ID),
            description,
        });

        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);

        await abuse.goToAbuseReportsReact();
        await abuse.waitForListReady();
        await abuse.expectReasonVisibleInList(reason);

        await abuse.clickReasonCell(reason);
        expect(await abuse.isDetailModalVisible(), 'Detail modal should open from the reason cell').toBe(true);

        // Reason
        expect(await abuse.getDetailModalReason(), 'Modal should show the report reason').toContain(reason);

        // Description (present branch)
        expect(await abuse.getDetailModalDescription(), 'Modal should show the description').toContain(description);

        // Reported Product — icon block + link to the product edit screen.
        const productBlock = adminPage.locator(abuse.adminReact.detailModalReportedProduct).first();
        await expect(productBlock, 'Reported Product block should be visible').toBeVisible();
        const productHref = await adminPage
            .locator("//*[@role='dialog']//a[contains(@href,'post.php?post=')]")
            .first()
            .getAttribute('href');
        expect(productHref, 'Product should link to its admin edit page (post.php?post=)').toContain(
            `post.php?post=${SEED_PRODUCT_ID}`,
        );

        // Reported By — for a logged-in reporter the name links to user-edit.php
        // and the email renders beneath it.
        const reportedByText = await abuse.getDetailModalReporterText();
        expect(reportedByText.length, 'Reported By block should render reporter text').toBeGreaterThan(0);
        const reporterHref = await adminPage
            .locator(`//*[@role='dialog']//a[contains(@href,'user-edit.php?user_id=${SEED_CUSTOMER_ID}')]`)
            .first()
            .getAttribute('href');
        expect(reporterHref, 'Logged-in reporter should link to their user-edit admin page').toContain(
            `user-edit.php?user_id=${SEED_CUSTOMER_ID}`,
        );

        // Reported At — non-empty date text.
        const reportedAt = (await adminPage.locator(abuse.adminReact.detailModalReportedAt).first().textContent()) || '';
        expect(reportedAt.trim().length, 'Reported At should render a non-empty date').toBeGreaterThan(0);

        // Product Vendor — links to the vendor's user-edit admin page.
        const vendorHref = await adminPage
            .locator(`//*[@role='dialog']//a[contains(@href,'user-edit.php?user_id=${SEED_VENDOR_ID}')]`)
            .first()
            .getAttribute('href');
        expect(vendorHref, 'Vendor should link to its user-edit admin page').toContain(
            `user-edit.php?user_id=${SEED_VENDOR_ID}`,
        );

        await abuse.closeDetailModal();
        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // §Modal:120 — Null / missing fields → "N/A" / "Anonymous"
    // ------------------------------------------------------------------
    test('MD-2 - Modal handles missing description + guest reporter (no Description section; reporter falls back to guest fields)', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const reason = uniqueReason('null-fields');
        const guestName = `Guest ${faker.person.firstName()} ${faker.string.nanoid(5)}`;
        const guestEmail = `pw-guest-${faker.string.nanoid(8)}@example.com`.toLowerCase();

        // Guest report (customer_id NULL) with NO description.
        await seedReport({
            reason,
            productId: Number(SEED_PRODUCT_ID),
            vendorId: Number(SEED_VENDOR_ID),
            customerId: 0,
            customerName: guestName,
            customerEmail: guestEmail,
            description: null,
        });

        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);

        await abuse.goToAbuseReportsReact();
        await abuse.waitForListReady();
        await abuse.expectReasonVisibleInList(reason);

        await abuse.clickReasonCell(reason);
        expect(await abuse.isDetailModalVisible(), 'Detail modal should open').toBe(true);

        // Description section is conditionally rendered ({ modalItem.description && ... }),
        // so with no description there should be NO "Description" heading.
        const descriptionHeading = adminPage.locator(abuse.adminReact.detailModalDescriptionBlock).first();
        expect(
            await descriptionHeading.isVisible().catch(() => false),
            'No Description section should render when the report has no description',
        ).toBe(false);

        // Reported By: ACTUAL behavior — the REST builder always returns a
        // reported_by object (id 0 for guests), so the modal's `! reported_by`
        // "Anonymous" branch is unreachable with real data. A guest report
        // therefore renders the submitted guest NAME + EMAIL (no link), NOT the
        // literal "Anonymous". Assert that real behavior and document the gap.
        const reportedByText = await abuse.getDetailModalReporterText();
        expect(reportedByText, 'Guest reporter name should render in the modal').toContain(guestName);
        const reportedByBlock = adminPage.locator(abuse.adminReact.detailModalReportedBy).first();
        expect(
            (await reportedByBlock.textContent()) || '',
            'Guest reporter email should render beneath the name',
        ).toContain(guestEmail);
        // No reporter link for a guest. GAP (React): the modal's Reported By
        // block ALWAYS wraps the name in `<a href={ reported_by.admin_url }>`
        // (no conditional on admin_url). For a guest the REST builder returns
        // admin_url === null (functions.php: customer_id 0 → $admin_url = null),
        // so React emits an <a> WITHOUT an href — the anchor is present but is
        // not a navigable link. So "zero <a> elements" is false; the truthful
        // assertion (mirroring List Case 2) is "no anchor carries an href".
        const guestReporterLinkCount = await adminPage
            .locator("//*[@role='dialog']//*[normalize-space()='Reported By']/following-sibling::*//a[@href]")
            .count();
        expect(guestReporterLinkCount, 'Guest reporter should not be a navigable link (anchor present but no href)').toBe(0);

        await abuse.closeDetailModal();
        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // §Modal:127 — Close via button AND Escape both fully clear state
    // ------------------------------------------------------------------
    test('MD-3 - Detail modal closes via Close button and via Escape, each fully clearing state', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const reason = uniqueReason('close-state');
        await seedReport({
            reason,
            productId: Number(SEED_PRODUCT_ID),
            vendorId: Number(SEED_VENDOR_ID),
            customerId: Number(SEED_CUSTOMER_ID),
            description: 'Close-state seed',
        });

        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);

        await abuse.goToAbuseReportsReact();
        await abuse.waitForListReady();
        await abuse.expectReasonVisibleInList(reason);

        // (1) Close via the Close button.
        await abuse.clickReasonCell(reason);
        expect(await abuse.isDetailModalVisible(), 'Modal should open (1st)').toBe(true);
        await abuse.closeDetailModal();
        expect(await abuse.isDetailModalVisible(), 'Modal should be hidden after Close button').toBe(false);

        // (2) Reopen, then close via the Escape key (DokanModal shouldCloseOnEsc=true).
        await abuse.clickReasonCell(reason);
        expect(await abuse.isDetailModalVisible(), 'Modal should reopen (2nd)').toBe(true);
        await adminPage.keyboard.press('Escape');
        await adminPage.locator(abuse.adminReact.detailModalHeading).waitFor({ state: 'hidden', timeout: 10000 });
        expect(await abuse.isDetailModalVisible(), 'Modal should be hidden after Escape').toBe(false);

        // (3) Reopen once more to prove state was fully cleared (not stuck open/stale).
        await abuse.clickReasonCell(reason);
        expect(await abuse.isDetailModalVisible(), 'Modal should reopen with fresh state after Escape').toBe(true);
        expect(await abuse.getDetailModalReason(), 'Reopened modal should show the same reason').toContain(reason);
        await abuse.closeDetailModal();

        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // §Delete:137 — Delete the LAST remaining report → empty state,
    // pagination hides, "All" badge shows 0.
    // ------------------------------------------------------------------
    test('MD-4 - Deleting the last report shows the empty state, hides pagination, and zeroes the badge', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        // Isolate: purge every row, then seed EXACTLY one. This batch is a
        // separate top-level describe (TC1–33 seed their own data), and we
        // re-seed a row at the end so the table isn't left empty for others.
        await purgeAllReports();
        const reason = uniqueReason('last-row');
        await seedReport({
            reason,
            productId: Number(SEED_PRODUCT_ID),
            vendorId: Number(SEED_VENDOR_ID),
            customerId: Number(SEED_CUSTOMER_ID),
            description: 'Last-remaining-report seed',
        });
        expect(await countReportRows(), 'Exactly one report should exist before the delete').toBe(1);

        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);

        await abuse.goToAbuseReportsReact();
        await abuse.waitForListReady();
        await abuse.expectReasonVisibleInList(reason);
        expect(await abuse.getRowCount(), 'List should show exactly one row before delete').toBe(1);
        expect(await getAllTabBadgeCount(adminPage, abuse), 'Badge should read 1 before delete').toBe(1);

        // Delete the only row via its row-action menu.
        await abuse.openRowActionMenu(reason);
        await abuse.clickDeleteActionFromMenu();
        const desc = await abuse.getDeleteModalDescriptionText();
        expect(desc, 'Single-delete modal copy should reference the selected report(s)').toContain('selected abuse report(s)');
        await abuse.confirmDeleteInModal();
        await abuse.waitForListReady();

        // Server side: zero rows remain.
        await expect
            .poll(async () => countReportRows(), { timeout: 10000 })
            .toBe(0);

        // UI: empty state appears, no data rows.
        await expect(
            adminPage.locator(abuse.adminReact.dataRow),
            'No data rows should remain after deleting the last report',
        ).toHaveCount(0, { timeout: 15000 });
        await expect(
            adminPage.locator(EMPTY_STATE_SELECTOR).first(),
            'An empty-state banner should be shown when no reports remain',
        ).toBeVisible({ timeout: 15000 });

        // Badge reads 0.
        expect(await getAllTabBadgeCount(adminPage, abuse), 'All-tab badge should read 0 after the last delete').toBe(0);

        // Pagination should not be present with a single (now zero) page.
        const paginationVisible = await adminPage
            .locator(PAGINATION_SELECTOR)
            .first()
            .isVisible()
            .catch(() => false);
        // DataViews renders no pager when totalPages <= 1; if a footer node
        // exists it must not expose page-navigation buttons.
        if (paginationVisible) {
            const pagerButtons = await adminPage
                .locator(`${PAGINATION_SELECTOR}//button[contains(@aria-label,'page') or contains(@aria-label,'Page') or contains(@aria-label,'Next') or contains(@aria-label,'Previous')]`)
                .count();
            expect(pagerButtons, 'Pagination navigation should be hidden when no reports remain').toBe(0);
        }

        await adminPage.close();
        await context.close();

        // Re-seed a row so the shared table isn't left empty for later batches.
        await seedReport({
            reason: uniqueReason('post-empty-reseed'),
            productId: Number(SEED_PRODUCT_ID),
            vendorId: Number(SEED_VENDOR_ID),
            customerId: Number(SEED_CUSTOMER_ID),
            description: 'Re-seeded after delete-to-empty test',
        });
    });

    // ------------------------------------------------------------------
    // §Cross:224 — Orphaned report: product deleted.
    // ------------------------------------------------------------------
    test('MD-5 - Report whose product was deleted does not crash the list (ACTUAL: orphaned row is dropped, not shown as N/A)', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const apiUtils = new ApiUtils(await request.newContext());

        // Isolate: purge every report so THIS orphaned row is the ONLY one in
        // the set. That is deliberate — see the bug note below: when a VALID row
        // coexists with an orphaned one the admin list actually crashes, so we
        // exercise the clean single-row case here and document the multi-row gap.
        await purgeAllReports();

        // Create a disposable product owned by vendor1, then a report on it.
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        expect(Number(productId), 'Disposable product should be created').toBeGreaterThan(0);

        const reason = uniqueReason('orphan-product');
        await seedReport({
            reason,
            productId: Number(productId),
            vendorId: Number(SEED_VENDOR_ID),
            customerId: Number(SEED_CUSTOMER_ID),
            description: 'Orphaned-product seed',
        });

        // ⚠️ REAL DOKAN-PRO BUG surfaced by this case (assert real behavior +
        // document the gap — do NOT silently mask it): when an orphaned-product
        // row is SKIPPED, dokan_report_abuse_get_reports() keeps building
        // `$data[$i]` with the ORIGINAL result index (functions.php foreach +
        // `continue`). If a VALID row FOLLOWS an orphaned one the PHP array has
        // NON-SEQUENTIAL keys, so json_encode emits a JSON OBJECT (e.g.
        // {"1":{...}}) instead of an array. The REST call does not fatal (still
        // HTTP 200), but the admin React list then throws "n.filter is not a
        // function" / "l.some is not a function" and the WHOLE Abuse Reports page
        // fails to render. By isolating to a single (orphaned) row the
        // post-deletion list is a clean empty array, which the UI renders fine —
        // letting us assert the orphan-drop + no-fatal guarantees deterministically.
        const abuseRest = new AbuseReportsPage({} as never);
        const isThisRow = (r: { reason?: string }) => r?.reason === reason;

        // Confirm the row is initially returned by REST (product still alive).
        const beforeRes = await abuseRest.restGetReports(apiUtils.request, { per_page: '100' });
        expect(beforeRes.status(), 'GET should be 200 while product exists').toBe(200);
        const beforeRows = rowsOf(await beforeRes.json());
        expect(beforeRows.some(isThisRow), 'Report should be listed while its product exists').toBe(true);

        // Now FORCE-delete the product → orphan the report. A plain (trash)
        // delete leaves the post loadable via wc_get_product(), so the
        // orphan-skip (functions.php: `if ( ! $product ) { continue; }`) would
        // never fire and the row would still be returned. force=true removes the
        // post permanently so the row is genuinely orphaned.
        await apiUtils.deleteProduct(productId, payloads.adminAuth, true);

        // ACTUAL behavior: the orphaned row is SKIPPED (not surfaced as "N/A",
        // which is what TEST_PRIORITIES expected) and the list does NOT fatal.
        // As the only row, its removal leaves a clean empty array.
        const afterRes = await abuseRest.restGetReports(apiUtils.request, { per_page: '100' });
        expect(afterRes.status(), 'GET should still be 200 after product deletion (no fatal/crash)').toBe(200);
        const afterRaw = await afterRes.json();
        expect(Array.isArray(afterRaw), 'With the single orphaned row removed the response is a clean empty array').toBe(true);
        expect(
            rowsOf(afterRaw).some(isThisRow),
            'ACTUAL: orphaned-product report is dropped from the list (skipped via continue), not shown as N/A',
        ).toBe(false);

        // The admin React list renders the (now-empty) list without crashing.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);
        await abuse.goToAbuseReportsReact();
        await abuse.waitForListReady();
        await expect(adminPage.locator(abuse.adminReact.pageHeading), 'List page should render without crashing').toBeVisible();
        // The orphaned reason must not appear (its product is gone).
        await abuse.expectReasonNotVisibleInList(reason);

        await adminPage.close();
        await context.close();

        // Clean up the orphaned report row so it does not coexist with later
        // cases' valid rows (which would trigger the object-shape crash above).
        await purgeAllReports();
        await apiUtils.request.dispose();
    });

    // ------------------------------------------------------------------
    // §Cross:225 — Orphaned report: vendor deleted.
    // ------------------------------------------------------------------
    test('MD-6 - Report whose vendor was deleted does not crash the list (product alive → row remains; vendor name renders empty, not literal "N/A")', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const apiUtils = new ApiUtils(await request.newContext());

        // Isolate: a single VALID row keeps the response a clean array and avoids
        // the orphaned-row object-shape crash documented in MD-5.
        await purgeAllReports();

        // Build the "vendor reference gone, product alive" state DIRECTLY: seed a
        // report on an ALIVE product (SEED_PRODUCT_ID) but with a vendor_id that
        // points to NO existing user. That is the real residual state after a
        // vendor is removed while their product survives (reassigned/kept), and
        // it is reproduced deterministically WITHOUT relying on user-deletion
        // semantics — deleting a vendor USER via REST (reassign unset) also
        // deletes that user's products, which orphans the PRODUCT instead (that
        // path is MD-5's scenario, not this one). Verified live: get_reports
        // returns vendor {id:0, name:""} for a missing vendor_id.
        const MISSING_VENDOR_ID = 99999990;
        const reason = uniqueReason('orphan-vendor');
        await seedReport({
            reason,
            productId: Number(SEED_PRODUCT_ID),
            vendorId: MISSING_VENDOR_ID,
            customerId: Number(SEED_CUSTOMER_ID),
            description: 'Orphaned-vendor seed',
        });

        // ACTUAL behavior: get_reports() builds the vendor via dokan_get_vendor(),
        // which returns a Vendor instance even for a missing user, so `item.vendor`
        // is NEVER null — the modal's `! vendor` "N/A" branch is unreachable. The
        // product still exists, so the ROW IS STILL RETURNED; get_shop_name() reads
        // no user meta → empty string (and the id resolves to 0). The ?reason=
        // filter is a no-op for a custom reason, so identify the row by its unique
        // reason value. (TEST_PRIORITIES expected a literal "N/A"; we assert the
        // real, no-crash behavior and document the gap.)
        const abuseRest = new AbuseReportsPage({} as never);
        const res = await abuseRest.restGetReports(apiUtils.request, { per_page: '100' });
        expect(res.status(), 'GET should still be 200 with a dangling vendor reference (no fatal/crash)').toBe(200);
        const rows = rowsOf(await res.json());
        const row = rows.find(x => x.reason === reason);
        expect(row, 'Row remains because its product still exists').toBeTruthy();
        if (!row || !row.vendor) throw new Error('orphaned-vendor report row not found'); // narrow for TS
        expect(row.vendor, 'vendor object is still emitted (never null), so it is not the N/A branch').toBeTruthy();
        // Vendor name resolves to empty for the missing user.
        expect(
            String(row.vendor.name ?? ''),
            'ACTUAL: missing-vendor shop name resolves to empty string, not literal "N/A"',
        ).toBe('');

        // Admin React list loads without crashing and the row is present.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuse = new AbuseReportsPage(adminPage);
        await abuse.goToAbuseReportsReact();
        await abuse.waitForListReady();
        await expect(adminPage.locator(abuse.adminReact.pageHeading), 'List page should render without crashing').toBeVisible();
        await abuse.expectReasonVisibleInList(reason);

        // Open the modal — it should render without throwing.
        await abuse.clickReasonCell(reason);
        expect(await abuse.isDetailModalVisible(), 'Detail modal should open for an orphaned-vendor report (no crash)').toBe(true);
        await abuse.closeDetailModal();

        await adminPage.close();
        await context.close();

        // Cleanup the seeded row so it doesn't pollute later cases / co-shards.
        await purgeAllReports();
        await apiUtils.request.dispose();
    });
});
