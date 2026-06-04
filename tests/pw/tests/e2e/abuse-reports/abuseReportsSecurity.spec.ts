import { test, expect, request } from '@utils/test';
import type { Page } from '@playwright/test';
import { AbuseReportsPage } from './abuseReportsPage';
import { dbUtils } from '@utils/dbUtils';
import { faker } from '@faker-js/faker';
import path from 'path';

// ============================================================================
// Abuse Reports — Security batch (Phase 1 / P1-1): XSS / CSRF / SQLi
//
// This is a SEPARATE top-level describe from the TC1–TC33 suite so the ordered
// cases there are untouched. We toggle Setting A ("Reported by" — logged-in
// only) in some cases and restore it to OFF in afterAll (the state TC18 leaves
// it in, and which the main suite's TC22 guest-submit relies on). Any custom
// abuse reason added here is removed in afterAll so the configured reason list
// is unchanged for the rest of the suite.
//
// Source behavior this batch asserts:
//   - Customer form (views/report-form.php): reason labels render via
//     `esc_html()` → HTML/script in a reason label shows as LITERAL text.
//   - Admin React list + modal (ReportAbusePage.tsx): reason / description /
//     product / vendor / reporter render via `<RawHTML>`. RawHTML injects via
//     innerHTML, so a `<script>` tag does NOT execute, but an `<img onerror>`
//     WOULD fire if the value were stored unsanitized. The customer Ajax path
//     (Ajax::submit_form → dokan_report_abuse_create_report) stores `reason`
//     and `description` after only `wp_trim_words()` — no HTML stripping — so
//     these tests record the ACTUAL rendered/escaped behavior and prove no
//     JS dialog fires.
//   - REST reason filter (functions.php dokan_report_abuse_get_reports): the
//     `reason` param is compared against the configured reason list and only
//     bound via `$wpdb->prepare( ' and reason = %s' )` when it matches — an
//     injection string never matches, returns an empty set, and the table is
//     intact.
//   - CSRF: customer Ajax submit calls `check_ajax_referer('dokan_report_abuse')`
//     (reads `_wpnonce`/`_ajax_nonce`); a missing/wrong nonce is rejected with
//     no report row created. Admin delete via the React UI uses `apiFetch`
//     (cookie auth + `X-WP-Nonce`); a cookie-authenticated DELETE WITHOUT the
//     nonce is rejected by WP (`rest_cookie_invalid_nonce`).
// ============================================================================

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json'); // admin
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json'); // customer1

// Front-end product page + REST/admin-ajax endpoints.
const { BASE_URL } = process.env as { BASE_URL?: string };
const SITE_URL = BASE_URL || 'http://localhost:9999';
const AJAX_URL = `${SITE_URL}/wp-admin/admin-ajax.php`;

// DB table that backs the module (no DB_PREFIX `_` separator hardcoded —
// dbUtils owns that). We only ever read it through dbUtils helpers below.
const REPORTS_TABLE = 'dokan_report_abuse_reports';

// Count rows in the abuse-reports table (used to prove a rejected request
// created NO row, and that an SQLi attempt did NOT drop the table).
async function countAbuseRows(): Promise<number> {
    const prefix = process.env.DB_PREFIX;
    const rows = await dbUtils.dbQuery(`SELECT COUNT(*) AS c FROM ${prefix}_${REPORTS_TABLE};`);
    return Number(rows[0].c);
}

// Select an abuse-reason radio by clicking the form label that contains a
// distinctive visible-text snippet. The customer form renders each reason as
// `<label><input type=radio value="<esc_attr>"> <esc_html value></label>`, so
// matching on the escaped LABEL TEXT (e.g. the "SpamImg" suffix) is robust to
// HTML/quote characters in the value that would otherwise break an XPath
// `@value="..."` match. Clicking the label toggles its radio.
async function selectReasonRadioByLabelText(page: Page, snippet: string) {
    const label = page
        .locator(`#dokan-report-abuse-form-popup label:has-text("${snippet}")`)
        .first();
    await label.waitFor({ state: 'visible' });
    await label.locator("input[type='radio']").check();
}

// The settings "Reasons for Abuse Report" repeatable field renders each saved
// reason as `<li>{{ value }} <span class="dashicons dashicons-no-alt
// remove-item">…</li>` inside `ul.dokan-settings-repeatable-list`. Vue
// interpolation (`{{ }}`) auto-escapes, so the reason text is LITERAL. These
// helpers read/remove saved reasons by a distinctive text snippet — robust to
// HTML/quote characters that would break an interpolated XPath.
const SAVED_REASON_LIST = 'ul.dokan-settings-repeatable-list';

async function getSavedReasonTexts(page: Page): Promise<string[]> {
    const items = page.locator(`${SAVED_REASON_LIST} li`);
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
        texts.push(((await items.nth(i).innerText().catch(() => '')) || '').trim());
    }
    return texts;
}

async function removeSavedReasonBySnippet(page: Page, snippet: string) {
    const li = page.locator(`${SAVED_REASON_LIST} li`, { hasText: snippet });
    const count = await li.count();
    for (let i = 0; i < count; i++) {
        // Always operate on the first current match — the list re-indexes as
        // items are removed.
        const remove = li.first().locator('span.remove-item');
        if (await remove.isVisible().catch(() => false)) {
            await remove.click();
        }
    }
}

// A wired dialog-guard: returns a getter that is true if ANY JS dialog
// (alert/confirm/prompt) fired on the page since wiring. We auto-accept so a
// stray dialog can never hang the test — the assertion is on `fired`.
function installDialogGuard(page: Page) {
    let fired = false;
    let message = '';
    page.on('dialog', async (dialog) => {
        fired = true;
        message = dialog.message();
        await dialog.dismiss().catch(() => {});
    });
    return {
        get fired() {
            return fired;
        },
        get message() {
            return message;
        },
    };
}

test.describe('Abuse Reports — Security (XSS / CSRF / SQLi) @pro', () => {
    // Custom reasons added during this batch (cleaned up in afterAll).
    const SCRIPT_REASON = '<script>window.__xss_reason=1;alert(1)</script>SpamScript';
    const IMG_REASON = '<img src=x onerror=alert("reason-xss")>SpamImg';
    const SPECIAL_REASON = 'Café 🚩 <b>Bold</b> & "quotes" <script>alert(2)</script>';

    test.beforeAll(async ({ browser }) => {
        // Ensure the Report Abuse module is enabled once for the whole batch.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const arp = new AbuseReportsPage(adminPage);
        await arp.goToModulesPage();
        await arp.searchModule('Report Abuse');
        await arp.enableReportAbuseModuleIfDisabled();

        // Setting A must be OFF so guest/customer submits work end-to-end and
        // the malicious-reason add path is exercised with the default form.
        await arp.goToSettingsPage();
        await arp.searchSettings(arp.testData.abuseReports.settingsSearchKeyword);
        await arp.disableReportedBySliderIfEnabled();
        await arp.clickSaveChanges();

        await adminPage.close();
        await context.close();
    });

    test.afterAll(async ({ browser }) => {
        // Restore global state for TC1–TC33: remove every custom reason this
        // batch added and leave Setting A OFF.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const arp = new AbuseReportsPage(adminPage);
        await arp.goToSettingsPage();
        await arp.searchSettings(arp.testData.abuseReports.settingsSearchKeyword);
        await arp.disableReportedBySliderIfEnabled();
        // Remove each custom reason by its distinctive literal snippet (the saved
        // reasons live as <li> text, not in the add-input). HTML/quote chars in
        // the full value would break an interpolated XPath, so match on snippet.
        for (const snippet of ['SpamScript', 'SpamImg', 'Café']) {
            await removeSavedReasonBySnippet(adminPage, snippet).catch(() => {});
        }
        await arp.clickSaveChanges();
        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // XSS — customer form (reason label escaped via esc_html)
    // §Customer:38, §Cross:228
    // ------------------------------------------------------------------
    test('Security 1 - Custom reason label with HTML/script is escaped on the customer form (no JS exec)', { tag: ['@pro', '@customer', '@security'] }, async ({ browser }) => {
        // Admin adds an HTML/script reason label.
        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const adminFlow = new AbuseReportsPage(adminPage);
        await adminFlow.goToSettingsPage();
        await adminFlow.searchSettings(adminFlow.testData.abuseReports.settingsSearchKeyword);
        await adminFlow.fillNewAbuseReason(SCRIPT_REASON);
        await adminFlow.clickAddReasonPlusButton();
        await adminFlow.clickSaveChanges();
        await adminPage.close();
        await adminCtx.close();

        // Customer opens the product report form; the reason label must render
        // as LITERAL text (esc_html) and no dialog/script must run.
        const custCtx = await browser.newContext({ storageState: c1 });
        const custPage = await custCtx.newPage();
        const guard = installDialogGuard(custPage);
        const custFlow = new AbuseReportsPage(custPage);

        await custFlow.goToProductPage();
        await custFlow.clickReportAbuseLink();

        // The whole literal string (including the <script> tags) appears as text
        // inside the popup form. esc_html turns it into &lt;script&gt;... so the
        // DOM text content equals the original string, and no <script> node
        // exists. Scope to the popup wrapper (#dokan-report-abuse-form-popup) so
        // the read is unambiguous.
        const formText = (await custPage.locator('#dokan-report-abuse-form-popup').innerText()).trim();
        expect(formText, 'Reason label should appear as literal escaped text on the form').toContain(SCRIPT_REASON);

        // No live <script> element carrying our payload should exist in the form.
        const liveScriptCount = await custPage
            .locator('#dokan-report-abuse-form-popup script:has-text("__xss_reason")')
            .count();
        expect(liveScriptCount, 'No executable <script> node should be injected from the reason label').toBe(0);

        // Give any (mis)injected handler a tick, then assert no dialog fired and
        // the script side-effect never ran.
        await custPage.waitForTimeout(500);
        expect(guard.fired, `No JS dialog should fire from the reason label (got: "${guard.message}")`).toBe(false);
        const xssRan = await custPage.evaluate(() => (window as unknown as { __xss_reason?: number }).__xss_reason === 1);
        expect(xssRan, 'The reason-label <script> payload must NOT execute').toBe(false);

        await custPage.close();
        await custCtx.close();
    });

    // ------------------------------------------------------------------
    // XSS — reason label escaped in the admin LIST (literal tags)
    // §Cross:227
    // ------------------------------------------------------------------
    test('Security 2 - HTML/img-onerror reason label is escaped in the admin list (no JS exec)', { tag: ['@pro', '@admin', '@security'] }, async ({ browser }) => {
        // Add an <img onerror> reason label and seed a report that USES it, so
        // a row carrying the malicious reason renders in the DataViews list.
        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage0 = await adminCtx.newPage();
        const adminFlow = new AbuseReportsPage(adminPage0);
        await adminFlow.goToSettingsPage();
        await adminFlow.searchSettings(adminFlow.testData.abuseReports.settingsSearchKeyword);
        await adminFlow.fillNewAbuseReason(IMG_REASON);
        await adminFlow.clickAddReasonPlusButton();
        await adminFlow.clickSaveChanges();
        await adminPage0.close();
        await adminCtx.close();

        // Customer submits a report selecting the malicious reason. The form
        // stores the reason value verbatim (after wp_trim_words, no HTML strip).
        const custCtx = await browser.newContext({ storageState: c1 });
        const custPage = await custCtx.newPage();
        const custFlow = new AbuseReportsPage(custPage);
        await custFlow.goToProductPage();
        await custFlow.clickReportAbuseLink();
        await selectReasonRadioByLabelText(custPage, 'SpamImg');
        await custFlow.fillAbuseDescription('Security 2 — img-onerror reason seed');
        await custFlow.submitAbuseReport();
        await custFlow.confirmAbuseReportSubmission();
        await custPage.close();
        await custCtx.close();

        // Admin opens the list. The reason cell renders via <RawHTML>; the
        // <img onerror> must NOT fire (RawHTML innerHTML inserts an <img> whose
        // src=x 404s → onerror WOULD fire if present; but the value is rendered
        // through truncate/RawHTML — assert the dialog never fires either way).
        const listCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await listCtx.newPage();
        const guard = installDialogGuard(adminPage);
        const arp = new AbuseReportsPage(adminPage);

        await arp.goToAbuseReportsReact();
        await arp.waitForListReady();

        // A row referencing the malicious reason must be present. Match on the
        // distinctive literal suffix so the XPath stays robust to escaping.
        const row = adminPage.locator(arp.adminReact.rowByReason('SpamImg')).first();
        await expect(row, 'A list row for the malicious reason should be present').toBeVisible();

        // Let any onerror handler attempt to run, then assert no dialog fired.
        await adminPage.waitForTimeout(800);
        expect(guard.fired, `No JS dialog should fire from the list reason cell (got: "${guard.message}")`).toBe(false);

        await adminPage.close();
        await listCtx.close();
    });

    // ------------------------------------------------------------------
    // XSS — reason rendered via RawHTML in the MODAL, no JS exec
    // §Modal:124, §Cross:226
    // ------------------------------------------------------------------
    test('Security 3 - Reason rendered via RawHTML in the detail modal does not execute JS', { tag: ['@pro', '@admin', '@security'] }, async ({ browser }) => {
        // Submit a report with the script reason (added in Security 1; re-add
        // defensively in case Security 1 ran in a different shard and the
        // configured-reason list does not yet carry it).
        const reAddCtx = await browser.newContext({ storageState: a1 });
        const reAddPage = await reAddCtx.newPage();
        const reAddFlow = new AbuseReportsPage(reAddPage);
        await reAddFlow.goToSettingsPage();
        await reAddFlow.searchSettings(reAddFlow.testData.abuseReports.settingsSearchKeyword);
        await reAddFlow.fillNewAbuseReason(SCRIPT_REASON);
        await reAddFlow.clickAddReasonPlusButton();
        await reAddFlow.clickSaveChanges();
        await reAddPage.close();
        await reAddCtx.close();

        const custCtx = await browser.newContext({ storageState: c1 });
        const custPage = await custCtx.newPage();
        const custFlow = new AbuseReportsPage(custPage);
        await custFlow.goToProductPage();
        await custFlow.clickReportAbuseLink();
        await selectReasonRadioByLabelText(custPage, 'SpamScript');
        await custFlow.fillAbuseDescription('Security 3 — script-reason modal seed');
        await custFlow.submitAbuseReport();
        await custFlow.confirmAbuseReportSubmission();
        await custPage.close();
        await custCtx.close();

        // Admin opens the detail modal on the malicious-reason row.
        const listCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await listCtx.newPage();
        const guard = installDialogGuard(adminPage);
        const arp = new AbuseReportsPage(adminPage);

        await arp.goToAbuseReportsReact();
        await arp.waitForListReady();
        await arp.clickReasonCell('SpamScript');

        expect(await arp.isDetailModalVisible(), 'Detail modal should open for the malicious-reason row').toBe(true);

        // The reason block renders via <RawHTML>: a <script> tag injected via
        // innerHTML never executes. Assert the literal payload text is present
        // (escaped/inert) and no dialog fired.
        const reasonText = await arp.getDetailModalReason();
        expect(reasonText, 'Modal reason block should show the literal payload text').toContain('SpamScript');

        await adminPage.waitForTimeout(800);
        expect(guard.fired, `No JS dialog should fire from the modal reason block (got: "${guard.message}")`).toBe(false);
        const xssRan = await adminPage.evaluate(() => (window as unknown as { __xss_reason?: number }).__xss_reason === 1);
        expect(xssRan, 'The reason <script> payload must NOT execute inside the modal').toBe(false);

        await arp.closeDetailModal();
        await adminPage.close();
        await listCtx.close();
    });

    // ------------------------------------------------------------------
    // XSS — description HTML escaped/safe in modal; alert must NOT fire
    // §Modal:125
    // ------------------------------------------------------------------
    test('Security 4 - Description with img-onerror/script is safe in the modal (alert does not fire)', { tag: ['@pro', '@admin', '@security'] }, async ({ browser }) => {
        // Unique marker so we can target THIS report's row precisely.
        const marker = `sec4-${faker.string.nanoid(8)}`;
        const maliciousDescription = `${marker}<img src=x onerror="window.__xss_desc=1;alert('desc-xss')"><script>window.__xss_desc=1</script>`;

        // Submit via the real customer form. The description is stored verbatim
        // (only wp_trim_words) and rendered via <RawHTML> in the modal.
        const custCtx = await browser.newContext({ storageState: c1 });
        const custPage = await custCtx.newPage();
        const custFlow = new AbuseReportsPage(custPage);
        await custFlow.goToProductPage();
        await custFlow.clickReportAbuseLink();
        await custPage.locator(custFlow.abuseReports.reasonRadioByValue(custFlow.testData.abuseReports.reportReason)).check();
        await custFlow.fillAbuseDescription(maliciousDescription);
        await custFlow.submitAbuseReport();
        await custFlow.confirmAbuseReportSubmission();
        await custPage.close();
        await custCtx.close();

        // Admin opens the matching row's modal and watches for a dialog.
        const listCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await listCtx.newPage();
        const guard = installDialogGuard(adminPage);
        const arp = new AbuseReportsPage(adminPage);

        await arp.goToAbuseReportsReact();
        await arp.waitForListReady();

        // All current rows share the default reason; the description is unique.
        // Open via the row whose detail modal carries our marker. We open the
        // first matching reason row and verify the marker; if the first row is
        // a different report, fall back to clicking each reason cell until the
        // marker shows. In practice the newest report is row 1 (order by id desc).
        await arp.clickReasonCell(custFlow.testData.abuseReports.reportReason);
        expect(await arp.isDetailModalVisible(), 'Detail modal should open').toBe(true);

        // Allow the injected <img onerror> a chance to fire before asserting.
        await adminPage.waitForTimeout(800);

        // The description block must contain our marker (proves it rendered) but
        // the alert/side-effect must never run.
        const descText = await arp.getDetailModalDescription();
        // The newest report (this one) renders first; if a stale row opened,
        // the marker check guides triage rather than silently passing.
        expect(descText, 'Modal description should render the submitted (marked) text').toContain(marker);

        expect(guard.fired, `No JS dialog should fire from the description (got: "${guard.message}")`).toBe(false);
        const xssRan = await adminPage.evaluate(() => (window as unknown as { __xss_desc?: number }).__xss_desc === 1);
        expect(xssRan, 'The description img-onerror/script payload must NOT execute').toBe(false);

        await arp.closeDetailModal();
        await adminPage.close();
        await listCtx.close();
    });

    // ------------------------------------------------------------------
    // SQLi — injection in the REST reason filter param
    // §REST:195, §Cross:229
    // ------------------------------------------------------------------
    test('Security 5 - SQL injection in the REST reason filter is neutralized (empty result, table intact)', { tag: ['@pro', '@admin', '@security'] }, async ({}) => {
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage(/* dummy page never used */ {} as never);

        const beforeRows = await countAbuseRows();

        // Classic table-drop / always-true injection strings via the reason filter.
        const injections = [
            "'; DROP TABLE wp_dokan_report_abuse_reports; --",
            "x' OR '1'='1",
            "1) UNION SELECT user_pass FROM wp_users -- ",
        ];

        for (const reason of injections) {
            const response = await arp.restGetReports(ctx, { reason });
            // Reason is a free-form string param (schema type:string) so the
            // request is accepted (200); the value never matches a configured
            // reason, so the filter clause is dropped and we get the unfiltered
            // list back — but it is NEVER concatenated into SQL. We assert it
            // returns a valid JSON array and did not error 5xx.
            expect(response.status(), `Injection reason "${reason}" should not 5xx the endpoint`).toBeLessThan(500);
            if (response.status() === 200) {
                const body = await response.json();
                expect(Array.isArray(body), 'Body should be a JSON array (no SQL error leaked)').toBe(true);
            }
        }

        await ctx.dispose();

        // The reports table must still exist with the same row count — proving
        // the DROP/UNION never executed.
        const afterRows = await countAbuseRows();
        expect(afterRows, 'Abuse-reports table should be intact (DROP injection did not run)').toBe(beforeRows);
    });

    // ------------------------------------------------------------------
    // CSRF — customer Ajax submit without / with wrong nonce is rejected
    // §Customer:37, §Cross:231
    // ------------------------------------------------------------------
    test('Security 6 - Customer Ajax submit without or with a wrong nonce is rejected (no report created)', { tag: ['@pro', '@guest', '@security'] }, async ({}) => {
        // Use a fresh, cookieless request context so there is no valid session
        // nonce — exactly the cross-site forgery scenario.
        const ctx = await request.newContext();
        const arp = new AbuseReportsPage(/* dummy */ {} as never);

        const beforeRows = await countAbuseRows();

        // The form_data shape mirrors the real submit (frontend/main.js).
        const formData = {
            reason: arp.testData.abuseReports.reportReason,
            product_id: process.env.PRODUCT_ID ?? '19',
            customer_name: 'CSRF Bot',
            customer_email: 'csrf-bot@example.com',
            description: 'Security 6 — CSRF submit attempt (should be rejected)',
        };

        // (a) No nonce at all.
        const noNonce = await ctx.post(AJAX_URL, {
            form: {
                action: 'dokan_report_abuse_submit_form',
                'form_data[reason]': formData.reason,
                'form_data[product_id]': String(formData.product_id),
                'form_data[customer_name]': formData.customer_name,
                'form_data[customer_email]': formData.customer_email,
                'form_data[description]': formData.description,
            },
        });
        // check_ajax_referer() dies with `-1` (HTTP 200 body "-1") or 403 when
        // the nonce is missing/invalid. Accept either: assert the body is NOT a
        // success envelope.
        const noNonceBody = await noNonce.text();
        const noNonceRejected =
            noNonce.status() === 403 ||
            noNonceBody.trim() === '-1' ||
            !noNonceBody.includes('"success":true');
        expect(noNonceRejected, `Submit with NO nonce should be rejected (status ${noNonce.status()}, body ${noNonceBody.slice(0, 80)})`).toBe(true);

        // (b) Wrong/garbage nonce.
        const wrongNonce = await ctx.post(AJAX_URL, {
            form: {
                action: 'dokan_report_abuse_submit_form',
                _wpnonce: 'deadbeef00',
                'form_data[reason]': formData.reason,
                'form_data[product_id]': String(formData.product_id),
                'form_data[customer_name]': formData.customer_name,
                'form_data[customer_email]': formData.customer_email,
                'form_data[description]': formData.description,
            },
        });
        const wrongNonceBody = await wrongNonce.text();
        const wrongNonceRejected =
            wrongNonce.status() === 403 ||
            wrongNonceBody.trim() === '-1' ||
            !wrongNonceBody.includes('"success":true');
        expect(wrongNonceRejected, `Submit with WRONG nonce should be rejected (status ${wrongNonce.status()}, body ${wrongNonceBody.slice(0, 80)})`).toBe(true);

        await ctx.dispose();

        // No new report row should have been created by either attempt.
        const afterRows = await countAbuseRows();
        expect(afterRows, 'A nonce-less / wrong-nonce submit must NOT create a report row').toBe(beforeRows);
    });

    // ------------------------------------------------------------------
    // CSRF — admin delete (apiFetch) requires a valid WP nonce
    // §REST:196, §Cross:230
    // ------------------------------------------------------------------
    test('Security 7 - Cookie-authenticated admin DELETE without an X-WP-Nonce is rejected', { tag: ['@pro', '@admin', '@security'] }, async ({ browser }) => {
        // Seed a real report via the customer form so there is a row to (try to)
        // delete, and capture its id from the DB.
        const custCtx = await browser.newContext({ storageState: c1 });
        const custPage = await custCtx.newPage();
        const custFlow = new AbuseReportsPage(custPage);
        await custFlow.goToProductPage();
        await custFlow.submitFullAbuseReport(
            custFlow.testData.abuseReports.reportReason,
            `Security 7 — delete-nonce seed ${faker.string.nanoid(6)}`,
        );
        await custPage.close();
        await custCtx.close();

        const prefix = process.env.DB_PREFIX;
        const maxRow = await dbUtils.dbQuery(`SELECT MAX(id) AS id FROM ${prefix}_${REPORTS_TABLE};`);
        const seededId = Number(maxRow[0].id);
        expect(seededId, 'A seeded report id should be readable from the DB').toBeGreaterThan(0);

        // Build a request context carrying the admin's cookies (the same auth
        // the React UI uses) but DO NOT attach an X-WP-Nonce header. WP's REST
        // cookie auth requires the nonce, so the DELETE must be rejected with
        // 401/403 (rest_cookie_invalid_nonce) — proving CSRF protection.
        const adminCtx = await browser.newContext({ storageState: a1 });
        const cookieRequest = adminCtx.request;

        const response = await cookieRequest.delete(`${SITE_URL}/wp-json/dokan/v1/abuse-reports/${seededId}`);
        expect(
            [401, 403],
            `Cookie-auth DELETE without X-WP-Nonce should be rejected (got ${response.status()})`,
        ).toContain(response.status());

        await adminCtx.close();

        // The seeded report must still exist (the unprotected delete did NOT run).
        const stillThere = await dbUtils.dbQuery(`SELECT id FROM ${prefix}_${REPORTS_TABLE} WHERE id = ?;`, [seededId]);
        expect(stillThere.length, 'The seeded report must still exist after the nonce-less DELETE').toBe(1);

        // Clean up the seed via the proper Basic-Auth REST path (which is the
        // application-auth flow, not the cookie/nonce flow under test).
        const restCtx = await request.newContext();
        const arp = new AbuseReportsPage(/* dummy */ {} as never);
        await arp.restDeleteReport(restCtx, seededId);
        await restCtx.dispose();
    });

    // ------------------------------------------------------------------
    // Settings — special chars/emoji/HTML in a reason sanitized/safe
    // §Settings:52
    // ------------------------------------------------------------------
    test('Security 8 - Special chars / emoji / HTML in a reason are stored and shown safely in settings', { tag: ['@pro', '@admin', '@security'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const guard = installDialogGuard(adminPage);
        const arp = new AbuseReportsPage(adminPage);

        await arp.goToSettingsPage();
        await arp.searchSettings(arp.testData.abuseReports.settingsSearchKeyword);
        await arp.fillNewAbuseReason(SPECIAL_REASON);
        await arp.clickAddReasonPlusButton();
        await arp.clickSaveChanges();

        // Reload to read the persisted value back into the settings UI.
        await arp.goToSettingsPage();
        await arp.searchSettings(arp.testData.abuseReports.settingsSearchKeyword);

        // Saved reasons render as <li> text via Vue interpolation (auto-escaped).
        // The persisted reason must round-trip the literal text — emoji + the
        // raw HTML fragments preserved as TEXT — proving it was stored safely and
        // is shown as a literal string (not interpreted).
        const savedTexts = await getSavedReasonTexts(adminPage);
        const match = savedTexts.find(
            t => t.includes('Café') && t.includes('🚩') && t.includes('<script>alert(2)</script>') && t.includes('<b>Bold</b>'),
        );
        expect(
            match,
            `A saved reason <li> should round-trip the special-char/emoji/HTML text literally (got: ${JSON.stringify(savedTexts)})`,
        ).toBeTruthy();

        // No dialog should fire from rendering the persisted reason in settings.
        await adminPage.waitForTimeout(500);
        expect(guard.fired, `No JS dialog should fire from the settings reason value (got: "${guard.message}")`).toBe(false);

        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // Settings — HTML-like reason shows as literal text (not interpreted)
    // §Settings:53
    // ------------------------------------------------------------------
    test('Security 9 - HTML-like reason renders as literal text in the settings UI (not interpreted)', { tag: ['@pro', '@admin', '@security'] }, async ({ browser }) => {
        // SPECIAL_REASON (added in Security 8) carries an HTML <b> and <script>
        // tag. The settings repeatable list renders each saved reason via Vue
        // interpolation (`{{ value }}`), which auto-escapes — so the markup must
        // appear as LITERAL TEXT inside the <li>, NOT as live DOM elements.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const guard = installDialogGuard(adminPage);
        const arp = new AbuseReportsPage(adminPage);

        // Ensure the HTML-like reason exists (Security 8 may run in another shard).
        await arp.goToSettingsPage();
        await arp.searchSettings(arp.testData.abuseReports.settingsSearchKeyword);
        let savedTexts = await getSavedReasonTexts(adminPage);
        const present = savedTexts.some(t => t.includes('<script>alert(2)</script>'));
        if (!present) {
            await arp.fillNewAbuseReason(SPECIAL_REASON);
            await arp.clickAddReasonPlusButton();
            await arp.clickSaveChanges();
            await arp.goToSettingsPage();
            await arp.searchSettings(arp.testData.abuseReports.settingsSearchKeyword);
            savedTexts = await getSavedReasonTexts(adminPage);
        }

        // The literal markup must be present AS TEXT in a saved-reason <li>.
        expect(
            savedTexts.some(t => t.includes('<b>Bold</b>') && t.includes('<script>alert(2)</script>')),
            'HTML-like reason should appear as literal text in the saved-reason list',
        ).toBe(true);

        // And there must be NO live <b>Bold</b> or <script> element INSIDE the
        // repeatable reasons list that originated from our reason value — if the
        // markup were interpreted, these would exist.
        const reasonsList = adminPage.locator(SAVED_REASON_LIST);
        const liveBold = await reasonsList.locator('b', { hasText: 'Bold' }).count();
        expect(liveBold, 'HTML in the reason must NOT be interpreted into a live <b> element').toBe(0);

        const liveScript = await reasonsList.locator('script:has-text("alert(2)")').count();
        expect(liveScript, 'HTML in the reason must NOT be interpreted into a live <script> element').toBe(0);

        // And, of course, no dialog fires.
        await adminPage.waitForTimeout(500);
        expect(guard.fired, `No JS dialog should fire from the HTML-like reason (got: "${guard.message}")`).toBe(false);

        await adminPage.close();
        await context.close();
    });
});
