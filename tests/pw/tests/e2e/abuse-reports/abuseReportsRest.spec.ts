//COVERAGE_TAG: GET /dokan/v1/abuse-reports
//COVERAGE_TAG: GET /dokan/v1/abuse-reports/abuse-reasons
//COVERAGE_TAG: DELETE /dokan/v1/abuse-reports/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/abuse-reports/batch

import { test, expect, request } from '@utils/test';
import { AbuseReportsPage } from './abuseReportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import path from 'path';

// ============================================
// SESSION STORAGE / IDS
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json'); // admin session storage

// Seed targets come from the env the rest of the suite already relies on.
// PRODUCT_ID=19 belongs to VENDOR_ID=3; CUSTOMER_ID=2 is `customer1`.
const { PRODUCT_ID, PRODUCT_ID_V2, VENDOR_ID, VENDOR2_ID, CUSTOMER_ID } = process.env;

// ============================================
// P1-5 — REST CONTRACT: sorting / totals / field-types
//
// This is a SEPARATE top-level describe from the TC1–TC33 suite and the
// Email suite in abuseReports.spec.ts, so the ordered cases there are
// untouched. The batch seeds its OWN rows via direct DB INSERT and removes
// exactly those rows in afterAll, so the global report list (and TC1–TC33)
// is left in the state it started in.
//
// This batch does NOT mutate the "Reported by" admin setting (Setting A), so
// there is nothing global to restore on that front.
//
// All REST calls reuse the page object's `rest` config + REST helpers
// (restGetReports / restDeleteReport / restDeleteReportsBatch), which inject
// admin Basic-Auth — the Dokan REST API authenticates via Basic Auth, not
// cookies. A dummy page is passed to AbuseReportsPage because none of the
// REST helpers touch `this.page`.
// ============================================

// The DB layer types `reported_at` as a plain string and customer_id as a
// number; this local shape documents what each seeded row carries.
interface SeedSpec {
    reason: string;
    description: string | null;
    productId: string;
    vendorId: string;
    customerId: number;        // 0 → guest row (customer_name/email used instead)
    customerName?: string;
    customerEmail?: string;
    reportedAt: string;        // 'YYYY-MM-DD HH:mm:ss' (server/MySQL format)
}

test.describe('Abuse Reports — REST Contract @pro', () => {
    test.describe.configure({ mode: 'serial' });

    const REASON = 'This content is spam'; // a default, always-configured reason
    const REASON_OTHER = 'Other';          // the other default reason

    // Unique markers stamped on every row this spec seeds. They make the rows
    // self-identifying so afterAll can sweep them even if id-tracking is ever
    // lost (e.g. a worker retry re-runs beforeAll with a fresh seededIds array
    // while a prior partial run left orphan rows behind). The DESCRIPTION_PREFIX
    // covers the 4 rows that carry a description; the guest row has a NULL
    // description, so GUEST_EMAIL is its dedicated marker. Co-shard safety for
    // abuseReports.spec.ts TC31 (per_page) / TC12 (bulk delete) depends on this
    // spec NEVER leaving rows behind that inflate the shared report count.
    const SEED_DESCRIPTION_PREFIX = 'REST seed';
    const SEED_GUEST_EMAIL = 'rest-guest@example.com';

    // ids of the rows this batch inserts — captured at seed time, removed in afterAll.
    let seededIds: number[] = [];

    // ----------------------------------------------------------------
    // Local seed helper — direct DB INSERT so we control reported_at
    // (the page object has no create method; there is no REST create
    // endpoint, reports are only created via the front-end Ajax form).
    // Inserts one row and returns its new id.
    // ----------------------------------------------------------------
    async function seedReport(spec: SeedSpec): Promise<number> {
        // Match the columns the front-end insert writes. customer_id is 0 for a
        // guest row; in that case customer_name / customer_email carry identity.
        const res = await dbUtils.dbQuery(
            `INSERT INTO ${process.env.DB_PREFIX}_dokan_report_abuse_reports
                (reason, product_id, vendor_id, customer_id, customer_name, customer_email, description, reported_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                spec.reason,
                parseInt(spec.productId, 10),
                parseInt(spec.vendorId, 10),
                spec.customerId,
                spec.customerName ?? '',
                spec.customerEmail ?? '',
                spec.description,
                spec.reportedAt,
            ],
        );
        // mysql2 returns `insertId` on the OkPacket from an INSERT.
        const id = Number((res as { insertId?: number }).insertId);
        seededIds.push(id);
        return id;
    }

    test.beforeAll(async ({ browser }) => {
        // 1) Ensure the Report Abuse module is enabled once for the whole batch.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);
        await abuseReportsPage.goToModulesPage();
        await abuseReportsPage.searchModule('Report Abuse');
        await abuseReportsPage.enableReportAbuseModuleIfDisabled();
        await adminPage.close();
        await context.close();

        // 2) Seed several rows with ASCENDING reported_at so we can reason about
        //    both id ordering (auto-increment, so insert order == id order) and
        //    reported_at ordering deterministically. Timestamps are spaced one
        //    minute apart in the past so the newest seed is still < "now".
        //    - 3 logged-in customer rows for REASON on PRODUCT_ID / VENDOR_ID
        //    - 1 guest row for REASON on PRODUCT_ID / VENDOR_ID (description null)
        //    - 1 row for REASON_OTHER on PRODUCT_ID_V2 / VENDOR2_ID (intersection control)
        const ts = (offsetMin: number): string => {
            const d = new Date(Date.now() - offsetMin * 60_000);
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };

        await seedReport({ reason: REASON, description: `${SEED_DESCRIPTION_PREFIX} #1`, productId: PRODUCT_ID as string, vendorId: VENDOR_ID as string, customerId: Number(CUSTOMER_ID), reportedAt: ts(50) });
        await seedReport({ reason: REASON, description: `${SEED_DESCRIPTION_PREFIX} #2`, productId: PRODUCT_ID as string, vendorId: VENDOR_ID as string, customerId: Number(CUSTOMER_ID), reportedAt: ts(40) });
        await seedReport({ reason: REASON, description: `${SEED_DESCRIPTION_PREFIX} #3`, productId: PRODUCT_ID as string, vendorId: VENDOR_ID as string, customerId: Number(CUSTOMER_ID), reportedAt: ts(30) });
        // guest row — customer_id 0, description NULL (covers description: str|null)
        await seedReport({ reason: REASON, description: null, productId: PRODUCT_ID as string, vendorId: VENDOR_ID as string, customerId: 0, customerName: 'REST Guest Reporter', customerEmail: SEED_GUEST_EMAIL, reportedAt: ts(20) });
        // different reason + different product/vendor — true-intersection control
        await seedReport({ reason: REASON_OTHER, description: `${SEED_DESCRIPTION_PREFIX} other-product`, productId: PRODUCT_ID_V2 as string, vendorId: VENDOR2_ID as string, customerId: Number(CUSTOMER_ID), reportedAt: ts(10) });
    });

    test.afterAll(async () => {
        // CO-SHARD SAFETY: the report count MUST return to the baseline this
        // spec started from, or abuseReports.spec.ts TC31 (per_page) / TC12
        // (bulk delete) break when co-sharded (extra rows inflate the count).
        //
        // Two-pass cleanup, both via direct DB DELETE (robust regardless of
        // REST state — a row a test already deleted simply no-ops):
        //
        //   Pass 1 — by tracked id: remove exactly the rows still attributed to
        //   this batch (the single/batch DELETE tests untrack the rows they
        //   already removed, so this is whatever remains).
        //
        //   Pass 2 — by self-identifying seed markers: a belt-and-suspenders
        //   sweep that catches orphans if id-tracking was ever lost (e.g. a
        //   worker retry re-ran beforeAll with a fresh seededIds array while a
        //   prior partial run left rows behind). The 4 described seeds match the
        //   SEED_DESCRIPTION_PREFIX; the NULL-description guest row matches its
        //   dedicated SEED_GUEST_EMAIL. These markers are unique to this spec,
        //   so the sweep cannot touch foreign suite data.
        const table = `${process.env.DB_PREFIX}_dokan_report_abuse_reports`;

        if (seededIds.length) {
            const placeholders = seededIds.map(() => '?').join(',');
            await dbUtils.dbQuery(
                `DELETE FROM ${table} WHERE id IN (${placeholders});`,
                seededIds,
            );
        }

        await dbUtils.dbQuery(
            `DELETE FROM ${table} WHERE description LIKE ? OR customer_email = ?;`,
            [`${SEED_DESCRIPTION_PREFIX}%`, SEED_GUEST_EMAIL],
        );

        seededIds = [];
    });

    // ----------------------------------------------------------------
    // Sorting — orderby=id asc/desc
    //
    // KNOWN GAP: RestController::get_items() only forwards page/reason/
    // product_id/vendor_id to dokan_report_abuse_get_reports(). It does NOT
    // forward `orderby`/`order`, so the underlying default (`order by id desc`)
    // is ALWAYS used regardless of the query string. We assert the ACTUAL
    // behavior: the list is sorted by id DESCENDING irrespective of the
    // orderby/order params, and document the gap rather than asserting a
    // sort that the controller never wires up.
    // ----------------------------------------------------------------
    test('REST: orderby=id (asc & desc) — list is always id-descending (documents controller gap)', { tag: ['@pro', '@admin', '@functional'] }, async () => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage({} as never);

        // Baseline (no orderby) — the default contract is id desc.
        const [defResp, defRows] = await readRows(arp, ctx, { per_page: '100' });
        expect(defResp.status(), 'GET /abuse-reports should return 200').toBe(200);
        const ids = (defRows as Array<{ id: number }>).map(r => r.id);
        expect(ids.length, 'Seeded rows should be present in the default listing').toBeGreaterThanOrEqual(5);

        const descSorted = [...ids].sort((a, b) => b - a);
        expect(ids, 'Default ordering should be id DESC (first id is the largest)').toEqual(descSorted);
        expect(ids[0], 'First row id should be the maximum id').toBe(Math.max(...ids));

        // Request order=asc — controller ignores it, so ordering stays id DESC.
        const [, ascRows] = await readRows(arp, ctx, { per_page: '100', orderby: 'id', order: 'asc' });
        const ascIds = (ascRows as Array<{ id: number }>).map(r => r.id);
        expect(
            ascIds,
            'orderby=id&order=asc is NOT honored by the controller — ordering stays id DESC (documented gap)',
        ).toEqual([...ascIds].sort((a, b) => b - a));

        // Request order=desc — matches the default, also id DESC.
        const [, descRows] = await readRows(arp, ctx, { per_page: '100', orderby: 'id', order: 'desc' });
        const descIds = (descRows as Array<{ id: number }>).map(r => r.id);
        expect(descIds, 'orderby=id&order=desc yields id DESC').toEqual([...descIds].sort((a, b) => b - a));

        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // Sorting — orderby=reported_at asc/desc
    //
    // Same controller gap as above: orderby/order are never forwarded, so the
    // response is sorted by id DESC. Because we seeded reported_at in ASCENDING
    // order matching insert (==id) order, "id DESC" is also "reported_at DESC".
    // We assert the ACTUAL behavior: reported_at comes back descending
    // regardless of the requested order param.
    // ----------------------------------------------------------------
    test('REST: orderby=reported_at (asc & desc) — timestamps always descending (documents controller gap)', { tag: ['@pro', '@admin', '@functional'] }, async () => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage({} as never);

        // Only rows carrying THIS spec's seed-description prefix count toward the
        // assertion. Co-shard note: the controller hardcodes per_page=20 and
        // ignores per_page, so an unfiltered read could be pushed past our seeds
        // by rows other co-sharded specs insert AFTER our beforeAll (higher ids
        // → top of the id-DESC page). We therefore SCOPE each read by reason so
        // the response is restricted to this spec's seed rows: REASON holds the
        // 3 described logged-in seeds (the guest row is excluded — its
        // description is NULL), and REASON_OTHER holds the "other-product" seed.
        // We assert each reason-scoped result is INTERNALLY reported_at-DESC and
        // that the two scopes together surface ≥4 described seeds. (We do NOT
        // concatenate-then-sort across reasons: the REASON_OTHER seed is the
        // newest of all seeds, so a cross-reason concat would not be globally
        // descending — DESC ordering is a per-response property.)
        const isSeedDescription = (d: string | null): d is string => d !== null && d.startsWith(SEED_DESCRIPTION_PREFIX);

        const seedTimesForReason = async (reason: string, params: Record<string, string>): Promise<number[]> => {
            const [, rows] = await readRows(arp, ctx, { reason, per_page: '100', ...params });
            return (rows as Array<{ description: string | null; reported_at: string }>)
                .filter(r => isSeedDescription(r.description))
                .map(r => new Date(r.reported_at).getTime());
        };

        // Default / desc / asc all collapse to reported_at DESC for our seeds,
        // because the controller never forwards orderby/order (documented gap)
        // and we seeded reported_at ascending in id order → id DESC == reported_at DESC.
        const paramSets: Record<string, string>[] = [{}, { orderby: 'reported_at', order: 'desc' }, { orderby: 'reported_at', order: 'asc' }];
        for (const params of paramSets) {
            const reasonTimes = await seedTimesForReason(REASON, params);
            const otherTimes = await seedTimesForReason(REASON_OTHER, params);

            // The 3 described REASON seeds + the 1 REASON_OTHER seed = ≥4 total.
            expect(
                reasonTimes.length + otherTimes.length,
                'Seeded rows with timestamps should be returned across both reasons',
            ).toBeGreaterThanOrEqual(4);
            expect(reasonTimes.length, 'The 3 described REASON seeds should be returned').toBeGreaterThanOrEqual(3);

            // Each reason-scoped response must be reported_at DESC regardless of
            // the requested orderby/order (controller ignores them — documented gap).
            for (const [scope, times] of [[REASON, reasonTimes], [REASON_OTHER, otherTimes]] as const) {
                expect(
                    times,
                    `reported_at is returned DESC for reason="${scope}" params=${JSON.stringify(params)} (orderby/order not honored — documented gap)`,
                ).toEqual([...times].sort((a, b) => b - a));
            }
        }

        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // Combined filter (reason + valid product_id) — true intersection
    // ----------------------------------------------------------------
    test('REST: combined filter (reason + valid product_id) returns true intersection; mismatch → empty', { tag: ['@pro', '@admin', '@functional'] }, async () => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage({} as never);

        // Matching pair: REASON rows live on PRODUCT_ID.
        const [matchResp, matchRows] = await readRows(arp, ctx, { reason: REASON, product_id: PRODUCT_ID as string });
        expect(matchResp.status(), 'Combined filter GET should return 200').toBe(200);
        const rows = matchRows as Array<{ reason: string; product: { id: number } }>;
        expect(rows.length, 'Reason ∩ matching product_id should return the seeded REASON rows').toBeGreaterThanOrEqual(4);
        for (const row of rows) {
            expect(row.reason, 'Every row must match the reason filter').toBe(REASON);
            expect(Number(row.product.id), 'Every row must match the product_id filter').toBe(Number(PRODUCT_ID));
        }

        // Mismatched pair: REASON exists, but only on PRODUCT_ID — never on
        // PRODUCT_ID_V2 (that product only has the REASON_OTHER seed). True
        // intersection → empty.
        const [missResp, missRows] = await readRows(arp, ctx, { reason: REASON, product_id: PRODUCT_ID_V2 as string });
        expect(missResp.status(), 'Mismatched combined filter GET should return 200').toBe(200);
        expect(
            (missRows as unknown[]).length,
            'Reason ∩ non-matching product_id should be an empty intersection',
        ).toBe(0);

        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // Response field types
    // ----------------------------------------------------------------
    test('REST: response field types — id int, reason str, product/vendor/reported_by objects, description str|null, reported_at RFC3339', { tag: ['@pro', '@admin', '@validation'] }, async () => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage({} as never);

        // Scope to our seeded reason so we exercise both a logged-in row (admin_url
        // non-null) and the guest row (description null, reported_by.admin_url null).
        const [resp, rows] = await readRows(arp, ctx, { reason: REASON, per_page: '100' });
        expect(resp.status(), 'GET /abuse-reports should return 200').toBe(200);

        const list = rows as Array<Record<string, any>>;
        expect(list.length, 'There should be seeded REASON rows to type-check').toBeGreaterThanOrEqual(4);

        // Cross-check the same listing via ApiUtils + payloads.adminAuth (the
        // explicit admin auth the page-object helper wraps): both authed
        // surfaces must agree on the row count, proving the contract is auth-
        // independent and the field shapes above aren't an artifact of one path.
        const apiUtils = new ApiUtils(ctx);
        const [, viaApiUtils] = await apiUtils.get(
            `${arp.rest.listEndpoint}?reason=${encodeURIComponent(REASON)}&per_page=100`,
            { headers: payloads.adminAuth },
        );
        expect(
            (viaApiUtils as unknown[]).length,
            'ApiUtils (payloads.adminAuth) and the page-object helper should return the same row count',
        ).toBe(list.length);

        const rfc3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; // mysql_to_rfc3339 output

        for (const row of list) {
            // id — absint() server-side → JSON integer
            expect(Number.isInteger(row.id), `id should be an integer (got ${typeof row.id})`).toBe(true);

            // reason — string
            expect(typeof row.reason, 'reason should be a string').toBe('string');

            // product object: { id:int, title:str, admin_url:str(post.php edit link) }
            expect(typeof row.product, 'product should be an object').toBe('object');
            expect(Number.isInteger(row.product.id), 'product.id should be an integer').toBe(true);
            expect(typeof row.product.title, 'product.title should be a string').toBe('string');
            expect(row.product.admin_url, 'product.admin_url should be a post-edit admin link').toContain('post.php?post=');

            // vendor object: { id:int, name:str, admin_url:str(user-edit link) }
            expect(typeof row.vendor, 'vendor should be an object').toBe('object');
            expect(Number.isInteger(row.vendor.id), 'vendor.id should be an integer').toBe(true);
            expect(typeof row.vendor.name, 'vendor.name should be a string').toBe('string');
            expect(row.vendor.admin_url, 'vendor.admin_url should be a user-edit admin link').toContain('user-edit.php?user_id=');

            // reported_by object: { id:int, name:str, email:str, admin_url:str|null }
            expect(typeof row.reported_by, 'reported_by should be an object').toBe('object');
            expect(Number.isInteger(row.reported_by.id), 'reported_by.id should be an integer').toBe(true);
            expect(typeof row.reported_by.name, 'reported_by.name should be a string').toBe('string');
            expect(typeof row.reported_by.email, 'reported_by.email should be a string').toBe('string');
            if (row.reported_by.id > 0) {
                // logged-in reporter → admin_url is a user-edit link (non-null)
                expect(row.reported_by.admin_url, 'logged-in reporter admin_url should be a user-edit link').toContain('user-edit.php?user_id=');
            } else {
                // guest reporter → admin_url is null
                expect(row.reported_by.admin_url, 'guest reporter admin_url should be null').toBeNull();
            }

            // description — string OR null
            expect(
                row.description === null || typeof row.description === 'string',
                'description should be a string or null',
            ).toBe(true);

            // reported_at — RFC3339 timestamp
            expect(typeof row.reported_at, 'reported_at should be a string').toBe('string');
            expect(row.reported_at, 'reported_at should be RFC3339-formatted').toMatch(rfc3339);
            expect(Number.isNaN(new Date(row.reported_at).getTime()), 'reported_at should parse to a valid Date').toBe(false);
        }

        // Edge shapes (null description + null reported_by.admin_url) must be
        // proven on OUR guest seed row specifically. Co-shard note: per_page is
        // hardcoded to 20 and ignored, so under heavy co-sharding (other specs
        // seed the same default REASON) our guest row can be pushed off the
        // first page. The `page` param IS honored, so we PAGE through the
        // REASON-filtered list until we find the guest row by its unique seed
        // email (SEED_GUEST_EMAIL) rather than relying on it being in page 1.
        let guestRow: Record<string, any> | undefined =
            list.find(r => r.reported_by?.email === SEED_GUEST_EMAIL);
        for (let page = 2; !guestRow && page <= 50; page++) {
            const [, pageRows] = await readRows(arp, ctx, { reason: REASON, page: String(page) });
            if (!pageRows.length) break; // walked past the last page
            guestRow = (pageRows as Array<Record<string, any>>).find(r => r.reported_by?.email === SEED_GUEST_EMAIL);
        }

        expect(guestRow, 'This spec\'s guest seed row should be retrievable via the REASON listing').toBeDefined();
        expect((guestRow as Record<string, any>).description, 'The guest seed row should surface a null description (str|null contract)').toBeNull();
        expect((guestRow as Record<string, any>).reported_by.admin_url, 'The guest seed row should surface a null reported_by.admin_url').toBeNull();
        expect((guestRow as Record<string, any>).reported_by.id, 'The guest seed row should have reported_by.id === 0').toBe(0);

        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // Total header == total DB count
    // ----------------------------------------------------------------
    test('REST: X-Dokan-AbuseReports-Total header equals total DB row count', { tag: ['@pro', '@admin', '@functional'] }, async () => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage({} as never);

        // Query the DB directly for the authoritative total.
        const dbRows = await dbUtils.dbQuery(
            `SELECT COUNT(*) AS total FROM ${process.env.DB_PREFIX}_dokan_report_abuse_reports;`,
        );
        const dbTotal = Number((dbRows as Array<{ total: number }>)[0]?.total ?? 0);

        // Send per_page=1 — the header must still reflect the FULL DB count,
        // independent of any paging param.
        const PER_PAGE = 1;
        const HARDCODED_PAGE_SIZE = 20; // RestController::get_items() hardcodes $per_page = 20
        const response = await arp.restGetReports(ctx, { per_page: String(PER_PAGE) });
        expect(response.status(), 'GET /abuse-reports should return 200').toBe(200);

        const header = response.headers()['x-dokan-abusereports-total'];
        expect(header, 'X-Dokan-AbuseReports-Total header should be present').toBeDefined();
        expect(Number(header), 'Total header should equal the DB row count (not the page count)').toBe(dbTotal);

        const body = await response.json();
        // KNOWN GAP (TEST_CASES §REST:166): the UI sends per_page but
        // RestController::get_items() hardcodes $per_page = 20 and never forwards
        // the request's per_page, so per_page=1 is NOT honored. We assert the
        // ACTUAL behavior — the page returns up to the hardcoded page size (<=20)
        // regardless of per_page — while the header still reports the full total.
        expect(
            (body as unknown[]).length,
            'per_page is NOT honored — the endpoint returns up to the hardcoded page size (<=20) regardless of per_page (documented gap)',
        ).toBeLessThanOrEqual(HARDCODED_PAGE_SIZE);
        expect(dbTotal, 'DB should hold at least the 5 seeded rows').toBeGreaterThanOrEqual(5);

        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // Total header decrements by 1 after a single DELETE
    // ----------------------------------------------------------------
    test('REST: total header decrements by 1 after a single DELETE', { tag: ['@pro', '@admin', '@functional'] }, async () => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage({} as never);

        const totalBefore = await getTotalHeader(arp, ctx);

        // Delete one of OUR seeded rows so we never touch foreign data.
        const idToDelete = seededIds[0];
        expect(idToDelete, 'There should be a seeded row id available to delete').toBeDefined();
        const delResp = await arp.restDeleteReport(ctx, idToDelete as number);
        expect(delResp.status(), 'Single DELETE of an existing report should return 200').toBe(200);

        // The DELETE response returns the deleted report object.
        const deleted = await delResp.json();
        expect(Number((deleted as { id: number }).id), 'DELETE should echo back the deleted report id').toBe(idToDelete);

        // Stop tracking it for afterAll cleanup.
        seededIds = seededIds.filter(id => id !== idToDelete);

        const totalAfter = await getTotalHeader(arp, ctx);
        expect(totalAfter, 'Total header should decrement by exactly 1 after a single DELETE').toBe(totalBefore - 1);

        await ctx.dispose();
    });

    // ----------------------------------------------------------------
    // Total header decrements by N after a batch DELETE
    // ----------------------------------------------------------------
    test('REST: total header decrements by N after a batch DELETE', { tag: ['@pro', '@admin', '@functional'] }, async () => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage({} as never);

        const totalBefore = await getTotalHeader(arp, ctx);

        // Batch-delete the remaining seeded rows (at least 3 after the single
        // DELETE test removed one). N == number of ids we send.
        const idsToDelete = [...seededIds];
        expect(idsToDelete.length, 'There should be remaining seeded rows to batch-delete').toBeGreaterThanOrEqual(2);

        const delResp = await arp.restDeleteReportsBatch(ctx, idsToDelete);
        expect(delResp.status(), 'Batch DELETE of existing reports should return 200').toBe(200);

        const deletedArr = await delResp.json();
        expect(Array.isArray(deletedArr), 'Batch DELETE should return an array of deleted report objects').toBe(true);
        expect((deletedArr as unknown[]).length, 'Batch DELETE should return one object per deleted id').toBe(idsToDelete.length);

        // Stop tracking them for afterAll cleanup.
        seededIds = seededIds.filter(id => !idsToDelete.includes(id));

        const totalAfter = await getTotalHeader(arp, ctx);
        expect(totalAfter, 'Total header should decrement by exactly N after a batch DELETE').toBe(totalBefore - idsToDelete.length);

        await ctx.dispose();
    });
});

// ============================================
// LOCAL HELPERS (module scope — outside the describe so they're hoisted)
// ============================================

// Read both the response object and the parsed JSON array in one call, going
// through the page object's admin-authed REST helper. ApiUtils is reused for
// the body-parse niceties where convenient, but restGetReports already returns
// a raw APIResponse, so we parse directly here.
async function readRows(
    arp: AbuseReportsPage,
    ctx: Awaited<ReturnType<typeof request.newContext>>,
    params: Record<string, string> = {},
): Promise<[Awaited<ReturnType<AbuseReportsPage['restGetReports']>>, unknown[]]> {
    const response = await arp.restGetReports(ctx, params);
    const body = response.status() === 200 ? await response.json() : [];
    return [response, Array.isArray(body) ? body : []];
}

// Fetch only the total header (cheap per_page=1 request).
async function getTotalHeader(
    arp: AbuseReportsPage,
    ctx: Awaited<ReturnType<typeof request.newContext>>,
): Promise<number> {
    const response = await arp.restGetReports(ctx, { per_page: '1' });
    expect(response.status(), 'GET /abuse-reports (total probe) should return 200').toBe(200);
    const header = response.headers()['x-dokan-abusereports-total'];
    expect(header, 'X-Dokan-AbuseReports-Total header should be present').toBeDefined();
    return Number(header);
}
